import React, { useState, useEffect } from 'react';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  Users, 
  AlertCircle, 
  Bell, 
  CheckCircle, 
  XCircle,
  ChevronLeft,
  ChevronRight,
  Plus,
  Edit,
  Trash2,
  FileText,
  UserPlus,
  Vote,
  Briefcase,
  CalendarDays,
  Timer,
  Target,
  TrendingUp,
  AlertTriangle,
  Phone,
  Gift
} from 'lucide-react';

interface Person {
  id: string;
  name: string;
  nickname?: string;
  birth_date?: string;
  last_contact?: string;
  contact_frequency?: string;
  political_party?: string;
  is_candidate?: boolean;
  mobile?: string;
  email?: string;
  importance?: number;
}

interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  type: 'contact' | 'birthday' | 'deadline' | 'election' | 'window' | 'meeting' | 'conference' | 'campaign';
  personId?: string;
  description?: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status?: 'pending' | 'completed' | 'missed';
  reminder?: number; // dias antes para lembrar
}

interface ElectoralDeadline {
  id: string;
  title: string;
  date: string;
  type: 'window_open' | 'window_close' | 'registration' | 'campaign_start' | 'campaign_end' | 'election' | 'convention';
  description: string;
  mandatory: boolean;
  daysNotice: number;
}

interface PoliticalCalendarProps {
  people: Person[];
  onContactPerson?: (person: Person) => void;
  onEditPerson?: (person: Person) => void;
}

