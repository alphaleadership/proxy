import MITMProxy from "./mitm";
import { parse } from 'file-type-mime';
import { InterceptedHTTPMessage } from './mitm';
import type {Interceptor} from'./mitm'
import * as fs from 'fs';
//import * as mime from 'mime';

// Définition de la fonction intercepteur name
function toArrayBuffer(buffer:Buffer) {
    const arrayBuffer = new ArrayBuffer(buffer.length);
    const view = new Uint8Array(arrayBuffer);
    for (let i = 0; i < buffer.length; ++i) {
      view[i] = buffer[i];
    }
    return arrayBuffer;
  }
// Définition de la fonction intercepteur name
const name: Interceptor = (m: InterceptedHTTPMessage): void|Promise<void> => {
    // Récupérer le contenu de la requête
    const requestBody = m.responseBody;

    // Obtenir le type MIME de la requête
  //  const mimeType = m.request.headers['content-type'];
    

    // Créer un nom de fichier unique basé sur l'heure actuelle


    // Écrire le contenu de la requête dans un fichier avec l'extension correspondant au type MIME
    fs.writeFileSync("temp.txt", requestBody);
    const timestamp = new Date().toISOString().replace(/:/g, '-');
    let content =toArrayBuffer(fs.readFileSync("temp.txt"))
    console.log(content)
    console.log(parse(content,{extra:true}))
    const extension =  parse(content,{extra:true})?.ext||".txt";
    const filename = `content/${timestamp}.${extension}`;
    // Continuer le traitement de la requête
   fs.renameSync("temp.txt",filename)
}

// Export de la fonction intercepteur name
export default name;




console.log(MITMProxy.Create(name,[],false))