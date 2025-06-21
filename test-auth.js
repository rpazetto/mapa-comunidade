const bcrypt = require('bcryptjs');

async function test() {
  const password = 'admin123';
  const hash = '$2a$12$kL4Y0G/9dDPrYH3UYV7zAevBq1TRz3HxqBUwhnqFmBvH2gx.qKZn6';
  
  const match = await bcrypt.compare(password, hash);
  console.log('Senha correta?', match);
  
  // Testar com a senha do banco
  const mysql = require('mysql2/promise');
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'rodrigo',
    password: '884422',
    database: 'mapa_comunidade'
  });
  
  const [rows] = await connection.execute(
    'SELECT password FROM users WHERE email = ?',
    ['rodrigo@example.com']
  );
  
  if (rows.length > 0) {
    const dbHash = rows[0].password;
    const dbMatch = await bcrypt.compare('admin123', dbHash);
    console.log('Hash do banco:', dbHash);
    console.log('Senha bate com o banco?', dbMatch);
  }
  
  await connection.end();
}

test().catch(console.error);
