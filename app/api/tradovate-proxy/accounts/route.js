// API Route - Buscar Contas via Proxy
// Ficheiro: app/api/tradovate-proxy/accounts/route.js

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// Mesma configuração do login
const API_BASE_URL = process.env.NEXT_PUBLIC_TRADOVATE_ENV === 'live' 
  ? 'https://live.tradovateapi.com/v1'
  : 'https://demo.tradovateapi.com/v1';

// Importar sessões (em produção seria Redis/DB)
// Por agora, vamos usar uma abordagem simples
import { getUserSession } from '../session-store';

export async function GET(request) {
  try {
    // Obter session ID do cookie
    const cookieStore = cookies();
    const sessionId = cookieStore.get('tradovate_session')?.value;
    
    if (!sessionId) {
      return NextResponse.json(
        { error: 'Não autenticado. Faça login primeiro.' },
        { status: 401 }
      );
    }
    
    // Buscar dados da sessão
    const session = await getUserSession(sessionId);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Sessão expirada. Faça login novamente.' },
        { status: 401 }
      );
    }
    
    console.log(`📊 Buscando contas para user: ${session.username}`);
    
    // Buscar contas usando o token REAL (que o cliente não vê)
    const accountsResponse = await fetch(`${API_BASE_URL}/account/list`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${session.accessToken}`,
        'Accept': 'application/json',
      },
    });
    
    if (!accountsResponse.ok) {
      console.error('❌ Erro ao buscar contas:', await accountsResponse.text());
      return NextResponse.json(
        { error: 'Erro ao buscar contas' },
        { status: 500 }
      );
    }
    
    const accounts = await accountsResponse.json();
    
    // Formatar contas para o cliente
    const formattedAccounts = accounts.map(account => ({
      id: account.id.toString(),
      name: account.name,
      nickname: account.nickname || account.name,
      balance: account.cashBalance || 0,
      marginBalance: account.marginBalance || 0,
      realizedPnL: account.realizedPnL || 0,
      unrealizedPnL: account.unrealizedPnL || 0,
      active: account.active,
      accountType: account.accountType,
    }));
    
    console.log(`✅ Encontradas ${formattedAccounts.length} contas`);
    
    return NextResponse.json({
      success: true,
      accounts: formattedAccounts,
      timestamp: new Date().toISOString(),
    });
    
  } catch (error) {
    console.error('❌ Erro ao buscar contas:', error);
    
    return NextResponse.json(
      { 
        error: 'Erro interno do servidor',
        details: error.message 
      },
      { status: 500 }
    );
  }
}
