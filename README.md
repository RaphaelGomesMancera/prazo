# Prazo — Organizador de tarefas acadêmicas

**CheckPoint 3 — Mobile Application Development (FIAP)**
**Aluno:** Raphael Gomes Mancera — RM 562279
**Stack:** React Native (Expo) · Firebase Authentication · Cloud Firestore · React Navigation

---

## 1. Definição do app

**Prazo** é um aplicativo para o estudante cadastrar e acompanhar as entregas da faculdade (trabalhos, checkpoints, provas), com matéria, data de entrega e status. Cada usuário tem sua própria conta e enxerga somente as próprias tarefas.

### Fluxo previsto

1. **Abertura do app**: o Firebase restaura a sessão salva. Se o usuário já estiver logado, vai direto para a lista; se não, vai para o login.
2. **Login / Cadastro** (e-mail e senha). Também há "Esqueci minha senha", que envia um e-mail de redefinição.
3. **Lista de tarefas**, ordenada pela data de entrega, com filtros *Todas / Pendentes / Concluídas*. Tarefas vencidas e não concluídas aparecem como "Atrasada".
4. **Criar / editar tarefa** (título, matéria, data DD/MM/AAAA e descrição).
5. **Concluir** uma tarefa pelo círculo ao lado dela, ou **excluir** (com confirmação).
6. **Sair** da conta pelo botão no cabeçalho.

### Cenários de erro e sucesso tratados

| Situação | Tratamento |
|---|---|
| Campos vazios, e-mail inválido, senha curta, senhas diferentes | Validação local com mensagem no campo, antes de chamar o Firebase |
| E-mail já cadastrado, senha incorreta, conta inexistente, muitas tentativas, sem internet | Códigos de erro do Firebase traduzidos em `utils/firebaseErrors.js` e exibidos em um aviso na tela |
| Recuperação de senha | Aviso de sucesso ou de erro |
| Carregando dados | Indicador de loading na lista e nos botões (evita duplo clique) |
| Lista vazia | Mensagem de estado vazio |
| Falha ao ler do Firestore | Mensagem de erro e botão "Tentar novamente" |
| Falha ao salvar, concluir ou excluir | Alerta ou toast com a causa; sem resposta do servidor (offline), um timeout avisa o usuário |
| Criar, editar e excluir com sucesso | Toast de confirmação |
| Excluir e sair | Confirmação antes da ação |
| Data inválida (ex.: 31/02/2026) | Validada de verdade, não só pelo formato |
| Acesso a dados de outro usuário | Bloqueado pelas regras de segurança do Firestore (`firestore.rules`) |

---

## 2. Como executar

```bash
npm install
npx expo start
```

### Configurar o Firebase
1. No [Firebase Console](https://console.firebase.google.com), crie um projeto e adicione um **app Web**.
2. Copie a configuração para `src/config/firebase.js` (no lugar dos `COLE_AQUI`).
3. Em **Authentication > Método de login**, ative **E-mail/senha**.
4. Em **Firestore Database**, crie o banco e, na aba **Regras**, cole o conteúdo de `firestore.rules` e publique.

---

## 3. Conceitos utilizados

### Estrutura em camadas
```
src/
  config/       inicialização do Firebase
  services/     acesso ao Firebase (authService, taskService)
  context/      estado global de autenticação (AuthContext)
  hooks/        useAuth, useTasks
  screens/      telas (Login, Lista, Formulário)
  components/   componentes reutilizáveis (Input, Button, Toast)
  navigation/   AppNavigator
  utils/        datas e tradução de erros
```
As telas não falam direto com o Firebase: elas chamam *services* e *hooks*. Isso separa interface de regra de negócio e facilita manutenção.

### Firebase Authentication (`authService.js`, `config/firebase.js`)
- `createUserWithEmailAndPassword`, `signInWithEmailAndPassword`, `signOut` e `sendPasswordResetEmail` cuidam de cadastro, login, logout e recuperação de senha.
- `updateProfile` grava o nome do usuário (`displayName`).
- **Persistência de sessão**: `initializeAuth` com `getReactNativePersistence(AsyncStorage)` guarda a sessão no dispositivo, então o usuário continua logado ao reabrir o app.

### Cloud Firestore (`taskService.js`)
- Coleção `tasks`; cada documento guarda `title`, `subject`, `description`, `dueDate` (`YYYY-MM-DD`), `done`, `userId` e `createdAt`.
- **CRUD**: `addDoc` (criar), `updateDoc` (editar e concluir), `deleteDoc` (excluir) e leitura com `query` + `where('userId', '==', uid)`.
- **Tempo real**: `onSnapshot` atualiza a lista automaticamente a cada mudança, sem precisar recarregar. A função retorna um `unsubscribe`, chamado na limpeza do `useEffect`.
- `serverTimestamp()` usa a hora do servidor, e não a do aparelho.
- A ordenação por data é feita no cliente para não exigir índice composto.
- **Regras de segurança** (`firestore.rules`): só o dono (`resource.data.userId == request.auth.uid`) lê, altera ou exclui. O `userId` não pode ser alterado, e o título é validado na criação.

### Context API (`AuthContext.js`)
O `AuthProvider` observa o login com `onAuthStateChanged` e expõe `user`, `initializing` e as funções `signIn`, `signUp`, `signOut` e `resetPassword` para todo o app. `useMemo` evita recriar o objeto do contexto a cada render.

### Hooks
- `useState`: formulários, erros, loading, filtro e toast.
- `useEffect`: assinatura do Firestore (com limpeza) e exibição do toast recebido pela navegação.
- `useMemo`: lista filtrada e valor do contexto.
- `useCallback`: função `retry`.
- **Hooks customizados**: `useAuth` (acesso ao contexto, com erro se usado fora do provider) e `useTasks` (encapsula leitura em tempo real, loading, erro e nova tentativa).

### React Navigation (`AppNavigator.js`)
- `createNativeStackNavigator` com **navegação condicional**: se há `user`, o stack contém `Tasks` e `TaskForm`; senão, apenas `Login`. Ao logar ou deslogar, o Firebase muda o `user` e o app troca de área sozinho, sem `navigate` manual, e o usuário deslogado não consegue voltar às telas protegidas.
- `route.params` passa a tarefa para edição e a mensagem de sucesso para a lista. Ao salvar, `navigation.popTo('Tasks', params)` volta para a lista que já está aberta (no React Navigation 7, `navigate` empilharia uma tela duplicada).
- `headerRight` coloca o botão "Sair" no cabeçalho.

### Interface
- `FlatList` para a lista (renderiza só os itens visíveis).
- `KeyboardAvoidingView` e `ScrollView` com `keyboardShouldPersistTaps` para o teclado não cobrir os campos.
- Componentes reutilizáveis com *props* (`Input`, `Button`, `Toast`), `StyleSheet` e `Animated` (fade do toast).
- **Máscara de data** e validação de calendário real em `utils/date.js`.

### Tratamento de erros
`try/catch/finally` em todas as chamadas assíncronas, com tradução dos códigos do Firebase em `firebaseErrors.js`. Há também um `withTimeout` nas escritas, porque o Firestore pode deixar a Promise pendente quando o aparelho está offline, e a interface sempre precisa receber uma resposta.
