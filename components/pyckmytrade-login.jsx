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
  const [environment, setEnvironment] = useState('demo');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // 1. Login via nosso proxy
      const loginResponse = await fetch('/api/tradovate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'login',
          environment,
          username,
          password
        })
      });

      if (!loginResponse.ok) {
        const errorData = await loginResponse.json();
        throw new Error(errorData.error || 'Falha no login');
      }

      const loginData = await loginResponse.json();
      const accessToken = loginData.accessToken;

      // 2. Buscar contas
      const accountsResponse = await fetch('/api/tradovate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'accounts',
          environment,
          token: accessToken
        })
      });

      if (!accountsResponse.ok) {
        throw new Error('Falha ao buscar contas');
      }

      const accounts = await accountsResponse.json();

      // 3. Buscar saldos
      const accountsWithBalance = await Promise.all(
        accounts.map(async (account) => {
          try {
            const balanceResponse = await fetch('/api/tradovate', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                action: 'balance',
                environment,
                token: accessToken,
                accountId: account.id
              })
            });
            
            if (balanceResponse.ok) {
              const balanceData = await balanceResponse.json();
              return {
                id: account.name,
                name: account.nickname || account.name,
                balance: balanceData.cashBalance || 0
              };
            }
          } catch (err) {
            console.error('Erro ao buscar saldo:', err);
          }
          
          return {
            id: account.name,
            name: account.nickname || account.name,
            balance: 0
          };
        })
      );

      // Sucesso!
      onConnectionChange({
        connected: true,
        username: username,
        accounts: accountsWithBalance
      });

      setIsLoading(false);

    } catch (err) {
      console.error('Erro:', err);
      setError(err.message || 'Erro ao conectar');
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-2xl text-center">
          Login Tradovate
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <Label>Ambiente</Label>
            <div className="flex gap-2 mt-1">
              <Button
                type="button"
                variant={environment === 'demo' ? 'default' : 'outline'}
                onClick={() => setEnvironment('demo')}
                className="flex-1"
              >
                Demo (Teste)
              </Button>
              <Button
                type="button"
                variant={environment === 'live' ? 'default' : 'outline'}
                onClick={() => setEnvironment('live')}
                className="flex-1"
                disabled
              >
                Real (Desativado)
              </Button>
            </div>
          </div>

          <div>
            <Label htmlFor="username">Usuário Tradovate</Label>
            <Input
              id="username"
              type="text"
              placeholder="Seu usuário demo"
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
              placeholder="Sua senha demo"
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
              Use suas credenciais da conta demo Tradovate
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
              'Conectar ao Tradovate Demo'
            )}
          </Button>

          <div className="text-center text-sm text-gray-600 space-y-1">
            <p>Não tem conta demo?</p>
            <a 
              href="https://demo.tradovate.com/#/signup" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline font-medium"
            >
              Criar conta demo grátis →
            </a>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
