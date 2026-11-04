import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  sendPasswordResetEmail,
} from 'firebase/auth';
import { auth } from '../config/firebase';

export async function registerUser(name, email, password) {
  const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
  try {
    if (name) await updateProfile(cred.user, { displayName: name.trim() });
  } catch (e) {
    // A conta já foi criada; falhar ao salvar o nome não deve bloquear o cadastro.
  }
  return cred.user;
}

export function loginUser(email, password) {
  return signInWithEmailAndPassword(auth, email.trim(), password);
}

export function logoutUser() {
  return signOut(auth);
}

export function resetPassword(email) {
  return sendPasswordResetEmail(auth, email.trim());
}
