import mysql from 'mysql2/promise';

// Configuração para Railway
const isRailway = process.env.RAILWAY_ENVIRONMENT === 'production';

const dbConfigCM = {
  host: isRailway ? 'mysql.railway.internal' : 'interchange.proxy.rlwy.net',
  port: isRailway ? 3306 : 47165,
  user: 'root',
  password: process.env.MYSQL_PASSWORD || 'tfsriTGGWosBoJrJCEyUCCjISxLiQzfA',
  database: 'community_mapper',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

const dbConfigMC = {
  host: isRailway ? 'mysql.railway.internal' : 'interchange.proxy.rlwy.net',
  port: isRailway ? 3306 : 47165,
  user: 'root',
  password: process.env.MYSQL_PASSWORD || 'tfsriTGGWosBoJrJCEyUCCjISxLiQzfA',
  database: 'mapa_comunidade',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

export const dbCM = mysql.createPool(dbConfigCM);
export const dbMC = mysql.createPool(dbConfigMC);

// Função query genérica para compatibilidade
export async function query(sql: string, params?: any[], database: 'cm' | 'mc' = 'cm') {
  const pool = database === 'cm' ? dbCM : dbMC;
  const [results] = await pool.execute(sql, params);
  return results;
}

// Exportar pools individuais também
export { dbCM as poolCM, dbMC as poolMC };

// Interface User
interface User {
  id: string;
  email: string;
  name: string | null;
  password: string | null;
}

// Função para buscar usuário por email
export async function getUserByEmail(email: string): Promise<User | null> {
  try {
    const [rows] = await dbCM.execute(
      'SELECT id, email, name, password_hash as password FROM users WHERE email = ?',
      [email]
    );
    
    const users = rows as any[];
    
    if (users.length === 0) {
      console.log('Usuário não encontrado:', email);
      return null;
    }
    
    // Converter id para string já que o banco retorna INT mas a interface espera string
    const user = {
      id: users[0].id.toString(),
      email: users[0].email,
      name: users[0].name,
      password: users[0].password
    };
    
    console.log('Usuário encontrado:', user.email);
    return user;
    
  } catch (error) {
    console.error('Erro ao buscar usuário:', error);
    return null;
  }
}
