"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var app_1 = require("firebase-admin/app");
var storage_1 = require("firebase-admin/storage");
var sa = require('./trekgpt-ed851-firebase-adminsdk-fbsvc-3a1dd29d8d.json');
(0, app_1.initializeApp)({ credential: (0, app_1.cert)(sa), storageBucket: 'trekgpt-ed851.firebasestorage.app' });
(0, storage_1.getStorage)().bucket().getFiles({ prefix: 'treks/images/' }).then(function (_a) {
    var files = _a[0];
    console.log('Files found:', files.length);
    files.forEach(function (f) { return console.log(f.name); });
}).catch(console.error);
