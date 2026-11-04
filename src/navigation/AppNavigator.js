import React from 'react';
import { ActivityIndicator, Alert, Pressable, Text, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../hooks/useAuth';
import LoginScreen from '../screens/LoginScreen';
import TaskListScreen from '../screens/TaskListScreen';
import TaskFormScreen from '../screens/TaskFormScreen';
import { getErrorMessage } from '../utils/firebaseErrors';
import { colors } from '../theme';

const Stack = createNativeStackNavigator();

function LogoutButton() {
  const { signOut } = useAuth();

  function confirmLogout() {
    Alert.alert('Sair', 'Deseja sair da sua conta?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Sair',
        style: 'destructive',
        onPress: async () => {
          try {
            await signOut();
          } catch (err) {
            Alert.alert('Erro ao sair', getErrorMessage(err));
          }
        },
      },
    ]);
  }

  return (
    <Pressable onPress={confirmLogout} hitSlop={8}>
      <Text style={{ color: colors.primary, fontWeight: '700' }}>Sair</Text>
    </Pressable>
  );
}

export default function AppNavigator() {
  const { user, initializing } = useAuth();

  // Enquanto o Firebase restaura a sessão salva, mostramos um loading.
  if (initializing) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: colors.card },
          headerTitleStyle: { color: colors.text },
          headerTintColor: colors.primary,
        }}
      >
        {user ? (
          <>
            <Stack.Screen
              name="Tasks"
              component={TaskListScreen}
              options={{ title: 'Minhas tarefas', headerRight: () => <LogoutButton /> }}
            />
            <Stack.Screen
              name="TaskForm"
              component={TaskFormScreen}
              options={({ route }) => ({
                title: route.params?.task ? 'Editar tarefa' : 'Nova tarefa',
              })}
            />
          </>
        ) : (
          <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
