import { dbCM } from '@/lib/db';

export async function GET() {
  try {
    const [users] = await dbCM.execute('SELECT id, email, name FROM users');
    const [people] = await dbCM.execute('SELECT id, name, user_id FROM people LIMIT 10');
    
    return Response.json({
      users: users,
      people: people,
      summary: {
        totalUsers: (users as any[]).length,
        totalPeople: (people as any[]).length,
        peopleWithUserId: (people as any[]).filter(p => p.user_id).length
      }
    });
  } catch (error: any) {
    return Response.json({ error: error.message });
  }
}
