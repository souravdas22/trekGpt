"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var app_1 = require("firebase-admin/app");
var firestore_1 = require("firebase-admin/firestore");
var storage_1 = require("firebase-admin/storage");
var fs = __importStar(require("fs"));
var path = __importStar(require("path"));
var trekDb_1 = require("../src/data/trekDb");
// Initialize Firebase Admin
var serviceAccountPath = path.resolve(__dirname, '../trekgpt-ed851-firebase-adminsdk-fbsvc-3a1dd29d8d.json');
if (!fs.existsSync(serviceAccountPath)) {
    console.error('Service account key not found at', serviceAccountPath);
    process.exit(1);
}
var serviceAccount = require(serviceAccountPath);
(0, app_1.initializeApp)({
    credential: (0, app_1.cert)(serviceAccount),
    storageBucket: 'trekgpt-ed851.firebasestorage.app'
});
var db = (0, firestore_1.getFirestore)();
var bucket = (0, storage_1.getStorage)().bucket();
var IMAGES_DIR = path.resolve(__dirname, '../src/assets/images/trek-images');
var getMatchForTrek = function (trekName, files) {
    var lowerName = trekName.toLowerCase();
    for (var _i = 0, files_1 = files; _i < files_1.length; _i++) {
        var file = files_1[_i];
        var baseName = path.parse(file).name.toLowerCase();
        if (lowerName.includes('kedarkantha') && baseName.includes('kedarkantha'))
            return file;
        if (lowerName.includes('har ki dun') && baseName.includes('har ki dun'))
            return file;
        if (lowerName.includes('dayara bugyal') && baseName.includes('dayara bugyal'))
            return file;
        if ((lowerName.includes('sandakphu') || lowerName.includes('phalut')) && baseName.includes('sandakphu'))
            return file;
        if (lowerName.includes('roopkund') && baseName.includes('roopkund'))
            return file;
        if (lowerName.includes('goechala') && baseName.includes('goechala'))
            return file;
        if (lowerName.includes('hampta pass') && baseName.includes('hampta'))
            return file;
        if (lowerName.includes('bhrigu lake') && baseName.includes('bhrigu'))
            return file;
        if (lowerName.includes('brahmatal') && baseName.includes('brahmatal'))
            return file;
        if (lowerName.includes('buran ghati') && baseName.includes('buran'))
            return file;
        if (lowerName.includes('chadar') && baseName.includes('chadar'))
            return file;
        if (lowerName.includes('kashmir great lakes') && baseName.includes('kashmir'))
            return file;
        if (lowerName.includes('kuari pass') && baseName.includes('kuari'))
            return file;
        if (lowerName.includes('markha valley') && baseName.includes('markha'))
            return file;
        if (lowerName.includes('pin parvati') && baseName.includes('pin parvati'))
            return file;
        if (lowerName.includes('rupin pass') && baseName.includes('rupin'))
            return file;
        if (lowerName.includes('stok kangri') && baseName.includes('stok kangri'))
            return file;
        if (lowerName.includes('tarsar marsar') && baseName.includes('tarsar'))
            return file;
        if (lowerName.includes('valley of flowers') && baseName.includes('valley of flowers'))
            return file;
        if (lowerName.includes('ali bedni') && baseName.includes('ali bedni'))
            return file;
    }
    return undefined;
};
function seedData() {
    return __awaiter(this, void 0, void 0, function () {
        var imageFiles, uploadedUrls, _i, imageFiles_1, file, filePath, destination, fileRef, url, err_1, batch, treksCollection, _a, TREK_DB_1, trek, matchingFile, imageUrl, docRef, homeScreenDoc, aiPicks, trending, err_2;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    console.log('Starting Firebase Seeding Process...');
                    if (!fs.existsSync(IMAGES_DIR)) {
                        console.error('Images directory not found at', IMAGES_DIR);
                        process.exit(1);
                    }
                    imageFiles = fs.readdirSync(IMAGES_DIR).filter(function (f) { return !f.startsWith('.'); });
                    uploadedUrls = {};
                    console.log("Found ".concat(imageFiles.length, " images to upload."));
                    _i = 0, imageFiles_1 = imageFiles;
                    _b.label = 1;
                case 1:
                    if (!(_i < imageFiles_1.length)) return [3 /*break*/, 7];
                    file = imageFiles_1[_i];
                    filePath = path.join(IMAGES_DIR, file);
                    destination = "treks/images/".concat(file);
                    console.log("Uploading ".concat(file, "..."));
                    _b.label = 2;
                case 2:
                    _b.trys.push([2, 5, , 6]);
                    return [4 /*yield*/, bucket.upload(filePath, {
                            destination: destination,
                            public: true,
                            metadata: { cacheControl: 'public, max-age=31536000' }
                        })];
                case 3:
                    _b.sent();
                    fileRef = bucket.file(destination);
                    return [4 /*yield*/, fileRef.getSignedUrl({ action: 'read', expires: '01-01-2099' })];
                case 4:
                    url = (_b.sent())[0];
                    uploadedUrls[file] = url;
                    console.log("\u2705 Uploaded ".concat(file));
                    return [3 /*break*/, 6];
                case 5:
                    err_1 = _b.sent();
                    console.error("\u274C Failed to upload ".concat(file, ":"), err_1.message);
                    return [3 /*break*/, 6];
                case 6:
                    _i++;
                    return [3 /*break*/, 1];
                case 7:
                    console.log('\n--- Image Uploads Complete ---\n');
                    console.log("Seeding ".concat(trekDb_1.TREK_DB.length, " treks to Firestore..."));
                    batch = db.batch();
                    treksCollection = db.collection('treks');
                    for (_a = 0, TREK_DB_1 = trekDb_1.TREK_DB; _a < TREK_DB_1.length; _a++) {
                        trek = TREK_DB_1[_a];
                        matchingFile = getMatchForTrek(trek.name, imageFiles);
                        imageUrl = matchingFile ? uploadedUrls[matchingFile] : null;
                        docRef = treksCollection.doc(trek.id);
                        batch.set(docRef, __assign(__assign({}, trek), { imageUrl: imageUrl || null, createdAt: firestore_1.FieldValue.serverTimestamp() }));
                        console.log("Prepared trek: ".concat(trek.name, " (Image: ").concat(matchingFile || 'None', ")"));
                    }
                    console.log('\nSeeding Home Screen Featured Data...');
                    homeScreenDoc = db.collection('app_config').doc('home_screen');
                    aiPicks = [
                        { id: '1', name: 'Kedarkantha', location: 'Uttarakhand', rating: '4.6', price: '₹6,500', imageUrl: uploadedUrls[getMatchForTrek('Kedarkantha', imageFiles) || ''] || null },
                        { id: '2', name: 'Har Ki Dun', location: 'Uttarakhand', rating: '4.8', price: '₹9,800', imageUrl: uploadedUrls[getMatchForTrek('Har Ki Dun', imageFiles) || ''] || null },
                        { id: '3', name: 'Dayara Bugyal', location: 'Uttarakhand', rating: '4.5', price: '₹6,500', imageUrl: uploadedUrls[getMatchForTrek('Dayara Bugyal', imageFiles) || ''] || null },
                        { id: '4', name: 'Sandakphu', location: 'West Bengal', rating: '4.7', price: '₹7,900', imageUrl: uploadedUrls[getMatchForTrek('Sandakphu', imageFiles) || ''] || null },
                    ];
                    trending = [
                        { id: 't1', name: 'Sandakphu', trend: '28%', icon: 'leaf', color: '#4ADE80' },
                        { id: 't2', name: 'Kedarkantha', trend: '21%', icon: 'fire', color: '#F97316' },
                        { id: 't3', name: 'Valley of\nFlowers', trend: '17%', icon: 'leaf', color: '#4ADE80' },
                    ];
                    batch.set(homeScreenDoc, {
                        aiPicks: aiPicks,
                        trending: trending,
                        updatedAt: firestore_1.FieldValue.serverTimestamp()
                    });
                    _b.label = 8;
                case 8:
                    _b.trys.push([8, 10, , 11]);
                    return [4 /*yield*/, batch.commit()];
                case 9:
                    _b.sent();
                    console.log('✅ Successfully committed all data to Firestore!');
                    return [3 /*break*/, 11];
                case 10:
                    err_2 = _b.sent();
                    console.error('❌ Failed to write to Firestore:', err_2.message);
                    return [3 /*break*/, 11];
                case 11:
                    console.log('\nSeeding completed.');
                    return [2 /*return*/];
            }
        });
    });
}
seedData().catch(console.error);
