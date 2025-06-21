const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');
const { v4: uuidv4 } = require('uuid');

async function createUser() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'rodrigo',
    password: '884422',
    database: 'mapa_comunidade'
  });

  const hashedPassword = await bcrypt.hash('admin123', 10);
  const userId = uuidv4();

  try {
    await connection.execute(
      `INSERT INTO users (id, email, name, password) 
       VALUES (?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE password = ?`,
      [userId, 'rodrigo@example.com', 'Rodrigo', hashedPassword, hashedPassword]
    );
    console.log('Usuário criado/atualizado com sucesso!');
  } catch (error) {
    console.error('Erro:', error);
  } finally {
    await connection.end();
  }
}

createUser();

