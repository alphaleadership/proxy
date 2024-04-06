import { workerData, parentPort } from 'node:worker_threads';
import { parse } from 'file-type-mime';
import  { InterceptedHTTPMessage } from './mitm';
import * as fs from 'fs';
import * as path from 'path';
const channelPort  = new BroadcastChannel('worker-channel');

import * as crypto from 'crypto';

import axios from 'axios';
function imageToVideoLink(imageLink) {
    const videoID = imageLink.match(/\/([0-9]+)\//)[1];
    return `https://video.twimg.com/ext_tw_video/${videoID}/pu/pl/mp4a/128000/lW9DIRfvVCBNqF12.m3u8?container=cmaf`;
}

// Fonction pour télécharger une vidéo à partir de son lien
async function downloadVideoFromTwitter(videoLink: string, fileName: string): Promise<void> {
    try {
        // Vérifier si le lien correspond au schéma d'un lien vidéo Twitter
        if (!isTwittervideoLink(videoLink)) {
            return console.log('Le lien spécifié ne correspond pas à un lien vidéo Twitter valide.');
        }

        // Télécharger la vidéo
        const response = await axios({
            method: 'GET',
            url: imageToVideoLink(videoLink),
            responseType: 'stream'
        });

        const writer = fs.createWriteStream(fileName);

        response.data.pipe(writer);

        return new Promise((resolve, reject) => {
            writer.on('finish', resolve);
            writer.on('error', reject);
        });
    } catch (error) {
        throw new Error(`Erreur lors du téléchargement de la vidéo : ${error.message}`);
    }
}

// Fonction pour vérifier si un lien correspond au schéma d'un lien vidéo Twitter
// Fonction pour vérifier si un lien correspond au schéma d'un lien d'image Twitter
function isTwittervideoLink(link: string): boolean {
    const imageRegex = /https:\/\/pbs\.twimg\.com\/[^\/]+\/pu\/img\/[^\.]+\.(jpg|jpeg|png|gif)/i;
    return imageRegex.test(link);
}


// Exemple d'utilisation de la fonction pour télécharger une vidéo Twitter




// Fonction pour télécharger une vidéo à partir de son lien

// Liens des vidéos Twitter à télécharger


// Télécharger chaque vidéo



const MINIMUM_FILE_SIZE_BYTES = 50; // Définir la taille minimale en octets

function isVideoOrImage(filename: string): boolean {
    // Liste des extensions de fichiers vidéo et image
    const videoExtensions = ['.mp4', '.avi', '.mkv', '.mov'];
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif'];

    // Obtient l'extension du fichier
    const extension = path.extname(filename).toLowerCase();

    // Vérifie si l'extension est celle d'une vidéo ou d'une image
    return videoExtensions.includes(extension) || imageExtensions.includes(extension);
}

function isLargeEnough(filename: string): boolean {
    const stats = fs.statSync(filename);
    return stats.size >= MINIMUM_FILE_SIZE_BYTES;
}

function getFileHash(filename: string): string {
    const fileContent = fs.readFileSync(filename);
    const hash = crypto.createHash('sha256');
    hash.update(fileContent);
    return hash.digest('hex');
}
const processingDirectories = new Set<string>();
function cleanDirectory(directory: string): void {
    if (processingDirectories.has(directory)) {
        // Si le dossier est déjà en cours de traitement, ignorer
        return;
    }

    // Ajouter le dossier à l'ensemble des dossiers en cours de traitement
    processingDirectories.add(directory);

    const encounteredFileHashes = new Set<string>(); // Ensemble pour stocker les hachages des fichiers rencontrés
    fs.readdirSync(directory).forEach(file => {
        channelPort.postMessage({ type: 'startProcessing', directory: directory});
        const filePath = path.join(directory, file);
        const stats = fs.statSync(filePath);
        if (stats.isDirectory()) {
            // Si c'est un répertoire, parcourir récursivement
            cleanDirectory(filePath);
            // Supprimer le dossier s'il est vide après nettoyage
            if (fs.readdirSync(filePath).length === 0) {
                if (fs.existsSync(filePath)) {
                    fs.rmdirSync(filePath);
                }
            }
        } else {
            // Si c'est un fichier, vérifier s'il est vidéo ou image et s'il est assez grand
            if (!isVideoOrImage(file) || !isLargeEnough(filePath)) {
                // Supprimer le fichier s'il ne répond pas aux critères
                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                }
            } else {
               /* const fileHash = getFileHash(filePath);
                if (encounteredFileHashes.has(fileHash)) {
                    // S'il y a un doublon, supprimer le fichier
                    if (fs.existsSync(filePath)) {
                        fs.unlinkSync(filePath);
                    }
                } else {
                    // Ajouter le hachage du fichier à l'ensemble des hachages rencontrés
                    encounteredFileHashes.add(fileHash);
                }*/
            }
        }
    });

    // Supprimer le dossier de l'ensemble des dossiers en cours de traitement
    processingDirectories.delete(directory);

    // Supprimer le dossier s'il est vide après nettoyage
    if (fs.readdirSync(directory).length === 0) {
        if (fs.existsSync(directory)) {
            fs.rmdirSync(directory);
        }
    }
    channelPort.postMessage({ type: 'endProcessing', directory: directory });
}


