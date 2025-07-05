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

// Funções para tags
export async function getPersonById(id: string) {
  try {
    const [rows] = await dbCM.execute(
      'SELECT * FROM people WHERE id = ?',
      [id]
    );
    return (rows as any[])[0] || null;
  } catch (error) {
    console.error('Error getting person by id:', error);
    return null;
  }
}

export async function getTagsByUserId(userId: string) {
  try {
    const [rows] = await dbCM.execute(
      'SELECT DISTINCT t.* FROM tags t JOIN person_tags pt ON t.id = pt.tag_id JOIN people p ON pt.person_id = p.id WHERE p.user_id = ?',
      [userId]
    );
    return rows as any[];
  } catch (error) {
    console.error('Error getting tags by user id:', error);
    return [];
  }
}

export async function getPersonTags(personId: string) {
  try {
    const [rows] = await dbCM.execute(
      'SELECT t.* FROM tags t JOIN person_tags pt ON t.id = pt.tag_id WHERE pt.person_id = ?',
      [personId]
    );
    return rows as any[];
  } catch (error) {
    console.error('Error getting person tags:', error);
    return [];
  }
}

export async function addTagToPerson(personId: string, tagId: string) {
  try {
    await dbCM.execute(
      'INSERT INTO person_tags (person_id, tag_id) VALUES (?, ?)',
      [personId, tagId]
    );
    return true;
  } catch (error) {
    console.error('Error adding tag to person:', error);
    return false;
  }
}

export async function createTag(name: string, userId: string) {
  try {
    const [result] = await dbCM.execute(
      'INSERT INTO tags (name, user_id) VALUES (?, ?)',
      [name, userId]
    ) as any;
    return { id: result.insertId, name, user_id: userId };
  } catch (error) {
    console.error('Error creating tag:', error);
    return null;
  }
}

export async function updateTag(id: string, name: string) {
  try {
    await dbCM.execute(
      'UPDATE tags SET name = ? WHERE id = ?',
      [name, id]
    );
    return true;
  } catch (error) {
    console.error('Error updating tag:', error);
    return false;
  }
}

export async function removeTagFromPerson(personId: string, tagId: string) {
  try {
    await dbCM.execute(
      'DELETE FROM person_tags WHERE person_id = ? AND tag_id = ?',
      [personId, tagId]
    );
    return true;
  } catch (error) {
    console.error('Error removing tag from person:', error);
    return false;
  }
}

export async function deleteTag(id: string) {
  try {
    await dbCM.execute(
      'DELETE FROM tags WHERE id = ?',
      [id]
    );
    return true;
  } catch (error) {
    console.error('Error deleting tag:', error);
    return false;
  }
}
