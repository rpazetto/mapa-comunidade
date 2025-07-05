import React, { useState, useMemo } from 'react';
import { MapPin, Users, BarChart3, Eye, EyeOff } from 'lucide-react';

interface Person {
  id: string;
  name: string;
  neighborhood?: string;
  city?: string;
  context: string;
  proximity: string;
  political_party?: string;
  occupation?: string;
  importance?: number;
}

interface GeographicMapProps {
  people: Person[];
}

// Mapa completo das localidades de Gramado com coordenadas aproximadas
const GRAMADO_NEIGHBORHOODS = {
  // Bairros Centrais
  'Centro': { lat: -29.3788, lng: -50.8769, color: '#FF6B6B' },
  'Avenida Central': { lat: -29.3780, lng: -50.8750, color: '#FF7675' },
  'Planalto': { lat: -29.3650, lng: -50.8650, color: '#4ECDC4' },
  'Carniel': { lat: -29.3700, lng: -50.9000, color: '#96CEB4' },
  'Floresta': { lat: -29.3450, lng: -50.8550, color: '#FF6348' },
  'Jardim': { lat: -29.3600, lng: -50.8700, color: '#00B894' },
  'Dutra': { lat: -29.3550, lng: -50.8750, color: '#3742FA' },
  'Piratini': { lat: -29.3600, lng: -50.8800, color: '#FF9FF3' },
  
  // Bairros Residenciais
  'Bavária': { lat: -29.3500, lng: -50.8900, color: '#5F27CD' },
  'Bela Vista': { lat: -29.3650, lng: -50.8850, color: '#74B9FF' },
  'Candiago': { lat: -29.3750, lng: -50.8950, color: '#FD79A8' },
  'Carazal': { lat: -29.3850, lng: -50.8650, color: '#FDCB6E' },
  'Casagrande': { lat: -29.3950, lng: -50.8750, color: '#E17055' },
  'Mato Queimado': { lat: -29.3900, lng: -50.9300, color: '#81ECEC' },
  'Minuano': { lat: -29.3550, lng: -50.8850, color: '#A29BFE' },
  'Monte Verde': { lat: -29.3450, lng: -50.8950, color: '#6C5CE7' },
  'Tirol': { lat: -29.3350, lng: -50.8850, color: '#FD79A8' },
  'Três Pinheiros': { lat: -29.4000, lng: -50.9200, color: '#FDCB6E' },
  'Vale dos Pinheiros': { lat: -29.3800, lng: -50.8400, color: '#55A3FF' },
  'Varzinha': { lat: -29.3700, lng: -50.8300, color: '#FF7675' },
  'Várzea Grande': { lat: -29.4000, lng: -50.8500, color: '#FECA57' },
  'Vila do Sol': { lat: -29.3600, lng: -50.8200, color: '#00D2D3' },
  'Vila Suíça': { lat: -29.3500, lng: -50.8100, color: '#2ED573' },
  'Pórtico 1': { lat: -29.3400, lng: -50.8600, color: '#FF6B6B' },
  'Pórtico 2': { lat: -29.3300, lng: -50.8700, color: '#4ECDC4' },
  'Altos da Viação Férrea': { lat: -29.3250, lng: -50.8800, color: '#45B7D1' },
  'Aspen': { lat: -29.3350, lng: -50.8950, color: '#96CEB4' },
  
  // Linhas (Áreas Rurais)
  'Linha 15': { lat: -29.4100, lng: -50.9000, color: '#FECA57' },
  'Linha 28': { lat: -29.4200, lng: -50.9100, color: '#FF9FF3' },
  'Linha Araripe': { lat: -29.4100, lng: -50.9100, color: '#54A0FF' },
  'Linha Ávila': { lat: -29.4000, lng: -50.9300, color: '#5F27CD' },
  'Linha Bonita': { lat: -29.3900, lng: -50.9400, color: '#00D2D3' },
  'Linha Carahá': { lat: -29.3800, lng: -50.9500, color: '#FF6348' },
  'Linha Furna': { lat: -29.3700, lng: -50.9600, color: '#2ED573' },
  'Linha Marcondes': { lat: -29.3600, lng: -50.9700, color: '#FFA502' },
  'Linha Nova': { lat: -29.4200, lng: -50.9000, color: '#3742FA' },
  'Linha Pedras Brancas': { lat: -29.3500, lng: -50.9800, color: '#2F3542' },
  'Linha Quilombo': { lat: -29.3400, lng: -50.9900, color: '#A4B0BE' },
  'Linha Tapera': { lat: -29.3300, lng: -50.9950, color: '#FF7675' }, 
  'Morro do Arame': { lat: -29.3200, lng: -50.9800, color: '#74B9FF' },
  'Serra Grande': { lat: -29.3100, lng: -50.9700, color: '#FD79A8' },   
  'Moleque': { lat: -29.4300, lng: -50.9200, color: '#FDCB6E' },
  'Gambelo': { lat: -29.4400, lng: -50.9300, color: '#E17055' },
  'Moreira': { lat: -29.4500, lng: -50.9400, color: '#81ECEC' },
  
  // Condomínios Fechados
  'Condomínio Residencial Aspen Mountain': { lat: -29.3350, lng: -50.8950, color: '#A29BFE' },
  'Condomínio Vale do Bosque': { lat: -29.3400, lng: -50.8900, color: '#6C5CE7' },
  'Condomínio Knorrville': { lat: -29.3450, lng: -50.8850, color: '#FD79A8' },
  'Condomínio O Bosque': { lat: -29.3500, lng: -50.8800, color: '#FDCB6E' },
  'Condomínio Portal de Gramado': { lat: -29.3550, lng: -50.8750, color: '#E17055' },
  'Condomínio Residencial Villa Bella': { lat: -29.3600, lng: -50.8700, color: '#81ECEC' },
  'Condomínio Saint Morit': { lat: -29.3650, lng: -50.8650, color: '#55A3FF' },
  'Condomínio Villaggio': { lat: -29.3700, lng: -50.8600, color: '#FF7675' },
  'Condomínio Buena Vista': { lat: -29.3750, lng: -50.8550, color: '#FD79A8' },
  'Condomínio Montanha Del Fiori': { lat: -29.3800, lng: -50.8500, color: '#FDCB6E' }
};

