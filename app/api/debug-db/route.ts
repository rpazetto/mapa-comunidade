import { dbCM, dbMC } from '@/lib/db';

export async function GET() {
  const debug = {
    environment: {
      RAILWAY_ENVIRONMENT: process.env.RAILWAY_ENVIRONMENT,
      NODE_ENV: process.env.NODE_ENV,
      MYSQL_HOST: process.env.MYSQL_HOST,
      MYSQL_PORT: process.env.MYSQL_PORT,
      MYSQL_PASSWORD: !!process.env.MYSQL_PASSWORD,
      DATABASE_URL_CM: !!process.env.DATABASE_URL_CM,
      DATABASE_URL_MC: !!process.env.DATABASE_URL_MC,
    },
    connections: {
      community_mapper: { status: 'not tested', error: null, tables: null, peopleCount: 0 },
      mapa_comunidade: { status: 'not tested', error: null, tables: null, peopleCount: 0 }
    }
  };

  // Testar community_mapper
  try {
    await dbCM.execute('SELECT 1');
    debug.connections.community_mapper.status = 'connected';
    
    // Contar pessoas
    const [peopleResult] = await dbCM.execute('SELECT COUNT(*) as count FROM people');
    debug.connections.community_mapper.peopleCount = (peopleResult as any)[0].count;
    
    // Listar tabelas
    const [tables] = await dbCM.execute('SHOW TABLES');
    debug.connections.community_mapper.tables = (tables as any[]).map(t => Object.values(t)[0]);
    
  } catch (error: any) {
    debug.connections.community_mapper.status = 'error';
    debug.connections.community_mapper.error = error.message;
  }

  // Testar mapa_comunidade
  try {
    await dbMC.execute('SELECT 1');
    debug.connections.mapa_comunidade.status = 'connected';
    
    // Contar pessoas
    const [peopleResult] = await dbMC.execute('SELECT COUNT(*) as count FROM people');
    debug.connections.mapa_comunidade.peopleCount = (peopleResult as any)[0].count;
    
    // Listar tabelas
    const [tables] = await dbMC.execute('SHOW TABLES');
    debug.connections.mapa_comunidade.tables = (tables as any[]).map(t => Object.values(t)[0]);
    
  } catch (error: any) {
    debug.connections.mapa_comunidade.status = 'error';
    debug.connections.mapa_comunidade.error = error.message;
  }

  return Response.json(debug, { status: 200 });
}
