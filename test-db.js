const mysql = require('mysql2/promise');

async function testConnection() {
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'rodrigo',
      password: '884422',
      database: 'mapa_comunidade'
    });

    console.log('✅ Conectado ao MySQL!');

    // Verificar se as tabelas existem
    const [tables] = await connection.execute('SHOW TABLES');
    console.log('\n📋 Tabelas encontradas:');
    tables.forEach(table => console.log(`  - ${Object.values(table)[0]}`));

    // Verificar usuários
    console.log('\n👥 Usuários no banco:');
    const [users] = await connection.execute('SELECT * FROM users');
    if (users.length === 0) {
      console.log('  ⚠️ Nenhum usuário encontrado!');
    } else {
      users.forEach(user => {
        console.log('Usuário encontrado:', user);
      });
    }

    // Verificar se a tabela people existe
    const peopleTableExists = tables.some(table => Object.values(table)[0] === 'people');
    
    if (peopleTableExists) {
      // Verificar estrutura da tabela people
      console.log('\n🏗️ Estrutura da tabela people:');
      const [peopleStructure] = await connection.execute('DESCRIBE people');
      peopleStructure.forEach(field => {
        console.log(`  - ${field.Field}: ${field.Type} ${field.Null === 'NO' ? 'NOT NULL' : 'NULL'} ${field.Default ? `DEFAULT ${field.Default}` : ''}`);
      });

      // Contar registros
      const [countResult] = await connection.execute('SELECT COUNT(*) as total FROM people');
      console.log(`\n📊 Total de pessoas cadastradas: ${countResult[0].total}`);
    } else {
      console.log('\n⚠️ Tabela "people" não encontrada!');
      console.log('Criando tabela people...');
      
      // Criar tabela people
      await connection.execute(`
        CREATE TABLE people (
          id VARCHAR(36) PRIMARY KEY,
          user_id VARCHAR(36) NOT NULL,
          name VARCHAR(255) NOT NULL,
          nickname VARCHAR(100),
          birth_date DATE,
          gender ENUM('M', 'F', 'O', 'N'),
          context ENUM('residencial', 'profissional', 'social', 'servicos', 'institucional', 'politico') NOT NULL,
          proximity ENUM('nucleo', 'primeiro', 'segundo', 'terceiro', 'periferia') NOT NULL,
          importance INT DEFAULT 3,
          trust_level INT DEFAULT 3,
          influence_level INT DEFAULT 3,
          occupation VARCHAR(255),
          company VARCHAR(255),
          position VARCHAR(255),
          professional_class VARCHAR(255),
          education_level VARCHAR(100),
          income_range VARCHAR(100),
          political_party VARCHAR(100),
          political_position VARCHAR(100),
          is_candidate BOOLEAN DEFAULT FALSE,
          is_elected BOOLEAN DEFAULT FALSE,
          political_role VARCHAR(100),
          phone VARCHAR(20),
          mobile VARCHAR(20),
          email VARCHAR(255),
          address VARCHAR(255),
          city VARCHAR(100),
          state VARCHAR(50),
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
      
      console.log('✅ Tabela people criada com sucesso!');
    }

    await connection.end();
    console.log('\n✅ Teste concluído!');
  } catch (error) {
    console.error('❌ Erro:', error.message);
    if (error.code) {
      console.error('Código do erro:', error.code);
    }
  }
}

testConnection();
