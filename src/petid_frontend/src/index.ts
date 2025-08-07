import { Actor, HttpAgent } from '@dfinity/agent';
import { idlFactory, _SERVICE as HelloWorldActor } from '../../declarations/hello_world/hello_world.did.js';

// Usando os tipos gerados automaticamente pelo DFX
// interface HelloWorldActor já está definida como _SERVICE nos tipos gerados

class PetIDApp {
  private actor: HelloWorldActor | null = null;
  private agent: HttpAgent | null = null;
  private canisterId: string = '';

  // Elementos DOM
  private elements = {
    status: document.getElementById('status') as HTMLElement,
    canisterIdSpan: document.getElementById('canisterId') as HTMLElement,
    
    // Botões
    helloBtn: document.getElementById('helloBtn') as HTMLButtonElement,
    greetBtn: document.getElementById('greetBtn') as HTMLButtonElement,
    getNameBtn: document.getElementById('getNameBtn') as HTMLButtonElement,
    getCounterBtn: document.getElementById('getCounterBtn') as HTMLButtonElement,
    incrementBtn: document.getElementById('incrementBtn') as HTMLButtonElement,
    resetBtn: document.getElementById('resetBtn') as HTMLButtonElement,
    
    // Inputs
    nameInput: document.getElementById('nameInput') as HTMLInputElement,
    
    // Results
    helloResult: document.getElementById('helloResult') as HTMLElement,
    greetResult: document.getElementById('greetResult') as HTMLElement,
    getNameResult: document.getElementById('getNameResult') as HTMLElement,
    counterResult: document.getElementById('counterResult') as HTMLElement,
    counterValue: document.getElementById('counterValue') as HTMLElement,
  };

  constructor() {
    this.init();
  }

  private async init(): Promise<void> {
    console.log('🚀 Inicializando PetID App...');
    
    try {
      await this.setupAgent();
      await this.setupActor();
      this.setupEventListeners();
      this.updateStatus('connected', '✅ Conectado ao canister!');
      await this.updateCounter();
      
      console.log('✅ App inicializado com sucesso!');
    } catch (error) {
      console.error('❌ Erro na inicialização:', error);
      this.updateStatus('error', '❌ Erro ao conectar. Verifique se a replica está rodando.');
    }
  }

  private async setupAgent(): Promise<void> {
    const isDevelopment = process.env.NODE_ENV === 'development';
    const host = isDevelopment ? 'http://127.0.0.1:8000' : 'https://ic0.app';
    
    this.agent = new HttpAgent({ host });
    
    // Só usar fetchRootKey em desenvolvimento
    if (isDevelopment) {
      await this.agent.fetchRootKey();
    }
    
    console.log(`🌐 Agent configurado para: ${host}`);
  }

  private async setupActor(): Promise<void> {
    // ID do canister deployado
    this.canisterId = 'uxrrr-q7777-77774-qaaaq-cai';
    
    // Fallback para variáveis de ambiente
    if (!this.canisterId) {
      this.canisterId = process.env.CANISTER_ID_HELLO_WORLD || 
                       process.env.HELLO_WORLD_CANISTER_ID || '';
    }
    
    if (!this.canisterId) {
      // Tentar carregar do arquivo local
      try {
        const response = await fetch('/.well-known/ic-domains');
        const data = await response.json();
        this.canisterId = data.hello_world || '';
      } catch {
        console.warn('⚠️ Não foi possível carregar canister ID automaticamente');
      }
    }

    if (!this.canisterId) {
      throw new Error('Canister ID não encontrado. Verifique se o deploy foi feito.');
    }

    this.actor = Actor.createActor<HelloWorldActor>(idlFactory, {
      agent: this.agent!,
      canisterId: this.canisterId,
    });

    this.elements.canisterIdSpan.textContent = this.canisterId;
    console.log(`🎯 Actor criado para canister: ${this.canisterId}`);
  }

