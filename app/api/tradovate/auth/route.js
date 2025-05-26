// Criar este arquivo em: app/api/tradovate/auth/route.js

export async function POST(request) {
  try {
    const { username, password, environment = 'demo' } = await request.json();

    // URLs oficiais do Tradovate
    const TRADOVATE_URLS = {
      demo: {
        auth: 'https://demo.tradovateapi.com/v1/auth/accesstokenrequest',
        api: 'https://demo.tradovateapi.com/v1'
      },
      live: {
        auth: 'https://live.tradovateapi.com/v1/auth/accesstokenrequest',
        api: 'https://live.tradovateapi.com/v1'
      }
    };

    // Passo 1: Autenticar no Tradovate
    console.log('🔐 Tentando autenticar no Tradovate...');
    
    const authResponse = await fetch(TRADOVATE_URLS[environment].auth, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: username,
        password: password,
        appId: 'GeeksTrader',
        appVersion: '1.0',
        cid: 8,
        sec: '28d546ff-ad97-4d2c-9600-1ed4e73d8b6f' // Demo secret
      })
    });

    if (!authResponse.ok) {
      const error = await authResponse.text();
      console.error('❌ Erro de autenticação:', error);
      return Response.json({
        success: false,
        error: 'Credenciais inválidas. Verifique seu usuário e senha.'
      }, { status: 401 });
    }

    const authData = await authResponse.json();
    const accessToken = authData.accessToken;
    
    console.log('✅ Autenticado com sucesso!');

    // Passo 2: Buscar contas do usuário
    const accountsResponse = await fetch(
      `${TRADOVATE_URLS[environment].api}/account/list`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/json',
        }
      }
    );

    if (!accountsResponse.ok) {
      console.error('❌ Erro ao buscar contas');
      return Response.json({
        success: false,
        error: 'Erro ao buscar contas'
      }, { status: 500 });
    }

    const accounts = await accountsResponse.json();
    console.log(`📊 ${accounts.length} contas encontradas`);

    // Passo 3: Buscar detalhes das contas (saldo, etc)
    const accountsWithDetails = await Promise.all(
      accounts.map(async (account) => {
        try {
          // Buscar cash balance
          const balanceResponse = await fetch(
            `${TRADOVATE_URLS[environment].api}/cashBalance/getcashbalance`,
            {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                accountId: account.id
              })
            }
          );

          let balance = 0;
          if (balanceResponse.ok) {
            const balanceData = await balanceResponse.json();
            balance = balanceData.amount || 0;
          }

          return {
            id: account.name,
            name: account.nickname || account.name,
            accountId: account.id,
            balance: balance,
            type: account.accountType,
            active: account.active
          };
        } catch (err) {
          console.error('Erro ao buscar detalhes da conta:', err);
          return {
            id: account.name,
            name: account.nickname || account.name,
            accountId: account.id,
            balance: 0,
            type: account.accountType,
            active: account.active
          };
        }
      })
    );

    // Retornar sucesso com dados reais
    return Response.json({
      success: true,
      data: {
        accessToken: accessToken,
        userId: authData.userId,
        username: username,
        accounts: accountsWithDetails,
        expiresIn: authData.expirationTime
      }
    });

  } catch (error) {
    console.error('❌ Erro geral:', error);
    return Response.json({
      success: false,
      error: 'Erro ao conectar com Tradovate. Tente novamente.'
    }, { status: 500 });
  }
}
