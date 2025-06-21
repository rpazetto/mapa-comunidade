import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';

// Interface para os dados de filiados
interface Affiliate {
  nome: string;
  partido: string;
  cidade: string;
  idade?: number;
  genero?: string;
}

// Dados de exemplo - você pode substituir por uma consulta real ao banco de dados
const mockAffiliatesData: Affiliate[] = [
  { nome: 'João Silva', partido: 'PT', cidade: 'GRAMADO', idade: 45, genero: 'M' },
  { nome: 'Maria Santos', partido: 'PSDB', cidade: 'GRAMADO', idade: 38, genero: 'F' },
  { nome: 'Pedro Oliveira', partido: 'MDB', cidade: 'GRAMADO', idade: 52, genero: 'M' },
  { nome: 'Ana Costa', partido: 'PP', cidade: 'GRAMADO', idade: 41, genero: 'F' },
  { nome: 'Carlos Ferreira', partido: 'PL', cidade: 'GRAMADO', idade: 35, genero: 'M' },
  // Adicione mais dados conforme necessário
];

export async function GET(request: NextRequest) {
  try {
    // Verificar autenticação
    const session = await getServerSession();
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Obter parâmetros da query
    const { searchParams } = new URL(request.url);
    const city = searchParams.get('city')?.toUpperCase();

    // Se você tiver acesso a um banco de dados real com dados de filiados,
    // substitua esta parte pela consulta real
    let affiliatesData = mockAffiliatesData;

    // Filtrar por cidade se especificado
    if (city) {
      affiliatesData = affiliatesData.filter(
        affiliate => affiliate.cidade.toUpperCase() === city
      );
    }

    // Retornar os dados
    return NextResponse.json(affiliatesData);

  } catch (error) {
    console.error('Erro ao buscar dados de filiados:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar dados de filiados' }, 
      { status: 500 }
    );
  }
}
