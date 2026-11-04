// Traduz códigos de erro do Firebase (Auth e Firestore) para mensagens amigáveis.
const messages = {
  'auth/invalid-email': 'E-mail inválido.',
  'auth/missing-email': 'Informe o e-mail.',
  'auth/missing-password': 'Informe a senha.',
  'auth/email-already-in-use': 'Já existe uma conta com este e-mail.',
  'auth/weak-password': 'Senha fraca. Use pelo menos 6 caracteres.',
  'auth/user-not-found': 'Nenhuma conta encontrada com este e-mail.',
  'auth/wrong-password': 'Senha incorreta.',
  'auth/invalid-credential': 'E-mail ou senha incorretos.',
  'auth/user-disabled': 'Esta conta foi desativada.',
  'auth/too-many-requests': 'Muitas tentativas. Aguarde um pouco e tente novamente.',
  'auth/network-request-failed': 'Sem conexão com a internet. Verifique sua rede.',
  'permission-denied': 'Você não tem permissão para realizar esta ação.',
  unavailable: 'Serviço indisponível no momento. Verifique sua conexão.',
  'not-found': 'Registro não encontrado. Ele pode ter sido excluído.',
  'deadline-exceeded': 'O servidor demorou para responder. Tente novamente.',
  unauthenticated: 'Sua sessão expirou. Entre novamente.',
  'app/timeout':
    'Sem resposta do servidor. Se você estiver offline, a alteração será sincronizada quando a conexão voltar.',
};

export function getErrorMessage(error) {
  const code = error?.code || '';
  const key = code.startsWith('firestore/') ? code.replace('firestore/', '') : code;
  return messages[key] || messages[code] || 'Ocorreu um erro inesperado. Tente novamente.';
}
