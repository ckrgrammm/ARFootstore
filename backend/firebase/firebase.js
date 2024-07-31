const admin = require('firebase-admin');
const { initializeApp } = require('firebase/app');
const serviceAccount = require('./firebaseServiceAccountKey.json');

// const firebaseConfig = {
//   apiKey: "AIzaSyDQN-pAf_fTZpxwzYa26LCYxQJdsdT7Rjg",
//   authDomain: "footweararsystem.firebaseapp.com",
//   projectId: "footweararsystem",
//   storageBucket: "footweararsystem.appspot.com",
//   messagingSenderId: "1002163098877",
//   appId: "1:1002163098877:web:d48b6fb8378757e90a5a94"
// };

const firebaseConfig = {
  apiKey: "AIzaSyCFB4OuCYw3GBTn4yE_hx7QYqYtvGimHAg",
  authDomain: "footwearar-3482e.firebaseapp.com",
  projectId: "footwearar-3482e",
  storageBucket: "footwearar-3482e.appspot.com",
  messagingSenderId: "816231139617",
  appId: "1:816231139617:web:da58bff167d82b48371660"
};


const app = initializeApp(firebaseConfig);

// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount),
//   storageBucket: "footweararsystem.appspot.com",
//   databaseURL: "https://footweararsystem.firebaseio.com"
// });

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: "footwearar-3482e.appspot.com",
  // databaseURL: "https://footweararsystem.firebaseio.com"
});



const db = admin.firestore();
const bucket = admin.storage().bucket();

module.exports = { app, admin, db, bucket };
