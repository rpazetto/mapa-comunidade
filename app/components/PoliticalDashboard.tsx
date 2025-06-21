import React from 'react';
import { Users, TrendingUp, Award, Target, AlertCircle, BarChart3, PieChart, Activity } from 'lucide-react';

interface Person {
  id: string;
  name: string;
  political_party?: string;
  is_candidate?: boolean;
  is_elected?: boolean;
  political_role?: string;
  influence_level?: number;
  proximity: string;
  context: string;
  importance?: number;
}

interface PoliticalDashboardProps {
  people: Person[];
}

export default function PoliticalDashboard({ people }: PoliticalDashboardProps) {
  // Filtrar apenas pessoas com contexto político ou partido
  const politicalPeople = people.filter(p => 
    p.context === 'politico' || p.political_party || p.is_candidate || p.is_elected
  );

  // Estatísticas por partido
  const partyStats = politicalPeople.reduce((acc, person) => {
    if (person.political_party) {
      if (!acc[person.political_party]) {
        acc[person.political_party] = {
          total: 0,
          elected: 0,
          candidates: 0,
          supporters: 0,
          influenceSum: 0
        };
      }
      acc[person.political_party].total++;
      if (person.is_elected) acc[person.political_party].elected++;
      if (person.is_candidate) acc[person.political_party].candidates++;
      if (!person.is_candidate && !person.is_elected) acc[person.political_party].supporters++;
      acc[person.political_party].influenceSum += person.influence_level || 3;
    }
    return acc;
  }, {} as Record<string, any>);

  // Top 5 partidos por número de conexões
  const topParties = Object.entries(partyStats)
    .sort((a, b) => b[1].total - a[1].total)
    .slice(0, 5);

  // Pessoas mais influentes politicamente
  const mostInfluential = politicalPeople
    .filter(p => p.influence_level)
    .sort((a, b) => (b.influence_level || 0) - (a.influence_level || 0))
    .slice(0, 10);

  // Potencial de mobilização por proximidade
  const mobilizationPotential = {
    nucleo: politicalPeople.filter(p => p.proximity === 'nucleo').length,
    primeiro: politicalPeople.filter(p => p.proximity === 'primeiro').length,
    segundo: politicalPeople.filter(p => p.proximity === 'segundo').length,
    terceiro: politicalPeople.filter(p => p.proximity === 'terceiro').length,
    total: politicalPeople.filter(p => ['nucleo', 'primeiro', 'segundo'].includes(p.proximity)).length
  };

  // Cores dos partidos (principais)
  const partyColors: Record<string, string> = {
    'PT': '#FF0000',
    'PSDB': '#0080FF',
    'MDB': '#30914D',
    'PP': '#003399',
    'PSD': '#FFA500',
    'PL': '#FF6600',
    'REPUBLICANOS': '#0066CC',
    'UNIÃO': '#0052CC',
    'PSB': '#FF0000',
    'PDT': '#FF0000',
    'PSOL': '#FFCC00',
    'PODE': '#2E8B57',
    'PV': '#00FF00',
    'PCdoB': '#FF0000',
    'NOVO': '#FF6B00',
    'CIDADANIA': '#EC008C'
  };

  return (
    <div className="space-y-6">
      {/* Header com estatísticas gerais */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Político</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{politicalPeople.length}</p>
            </div>
            <Users className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Eleitos</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {politicalPeople.filter(p => p.is_elected).length}
              </p>
            </div>
            <Award className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Candidatos</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {politicalPeople.filter(p => p.is_candidate).length}
              </p>
            </div>
            <Target className="w-8 h-8 text-purple-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Mobilização</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{mobilizationPotential.total}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-orange-500" />
          </div>
        </div>
      </div>

      {/* Distribuição por Partido */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white flex items-center">
          <PieChart className="w-5 h-5 mr-2" />
          Distribuição por Partido
        </h3>
        <div className="space-y-3">
          {topParties.map(([party, stats]) => {
            const percentage = (stats.total / politicalPeople.length * 100).toFixed(1);
            return (
              <div key={party} className="flex items-center justify-between">
                <div className="flex items-center flex-1">
                  <div 
                    className="w-4 h-4 rounded mr-3"
                    style={{ backgroundColor: partyColors[party] || '#666' }}
                  />
                  <span className="font-medium text-gray-900 dark:text-white">{party}</span>
                  <span className="text-sm text-gray-600 dark:text-gray-400 ml-2">
                    ({stats.total} pessoas)
                  </span>
                </div>
                <div className="flex items-center space-x-4">
                  {stats.elected > 0 && (
                    <span className="text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded">
                      {stats.elected} eleitos
                    </span>
                  )}
                  {stats.candidates > 0 && (
                    <span className="text-xs bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 px-2 py-1 rounded">
                      {stats.candidates} candidatos
                    </span>
                  )}
                  <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="h-2 rounded-full transition-all duration-500"
                      style={{ 
                        width: `${percentage}%`,
                        backgroundColor: partyColors[party] || '#666'
                      }}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300 w-12 text-right">
                    {percentage}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Potencial de Mobilização */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white flex items-center">
            <Activity className="w-5 h-5 mr-2" />
            Potencial de Mobilização
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-700 dark:text-gray-300">Núcleo Central</span>
              <div className="flex items-center">
                <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-3 mr-3">
                  <div 
                    className="bg-red-500 h-3 rounded-full"
                    style={{ width: `${(mobilizationPotential.nucleo / politicalPeople.length * 100) || 0}%` }}
                  />
                </div>
                <span className="font-bold text-gray-900 dark:text-white w-8 text-right">
                  {mobilizationPotential.nucleo}
                </span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-700 dark:text-gray-300">Primeiro Círculo</span>
              <div className="flex items-center">
                <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-3 mr-3">
                  <div 
                    className="bg-orange-500 h-3 rounded-full"
                    style={{ width: `${(mobilizationPotential.primeiro / politicalPeople.length * 100) || 0}%` }}
                  />
                </div>
                <span className="font-bold text-gray-900 dark:text-white w-8 text-right">
                  {mobilizationPotential.primeiro}
                </span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-700 dark:text-gray-300">Segundo Círculo</span>
              <div className="flex items-center">
                <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-3 mr-3">
                  <div 
                    className="bg-yellow-500 h-3 rounded-full"
                    style={{ width: `${(mobilizationPotential.segundo / politicalPeople.length * 100) || 0}%` }}
                  />
                </div>
                <span className="font-bold text-gray-900 dark:text-white w-8 text-right">
                  {mobilizationPotential.segundo}
                </span>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-gray-900 dark:text-white">Total Mobilizável</span>
                <span className="text-xl font-bold text-blue-600 dark:text-blue-400">
                  {mobilizationPotential.total}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Top Influenciadores */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white flex items-center">
            <BarChart3 className="w-5 h-5 mr-2" />
            Top 10 Influenciadores Políticos
          </h3>
          <div className="space-y-2">
            {mostInfluential.map((person, index) => (
              <div key={person.id} className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400 w-6">
                    {index + 1}º
                  </span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white ml-2">
                    {person.name}
                  </span>
                  {person.political_party && (
                    <span className="text-xs text-gray-600 dark:text-gray-400 ml-2">
                      ({person.political_party})
                    </span>
                  )}
                </div>
                <div className="flex items-center">
                  {person.is_elected && (
                    <Award className="w-4 h-4 text-green-500 mr-2" />
                  )}
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <span 
                        key={i} 
                        className={`text-xs ${i < (person.influence_level || 0) ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'}`}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Análise de Rede */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white flex items-center">
          <AlertCircle className="w-5 h-5 mr-2" />
          Análise da Rede Política
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {Object.keys(partyStats).length}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Partidos Representados</p>
          </div>
          <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
              {((politicalPeople.filter(p => p.is_elected).length / politicalPeople.length) * 100 || 0).toFixed(0)}%
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Taxa de Eleitos</p>
          </div>
          <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {(politicalPeople.reduce((sum, p) => sum + (p.influence_level || 3), 0) / politicalPeople.length || 0).toFixed(1)}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Influência Média</p>
          </div>
        </div>
      </div>
    </div>
  );
}
