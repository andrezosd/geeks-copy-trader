import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Alert, AlertDescription } from './ui/alert';
import { Loader2, AlertCircle, CheckCircle, Info } from 'lucide-react';

export function PickMyTradeLogin({ onConnectionChange }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [environment, setEnvironment] = useState('demo');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setIsLoading(true);

    try {
      console.log('🔐 Iniciando login real no Tradovate...');
      
      // Fazer login através do nosso backend
      const response = await fetch('/api/tradovate/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: username,
          password: password,
          environment: environment
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        console.log('✅ Login bem-sucedido!', data);
        setSuccess(true);
        
        // Enviar dados para o componente pai
        onConnectionChange({
          connected: true,
          username: username,
          accounts: data.data.accounts,
          accessToken: data.data.accessToken,
          environment: environment
        });

        // Guardar token para uso futuro
        sessionStorage.setItem('tradovate_token', data.data.accessToken);
        sessionStorage.setItem('tradovate_user', username);
        
        setTimeout(() => {
          setIsLoading(false);
        }, 1000);
        
      } else {
        console.error('❌ Erro no login:', data.error);
        setError(data.error || 'Erro ao conectar. Verifique suas credenciais.');
        setIsLoading(false);
      }

    } catch (err) {
      console.error('❌ Erro de conexão:', err);
      setError('Erro de conexão. Verifique sua internet e tente novamente.');
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl text-center">
          Login Tradovate Real
        </CardTitle>
        <p className="text-sm text-gray-600 text-center">
          Conecte sua conta Tradovate {environment === 'demo' ? 'Demo' : 'Real'}
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleLogin} className="space-y-4">
          {/* Seletor de Ambiente */}
          <div className="grid grid-cols-2 gap-2">
            <Button
              type="button"
              variant={environment === 'demo' ? 'default' : 'outline'}
              onClick={() => setEnvironment('demo')}
              className="w-full"
            >
              Conta Demo
            </Button>
            <Button
              type="button"
              variant={environment === 'live' ? 'default' : 'outline'}
              onClick={() => setEnvironment('live')}
              className="w-full"
            >
              Conta Real
            </Button>
          </div>

          <div className="space-y-2">
            <Label htmlFor="username">Usuário Tradovate</Label>
            <Input
              id="username"
              type="text"
              placeholder={environment === 'demo' ? 'Usuário demo' : 'Usuário real'}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={isLoading}
              required
              autoComplete="username"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <Input
              id="password"
              type="password"
              placeholder="Sua senha Tradovate"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              required
              autoComplete="current-password"
            />
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                Login realizado com sucesso! Carregando contas...
              </AlertDescription>
            </Alert>
          )}

          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription className="text-xs">
              {environment === 'demo' 
                ? 'Use suas credenciais da conta DEMO Tradovate' 
                : '⚠️ ATENÇÃO: Você está usando uma conta REAL com dinheiro real!'}
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
                Conectando ao Tradovate...
              </>
            ) : (
              'Conectar Conta Real'
            )}
          </Button>

          <div className="text-center space-y-2 text-sm">
            <p className="text-gray-600">
              Não tem conta {environment === 'demo' ? 'demo' : 'real'}?
            </p>
            <a 
              href={environment === 'demo' 
                ? "https://www.tradovate.com/sign-up-tradovate/?demo=true" 
                : "https://www.tradovate.com/sign-up-tradovate/"
              }
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline font-medium"
            >
              Criar conta Tradovate →
            </a>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
