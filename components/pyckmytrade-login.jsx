'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Alert, AlertDescription } from './ui/alert';
import { Loader2, CheckCircle, AlertCircle, Info } from 'lucide-react';

export function PickMyTradeLogin({ onConnectionChange }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [environment, setEnvironment] = useState('demo'); // 'demo' ou 'live'

  // URLs da API Tradovate
  const API_URLS = {
    demo: 'https://demo.tradovateapi.com/v1',
    live: 'https://live.tradovateapi.com/v1'
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // 1. Fazer login no Tradovate
      const loginResponse = await fetch(`${API_URLS[environment]}/auth/accesstokenrequest`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          name: username,
          password: password,
          appId: 'Sample App', // Você pode mudar isso
          appVersion: '1.0',
          cid: 8, // Client ID padrão para aplicações web
          sec: '2c91c5d9-4c29-4b35-8c7a-b6ef0e3b0b3f' // Secret padrão para demos
        })
      });

      if (!loginResponse.ok) {
        const errorData = await loginResponse.json();
        throw new Error(errorData.message || 'Falha no login');
      }

      const loginData = await loginResponse.json();
      const accessToken = loginData.accessToken;

      // 2. Buscar informações da conta
      const accountResponse = await fetch(`${API_URLS[environment]}/account/list`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/json',
        }
      });

      if (!accountResponse.ok) {
        throw new Error('Falha ao buscar contas');
      }

      const accounts = await accountResponse.json();

      // 3. Buscar saldos das contas
      const accountsWithBalance = await Promise.all(
        accounts.map(async (account) => {
          try {
            const balanceResponse = await fetch(
              `${API_URLS[environment]}/account/item?id=${account.id}`,
              {
                headers: {
                  'Authorization': `Bearer ${accessToken}`,
                  'Accept': 'application/json',
                }
              }
            );
            
            if (balanceResponse.ok) {
              const balanceData = await balanceResponse.json();
              return {
                id: account.name,
                name: account.nickname || account.name,
                balance: balanceData.cashBalance || 0,
                accountId: account.id
              };
            }
          } catch (err) {
            console.error('Erro ao buscar saldo:', err);
          }
          
          return {
            id: account.name,
            name: account.nickname || account.name,
            balance: 0,
            accountId: account.id
          };
        })
      );

      // 4. Enviar dados para o componente pai
      onConnectionChange({
        connected: true,
        username: username,
        accounts: accountsWithBalance,
        accessToken: accessToken,
        environment: environment
      });

      // Guardar token no localStorage para reconexão
      localStorage.setItem('tradovate_token', accessToken);
      localStorage.setItem('tradovate_username', username);
      localStorage.setItem('tradovate_env', environment);

    } catch (err) {
      console.error('Erro no login:', err);
      setError(err.message || 'Erro ao conectar. Verifique suas credenciais.');
      setIsLoading(false);
    }
  };

  // Tentar reconectar automaticamente
  useState(() => {
    const savedToken = localStorage.getItem('tradovate_token');
    const savedUsername = localStorage.getItem('tradovate_username');
    const savedEnv = localStorage.getItem('tradovate_env');
    
    if (savedToken && savedUsername) {
      // Verificar se o token ainda é válido
      fetch(`${API_URLS[savedEnv || 'demo']}/account/list`, {
        headers: {
          'Authorization': `Bearer ${savedToken}`,
          'Accept': 'application/json',
        }
      }).then(response => {
        if (response.ok) {
          setUsername(savedUsername);
          setEnvironment(savedEnv || 'demo');
          // Token ainda válido, fazer login automático
          // handleLogin({ preventDefault: () => {} });
        } else {
          // Token expirado, limpar
          localStorage.removeItem('tradovate_token');
          localStorage.removeItem('tradovate_username');
          localStorage.removeItem('tradovate_env');
        }
      });
    }
  }, []);

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-2xl text-center">
          Login Tradovate
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleLogin} className="space-y-4">
          {/* Seletor de Ambiente */}
          <div>
            <Label>Ambiente</Label>
            <div className="flex gap-2 mt-1">
              <Button
                type="button"
                variant={environment === 'demo' ? 'default' : 'outline'}
                onClick={() => setEnvironment('demo')}
                className="flex-1"
              >
                Demo
              </Button>
              <Button
                type="button"
                variant={environment === 'live' ? 'default' : 'outline'}
                onClick={() => setEnvironment('live')}
                className="flex-1"
              >
                Real
              </Button>
            </div>
          </div>

          <div>
            <Label htmlFor="username">Usuário</Label>
            <Input
              id="username"
              type="text"
              placeholder="Seu usuário Tradovate"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={isLoading}
              className="mt-1"
              required
            />
          </div>

          <div>
            <Label htmlFor="password">Senha</Label>
            <Input
              id="password"
              type="password"
              placeholder="Sua senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              className="mt-1"
              required
            />
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              {environment === 'demo' 
                ? 'Usando ambiente DEMO - Sem risco real'
                : '⚠️ ATENÇÃO: Ambiente REAL - Dinheiro real!'}
            </AlertDescription>
          </Alert>

          <Button
            type="submit"
            className="w-full"
            disabled={isLoading || !username || !password}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Conectando...
              </>
            ) : (
              'Conectar'
            )}
          </Button>

          <div className="text-center text-sm text-gray-600">
            <p>Não tem conta demo?</p>
            <a 
              href="https://demo.tradovate.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              Criar conta demo grátis
            </a>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
