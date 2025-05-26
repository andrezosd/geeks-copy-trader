'use client'

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { Alert, AlertDescription } from './ui/alert';
import { Badge } from './ui/badge';
import { 
  Copy,
  CheckCircle,
  AlertCircle,
  Play,
  Pause,
  HelpCircle,
  User,
  Users,
  Info,
  ChevronLeft,
  ChevronRight,
  Link2,
  RefreshCw,
  ChevronDown,
  Plus,
  ExternalLink,
  Key,
  X,
  UserPlus,
  History,
  XCircle
} from 'lucide-react';
import { PickMyTradeLogin } from '@/components/pickmytrade-login';

const CopyTradingComponent = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [showConnectionModal, setShowConnectionModal] = useState(false);
  const [showTradeHistory, setShowTradeHistory] = useState(false);
  const [isClosingTrades, setIsClosingTrades] = useState(false);
  
  // NOVOS estados para Tradovate real
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isConnectedToTradovate, setIsConnectedToTradovate] = useState(false);
  const [tradovateAccounts, setTradovateAccounts] = useState([]);
  const [connectedUsername, setConnectedUsername] = useState('');
  
  const [currentUser] = useState({
    id: 1,
    username: '',
    apiKey: '',
    accounts: []
  });
  
  const [selectedMasterAccount, setSelectedMasterAccount] = useState('');
  const [followers, setFollowers] = useState([]);

  // DEBUG - Ver estados
  useEffect(() => {
    console.log('🔍 Estados atuais:', {
      isConnectedToTradovate,
      tradovateAccounts,
      connectedUsername,
      showLoginModal
    });
  }, [isConnectedToTradovate, tradovateAccounts, connectedUsername, showLoginModal]);

  const connectTradovate = async () => {
    // Função não usada mais - agora usamos o modal
    console.log('Função antiga - usar modal agora');
  };

  const removeFollower = (id) => {
    setFollowers(followers.filter(f => f.id !== id));
  };

  const updateFollower = (id, field, value) => {
    setFollowers(followers.map(f => 
      f.id === id ? { ...f, [field]: value } : f
    ));
  };

  // NOVA função para gerir conexão Tradovate
  const handleConnectionChange = (connectionData) => {
    console.log('🔄 handleConnectionChange chamada com:', connectionData);
    
    if (connectionData.connected) {
      console.log('✅ Conectado! Dados:', connectionData);
      setIsConnectedToTradovate(true);
      setTradovateAccounts(connectionData.accounts || []);
      setConnectedUsername(connectionData.username || '');
      setShowLoginModal(false);
      
      // Se tiver contas, configurar a primeira como master
      if (connectionData.accounts && connectionData.accounts.length > 0) {
        console.log('📊 Contas encontradas:', connectionData.accounts);
        setSelectedMasterAccount(connectionData.accounts[0].id);
      } else {
        console.log('❌ Nenhuma conta encontrada!');
      }
    } else {
      console.log('❌ Desconectado');
      setIsConnectedToTradovate(false);
      setTradovateAccounts([]);
      setConnectedUsername('');
    }
  };

  const startCopyTrading = () => {
    setIsRunning(true);
  };

  const stopCopyTrading = () => {
    setIsRunning(false);
  };

  const closeAllTrades = async () => {
    if (window.confirm('Tem certeza que deseja fechar todos os trades abertos? Esta ação não pode ser desfeita.')) {
      setIsClosingTrades(true);
      setTimeout(() => {
        setIsClosingTrades(false);
        alert('Todos os trades foram fechados com sucesso!');
      }, 1500);
    }
  };

  // Trade History Modal - Simplified
  const TradeHistoryModal = () => {
    const [tradeHistory] = useState([
      {
        id: 1,
        date: '2025-05-17',
        time: '09:45:32',
        instrument: 'ES.FUT',
        action: 'BUY',
        quantity: 2,
        entryPrice: 5325.50,
        exitPrice: 5342.75,
        profitLoss: 34.50,
        status: 'CLOSED',
      },
      {
        id: 2,
        date: '2025-05-17',
        time: '11:22:05',
        instrument: 'NQ.FUT',
        action: 'SELL',
        quantity: 1,
        entryPrice: 19250.75,
        exitPrice: 19180.50,
        profitLoss: 70.25,
        status: 'CLOSED',
      },
      {
        id: 3,
        date: '2025-05-12',
        time: '08:15:43',
        instrument: 'CL.FUT',
        action: 'BUY',
        quantity: 3,
        entryPrice: 82.45,
        exitPrice: 83.20,
        profitLoss: 2250.00,
        status: 'CLOSED',
      },
      {
        id: 4,
        date: '2025-05-05',
        time: '10:32:19',
        instrument: 'GC.FUT',
        action: 'SELL',
        quantity: 1,
        entryPrice: 2540.80,
        exitPrice: null,
        profitLoss: null,
        status: 'OPEN',
      },
      {
        id: 5,
        date: '2025-04-28',
        time: '14:22:47',
        instrument: 'RTY.FUT',
        action: 'BUY',
        quantity: 2,
        entryPrice: 2180.30,
        exitPrice: 2196.50,
        profitLoss: 324.00,
        status: 'CLOSED',
      }
    ]);

    const [filterStatus, setFilterStatus] = useState('all');
    
    const filteredTrades = tradeHistory.filter(trade => {
      if (filterStatus !== 'all' && 
         ((filterStatus === 'open' && trade.status !== 'OPEN') || 
          (filterStatus === 'closed' && trade.status !== 'CLOSED'))) {
        return false;
      }
      return true;
    });

    const getStatusColor = (status) => {
      switch(status) {
        case 'OPEN': return 'text-blue-600 bg-blue-50 border-blue-200';
        case 'CLOSED': return 'text-green-600 bg-green-50 border-green-200';
        default: return 'text-gray-600 bg-gray-50 border-gray-200';
      }
    };

    const getActionColor = (action) => {
      switch(action) {
        case 'BUY': return 'text-green-600 bg-green-50';
        case 'SELL': return 'text-red-600 bg-red-50';
        default: return 'text-gray-600 bg-gray-50';
      }
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl mx-4 max-h-[90vh] overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-6 rounded-t-xl">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white flex items-center">
                <History className="h-6 w-6 mr-3" />
                Histórico de Trades
              </h2>
              <div className="flex items-center space-x-2">
                <div className="bg-white bg-opacity-20 rounded-lg p-1">
                  <div className="flex rounded-md overflow-hidden">
                    <button 
                      onClick={() => setFilterStatus('all')} 
                      className={`px-3 py-1 text-sm font-medium ${filterStatus === 'all' ? 'bg-white text-blue-600' : 'text-white'}`}
                    >
                      Todos
                    </button>
                    <button 
                      onClick={() => setFilterStatus('open')} 
                      className={`px-3 py-1 text-sm font-medium ${filterStatus === 'open' ? 'bg-white text-blue-600' : 'text-white'}`}
                    >
                      Abertos
                    </button>
                    <button 
                      onClick={() => setFilterStatus('closed')} 
                      className={`px-3 py-1 text-sm font-medium ${filterStatus === 'closed' ? 'bg-white text-blue-600' : 'text-white'}`}
                    >
                      Fechados
                    </button>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowTradeHistory(false)}
                  className="text-white hover:bg-white/20"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
          
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
            {filteredTrades.length === 0 ? (
              <div className="text-center py-10">
                <h3 className="text-lg font-medium text-gray-700">Nenhum trade encontrado</h3>
                <p className="text-gray-500 mt-1">
                  Não há trades que correspondam aos filtros selecionados.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full table-auto">
                  <thead>
                    <tr className="border-b text-left bg-gray-50">
                      <th className="py-3 px-3 font-medium">Data/Hora</th>
                      <th className="py-3 px-3 font-medium">Instrumento</th>
                      <th className="py-3 px-3 font-medium">Direção</th>
                      <th className="py-3 px-3 font-medium">Qtd</th>
                      <th className="py-3 px-3 font-medium">Entrada</th>
                      <th className="py-3 px-3 font-medium">Saída</th>
                      <th className="py-3 px-3 font-medium">Lucro/Perda</th>
                      <th className="py-3 px-3 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTrades.map((trade) => (
                      <tr key={trade.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-3">
                          <div className="text-sm font-medium">{trade.date}</div>
                          <div className="text-xs text-gray-500">{trade.time}</div>
                        </td>
                        <td className="py-3 px-3 font-medium">{trade.instrument}</td>
                        <td className="py-3 px-3">
                          <Badge className={getActionColor(trade.action)}>
                            {trade.action}
                          </Badge>
                        </td>
                        <td className="py-3 px-3">{trade.quantity}</td>
                        <td className="py-3 px-3">{trade.entryPrice}</td>
                        <td className="py-3 px-3">{trade.exitPrice || '-'}</td>
                        <td className="py-3 px-3">
                          {trade.profitLoss !== null ? (
                            <span className={trade.profitLoss >= 0 ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
                              ${trade.profitLoss.toFixed(2)}
                            </span>
                          ) : '-'}
                        </td>
                        <td className="py-3 px-3">
                          <Badge variant="outline" className={getStatusColor(trade.status)}>
                            {trade.status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Connection Modal - Simplificado apenas para subcontas
  const ConnectionModal = () => {
    const [selectedAccount, setSelectedAccount] = useState('');
    const [multiplier, setMultiplier] = useState('1');
    
    const handleAddLocalFollower = () => {
      const newFollower = {
        id: Date.now(),
        type: 'local',
        account: selectedAccount,
        multiplier: multiplier,
        active: true,
      };
      setFollowers([...followers, newFollower]);
      setShowConnectionModal(false);
    };
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 rounded-t-xl">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white flex items-center">
                <UserPlus className="h-6 w-6 mr-3" />
                Adicionar Subconta Seguidora
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowConnectionModal(false)}
                className="text-white hover:bg-white/20"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>
          
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">Configurar Subconta</h3>
            
            <div className="space-y-4">
              <div>
                <Label>Selecione a Subconta</Label>
                <div className="relative mt-1">
                  <select
                    value={selectedAccount}
                    onChange={(e) => setSelectedAccount(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer"
                  >
                    <option value="">Escolha uma conta...</option>
                    {tradovateAccounts
                      .filter(acc => acc.id !== selectedMasterAccount)
                      .map((account) => (
                        <option key={account.id} value={account.id}>
                          {account.name}
                        </option>
                      ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-3 h-5 w-5 text-gray-400 pointer-events-none" />
                </div>
              </div>
              
              <div>
                <Label>Multiplicador de Posição</Label>
                <Input
                  type="number"
                  value={multiplier}
                  onChange={(e) => setMultiplier(e.target.value)}
                  step="0.1"
                  min="0.1"
                  max="10"
                  className="mt-1"
                />
                <p className="text-xs text-gray-600 mt-1">
                  Os trades serão multiplicados por este valor
                </p>
              </div>
              
              <Button
                onClick={handleAddLocalFollower}
                disabled={!selectedAccount}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                Adicionar Subconta
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {showConnectionModal && <ConnectionModal />}
      {showTradeHistory && <TradeHistoryModal />}
      
      {/* Header com gradiente melhorado */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-800 shadow-lg">
        <div className="max-w-6xl mx-auto px-6 py-5">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center">
              <div className="flex items-center">
                <div className="text-white">
                  <div className="text-3xl font-bold tracking-tight">
                    Geeks Trader
                  </div>
                </div>
              </div>
            </div>
            
            {/* Botões de Ação */}
            <div className="flex items-center space-x-4">
              {!isConnectedToTradovate ? (
                <button
                  onClick={() => {
                    console.log('🔵 Abrindo modal de login');
                    setShowLoginModal(true);
                  }}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all bg-gray-800 hover:bg-gray-700 text-white"
                >
                  <Link2 className="h-5 w-5" />
                  <span>Conectar ao Tradovate</span>
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <Badge className="bg-gradient-to-r from-green-100 to-green-200 text-green-800 shadow-sm px-4 py-2 rounded-lg text-sm font-medium">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Tradovate Conectado
                    {connectedUsername && (
                      <span className="text-xs opacity-75 ml-1">
                        ({connectedUsername})
                      </span>
                    )}
                  </Badge>
                  <button
                    onClick={() => {
                      console.log('🔴 Desconectando...');
                      setIsConnectedToTradovate(false);
                      setTradovateAccounts([]);
                      setConnectedUsername('');
                      setSelectedMasterAccount('');
                    }}
                    className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded text-sm"
                  >
                    Desconectar
                  </button>
                </div>
              )}
              
              {/* BOTÃO DE TESTE */}
              <button
                onClick={() => {
                  console.log('🧪 Teste com dados fictícios');
                  handleConnectionChange({
                    connected: true,
                    username: 'DemoUser',
                    accounts: [
                      { id: 'DEMO001', name: 'Conta Demo Principal', balance: 100000 },
                      { id: 'DEMO002', name: 'Conta Demo Secundária', balance: 50000 }
                    ]
                  });
                }}
                className="bg-yellow-500 hover:bg-yellow-600 text-black px-3 py-2 rounded text-sm font-medium"
              >
                🧪 Testar
              </button>

              {/* BOTÃO RESET - Para limpar tudo */}
              <button
                onClick={() => {
                  setIsConnectedToTradovate(false);
                  setTradovateAccounts([]);
                  setConnectedUsername('');
                  setSelectedMasterAccount('');
                  setFollowers([]);
                  localStorage.clear();
                  alert('✅ Sistema resetado! Recarregue a página.');
                  window.location.reload();
                }}
                className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded text-sm font-medium"
              >
                🔄 Reset
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6">
        {/* Status Card - Melhorada */}
        <Card className="mb-6 border-0 shadow-xl rounded-xl overflow-hidden">
          <div className="bg-gradient-to-r from-gray-50 to-slate-50 p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className={`p-4 rounded-full ${isRunning ? 'bg-gradient-to-r from-green-100 to-green-200' : 'bg-gradient-to-r from-gray-100 to-slate-200'} shadow-sm`}>
                  <Play className={`h-7 w-7 ${isRunning ? 'text-green-600' : 'text-gray-600'}`} />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-800">
                    {isRunning ? 'Copy Trading Ativo' : 'Copy Trading Parado'}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {isRunning ? 'Copiando trades em tempo real' : 'Clique em iniciar para começar'}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Button 
                  size="lg"
                  onClick={isRunning ? stopCopyTrading : startCopyTrading}
                  className={`text-white shadow-lg px-6 rounded-lg ${
                    isRunning 
                      ? 'bg-red-600 hover:bg-red-700' 
                      : 'bg-green-600 hover:bg-green-700'
                  }`}
                >
                  {isRunning ? (
                    <>
                      <Pause className="h-5 w-5 mr-2" />
                      <span className="font-medium">Parar</span>
                    </>
                  ) : (
                    <>
                      <Play className="h-5 w-5 mr-2" />
                      <span className="font-medium">Iniciar</span>
                    </>
                  )}
                </Button>
                
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => setShowTradeHistory(true)}
                  className="border-blue-500 text-blue-600 hover:bg-blue-50 rounded-lg px-6 shadow-sm transition-all duration-200"
                >
                  <History className="h-5 w-5 mr-2" />
                  <span className="font-medium">Histórico</span>
                </Button>
                
                <Button
                  size="lg"
                  variant="outline"
                  onClick={closeAllTrades}
                  disabled={isClosingTrades}
                  className="border-red-500 text-red-600 hover:bg-red-50 rounded-lg px-6 shadow-sm transition-all duration-200"
                >
                  {isClosingTrades ? (
                    <>
                      <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
                      <span className="font-medium">Fechando...</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="h-5 w-5 mr-2" />
                      <span className="font-medium">Fechar Trades</span>
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Master Account Section */}
        <div className="grid gap-6 mb-6">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  <User className="h-5 w-5 text-blue-600" />
                  <span>Conta Principal (Master)</span>
                </CardTitle>
                <Badge variant="secondary">Passo 1</Badge>
              </div>
              <CardDescription>
                Esta é a conta que faz os trades que serão copiados
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="master-account">Conta Principal</Label>
                  {isConnectedToTradovate ? (
                    <div className="relative mt-1">
                      <select
                        id="master-account"
                        value={selectedMasterAccount}
                        onChange={(e) => {
                          console.log('📝 Conta selecionada:', e.target.value);
                          setSelectedMasterAccount(e.target.value);
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer"
                      >
                        <option value="">Selecione uma conta</option>
                        {tradovateAccounts && tradovateAccounts.length > 0 ? (
                          tradovateAccounts.map((account) => (
                            <option key={account.id} value={account.id}>
                              {account.name} - ${(account.balance || 0).toLocaleString()}
                            </option>
                          ))
                        ) : (
                          <option value="" disabled>Nenhuma conta encontrada</option>
                        )}
                      </select>
                      <ChevronDown className="absolute right-3 top-3 h-5 w-5 text-gray-400 pointer-events-none" />
                      
                      {/* Debug info */}
                      <div className="mt-2 text-xs text-gray-500">
                        {tradovateAccounts.length} conta(s) disponível(is)
                      </div>
                    </div>
                  ) : (
                    <Input
                      id="master-account"
                      placeholder="Conecte o Tradovate primeiro"
                      value=""
                      disabled={true}
                      className="mt-1"
                    />
                  )}
                </div>
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <CheckCircle className={`h-5 w-5 ${selectedMasterAccount ? 'text-green-600' : 'text-gray-400'}`} />
                  <span className={`text-sm ${selectedMasterAccount ? 'text-green-600' : 'text-gray-600'}`}>
                    {selectedMasterAccount ? 'Conta configurada e pronta' : 'Aguardando configuração'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Followers Section */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  <Users className="h-5 w-5 text-purple-600" />
                  <span>Contas Seguidoras</span>
                </CardTitle>
                <Badge variant="secondary">Passo 2</Badge>
              </div>
              <CardDescription>
                Contas que copiarão os trades automaticamente
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Local Followers */}
                {followers.map((follower, index) => (
                  <div key={follower.id} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4 text-blue-600" />
                        <span className="font-medium">Subconta {index + 1}</span>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeFollower(follower.id)}
                        className="text-red-600"
                      >
                        Remover
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs">Conta</Label>
                        <Input
                          value={follower.account}
                          disabled
                          className="mt-1 bg-white"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Multiplicador</Label>
                        <Input
                          type="number"
                          step="0.1"
                          value={follower.multiplier}
                          onChange={(e) => updateFollower(follower.id, 'multiplier', e.target.value)}
                          className="mt-1"
                        />
                      </div>
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={follower.active}
                          onCheckedChange={(checked) => updateFollower(follower.id, 'active', checked)}
                        />
                        <Label className="text-sm">Ativa</Label>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        Subconta Local
                      </Badge>
                    </div>
                  </div>
                ))}
                
                {/* Add Account Button */}
                <Button 
                  onClick={() => setShowConnectionModal(true)}
                  variant="outline"
                  className="w-full bg-gradient-to-r from-blue-50 to-purple-50 hover:from-blue-100 hover:to-purple-100"
                  disabled={!isConnectedToTradovate || tradovateAccounts.length < 2}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  {!isConnectedToTradovate 
                    ? 'Conecte ao Tradovate primeiro' 
                    : tradovateAccounts.length < 2
                    ? 'Precisa de mais contas'
                    : 'Adicionar Subconta Seguidora'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Guide */}
        <Card className="mt-6 border-0 shadow-lg bg-gradient-to-r from-blue-50 to-purple-50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Info className="h-5 w-5 text-blue-600" />
              <span>Guia Rápido</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-4 gap-4">
              <div className="flex items-start space-x-3">
                <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0">
                  1
                </div>
                <div>
                  <h4 className="font-semibold">Conecte o Tradovate</h4>
                  <p className="text-sm text-gray-600">
                    Conecte sua conta principal
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="bg-purple-600 text-white rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0">
                  2
                </div>
                <div>
                  <h4 className="font-semibold">Configure a Master</h4>
                  <p className="text-sm text-gray-600">
                    Escolha a conta principal
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="bg-indigo-600 text-white rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0">
                  3
                </div>
                <div>
                  <h4 className="font-semibold">Adicione Seguidoras</h4>
                  <p className="text-sm text-gray-600">
                    Conecte contas locais ou externas
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="bg-green-600 text-white rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0">
                  4
                </div>
                <div>
                  <h4 className="font-semibold">Inicie o Sistema</h4>
                  <p className="text-sm text-gray-600">
                    Clique em Iniciar e relaxe!
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Safety Alert */}
        <Alert className="mt-6 bg-yellow-50 border-yellow-200">
          <AlertCircle className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-800">
            <strong>Importante:</strong> O copy trading envolve riscos. Certifique-se de entender 
            completamente como funciona antes de usar com dinheiro real. Recomendamos começar 
            com contas demo. Nunca compartilhe suas credenciais de login do Tradovate.
          </AlertDescription>
        </Alert>
      </div>

      {/* Modal de Login Tradovate - NOVO! */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="relative">
            {/* Botão Fechar */}
            <button
              onClick={() => setShowLoginModal(false)}
              className="absolute -top-3 -right-3 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 shadow-lg z-10"
            >
              <X className="h-5 w-5" />
            </button>
            
            {/* Componente de Login */}
            <PickMyTradeLogin 
              onConnectionChange={handleConnectionChange}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default CopyTradingComponent;
