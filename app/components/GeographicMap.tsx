'use client';

import React, { useEffect, useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { Users, MapPin, Loader2, AlertCircle } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

// Tipagem das props
interface Person {
  id: string;
  name: string;
  nickname?: string;
  context: string;
  proximity: string;
  occupation?: string;
  company?: string;
  city?: string;
  state?: string;
  address?: string;
  political_party?: string;
  importance?: number;
  trust_level?: number;
  influence_level?: number;
  mobile?: string;
  email?: string;
  notes?: string;
}

interface GeographicMapProps {
  people: Person[];
}

interface CityCoordinates {
  [key: string]: {
    lat: number;
    lng: number;
    state: string;
  };
}

// Coordenadas das principais cidades brasileiras
const BRAZIL_CITIES: CityCoordinates = {
  // Rio Grande do Sul - TODAS AS CIDADES
  'porto alegre': { lat: -30.0346, lng: -51.2177, state: 'RS' },
  'caxias do sul': { lat: -29.1687, lng: -51.1794, state: 'RS' },
  'pelotas': { lat: -31.7649, lng: -52.3371, state: 'RS' },
  'canoas': { lat: -29.9161, lng: -51.1836, state: 'RS' },
  'santa maria': { lat: -29.6868, lng: -53.8149, state: 'RS' },
  'gravatai': { lat: -29.9442, lng: -50.9919, state: 'RS' },
  'viamao': { lat: -30.0810, lng: -51.0233, state: 'RS' },
  'novo hamburgo': { lat: -29.6842, lng: -51.1337, state: 'RS' },
  'sao leopoldo': { lat: -29.7545, lng: -51.1478, state: 'RS' },
  'rio grande': { lat: -32.0349, lng: -52.0986, state: 'RS' },
  'charqueadas': { lat: -29.9546, lng: -51.6256, state: 'RS' },
  'alvorada': { lat: -30.0015, lng: -51.0839, state: 'RS' },
  'passo fundo': { lat: -28.2628, lng: -52.4091, state: 'RS' },
  'uruguaiana': { lat: -29.7652, lng: -57.0853, state: 'RS' },
  'santa cruz do sul': { lat: -29.7180, lng: -52.4258, state: 'RS' },
  'cachoeirinha': { lat: -29.9472, lng: -51.0939, state: 'RS' },
  'bage': { lat: -31.3316, lng: -54.1070, state: 'RS' },
  'bento goncalves': { lat: -29.1699, lng: -51.5194, state: 'RS' },
  'erechim': { lat: -27.6348, lng: -52.2737, state: 'RS' },
  'guaiba': { lat: -30.1135, lng: -51.3252, state: 'RS' },
  'cachoeira do sul': { lat: -30.0442, lng: -52.8931, state: 'RS' },
  'santana do livramento': { lat: -30.8895, lng: -55.5323, state: 'RS' },
  'esteio': { lat: -29.8613, lng: -51.1792, state: 'RS' },
  'ijui': { lat: -28.3876, lng: -53.9149, state: 'RS' },
  'sapucaia do sul': { lat: -29.8299, lng: -51.1430, state: 'RS' },
  'santo angelo': { lat: -28.2997, lng: -54.2638, state: 'RS' },
  'lajeado': { lat: -29.4669, lng: -51.9614, state: 'RS' },
  'venancio aires': { lat: -29.6061, lng: -52.1921, state: 'RS' },
  'farroupilha': { lat: -29.2252, lng: -51.3478, state: 'RS' },
  'camaqua': { lat: -30.8511, lng: -51.8122, state: 'RS' },
  'vacaria': { lat: -28.5124, lng: -50.9337, state: 'RS' },
  'campo bom': { lat: -29.6789, lng: -51.0533, state: 'RS' },
  'cruz alta': { lat: -28.6395, lng: -53.6070, state: 'RS' },
  'montenegro': { lat: -29.6887, lng: -51.4608, state: 'RS' },
  'sao borja': { lat: -28.6605, lng: -56.0042, state: 'RS' },
  'sao gabriel': { lat: -30.3363, lng: -54.3200, state: 'RS' },
  'carazinho': { lat: -28.2838, lng: -52.7863, state: 'RS' },
  'taquara': { lat: -29.6516, lng: -50.7809, state: 'RS' },
  'panambi': { lat: -28.2925, lng: -53.5017, state: 'RS' },
  'estrela': { lat: -29.5019, lng: -51.9601, state: 'RS' },
  'frederico westphalen': { lat: -27.3594, lng: -53.3947, state: 'RS' },
  'tramandai': { lat: -29.9845, lng: -50.1337, state: 'RS' },
  'alegrete': { lat: -29.7883, lng: -55.7919, state: 'RS' },
  'osorio': { lat: -29.8866, lng: -50.2698, state: 'RS' },
  'torres': { lat: -29.3353, lng: -49.7269, state: 'RS' },
  'sapiranga': { lat: -29.6383, lng: -51.0070, state: 'RS' },
  'flores da cunha': { lat: -29.0286, lng: -51.1817, state: 'RS' },
  'sao lourenco do sul': { lat: -31.3655, lng: -51.9783, state: 'RS' },
  'palmeira das missoes': { lat: -27.8995, lng: -53.3136, state: 'RS' },
  'tres passos': { lat: -27.4555, lng: -53.9318, state: 'RS' },
  'dom pedrito': { lat: -30.9829, lng: -54.6731, state: 'RS' },
  'capao da canoa': { lat: -29.7459, lng: -50.0096, state: 'RS' },
  'nova petropolis': { lat: -29.3764, lng: -51.1146, state: 'RS' },
  'marau': { lat: -28.4490, lng: -52.2001, state: 'RS' },
  'sao lourenco do sul': { lat: -31.3655, lng: -51.9783, state: 'RS' },
  'igrejinha': { lat: -29.5744, lng: -50.7904, state: 'RS' },
  'estancia velha': { lat: -29.6567, lng: -51.1801, state: 'RS' },
  'rosario do sul': { lat: -30.2583, lng: -54.9142, state: 'RS' },
  'dois irmaos': { lat: -29.5805, lng: -51.0847, state: 'RS' },
  'cacapava do sul': { lat: -30.5144, lng: -53.4947, state: 'RS' },
  'parobé': { lat: -29.6287, lng: -50.8348, state: 'RS' },
  'santiago': { lat: -29.1916, lng: -54.8672, state: 'RS' },
  'teutonia': { lat: -29.4448, lng: -51.8063, state: 'RS' },
  'carlos barbosa': { lat: -29.2975, lng: -51.5036, state: 'RS' },
  'encruzilhada do sul': { lat: -30.5439, lng: -52.5219, state: 'RS' },
  'ivoti': { lat: -29.5212, lng: -51.1606, state: 'RS' },
  'jaguarao': { lat: -32.5660, lng: -53.3758, state: 'RS' },
  'garibaldi': { lat: -29.2562, lng: -51.5336, state: 'RS' },
  'soledade': { lat: -28.8281, lng: -52.5097, state: 'RS' },
  'itaqui': { lat: -29.1253, lng: -56.5530, state: 'RS' },
  'cangucu': { lat: -31.3950, lng: -52.6756, state: 'RS' },
  'portao': { lat: -29.7017, lng: -51.2417, state: 'RS' },
  'sao marcos': { lat: -28.9708, lng: -51.0677, state: 'RS' },
  'nova hartz': { lat: -29.5813, lng: -50.9032, state: 'RS' },
  'sao francisco de paula': { lat: -29.4480, lng: -50.5838, state: 'RS' },
  'sao sebastiao do cai': { lat: -29.5869, lng: -51.3752, state: 'RS' },
  'lagoa vermelha': { lat: -28.2085, lng: -51.5263, state: 'RS' },
  'canela': { lat: -29.3656, lng: -50.8161, state: 'RS' },
  'gramado': { lat: -29.3788, lng: -50.8736, state: 'RS' },
  'horizontina': { lat: -27.6256, lng: -54.3081, state: 'RS' },
  'sarandi': { lat: -27.9439, lng: -52.9234, state: 'RS' },
  'tres coroas': { lat: -29.5168, lng: -50.7763, state: 'RS' },
  'nova santa rita': { lat: -29.8522, lng: -51.2856, state: 'RS' },
  'arroio do meio': { lat: -29.4019, lng: -51.9419, state: 'RS' },
  'veranopolis': { lat: -28.9036, lng: -51.5524, state: 'RS' },
  'encantado': { lat: -29.2361, lng: -51.8697, state: 'RS' },
  'eldorado do sul': { lat: -30.0836, lng: -51.6169, state: 'RS' },
  'quarai': { lat: -30.3876, lng: -56.4513, state: 'RS' },
  'serafina correa': { lat: -28.7113, lng: -51.9355, state: 'RS' },
  'nao me toque': { lat: -28.4592, lng: -52.8205, state: 'RS' },
  'getulio vargas': { lat: -27.8912, lng: -52.2284, state: 'RS' },
  'santa rosa': { lat: -27.8707, lng: -54.4802, state: 'RS' },
  'tapejara': { lat: -28.0673, lng: -52.0074, state: 'RS' },
  'antonio prado': { lat: -28.8586, lng: -51.2832, state: 'RS' },
  'pinheiro machado': { lat: -31.5783, lng: -53.3811, state: 'RS' },
  'butiá': { lat: -30.1198, lng: -51.9619, state: 'RS' },
  'sananduva': { lat: -27.9508, lng: -51.8072, state: 'RS' },
  'bom principio': { lat: -29.4897, lng: -51.3594, state: 'RS' },
  'feliz': { lat: -29.4513, lng: -51.3061, state: 'RS' },
  'nova bassano': { lat: -28.7244, lng: -51.7047, state: 'RS' },
  'arroio grande': { lat: -32.2375, lng: -53.0870, state: 'RS' },
  'triunfo': { lat: -29.9456, lng: -51.7181, state: 'RS' },
  'taquari': { lat: -29.7998, lng: -51.8644, state: 'RS' },
  'sao jose do norte': { lat: -32.0150, lng: -52.0328, state: 'RS' },
  'toledo': { lat: -24.7136, lng: -53.7428, state: 'RS' },
  'mostardas': { lat: -31.1072, lng: -50.9215, state: 'RS' },
  'terra de areia': { lat: -29.6100, lng: -50.0728, state: 'RS' },
  'imbe': { lat: -29.9733, lng: -50.1285, state: 'RS' },
  'rolante': { lat: -29.6494, lng: -50.5765, state: 'RS' },
  'cidreira': { lat: -30.1811, lng: -50.2055, state: 'RS' },
  'ararica': { lat: -29.6134, lng: -50.9272, state: 'RS' },
  'capela de santana': { lat: -29.7039, lng: -51.3299, state: 'RS' },
  'xangri-la': { lat: -29.8069, lng: -50.0477, state: 'RS' },
  'glorinha': { lat: -29.8798, lng: -50.7742, state: 'RS' },
  'balneario pinhal': { lat: -30.2474, lng: -50.2351, state: 'RS' },
  'palmares do sul': { lat: -30.2578, lng: -50.5098, state: 'RS' },
  'capivari do sul': { lat: -30.1459, lng: -50.5157, state: 'RS' },
  'general camara': { lat: -29.9051, lng: -51.7600, state: 'RS' },
  'rio pardo': { lat: -29.9897, lng: -52.3780, state: 'RS' },
  'pantano grande': { lat: -30.1915, lng: -52.3739, state: 'RS' },
  'arroio dos ratos': { lat: -30.0773, lng: -51.7292, state: 'RS' },
  'sao jeronimo': { lat: -30.3556, lng: -51.7196, state: 'RS' },
  'barao': { lat: -29.3738, lng: -51.4989, state: 'RS' },
  
  // São Paulo
  'sao paulo': { lat: -23.5505, lng: -46.6333, state: 'SP' },
  'guarulhos': { lat: -23.4543, lng: -46.5337, state: 'SP' },
  'campinas': { lat: -22.9056, lng: -47.0608, state: 'SP' },
  'santos': { lat: -23.9608, lng: -46.3337, state: 'SP' },
  
  // Rio de Janeiro
  'rio de janeiro': { lat: -22.9068, lng: -43.1729, state: 'RJ' },
  'niteroi': { lat: -22.8832, lng: -43.1034, state: 'RJ' },
  
  // Outros estados
  'belo horizonte': { lat: -19.9245, lng: -43.9352, state: 'MG' },
  'salvador': { lat: -12.9714, lng: -38.5014, state: 'BA' },
  'curitiba': { lat: -25.4284, lng: -49.2733, state: 'PR' },
  'recife': { lat: -8.0476, lng: -34.8770, state: 'PE' },
  'fortaleza': { lat: -3.7319, lng: -38.5267, state: 'CE' },
  'belem': { lat: -1.4558, lng: -48.4902, state: 'PA' },
  'goiania': { lat: -16.6869, lng: -49.2648, state: 'GO' },
  'florianopolis': { lat: -27.5954, lng: -48.5480, state: 'SC' },
  'vitoria': { lat: -20.3155, lng: -40.3128, state: 'ES' },
  'cuiaba': { lat: -15.6014, lng: -56.0979, state: 'MT' },
  'campo grande': { lat: -20.4697, lng: -54.6201, state: 'MS' },
  'natal': { lat: -5.7793, lng: -35.2009, state: 'RN' },
  'joao pessoa': { lat: -7.1195, lng: -34.8450, state: 'PB' },
  'maceio': { lat: -9.6658, lng: -35.7353, state: 'AL' },
  'teresina': { lat: -5.0892, lng: -42.8019, state: 'PI' },
  'manaus': { lat: -3.1190, lng: -60.0217, state: 'AM' },
  'brasilia': { lat: -15.7801, lng: -47.9292, state: 'DF' },
};

// Componente do Mapa - Client Only
const MapComponent = ({ peopleWithCoords, cityStats, contextColors }: any) => {
  const [map, setMap] = useState<any>(null);

  // Importar componentes do Leaflet dinamicamente
  const MapContainer = useMemo(() => dynamic(
    () => import('react-leaflet').then((mod) => mod.MapContainer),
    { ssr: false }
  ), []);

  const TileLayer = useMemo(() => dynamic(
    () => import('react-leaflet').then((mod) => mod.TileLayer),
    { ssr: false }
  ), []);

  const CircleMarker = useMemo(() => dynamic(
    () => import('react-leaflet').then((mod) => mod.CircleMarker),
    { ssr: false }
  ), []);

  const Popup = useMemo(() => dynamic(
    () => import('react-leaflet').then((mod) => mod.Popup),
    { ssr: false }
  ), []);

  // Agrupar pessoas por cidade
  const peopleByCity = useMemo(() => {
    return peopleWithCoords.reduce((acc: any, person: any) => {
      const key = `${person.city}-${person.context}`;
      if (!acc[key]) {
        acc[key] = {
          city: person.city,
          coords: BRAZIL_CITIES[person.city?.toLowerCase().trim() || ''],
          people: [],
          contexts: new Set<string>()
        };
      }
      acc[key].people.push(person);
      acc[key].contexts.add(person.context);
      return acc;
    }, {});
  }, [peopleWithCoords]);

  return (
    <div style={{ height: '600px', width: '100%' }}>
      <MapContainer
        center={[-15.7801, -47.9292]}
        zoom={4}
        style={{ height: '100%', width: '100%' }}
        whenCreated={setMap}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Marcadores individuais */}
        {peopleWithCoords.map((person: any) => (
          <CircleMarker
            key={person.id}
            center={[person.coords.lat, person.coords.lng]}
            radius={8}
            fillColor={contextColors[person.context] || '#666'}
            color="#fff"
            weight={2}
            opacity={1}
            fillOpacity={0.8}
          >
            <Popup>
              <div className="p-2">
                <h4 className="font-semibold text-gray-900">{person.name}</h4>
                {person.nickname && (
                  <p className="text-sm text-gray-600">"{person.nickname}"</p>
                )}
                <div className="mt-2 space-y-1 text-sm">
                  <p><strong>Cidade:</strong> {person.city}</p>
                  <p><strong>Contexto:</strong> <span className="capitalize">{person.context}</span></p>
                  <p><strong>Proximidade:</strong> <span className="capitalize">{person.proximity}</span></p>
                  {person.occupation && <p><strong>Profissão:</strong> {person.occupation}</p>}
                  {person.political_party && <p><strong>Partido:</strong> {person.political_party}</p>}
                  {person.mobile && <p><strong>Contato:</strong> {person.mobile}</p>}
                </div>
              </div>
            </Popup>
          </CircleMarker>
        ))}

        {/* Indicadores de quantidade por cidade */}
        {Object.values(peopleByCity).map((cityData: any, index: number) => {
          if (cityData.people.length > 1 && cityData.coords) {
            return (
              <CircleMarker
                key={`city-${index}`}
                center={[cityData.coords.lat, cityData.coords.lng]}
                radius={20 + Math.sqrt(cityData.people.length) * 5}
                fillColor="#ffffff"
                color="#374151"
                weight={2}
                opacity={0.8}
                fillOpacity={0.9}
              >
                <Popup>
                  <div className="p-2">
                    <h4 className="font-semibold text-gray-900 mb-2">
                      {cityData.city} ({cityData.people.length} pessoas)
                    </h4>
                    <div className="space-y-2">
                      {cityData.people.slice(0, 10).map((person: Person) => (
                        <div key={person.id} className="text-sm border-b pb-1">
                          <p className="font-medium">{person.name}</p>
                          <p className="text-gray-600">
                            {person.context} • {person.proximity}
                          </p>
                        </div>
                      ))}
                      {cityData.people.length > 10 && (
                        <p className="text-sm text-gray-500 mt-2">
                          ... e mais {cityData.people.length - 10} pessoas
                        </p>
                      )}
                    </div>
                  </div>
                </Popup>
              </CircleMarker>
            );
          }
          return null;
        })}
      </MapContainer>
    </div>
  );
};

