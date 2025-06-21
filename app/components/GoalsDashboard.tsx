'use client';

import React, { useState, useMemo } from 'react';
import { Target, TrendingUp, Users, Calendar, CheckCircle, Clock } from 'lucide-react';

interface Person {
  id: string;
  name: string;
  city?: string;
  political_party?: string;
  created_at?: string;
}

interface GoalsDashboardProps {
  people: Person[];
  affiliatesData?: any[];
}

function GoalsDashboard({ people = [], affiliatesData = [] }: GoalsDashboardProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<'day' | 'week' | 'month'>('month');

  // Calcular estatísticas
  const stats = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    // Contar cadastros
    const todayCount = people.filter(p => {
      if (!p.created_at) return false;
      const date = new Date(p.created_at);
      return date >= today;
    }).length;

    const weekCount = people.filter(p => {
      if (!p.created_at) return false;
      const date = new Date(p.created_at);
      return date >= weekAgo;
    }).length;

    const monthCount = people.filter(p => {
      if (!p.created_at) return false;
      const date = new Date(p.created_at);
      return date >= monthStart;
    }).length;

    // Metas
    const dailyGoal = 10;
    const weeklyGoal = 70;
    const monthlyGoal = 300;

    return {
      today: {
        count: todayCount,
        goal: dailyGoal,
        percentage: Math.min((todayCount / dailyGoal) * 100, 100)
      },
      week: {
        count: weekCount,
        goal: weeklyGoal,
        percentage: Math.min((weekCount / weeklyGoal) * 100, 100)
      },
      month: {
        count: monthCount,
        goal: monthlyGoal,
        percentage: Math.min((monthCount / monthlyGoal) * 100, 100)
      }
    };
  }, [people]);

  // Progresso diário dos últimos 7 dias
  const weekProgress = useMemo(() => {
    const days = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      
      const nextDay = new Date(date);
      nextDay.setDate(nextDay.getDate() + 1);
      
      const count = people.filter(p => {
        if (!p.created_at) return false;
        const pDate = new Date(p.created_at);
        return pDate >= date && pDate < nextDay;
      }).length;
      
      days.push({
        day: date.toLocaleDateString('pt-BR', { weekday: 'short' }),
        count
      });
    }
    
    return days;
  }, [people]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
          <Target className="w-8 h-8 text-blue-500" />
          Metas e Progresso
        </h2>
      </div>

      {/* Cards de Metas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Hoje */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Hoje</p>
              <p className="text-3xl font-bold">
                {stats.today.count}/{stats.today.goal}
              </p>
            </div>
            {stats.today.percentage >= 100 ? (
              <CheckCircle className="w-8 h-8 text-green-500" />
            ) : (
              <Clock className="w-8 h-8 text-blue-500" />
            )}
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
            <div 
              className={`h-3 rounded-full transition-all ${
                stats.today.percentage >= 100 ? 'bg-green-500' : 'bg-blue-500'
              }`}
              style={{ width: `${stats.today.percentage}%` }}
            />
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            {stats.today.percentage.toFixed(0)}% da meta diária
          </p>
        </div>

        {/* Semana */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Esta Semana</p>
              <p className="text-3xl font-bold">
                {stats.week.count}/{stats.week.goal}
              </p>
            </div>
            <Calendar className="w-8 h-8 text-purple-500" />
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
            <div 
              className="bg-purple-500 h-3 rounded-full transition-all"
              style={{ width: `${stats.week.percentage}%` }}
            />
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            {stats.week.percentage.toFixed(0)}% da meta semanal
          </p>
        </div>

        {/* Mês */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Este Mês</p>
              <p className="text-3xl font-bold">
                {stats.month.count}/{stats.month.goal}
              </p>
            </div>
            <TrendingUp className="w-8 h-8 text-green-500" />
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
            <div 
              className="bg-green-500 h-3 rounded-full transition-all"
              style={{ width: `${stats.month.percentage}%` }}
            />
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            {stats.month.percentage.toFixed(0)}% da meta mensal
          </p>
        </div>
      </div>

      {/* Progresso Semanal */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Cadastros nos Últimos 7 Dias</h3>
        <div className="flex items-end justify-between h-32 gap-2">
          {weekProgress.map((day, index) => (
            <div key={index} className="flex-1 flex flex-col items-center">
              <div 
                className="w-full bg-blue-500 rounded-t transition-all hover:bg-blue-600"
                style={{ 
                  height: `${day.count > 0 ? (day.count / 10) * 100 : 10}%`,
                  minHeight: '4px'
                }}
              />
              <p className="text-xs mt-1">{day.day}</p>
              <p className="text-xs font-bold">{day.count}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Resumo */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Resumo do Progresso</h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-gray-600 dark:text-gray-400">Total de Cadastros</span>
            <span className="font-bold">{people.length}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600 dark:text-gray-400">Média Diária (7 dias)</span>
            <span className="font-bold">
              {(weekProgress.reduce((sum, day) => sum + day.count, 0) / 7).toFixed(1)}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600 dark:text-gray-400">Projeção Mensal</span>
            <span className="font-bold">
              {Math.round((stats.month.count / new Date().getDate()) * 30)}
            </span>
          </div>
        </div>
      </div>

      {/* Top Usuários (simulado) */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Users className="w-5 h-5 text-purple-500" />
          Ranking de Cadastradores
        </h3>
        <div className="space-y-3">
          {[
            { name: 'Você', count: stats.month.count },
            { name: 'Usuário 2', count: Math.floor(Math.random() * 50) + 20 },
            { name: 'Usuário 3', count: Math.floor(Math.random() * 40) + 10 },
          ].sort((a, b) => b.count - a.count).map((user, index) => (
            <div key={user.name} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  index === 0 ? 'bg-yellow-100 text-yellow-700' :
                  index === 1 ? 'bg-gray-100 text-gray-700' :
                  'bg-orange-100 text-orange-700'
                }`}>
                  {index + 1}º
                </span>
                <span className="font-medium">{user.name}</span>
              </div>
              <span className="font-bold">{user.count} cadastros</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default GoalsDashboard;
