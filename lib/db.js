import mysql from 'mysql2/promise'

// Configuração para DUAS databases
const baseConfig = {
  host: process.env.MYSQL_HOST,
  port: parseInt(process.env.MYSQL_PORT || '3306'),
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  waitForConnections: true,
  connectionLimit: 5, // Dividir conexões entre as duas databases
  maxIdle: 5,
  idleTimeout: 60000,
  queueLimit: 0,
  acquireTimeout: 60000,
  timeout: 60000,
  reconnect: true,
  ssl: {
    rejectUnauthorized: false
  }
}

// Pool para Community Mapper (CM)
let poolCM
if (process.env.DATABASE_URL_CM) {
  poolCM = mysql.createPool(process.env.DATABASE_URL_CM)
} else {
  // Configuração específica para community_mapper
  poolCM = mysql.createPool({
    ...baseConfig,
    database: 'community_mapper'
  })
}

// Pool para Mapa Comunidade (MC)  
let poolMC
if (process.env.DATABASE_URL_MC) {
  poolMC = mysql.createPool(process.env.DATABASE_URL_MC)
} else {
  // Configuração específica para mapa_comunidade
  poolMC = mysql.createPool({
    ...baseConfig,
    database: 'mapa_comunidade'
  })
}
}

// Export dos pools
export const dbCM = poolCM
export const dbMC = poolMC
export default poolCM // Mantém compatibilidade

// Função para testar AMBAS as conexões
export async function testConnections() {
  console.log('🔍 Testando conexões com as duas databases...')
  
  // Teste database CM
  try {
    const connectionCM = await poolCM.getConnection()
    console.log('✅ Conexão CM bem-sucedida!')
    
    const [rowsCM] = await connectionCM.execute('SELECT DATABASE() as current_db')
    console.log('📊 Database CM atual:', rowsCM[0].current_db)
    
    connectionCM.release()
  } catch (error) {
    console.error('❌ Erro na conexão CM:', error.message)
  }

  // Teste database MC
  try {
    const connectionMC = await poolMC.getConnection()
    console.log('✅ Conexão MC bem-sucedida!')
    
    const [rowsMC] = await connectionMC.execute('SELECT DATABASE() as current_db')
    console.log('📊 Database MC atual:', rowsMC[0].current_db)
    
    connectionMC.release()
  } catch (error) {
    console.error('❌ Erro na conexão MC:', error.message)
  }

  // Mostrar configuração atual
  console.log('🔧 Configuração atual:', {
    host: process.env.MYSQL_HOST,
    port: process.env.MYSQL_PORT,
    user: process.env.MYSQL_USER,
    database_url_cm: process.env.DATABASE_URL_CM ? 'CONFIGURADA' : 'NÃO ENCONTRADA',
    database_url_mc: process.env.DATABASE_URL_MC ? 'CONFIGURADA' : 'NÃO ENCONTRADA'
  })
}

// Funções para executar queries em databases específicas
export async function executeQueryCM(query, params = []) {
  try {
    const [results] = await poolCM.execute(query, params)
    return results
  } catch (error) {
    console.error('❌ Erro na query CM:', error.message)
    throw error
  }
}

export async function executeQueryMC(query, params = []) {
  try {
    const [results] = await poolMC.execute(query, params)
    return results
  } catch (error) {
    console.error('❌ Erro na query MC:', error.message)
    throw error
  }
}
