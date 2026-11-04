import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import Input from '../components/Input';
import Button from '../components/Button';
import { useAuth } from '../hooks/useAuth';
import { createTask, updateTask } from '../services/taskService';
import { getErrorMessage } from '../utils/firebaseErrors';
import { brToIso, isoToBr, maskDate } from '../utils/date';
import { colors } from '../theme';

export default function TaskFormScreen({ navigation, route }) {
  const { user } = useAuth();
  const editing = route.params?.task || null;

  const [title, setTitle] = useState(editing?.title || '');
  const [subject, setSubject] = useState(editing?.subject || '');
  const [date, setDate] = useState(editing ? isoToBr(editing.dueDate) : '');
  const [description, setDescription] = useState(editing?.description || '');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  function validate() {
    const e = {};
    if (!title.trim()) e.title = 'Informe o título da tarefa.';
    else if (title.trim().length > 100) e.title = 'O título deve ter no máximo 100 caracteres.';
    if (!date) e.date = 'Informe a data de entrega.';
    else if (!brToIso(date)) e.date = 'Data inválida. Use o formato DD/MM/AAAA.';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSave() {
    if (!validate()) return;
    const data = {
      title: title.trim(),
      subject: subject.trim(),
      description: description.trim(),
      dueDate: brToIso(date),
    };
    setLoading(true);
    try {
      if (editing) await updateTask(editing.id, data);
      else await createTask(user.uid, data);
      // popTo volta para a lista que já está aberta (navigate empilharia uma tela duplicada no React Navigation 7).
      navigation.popTo('Tasks', {
        toast: editing ? 'Tarefa atualizada!' : 'Tarefa criada!',
        toastType: 'success',
        t: Date.now(),
      });
    } catch (err) {
      if (err?.code === 'app/timeout') {
        // A escrita fica na fila do Firestore e sincroniza quando a conexão voltar.
        Alert.alert('Sem conexão', getErrorMessage(err), [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      } else {
        Alert.alert('Não foi possível salvar', getErrorMessage(err));
      }
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.bg }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.card}>
          <Input
            label="Título *"
            value={title}
            onChangeText={setTitle}
            placeholder="Ex: Entregar CheckPoint 3"
            error={errors.title}
          />
          <Input
            label="Matéria"
            value={subject}
            onChangeText={setSubject}
            placeholder="Ex: Mobile Application Development"
          />
          <Input
            label="Data de entrega *"
            value={date}
            onChangeText={(t) => setDate(maskDate(t))}
            placeholder="DD/MM/AAAA"
            keyboardType="number-pad"
            maxLength={10}
            error={errors.date}
          />
          <Input
            label="Descrição"
            value={description}
            onChangeText={setDescription}
            placeholder="Detalhes da tarefa (opcional)"
            multiline
            numberOfLines={4}
            style={{ height: 100, textAlignVertical: 'top' }}
          />
          <Button
            title={editing ? 'Salvar alterações' : 'Criar tarefa'}
            onPress={handleSave}
            loading={loading}
          />
          <Button title="Cancelar" variant="outline" onPress={() => navigation.goBack()} disabled={loading} />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
});
