import React, { useState } from 'react';
import {
  FileAudio,
  Video,
  Brain,
  FileText,
  Camera,
  Mic,
  Upload,
  Download,
  Trash2,
  Eye,
  Calendar,
  Tag,
  Search,
  Filter,
  FolderOpen,
  Clock,
  MapPin,
  Users,
  Share2,
  Lock,
  Unlock,
  Star,
  Plus,
  X,
  Play,
  Pause,
  VolumeX,
  Volume2,
  ChevronDown,
  ChevronRight,
  Link,
  File,
  Briefcase
} from 'lucide-react';

interface MediaItem {
  id: string;
  type: 'audio' | 'video' | 'mindmap' | 'document' | 'image' | 'meeting';
  title: string;
  description?: string;
  url?: string;
  file?: File;
  duration?: string;
  date: string;
  tags: string[];
  location?: string;
  participants?: string[];
  isPrivate: boolean;
  isFavorite: boolean;
  size?: string;
  thumbnail?: string;
  transcript?: string;
  notes?: string;
}

interface MediaCategory {
  type: MediaItem['type'];
  label: string;
  icon: React.ReactNode;
  color: string;
  count: number;
}

interface PersonMediaVaultProps {
  personId: string;
  personName: string;
  onClose?: () => void;
}

const PersonMediaVault: React.FC<PersonMediaVaultProps> = ({
  personId,
  personName,
  onClose
}) => {
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([
    // Exemplos de itens
    {
      id: '1',
      type: 'audio',
      title: 'Conversa sobre projetos municipais',
      description: 'Discussão sobre melhorias na infraestrutura local',
      date: '2025-06-15',
      duration: '45:30',
      tags: ['infraestrutura', 'projetos', 'município'],
      isPrivate: false,
      isFavorite: true,
      size: '32 MB'
    },
    {
      id: '2',
      type: 'video',
      title: 'Reunião do comitê de campanha',
      description: 'Planejamento estratégico para 2026',
      date: '2025-06-10',
      duration: '1:23:45',
      tags: ['campanha', 'estratégia', '2026'],
      participants: ['João Silva', 'Maria Santos'],
      location: 'Sede do partido',
      isPrivate: true,
      isFavorite: false,
      size: '256 MB'
    },
    {
      id: '3',
      type: 'mindmap',
      title: 'Mapa de influências políticas',
      description: 'Rede de contatos e apoiadores',
      date: '2025-06-01',
      tags: ['rede', 'contatos', 'apoio'],
      isPrivate: true,
      isFavorite: true,
      size: '2 MB'
    }
  ]);

  const [selectedType, setSelectedType] = useState<MediaItem['type'] | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadType, setUploadType] = useState<MediaItem['type']>('audio');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['all']));
  const [sortBy, setSortBy] = useState<'date' | 'name' | 'size'>('date');
  const [filterPrivate, setFilterPrivate] = useState<boolean | null>(null);

  const categories: MediaCategory[] = [
    {
      type: 'audio',
      label: 'Áudios',
      icon: <FileAudio className="w-5 h-5" />,
      color: 'bg-blue-500',
      count: mediaItems.filter(item => item.type === 'audio').length
    },
    {
      type: 'video',
      label: 'Vídeos',
      icon: <Video className="w-5 h-5" />,
      color: 'bg-red-500',
      count: mediaItems.filter(item => item.type === 'video').length
    },
    {
      type: 'mindmap',
      label: 'Mapas Mentais',
      icon: <Brain className="w-5 h-5" />,
      color: 'bg-purple-500',
      count: mediaItems.filter(item => item.type === 'mindmap').length
    },
    {
      type: 'meeting',
      label: 'Reuniões',
      icon: <Users className="w-5 h-5" />,
      color: 'bg-green-500',
      count: mediaItems.filter(item => item.type === 'meeting').length
    },
    {
      type: 'document',
      label: 'Documentos',
      icon: <FileText className="w-5 h-5" />,
      color: 'bg-yellow-500',
      count: mediaItems.filter(item => item.type === 'document').length
    },
    {
      type: 'image',
      label: 'Imagens',
      icon: <Camera className="w-5 h-5" />,
      color: 'bg-pink-500',
      count: mediaItems.filter(item => item.type === 'image').length
    }
  ];

  const filteredItems = mediaItems.filter(item => {
    const matchesType = selectedType === 'all' || item.type === selectedType;
    const matchesSearch = searchQuery === '' || 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesPrivacy = filterPrivate === null || item.isPrivate === filterPrivate;
    
    return matchesType && matchesSearch && matchesPrivacy;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'date':
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      case 'name':
        return a.title.localeCompare(b.title);
      case 'size':
        const sizeA = parseFloat(a.size || '0');
        const sizeB = parseFloat(b.size || '0');
        return sizeB - sizeA;
      default:
        return 0;
    }
  });

  const getItemIcon = (type: MediaItem['type']) => {
    const category = categories.find(cat => cat.type === type);
    return category?.icon;
  };

  const getItemColor = (type: MediaItem['type']) => {
    const category = categories.find(cat => cat.type === type);
    return category?.color || 'bg-gray-500';
  };

  const handleUpload = (type: MediaItem['type']) => {
    setUploadType(type);
    setShowUploadModal(true);
  };

  const handleDeleteItem = (itemId: string) => {
    if (confirm('Tem certeza que deseja excluir este item?')) {
      setMediaItems(prev => prev.filter(item => item.id !== itemId));
      setSelectedItem(null);
    }
  };

  const toggleFavorite = (itemId: string) => {
    setMediaItems(prev => prev.map(item => 
      item.id === itemId ? { ...item, isFavorite: !item.isFavorite } : item
    ));
  };

  const togglePrivacy = (itemId: string) => {
    setMediaItems(prev => prev.map(item => 
      item.id === itemId ? { ...item, isPrivate: !item.isPrivate } : item
    ));
  };

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(category)) {
        newSet.delete(category);
      } else {
        newSet.add(category);
      }
      return newSet;
    });
  };

  // Componente de Upload Modal
  const UploadModal = () => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Adicionar {categories.find(c => c.type === uploadType)?.label}
          </h3>
          <button onClick={() => setShowUploadModal(false)}>
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tipo de conteúdo
            </label>
            <select
              value={uploadType}
              onChange={(e) => setUploadType(e.target.value as MediaItem['type'])}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
            >
              {categories.map(cat => (
                <option key={cat.type} value={cat.type}>{cat.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Título
            </label>
            <input
              type="text"
              placeholder="Digite o título..."
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Descrição
            </label>
            <textarea
              placeholder="Digite uma descrição..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tags (separadas por vírgula)
            </label>
            <input
              type="text"
              placeholder="Ex: reunião, projetos, importante"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
            />
          </div>

          <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center">
            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-600 dark:text-gray-400 mb-2">
              Arraste arquivos aqui ou clique para selecionar
            </p>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
              Selecionar Arquivo
            </button>
          </div>

          <div className="flex items-center space-x-4">
            <label className="flex items-center">
              <input type="checkbox" className="mr-2" />
              <Lock className="w-4 h-4 mr-1" />
              Privado
            </label>
            <label className="flex items-center">
              <input type="checkbox" className="mr-2" />
              <Star className="w-4 h-4 mr-1" />
              Favorito
            </label>
          </div>

          <div className="flex justify-end space-x-2">
            <button
              onClick={() => setShowUploadModal(false)}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Cancelar
            </button>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
              Salvar
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // Componente de Visualização de Item
  const ItemViewer = ({ item }: { item: MediaItem }) => (
    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
            {getItemIcon(item.type)}
            <span className="ml-2">{item.title}</span>
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mt-1">{item.description}</p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => toggleFavorite(item.id)}
            className={`p-2 rounded-lg ${item.isFavorite ? 'text-yellow-500' : 'text-gray-400'} hover:bg-gray-200 dark:hover:bg-gray-600`}
          >
            <Star className="w-5 h-5" fill={item.isFavorite ? 'currentColor' : 'none'} />
          </button>
          <button
            onClick={() => togglePrivacy(item.id)}
            className={`p-2 rounded-lg ${item.isPrivate ? 'text-red-500' : 'text-green-500'} hover:bg-gray-200 dark:hover:bg-gray-600`}
          >
            {item.isPrivate ? <Lock className="w-5 h-5" /> : <Unlock className="w-5 h-5" />}
          </button>
          <button className="p-2 rounded-lg text-blue-500 hover:bg-gray-200 dark:hover:bg-gray-600">
            <Download className="w-5 h-5" />
          </button>
          <button
            onClick={() => handleDeleteItem(item.id)}
            className="p-2 rounded-lg text-red-500 hover:bg-gray-200 dark:hover:bg-gray-600"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Preview area baseada no tipo */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 mb-4 min-h-[200px] flex items-center justify-center">
        {item.type === 'audio' && (
          <div className="text-center">
            <FileAudio className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <div className="flex items-center justify-center space-x-4">
              <button className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700">
                <Play className="w-4 h-4" />
              </button>
              <span className="text-gray-600 dark:text-gray-400">{item.duration}</span>
              <Volume2 className="w-5 h-5 text-gray-400" />
            </div>
          </div>
        )}
        {item.type === 'video' && (
          <div className="text-center">
            <Video className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Player de vídeo</p>
          </div>
        )}
        {item.type === 'mindmap' && (
          <div className="text-center">
            <Brain className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Visualização do mapa mental</p>
          </div>
        )}
        {item.type === 'document' && (
          <div className="text-center">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Pré-visualização do documento</p>
          </div>
        )}
        {item.type === 'image' && (
          <div className="text-center">
            <Camera className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Pré-visualização da imagem</p>
          </div>
        )}
        {item.type === 'meeting' && (
          <div className="text-center">
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Gravação da reunião</p>
          </div>
        )}
      </div>

      {/* Metadados */}
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <span className="text-gray-500 dark:text-gray-400">Data:</span>
          <span className="ml-2 text-gray-900 dark:text-white">
            {new Date(item.date).toLocaleDateString('pt-BR')}
          </span>
        </div>
        {item.size && (
          <div>
            <span className="text-gray-500 dark:text-gray-400">Tamanho:</span>
            <span className="ml-2 text-gray-900 dark:text-white">{item.size}</span>
          </div>
        )}
        {item.duration && (
          <div>
            <span className="text-gray-500 dark:text-gray-400">Duração:</span>
            <span className="ml-2 text-gray-900 dark:text-white">{item.duration}</span>
          </div>
        )}
        {item.location && (
          <div className="col-span-2">
            <span className="text-gray-500 dark:text-gray-400">Local:</span>
            <span className="ml-2 text-gray-900 dark:text-white">{item.location}</span>
          </div>
        )}
        {item.participants && item.participants.length > 0 && (
          <div className="col-span-2">
            <span className="text-gray-500 dark:text-gray-400">Participantes:</span>
            <span className="ml-2 text-gray-900 dark:text-white">
              {item.participants.join(', ')}
            </span>
          </div>
        )}
      </div>

      {/* Tags */}
      <div className="mt-4">
        <span className="text-gray-500 dark:text-gray-400 text-sm">Tags:</span>
        <div className="flex flex-wrap gap-2 mt-2">
          {item.tags.map((tag, index) => (
            <span
              key={index}
              className="px-2 py-1 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-full text-xs"
            >
              #{tag}
            </span>
          ))}
        </div>
      </div>

      {/* Notas */}
      <div className="mt-4">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Notas e Observações
        </h4>
        <textarea
          placeholder="Adicione suas anotações aqui..."
          className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          rows={4}
          defaultValue={item.notes}
        />
      </div>
    </div>
  );

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg">
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-700 p-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
            <Briefcase className="w-6 h-6 mr-2" />
            Acervo de Mídia - {personName}
          </h2>
          {onClose && (
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            >
              <X className="w-6 h-6" />
            </button>
          )}
        </div>

        {/* Estatísticas rápidas */}
        <div className="grid grid-cols-6 gap-4 mt-4">
          {categories.map(cat => (
            <div
              key={cat.type}
              className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
              onClick={() => setSelectedType(cat.type)}
            >
              <div className={`${cat.color} text-white p-2 rounded-lg inline-flex mb-2`}>
                {cat.icon}
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{cat.count}</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">{cat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Toolbar */}
      <div className="border-b border-gray-200 dark:border-gray-700 p-4">
        <div className="flex flex-wrap gap-4 items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Busca */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar arquivos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white w-64"
              />
            </div>

            {/* Filtros */}
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="all">Todos os tipos</option>
              {categories.map(cat => (
                <option key={cat.type} value={cat.type}>{cat.label}</option>
              ))}
            </select>

            {/* Ordenação */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="date">Mais recentes</option>
              <option value="name">Nome</option>
              <option value="size">Tamanho</option>
            </select>

            {/* Filtro de privacidade */}
            <div className="flex gap-2">
              <button
                onClick={() => setFilterPrivate(null)}
                className={`px-3 py-2 rounded-lg ${filterPrivate === null ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
              >
                Todos
              </button>
              <button
                onClick={() => setFilterPrivate(false)}
                className={`px-3 py-2 rounded-lg ${filterPrivate === false ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
              >
                <Unlock className="w-4 h-4" />
              </button>
              <button
                onClick={() => setFilterPrivate(true)}
                className={`px-3 py-2 rounded-lg ${filterPrivate === true ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
              >
                <Lock className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Botão de upload */}
          <button
            onClick={() => setShowUploadModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            Adicionar Arquivo
          </button>
        </div>
      </div>

      {/* Conteúdo principal */}
      <div className="flex h-[600px]">
        {/* Lista de arquivos */}
        <div className="w-1/2 border-r border-gray-200 dark:border-gray-700 overflow-y-auto">
          {filteredItems.length > 0 ? (
            <div className="p-4 space-y-2">
              {filteredItems.map(item => (
                <div
                  key={item.id}
                  onClick={() => setSelectedItem(item)}
                  className={`p-4 rounded-lg cursor-pointer transition-colors ${
                    selectedItem?.id === item.id
                      ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-500'
                      : 'bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600'
                  } border ${selectedItem?.id === item.id ? 'border-blue-500' : 'border-transparent'}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <div className={`${getItemColor(item.type)} text-white p-2 rounded-lg`}>
                        {getItemIcon(item.type)}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 dark:text-white flex items-center">
                          {item.title}
                          {item.isFavorite && <Star className="w-4 h-4 ml-2 text-yellow-500" fill="currentColor" />}
                          {item.isPrivate && <Lock className="w-4 h-4 ml-2 text-red-500" />}
                        </h4>
                        {item.description && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                            {item.description}
                          </p>
                        )}
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
                          <span className="flex items-center">
                            <Calendar className="w-3 h-3 mr-1" />
                            {new Date(item.date).toLocaleDateString('pt-BR')}
                          </span>
                          {item.duration && (
                            <span className="flex items-center">
                              <Clock className="w-3 h-3 mr-1" />
                              {item.duration}
                            </span>
                          )}
                          {item.size && (
                            <span>{item.size}</span>
                          )}
                        </div>
                        {item.tags.length > 0 && (
                          <div className="flex gap-1 mt-2">
                            {item.tags.slice(0, 3).map((tag, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-0.5 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-full text-xs"
                              >
                                #{tag}
                              </span>
                            ))}
                            {item.tags.length > 3 && (
                              <span className="text-xs text-gray-500">+{item.tags.length - 3}</span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400">
              <FolderOpen className="w-16 h-16 mb-4 text-gray-300" />
              <p className="text-lg font-medium">Nenhum arquivo encontrado</p>
              <p className="text-sm mt-2">Adicione arquivos para começar</p>
            </div>
          )}
        </div>

        {/* Visualização detalhada */}
        <div className="w-1/2 p-6 overflow-y-auto">
          {selectedItem ? (
            <ItemViewer item={selectedItem} />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400">
              <Eye className="w-16 h-16 mb-4 text-gray-300" />
              <p className="text-lg font-medium">Selecione um arquivo</p>
              <p className="text-sm mt-2">Clique em um arquivo para visualizar os detalhes</p>
            </div>
          )}
        </div>
      </div>

      {/* Modais */}
      {showUploadModal && <UploadModal />}
    </div>
  );
};

export default PersonMediaVault;
