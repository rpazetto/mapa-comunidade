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
