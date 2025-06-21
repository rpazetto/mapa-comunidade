const bcrypt = require('bcryptjs');

async function generateHash() {
  const password = '123456';
  const hash = await bcrypt.hash(password, 10);
  
  console.log('Senha:', password);
  console.log('Hash gerado:', hash);
  
  // Testar se funciona
  const isValid = await bcrypt.compare(password, hash);
  console.log('Teste de validação:', isValid);
}

generateHash();
