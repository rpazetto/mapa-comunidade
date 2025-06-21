const bcrypt = require('bcryptjs');

async function generateHash() {
  const password = 'admin123';
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(password, salt);
  
  console.log('Nova senha:', password);
  console.log('Novo hash:', hash);
  
  // Testar se funciona
  const match = await bcrypt.compare(password, hash);
  console.log('Teste do novo hash:', match);
}

generateHash();
