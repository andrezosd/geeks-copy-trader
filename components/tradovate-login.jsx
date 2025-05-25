// Componente de Login Tradovate
// Ficheiro: components/tradovate-login.jsx

'use client';

import { useState } from 'react';
import { tradovateAuth } from '@/lib/tradovate/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle, CheckCircle } from 'lucide-react';

export function TradovateLogin({ onLoginSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setIsLoading(true);

    try {
      const result = await tradovateAuth.login(username, password);
      
      if (result.success) {
        setSuccess(true);
        
        // Chamar callback com as contas
        if (onLoginSuccess) {
          onLoginSuccess(result.accounts);
        }
        
        // Limpar formulário
        setUsername('');
        setPassword('');
        
      } else {
        setError(result.error || 'Erro desconhecido no login');
      }
    } catch (err) {
      setError('Erro de conexão. Verifique sua internet.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-center">
        🔐 Conectar ao Tradovate
      </h2>

      {/* Alerta de Demo */}
      <Alert className="mb-4 bg-blue-50 border-blue-200">
        <AlertCircle className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-800">
          <strong>Modo Demo Ativo</strong> - Usando conta demo para testes seguros
        </AlertDescription>
      </Alert>

      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <Label htmlFor="username">Username Tradovate</Label>
          <Input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="seu_username"
            required
            disabled={isLoading}
          />
        </div>

        <div>
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="sua_password"
            required
            disabled={isLoading}
          />
        </div>

        {/* Mensagens de erro/sucesso */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="bg-green-50 border-green-200">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              Login realizado com sucesso! 🎉
            </AlertDescription>
          </Alert>
        )}

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
      </form>

      <div className="mt-6 text-sm text-gray-600">
        <p className="mb-2">
          <strong>Nota:</strong> Use suas credenciais Tradovate normais.
        </p>
        <p>
          Não tem conta? 
          <a 
            href="https://www.tradovate.com/sign-up/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline ml-1"
          >
            Criar conta demo grátis
          </a>
        </p>
      </div>
    </div>
  );
}
