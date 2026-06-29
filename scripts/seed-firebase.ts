import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';
import * as fs from 'fs';
import * as path from 'path';
import { TREK_DB } from '../src/data/trekDb';

// Initialize Firebase Admin
const serviceAccountPath = path.resolve(__dirname, '../trekgpt-ed851-firebase-adminsdk-fbsvc-3a1dd29d8d.json');
if (!fs.existsSync(serviceAccountPath)) {
  console.error('Service account key not found at', serviceAccountPath);
  process.exit(1);
}

const serviceAccount = require(serviceAccountPath);

initializeApp({
  credential: cert(serviceAccount),
  storageBucket: 'trekgpt-ed851.firebasestorage.app'
});

const db = getFirestore();
const bucket = getStorage().bucket();

const IMAGES_DIR = path.resolve(__dirname, '../src/assets/images/trek-images');

const getMatchForTrek = (trekName: string, files: string[]): string | undefined => {
  const lowerName = trekName.toLowerCase();
  for (const file of files) {
    const baseName = path.parse(file).name.toLowerCase();
    if (lowerName.includes('kedarkantha') && baseName.includes('kedarkantha')) return file;
    if (lowerName.includes('har ki dun') && baseName.includes('har ki dun')) return file;
    if (lowerName.includes('dayara bugyal') && baseName.includes('dayara bugyal')) return file;
    if ((lowerName.includes('sandakphu') || lowerName.includes('phalut')) && baseName.includes('sandakphu')) return file;
    if (lowerName.includes('roopkund') && baseName.includes('roopkund')) return file;
    if (lowerName.includes('goechala') && baseName.includes('goechala')) return file;
    if (lowerName.includes('hampta pass') && baseName.includes('hampta')) return file;
    if (lowerName.includes('bhrigu lake') && baseName.includes('bhrigu')) return file;
    if (lowerName.includes('brahmatal') && baseName.includes('brahmatal')) return file;
    if (lowerName.includes('buran ghati') && baseName.includes('buran')) return file;
    if (lowerName.includes('chadar') && baseName.includes('chadar')) return file;
    if (lowerName.includes('kashmir great lakes') && baseName.includes('kashmir')) return file;
    if (lowerName.includes('kuari pass') && baseName.includes('kuari')) return file;
    if (lowerName.includes('markha valley') && baseName.includes('markha')) return file;
    if (lowerName.includes('pin parvati') && baseName.includes('pin parvati')) return file;
    if (lowerName.includes('rupin pass') && baseName.includes('rupin')) return file;
    if (lowerName.includes('stok kangri') && baseName.includes('stok kangri')) return file;
    if (lowerName.includes('tarsar marsar') && baseName.includes('tarsar')) return file;
    if (lowerName.includes('valley of flowers') && baseName.includes('valley of flowers')) return file;
    if (lowerName.includes('ali bedni') && baseName.includes('ali bedni')) return file;
  }
  return undefined;
};

async function seedData() {
  console.log('Starting Firebase Seeding Process...');
  if (!fs.existsSync(IMAGES_DIR)) {
    console.error('Images directory not found at', IMAGES_DIR);
    process.exit(1);
  }

  const imageFiles = fs.readdirSync(IMAGES_DIR).filter(f => !f.startsWith('.'));
  const uploadedUrls: Record<string, string> = {};
  console.log(`Found ${imageFiles.length} images to upload.`);

  for (const file of imageFiles) {
    const filePath = path.join(IMAGES_DIR, file);
    const destination = `treks/images/${file}`;
    console.log(`Uploading ${file}...`);
    try {
      await bucket.upload(filePath, {
        destination,
        public: true,
        metadata: { cacheControl: 'public, max-age=31536000' }
      });
      const fileRef = bucket.file(destination);
      const [url] = await fileRef.getSignedUrl({ action: 'read', expires: '01-01-2099' });
      uploadedUrls[file] = url;
      console.log(`✅ Uploaded ${file}`);
    } catch (err: any) {
      console.error(`❌ Failed to upload ${file}:`, err.message);
    }
  }

  console.log('\n--- Image Uploads Complete ---\n');
  console.log(`Seeding ${TREK_DB.length} treks to Firestore...`);
  const batch = db.batch();
  const treksCollection = db.collection('treks');

  for (const trek of TREK_DB) {
    const matchingFile = getMatchForTrek(trek.name, imageFiles);
    const imageUrl = matchingFile ? uploadedUrls[matchingFile] : null;
    const docRef = treksCollection.doc(trek.id);
    batch.set(docRef, {
      ...trek,
      imageUrl: imageUrl || null,
      createdAt: FieldValue.serverTimestamp()
    });
    console.log(`Prepared trek: ${trek.name} (Image: ${matchingFile || 'None'})`);
  }

  console.log('\nSeeding Home Screen Featured Data...');
  const homeScreenDoc = db.collection('app_config').doc('home_screen');
  const aiPicks = [
    { id: '1', name: 'Kedarkantha', location: 'Uttarakhand', rating: '4.6', price: '₹6,500', imageUrl: uploadedUrls[getMatchForTrek('Kedarkantha', imageFiles) || ''] || null },
    { id: '2', name: 'Har Ki Dun', location: 'Uttarakhand', rating: '4.8', price: '₹9,800', imageUrl: uploadedUrls[getMatchForTrek('Har Ki Dun', imageFiles) || ''] || null },
    { id: '3', name: 'Dayara Bugyal', location: 'Uttarakhand', rating: '4.5', price: '₹6,500', imageUrl: uploadedUrls[getMatchForTrek('Dayara Bugyal', imageFiles) || ''] || null },
    { id: '4', name: 'Sandakphu', location: 'West Bengal', rating: '4.7', price: '₹7,900', imageUrl: uploadedUrls[getMatchForTrek('Sandakphu', imageFiles) || ''] || null },
  ];
  const trending = [
    { id: 't1', name: 'Sandakphu', trend: '28%', icon: 'leaf', color: '#4ADE80' },
    { id: 't2', name: 'Kedarkantha', trend: '21%', icon: 'fire', color: '#F97316' },
    { id: 't3', name: 'Valley of\nFlowers', trend: '17%', icon: 'leaf', color: '#4ADE80' },
  ];

  batch.set(homeScreenDoc, {
    aiPicks,
    trending,
    updatedAt: FieldValue.serverTimestamp()
  });

  try {
    await batch.commit();
    console.log('✅ Successfully committed all data to Firestore!');
  } catch (err: any) {
    console.error('❌ Failed to write to Firestore:', err.message);
  }
  console.log('\nSeeding completed.');
}

seedData().catch(console.error);