  private setupEventListeners(): void {
    // Hello
    this.elements.helloBtn.addEventListener('click', () => this.handleHello());
    
    // Greet
    this.elements.greetBtn.addEventListener('click', () => this.handleGreet());
    this.elements.nameInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.handleGreet();
    });
    
    // GetName
    this.elements.getNameBtn.addEventListener('click', () => this.handleGetName());
    
    // Counter functions
    this.elements.getCounterBtn.addEventListener('click', () => this.updateCounter());
    this.elements.incrementBtn.addEventListener('click', () => this.handleIncrement());
    this.elements.resetBtn.addEventListener('click', () => this.handleReset());
    
    console.log('👂 Event listeners configurados');
  }

  private updateStatus(type: 'connecting' | 'connected' | 'error', message: string): void {
    this.elements.status.className = `status ${type}`;
    this.elements.status.innerHTML = type === 'connecting' 
      ? `<div class="loading"></div><span>${message}</span>`
      : `<span>${message}</span>`;
  }

  private showResult(element: HTMLElement, result: string, isError: boolean = false): void {
    element.textContent = result;
    element.className = `result ${isError ? 'error' : 'success'}`;
    element.style.display = 'block';
    
    // Auto-hide após 10 segundos
    setTimeout(() => {
      element.style.display = 'none';
    }, 10000);
  }

  private async handleFunctionCall<T>(
    fn: () => Promise<T>,
    button: HTMLButtonElement,
    resultElement: HTMLElement,
    formatResult?: (result: T) => string
  ): Promise<T | null> {
    const originalText = button.innerHTML;
    
    try {
      button.disabled = true;
      button.innerHTML = '<div class="loading"></div> Executando...';
      
      const result = await fn();
      const displayResult = formatResult ? formatResult(result) : String(result);
      
      this.showResult(resultElement, `✅ Resultado: ${displayResult}`);
      console.log('✅ Função executada com sucesso:', result);
      
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      this.showResult(resultElement, `❌ Erro: ${errorMessage}`, true);
      console.error('❌ Erro na execução:', error);
      return null;
    } finally {
      button.disabled = false;
      button.innerHTML = originalText;
    }
  }

  private async handleHello(): Promise<void> {
    await this.handleFunctionCall(
      () => this.actor!.hello(),
      this.elements.helloBtn,
      this.elements.helloResult
    );
  }

  private async handleGreet(): Promise<void> {
    const name = this.elements.nameInput.value.trim();
    if (!name) {
      this.showResult(this.elements.greetResult, '❌ Por favor, digite um nome', true);
      return;
    }

    await this.handleFunctionCall(
      () => this.actor!.greet(name),
      this.elements.greetBtn,
      this.elements.greetResult
    );
  }

  private async handleGetName(): Promise<void> {
    await this.handleFunctionCall(
      () => this.actor!.getName(),
      this.elements.getNameBtn,
      this.elements.getNameResult
    );
  }

  private async updateCounter(): Promise<void> {
    const result = await this.handleFunctionCall(
      () => this.actor!.getCounter(),
      this.elements.getCounterBtn,
      this.elements.counterResult,
      (counter) => `Contador: ${counter}`
    );

    if (result !== null) {
      this.elements.counterValue.textContent = result.toString();
    }
  }

  private async handleIncrement(): Promise<void> {
    const result = await this.handleFunctionCall(
      () => this.actor!.increment(),
      this.elements.incrementBtn,
      this.elements.counterResult,
      (counter) => `Incrementado para: ${counter}`
    );

    if (result !== null) {
      this.elements.counterValue.textContent = result.toString();
    }
  }

  private async handleReset(): Promise<void> {
    const result = await this.handleFunctionCall(
      () => this.actor!.reset(),
      this.elements.resetBtn,
      this.elements.counterResult,
      (counter) => `Resetado para: ${counter}`
    );

    if (result !== null) {
      this.elements.counterValue.textContent = result.toString();
    }
  }
}

// Inicializar app quando DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
  console.log('🎯 DOM carregado, inicializando PetID App...');
  new PetIDApp();
});

// Exportar para debug global
(window as any).PetIDApp = PetIDApp;
