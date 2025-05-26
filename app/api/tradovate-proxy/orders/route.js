// API Route - Executar Ordens via Proxy
// Ficheiro: app/api/tradovate-proxy/orders/route.js

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getUserSession } from '../session-store';

const API_BASE_URL = process.env.NEXT_PUBLIC_TRADOVATE_ENV === 'live' 
  ? 'https://live.tradovateapi.com/v1'
  : 'https://demo.tradovateapi.com/v1';

// POST - Criar nova ordem
export async function POST(request) {
  try {
    // Verificar autenticação
    const cookieStore = cookies();
    const sessionId = cookieStore.get('tradovate_session')?.value;
    
    if (!sessionId) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      );
    }
    
    const session = await getUserSession(sessionId);
    if (!session) {
      return NextResponse.json(
        { error: 'Sessão expirada' },
        { status: 401 }
      );
    }
    
    // Obter dados da ordem
    const orderData = await request.json();
    
    console.log(`📈 Executando ordem para ${session.username}:`, orderData);
    
    // Validação básica
    if (!orderData.accountId || !orderData.symbol || !orderData.qty) {
      return NextResponse.json(
        { error: 'Dados da ordem incompletos' },
        { status: 400 }
      );
    }
    
    // Executar ordem no Tradovate
    const orderResponse = await fetch(`${API_BASE_URL}/order/placeorder`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.accessToken}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        accountId: orderData.accountId,
        contractId: orderData.contractId,
        action: orderData.action || 'Buy', // Buy ou Sell
        orderQty: orderData.qty,
        orderType: orderData.orderType || 'Market',
        price: orderData.price, // Para ordens limite
        stopPrice: orderData.stopPrice, // Para ordens stop
        isAutomated: true, // Importante: marcar como automatizada
      }),
    });
    
    const responseText = await orderResponse.text();
    
    if (!orderResponse.ok) {
      console.error('❌ Erro ao executar ordem:', responseText);
      
      return NextResponse.json(
        { 
          error: 'Erro ao executar ordem',
          details: responseText
        },
        { status: orderResponse.status }
      );
    }
    
    const orderResult = JSON.parse(responseText);
    
    console.log('✅ Ordem executada com sucesso:', orderResult.id);
    
    // Log para auditoria
    logOrderExecution(session.username, orderData, orderResult);
    
    return NextResponse.json({
      success: true,
      orderId: orderResult.id,
      status: orderResult.status,
      message: 'Ordem executada com sucesso',
      details: orderResult,
    });
    
  } catch (error) {
    console.error('❌ Erro ao processar ordem:', error);
    
    return NextResponse.json(
      { 
        error: 'Erro interno do servidor',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

// GET - Listar ordens
export async function GET(request) {
  try {
    const cookieStore = cookies();
    const sessionId = cookieStore.get('tradovate_session')?.value;
    
    if (!sessionId) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      );
    }
    
    const session = await getUserSession(sessionId);
    if (!session) {
      return NextResponse.json(
        { error: 'Sessão expirada' },
        { status: 401 }
      );
    }
    
    // Obter parâmetros de query
    const { searchParams } = new URL(request.url);
    const accountId = searchParams.get('accountId');
    
    if (!accountId) {
      return NextResponse.json(
        { error: 'AccountId é obrigatório' },
        { status: 400 }
      );
    }
    
    // Buscar ordens
    const ordersResponse = await fetch(
      `${API_BASE_URL}/order/list?accountId=${accountId}`,
      {
        headers: {
          'Authorization': `Bearer ${session.accessToken}`,
          'Accept': 'application/json',
        },
      }
    );
    
    if (!ordersResponse.ok) {
      return NextResponse.json(
        { error: 'Erro ao buscar ordens' },
        { status: 500 }
      );
    }
    
    const orders = await ordersResponse.json();
    
    return NextResponse.json({
      success: true,
      orders: orders,
      count: orders.length,
    });
    
  } catch (error) {
    console.error('❌ Erro ao buscar ordens:', error);
    
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// Função para log de auditoria (importante para compliance!)
function logOrderExecution(username, orderData, result) {
  const logEntry = {
    timestamp: new Date().toISOString(),
    username: username,
    action: 'ORDER_EXECUTED',
    orderData: orderData,
    result: {
      orderId: result.id,
      status: result.status,
    },
  };
  
  // Em produção: guardar em base de dados
  console.log('📝 AUDIT LOG:', JSON.stringify(logEntry));
  
  // Também pode enviar para serviço de logging externo
  // await sendToLoggingService(logEntry);
}
