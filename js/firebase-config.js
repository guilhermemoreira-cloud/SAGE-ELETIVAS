// COLE AQUI SUAS CREDENCIAIS DO FIREBASE
const firebaseConfig = {
  apiKey: "AIzaSyBLAHBLAH123456789",
  authDomain: "sage-2026.firebaseapp.com",
  projectId: "sage-2026",
  storageBucket: "sage-2026.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abc123def456",
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

db.settings({
  timestampsInSnapshots: true,
});

window.db = db;
window.firebase = firebase;