export default function GeographicMap({ people }: GeographicMapProps) {
  const [isClient, setIsClient] = useState(false);
  const [loading, setLoading] = useState(true);

  // Effect para detectar se está no cliente - SEMPRE executado
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Processar pessoas com coordenadas
  const peopleWithCoords = useMemo(() => {
    if (!isClient) return [];
    
    const processed = people
      .filter(person => person.city)
      .map(person => {
        const cityKey = person.city?.toLowerCase().trim() || '';
        const coords = BRAZIL_CITIES[cityKey];
        
        if (coords) {
          // Adicionar pequeno offset aleatório para evitar sobreposição
          const offsetLat = (Math.random() - 0.5) * 0.01;
          const offsetLng = (Math.random() - 0.5) * 0.01;
          
          return {
            ...person,
            coords: {
              lat: coords.lat + offsetLat,
              lng: coords.lng + offsetLng
            }
          };
        }
        return null;
      })
      .filter(Boolean);

    setLoading(false);
    return processed;
  }, [people, isClient]);

  // Estatísticas
  const cityStats = useMemo(() => {
    return peopleWithCoords.reduce((acc: Record<string, number>, person: any) => {
      const city = person.city || '';
      acc[city] = (acc[city] || 0) + 1;
      return acc;
    }, {});
  }, [peopleWithCoords]);

  const contextStats = useMemo(() => {
    return peopleWithCoords.reduce((acc: Record<string, number>, person: any) => {
      acc[person.context] = (acc[person.context] || 0) + 1;
      return acc;
    }, {});
  }, [peopleWithCoords]);

  const contextColors: Record<string, string> = {
    residencial: '#10B981',
    profissional: '#3B82F6',
    social: '#8B5CF6',
    servicos: '#F59E0B',
    institucional: '#6B7280',
    politico: '#EF4444'
  };

  // Renderização condicional baseada no estado do cliente
  if (!isClient) {
    return (
      <div className="flex items-center justify-center h-96 bg-gray-100 dark:bg-gray-800 rounded-lg">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Pessoas no Mapa</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{peopleWithCoords.length}</p>
            </div>
            <MapPin className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Cidades</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{Object.keys(cityStats).length}</p>
            </div>
            <Users className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Sem Localização</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{people.length - peopleWithCoords.length}</p>
            </div>
            <AlertCircle className="w-8 h-8 text-yellow-500" />
          </div>
        </div>
      </div>

      {/* Legenda */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
        <h3 className="font-semibold mb-2 text-gray-900 dark:text-white">Legenda por Contexto</h3>
        <div className="flex flex-wrap gap-3">
          {Object.entries(contextColors).map(([context, color]) => (
            <div key={context} className="flex items-center gap-2">
              <div 
                className="w-4 h-4 rounded-full" 
                style={{ backgroundColor: color }}
              />
              <span className="text-sm capitalize text-gray-700 dark:text-gray-300">
                {context} ({contextStats[context] || 0})
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Mapa */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-96">
            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
          </div>
        ) : (
          <MapComponent 
            peopleWithCoords={peopleWithCoords}
            cityStats={cityStats}
            contextColors={contextColors}
          />
        )}
      </div>

      {/* Top Cidades */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
        <h3 className="font-semibold mb-3 text-gray-900 dark:text-white">Top 10 Cidades</h3>
        <div className="space-y-2">
          {Object.entries(cityStats)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .map(([city, count]) => (
              <div key={city} className="flex justify-between items-center">
                <span className="capitalize text-gray-700 dark:text-gray-300">{city}</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(count / peopleWithCoords.length) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white w-8 text-right">
                    {count}
                  </span>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
