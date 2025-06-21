'use client';

import React from 'react';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  LineChart,
  Line,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
  Area,
  AreaChart
} from 'recharts';
import { TrendingUp, Users, Target, Activity, Award, AlertCircle } from 'lucide-react';

interface Person {
  id: string;
  name: string;
  context: string;
  proximity: string;
  importance?: number;
  occupation?: string;
  political_party?: string;
  contact_frequency?: string;
  last_contact?: string;
}

interface AnalyticsDashboardProps {
  people: Person[];
}

export default function AnalyticsDashboard({ people }: AnalyticsDashboardProps) {
  // Cores para os gráficos
  const COLORS = {
    contexts: {
      residencial: '#10b981',
      profissional: '#3b82f6',
      social: '#8b5cf6',
      servicos: '#f97316',
      institucional: '#6b7280',
      politico: '#ef4444'
    },
    proximity: {
      nucleo: '#dc2626',
      primeiro: '#f97316',
      segundo: '#fbbf24',
      terceiro: '#34d399',
      periferia: '#9ca3af'
    }
  };

  // 1. Distribuição por Contexto
  const contextData = Object.entries(
    people.reduce((acc, person) => {
      acc[person.context] = (acc[person.context] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  ).map(([context, count]) => ({
    name: context.charAt(0).toUpperCase() + context.slice(1),
    value: count,
    percentage: ((count / people.length) * 100).toFixed(1)
  }));

  // 2. Distribuição por Proximidade
  const proximityData = Object.entries(
    people.reduce((acc, person) => {
      acc[person.proximity] = (acc[person.proximity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  ).map(([proximity, count]) => ({
    name: proximity === 'nucleo' ? 'Núcleo' : 
          proximity === 'primeiro' ? '1º Círculo' :
          proximity === 'segundo' ? '2º Círculo' :
          proximity === 'terceiro' ? '3º Círculo' : 'Periferia',
    value: count,
    percentage: ((count / people.length) * 100).toFixed(1)
  }));

  // 3. Top 10 Partidos Políticos
  const partyData = Object.entries(
    people.reduce((acc, person) => {
      if (person.political_party) {
        acc[person.political_party] = (acc[person.political_party] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>)
  )
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([party, count]) => ({
      party,
      count,
      percentage: ((count / people.length) * 100).toFixed(1)
    }));

  // 4. Análise de Importância vs Proximidade
  const importanceProximityData = ['nucleo', 'primeiro', 'segundo', 'terceiro', 'periferia'].map(prox => {
    const peopleInProximity = people.filter(p => p.proximity === prox);
    const avgImportance = peopleInProximity.length > 0
      ? peopleInProximity.reduce((sum, p) => sum + (p.importance || 3), 0) / peopleInProximity.length
      : 0;
    
    return {
      proximity: prox === 'nucleo' ? 'Núcleo' : 
                prox === 'primeiro' ? '1º Círculo' :
                prox === 'segundo' ? '2º Círculo' :
                prox === 'terceiro' ? '3º Círculo' : 'Periferia',
      importancia: Number(avgImportance.toFixed(2)),
      pessoas: peopleInProximity.length
    };
  });

  // 5. Frequência de Contato
  const contactFrequencyData = Object.entries(
    people.reduce((acc, person) => {
      const freq = person.contact_frequency || 'não definido';
      acc[freq] = (acc[freq] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  ).map(([frequency, count]) => ({
    name: frequency === 'daily' ? 'Diário' :
          frequency === 'weekly' ? 'Semanal' :
          frequency === 'monthly' ? 'Mensal' :
          frequency === 'quarterly' ? 'Trimestral' :
          frequency === 'yearly' ? 'Anual' : 'Não definido',
    value: count
  }));

  // 6. Radar Chart - Força da Rede por Contexto
  const radarData = ['residencial', 'profissional', 'social', 'servicos', 'institucional', 'politico'].map(context => {
    const contextPeople = people.filter(p => p.context === context);
    const nucleo = contextPeople.filter(p => p.proximity === 'nucleo').length;
    const primeiro = contextPeople.filter(p => p.proximity === 'primeiro').length;
    const total = contextPeople.length;
    
    // Força = pessoas no núcleo e primeiro círculo / total do contexto
    const strength = total > 0 ? ((nucleo + primeiro) / total) * 100 : 0;
    
    return {
      context: context.charAt(0).toUpperCase() + context.slice(1),
      força: Number(strength.toFixed(1)),
      total
    };
  });

  // 7. Métricas Principais
  const metrics = {
    totalPeople: people.length,
    avgImportance: (people.reduce((sum, p) => sum + (p.importance || 3), 0) / people.length).toFixed(1),
    nucleoPercentage: ((people.filter(p => p.proximity === 'nucleo').length / people.length) * 100).toFixed(1),
    withParty: people.filter(p => p.political_party).length,
    recentContacts: people.filter(p => {
      if (!p.last_contact) return false;
      const lastContact = new Date(p.last_contact);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return lastContact > thirtyDaysAgo;
    }).length
  };

  // 8. Top Profissões
  const occupationData = Object.entries(
    people.reduce((acc, person) => {
      if (person.occupation) {
        acc[person.occupation] = (acc[person.occupation] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>)
  )
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([occupation, count]) => ({
      occupation: occupation.length > 20 ? occupation.substring(0, 20) + '...' : occupation,
      count
    }));

  return (
    <div className="space-y-6">
      {/* Métricas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total de Pessoas</p>
              <p className="text-2xl font-bold text-gray-900">{metrics.totalPeople}</p>
            </div>
            <Users className="h-8 w-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Importância Média</p>
              <p className="text-2xl font-bold text-gray-900">⭐ {metrics.avgImportance}</p>
            </div>
            <Award className="h-8 w-8 text-yellow-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Núcleo Central</p>
              <p className="text-2xl font-bold text-gray-900">{metrics.nucleoPercentage}%</p>
            </div>
            <Target className="h-8 w-8 text-red-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Com Partido</p>
              <p className="text-2xl font-bold text-gray-900">{metrics.withParty}</p>
            </div>
            <Activity className="h-8 w-8 text-purple-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Contatos Recentes</p>
              <p className="text-2xl font-bold text-gray-900">{metrics.recentContacts}</p>
              <p className="text-xs text-gray-500">Últimos 30 dias</p>
            </div>
            <TrendingUp className="h-8 w-8 text-green-500" />
          </div>
        </div>
      </div>

      {/* Gráficos - Linha 1 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Distribuição por Contexto */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Distribuição por Contexto</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={contextData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percentage }) => `${name} (${percentage}%)`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {contextData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS.contexts[entry.name.toLowerCase()] || '#94a3b8'} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Distribuição por Proximidade */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Círculos de Proximidade</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={proximityData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#3b82f6">
                {proximityData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={
                    entry.name === 'Núcleo' ? COLORS.proximity.nucleo :
                    entry.name === '1º Círculo' ? COLORS.proximity.primeiro :
                    entry.name === '2º Círculo' ? COLORS.proximity.segundo :
                    entry.name === '3º Círculo' ? COLORS.proximity.terceiro :
                    COLORS.proximity.periferia
                  } />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Gráficos - Linha 2 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Força da Rede por Contexto */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Força da Rede por Contexto</h3>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={radarData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="context" />
              <PolarRadiusAxis angle={90} domain={[0, 100]} />
              <Radar name="Força %" dataKey="força" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.6} />
              <Tooltip />
            </RadarChart>
          </ResponsiveContainer>
          <p className="text-sm text-gray-600 mt-2">
            * Força = % de pessoas no núcleo e 1º círculo em cada contexto
          </p>
        </div>

        {/* Importância vs Proximidade */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Importância Média por Proximidade</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={importanceProximityData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="proximity" />
              <YAxis domain={[0, 5]} />
              <Tooltip />
              <Area type="monotone" dataKey="importancia" stroke="#f59e0b" fill="#fbbf24" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Gráficos - Linha 3 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Top Partidos */}
        {partyData.length > 0 && (
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">Top 10 Partidos Políticos</h3>
            <div className="space-y-2">
              {partyData.map((party, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm font-medium">{party.party}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">{party.count}</span>
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-red-600 h-2 rounded-full"
                        style={{ width: `${party.percentage}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Frequência de Contato */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Frequência de Contato</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={contactFrequencyData}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={80}
                fill="#8884d8"
                paddingAngle={5}
                dataKey="value"
              >
                {contactFrequencyData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={
                    entry.name === 'Diário' ? '#10b981' :
                    entry.name === 'Semanal' ? '#3b82f6' :
                    entry.name === 'Mensal' ? '#f59e0b' :
                    entry.name === 'Trimestral' ? '#8b5cf6' :
                    entry.name === 'Anual' ? '#ef4444' : '#6b7280'
                  } />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Top Profissões */}
        {occupationData.length > 0 && (
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">Top Profissões</h3>
            <div className="space-y-2">
              {occupationData.map((occ, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm">{occ.occupation}</span>
                  <span className="text-sm font-semibold text-gray-700">{occ.count}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Alertas e Recomendações */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <div className="flex items-start">
          <AlertCircle className="h-6 w-6 text-yellow-600 mr-3 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-lg font-semibold text-yellow-800 mb-2">Insights e Recomendações</h3>
            <ul className="space-y-2 text-sm text-yellow-700">
              {metrics.nucleoPercentage < 10 && (
                <li>• Seu núcleo central representa apenas {metrics.nucleoPercentage}% da rede. Considere fortalecer relacionamentos próximos.</li>
              )}
              {contextData.some(c => c.value === 0) && (
                <li>• Você tem contextos vazios. Explore novas áreas para diversificar sua rede.</li>
              )}
              {metrics.recentContacts < people.length * 0.2 && (
                <li>• Apenas {((metrics.recentContacts / people.length) * 100).toFixed(0)}% dos contatos foram realizados nos últimos 30 dias.</li>
              )}
              {occupationData.length < 5 && (
                <li>• Baixa diversidade profissional. Considere expandir para diferentes áreas.</li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
