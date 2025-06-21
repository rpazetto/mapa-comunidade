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

  try {
    // Verificar se o usuário já existe
    const [existing] = await connection.execute(
      'SELECT id FROM users WHERE email = ?',
      ['rodrigo@example.com']
    );

    if (existing.length > 0) {
      console.log('⚠️ Usuário já existe. Atualizando senha...');
      
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await connection.execute(
        'UPDATE users SET password = ? WHERE email = ?',
        [hashedPassword, 'rodrigo@example.com']
      );
      
      console.log('✅ Senha atualizada com sucesso!');
    } else {
      console.log('📝 Criando novo usuário...');
      
      const userId = uuidv4();
      const hashedPassword = await bcrypt.hash('admin123', 10);
      
      await connection.execute(
        'INSERT INTO users (id, email, name, password) VALUES (?, ?, ?, ?)',
        [userId, 'rodrigo@example.com', 'Rodrigo', hashedPassword]
      );
      
      console.log('✅ Usuário criado com sucesso!');
      console.log(`   ID: ${userId}`);
    }

    console.log('\n🔑 Credenciais:');
    console.log('   Email: rodrigo@example.com');
    console.log('   Senha: admin123');
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await connection.end();
  }
}

createUser();
