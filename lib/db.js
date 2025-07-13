const mysql = require('mysql2/promise')

// Configuração base para pools
const poolConfig = {
  waitForConnections: true,
  connectionLimit: 5,
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

// Pool para Community Mapper
let poolCM
try {
  if (process.env.DATABASE_URL_CM) {
    poolCM = mysql.createPool({
      uri: process.env.DATABASE_URL_CM,
      ...poolConfig
    })
    console.log('✅ Pool CM criado com sucesso')
  } else {
    console.warn('⚠️ DATABASE_URL_CM não encontrada')
  }
} catch (error) {
  console.error('❌ Erro ao criar pool CM:', error.message)
}

// Pool para Mapa Comunidade  
let poolMC
try {
  if (process.env.DATABASE_URL_MC) {
    poolMC = mysql.createPool({
      uri: process.env.DATABASE_URL_MC,
      ...poolConfig
    })
    console.log('✅ Pool MC criado com sucesso')
  } else {
    console.warn('⚠️ DATABASE_URL_MC não encontrada')
  }
} catch (error) {
  console.error('❌ Erro ao criar pool MC:', error.message)
}

// Função para testar conexões
async function testConnections() {
  console.log('🔍 Testando conexões...')
  
  if (poolCM) {
    try {
      const conn = await poolCM.getConnection()
      const [rows] = await conn.execute('SELECT DATABASE() as db')
      console.log('✅ CM conectado:', rows[0].db)
      conn.release()
    } catch (error) {
      console.error('❌ Erro CM:', error.message)
    }
  }

  if (poolMC) {
    try {
      const conn = await poolMC.getConnection()
      const [rows] = await conn.execute('SELECT DATABASE() as db')
      console.log('✅ MC conectado:', rows[0].db)
      conn.release()
    } catch (error) {
      console.error('❌ Erro MC:', error.message)
    }
  }
}

// Função para executar queries CM
async function executeQueryCM(query, params = []) {
  if (!poolCM) {
    throw new Error('Pool CM não inicializado')
  }
  try {
    const [results] = await poolCM.execute(query, params)
    return results
  } catch (error) {
    console.error('❌ Query CM falhou:', error.message)
    throw error
  }
}

// Função para executar queries MC
async function executeQueryMC(query, params = []) {
  if (!poolMC) {
    throw new Error('Pool MC não inicializado')
  }
  try {
    const [results] = await poolMC.execute(query, params)
    return results
  } catch (error) {
    console.error('❌ Query MC falhou:', error.message)
    throw error
  }
}

// Export CommonJS
module.exports = {
  dbCM: poolCM,
  dbMC: poolMC,
  testConnections,
  executeQueryCM,
  executeQueryMC
}
