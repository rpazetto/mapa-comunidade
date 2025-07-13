const mysql = require('mysql2/promise')

// Configuração usando as variáveis do Railway
const pool = mysql.createPool({
  uri: process.env.DATABASE_URL_CM || 
       'mysql://root:tfsriTGGWosBoJrJCEyUCCjISxLiQzfA@interchange.proxy.rlwy.net:47165/community_mapper',
  waitForConnections: true,
  connectionLimit: 10,
  ssl: { rejectUnauthorized: false }
})

// Função para community_mapper
async function executeQueryCM(query, params = []) {
  try {
    const [results] = await pool.execute(query, params)
    return results
  } catch (error) {
    console.error('❌ Erro executeQueryCM:', error.message)
    throw error
  }
}

// Função para mapa_comunidade (fallback vazio por enquanto)
async function executeQueryMC(query, params = []) {
  console.log('⚠️ executeQueryMC não implementado ainda')
  return []
}

module.exports = {
  executeQueryCM,
  executeQueryMC
}
