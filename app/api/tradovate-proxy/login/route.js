// API Route - Login Proxy (Estilo PickMyTrade)
// Ficheiro: app/api/tradovate-proxy/login/route.js

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// Configuração - TU pagas esta API, não o cliente!
const TRADOVATE_APP_ID = process.env.TRADOVATE_APP_ID || 'sample';
const TRADOVATE_APP_SECRET = process.env.TRADOVATE_APP_SECRET || '';

// URL da API (demo por padrão)
const API_BASE_URL = process.env.NEXT_PUBLIC_TRADOVATE_ENV === 'live' 
  ? 'https://live.tradovateapi.com/v1'
  : 'https://demo.tradovateapi.com/v1';

// Armazenamento temporário de sessões (em produção usar Redis/Database)
const userSessions = new Map();

export async function POST(request) {
  try {
    const body = await request.json();
    const { username, password } = body;
    
    // Validação básica
    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username e password são obrigatórios' },
        { status: 400 }
      );
    }
    
    console.log(`🔐 Tentando login para cliente: ${username}`);
    
    // Fazer login no Tradovate com NOSSAS credenciais de API
    const loginResponse = await fetch(`${API_BASE_URL}/auth/accesstokenrequest`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: username,              // Username do CLIENTE
        password: password,          // Password do CLIENTE
        appId: TRADOVATE_APP_ID,     // NOSSA App ID (que pagamos)
        appSecret: TRADOVATE_APP_SECRET, // NOSSO Secret
        appVersion: '1.0.0',
      }),
    });
    
    const responseText = await loginResponse.text();
    
    // Verificar se login foi bem sucedido
    if (!loginResponse.ok) {
      console.error('❌ Erro no login Tradovate:', responseText);
      
      if (loginResponse.status === 401) {
        return NextResponse.json(
          { error: 'Username ou password incorretos' },
          { status: 401 }
        );
      }
      
      if (responseText.includes('app id')) {
        return NextResponse.json(
          { 
            error: 'Configuração de API inválida. Configure TRADOVATE_APP_ID no .env.local',
            details: 'Usando modo sample - funcionalidade limitada'
          },
          { status: 400 }
        );
      }
      
      return NextResponse.json(
        { error: 'Erro ao conectar ao Tradovate' },
        { status: 500 }
      );
    }
    
    // Parse da resposta
    let loginData;
    try {
      loginData = JSON.parse(responseText);
    } catch (error) {
      console.error('❌ Erro ao fazer parse da resposta');
      return NextResponse.json(
        { error: 'Resposta inválida do Tradovate' },
        { status: 500 }
      );
    }
    
    // Criar sessão única para este utilizador
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    
    // Guardar informações da sessão (NUNCA expor tokens ao cliente!)
    const sessionData = {
      sessionId: sessionId,
      username: username,
      userId: loginData.userId,
      accessToken: loginData.accessToken,      // Token REAL do Tradovate
      mdAccessToken: loginData.mdAccessToken,  // Token para market data
      expiresAt: Date.now() + (2 * 60 * 60 * 1000), // 2 horas
      createdAt: Date.now(),
    };
    
    userSessions.set(sessionId, sessionData);
    
    console.log(`✅ Login bem sucedido! Session: ${sessionId}`);
    
    // Criar resposta com cookie seguro
    const response = NextResponse.json({
      success: true,
      message: 'Login realizado com sucesso!',
      username: username,
      userId: loginData.userId,
      // NÃO enviamos o token real! Apenas o sessionId
    });
    
    // Guardar sessionId em cookie httpOnly (seguro)
    response.cookies.set('tradovate_session', sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 2 * 60 * 60, // 2 horas
      path: '/',
    });
    
    return response;
    
  } catch (error) {
    console.error('❌ Erro no proxy login:', error);
    
    return NextResponse.json(
      { 
        error: 'Erro interno do servidor',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

// Função auxiliar para limpar sessões expiradas (executar periodicamente)
export async function cleanupSessions() {
  const now = Date.now();
  for (const [sessionId, session] of userSessions.entries()) {
    if (session.expiresAt < now) {
      userSessions.delete(sessionId);
      console.log(`🧹 Sessão expirada removida: ${sessionId}`);
    }
  }
}
