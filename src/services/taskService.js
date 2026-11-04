import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore';
import { db } from '../config/firebase';

const tasksCol = collection(db, 'tasks');

// Se o servidor não responder (ex: offline), a Promise do Firestore pode ficar pendente.
// Este timeout garante que a interface sempre receba um resultado.
function withTimeout(promise, ms = 10000) {
  let timer;
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => {
      const err = new Error('timeout');
      err.code = 'app/timeout';
      reject(err);
    }, ms);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}

// Escuta em tempo real apenas as tarefas do usuário logado.
// A ordenação é feita no cliente para não exigir índice composto no Firestore.
export function subscribeTasks(uid, onData, onError) {
  const q = query(tasksCol, where('userId', '==', uid));
  return onSnapshot(
    q,
    (snap) => {
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      list.sort((a, b) => (a.dueDate || '').localeCompare(b.dueDate || ''));
      onData(list);
    },
    onError
  );
}

export function createTask(uid, data) {
  return withTimeout(
    addDoc(tasksCol, {
      ...data,
      done: false,
      userId: uid,
      createdAt: serverTimestamp(),
    })
  );
}

export function updateTask(id, data) {
  return withTimeout(
    updateDoc(doc(db, 'tasks', id), { ...data, updatedAt: serverTimestamp() })
  );
}

export function toggleTask(id, done) {
  return withTimeout(updateDoc(doc(db, 'tasks', id), { done }));
}

export function removeTask(id) {
  return withTimeout(deleteDoc(doc(db, 'tasks', id)));
}