const PoliticalCalendar: React.FC<PoliticalCalendarProps> = ({ 
  people, 
  onContactPerson,
  onEditPerson 
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [showEventModal, setShowEventModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [filter, setFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'agenda'>('month');

  // Deadlines eleitorais atualizados para 2025/2026
  const electoralDeadlines: ElectoralDeadline[] = [
    // === ELEIÇÕES 2024 (já realizadas) ===
    {
      id: 'elec2024',
      title: '✅ Eleições Municipais 2024 - Realizadas',
      date: '2024-10-06',
      type: 'election',
      description: 'Eleições municipais foram realizadas',
      mandatory: true,
      daysNotice: 0
    },
    
    // === JANELA PARTIDÁRIA 2025 ===
    {
      id: 'window2025-alert',
      title: '🔔 Preparação para Janela Partidária',
      date: '2025-02-15',
      type: 'window_open',
      description: 'Início do período de análise para mudanças partidárias',
      mandatory: false,
      daysNotice: 14
    },
    {
      id: 'window2025-open',
      title: '🚪 Abertura da Janela Partidária',
      date: '2025-03-07',
      type: 'window_open',
      description: 'Início do período para mudança de partido sem perda de mandato para vereadores e deputados',
      mandatory: true,
      daysNotice: 30
    },
    {
      id: 'window2025-close',
      title: '🔒 Fechamento da Janela Partidária',
      date: '2025-04-06',
      type: 'window_close',
      description: 'Último dia para mudança de partido sem perda de mandato',
      mandatory: true,
      daysNotice: 7
    },
    
    // === ELEIÇÕES 2026 - PRAZOS ===
    {
      id: 'desincomp2026',
      title: '📋 Desincompatibilização - 6 meses',
      date: '2026-04-03',
      type: 'registration',
      description: 'Prazo para desincompatibilização de cargos que exigem 6 meses de afastamento',
      mandatory: true,
      daysNotice: 30
    },
    {
      id: 'filiacao2026',
      title: '📝 Prazo Final de Filiação Partidária',
      date: '2026-04-04',
      type: 'registration',
      description: 'Último dia para filiação partidária para candidatos nas eleições 2026',
      mandatory: true,
      daysNotice: 60
    },
    {
      id: 'domicilio2026',
      title: '🏠 Prazo de Domicílio Eleitoral',
      date: '2026-04-04',
      type: 'registration',
      description: 'Data limite para transferência de domicílio eleitoral',
      mandatory: true,
      daysNotice: 30
    },
    {
      id: 'conv2026-inicio',
      title: '🎯 Início das Convenções Partidárias',
      date: '2026-07-20',
      type: 'convention',
      description: 'Início do período para realização de convenções partidárias para escolha de candidatos',
      mandatory: true,
      daysNotice: 60
    },
    {
      id: 'conv2026-fim',
      title: '🏁 Fim das Convenções Partidárias',
      date: '2026-08-05',
      type: 'convention',
      description: 'Último dia para realização de convenções partidárias',
      mandatory: true,
      daysNotice: 15
    },
    {
      id: 'reg2026',
      title: '📄 Prazo Final - Registro de Candidaturas',
      date: '2026-08-15',
      type: 'registration',
      description: 'Último dia para registro de candidaturas no TSE para eleições gerais',
      mandatory: true,
      daysNotice: 30
    },
    {
      id: 'camp2026-inicio',
      title: '📢 Início da Campanha Eleitoral',
      date: '2026-08-16',
      type: 'campaign_start',
      description: 'Início oficial do período de campanha eleitoral - propaganda permitida',
      mandatory: true,
      daysNotice: 15
    },
    {
      id: 'camp2026-tv',
      title: '📺 Início da Propaganda na TV/Rádio',
      date: '2026-08-28',
      type: 'campaign_start',
      description: 'Início da propaganda eleitoral gratuita no rádio e televisão',
      mandatory: true,
      daysNotice: 7
    },
    {
      id: 'camp2026-fim',
      title: '🛑 Fim da Campanha - 1º Turno',
      date: '2026-10-03',
      type: 'campaign_end',
      description: 'Último dia de campanha antes do 1º turno',
      mandatory: true,
      daysNotice: 3
    },
    {
      id: 'elec2026-1',
      title: '🗳️ ELEIÇÕES GERAIS - 1º TURNO',
      date: '2026-10-04',
      type: 'election',
      description: 'Eleições para Presidente, Governadores, Senadores, Deputados Federais e Estaduais',
      mandatory: true,
      daysNotice: 60
    },
    {
      id: 'camp2026-2t-inicio',
      title: '📢 Início Campanha 2º Turno',
      date: '2026-10-05',
      type: 'campaign_start',
      description: 'Início da campanha para 2º turno (se houver)',
      mandatory: false,
      daysNotice: 1
    },
    {
      id: 'camp2026-2t-fim',
      title: '🛑 Fim da Campanha - 2º Turno',
      date: '2026-10-24',
      type: 'campaign_end',
      description: 'Último dia de campanha antes do 2º turno',
      mandatory: false,
      daysNotice: 3
    },
    {
      id: 'elec2026-2',
      title: '🗳️ ELEIÇÕES GERAIS - 2º TURNO',
      date: '2026-10-25',
      type: 'election',
      description: 'Segundo turno para Presidente e Governadores (se necessário)',
      mandatory: false,
      daysNotice: 30
    },
    
    // === DATAS IMPORTANTES 2025 ===
    {
      id: 'conf2025-1',
      title: '🎤 Conferência Municipal PP',
      date: '2025-05-15',
      type: 'conference',
      description: 'Conferência municipal do Partido Progressistas',
      mandatory: false,
      daysNotice: 30
    },
    {
      id: 'conf2025-2',
      title: '🎤 Encontro Estadual de Lideranças',
      date: '2025-07-20',
      type: 'conference',
      description: 'Encontro estadual para alinhamento político',
      mandatory: false,
      daysNotice: 45
    }
  ];

  // Gerar eventos de contato baseados na frequência
  useEffect(() => {
    generateContactEvents();
    generateBirthdayEvents();
  }, [people]);

  // Debug dos eventos
  useEffect(() => {
    console.log('🗳️ Debug Calendário Político:');
    console.log('Total de eventos:', events.length);
    console.log('Eventos por tipo:', {
      contact: events.filter(e => e.type === 'contact').length,
      birthday: events.filter(e => e.type === 'birthday').length,
      deadline: events.filter(e => e.type === 'deadline').length,
      election: events.filter(e => e.type === 'election').length,
      window: events.filter(e => e.type === 'window').length,
      meeting: events.filter(e => e.type === 'meeting').length,
      conference: events.filter(e => e.type === 'conference').length,
      campaign: events.filter(e => e.type === 'campaign').length
    });
    
    // Listar próximos eventos políticos
    const politicalEvents = events.filter(e => 
      ['deadline', 'election', 'window', 'campaign', 'convention'].includes(e.type)
    ).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    console.log('Próximos eventos políticos:', politicalEvents.slice(0, 5));
  }, [events]);

  const generateContactEvents = () => {
    const contactEvents: CalendarEvent[] = [];
    const today = new Date();

    people.forEach(person => {
      if (person.contact_frequency && person.last_contact) {
        const lastContact = new Date(person.last_contact);
        let nextContact = new Date(lastContact);

        // Calcular próximo contato baseado na frequência
        switch (person.contact_frequency) {
          case 'daily':
            nextContact.setDate(nextContact.getDate() + 1);
            break;
          case 'weekly':
            nextContact.setDate(nextContact.getDate() + 7);
            break;
          case 'monthly':
            nextContact.setMonth(nextContact.getMonth() + 1);
            break;
          case 'quarterly':
            nextContact.setMonth(nextContact.getMonth() + 3);
            break;
          case 'yearly':
            nextContact.setFullYear(nextContact.getFullYear() + 1);
            break;
        }

        // Se o próximo contato já passou, calcular o próximo
        while (nextContact < today) {
          switch (person.contact_frequency) {
            case 'daily':
              nextContact.setDate(nextContact.getDate() + 1);
              break;
            case 'weekly':
              nextContact.setDate(nextContact.getDate() + 7);
              break;
            case 'monthly':
              nextContact.setMonth(nextContact.getMonth() + 1);
              break;
            case 'quarterly':
              nextContact.setMonth(nextContact.getMonth() + 3);
              break;
            case 'yearly':
              nextContact.setFullYear(nextContact.getFullYear() + 1);
              break;
          }
        }

        const daysSinceLastContact = Math.floor((today.getTime() - lastContact.getTime()) / (1000 * 60 * 60 * 24));
        const isOverdue = nextContact < today;

        contactEvents.push({
          id: `contact-${person.id}`,
          title: `Contatar ${person.name}`,
          date: nextContact.toISOString().split('T')[0],
          type: 'contact',
          personId: person.id,
          description: `Último contato há ${daysSinceLastContact} dias`,
          priority: person.importance === 5 ? 'critical' : 
                   person.importance === 4 ? 'high' : 
                   person.importance === 3 ? 'medium' : 'low',
          status: isOverdue ? 'missed' : 'pending',
          reminder: person.importance >= 4 ? 3 : 1
        });
      }
    });

    setEvents(prev => [...prev.filter(e => e.type !== 'contact'), ...contactEvents]);
  };

  const generateBirthdayEvents = () => {
    const birthdayEvents: CalendarEvent[] = [];
    const currentYear = new Date().getFullYear();

    people.forEach(person => {
      if (person.birth_date) {
        const birthDate = new Date(person.birth_date);
        const thisYearBirthday = new Date(currentYear, birthDate.getMonth(), birthDate.getDate());
        const nextYearBirthday = new Date(currentYear + 1, birthDate.getMonth(), birthDate.getDate());

        // Adicionar aniversário deste ano se ainda não passou
        if (thisYearBirthday >= new Date()) {
          birthdayEvents.push({
            id: `birthday-${person.id}-${currentYear}`,
            title: `🎂 Aniversário de ${person.name}`,
            date: thisYearBirthday.toISOString().split('T')[0],
            type: 'birthday',
            personId: person.id,
            description: `${person.name} faz ${currentYear - birthDate.getFullYear()} anos`,
            priority: person.importance >= 4 ? 'high' : 'medium',
            status: 'pending',
            reminder: 7
          });
        }

        // Adicionar aniversário do próximo ano
        birthdayEvents.push({
          id: `birthday-${person.id}-${currentYear + 1}`,
          title: `🎂 Aniversário de ${person.name}`,
          date: nextYearBirthday.toISOString().split('T')[0],
          type: 'birthday',
          personId: person.id,
          description: `${person.name} faz ${currentYear + 1 - birthDate.getFullYear()} anos`,
          priority: person.importance >= 4 ? 'high' : 'medium',
          status: 'pending',
          reminder: 7
        });
      }
    });

    setEvents(prev => [...prev.filter(e => e.type !== 'birthday'), ...birthdayEvents]);
  };

  // Adicionar deadlines eleitorais aos eventos (ATUALIZADO)
  useEffect(() => {
    const deadlineEvents: CalendarEvent[] = electoralDeadlines.map(deadline => {
      // Determinar o tipo correto baseado no tipo do deadline
      let eventType: CalendarEvent['type'] = 'deadline';
      if (deadline.type === 'election') eventType = 'election';
      else if (deadline.type === 'window_open' || deadline.type === 'window_close') eventType = 'window';
      else if (deadline.type === 'campaign_start' || deadline.type === 'campaign_end') eventType = 'campaign';
      else if (deadline.type === 'convention') eventType = 'conference';

      return {
        id: deadline.id,
        title: deadline.title,
        date: deadline.date,
        type: eventType,
        description: deadline.description,
        priority: deadline.mandatory ? 'critical' : 'high',
        status: new Date(deadline.date) < new Date() ? 'completed' : 'pending',
        reminder: deadline.daysNotice
      };
    });

    console.log('📅 Adicionando eventos eleitorais:', deadlineEvents.length);
    setEvents(prev => {
      // Remover eventos eleitorais antigos
      const nonElectoralEvents = prev.filter(e => 
        !['deadline', 'election', 'window', 'campaign', 'conference'].includes(e.type) || 
        e.personId // Manter eventos que têm personId (são de pessoas específicas)
      );
      return [...nonElectoralEvents, ...deadlineEvents];
    });
  }, []); // Array vazio para executar apenas uma vez

  // Funções do calendário
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Dias do mês anterior
    for (let i = startingDayOfWeek; i > 0; i--) {
      const prevDate = new Date(year, month, -i + 1);
      days.push({
        date: prevDate,
        isCurrentMonth: false,
        events: getEventsForDate(prevDate)
      });
    }

    // Dias do mês atual
    for (let i = 1; i <= daysInMonth; i++) {
      const currentDate = new Date(year, month, i);
      days.push({
        date: currentDate,
        isCurrentMonth: true,
        events: getEventsForDate(currentDate)
      });
    }

    // Dias do próximo mês
    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      const nextDate = new Date(year, month + 1, i);
      days.push({
        date: nextDate,
        isCurrentMonth: false,
        events: getEventsForDate(nextDate)
      });
    }

    return days;
  };

  const getEventsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return events.filter(event => {
      if (filter !== 'all' && event.type !== filter) return false;
      return event.date === dateStr;
    });
  };

  const getUpcomingEvents = (days: number = 30) => {
    const today = new Date();
    const future = new Date();
    future.setDate(future.getDate() + days);

    return events
      .filter(event => {
        const eventDate = new Date(event.date);
        return eventDate >= today && eventDate <= future;
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  };

  const getOverdueContacts = () => {
    return events
      .filter(event => event.type === 'contact' && event.status === 'missed')
      .sort((a, b) => {
        const personA = people.find(p => p.id === a.personId);
        const personB = people.find(p => p.id === b.personId);
        return (personB?.importance || 0) - (personA?.importance || 0);
      });
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
  };

  const getEventColor = (event: CalendarEvent) => {
    const colors = {
      contact: 'bg-blue-500',
      birthday: 'bg-pink-500',
      deadline: 'bg-red-500',
      election: 'bg-purple-600',
      window: 'bg-yellow-500',
      meeting: 'bg-green-500',
      conference: 'bg-indigo-500',
      campaign: 'bg-orange-500'
    };
    
    // Cores especiais para eventos críticos
    if (event.priority === 'critical' && event.status === 'pending') {
      const daysUntil = Math.ceil((new Date(event.date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
      if (daysUntil <= 7) return 'bg-red-600 animate-pulse';
    }
    
    return colors[event.type] || 'bg-gray-500';
  };

  const getEventIcon = (type: string) => {
    const icons = {
      contact: <Users className="w-3 h-3" />,
      birthday: <CalendarDays className="w-3 h-3" />,
      deadline: <AlertCircle className="w-3 h-3" />,
      election: <Vote className="w-3 h-3" />,
      window: <Timer className="w-3 h-3" />,
      meeting: <Briefcase className="w-3 h-3" />,
      conference: <FileText className="w-3 h-3" />,
      campaign: <Target className="w-3 h-3" />
    };
    return icons[type] || <CalendarIcon className="w-3 h-3" />;
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };

  const monthYear = new Intl.DateTimeFormat('pt-BR', {
    month: 'long',
    year: 'numeric'
  }).format(currentDate);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
          <CalendarIcon className="w-6 h-6 mr-2" />
          Calendário de Gestão Política
        </h2>
        
        <div className="flex items-center gap-4">
          {/* Filtros */}
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="all">Todos os Eventos</option>
            <option value="contact">Contatos</option>
            <option value="birthday">Aniversários</option>
            <option value="deadline">Prazos Eleitorais</option>
            <option value="election">Eleições</option>
            <option value="window">Janelas Partidárias</option>
            <option value="meeting">Reuniões</option>
            <option value="campaign">Campanha</option>
          </select>

          {/* Modos de visualização */}
          <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
            <button
              onClick={() => setViewMode('month')}
              className={`px-3 py-1 rounded transition-colors ${
                viewMode === 'month' 
                  ? 'bg-white dark:bg-gray-600 shadow' 
                  : 'hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              Mês
            </button>
            <button
              onClick={() => setViewMode('week')}
              className={`px-3 py-1 rounded transition-colors ${
                viewMode === 'week' 
                  ? 'bg-white dark:bg-gray-600 shadow' 
                  : 'hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              Semana
            </button>
            <button
              onClick={() => setViewMode('agenda')}
              className={`px-3 py-1 rounded transition-colors ${
                viewMode === 'agenda' 
                  ? 'bg-white dark:bg-gray-600 shadow' 
                  : 'hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              Agenda
            </button>
          </div>

          <button
            onClick={() => setShowEventModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            Novo Evento
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendário */}
        <div className="lg:col-span-2">
          {viewMode === 'month' && (
            <>
              {/* Controles do mês */}
              <div className="flex justify-between items-center mb-4">
                <button
                  onClick={handlePrevMonth}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </button>
                
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white capitalize">
                  {monthYear}
                </h3>
                
                <button
                  onClick={handleNextMonth}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </button>
              </div>

              {/* Grade do calendário */}
              <div className="grid grid-cols-7 gap-1">
                {/* Dias da semana */}
                {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
                  <div key={day} className="text-center text-sm font-medium text-gray-500 dark:text-gray-400 py-2">
                    {day}
                  </div>
                ))}

                {/* Dias do mês */}
                {getDaysInMonth(currentDate).map((day, index) => {
                  const isToday = day.date.toDateString() === new Date().toDateString();
                  const isSelected = selectedDate?.toDateString() === day.date.toDateString();

                  return (
                    <div
                      key={index}
                      onClick={() => handleDateClick(day.date)}
                      className={`
                        min-h-[100px] p-2 border border-gray-200 dark:border-gray-700 cursor-pointer
                        transition-colors hover:bg-gray-50 dark:hover:bg-gray-700
                        ${!day.isCurrentMonth ? 'bg-gray-50 dark:bg-gray-800 opacity-50' : 'bg-white dark:bg-gray-800'}
                        ${isToday ? 'ring-2 ring-blue-500' : ''}
                        ${isSelected ? 'bg-blue-50 dark:bg-blue-900/20' : ''}
                      `}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <span className={`text-sm font-medium ${
                          isToday ? 'text-blue-600 dark:text-blue-400' : 'text-gray-900 dark:text-white'
                        }`}>
                          {day.date.getDate()}
                        </span>
                        {day.events.length > 0 && (
                          <span className="text-xs bg-gray-200 dark:bg-gray-600 px-1 rounded">
                            {day.events.length}
                          </span>
                        )}
                      </div>
                      
                      {/* Eventos do dia */}
                      <div className="space-y-1">
                        {day.events.slice(0, 3).map((event, idx) => (
                          <div
                            key={idx}
                            className={`text-xs p-1 rounded ${getEventColor(event)} text-white truncate flex items-center`}
                          >
                            {getEventIcon(event.type)}
                            <span className="ml-1">{event.title}</span>
                          </div>
                        ))}
                        {day.events.length > 3 && (
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            +{day.events.length - 3} mais
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {viewMode === 'agenda' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Próximos 30 dias
              </h3>
              {getUpcomingEvents(30).map(event => {
                const person = people.find(p => p.id === event.personId);
                return (
                  <div
                    key={event.id}
                    className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${getEventColor(event)} text-white`}>
                        {getEventIcon(event.type)}
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">{event.title}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {formatDate(new Date(event.date))}
                        </p>
                        {event.description && (
                          <p className="text-sm text-gray-500 dark:text-gray-500">{event.description}</p>
                        )}
                      </div>
                    </div>
                    
                    {person && (
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => onContactPerson?.(person)}
                          className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                          <Phone className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onEditPerson?.(person)}
                          className="text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-300"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Contatos pendentes */}
          <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-red-900 dark:text-red-400 mb-3 flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2" />
              Contatos Atrasados
            </h3>
            <div className="space-y-2">
              {getOverdueContacts().slice(0, 5).map(event => {
                const person = people.find(p => p.id === event.personId);
                if (!person) return null;
                
                return (
                  <div key={event.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{person.name}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{event.description}</p>
                    </div>
                    <button
                      onClick={() => onContactPerson?.(person)}
                      className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                    >
                      <Phone className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
              {getOverdueContacts().length === 0 && (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Todos os contatos em dia! 🎉
                </p>
              )}
            </div>
          </div>

          {/* Próximos prazos eleitorais */}
          <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-yellow-900 dark:text-yellow-400 mb-3 flex items-center">
              <Clock className="w-5 h-5 mr-2" />
              Prazos Eleitorais
            </h3>
            <div className="space-y-2">
              {events
                .filter(e => e.type === 'deadline' && e.status === 'pending')
                .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                .slice(0, 5)
                .map(event => {
                  const daysUntil = Math.ceil((new Date(event.date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                  return (
                    <div key={event.id} className="border-l-4 border-yellow-500 pl-3">
                      <p className="font-medium text-gray-900 dark:text-white">{event.title}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {daysUntil > 0 ? `Em ${daysUntil} dias` : 'Hoje!'}
                      </p>
                    </div>
                  );
                })}
            </div>
          </div>

          {/* Eventos Políticos do Ano */}
          <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-purple-900 dark:text-purple-400 mb-3 flex items-center">
              <Vote className="w-5 h-5 mr-2" />
              Calendário Eleitoral 2025-2026
            </h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {events
                .filter(e => ['election', 'window', 'campaign', 'conference'].includes(e.type) && e.status === 'pending')
                .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                .map(event => {
                  const eventDate = new Date(event.date);
                  const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
                  const dateStr = `${eventDate.getDate()} ${monthNames[eventDate.getMonth()]}`;
                  
                  return (
                    <div key={event.id} className="flex items-start space-x-2 text-sm">
                      <div className={`p-1 rounded ${getEventColor(event)} text-white`}>
                        {getEventIcon(event.type)}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 dark:text-white">{event.title}</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">{dateStr}</p>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>

          {/* Aniversários próximos */}
          <div className="bg-pink-50 dark:bg-pink-900/20 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-pink-900 dark:text-pink-400 mb-3 flex items-center">
              <CalendarDays className="w-5 h-5 mr-2" />
              Aniversários Próximos
            </h3>
            <div className="space-y-2">
              {events
                .filter(e => e.type === 'birthday')
                .filter(e => {
                  const eventDate = new Date(e.date);
                  const today = new Date();
                  const daysDiff = Math.ceil((eventDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                  return daysDiff >= 0 && daysDiff <= 30;
                })
                .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                .slice(0, 5)
                .map(event => {
                  const person = people.find(p => p.id === event.personId);
                  if (!person) return null;
                  
                  const daysUntil = Math.ceil((new Date(event.date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                  
                  return (
                    <div key={event.id} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{person.name}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {daysUntil === 0 ? 'Hoje!' : daysUntil === 1 ? 'Amanhã' : `Em ${daysUntil} dias`}
                        </p>
                      </div>
                      <button
                        onClick={() => onContactPerson?.(person)}
                        className="text-pink-600 hover:text-pink-800 dark:text-pink-400 dark:hover:text-pink-300"
                      >
                        <Gift className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
            </div>
          </div>

          {/* Estatísticas */}
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-400 mb-3 flex items-center">
              <TrendingUp className="w-5 h-5 mr-2" />
              Estatísticas do Mês
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Contatos agendados:</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {events.filter(e => e.type === 'contact' && new Date(e.date).getMonth() === currentDate.getMonth()).length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Eventos políticos:</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {events.filter(e => ['deadline', 'election', 'window', 'campaign'].includes(e.type) && new Date(e.date).getMonth() === currentDate.getMonth()).length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Taxa de contatos:</span>
                <span className="font-medium text-green-600 dark:text-green-400">
                  {Math.round((events.filter(e => e.type === 'contact' && e.status === 'completed').length / events.filter(e => e.type === 'contact').length) * 100) || 0}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Eventos do dia selecionado */}
      {selectedDate && (
        <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            Eventos de {formatDate(selectedDate)}
          </h3>
          <div className="space-y-2">
            {getEventsForDate(selectedDate).length > 0 ? (
              getEventsForDate(selectedDate).map(event => {
                const person = people.find(p => p.id === event.personId);
                return (
                  <div key={event.id} className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded ${getEventColor(event)} text-white`}>
                        {getEventIcon(event.type)}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{event.title}</p>
                        {event.description && (
                          <p className="text-sm text-gray-600 dark:text-gray-400">{event.description}</p>
                        )}
                      </div>
                    </div>
                    {person && (
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => onContactPerson?.(person)}
                          className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                          <Phone className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <p className="text-gray-500 dark:text-gray-400">Nenhum evento neste dia</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PoliticalCalendar;
