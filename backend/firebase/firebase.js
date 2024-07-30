const admin = require('firebase-admin');
const { initializeApp } = require('firebase/app');
const serviceAccount = require('./firebaseServiceAccountKey.json'); 

const firebaseConfig = {
  apiKey: "AIzaSyDQN-pAf_fTZpxwzYa26LCYxQJdsdT7Rjg",
  authDomain: "footweararsystem.firebaseapp.com",
  projectId: "footweararsystem",
  storageBucket: "footweararsystem.appspot.com",
  messagingSenderId: "1002163098877",
  appId: "1:1002163098877:web:d48b6fb8378757e90a5a94"
};

const app = initializeApp(firebaseConfig);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: "footweararsystem.appspot.com",
  databaseURL: "https://footweararsystem.firebaseio.com"
});

const db = admin.firestore();
const bucket = admin.storage().bucket(); 

module.exports = { app, admin, db, bucket };
