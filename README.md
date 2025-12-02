# Todo List React Native

## Integrantes do Grupo

- **Matusalen Costa Alves** - Matrícula: 2024116TADS0005
- **Fabricio de Carvalho Mota** - Matrícula: 2024116TADS0002
- **Cicero Andrade Santos** - Matrícula: 2024116TADS0040
- **Cairon Ferreira Prado** - Matrícula: 2024116TADS0045

## Descrição do Projeto

Aplicação de gerenciamento de tarefas (To-Do List) desenvolvida em React Native com Expo. O app permite criar, visualizar, editar e excluir tarefas, com suporte a temas claro e escuro. A arquitetura foi implementada seguindo o padrão MVVM (Model-View-ViewModel) com foco em separação de responsabilidades, testabilidade e manutenibilidade.

### Funcionalidades

- ✅ Criar novas tarefas
- ✅ Listar todas as tarefas
- ✅ Visualizar detalhes de uma tarefa
- ✅ Editar tarefas existentes
- ✅ Excluir tarefas
- ✅ Marcar tarefas como concluídas
- ✅ Alternar entre tema claro e escuro
- ✅ Persistência local de dados

## Arquitetura e Padrões Aplicados

### MVVM (Model-View-ViewModel)

A arquitetura MVVM foi implementada separando claramente as responsabilidades:

- **Model (`src/model/`)**: Contém as entidades de domínio, repositórios e serviços de negócio
  - `entities/task.ts`: Define a entidade Task com seus atributos e comportamentos
  - `repository/`: Interface e implementação do repositório para acesso aos dados
  - `service/`: Lógica de negócio para manipulação de tarefas

- **View (`src/view/`)**: Componentes React Native responsáveis pela interface do usuário
  - `TaskListScreen.tsx`: Tela de listagem de tarefas
  - `TaskCreateScreen.tsx`: Tela de criação de tarefas
  - `TaskDetailScreen.tsx`: Tela de detalhes e edição
  - `theme/`: Gerenciamento de temas da aplicação

- **ViewModel (`src/viewmodel/`)**: Hooks personalizados que conectam View e Model
  - `useTasks.ts`: Gerencia estado e operações da lista de tarefas
  - `useTaskCreate.ts`: Lógica para criação de tarefas
  - `useTaskDetail.ts`: Lógica para visualização e edição de tarefas

### Injeção de Dependências (DI)

A injeção de dependências foi aplicada através de:

1. **Interfaces**: Definição de contratos (`ITaskRepository`, `ITaskService`) que desacoplam a implementação concreta
2. **Inversão de Dependências**: As ViewModels dependem de abstrações, não de implementações concretas
3. **Composição**: Instâncias dos serviços são criadas e injetadas nos hooks customizados

```typescript
// Exemplo de DI nos ViewModels
const repository = new LocalTaskRepository();
const service = new TaskService(repository);
```

Esta abordagem facilita:
- Testes unitários com mocks
- Substituição de implementações
- Manutenção e evolução do código

### Testes

A aplicação possui cobertura de testes em três níveis:

1. **Testes de Model** (`tests/model/`)
   - Testes unitários das entidades
   - Testes do repositório local
   - Testes dos serviços de negócio

2. **Testes de ViewModel** (`tests/viewmodel/`)
   - Testes dos hooks customizados
   - Validação da lógica de estado
   - Verificação de integração com serviços

3. **Testes de View** (`tests/screen/`)
   - Testes de componentes React Native
   - Verificação de renderização
   - Testes de interação do usuário

**Ferramentas utilizadas:**
- Jest: Framework de testes
- React Native Testing Library: Testes de componentes
- Mocks: Simulação de dependências externas (Expo, AsyncStorage)

## Como Executar o App

### Pré-requisitos

- Node.js (versão 18 ou superior)
- npm ou yarn
- Expo Go instalado no dispositivo móvel (iOS ou Android)
- Ou emulador configurado (Android Studio / Xcode)

### Passos

1. **Clone o repositório**
   ```bash
   git clone <url-do-repositorio>
   cd todo-list-react
   ```

2. **Instale as dependências**
   ```bash
   npm install
   ```

3. **Inicie o servidor de desenvolvimento**
   ```bash
   npm start
   ```

4. **Execute o app**
   
   Após iniciar o servidor, você verá um QR Code no terminal. Escolha uma das opções:
   
   - **No dispositivo físico**: Abra o app Expo Go e escaneie o QR Code
   - **No emulador Android**: Pressione `a` no terminal
   - **No simulador iOS**: Pressione `i` no terminal
   - **No navegador web**: Pressione `w` no terminal

### Comandos Disponíveis

```bash
npm start          # Inicia o servidor Expo
npm run android    # Executa no Android
npm run ios        # Executa no iOS
npm run web        # Executa no navegador
```

## Como Executar os Testes

### Executar todos os testes

```bash
npm test
```

### Executar testes com cobertura

```bash
npm test -- --coverage
```

### Executar testes em modo watch

```bash
npm test -- --watch
```

### Executar testes específicos

```bash
# Testes do Model
npm test -- tests/model

# Testes do ViewModel
npm test -- tests/viewmodel

# Testes das Screens
npm test -- tests/screen

# Teste específico
npm test -- TaskService.test.ts
```

### Estrutura dos Testes

```
tests/
├── model/                          # Testes da camada Model
│   ├── task.test.ts
│   ├── LocalTaskRepository.test.ts
│   └── TaskService.test.ts
├── viewmodel/                      # Testes da camada ViewModel
│   ├── useTasks.test.ts
│   ├── useTaskCreate.test.ts
│   └── useTaskDetail.test.ts
├── screen/                         # Testes da camada View
│   ├── TaskListScreen.test.tsx
│   ├── TaskCreateScreen.test.tsx
│   └── TaskDetailScreen.test.tsx
└── utils/                          # Utilitários de teste
    └── testUtils.ts
```

## Tecnologias Utilizadas

- **React Native 0.81.5**: Framework para desenvolvimento mobile
- **Expo ~54.0**: Plataforma para desenvolvimento React Native
- **TypeScript 5.9**: Superset JavaScript com tipagem estática
- **React Navigation 7**: Navegação entre telas
- **Jest 29**: Framework de testes
- **Testing Library**: Utilitários para testes de componentes

## Licença

Projeto desenvolvido para fins acadêmicos.
