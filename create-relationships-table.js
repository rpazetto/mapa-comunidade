// create-relationships-table.js
const mysql = require('mysql2/promise');

async function createRelationshipsTable() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'rodrigo',
    password: '884422',
    database: 'community_mapper'
  });

  try {
    console.log('🔄 Criando tabela de relacionamentos...\n');

    // Criar tabela
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS person_relationships (
        id INT PRIMARY KEY AUTO_INCREMENT,
        person_a_id INT NOT NULL,
        person_b_id INT NOT NULL,
        relationship_type VARCHAR(50) NOT NULL,
        strength INT DEFAULT 3,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        
        FOREIGN KEY (person_a_id) REFERENCES people(id) ON DELETE CASCADE,
        FOREIGN KEY (person_b_id) REFERENCES people(id) ON DELETE CASCADE,
        
        CONSTRAINT unique_relationship UNIQUE (person_a_id, person_b_id),
        CONSTRAINT no_self_relationship CHECK (person_a_id != person_b_id),
        CONSTRAINT ordered_ids CHECK (person_a_id < person_b_id),
        
        INDEX idx_relationships_person_a (person_a_id),
        INDEX idx_relationships_person_b (person_b_id),
        INDEX idx_relationships_type (relationship_type)
      )
    `);

    console.log('✅ Tabela person_relationships criada com índices!\n');

    // Verificar estrutura
    const [columns] = await connection.execute(`
      DESCRIBE person_relationships
    `);

    console.log('📊 Estrutura da tabela:');
    columns.forEach(col => {
      console.log(`  - ${col.Field}: ${col.Type} ${col.Null === 'NO' ? 'NOT NULL' : ''}`);
    });

    // Verificar índices
    console.log('\n📇 Índices criados:');
    const [indexes] = await connection.execute(`
      SHOW INDEX FROM person_relationships
    `);
    
    const uniqueIndexes = [...new Set(indexes.map(idx => idx.Key_name))];
    uniqueIndexes.forEach(indexName => {
      console.log(`  - ${indexName}`);
    });

    console.log('\n✅ Tabela de relacionamentos configurada com sucesso!');

  } catch (error) {
    console.error('❌ Erro:', error.message);
    
    // Se o erro for porque a tabela já existe, vamos verificar
    if (error.code === 'ER_TABLE_EXISTS_ERROR') {
      console.log('ℹ️  A tabela person_relationships já existe.');
      
      // Verificar estrutura existente
      try {
        const [tables] = await connection.execute(
          "SHOW TABLES LIKE 'person_relationships'"
        );
        
        if (tables.length > 0) {
          console.log('\n📊 Estrutura da tabela existente:');
          const [columns] = await connection.execute('DESCRIBE person_relationships');
          columns.forEach(col => {
            console.log(`  - ${col.Field}: ${col.Type}`);
          });
        }
      } catch (e) {
        console.error('Erro ao verificar tabela existente:', e.message);
      }
    }
  } finally {
    await connection.end();
  }
}

createRelationshipsTable();
