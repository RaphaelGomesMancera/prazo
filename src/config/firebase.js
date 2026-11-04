import { initializeApp, getApps, getApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence, getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Cole aqui a configuração do app Web criado no Firebase Console
// (Configurações do projeto > Seus apps > Configuração do SDK).
// Essas chaves não são secretas: quem protege os dados são as regras do Firestore.
const firebaseConfig = {
  apiKey: 'COLE_AQUI',
  authDomain: 'COLE_AQUI',
  projectId: 'COLE_AQUI',
  storageBucket: 'COLE_AQUI',
  messagingSenderId: 'COLE_AQUI',
  appId: 'COLE_AQUI',
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// Auth com persistência da sessão no AsyncStorage (o usuário continua logado ao reabrir o app).
// O try/catch evita erro de "já inicializado" no Fast Refresh.
let auth;
try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
} catch (e) {
  auth = getAuth(app);
}

const db = getFirestore(app);

export { app, auth, db };
