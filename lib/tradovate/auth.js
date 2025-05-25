// Serviço de Autenticação Tradovate
// Ficheiro: lib/tradovate/auth.js

import { tradovateConfig } from './config';

class TradovateAuth {
  constructor() {
    this.accessToken = null;
    this.userId = null;
    this.accounts = [];
  }

  // Função principal de login
  async login(username, password) {
    try {
      console.log('🔐 Tentando login no Tradovate...');
      
      const response = await fetch(`${tradovateConfig.getApiUrl()}/auth/accesstokenrequest`, {
        method: 'POST',
        headers: tradovateConfig.getHeaders(),
        body: JSON.stringify({
          name: username,
          password: password,
          appId: tradovateConfig.appId,
          appVersion: '1.0',
          appSecret: tradovateConfig.appSecret,
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Login falhou: ${error}`);
      }

      const data = await response.json();
      
      // Guardar dados da sessão
      this.accessToken = data.accessToken;
      this.userId = data.userId;
      
      console.log('✅ Login bem sucedido!');
      
      // Buscar contas disponíveis
      await this.fetchAccounts();
      
      return {
        success: true,
        accessToken: this.accessToken,
        userId: this.userId,
        accounts: this.accounts,
      };
      
    } catch (error) {
      console.error('❌ Erro no login:', error.message);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Buscar contas do utilizador
  async fetchAccounts() {
    try {
      console.log('📊 Buscando contas...');
      
      const response = await fetch(`${tradovateConfig.getApiUrl()}/account/list`, {
        method: 'GET',
        headers: tradovateConfig.getHeaders(this.accessToken),
      });

      if (!response.ok) {
        throw new Error('Falha ao buscar contas');
      }

      this.accounts = await response.json();
      console.log(`✅ Encontradas ${this.accounts.length} contas`);
      
      return this.accounts;
      
    } catch (error) {
      console.error('❌ Erro ao buscar contas:', error.message);
      return [];
    }
  }

  // Verificar se está autenticado
  isAuthenticated() {
    return this.accessToken !== null;
  }

  // Logout
  logout() {
    this.accessToken = null;
    this.userId = null;
    this.accounts = [];
    console.log('👋 Logout realizado');
  }

  // Obter token atual
  getAccessToken() {
    return this.accessToken;
  }

  // Obter contas
  getAccounts() {
    return this.accounts;
  }
}

// Exportar instância única (singleton)
export const tradovateAuth = new TradovateAuth();
