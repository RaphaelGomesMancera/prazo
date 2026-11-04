import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Input from '../components/Input';
import Button from '../components/Button';
import { useAuth } from '../hooks/useAuth';
import { getErrorMessage } from '../utils/firebaseErrors';
import { colors } from '../theme';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LoginScreen() {
  const { signIn, signUp, resetPassword } = useAuth();
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [errors, setErrors] = useState({});
  const [banner, setBanner] = useState(null); // { type: 'error' | 'success', message }
  const [loading, setLoading] = useState(false);

  const isRegister = mode === 'register';

  function switchMode() {
    setMode(isRegister ? 'login' : 'register');
    setErrors({});
    setBanner(null);
  }

  function validate() {
    const e = {};
    if (isRegister && !name.trim()) e.name = 'Informe seu nome.';
    if (!email.trim()) e.email = 'Informe o e-mail.';
    else if (!EMAIL_REGEX.test(email.trim())) e.email = 'E-mail inválido.';
    if (!password) e.password = 'Informe a senha.';
    else if (isRegister && password.length < 6) e.password = 'A senha deve ter pelo menos 6 caracteres.';
    if (isRegister && confirm !== password) e.confirm = 'As senhas não conferem.';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit() {
    setBanner(null);
    if (!validate()) return;
    setLoading(true);
    try {
      if (isRegister) await signUp(name, email, password);
      else await signIn(email, password);
      // Sucesso: o onAuthStateChanged troca automaticamente para a área logada.
    } catch (err) {
      setBanner({ type: 'error', message: getErrorMessage(err) });
      setLoading(false);
    }
  }

  async function handleReset() {
    setBanner(null);
    if (!email.trim() || !EMAIL_REGEX.test(email.trim())) {
      setErrors({ email: 'Digite um e-mail válido para recuperar a senha.' });
      return;
    }
    setErrors({});
    setLoading(true);
    try {
      await resetPassword(email);
      setBanner({
        type: 'success',
        message: 'Se o e-mail estiver cadastrado, você receberá um link para redefinir a senha.',
      });
    } catch (err) {
      setBanner({ type: 'error', message: getErrorMessage(err) });
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.bg }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.logo}>Prazo</Text>
        <Text style={styles.subtitle}>Suas entregas da faculdade, sempre em dia.</Text>

        <View style={styles.card}>
          <Text style={styles.title}>{isRegister ? 'Criar conta' : 'Entrar'}</Text>

          {banner ? (
            <View style={[styles.banner, banner.type === 'error' ? styles.bannerError : styles.bannerSuccess]}>
              <Text style={{ color: banner.type === 'error' ? colors.danger : colors.success }}>
                {banner.message}
              </Text>
            </View>
          ) : null}

          {isRegister ? (
            <Input
              label="Nome"
              value={name}
              onChangeText={setName}
              placeholder="Seu nome"
              autoCapitalize="words"
              error={errors.name}
            />
          ) : null}
          <Input
            label="E-mail"
            value={email}
            onChangeText={setEmail}
            placeholder="voce@email.com"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            error={errors.email}
          />
          <Input
            label="Senha"
            value={password}
            onChangeText={setPassword}
            placeholder="••••••"
            secureTextEntry
            autoCapitalize="none"
            error={errors.password}
          />
          {isRegister ? (
            <Input
              label="Confirmar senha"
              value={confirm}
              onChangeText={setConfirm}
              placeholder="••••••"
              secureTextEntry
              autoCapitalize="none"
              error={errors.confirm}
            />
          ) : null}

          <Button
            title={isRegister ? 'Cadastrar' : 'Entrar'}
            onPress={handleSubmit}
            loading={loading}
          />

          {!isRegister ? (
            <Pressable onPress={handleReset} disabled={loading} style={styles.linkWrap}>
              <Text style={styles.link}>Esqueci minha senha</Text>
            </Pressable>
          ) : null}
        </View>

        <Pressable onPress={switchMode} disabled={loading} style={styles.linkWrap}>
          <Text style={styles.link}>
            {isRegister ? 'Já tem conta? Entrar' : 'Não tem conta? Cadastre-se'}
          </Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  logo: { fontSize: 40, fontWeight: '800', color: colors.primary, textAlign: 'center' },
  subtitle: { color: colors.muted, textAlign: 'center', marginBottom: 24, marginTop: 4 },
  card: { backgroundColor: colors.card, borderRadius: 16, padding: 20, borderWidth: 1, borderColor: colors.border },
  title: { fontSize: 20, fontWeight: '700', color: colors.text, marginBottom: 16 },
  banner: { padding: 12, borderRadius: 10, marginBottom: 12, borderWidth: 1 },
  bannerError: { backgroundColor: colors.dangerBg, borderColor: colors.danger },
  bannerSuccess: { backgroundColor: colors.successBg, borderColor: colors.success },
  linkWrap: { alignItems: 'center', paddingVertical: 12 },
  link: { color: colors.primary, fontWeight: '600' },
});
