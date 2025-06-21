import mysql from 'mysql2/promise';

// Criar pool de conexões
const pool = mysql.createPool({
  host: process.env.DATABASE_HOST || process.env.MYSQL_HOST || 'localhost',
  user: process.env.DATABASE_USER || process.env.MYSQL_USER || 'rodrigo',
  password: process.env.DATABASE_PASSWORD || process.env.MYSQL_PASSWORD || '884422',
  database: process.env.DATABASE_NAME || process.env.MYSQL_DATABASE || 'community_mapper',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Tipos TypeScript baseados nas tabelas
export interface User {
  id: number;
  email: string;
  name: string;
  password?: string;
  created_at?: Date;
  updated_at?: Date;
}

export interface Person {
  id: number;
  user_id: number;
  name: string;
  nickname?: string;
  birth_date?: Date | string; // Aceita Date ou string para flexibilidade
  gender?: 'M' | 'F' | 'O' | 'N';
  context: 'residencial' | 'profissional' | 'social' | 'servicos' | 'institucional' | 'politico';
  proximity: 'nucleo' | 'primeiro' | 'segundo' | 'terceiro' | 'periferia';
  importance?: number;
  trust_level?: number;
  influence_level?: number;
  occupation?: string;
  company?: string;
  position?: string;
  professional_class?: string;
  education_level?: 'fundamental' | 'medio' | 'superior' | 'pos_graduacao' | 'mestrado' | 'doutorado';
  income_range?: 'A' | 'B' | 'C' | 'D' | 'E';
  political_party?: string;
  political_position?: 'extrema_esquerda' | 'esquerda' | 'centro_esquerda' | 'centro' | 'centro_direita' | 'direita' | 'extrema_direita';
  is_candidate?: boolean;
  is_elected?: boolean;
  political_role?: string;
  phone?: string;
  mobile?: string;
  email?: string;
  whatsapp?: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  facebook?: string;
  instagram?: string;
  twitter?: string;
  linkedin?: string;
  notes?: string;
  last_contact?: Date | string; // Aceita Date ou string para flexibilidade
  contact_frequency?: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  created_at?: Date;
  updated_at?: Date;
}

export interface Group {
  id: number;
  user_id: number;
  name: string;
  type: string;
  description?: string;
  leader_person_id?: number;
  meeting_frequency?: string;
  meeting_location?: string;
  is_active?: boolean;
  member_count?: number;
  influence_level?: number;
  created_at?: Date;
  updated_at?: Date;
}

export interface PersonRelationship {
  id: number;
  person_a_id: number;
  person_b_id: number;
  relationship_type: string;
  relationship_subtype?: string;
  strength?: number;
  started_date?: Date;
  ended_date?: Date;
  is_active?: boolean;
  notes?: string;
  created_at?: Date;
}

export interface Relationship {
  id?: number;
  person_a_id: number;
  person_b_id: number;
  relationship_type: string;
  strength?: number;
  notes?: string;
  created_at?: Date;
  updated_at?: Date;
}

export interface Tag {
  id: number;
  user_id: number;
  name: string;
  color: string;
  description?: string;
  created_at?: Date;
  updated_at?: Date;
}

export interface PersonTag {
  person_id: number;
  tag_id: number;
}

// ========== FUNÇÕES DO BANCO DE DADOS ==========

// === USERS ===
export async function getUserByEmail(email: string): Promise<User | null> {
  try {
    const [rows] = await pool.execute(
      'SELECT id, email, name, password_hash as password FROM users WHERE email = ?',
      [email]
    );
    
    const users = rows as any[];
    
    if (users.length === 0) {
      console.log('Usuário não encontrado:', email);
      return null;
    }
    
    const user = {
      id: users[0].id,
      email: users[0].email,
      name: users[0].name,
      password: users[0].password
    };
    
    console.log('Usuário encontrado:', { email: user.email, name: user.name });
    return user;
  } catch (error) {
    console.error('Erro ao buscar usuário:', error);
    return null;
  }
}

export async function getUserById(id: number): Promise<User | null> {
  try {
    const [rows] = await pool.execute(
      'SELECT id, email, name FROM users WHERE id = ?',
      [id]
    );
    
    const users = rows as any[];
    
    if (users.length === 0) {
      return null;
    }
    
    return {
      id: users[0].id,
      email: users[0].email,
      name: users[0].name
    };
  } catch (error) {
    console.error('Erro ao buscar usuário por ID:', error);
    return null;
  }
}

// === PEOPLE ===
export async function getPeopleByUserId(userId: number): Promise<Person[]> {
  try {
    // Primeiro, verificar se o usuário é administrativo
    const [userRows] = await pool.execute(
      'SELECT email FROM users WHERE id = ?',
      [userId]
    );
    
    const userResult = userRows as any[];
    
    if (userResult.length === 0) {
      console.log('Usuário não encontrado:', userId);
      return [];
    }
    
    const userEmail = userResult[0].email;
    
    // Verificar se é usuário administrativo
    const isAdmin = userEmail.includes('admin') || 
                   userEmail.includes('gerente') || 
                   userEmail.includes('super');
    
    console.log(`Usuário ${userEmail} ${isAdmin ? 'É ADMIN' : 'é usuário comum'}`);
    
    // Query e parâmetros diferentes para admins
    let query: string;
    let params: any[];
    
    if (isAdmin) {
      // Admins veem TODAS as pessoas
      query = 'SELECT * FROM people ORDER BY name';
      params = [];
      console.log('Admin: buscando TODAS as pessoas');
    } else {
      // Usuários comuns veem apenas suas pessoas
      query = 'SELECT * FROM people WHERE user_id = ? ORDER BY name';
      params = [userId];
      console.log(`Usuário comum: buscando pessoas do user_id ${userId}`);
    }
    
    const [rows] = await pool.execute(query, params);
    
    const people = rows as Person[];
    console.log(`Retornando ${people.length} pessoas para o usuário ${userEmail}`);
    
    return people;
  } catch (error) {
    console.error('Erro ao buscar pessoas:', error);
    return [];
  }
}

export async function getPersonById(id: number): Promise<Person | null> {
  try {
    const [rows] = await pool.execute(
      'SELECT * FROM people WHERE id = ?',
      [id]
    );
    
    const people = rows as any[];
    
    if (people.length === 0) {
      return null;
    }
    
    return people[0] as Person;
  } catch (error) {
    console.error('Erro ao buscar pessoa por ID:', error);
    return null;
  }
}

export async function createPerson(person: Omit<Person, 'id' | 'created_at' | 'updated_at'>): Promise<Person> {
  try {
    const query = `
      INSERT INTO people (
        user_id, name, nickname, birth_date, gender,
        context, proximity, importance, trust_level, influence_level,
        occupation, company, position, professional_class, education_level, income_range,
        political_party, political_position, is_candidate, is_elected, political_role,
        phone, mobile, email, whatsapp, address, city, state, zip_code,
        facebook, instagram, twitter, linkedin,
        notes, last_contact, contact_frequency
      ) VALUES (
        ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?,
        ?, ?, ?
      )
    `;
    
    // Preparar valores, tratando booleanos e valores nulos
    const values = [
      person.user_id,
      person.name,
      person.nickname || null,
      person.birth_date || null,
      person.gender || 'N',
      person.context,
      person.proximity,
      person.importance || 3,
      person.trust_level || 3,
      person.influence_level || 3,
      person.occupation || null,
      person.company || null,
      person.position || null,
      person.professional_class || null,
      person.education_level || null,
      person.income_range || null,
      person.political_party || null,
      person.political_position || null,
      person.is_candidate ? 1 : 0,
      person.is_elected ? 1 : 0,
      person.political_role || null,
      person.phone || null,
      person.mobile || null,
      person.email || null,
      person.whatsapp || null,
      person.address || null,
      person.city || null,
      person.state || null,
      person.zip_code || null,
      person.facebook || null,
      person.instagram || null,
      person.twitter || null,
      person.linkedin || null,
      person.notes || null,
      person.last_contact || null,
      person.contact_frequency || null
    ];
    
    const [result] = await pool.execute(query, values);
    
    const insertId = (result as any).insertId;
    
    // Buscar a pessoa recém criada
    const newPerson = await getPersonById(insertId);
    
    if (!newPerson) {
      throw new Error('Erro ao buscar pessoa recém criada');
    }
    
    return newPerson;
  } catch (error) {
    console.error('Erro ao criar pessoa:', error);
    throw error;
  }
}

export async function updatePerson(id: number, updates: Partial<Person>): Promise<boolean> {
  try {
    // Remove campos que não devem ser atualizados
    const { id: _, user_id, created_at, updated_at, ...updateData } = updates;
    
    // Filtra apenas campos com valores definidos
    const fields = Object.keys(updateData).filter(
      key => updateData[key as keyof typeof updateData] !== undefined
    );
    
    if (fields.length === 0) {
      console.log('Nenhum campo para atualizar');
      return false;
    }
    
    // Prepara os valores, tratando tipos especiais
    const values = fields.map(field => {
      let value = updateData[field as keyof typeof updateData];
      
      // Tratamento especial para campos booleanos
      if (field === 'is_candidate' || field === 'is_elected') {
        value = value ? 1 : 0;
      }
      
      // Converte strings vazias em null
      if (value === '') {
        value = null;
      }
      
      return value;
    });
    
    // Adiciona o ID ao final
    values.push(id);
    
    // Constrói a query dinamicamente
    const setClause = fields.map(f => `${f} = ?`).join(', ');
    const query = `
      UPDATE people 
      SET ${setClause}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;
    
    console.log('Query de update:', query);
    console.log('Valores:', values);
    
    const [result] = await pool.execute(query, values);
    
    const affectedRows = (result as any).affectedRows;
    console.log('Linhas afetadas:', affectedRows);
    
    return affectedRows > 0;
  } catch (error) {
    console.error('Erro ao atualizar pessoa:', error);
    throw error;
  }
}

export async function deletePerson(id: number): Promise<boolean> {
  try {
    const [result] = await pool.execute(
      'DELETE FROM people WHERE id = ?',
      [id]
    );
    return (result as any).affectedRows > 0;
  } catch (error) {
    console.error('Erro ao deletar pessoa:', error);
    throw error;
  }
}

// === GROUPS ===
export async function getGroupsByUserId(userId: number): Promise<Group[]> {
  try {
    const [rows] = await pool.execute(
      'SELECT * FROM `groups` WHERE user_id = ? ORDER BY name',
      [userId]
    );
    return rows as Group[];
  } catch (error) {
    console.error('Erro ao buscar grupos:', error);
    return [];
  }
}

export async function createGroup(group: Omit<Group, 'id' | 'created_at' | 'updated_at' | 'member_count'>): Promise<Group> {
  try {
    const query = `
      INSERT INTO \`groups\` (
        user_id, name, type, description,
        leader_person_id, meeting_frequency, meeting_location,
        is_active, influence_level
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const [result] = await pool.execute(query, [
      group.user_id,
      group.name,
      group.type,
      group.description || null,
      group.leader_person_id || null,
      group.meeting_frequency || null,
      group.meeting_location || null,
      group.is_active !== false ? 1 : 0,
      group.influence_level || 3
    ]);
    
    const insertId = (result as any).insertId;
    
    // Buscar o grupo recém criado
    const [newGroup] = await pool.execute(
      'SELECT * FROM `groups` WHERE id = ?',
      [insertId]
    );
    
    return (newGroup as any[])[0] as Group;
  } catch (error) {
    console.error('Erro ao criar grupo:', error);
    throw error;
  }
}

// === PERSON-GROUP ASSOCIATIONS ===
export async function addPersonToGroup(personId: number, groupId: number, role?: string): Promise<void> {
  try {
    await pool.execute(
      `INSERT INTO person_groups (person_id, group_id, role)
       VALUES (?, ?, ?)`,
      [personId, groupId, role || null]
    );
  } catch (error) {
    console.error('Erro ao adicionar pessoa ao grupo:', error);
    throw error;
  }
}

export async function removePersonFromGroup(personId: number, groupId: number): Promise<void> {
  try {
    await pool.execute(
      `DELETE FROM person_groups 
       WHERE person_id = ? AND group_id = ?`,
      [personId, groupId]
    );
  } catch (error) {
    console.error('Erro ao remover pessoa do grupo:', error);
    throw error;
  }
}

// === NETWORK STATS ===
export async function getPersonNetworkStats(personId: number): Promise<any> {
  try {
    const [rows] = await pool.execute(
      'SELECT * FROM person_network_stats WHERE id = ?',
      [personId]
    );
    return (rows as any[])[0] || null;
  } catch (error) {
    console.error('Erro ao buscar estatísticas de rede:', error);
    return null;
  }
}

// === RELATIONSHIPS ===
export async function getPersonRelationships(personId: number): Promise<any[]> {
  const connection = await pool.getConnection();
  try {
    const [relationships] = await connection.execute(
      `SELECT 
        r.*,
        CASE 
          WHEN r.person_a_id = ? THEN p2.id
          ELSE p1.id
        END as related_person_id,
        CASE 
          WHEN r.person_a_id = ? THEN p2.name
          ELSE p1.name
        END as related_person_name,
        CASE 
          WHEN r.person_a_id = ? THEN p2.context
          ELSE p1.context
        END as related_person_context,
        CASE 
          WHEN r.person_a_id = ? THEN p2.proximity
          ELSE p1.proximity
        END as related_person_proximity
      FROM person_relationships r
      JOIN people p1 ON p1.id = r.person_a_id
      JOIN people p2 ON p2.id = r.person_b_id
      WHERE r.person_a_id = ? OR r.person_b_id = ?
      ORDER BY r.strength DESC, r.created_at DESC`,
      [personId, personId, personId, personId, personId, personId]
    );
    
    return relationships as any[];
  } catch (error) {
    console.error('Erro ao buscar relacionamentos:', error);
    return [];
  } finally {
    connection.release();
  }
}

export async function createRelationship(data: Omit<Relationship, 'id'>): Promise<boolean> {
  const connection = await pool.getConnection();
  try {
    // Garantir que person_a_id < person_b_id para evitar duplicatas
    const personAId = Math.min(data.person_a_id, data.person_b_id);
    const personBId = Math.max(data.person_a_id, data.person_b_id);
    
    await connection.execute(
      `INSERT INTO person_relationships 
       (person_a_id, person_b_id, relationship_type, strength, notes) 
       VALUES (?, ?, ?, ?, ?)`,
      [personAId, personBId, data.relationship_type, data.strength || 3, data.notes || null]
    );
    
    return true;
  } catch (error: any) {
    if (error.code === 'ER_DUP_ENTRY') {
      throw new Error('Relacionamento já existe entre essas pessoas');
    }
    console.error('Erro ao criar relacionamento:', error);
    throw error;
  } finally {
    connection.release();
  }
}

export async function updateRelationship(id: number, data: Partial<Relationship>): Promise<boolean> {
  const connection = await pool.getConnection();
  try {
    const fields = [];
    const values = [];
    
    if (data.relationship_type !== undefined) {
      fields.push('relationship_type = ?');
      values.push(data.relationship_type);
    }
    if (data.strength !== undefined) {
      fields.push('strength = ?');
      values.push(data.strength);
    }
    if (data.notes !== undefined) {
      fields.push('notes = ?');
      values.push(data.notes || null);
    }
    
    if (fields.length === 0) return false;
    
    values.push(id);
    
    const [result] = await connection.execute(
      `UPDATE person_relationships SET ${fields.join(', ')} WHERE id = ?`,
      values
    );
    
    return (result as any).affectedRows > 0;
  } catch (error) {
    console.error('Erro ao atualizar relacionamento:', error);
    throw error;
  } finally {
    connection.release();
  }
}

export async function deleteRelationship(id: number): Promise<boolean> {
  const connection = await pool.getConnection();
  try {
    const [result] = await connection.execute(
      'DELETE FROM person_relationships WHERE id = ?',
      [id]
    );
    
    return (result as any).affectedRows > 0;
  } catch (error) {
    console.error('Erro ao deletar relacionamento:', error);
    throw error;
  } finally {
    connection.release();
  }
}

export async function getAllUserRelationships(userId: number): Promise<any[]> {
  const connection = await pool.getConnection();
  try {
    const [relationships] = await connection.execute(
      `SELECT 
        r.*,
        p1.name as person_a_name,
        p1.context as person_a_context,
        p1.proximity as person_a_proximity,
        p2.name as person_b_name,
        p2.context as person_b_context,
        p2.proximity as person_b_proximity
      FROM person_relationships r
      JOIN people p1 ON p1.id = r.person_a_id
      JOIN people p2 ON p2.id = r.person_b_id
      WHERE p1.user_id = ? AND p2.user_id = ?
      ORDER BY r.created_at DESC`,
      [userId, userId]
    );
    
    return relationships as any[];
  } catch (error) {
    console.error('Erro ao buscar todos os relacionamentos:', error);
    return [];
  } finally {
    connection.release();
  }
}

export async function getRelationshipsByPersonId(personId: number): Promise<PersonRelationship[]> {
  try {
    const [rows] = await pool.execute(
      `SELECT * FROM person_relationships 
       WHERE person_a_id = ? OR person_b_id = ?
       ORDER BY created_at DESC`,
      [personId, personId]
    );
    return rows as PersonRelationship[];
  } catch (error) {
    console.error('Erro ao buscar relacionamentos por pessoa:', error);
    return [];
  }
}

// === TAGS ===
export async function getTagsByUserId(userId: number): Promise<Tag[]> {
  try {
    const [rows] = await pool.execute(
      'SELECT * FROM tags WHERE user_id = ? ORDER BY name',
      [userId]
    );
    return rows as Tag[];
  } catch (error) {
    console.error('Erro ao buscar tags:', error);
    return [];
  }
}

export async function createTag(tag: Omit<Tag, 'id' | 'created_at' | 'updated_at'>): Promise<Tag | null> {
  try {
    const [result] = await pool.execute(
      'INSERT INTO tags (user_id, name, color, description) VALUES (?, ?, ?, ?)',
      [tag.user_id, tag.name, tag.color, tag.description || null]
    );
    
    const insertId = (result as any).insertId;
    const [newTag] = await pool.execute(
      'SELECT * FROM tags WHERE id = ?',
      [insertId]
    );
    
    return (newTag as any[])[0];
  } catch (error: any) {
    if (error.code === 'ER_DUP_ENTRY') {
      throw new Error('Tag com este nome já existe');
    }
    console.error('Erro ao criar tag:', error);
    throw error;
  }
}

export async function updateTag(id: number, updates: Partial<Tag>): Promise<boolean> {
  try {
    const fields = [];
    const values = [];
    
    if (updates.name !== undefined) {
      fields.push('name = ?');
      values.push(updates.name);
    }
    if (updates.color !== undefined) {
      fields.push('color = ?');
      values.push(updates.color);
    }
    if (updates.description !== undefined) {
      fields.push('description = ?');
      values.push(updates.description || null);
    }
    
    if (fields.length === 0) return false;
    
    values.push(id);
    
    const [result] = await pool.execute(
      `UPDATE tags SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      values
    );
    
    return (result as any).affectedRows > 0;
  } catch (error) {
    console.error('Erro ao atualizar tag:', error);
    throw error;
  }
}

export async function deleteTag(id: number): Promise<boolean> {
  try {
    const [result] = await pool.execute(
      'DELETE FROM tags WHERE id = ?',
      [id]
    );
    
    return (result as any).affectedRows > 0;
  } catch (error) {
    console.error('Erro ao deletar tag:', error);
    throw error;
  }
}

export async function addTagToPerson(personId: number, tagId: number): Promise<boolean> {
  try {
    await pool.execute(
      'INSERT INTO person_tags (person_id, tag_id) VALUES (?, ?)',
      [personId, tagId]
    );
    return true;
  } catch (error: any) {
    if (error.code === 'ER_DUP_ENTRY') {
      // Tag já associada à pessoa - retorna true pois o estado final é o desejado
      return true;
    }
    console.error('Erro ao adicionar tag à pessoa:', error);
    throw error;
  }
}

export async function removeTagFromPerson(personId: number, tagId: number): Promise<boolean> {
  try {
    const [result] = await pool.execute(
      'DELETE FROM person_tags WHERE person_id = ? AND tag_id = ?',
      [personId, tagId]
    );
    
    return (result as any).affectedRows > 0;
  } catch (error) {
    console.error('Erro ao remover tag da pessoa:', error);
    throw error;
  }
}

export async function getPersonTags(personId: number): Promise<Tag[]> {
  try {
    const [rows] = await pool.execute(
      `SELECT t.* FROM tags t
       INNER JOIN person_tags pt ON t.id = pt.tag_id
       WHERE pt.person_id = ?
       ORDER BY t.name`,
      [personId]
    );
    
    return rows as Tag[];
  } catch (error) {
    console.error('Erro ao buscar tags da pessoa:', error);
    return [];
  }
}

export async function getPeopleByTag(tagId: number): Promise<number[]> {
  try {
    const [rows] = await pool.execute(
      'SELECT person_id FROM person_tags WHERE tag_id = ?',
      [tagId]
    );
    
    return (rows as any[]).map(row => row.person_id);
  } catch (error) {
    console.error('Erro ao buscar pessoas por tag:', error);
    return [];
  }
}

export default pool;
