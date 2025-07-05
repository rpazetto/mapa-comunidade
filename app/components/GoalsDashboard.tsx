// app/components/GoalsDashboard.tsx
import React, { useState, useMemo } from 'react';
import { Target, Users, TrendingUp, TrendingDown, MapPin, Briefcase, Calendar, Award, AlertTriangle, CheckCircle, BarChart3, PieChart } from 'lucide-react';

interface Person {
  id: string;
  name: string;
  context: string;
  proximity: string;
  importance?: number;
  trust_level?: number;
  influence_level?: number;
  occupation?: string;
  professional_class?: string;
  political_party?: string;
  birth_date?: string;
  city?: string;
  neighborhood?: string;
  contact_frequency?: string;
  last_contact?: string;
}

interface GoalsDashboardProps {
  people: Person[];
  affiliatesData: any[];
  classesProfissionais: { valor: string; label: string }[];
  bairrosGramado: string[];
  proximityLevels: { value: string; label: string; color: string; priority: number }[];
}

const GoalsDashboard: React.FC<GoalsDashboardProps> = ({ 
  people, 
  affiliatesData, 
  classesProfissionais, 
  bairrosGramado,
  proximityLevels 
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'segments' | 'age' | 'geographic' | 'goals'>('overview');

  // Filtrar apenas apoiadores/simpatizantes (proximidade política relevante)
  const supporters = people.filter(p => 
    ['nucleo', 'primeiro', 'segundo', 'terceiro', 'grupo1'].includes(p.proximity)
  );

  // Calcular idade das pessoas
  const calculateAge = (birthDate: string): number => {
    if (!birthDate) return 0;
    const birth = new Date(birthDate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  // Análise por Segmento Profissional
  const segmentAnalysis = useMemo(() => {
    if (!classesProfissionais || !Array.isArray(classesProfissionais)) {
      return [];
    }

    const segmentData = classesProfissionais.map(classe => {
      const segmentSupporters = supporters.filter(p => p.professional_class === classe.valor);
      const totalPeople = people.filter(p => p.professional_class === classe.valor).length;
      
      const penetration = totalPeople > 0 ? (segmentSupporters.length / totalPeople) * 100 : 0;
      const influence = segmentSupporters.reduce((sum, p) => sum + (p.influence_level || 3), 0) / (segmentSupporters.length || 1);
      const trust = segmentSupporters.reduce((sum, p) => sum + (p.trust_level || 3), 0) / (segmentSupporters.length || 1);
      
      return {
        segment: classe.label,
        supporters: segmentSupporters.length,
        totalPeople,
        penetration: parseFloat(penetration.toFixed(1)),
        influence: parseFloat(influence.toFixed(1)),
        trust: parseFloat(trust.toFixed(1)),
        quality: parseFloat(((influence + trust) / 2).toFixed(1))
      };
    }).filter(s => s.supporters > 0).sort((a, b) => b.supporters - a.supporters);

    return segmentData;
  }, [supporters, people, classesProfissionais]);

  // Análise por Faixa Etária
  const ageAnalysis = useMemo(() => {
    const ageGroups = [
      { label: '18-25 anos', min: 18, max: 25 },
      { label: '26-35 anos', min: 26, max: 35 },
      { label: '36-45 anos', min: 36, max: 45 },
      { label: '46-55 anos', min: 46, max: 55 },
      { label: '56-65 anos', min: 56, max: 65 },
      { label: '65+ anos', min: 66, max: 120 }
    ];

    return ageGroups.map(group => {
      const groupSupporters = supporters.filter(p => {
        if (!p.birth_date) return false;
        const age = calculateAge(p.birth_date);
        return age >= group.min && age <= group.max;
      });

      const totalInAge = people.filter(p => {
        if (!p.birth_date) return false;
        const age = calculateAge(p.birth_date);
        return age >= group.min && age <= group.max;
      }).length;

      const penetration = totalInAge > 0 ? (groupSupporters.length / totalInAge) * 100 : 0;
      const avgInfluence = groupSupporters.length > 0 
        ? groupSupporters.reduce((sum, p) => sum + (p.influence_level || 3), 0) / groupSupporters.length 
        : 0;

      return {
        ageGroup: group.label,
        supporters: groupSupporters.length,
        totalPeople: totalInAge,
        penetration: parseFloat(penetration.toFixed(1)),
        influence: parseFloat(avgInfluence.toFixed(1))
      };
    }).filter(g => g.supporters > 0);
  }, [supporters, people]);

  // Análise Geográfica
  const geographicAnalysis = useMemo(() => {
    if (!bairrosGramado || !Array.isArray(bairrosGramado)) {
      return [];
    }

    const neighborhoodData = bairrosGramado.map(bairro => {
      const bairroSupporters = supporters.filter(p => p.neighborhood === bairro);
      const totalInBairro = people.filter(p => p.neighborhood === bairro).length;
      
      const penetration = totalInBairro > 0 ? (bairroSupporters.length / totalInBairro) * 100 : 0;
      const avgImportance = bairroSupporters.length > 0 
        ? bairroSupporters.reduce((sum, p) => sum + (p.importance || 3), 0) / bairroSupporters.length 
        : 0;

      return {
        neighborhood: bairro,
        supporters: bairroSupporters.length,
        totalPeople: totalInBairro,
        penetration: parseFloat(penetration.toFixed(1)),
        importance: parseFloat(avgImportance.toFixed(1))
      };
    }).filter(n => n.supporters > 0).sort((a, b) => b.supporters - a.supporters);

    return neighborhoodData;
  }, [supporters, people, bairrosGramado]);

  // Métricas de Sustentação Geral
  const sustainabilityMetrics = useMemo(() => {
    const totalSupporters = supporters.length;
    const totalPeople = people.length;
    const overallPenetration = totalPeople > 0 ? (totalSupporters / totalPeople) * 100 : 0;

    // Qualidade do apoio por círculo
    const coreSupport = supporters.filter(p => p.proximity === 'nucleo').length;
    const activeSupport = supporters.filter(p => ['nucleo', 'primeiro'].includes(p.proximity)).length;
    const broadSupport = supporters.filter(p => ['terceiro', 'grupo1'].includes(p.proximity)).length;

    // Frequência de contato
    const recentContact = supporters.filter(p => {
      if (!p.last_contact) return false;
      const lastContact = new Date(p.last_contact);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return lastContact >= thirtyDaysAgo;
    }).length;

    const contactRate = totalSupporters > 0 ? (recentContact / totalSupporters) * 100 : 0;

    return {
      totalSupporters,
      overallPenetration: parseFloat(overallPenetration.toFixed(1)),
      coreSupport,
      activeSupport,
      broadSupport,
      contactRate: parseFloat(contactRate.toFixed(1)),
      avgInfluence: supporters.length > 0 
        ? parseFloat((supporters.reduce((sum, p) => sum + (p.influence_level || 3), 0) / supporters.length).toFixed(1))
        : 0,
      avgTrust: supporters.length > 0 
        ? parseFloat((supporters.reduce((sum, p) => sum + (p.trust_level || 3), 0) / supporters.length).toFixed(1))
        : 0
    };
  }, [supporters, people]);

  // Metas de Crescimento (exemplo)
  const growthGoals = [
    {
      category: 'Penetração Geral',
      current: sustainabilityMetrics.overallPenetration,
      target: 25,
      unit: '%',
      priority: 'alta'
    },
    {
      category: 'Núcleo Central',
      current: sustainabilityMetrics.coreSupport,
      target: 15,
      unit: 'pessoas',
      priority: 'crítica'
    },
    {
      category: 'Apoio Ativo',
      current: sustainabilityMetrics.activeSupport,
      target: 50,
      unit: 'pessoas',
      priority: 'alta'
    },
    {
      category: 'Taxa de Contato',
      current: sustainabilityMetrics.contactRate,
      target: 70,
      unit: '%',
      priority: 'média'
    }
  ];

  const getProgressColor = (current: number, target: number) => {
    const percentage = (current / target) * 100;
    if (percentage >= 80) return 'bg-green-500';
    if (percentage >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'crítica': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'alta': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'média': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
              <Target className="w-6 h-6 mr-3 text-blue-600" />
              Análise de Sustentação Política
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Medição da penetração e qualidade do apoio por clusters demográficos
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
          {[
            { id: 'overview', label: 'Visão Geral', icon: BarChart3 },
            { id: 'segments', label: 'Segmentos', icon: Briefcase },
            { id: 'age', label: 'Faixa Etária', icon: Calendar },
            { id: 'geographic', label: 'Geográfico', icon: MapPin },
            { id: 'goals', label: 'Metas', icon: Target }
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4 mr-2" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center">
              <Users className="w-8 h-8 text-blue-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total de Apoiadores</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{sustainabilityMetrics.totalSupporters}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center">
              <TrendingUp className="w-8 h-8 text-green-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Penetração Geral</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{sustainabilityMetrics.overallPenetration}%</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center">
              <Award className="w-8 h-8 text-purple-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Núcleo Central</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{sustainabilityMetrics.coreSupport}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center">
              <CheckCircle className="w-8 h-8 text-orange-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Taxa de Contato</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{sustainabilityMetrics.contactRate}%</p>
              </div>
            </div>
          </div>

          {/* Distribuição por Círculo */}
          <div className="col-span-full bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Distribuição de Apoio por Círculo</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {proximityLevels && proximityLevels.filter(level => ['nucleo', 'primeiro', 'segundo', 'terceiro', 'grupo1'].includes(level.value)).map(level => {
                const count = supporters.filter(p => p.proximity === level.value).length;
                const percentage = sustainabilityMetrics.totalSupporters > 0 ? (count / sustainabilityMetrics.totalSupporters) * 100 : 0;
                return (
                  <div key={level.value} className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium mb-2 ${level.color}`}>
                      {level.label}
                    </div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{count}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{percentage.toFixed(1)}%</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Segments Tab */}
      {activeTab === 'segments' && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Penetração por Segmento Profissional</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Análise da sustentação política por classe profissional</p>
          </div>
          {segmentAnalysis.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Segmento</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Apoiadores</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Penetração</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Influência Média</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Confiança Média</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Qualidade</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {segmentAnalysis.map((segment, index) => (
                    <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900 dark:text-white">{segment.segment}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">{segment.totalPeople} total</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">{segment.supporters}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="text-sm font-medium text-gray-900 dark:text-white mr-2">{segment.penetration}%</div>
                          <div className="w-16 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${segment.penetration >= 50 ? 'bg-green-500' : segment.penetration >= 25 ? 'bg-yellow-500' : 'bg-red-500'}`}
                              style={{width: `${Math.min(segment.penetration, 100)}%`}}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex">
                          {[...Array(Math.round(segment.influence))].map((_, i) => (
                            <span key={i} className="text-yellow-400">⭐</span>
                          ))}
                          <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">{segment.influence}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex">
                          {[...Array(Math.round(segment.trust))].map((_, i) => (
                            <span key={i} className="text-blue-400">🔒</span>
                          ))}
                          <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">{segment.trust}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          segment.quality >= 4 ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                          segment.quality >= 3 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                          'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        }`}>
                          {segment.quality}/5
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-6 text-center">
              <Briefcase className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">Nenhum dado de segmento disponível</p>
              <p className="text-sm text-gray-400 dark:text-gray-500">Adicione informações profissionais às pessoas para ver a análise por segmento</p>
            </div>
          )}
        </div>
      )}

      {/* Age Tab */}
      {activeTab === 'age' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Distribuição por Faixa Etária</h3>
            <div className="space-y-4">
              {ageAnalysis.map((age, index) => (
                <div key={index} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium text-gray-900 dark:text-white">{age.ageGroup}</span>
                    <span className="text-lg font-bold text-blue-600 dark:text-blue-400">{age.supporters}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-2">
                    <span>Penetração: {age.penetration}%</span>
                    <span className="mx-2">•</span>
                    <span>Influência: {age.influence}/5</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${age.penetration >= 30 ? 'bg-green-500' : age.penetration >= 15 ? 'bg-yellow-500' : 'bg-red-500'}`}
                      style={{width: `${Math.min(age.penetration, 100)}%`}}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Análise Geracional</h3>
            <div className="space-y-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <h4 className="font-medium text-blue-900 dark:text-blue-300 mb-2">Jovens (18-35 anos)</h4>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  {ageAnalysis.filter(a => a.ageGroup.includes('18-25') || a.ageGroup.includes('26-35')).reduce((sum, a) => sum + a.supporters, 0)} apoiadores
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Importante para sustentação futura do projeto
                </p>
              </div>

              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                <h4 className="font-medium text-green-900 dark:text-green-300 mb-2">Adultos (36-55 anos)</h4>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  {ageAnalysis.filter(a => a.ageGroup.includes('36-45') || a.ageGroup.includes('46-55')).reduce((sum, a) => sum + a.supporters, 0)} apoiadores
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Base eleitoral mais ativa e influente
                </p>
              </div>

              <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                <h4 className="font-medium text-purple-900 dark:text-purple-300 mb-2">Idosos (56+ anos)</h4>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  {ageAnalysis.filter(a => a.ageGroup.includes('56-65') || a.ageGroup.includes('65+')).reduce((sum, a) => sum + a.supporters, 0)} apoiadores
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Maior taxa de comparecimento eleitoral
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Geographic Tab */}
      {activeTab === 'geographic' && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Sustentação por Bairro/Região</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Mapeamento territorial do apoio político</p>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {geographicAnalysis.slice(0, 12).map((geo, index) => (
                <div key={index} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">{geo.neighborhood}</h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{geo.totalPeople} residentes</p>
                    </div>
                    <span className="text-xl font-bold text-blue-600 dark:text-blue-400">{geo.supporters}</span>
                  </div>
                  
                  <div className="mb-3">
                    <div className="flex justify-between items-center text-sm mb-1">
                      <span className="text-gray-600 dark:text-gray-400">Penetração</span>
                      <span className="font-medium text-gray-900 dark:text-white">{geo.penetration}%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${geo.penetration >= 40 ? 'bg-green-500' : geo.penetration >= 20 ? 'bg-yellow-500' : 'bg-red-500'}`}
                        style={{width: `${Math.min(geo.penetration, 100)}%`}}
                      />
                    </div>
                  </div>

                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <span>Importância: {geo.importance}/5</span>
                    <div className="ml-2 flex">
                      {[...Array(Math.round(geo.importance))].map((_, i) => (
                        <span key={i} className="text-yellow-400 text-xs">⭐</span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {geographicAnalysis.length === 0 && (
              <div className="text-center py-8">
                <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">Nenhum dado geográfico disponível</p>
                <p className="text-sm text-gray-400 dark:text-gray-500">Adicione informações de bairro às pessoas para ver a análise territorial</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Goals Tab */}
      {activeTab === 'goals' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Metas de Crescimento</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {growthGoals.map((goal, index) => {
                const progress = Math.min((goal.current / goal.target) * 100, 100);
                return (
                  <div key={index} className="border border-gray-200 dark:border-gray-600 rounded-lg p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">{goal.category}</h4>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(goal.priority)}`}>
                          {goal.priority}
                        </span>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                          {goal.current}{goal.unit}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Meta: {goal.target}{goal.unit}
                        </p>
                      </div>
                    </div>
                    
                    <div className="mb-2">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600 dark:text-gray-400">Progresso</span>
                        <span className="font-medium text-gray-900 dark:text-white">{progress.toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-3">
                        <div 
                          className={`h-3 rounded-full transition-all duration-500 ${getProgressColor(goal.current, goal.target)}`}
                          style={{width: `${progress}%`}}
                        />
                      </div>
                    </div>

                    {progress < 50 && (
                      <div className="flex items-center text-sm text-orange-600 dark:text-orange-400 mt-2">
                        <AlertTriangle className="w-4 h-4 mr-1" />
                        Atenção necessária
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recomendações Estratégicas */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recomendações Estratégicas</h3>
            <div className="space-y-4">
              {sustainabilityMetrics.overallPenetration < 15 && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                  <div className="flex">
                    <AlertTriangle className="w-5 h-5 text-red-400 mr-3" />
                    <div>
                      <h4 className="font-medium text-red-800 dark:text-red-300">Penetração Baixa</h4>
                      <p className="text-sm text-red-700 dark:text-red-400">
                        A penetração geral está abaixo do ideal. Foque em expandir a base de apoiadores.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {sustainabilityMetrics.coreSupport < 10 && (
                <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
                  <div className="flex">
                    <AlertTriangle className="w-5 h-5 text-orange-400 mr-3" />
                    <div>
                      <h4 className="font-medium text-orange-800 dark:text-orange-300">Núcleo Pequeno</h4>
                      <p className="text-sm text-orange-700 dark:text-orange-400">
                        O núcleo central precisa ser fortalecido. Identifique e cultive lideranças locais.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {sustainabilityMetrics.contactRate < 50 && (
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                  <div className="flex">
                    <AlertTriangle className="w-5 h-5 text-yellow-400 mr-3" />
                    <div>
                      <h4 className="font-medium text-yellow-800 dark:text-yellow-300">Baixa Frequência de Contato</h4>
                      <p className="text-sm text-yellow-700 dark:text-yellow-400">
                        Muitos apoiadores não tiveram contato recente. Implemente rotina de relacionamento.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {segmentAnalysis.length < 5 && (
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <div className="flex">
                    <CheckCircle className="w-5 h-5 text-blue-400 mr-3" />
                    <div>
                      <h4 className="font-medium text-blue-800 dark:text-blue-300">Diversificar Segmentos</h4>
                      <p className="text-sm text-blue-700 dark:text-blue-400">
                        Explore novos segmentos profissionais para ampliar a base de apoio.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GoalsDashboard;