// Répertoire à nettoyer



// Répertoire à nettoyer
// Envoyer un message indiquant le début du traitement du dossier


// Lorsque le traitement du dossier est terminé, envoyer un message indiquant la fin du traitement



// Nettoyage du répertoire
// Écouter les messages provenant du canal de diffusion
channelPort.onmessage = (event) => {
    if (event.data.type === 'startProcessing') {
        const directory = event.data.directory;
        // Traitement du dossier...
        // Signaler que le traitement du dossier a commencé
        processingDirectories.add(directory);
    } else if (event.data.type === 'endProcessing') {
        const directory = event.data.directory;
        // Traitement du dossier terminé...
        // Signaler que le traitement du dossier est terminé
        processingDirectories.delete(directory);
    }
};


// Définition de la fonction intercepteur name
function toArrayBuffer(buffer) {
    const arrayBuffer = new ArrayBuffer(buffer.length);
    const view = new Uint8Array(arrayBuffer);
    for (let i = 0; i < buffer.length; ++i) {
        view[i] = buffer[i];
    }
    return arrayBuffer;
}

// Définir un objet pour suivre les tampons de réponse partielle pour chaque demande
const partialBuffers: { [key: string]: Buffer } = {};

// Définition de la fonction intercepteur name
const name = async (me:InterceptedHTTPMessage,body,index): Promise<void> => {
    const m = new InterceptedHTTPMessage(me.request,me.response,me.requestBody,me.responseBody)

    //console.log(Buffer.from(body));
    const domain = m.request.url.hostname || "main";
    const requestId = generateRequestId(m.request.rawUrl);
    fs.appendFileSync("./url.txt","\n"+m.request.rawUrl)
    downloadVideoFromTwitter(m.request.rawUrl,"./video/"+requestId+".mp4")
    //m.setResponseBody(body)
   // console.log(m.responseBody)
    // Vérifier si le responseBody est vide
    const workerNumber = index||1;
    const directoryPath = `./content/${domain}`;
    console.log(workerData)
    // Créer le répertoire s'il n'existe pas encore
    if (!fs.existsSync(directoryPath)) {
        fs.mkdirSync(directoryPath, { recursive: true });
    }

    // Vérifier si la réponse est partielle (code 206)
    if (m.response.statusCode === 206) {
        const filename = `${directoryPath}/partial_response_${workerNumber}${requestId}.bin`;

        // Vérifier si nous avons déjà un tampon pour cette demande
        if (!partialBuffers[filename]) {
            // Si non, créer un nouveau tampon pour cette réponse partielle
            partialBuffers[filename] = Buffer.alloc(0);
        }
        // Ajouter le contenu de cette partie au tampon
        partialBuffers[filename] = Buffer.concat([partialBuffers[filename], Buffer.from(body)]);
    } else {
        // Si ce n'est pas une réponse partielle, écrire le contenu dans un nouveau fichier
        const responseBody = Buffer.from(body);
        const timestamp = new Date().toISOString().replace(/:/g, '-');
        fs.writeFileSync("./temp.txt",responseBody)
        let content = toArrayBuffer(fs.readFileSync("./temp.txt"));
      
        const extension = parse(content)?.ext || "txt";
        const filename = `${directoryPath}/${timestamp}_${workerNumber}_${requestId}.${extension}`;

        // Si nous avons un tampon pour cette demande, écrire son contenu dans le fichier final
        const partialFilename = `${directoryPath}/partial_response_${workerNumber}_${requestId}.txt`;
        if (partialBuffers[partialFilename]) {
            fs.appendFileSync(filename, partialBuffers[partialFilename]);
            delete partialBuffers[partialFilename]; // Supprimer le tampon car il a été consolidé dans le fichier final
        }

        // Écrire le contenu de la réponse dans un nouveau fichier avec la date actuelle et l'ID de la demande
        fs.writeFileSync(filename, responseBody);

       cleanDirectory(directoryPath);
    }
};

// Fonction pour générer un identifiant unique pour chaque demande
function generateRequestId(url: string): string {
    //console.log(url)
    const hash = crypto.createHash('sha1');
    hash.update(url);
    return hash.digest('hex');
}

// Écoute des messages du thread parent
parentPort.on('message', async (message) => {
    // Exécution de la logique de traitement sur les données reçues
    try {
        await name(message.data,message.body,message.i);
    } catch (error) {
     //   console.log(message);
      //cessing request:', error);
    } finally{
     console.log("libre")
     process.exit(0)
    }
});
