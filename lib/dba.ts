import mysql from 'mysql2/promise';
import { v4 as uuidv4 } from 'uuid';

// Criar pool de conexões
const pool = mysql.createPool({
  host: process.env.MYSQL_HOST || 'localhost',
  user: process.env.MYSQL_USER || 'rodrigo',
  password: process.env.MYSQL_PASSWORD || '884422',
  database: process.env.MYSQL_DATABASE || 'community_mapper',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Tipos TypeScript baseados nas tabelas
export interface User {
  id: string;
  email: string;
  name: string;
  password?: string;
  created_at?: Date;
  updated_at?: Date;
}

export interface Person {
  id: string;
  user_id: string;
  name: string;
  nickname?: string;
  birth_date?: Date;
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
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  facebook?: string;
  instagram?: string;
  twitter?: string;
  linkedin?: string;
  whatsapp?: string;
  notes?: string;
  last_contact?: Date;
  contact_frequency?: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  created_at?: Date;
  updated_at?: Date;
}

export interface Group {
  id: string;
  user_id: string;
  name: string;
  type: string;
  description?: string;
  leader_person_id?: string;
  meeting_frequency?: string;
  meeting_location?: string;
  is_active?: boolean;
  member_count?: number;
  influence_level?: number;
  created_at?: Date;
  updated_at?: Date;
}

export interface PersonRelationship {
  id: string;
  person_a_id: string;
  person_b_id: string;
  relationship_type: string;
  relationship_subtype?: string;
  strength?: number;
  started_date?: Date;
  ended_date?: Date;
  is_active?: boolean;
  notes?: string;
  created_at?: Date;
}

// Interface específica para o novo sistema de relacionamentos
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
    
    // Converter id para string já que o banco retorna INT mas a interface espera string
    const user = {
      id: users[0].id.toString(),
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

export async function getUserById(id: string): Promise<User | null> {
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
      id: users[0].id.toString(),
      email: users[0].email,
      name: users[0].name
    };
  } catch (error) {
    console.error('Erro ao buscar usuário por ID:', error);
    return null;
  }
}

// === PEOPLE ===
export async function getPeopleByUserId(userId: string): Promise<Person[]> {
  try {
    const [rows] = await pool.execute(
      'SELECT * FROM people WHERE user_id = ? ORDER BY name',
      [userId]
    );
    
    // Garantir que os IDs sejam strings
    const people = (rows as any[]).map(person => ({
      ...person,
      id: person.id.toString(),
      user_id: person.user_id.toString()
    }));
    
    return people as Person[];
  } catch (error) {
    console.error('Erro ao buscar pessoas:', error);
    return [];
  }
}

export async function createPerson(person: Omit<Person, 'id' | 'created_at' | 'updated_at'>): Promise<Person> {
  const id = uuidv4();
  const query = `
    INSERT INTO people (
      id, user_id, name, nickname, birth_date, gender,
      context, proximity, importance, trust_level, influence_level,
      occupation, company, position, professional_class, education_level, income_range,
      political_party, political_position, is_candidate, is_elected, political_role,
      phone, mobile, email, address, city, state, zip_code,
      facebook, instagram, twitter, linkedin, whatsapp,
      notes, last_contact, contact_frequency
    ) VALUES (
      ?, ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?,
      ?, ?, ?
    )
  `;
  
  await pool.execute(query, [
    id, person.user_id, person.name, person.nickname, person.birth_date, person.gender,
    person.context, person.proximity, person.importance, person.trust_level, person.influence_level,
    person.occupation, person.company, person.position, person.professional_class, person.education_level, person.income_range,
    person.political_party, person.political_position, person.is_candidate, person.is_elected, person.political_role,
    person.phone, person.mobile, person.email, person.address, person.city, person.state, person.zip_code,
    person.facebook, person.instagram, person.twitter, person.linkedin, person.whatsapp,
    person.notes, person.last_contact, person.contact_frequency
  ]);
  
  return { ...person, id } as Person;
}

export async function updatePerson(id: string, updates: Partial<Person>): Promise<boolean> {
  const fields = Object.keys(updates).filter(k => k !== 'id' && k !== 'user_id');
  const values = fields.map(f => updates[f as keyof Person]);
  
  if (fields.length === 0) return false;
  
  const query = `
    UPDATE people 
    SET ${fields.map(f => `${f} = ?`).join(', ')}
    WHERE id = ?
  `;
  
  const [result] = await pool.execute(query, [...values, id]);
  return (result as any).affectedRows > 0;
}

export async function deletePerson(id: string): Promise<boolean> {
  const [result] = await pool.execute(
    'DELETE FROM people WHERE id = ?',
    [id]
  );
  return (result as any).affectedRows > 0;
}

// === GROUPS ===
export async function getGroupsByUserId(userId: string): Promise<Group[]> {
  const [rows] = await pool.execute(
    'SELECT * FROM `groups` WHERE user_id = ? ORDER BY name',
    [userId]
  );
  return rows as Group[];
}

export async function createGroup(group: Omit<Group, 'id' | 'created_at' | 'updated_at' | 'member_count'>): Promise<Group> {
  const id = uuidv4();
  const query = `
    INSERT INTO \`groups\` (
      id, user_id, name, type, description,
      leader_person_id, meeting_frequency, meeting_location,
      is_active, influence_level
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  
  await pool.execute(query, [
    id, group.user_id, group.name, group.type, group.description,
    group.leader_person_id, group.meeting_frequency, group.meeting_location,
    group.is_active ?? true, group.influence_level ?? 3
  ]);
  
  return { ...group, id, member_count: 0 } as Group;
}

// === PERSON-GROUP ASSOCIATIONS ===
export async function addPersonToGroup(personId: string, groupId: string, role?: string): Promise<void> {
  const id = uuidv4();
  await pool.execute(
    `INSERT INTO person_groups (id, person_id, group_id, role, joined_date, is_active)
     VALUES (?, ?, ?, ?, CURDATE(), TRUE)`,
    [id, personId, groupId, role]
  );
}

export async function removePersonFromGroup(personId: string, groupId: string): Promise<void> {
  await pool.execute(
    `UPDATE person_groups 
     SET is_active = FALSE, left_date = CURDATE()
     WHERE person_id = ? AND group_id = ?`,
    [personId, groupId]
  );
}

// === NETWORK STATS ===
export async function getPersonNetworkStats(personId: string): Promise<any> {
  const [rows] = await pool.execute(
    'SELECT * FROM person_network_stats WHERE id = ?',
    [personId]
  );
  return (rows as any[])[0] || null;
}

// === RELATIONSHIPS (NOVO SISTEMA) ===
// Buscar relacionamentos de uma pessoa
export async function getPersonRelationships(personId: string): Promise<any[]> {
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
  } finally {
    connection.release();
  }
}

// Criar relacionamento
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
    throw error;
  } finally {
    connection.release();
  }
}

// Atualizar relacionamento
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
      values.push(data.notes);
    }
    
    if (fields.length === 0) return false;
    
    values.push(id);
    
    const [result] = await connection.execute(
      `UPDATE person_relationships SET ${fields.join(', ')} WHERE id = ?`,
      values
    );
    
    return (result as any).affectedRows > 0;
  } finally {
    connection.release();
  }
}

// Deletar relacionamento
export async function deleteRelationship(id: number): Promise<boolean> {
  const connection = await pool.getConnection();
  try {
    const [result] = await connection.execute(
      'DELETE FROM person_relationships WHERE id = ?',
      [id]
    );
    
    return (result as any).affectedRows > 0;
  } finally {
    connection.release();
  }
}

// Buscar todos os relacionamentos do usuário (para o grafo)
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
  } finally {
    connection.release();
  }
}

// === ANTIGO SISTEMA DE RELACIONAMENTOS (mantido para compatibilidade) ===
export async function getRelationshipsByPersonId(personId: string): Promise<PersonRelationship[]> {
  const [rows] = await pool.execute(
    `SELECT * FROM person_relationships 
     WHERE person_a_id = ? OR person_b_id = ?
     ORDER BY created_at DESC`,
    [personId, personId]
  );
  return rows as PersonRelationship[];
}

export default pool;
