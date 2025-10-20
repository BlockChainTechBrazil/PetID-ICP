# PetID Testing Suite

## 🧪 Test Coverage Implementation

Este diretório contém uma suíte completa de testes para o projeto PetID, implementando **test coverage** equivalente ao **PocketIC** através de **Vitest** e integração direta com **DFX**.

## 📋 Estrutura de Testes

### **🔧 Backend Tests** (`backend.test.js`)
- **DIP721 NFT Functions**: Mint, transfer, ownership, metadata
- **AI Assistant Integration**: Chat functionality and on-chain responses  
- **Asset Storage**: ICP native storage operations
- **Error Handling**: Invalid inputs and edge cases
- **Canister Connectivity**: Health checks and interface validation

### **🎨 Frontend Tests** (`frontend.test.js`)
- **React Components**: Validation of component logic
- **Authentication Flow**: Internet Identity integration
- **Form Validation**: Pet registration, medical records
- **PWA Functionality**: Service worker, offline capabilities
- **Internationalization**: Multi-language support (PT/EN/ES)
- **Image Upload**: File validation and constraints

### **🔄 Integration Tests** (`integration.test.js`)
- **End-to-End Deployment**: Full canister deployment cycle
- **Build Process**: Frontend compilation and asset generation
- **Configuration Validation**: DFX, package.json, asset configs
- **Dependency Checking**: All required packages and versions
- **Performance Metrics**: Bundle size and build performance

### **🛠️ Test Utilities** (`utils.js`)
- **DFX Management**: Automatic replica start/stop
- **Mock Data**: Comprehensive test datasets
- **Helper Functions**: File validation, JSON parsing
- **Performance Monitoring**: Execution time measurement

## 🚀 Como Executar os Testes

### **Executar Todos os Testes**
```bash
npm run test:all
```

### **Testes Específicos**
```bash
# Backend (Motoko canister)
npm run test:backend

# Frontend (React components)  
npm run test:frontend

# Integration (End-to-end)
npm run test:integration
```

### **Modo Watch (Desenvolvimento)**
```bash
npm run test:watch
```

### **Interface Visual**
```bash
npm run test:ui
```

### **Relatório de Coverage**
```bash
npm run test:coverage
```

## 📊 Coverage Report

Após executar `npm run test:coverage`, o relatório será gerado em:
- **HTML**: `./coverage/index.html`
- **JSON**: `./coverage/coverage.json`
- **Text**: Saída direta no terminal

## 🎯 Funcionalidades Testadas

### ✅ **Backend (Motoko)**
- [x] **DIP721 Compliance**: NFT standard implementation
- [x] **Pet Registration**: Mint function with metadata
- [x] **Ownership Management**: Transfer and ownership queries
- [x] **AI Integration**: On-chain chat processing
- [x] **Asset Storage**: ICP native file storage
- [x] **Error Handling**: Graceful error responses

### ✅ **Frontend (React)**
- [x] **Authentication**: Internet Identity flows
- [x] **Pet Forms**: Registration validation
- [x] **Medical Records**: Health data management
- [x] **Image Upload**: File type and size validation
- [x] **PWA Features**: Offline functionality
- [x] **Internationalization**: Language switching

### ✅ **Integration**
- [x] **Deployment**: Successful canister deployment
- [x] **Build Process**: Frontend compilation
- [x] **Configuration**: Valid DFX and package configs
- [x] **Dependencies**: All required packages present
- [x] **Performance**: Bundle size optimization

## 🔧 Configuração Técnica

### **Frameworks Utilizados**
- **Vitest**: Modern testing framework
- **C8**: Code coverage reporting
- **@dfinity/agent**: ICP integration testing

### **Configuração Automática**
- **DFX Auto-Start**: Replica iniciada automaticamente
- **Canister Deploy**: Deploy automático se necessário
- **Cleanup**: Limpeza automática após testes

### **Timeouts Configurados**
- **Backend Tests**: 30s (operações blockchain)
- **Integration Tests**: 120s (deploy completo)
- **Frontend Tests**: 10s (validação rápida)

## 🚨 Pré-requisitos

### **Dependências Necessárias**
```bash
# Instalar dependências de teste (já incluídas)
npm install --save-dev vitest @vitest/ui c8
```

### **DFX Requirements**
- **DFX**: v0.15.0 ou superior
- **Node.js**: v18 ou superior
- **Internet Computer**: Replica local funcionando

## 📈 Métricas de Qualidade

### **Coverage Targets**
- **Backend**: >90% das funções principais
- **Frontend**: >85% dos componentes críticos
- **Integration**: 100% dos fluxos principais

### **Performance Benchmarks**
- **Bundle Size**: <50MB
- **Test Execution**: <5 minutos total
- **Build Time**: <2 minutos

## 🐛 Troubleshooting

### **DFX Não Inicia**
```bash
# Parar e limpar
dfx stop
rm -rf .dfx

# Reiniciar
dfx start --clean --background
```

### **Testes Falhando**
```bash
# Limpar e reinstalar
npm run canisters:stop
npm ci
npm run test:all
```

### **Coverage Incompleto**
```bash
# Executar com verbose
npm run test:coverage -- --reporter=verbose
```

## 📝 Adicionando Novos Testes

### **Estrutura Recomendada**
```javascript
describe('Nova Funcionalidade', () => {
  beforeAll(async () => {
    // Setup
  });

  it('should validate basic functionality', async () => {
    // Test implementation
    expect(result).toBeDefined();
  });

  afterAll(() => {
    // Cleanup
  });
});
```

### **Boas Práticas**
- ✅ **Testes Isolados**: Cada teste independente
- ✅ **Mock Data**: Usar dados de `utils.js`
- ✅ **Cleanup**: Limpar recursos após testes
- ✅ **Timeouts**: Configurar timeouts adequados
- ✅ **Error Handling**: Testar cenários de erro

## 🎯 Benefícios Implementados

✅ **Confiabilidade**: Validação automática de todas as funcionalidades  
✅ **Regressão Prevention**: Detecta quebras em mudanças futuras  
✅ **Documentação Viva**: Testes servem como documentação  
✅ **Performance Monitoring**: Métricas de performance contínuas  
✅ **Quality Assurance**: Coverage reports para qualidade de código  
✅ **CI/CD Ready**: Estrutura pronta para pipelines automatizados  

---

**Este sistema de testes oferece a mesma robustez e confiabilidade do PocketIC, adaptado especificamente para o ecossistema PetID e Internet Computer Protocol.**