import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { Users, TrendingUp, Calendar, MapPin, Briefcase, Award } from 'lucide-react';

interface Person {
  id: string;
  name: string;
  gender?: string;
  birth_date?: string;
  city?: string;
  occupation?: string;
  professional_class?: string;
  education_level?: string;
  income_range?: string;
  context: string;
  proximity: string;
}

interface DemographicAnalysisProps {
  people: Person[];
  city?: string;
}

interface AffiliateData {
  nome: string;
  partido: string;
  cidade: string;
  idade?: number;
  genero?: string;
}

const DemographicAnalysis: React.FC<DemographicAnalysisProps> = ({ people, city = '' }) => {
  const [affiliatesData, setAffiliatesData] = useState<AffiliateData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (city) {
      fetchAffiliatesData();
    }
  }, [city]);

  const fetchAffiliatesData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/affiliates?city=${encodeURIComponent(city.toUpperCase())}`);
      
      if (!response.ok) {
        throw new Error(`Erro ao carregar dados: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (Array.isArray(data)) {
        setAffiliatesData(data);
      } else {
        console.error('Dados recebidos não são um array:', data);
        setAffiliatesData([]);
      }
    } catch (error) {
      console.error('Erro ao buscar dados de filiados:', error);
      setError(error instanceof Error ? error.message : 'Erro ao carregar dados');
      setAffiliatesData([]);
    } finally {
      setLoading(false);
    }
  };

  // Análise por Gênero
  const genderData = React.useMemo(() => {
    const counts = people.reduce((acc, person) => {
      const gender = person.gender || 'Não informado';
      const label = gender === 'M' ? 'Masculino' : 
                   gender === 'F' ? 'Feminino' : 
                   gender === 'O' ? 'Outro' : 'Não informado';
      acc[label] = (acc[label] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [people]);

  // Análise por Faixa Etária
  const ageData = React.useMemo(() => {
    const calculateAge = (birthDate: string) => {
      const birth = new Date(birthDate);
      const today = new Date();
      let age = today.getFullYear() - birth.getFullYear();
      const monthDiff = today.getMonth() - birth.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--;
      }
      return age;
    };

    const ageRanges = {
      '18-24': 0,
      '25-34': 0,
      '35-44': 0,
      '45-54': 0,
      '55-64': 0,
      '65+': 0,
      'Não informado': 0
    };

    people.forEach(person => {
      if (person.birth_date) {
        const age = calculateAge(person.birth_date);
        if (age >= 18 && age <= 24) ageRanges['18-24']++;
        else if (age >= 25 && age <= 34) ageRanges['25-34']++;
        else if (age >= 35 && age <= 44) ageRanges['35-44']++;
        else if (age >= 45 && age <= 54) ageRanges['45-54']++;
        else if (age >= 55 && age <= 64) ageRanges['55-64']++;
        else if (age >= 65) ageRanges['65+']++;
      } else {
        ageRanges['Não informado']++;
      }
    });

    return Object.entries(ageRanges)
      .filter(([_, value]) => value > 0)
      .map(([name, value]) => ({ name, value }));
  }, [people]);

  // Análise por Cidade
  const cityData = React.useMemo(() => {
    const counts = people.reduce((acc, person) => {
      const city = person.city || 'Não informado';
      acc[city] = (acc[city] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name, value]) => ({ name, value }));
  }, [people]);

  // Análise por Escolaridade
  const educationData = React.useMemo(() => {
    const educationLabels: Record<string, string> = {
      'fundamental': 'Ensino Fundamental',
      'medio': 'Ensino Médio',
      'superior': 'Ensino Superior',
      'pos_graduacao': 'Pós-Graduação',
      'mestrado': 'Mestrado',
      'doutorado': 'Doutorado'
    };

    const counts = people.reduce((acc, person) => {
      const education = person.education_level 
        ? educationLabels[person.education_level] || person.education_level
        : 'Não informado';
      acc[education] = (acc[education] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [people]);

  // Análise por Classe Profissional
  const professionalClassData = React.useMemo(() => {
    const counts = people.reduce((acc, person) => {
      const profClass = person.professional_class || 'Não informado';
      acc[profClass] = (acc[profClass] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name, value]) => ({ name, value }));
  }, [people]);

  // Análise por Faixa de Renda
  const incomeData = React.useMemo(() => {
    const incomeLabels: Record<string, string> = {
      'A': 'Classe A',
      'B': 'Classe B',
      'C': 'Classe C',
      'D': 'Classe D',
      'E': 'Classe E'
    };

    const counts = people.reduce((acc, person) => {
      const income = person.income_range 
        ? incomeLabels[person.income_range] || person.income_range
        : 'Não informado';
      acc[income] = (acc[income] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [people]);

  // Cores para os gráficos
  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#6B7280'];

  return (
    <div className="space-y-6">
      {/* Header com estatísticas gerais */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total de Pessoas</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{people.length}</p>
            </div>
            <Users className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Média de Idade</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {people.filter(p => p.birth_date).length > 0
                  ? Math.round(
                      people
                        .filter(p => p.birth_date)
                        .map(p => {
                          const birth = new Date(p.birth_date!);
                          const today = new Date();
                          return today.getFullYear() - birth.getFullYear();
                        })
                        .reduce((a, b) => a + b, 0) / people.filter(p => p.birth_date).length
                    )
                  : 'N/A'}
              </p>
            </div>
            <Calendar className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Cidades</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {new Set(people.filter(p => p.city).map(p => p.city)).size}
              </p>
            </div>
            <MapPin className="w-8 h-8 text-purple-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Profissões</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {new Set(people.filter(p => p.professional_class).map(p => p.professional_class)).size}
              </p>
            </div>
            <Briefcase className="w-8 h-8 text-orange-500" />
          </div>
        </div>
      </div>

      {/* Gráficos em Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de Gênero */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Distribuição por Gênero</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={genderData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {genderData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Gráfico de Faixa Etária */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Distribuição por Faixa Etária</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={ageData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Gráfico de Cidades */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Top 10 Cidades</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={cityData} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" width={100} />
              <Tooltip />
              <Bar dataKey="value" fill="#10B981" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Gráfico de Escolaridade */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Nível de Escolaridade</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={educationData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {educationData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Gráfico de Classes Profissionais */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow col-span-1 lg:col-span-2">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Top 10 Classes Profissionais</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={professionalClassData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#F59E0B" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Gráfico de Renda */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow col-span-1 lg:col-span-2">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Distribuição por Faixa de Renda</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={incomeData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#8B5CF6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Comparação com Dados de Filiados (se disponível) */}
      {city && affiliatesData.length > 0 && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
            Comparação com Filiados Partidários em {city}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">Total de Filiados</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{affiliatesData.length}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">Partidos Representados</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {new Set(affiliatesData.map(a => a.partido)).size}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">Taxa de Cobertura</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {((people.length / affiliatesData.length) * 100).toFixed(1)}%
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Mensagem de erro */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
          <p className="text-red-700 dark:text-red-300">
            Erro ao carregar dados de filiados: {error}
          </p>
        </div>
      )}

      {/* Mensagem de loading */}
      {loading && (
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
          <p className="text-blue-700 dark:text-blue-300">
            Carregando dados de filiados...
          </p>
        </div>
      )}
    </div>
  );
};

export default DemographicAnalysis;
