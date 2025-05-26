import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const body = await request.json();
    const { action, environment, ...params } = body;

    const API_URLS = {
      demo: 'https://demo.tradovateapi.com/v1',
      live: 'https://live.tradovateapi.com/v1'
    };

    let url = API_URLS[environment || 'demo'];
    let options = {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      }
    };

    // Configurar requisição baseada na ação
    switch (action) {
      case 'login':
        url += '/auth/accesstokenrequest';
        options.method = 'POST';
        options.body = JSON.stringify({
          name: params.username,
          password: params.password,
          appId: 'GeeksTrader',
          appVersion: '1.0',
          cid: 8,
          sec: '2c91c5d9-4c29-4b35-8c7a-b6ef0e3b0b3f'
        });
        break;

      case 'accounts':
        url += '/account/list';
        options.headers['Authorization'] = `Bearer ${params.token}`;
        break;

      case 'balance':
        url += `/account/item?id=${params.accountId}`;
        options.headers['Authorization'] = `Bearer ${params.token}`;
        break;

      default:
        throw new Error('Ação inválida');
    }

    // Fazer requisição para Tradovate
    const response = await fetch(url, options);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Erro na API Tradovate');
    }

    return NextResponse.json(data);

  } catch (error) {
    console.error('Erro no proxy Tradovate:', error);
    return NextResponse.json(
      { error: error.message || 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
