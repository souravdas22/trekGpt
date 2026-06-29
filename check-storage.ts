import { initializeApp, cert } from 'firebase-admin/app';
import { getStorage } from 'firebase-admin/storage';
const sa = require('./trekgpt-ed851-firebase-adminsdk-fbsvc-3a1dd29d8d.json');
initializeApp({ credential: cert(sa), storageBucket: 'trekgpt-ed851.firebasestorage.app' });
getStorage().bucket().getFiles({ prefix: 'treks/images/' }).then(([files]) => {
  console.log('Files found:', files.length);
  files.forEach(f => console.log(f.name));
}).catch(console.error);
