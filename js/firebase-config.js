// js/firebase-config.js - Configuração do Firebase
// COLE AQUI SUAS CREDENCIAIS DO FIREBASE

const firebaseConfig = {
  apiKey: "AIzaSyBLAHBLAH123456789",
  authDomain: "sage-2026.firebaseapp.com",
  projectId: "sage-2026",
  storageBucket: "sage-2026.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abc123def456",
};

// Inicializar Firebase
firebase.initializeApp(firebaseConfig);

// Inicializar Firestore
const db = firebase.firestore();

// Configurar para usar timestamps
db.settings({
  timestampsInSnapshots: true,
});

// Exportar para uso global
window.db = db;
window.firebase = firebase;
