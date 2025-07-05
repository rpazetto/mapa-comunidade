import { dbCM, dbMC } from '@/lib/db';

export async function GET() {
  const results = {
    community_mapper: { connected: false, error: null, data: null },
    mapa_comunidade: { connected: false, error: null, data: null }
  };

  // Testar community_mapper
  try {
    const [rows] = await dbCM.execute('SELECT COUNT(*) as count FROM people');
    results.community_mapper.connected = true;
    results.community_mapper.data = rows[0];
  } catch (error: any) {
    results.community_mapper.error = error.message;
  }

  // Testar mapa_comunidade
  try {
    const [rows] = await dbMC.execute('SELECT COUNT(*) as count FROM people');
    results.mapa_comunidade.connected = true;
    results.mapa_comunidade.data = rows[0];
  } catch (error: any) {
    results.mapa_comunidade.error = error.message;
  }

  return Response.json(results);
}