const GeographicMap: React.FC<GeographicMapProps> = ({ people }) => {
  const [selectedNeighborhood, setSelectedNeighborhood] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');
  const [showEmptyNeighborhoods, setShowEmptyNeighborhoods] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'central' | 'residential' | 'condominiums' | 'rural'>('all');

  // Categorizar localidades para melhor organização
  const getNeighborhoodCategory = (neighborhood: string): string => {
    if (['Centro', 'Avenida Central', 'Planalto', 'Carniel', 'Floresta', 'Jardim', 'Dutra', 'Piratini'].includes(neighborhood)) {
      return 'central';
    }
    if (neighborhood.includes('Condomínio')) {
      return 'condominiums';
    }
    if (neighborhood.includes('Linha') || ['Morro do Arame', 'Serra Grande', 'Moleque', 'Gambelo', 'Moreira'].includes(neighborhood)) {
      return 'rural';
    }
    if (['Pórtico 1', 'Pórtico 2', 'Altos da Viação Férrea', 'Aspen'].includes(neighborhood)) {
      return 'porticos';
    }
    return 'residential';
  };

  // Análise por bairros
  const neighborhoodStats = useMemo(() => {
    const stats = new Map();
    
    // Inicializar todos os bairros conhecidos
    Object.keys(GRAMADO_NEIGHBORHOODS).forEach(neighborhood => {
      stats.set(neighborhood, {
        name: neighborhood,
        count: 0,
        people: [],
        contexts: new Set(),
        parties: new Set(),
        avgImportance: 0,
        coordinates: GRAMADO_NEIGHBORHOODS[neighborhood as keyof typeof GRAMADO_NEIGHBORHOODS]
      });
    });

    // Processar pessoas
    people.forEach(person => {
      if (person.city === 'Gramado' || !person.city) {
        const neighborhood = person.neighborhood || 'Sem Bairro Informado';
        
        if (!stats.has(neighborhood)) {
          stats.set(neighborhood, {
            name: neighborhood,
            count: 0,
            people: [],
            contexts: new Set(),
            parties: new Set(),
            avgImportance: 0,
            coordinates: { lat: -29.3788, lng: -50.8769, color: '#8B5CF6' } // Centro como padrão
          });
        }

        const neighborhoodData = stats.get(neighborhood);
        neighborhoodData.count++;
        neighborhoodData.people.push(person);
        neighborhoodData.contexts.add(person.context);
        if (person.political_party) {
          neighborhoodData.parties.add(person.political_party);
        }
      }
    });

    // Calcular média de importância
    stats.forEach((data, neighborhood) => {
      if (data.people.length > 0) {
        const totalImportance = data.people.reduce((sum: number, person: Person) => sum + (person.importance || 3), 0);
        data.avgImportance = totalImportance / data.people.length;
      }
    });

    return Array.from(stats.values())
      .filter(stat => showEmptyNeighborhoods || stat.count > 0)
      .filter(stat => categoryFilter === 'all' || getNeighborhoodCategory(stat.name) === categoryFilter)
      .sort((a, b) => b.count - a.count);
  }, [people, showEmptyNeighborhoods]);

  // Pessoas sem bairro informado
  const peopleWithoutNeighborhood = people.filter(p => 
    (p.city === 'Gramado' || !p.city) && !p.neighborhood
  );

  // Função para obter tamanho do marcador baseado no número de pessoas
  const getMarkerSize = (count: number) => {
    if (count === 0) return 20;
    if (count <= 2) return 30;
    if (count <= 5) return 45;
    if (count <= 10) return 60;
    return 80;
  };

  // Renderizar mapa visual simples
  const renderSimpleMap = () => (
    <div className="relative bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-lg p-8 min-h-[600px] overflow-hidden">
      {/* Título do mapa */}
      <div className="absolute top-4 left-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-3 z-10">
        <h3 className="font-bold text-gray-900 dark:text-white flex items-center">
          <MapPin className="w-5 h-5 mr-2 text-blue-600" />
          Mapa Oficial de Gramado
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          52 localidades oficiais mapeadas
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-500">
          {neighborhoodStats.filter(n => n.count > 0).length} com pessoas cadastradas
        </p>
      </div>

      {/* Legenda */}
      <div className="absolute top-4 right-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-3 z-10 max-w-xs">
        <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Legenda</h4>
        <div className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-blue-500"></div>
            <span>1-2 pessoas</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-green-500"></div>
            <span>3-5 pessoas</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-orange-500"></div>
            <span>6-10 pessoas</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-red-500"></div>
            <span>10+ pessoas</span>
          </div>
        </div>
      </div>

      {/* Controles */}
      <div className="absolute bottom-4 left-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-3 z-10 space-y-3">
        <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
          <input
            type="checkbox"
            checked={showEmptyNeighborhoods}
            onChange={(e) => setShowEmptyNeighborhoods(e.target.checked)}
            className="rounded"
          />
          {showEmptyNeighborhoods ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          Mostrar bairros vazios
        </label>
        
        <div>
          <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Filtrar por categoria:</label>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value as any)}
            className="text-xs border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded px-2 py-1"
          >
            <option value="all">Todas</option>
            <option value="central">Centrais</option>
            <option value="residential">Residenciais</option>
            <option value="condominiums">Condomínios</option>
            <option value="porticos">Pórticos</option>
            <option value="rural">Linhas/Rural</option>
          </select>
        </div>
      </div>

      {/* Marcadores dos bairros */}
      <div className="relative w-full h-full">
        {neighborhoodStats.map((neighborhood, index) => {
          const size = getMarkerSize(neighborhood.count);
          const opacity = neighborhood.count === 0 ? 0.3 : 1;
          
          // Posicionamento em grid otimizado para 52 localidades
          const totalNeighborhoods = neighborhoodStats.length;
          const cols = 8; // 8 colunas para 52 localidades
          const rows = Math.ceil(totalNeighborhoods / cols);
          const row = Math.floor(index / cols);
          const col = index % cols;
          const x = 5 + (col * 11.5); // Espaçamento menor para caber mais
          const y = 8 + (row * 10.5); // Espaçamento vertical reduzido
          
          return (
            <div
              key={neighborhood.name}
              className={`absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-300 hover:scale-110 ${
                selectedNeighborhood === neighborhood.name ? 'scale-125 z-20' : 'z-10'
              }`}
              style={{
                left: `${x}%`,
                top: `${y}%`,
                opacity: opacity
              }}
              onClick={() => setSelectedNeighborhood(
                selectedNeighborhood === neighborhood.name ? null : neighborhood.name
              )}
            >
              {/* Marcador circular */}
              <div
                className="rounded-full border-4 border-white dark:border-gray-800 shadow-lg flex items-center justify-center"
                style={{
                  width: `${size}px`,
                  height: `${size}px`,
                  backgroundColor: neighborhood.coordinates.color,
                }}
              >
                <span className="text-white font-bold text-xs">
                  {neighborhood.count}
                </span>
              </div>
              
              {/* Label do bairro */}
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 bg-white dark:bg-gray-800 rounded px-2 py-1 shadow-md whitespace-nowrap">
                <span className="text-xs font-medium text-gray-900 dark:text-white">
                  {neighborhood.name}
                </span>
              </div>

              {/* Tooltip expandido quando selecionado */}
              {selectedNeighborhood === neighborhood.name && neighborhood.count > 0 && (
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-12 bg-white dark:bg-gray-800 rounded-lg shadow-xl p-4 w-64 z-30">
                  <h4 className="font-bold text-gray-900 dark:text-white mb-2">
                    {neighborhood.name}
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Pessoas:</span>
                      <span className="font-medium text-gray-900 dark:text-white">{neighborhood.count}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Contextos:</span>
                      <span className="font-medium text-gray-900 dark:text-white">{neighborhood.contexts.size}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Partidos:</span>
                      <span className="font-medium text-gray-900 dark:text-white">{neighborhood.parties.size}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Importância Média:</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {neighborhood.avgImportance.toFixed(1)}/5
                      </span>
                    </div>
                    {neighborhood.people.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                        <p className="font-medium text-gray-900 dark:text-white mb-1">Pessoas:</p>
                        <div className="max-h-24 overflow-y-auto">
                          {neighborhood.people.slice(0, 5).map((person: Person) => (
                            <div key={person.id} className="text-xs text-gray-600 dark:text-gray-400">
                              • {person.name}
                            </div>
                          ))}
                          {neighborhood.people.length > 5 && (
                            <div className="text-xs text-gray-500 dark:text-gray-500 italic">
                              ... e mais {neighborhood.people.length - 5} pessoas
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header com controles */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Mapa Oficial de Gramado
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Todas as 52 localidades oficiais do município
          </p>
        </div>
        
        <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
          <button
            onClick={() => setViewMode('map')}
            className={`px-3 py-1 rounded transition-colors ${
              viewMode === 'map' 
                ? 'bg-white dark:bg-gray-600 shadow' 
                : 'hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            <MapPin className="w-4 h-4 inline mr-1" />
            Mapa
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`px-3 py-1 rounded transition-colors ${
              viewMode === 'list' 
                ? 'bg-white dark:bg-gray-600 shadow' 
                : 'hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            <BarChart3 className="w-4 h-4 inline mr-1" />
            Lista
          </button>
        </div>
      </div>

      {/* Estatísticas resumidas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <div className="flex items-center">
            <MapPin className="w-8 h-8 text-blue-600 mr-3" />
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                52
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total de Localidades</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <div className="flex items-center">
            <Users className="w-8 h-8 text-green-600 mr-3" />
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {neighborhoodStats.filter(n => n.count > 0).length}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Bairros com Pessoas</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <div className="flex items-center">
            <Users className="w-8 h-8 text-green-600 mr-3" />
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {people.filter(p => (p.city === 'Gramado' || !p.city) && p.neighborhood).length}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Com Bairro</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <div className="flex items-center">
            <Users className="w-8 h-8 text-orange-600 mr-3" />
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {peopleWithoutNeighborhood.length}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Sem Bairro</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <div className="flex items-center">
            <BarChart3 className="w-8 h-8 text-red-600 mr-3" />
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {52 - neighborhoodStats.filter(n => n.count > 0).length}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Localidades Vazias</p>
            </div>
          </div>
        </div>
      </div>

      {/* Visualização principal */}
      {viewMode === 'map' ? renderSimpleMap() : (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Bairro
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Pessoas
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Contextos
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Partidos
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Importância Média
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {neighborhoodStats.map((neighborhood) => (
                  <tr key={neighborhood.name} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div
                          className="w-4 h-4 rounded-full mr-3"
                          style={{ backgroundColor: neighborhood.coordinates.color }}
                        />
                        <div className="font-medium text-gray-900 dark:text-white">
                          {neighborhood.name}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {neighborhood.count}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {neighborhood.contexts.size}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {neighborhood.parties.size}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {neighborhood.count > 0 ? `${neighborhood.avgImportance.toFixed(1)}/5` : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Alerta para pessoas sem bairro */}
      {peopleWithoutNeighborhood.length > 0 && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <MapPin className="w-5 h-5 text-yellow-600" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                Pessoas sem bairro informado
              </h3>
              <div className="mt-2 text-sm text-yellow-700 dark:text-yellow-300">
                <p className="mb-2">
                  {peopleWithoutNeighborhood.length} pessoas em Gramado não têm bairro informado:
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {peopleWithoutNeighborhood.slice(0, 8).map(person => (
                    <span key={person.id} className="text-xs">
                      • {person.name}
                    </span>
                  ))}
                  {peopleWithoutNeighborhood.length > 8 && (
                    <span className="text-xs italic">
                      ... e mais {peopleWithoutNeighborhood.length - 8} pessoas
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GeographicMap;
