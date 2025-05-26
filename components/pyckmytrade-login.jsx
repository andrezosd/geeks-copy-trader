// Componente de Login Estilo PickMyTrade
// Ficheiro: components/pickmytrade-login.jsx

'use client';

import { useState, useEffect } from 'react';
import { Loader2, CheckCircle, AlertCircle, Info, LogOut } from 'lucide-react';

export function PickMyTradeLogin({ onConnectionChange }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [connectedUser, setConnectedUser] = useState(null);
  const [accounts, setAccounts] = useState([]);

  // Verificar se já está conectado ao carregar
  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    try {
      const response = await fetch('/api/tradovate-proxy/accounts');
      if (response.ok) {
        const data = await response.json();
        if (data.accounts && data.accounts.length > 0) {
          setIsConnected(true);
          setAccounts(data.accounts);
          
          // Buscar username do localStorage ou cookie
          const savedUsername = localStorage.getItem('tradovate_username');
          if (savedUsername) {
            setConnectedUser({ username: savedUsername });
          }
          
          if (onConnectionChange) {
            onConnectionChange({
              connected: true,
              accounts: data.accounts,
            });
          }
        }
      }
    } catch (error) {
      console.log('Não conectado');
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Fazer login via proxy
      const response = await fetch('/api/tradovate-proxy/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Erro ao conectar');
        setIsLoading(false);
        return;
      }

      // Login bem sucedido!
      console.log('✅ Login bem sucedido!');
      
      // Guardar username (não password!)
      localStorage.setItem('tradovate_username', username);
      
      setIsConnected(true);
      setConnectedUser({ username: data.username });
      
      // Buscar contas
      await fetchAccounts();
      
      // Limpar formulário
      setPassword('');

    } catch (err) {
      console.error('Erro:', err);
      setError('Erro de conexão. Verifique sua internet.');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAccounts = async () => {
    try {
      const response = await fetch('/api/tradovate-proxy/accounts');
      const data = await response.json();
      
      if (data.success && data.accounts) {
        setAccounts(data.accounts);
        
        if (onConnectionChange) {
          onConnectionChange({
            connected: true,
            accounts: data.accounts,
            username: username,
          });
        }
      }
    } catch (error) {
      console.error('Erro ao buscar contas:', error);
    }
  };

  const handleDisconnect = async () => {
    // Limpar sessão
    localStorage.removeItem('tradovate_username');
    
    // Reset estado
    setIsConnected(false);
    setConnectedUser(null);
    setAccounts([]);
    setUsername('');
    setPassword('');
    
    if (onConnectionChange) {
      onConnectionChange({
        connected: false,
        accounts: [],
      });
    }
    
    // Opcional: chamar endpoint de logout
    try {
      await fetch('/api/tradovate-proxy/logout', { method: 'POST' });
    } catch (error) {
      console.log('Logout error:', error);
    }
  };

  // Se já está conectado, mostrar status
  if (isConnected && connectedUser) {
    return (
      <div className="w-full max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
        <div className="text-center">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-800 mb-2">
            Tradovate Conectado
          </h3>
          <p className="text-gray-600 mb-4">
            Conectado como: <strong>{connectedUser.username}</strong>
          </p>
          
          {accounts.length > 0 && (
            <div className="mb-4 p-4 bg-gray-50 rounded-lg text-left">
              <h4 className="font-semibold text-sm text-gray-700 mb-2">
                Contas Disponíveis:
              </h4>
              <div className="space-y-2">
                {accounts.map((account) => (
                  <div key={account.id} className="flex justify-between text-sm">
                    <span>{account.name}</span>
                    <span className="font-medium">
                      ${account.balance.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <button
            onClick={handleDisconnect}
            className="flex items-center gap-2 mx-auto px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Desconectar
          </button>
        </div>
      </div>
    );
  }

  // Formulário de login
  return (
    <div className="w-full max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
        🔐 Conectar ao Tradovate
      </h2>
      
      {/* Banner informativo */}
      <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg border border-blue-200">
        <div className="flex items-start gap-3">
          <Info className="h-5 w-5 text-blue-600 mt-0.5" />
          <div className="text-sm">
            <p className="font-semibold text-blue-800 mb-1">
              Sem taxas extras de API!
            </p>
            <p className="text-blue-700">
              Ao contrário de outros serviços, <strong>não precisa pagar $25/mês</strong> de API. 
              Use suas credenciais normais do Tradovate.
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Username Tradovate
          </label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="seu_username"
            required
            disabled={isLoading}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="sua_password"
            required
            disabled={isLoading}
          />
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-red-600 mt-0.5" />
              <div className="text-sm text-red-800">
                <p>{error}</p>
                {error.includes('API') && (
                  <p className="mt-1 text-xs">
                    Usando modo sample. Para produção, configure TRADOVATE_APP_ID no servidor.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading || !username || !password}
          className={`w-full py-3 px-4 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
            isLoading 
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white'
          }`}
        >
          {isLoading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Conectando...</span>
            </>
          ) : (
            <span>Conectar</span>
          )}
        </button>
      </form>

      <div className="mt-6 space-y-3">
        <p className="text-center text-sm text-gray-600">
          Não tem conta?{' '}
          <a 
            href="https://www.tradovate.com/sign-up/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline font-medium"
          >
            Criar conta demo grátis
          </a>
        </p>
        
        <div className="p-3 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-600 text-center">
            <strong>🔒 100% Seguro:</strong> Suas credenciais são encriptadas e usadas apenas 
            para executar suas ordens. Nunca armazenamos passwords.
          </p>
        </div>
      </div>
    </div>
  );
}
