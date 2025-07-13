const mysql = require('mysql2/promise')

// Pool principal para community_mapper
const pool = mysql.createPool({
  uri: process.env.DATABASE_URL_CM || 
       'mysql://root:tfsriTGGWosBoJrJCEyUCCjISxLiQzfA@interchange.proxy.rlwy.net:47165/community_mapper',
  waitForConnections: true,
  connectionLimit: 10,
  ssl: { rejectUnauthorized: false }
})

// Função genérica para executar queries
async function executeQuery(query, params = []) {
  try {
    const [results] = await pool.execute(query, params)
    return results
  } catch (error) {
    console.error('❌ Erro executeQuery:', error.message)
    throw error
  }
}

// Função específica para community_mapper
async function executeQueryCM(query, params = []) {
  return executeQuery(query, params)
}

// Função placeholder para mapa_comunidade
async function executeQueryMC(query, params = []) {
  console.log('⚠️ executeQueryMC não implementado ainda')
  return []
}

// Função específica para autenticação
async function authenticateUser(email, password) {
  try {
    const [users] = await pool.execute(
      'SELECT id, email, password, name FROM users WHERE email = ?',
      [email]
    )
    return users[0] || null
  } catch (error) {
    console.error('❌ Erro na autenticação:', error.message)
    throw error
  }
}

module.exports = {
  executeQuery,
  executeQueryCM,
  executeQueryMC,
  authenticateUser,
  pool
}
