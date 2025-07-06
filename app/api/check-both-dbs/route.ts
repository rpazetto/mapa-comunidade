import { dbCM, dbMC } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id || 'não logado';
    
    // Verificar community_mapper (banco principal)
    const [cmPeople] = await dbCM.execute(
      'SELECT COUNT(*) as total FROM people WHERE user_id = ?',
      [userId]
    );
    const [cmAllPeople] = await dbCM.execute('SELECT COUNT(*) as total FROM people');
    const [cmUsers] = await dbCM.execute('SELECT COUNT(*) as total FROM users');
    
    // Verificar mapa_comunidade (banco secundário)
    const [mcPeople] = await dbMC.execute(
      'SELECT COUNT(*) as total FROM people WHERE user_id = ?',
      [userId]
    );
    const [mcAllPeople] = await dbMC.execute('SELECT COUNT(*) as total FROM people');
    const [mcUsers] = await dbMC.execute('SELECT COUNT(*) as total FROM users');
    
    // Listar algumas pessoas de cada banco
    const [cmSamplePeople] = await dbCM.execute(
      'SELECT id, name, user_id FROM people WHERE user_id = ? LIMIT 5',
      [userId]
    );
    
    const [mcSamplePeople] = await dbMC.execute(
      'SELECT id, name, user_id FROM people WHERE user_id = ? LIMIT 5',
      [userId]
    );
    
    return Response.json({
      currentUser: {
        id: userId,
        email: session?.user?.email
      },
      community_mapper: {
        totalUsers: (cmUsers as any)[0].total,
        totalPeople: (cmAllPeople as any)[0].total,
        userPeople: (cmPeople as any)[0].total,
        samplePeople: cmSamplePeople
      },
      mapa_comunidade: {
        totalUsers: (mcUsers as any)[0].total,
        totalPeople: (mcAllPeople as any)[0].total,
        userPeople: (mcPeople as any)[0].total,
        samplePeople: mcSamplePeople
      }
    });
  } catch (error: any) {
    return Response.json({ error: error.message });
  }
}

