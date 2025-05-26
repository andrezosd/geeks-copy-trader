// Gestão de Sessões - Armazenamento Temporário
// Ficheiro: app/api/tradovate-proxy/session-store.js

// Em produção, usar Redis ou base de dados!
// Este é apenas para desenvolvimento/demonstração

// Mapa global para armazenar sessões
const sessions = new Map();

// Função para guardar sessão
export function saveUserSession(sessionId, sessionData) {
  sessions.set(sessionId, {
    ...sessionData,
    lastActivity: Date.now(),
  });
  
  console.log(`💾 Sessão guardada: ${sessionId}`);
  console.log(`📊 Total de sessões ativas: ${sessions.size}`);
}

// Função para obter sessão
export function getUserSession(sessionId) {
  const session = sessions.get(sessionId);
  
  if (!session) {
    console.log(`❌ Sessão não encontrada: ${sessionId}`);
    return null;
  }
  
  // Verificar se expirou
  if (session.expiresAt && session.expiresAt < Date.now()) {
    console.log(`⏰ Sessão expirada: ${sessionId}`);
    sessions.delete(sessionId);
    return null;
  }
  
  // Atualizar última atividade
  session.lastActivity = Date.now();
  
  return session;
}

// Função para remover sessão
export function removeUserSession(sessionId) {
  const removed = sessions.delete(sessionId);
  if (removed) {
    console.log(`🗑️ Sessão removida: ${sessionId}`);
  }
  return removed;
}

// Função para limpar sessões expiradas
export function cleanupExpiredSessions() {
  const now = Date.now();
  let cleaned = 0;
  
  for (const [sessionId, session] of sessions.entries()) {
    // Remover se expirou ou inativo há mais de 2 horas
    if (
      (session.expiresAt && session.expiresAt < now) ||
      (session.lastActivity && now - session.lastActivity > 2 * 60 * 60 * 1000)
    ) {
      sessions.delete(sessionId);
      cleaned++;
    }
  }
  
  if (cleaned > 0) {
    console.log(`🧹 ${cleaned} sessões expiradas removidas`);
  }
  
  return cleaned;
}

// Executar limpeza a cada 10 minutos
if (typeof window === 'undefined') { // Apenas no servidor
  setInterval(cleanupExpiredSessions, 10 * 60 * 1000);
}

// Função para obter estatísticas
export function getSessionStats() {
  const stats = {
    total: sessions.size,
    active: 0,
    inactive: 0,
  };
  
  const now = Date.now();
  const inactiveThreshold = 30 * 60 * 1000; // 30 minutos
  
  for (const session of sessions.values()) {
    if (now - session.lastActivity < inactiveThreshold) {
      stats.active++;
    } else {
      stats.inactive++;
    }
  }
  
  return stats;
}

// Exportar o mapa de sessões para uso no login route
export { sessions as userSessions };
