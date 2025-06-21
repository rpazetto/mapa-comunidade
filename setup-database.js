// setup-database.js
const mysql = require('mysql2/promise');

async function setupDatabase() {
  // Primeiro conecta sem especificar database
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'rodrigo',
    password: '884422'
  });

  try {
    console.log('🔄 Criando banco de dados...\n');

    // Criar o banco de dados
    await connection.execute('CREATE DATABASE IF NOT EXISTS community_mapper');
    console.log('✅ Banco de dados community_mapper criado!\n');

    // Usar o banco de dados
    await connection.execute('USE community_mapper');

    // Criar tabela users
    console.log('📋 Criando tabela users...');
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INT PRIMARY KEY AUTO_INCREMENT,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        name VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Tabela users criada!\n');

    // Criar tabela people
    console.log('📋 Criando tabela people...');
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS people (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        name VARCHAR(255) NOT NULL,
        nickname VARCHAR(100),
        birth_date DATE,
        gender ENUM('M', 'F', 'N') DEFAULT 'N',
        context VARCHAR(50),
        proximity VARCHAR(50),
        importance INT DEFAULT 3,
        trust_level INT DEFAULT 3,
        influence_level INT DEFAULT 3,
        occupation VARCHAR(255),
        company VARCHAR(255),
        position VARCHAR(255),
        professional_class VARCHAR(255),
        education_level ENUM('fundamental', 'medio', 'superior', 'pos_graduacao'),
        income_range ENUM('ate_2k', '2k_5k', '5k_10k', '10k_20k', 'acima_20k'),
        political_party VARCHAR(100),
        political_position ENUM('esquerda', 'centro_esquerda', 'centro', 'centro_direita', 'direita'),
        is_candidate BOOLEAN DEFAULT FALSE,
        is_elected BOOLEAN DEFAULT FALSE,
        political_role VARCHAR(255),
        phone VARCHAR(20),
        mobile VARCHAR(20),
        email VARCHAR(255),
        address TEXT,
        city VARCHAR(100),
        state VARCHAR(2),
        zip_code VARCHAR(10),
        facebook VARCHAR(255),
        instagram VARCHAR(255),
        twitter VARCHAR(255),
        linkedin VARCHAR(255),
        whatsapp VARCHAR(20),
        notes TEXT,
        last_contact DATE,
        contact_frequency VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_user_id (user_id),
        INDEX idx_context (context),
        INDEX idx_proximity (proximity)
      )
    `);
    console.log('✅ Tabela people criada!\n');

    // Verificar se já existe usuário padrão
    const [users] = await connection.execute(
      'SELECT id FROM users WHERE email = ?',
      ['rodrigo@example.com']
    );

    if (users.length === 0) {
      console.log('👤 Criando usuário padrão...');
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash('admin123', 10);
      
      await connection.execute(
        'INSERT INTO users (email, password_hash, name) VALUES (?, ?, ?)',
        ['rodrigo@example.com', hashedPassword, 'Rodrigo']
      );
      
      console.log('✅ Usuário padrão criado!');
      console.log('   Email: rodrigo@example.com');
      console.log('   Senha: admin123\n');
    } else {
      console.log('ℹ️  Usuário padrão já existe.\n');
    }

    // Mostrar status
    const [tableCount] = await connection.execute(`
      SELECT COUNT(*) as count 
      FROM information_schema.tables 
      WHERE table_schema = 'community_mapper'
    `);
    
    console.log(`📊 Status do banco de dados:`);
    console.log(`   - Tabelas criadas: ${tableCount[0].count}`);
    
    const [peopleCount] = await connection.execute('SELECT COUNT(*) as count FROM people');
    console.log(`   - Pessoas cadastradas: ${peopleCount[0].count}`);
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
    console.error('Detalhes:', error);
  } finally {
    await connection.end();
  }
}

setupDatabase();
