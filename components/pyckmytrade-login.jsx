'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Alert, AlertDescription } from './ui/alert';
import { Loader2, Info } from 'lucide-react';

export function PickMyTradeLogin({ onConnectionChange }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Simular login para teste
    // NOTA: Para conectar ao Tradovate real, você precisará:
    // 1. Criar uma conta de desenvolvedor em partners.tradovate.com
    // 2. Obter API credentials
    // 3. Implementar a autenticação OAuth
    
    setTimeout(() => {
      if (username && password) {
        // Por enquanto, vamos simular com contas demo
        alert(`🔄 Tentando conectar com usuário: ${username}\n\n⚠️ NOTA: A conexão real com Tradovate ainda não está implementada.\n\n📝 Para implementar:\n1. Registre-se em partners.tradovate.com\n2. Obtenha suas API keys\n3. Configure o backend para autenticação`);
        
        // Simular sucesso com contas demo
        onConnectionChange({
          connected: true,
          username: username,
          accounts: [
            { 
              id: 'DEMO_' + username + '_001', 
              name: 'Conta Principal ' + username, 
              balance: 100000 
            },
            { 
              id: 'DEMO_' + username + '_002', 
              name: 'Conta Secundária ' + username, 
              balance: 50000 
            }
          ]
        });
        
        setIsLoading(false);
      } else {
        setError('Por favor, preencha todos os campos');
        setIsLoading(false);
      }
    }, 1500);
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl text-center">
          Login Tradovate
        </CardTitle>
        <p className="text-sm text-gray-600 text-center">
          Entre com suas credenciais Tradovate Demo
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">Usuário Tradovate</Label>
            <Input
              id="username"
              type="text"
              placeholder="Seu usuário demo"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={isLoading}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <Input
              id="password"
              type="password"
              placeholder="Sua senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              required
            />
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription className="text-xs">
              <strong>Modo Demo:</strong> A conexão real com Tradovate requer configuração adicional. 
              Por enquanto, este é um modo de demonstração.
            </AlertDescription>
          </Alert>

          <Button
            type="submit"
            className="w-full"
            disabled={isLoading}
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

          <div className="text-center space-y-2">
            <p className="text-sm text-gray-600">
              Não tem conta demo?
            </p>
            <a 
              href="https://www.tradovate.com/demos/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:underline font-medium"
            >
              Criar conta demo Tradovate →
            </a>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
