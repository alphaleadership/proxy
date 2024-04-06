import { Worker, isMainThread } from 'node:worker_threads';
import MITMProxy from "./mitm";
import type { Interceptor, InterceptedHTTPMessage } from './mitm';
const workerScriptPath = './worker.js';
const channel = new BroadcastChannel('worker-channel');
// Nombre maximal de workers à utiliser
const maxWorkers = 100;

// File d'attente des messages à envoyer aux workers
const workers: Worker[] = [];
const busyWorkers: Set<Worker> = new Set();
const messageQueue: { worker: Worker | null, data: any }[] = [];
function distributeQueuedMessages() {
    while (messageQueue.length > 0) {
        const { worker, data } = messageQueue.shift()!;
        if (worker) {
            // Si un worker est spécifié, envoyer le message à ce worker
            worker.postMessage(data);
            // Marquer le worker comme occupé
            busyWorkers.add(worker);
        } else {
            // Si aucun worker spécifié, distribuer le message comme d'habitude
            distributeRequests("data",data.data,data.body);
        }
    }
}
// Pool de workers


// Créer des workers et les ajouter à un pool
for (let i = 0; i < maxWorkers; i++) {
    const worker = new Worker(workerScriptPath, { workerData: { channelPort: channel } });
    setupWorker(worker);
}

// Fonction pour configurer un worker
function setupWorker(worker: Worker) {
    worker.on('message', (processedData) => {
        // Traitement des données traitées reçues du worker
        console.log('Processed data received from worker:', processedData);
        // Votre logique supplémentaire...
        // Marquer le worker comme disponible
        const index = workers.indexOf(worker);
        if (index !== -1) {
            workers.splice(index, 1);
        }
        // Vérifier s'il y a des messages en attente
   
    });
    worker.on('error', (error) => {
        console.log('Worker error:', error);
    });
    worker.on('exit', (code) => {
        if (code !== 0) {
            console.error(`Worker stopped with exit code ${code}`);
        }
        // Si un worker se termine, le remplacer
        const index = workers.indexOf(worker);
        if (index !== -1) {
            workers.splice(index, 1);
            const newWorker = new Worker(workerScriptPath, { workerData: { channelPort: channel.port2 } });
            setupWorker(newWorker);
        }
    });
    workers.push(worker);
}

// Fonction pour répartir les requêtes entre les workers
function distributeRequests(type: any,message,content) {
    if(!message){
        return
    }
    if(!content){
        return
    }
    console.log(workers.length);
    // Vérifier si tous les workers sont occupés
    if (workers.length === 0) {
        // S'il n'y a pas de worker disponible, créer un nouveau worker
        const newWorker = new Worker(workerScriptPath);
        setupWorker(newWorker);
        // Ajouter le message à la file d'attente
        messageQueue.push({ worker: null, data: {data:message,body:content} });
    } else {
        // Parcourir tous les workers pour trouver un worker disponible
        let availableWorker = null;
        for (const worker of workers) {
            if (!busyWorkers.has(worker)) {
                availableWorker = worker;
                break;
            }
        }
        if (availableWorker) {
            message.workerNumber=workers.indexOf(availableWorker)
            // Si un worker disponible est trouvé, envoyer le message à ce worker
            availableWorker.postMessage({data:message,body:content,i:workers.indexOf(availableWorker)} );
            // Marquer le worker comme occupé
            busyWorkers.add(availableWorker);
        } else {
            // Si aucun worker disponible n'est trouvé, ajouter le message à la file d'attente
            messageQueue.push({ worker: null, data: message });
        }
    }
}


// Définition de la fonction intercepteur name (à partir de votre exemple)
const name: Interceptor = async (m: InterceptedHTTPMessage) => {
    // Votre logique d'interception ici
    // Envoi des données au pool de workers en les structurant correctement
    if(!m){
        return
    }
    if(!m.responseBody){
        return 
    }
    distributeRequests( 'requestData',  m,m.responseBody );
};
setInterval(distributeQueuedMessages, 100);
// Appel de MITMProxy.Create uniquement dans le thread principal
if (isMainThread) {
    MITMProxy.Create(name, [], false).catch((error) => {
        console.error('Error creating proxy:', error);
    });
}
