const mysql = require('mysql2/promise');

async function createTagsTables() {
  let connection;
  
  try {
    console.log('🔄 Conectando ao MySQL...');
    connection = await mysql.createConnection({
      host: 'localhost',
      user: 'rodrigo',
      password: '884422',
      database: 'community_mapper'
    });
    
    console.log('✅ Conectado!');
    
    // Criar tabela de tags
    console.log('📝 Criando tabela de tags...');
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS tags (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        name VARCHAR(50) NOT NULL,
        color VARCHAR(7) NOT NULL DEFAULT '#3B82F6',
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE KEY unique_tag_per_user (user_id, name),
        INDEX idx_user_tags (user_id)
      );
    `);
    
    console.log('✅ Tabela tags criada!');
    
    // Criar tabela de relacionamento pessoa-tag
    console.log('📝 Criando tabela person_tags...');
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS person_tags (
        id INT PRIMARY KEY AUTO_INCREMENT,
        person_id VARCHAR(36) NOT NULL,
        tag_id INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        
        FOREIGN KEY (person_id) REFERENCES people(id) ON DELETE CASCADE,
        FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE,
        UNIQUE KEY unique_person_tag (person_id, tag_id),
        INDEX idx_person_tags (person_id),
        INDEX idx_tag_people (tag_id)
      );
    `);
    
    console.log('✅ Tabela person_tags criada!');
    
    // Verificar estrutura
    console.log('\n📊 Estrutura das tabelas:');
    
    const [tagsColumns] = await connection.execute('DESCRIBE tags');
    console.log('\nTabela tags:');
    console.table(tagsColumns.map(col => ({
      Campo: col.Field,
      Tipo: col.Type,
      Chave: col.Key
    })));
    
    const [personTagsColumns] = await connection.execute('DESCRIBE person_tags');
    console.log('\nTabela person_tags:');
    console.table(personTagsColumns.map(col => ({
      Campo: col.Field,
      Tipo: col.Type,
      Chave: col.Key
    })));
    
    console.log('\n✅ Tabelas de tags criadas com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    if (connection) await connection.end();
  }
}

createTagsTables();
