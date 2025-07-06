import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import { getPeopleByUserId } from '@/lib/db';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return Response.json({ error: 'Not authenticated' });
    }
    
    const userId = session.user?.id;
    const people = await getPeopleByUserId(userId);
    
    return Response.json({
      session: {
        user: session.user,
        userId: userId
      },
      peopleCount: people.length,
      people: people.slice(0, 5)
    });
  } catch (error: any) {
    return Response.json({ error: error.message });
  }
}
