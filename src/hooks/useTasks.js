import { useCallback, useEffect, useState } from 'react';
import { useAuth } from './useAuth';
import { subscribeTasks } from '../services/taskService';
import { getErrorMessage } from '../utils/firebaseErrors';

export function useTasks() {
  const { user } = useAuth();
  const uid = user?.uid;
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!uid) return undefined;
    setLoading(true);
    setError(null);
    const unsubscribe = subscribeTasks(
      uid,
      (list) => {
        setTasks(list);
        setLoading(false);
      },
      (e) => {
        setError(getErrorMessage(e));
        setLoading(false);
      }
    );
    return unsubscribe; // cancela a escuta ao sair da tela / trocar de usuário
  }, [uid, attempt]);

  const retry = useCallback(() => setAttempt((a) => a + 1), []);

  return { tasks, loading, error, retry };
}
