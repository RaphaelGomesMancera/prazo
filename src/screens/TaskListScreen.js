import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Toast from '../components/Toast';
import Button from '../components/Button';
import { useAuth } from '../hooks/useAuth';
import { useTasks } from '../hooks/useTasks';
import { removeTask, toggleTask } from '../services/taskService';
import { getErrorMessage } from '../utils/firebaseErrors';
import { isoToBr, isOverdue } from '../utils/date';
import { colors } from '../theme';

const FILTERS = [
  { key: 'all', label: 'Todas' },
  { key: 'pending', label: 'Pendentes' },
  { key: 'done', label: 'Concluídas' },
];

export default function TaskListScreen({ navigation, route }) {
  const { user } = useAuth();
  const { tasks, loading, error, retry } = useTasks();
  const [filter, setFilter] = useState('all');
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => setToast({ id: Date.now(), message, type });

  // Mensagem de sucesso enviada pela tela de formulário (criar/editar).
  useEffect(() => {
    if (route.params?.toast) showToast(route.params.toast, route.params.toastType);
  }, [route.params?.t]);

  const filtered = useMemo(() => {
    if (filter === 'pending') return tasks.filter((t) => !t.done);
    if (filter === 'done') return tasks.filter((t) => t.done);
    return tasks;
  }, [tasks, filter]);

  async function handleToggle(task) {
    try {
      await toggleTask(task.id, !task.done);
    } catch (err) {
      showToast(getErrorMessage(err), 'error');
    }
  }

  function handleDelete(task) {
    Alert.alert('Excluir tarefa', `Deseja excluir "${task.title}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: async () => {
          try {
            await removeTask(task.id);
            showToast('Tarefa excluída.');
          } catch (err) {
            showToast(getErrorMessage(err), 'error');
          }
        },
      },
    ]);
  }

  function renderItem({ item }) {
    const overdue = isOverdue(item.dueDate, item.done);
    return (
      <Pressable
        style={styles.item}
        onPress={() => navigation.navigate('TaskForm', { task: item })}
      >
        <Pressable
          onPress={() => handleToggle(item)}
          hitSlop={8}
          style={[styles.check, item.done && styles.checkDone]}
        >
          {item.done ? <Text style={styles.checkMark}>✓</Text> : null}
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={[styles.itemTitle, item.done && styles.itemTitleDone]}>{item.title}</Text>
          <Text style={styles.itemMeta}>
            {item.subject ? `${item.subject} · ` : ''}
            <Text style={overdue ? styles.overdue : null}>
              {overdue ? 'Atrasada · ' : ''}Entrega {isoToBr(item.dueDate)}
            </Text>
          </Text>
        </View>
        <Pressable onPress={() => handleDelete(item)} hitSlop={8}>
          <Text style={styles.delete}>Excluir</Text>
        </Pressable>
      </Pressable>
    );
  }

  let body;
  if (loading) {
    body = (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.muted}>Carregando tarefas...</Text>
      </View>
    );
  } else if (error) {
    body = (
      <View style={styles.center}>
        <Text style={styles.errorText}>{error}</Text>
        <View style={{ width: 200 }}>
          <Button title="Tentar novamente" onPress={retry} />
        </View>
      </View>
    );
  } else if (filtered.length === 0) {
    body = (
      <View style={styles.center}>
        <Text style={styles.emptyTitle}>
          {tasks.length === 0 ? 'Nenhuma tarefa ainda' : 'Nada por aqui'}
        </Text>
        <Text style={styles.muted}>
          {tasks.length === 0
            ? 'Toque em "+" para adicionar sua primeira entrega.'
            : 'Nenhuma tarefa neste filtro.'}
        </Text>
      </View>
    );
  } else {
    body = (
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
      />
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Olá, {user?.displayName || user?.email}</Text>
        <View style={styles.filters}>
          {FILTERS.map((f) => (
            <Pressable
              key={f.key}
              onPress={() => setFilter(f.key)}
              style={[styles.chip, filter === f.key && styles.chipActive]}
            >
              <Text style={[styles.chipText, filter === f.key && styles.chipTextActive]}>
                {f.label}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      {body}

      <Pressable style={styles.fab} onPress={() => navigation.navigate('TaskForm')}>
        <Text style={styles.fabText}>+</Text>
      </Pressable>

      <Toast toast={toast} onHide={() => setToast(null)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: { paddingHorizontal: 16, paddingTop: 12 },
  greeting: { fontSize: 16, fontWeight: '600', color: colors.text, marginBottom: 10 },
  filters: { flexDirection: 'row', gap: 8 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { color: colors.text, fontWeight: '600', fontSize: 13 },
  chipTextActive: { color: '#fff' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 8 },
  muted: { color: colors.muted, textAlign: 'center' },
  errorText: { color: colors.danger, textAlign: 'center', marginBottom: 8 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: colors.text },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.card,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  check: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkDone: { backgroundColor: colors.primary },
  checkMark: { color: '#fff', fontWeight: '800' },
  itemTitle: { fontSize: 16, fontWeight: '600', color: colors.text },
  itemTitleDone: { textDecorationLine: 'line-through', color: colors.muted },
  itemMeta: { fontSize: 13, color: colors.muted, marginTop: 2 },
  overdue: { color: colors.danger, fontWeight: '700' },
  delete: { color: colors.danger, fontWeight: '600', fontSize: 13 },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 24,
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
  },
  fabText: { color: '#fff', fontSize: 30, marginTop: -2 },
});
