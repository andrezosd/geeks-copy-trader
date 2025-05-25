// Configuração da Tradovate API
// Ficheiro: lib/tradovate/config.js

export const tradovateConfig = {
  // Pega valores do .env.local
  appId: process.env.NEXT_PUBLIC_TRADOVATE_APP_ID,
  appSecret: process.env.TRADOVATE_APP_SECRET,
  
  // URLs baseadas no ambiente (demo ou live)
  isDemo: process.env.NEXT_PUBLIC_TRADOVATE_ENV === 'demo',
  
  // Função para pegar URL correta
  getApiUrl() {
    return this.isDemo 
      ? process.env.NEXT_PUBLIC_TRADOVATE_DEMO_API_URL
      : process.env.NEXT_PUBLIC_TRADOVATE_API_URL;
  },
  
  getWsUrl() {
    return this.isDemo
      ? process.env.NEXT_PUBLIC_TRADOVATE_DEMO_WS_URL
      : process.env.NEXT_PUBLIC_TRADOVATE_WS_URL;
  },
  
  // Headers padrão para requests
  getHeaders(accessToken = null) {
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
    
    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`;
    }
    
    return headers;
  }
};
