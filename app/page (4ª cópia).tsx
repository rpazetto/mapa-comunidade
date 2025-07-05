'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, Users, MapPin, Heart, Briefcase, Home, Settings, Trash2, Edit3, LogOut, Download, Moon, Sun, Camera, Menu, Check, User, Link, Map, BarChart3, Upload, Eye, Phone, Calendar, FileText, Vote, X } from 'lucide-react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { usePeople } from './hooks/usePeople';
import { useTheme } from './components/ThemeProvider';
import NetworkGraph from './components/NetworkGraph';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import ExportModal from './components/ExportModal';
import PhotoUploadModal from './components/PhotoUploadModal';
import BulkActions from './components/BulkActions';
import MobileMenu from './components/MobileMenu';
import RelationshipManager from './components/RelationshipManager';
import PoliticalDashboard from './components/PoliticalDashboard';
import { useTags } from './hooks/useTags';
import TagManager from './components/TagManager';
import PersonTags from './components/PersonTags';
import { Tag as TagIcon } from 'lucide-react';
import GeographicMap from './components/GeographicMap';
import DemographicAnalysis from './components/DemographicAnalysis';
import GoalsDashboard from './components/GoalsDashboard';
import ImportWizard from './components/ImportWizard';
import PoliticalCalendar from './components/PoliticalCalendar';
import { Calendar as CalendarIcon } from 'lucide-react';
import PersonMediaVault from './components/PersonMediaVault';

interface Person {
  id: string;
  name: string;
  nickname?: string;
  context: string;
  proximity: string;
  importance?: number;
  trust_level?: number;
  influence_level?: number;
  occupation?: string;
  company?: string;
  position?: string;
  professional_class?: string;
  political_party?: string;
  political_position?: string;
  phone?: string;
  mobile?: string;
  email?: string;
  city?: string;
  state?: string;
  neighborhood?: string;
  notes?: string;
  last_contact?: string;
  contact_frequency?: string;
  birth_date?: string;
  gender?: string;
  address?: string;
  zip_code?: string;
  whatsapp?: string;
  political_role?: string;
  is_candidate?: boolean;
  is_elected?: boolean;
}

interface Context {
  value: string;
  label: string;
  icon: string;
  color: string;
}

interface ProximityLevel {
  value: string;
  label: string;
  color: string;
  priority: number;
}

// Função auxiliar para garantir dados válidos antes de enviar para o banco
const preparePersonData = (person: Partial<Person>, isNew = false) => {
  // Para novos registros, garantir campos obrigatórios
  if (isNew && (!person.name || !person.context || !person.proximity)) {
    throw new Error('Nome, contexto e proximidade são obrigatórios');
  }

  return {
    ...(person.id && { id: person.id }),
    name: person.name || '',
    nickname: person.nickname || null,
    birth_date: person.birth_date || null,
    gender: (person.gender || 'N') as 'M' | 'F' | 'N',
    context: person.context || '',
    proximity: person.proximity || '',
    importance: person.importance || 3,
    trust_level: person.trust_level || 3,
    influence_level: person.influence_level || 3,
    occupation: person.occupation || null,
    company: person.company || null,
    position: person.position || null,
    professional_class: person.professional_class || null,
    education_level: null,
    income_range: null,
    political_party: person.political_party || null,
    political_position: null,
    is_candidate: Boolean(person.is_candidate),
    is_elected: Boolean(person.is_elected),
    political_role: person.political_role || null,
    phone: person.phone || null,
    mobile: person.mobile || null,
    email: person.email || null,
    address: person.address || null,
    city: person.city || 'Gramado',
    state: person.state || 'RS',
    neighborhood: person.neighborhood || null,
    zip_code: person.zip_code || null,
    facebook: null,
    instagram: null,
    twitter: null,
    linkedin: null,
    whatsapp: person.whatsapp || null,
    notes: person.notes || null,
    last_contact: person.last_contact || null,
    contact_frequency: person.contact_frequency || null
  };
};

// Componente Modal de Perfil da Pessoa
interface PersonProfileModalProps {
  person: Person | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (person: Person) => void;
  onOpenMediaVault: (person: Person) => void;
  personPhoto?: string;
  tags?: any[];
  contexts: Context[];
  proximityLevels: ProximityLevel[];
  classesProfissionais: { valor: string; label: string }[];
  partidosPoliticos: { sigla: string; nome: string; numero: string }[];
  bairrosGramado: string[];
}

const PersonProfileModal: React.FC<PersonProfileModalProps> = ({
  person,
  isOpen,
  onClose,
  onEdit,
  onOpenMediaVault,
  personPhoto,
  tags = [],
  contexts,
  proximityLevels,
  classesProfissionais,
  partidosPoliticos,
  bairrosGramado
}) => {
  if (!isOpen || !person) return null;

  const contextInfo = contexts.find(c => c.value === person.context) || { label: '', icon: '', color: '' };
  const proximityInfo = proximityLevels.find(p => p.value === person.proximity) || { label: '', color: '' };
  const classeProfissional = classesProfissionais.find(c => c.valor === person.professional_class);
  const partidoInfo = partidosPoliticos.find(p => p.sigla === person.political_party);

  // Calcular idade se tiver data de nascimento
  const calculateAge = (birthDate: string) => {
    const birth = new Date(birthDate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  // Formatar data
  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };

  // Calcular dias desde último contato
  const daysSinceLastContact = () => {
    if (!person.last_contact) return null;
    const lastContact = new Date(person.last_contact);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - lastContact.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Calcular relevância
  const calculateRelevance = (person: Person): number => {
    const proximityScore: Record<string, number> = {
      'nucleo': 5,
      'primeiro': 4,
      'segundo': 3,
      'terceiro': 2,
      'periferia': 1
    };
    
    const frequencyScore: Record<string, number> = {
      'daily': 5,
      'weekly': 4,
      'monthly': 3,
      'quarterly': 2,
      'yearly': 1
    };
    
    const pScore = proximityScore[person.proximity] || 1;
    const iScore = person.importance || 3;
    const fScore = person.contact_frequency ? frequencyScore[person.contact_frequency] || 2 : 2;
    
    return (pScore * 0.4) + (iScore * 0.3) + (fScore * 0.3);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div 
        className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto animate-slideIn"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 dark:from-blue-800 dark:to-blue-900 p-6 rounded-t-lg">
          <div className="flex justify-between items-start">
            <div className="flex items-center space-x-4">
              {/* Foto */}
              <div className="relative">
                {personPhoto ? (
                  <img
                    src={personPhoto}
                    alt={person.name}
                    className="w-24 h-24 rounded-full border-4 border-white dark:border-gray-700 object-cover"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-gray-200 dark:bg-gray-600 border-4 border-white dark:border-gray-700 flex items-center justify-center">
                    <User className="w-12 h-12 text-gray-400 dark:text-gray-500" />
                  </div>
                )}
              </div>
              
              {/* Informações básicas */}
              <div className="text-white">
                <h2 className="text-2xl font-bold">{person.name}</h2>
                {person.nickname && (
                  <p className="text-blue-100 italic">"{person.nickname}"</p>
                )}
                <div className="flex items-center gap-2 mt-2">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${contextInfo.color}`}>
                    {contextInfo.icon} {contextInfo.label}
                  </span>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${proximityInfo.color}`}>
                    {proximityInfo.label}
                  </span>
                </div>
              </div>
            </div>
            
            {/* Botões de ação */}
            <div className="flex space-x-2">
              <button
                onClick={() => {
                  onOpenMediaVault(person);
                  onClose();
                }}
                className="p-2 bg-white dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                title="Acervo de Mídia"
              >
                <Briefcase className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              </button>
              <button
                onClick={() => {
                  onEdit(person);
                  onClose();
                }}
                className="p-2 bg-white dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                title="Editar"
              >
                <Edit3 className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              </button>
              <button
                onClick={onClose}
                className="p-2 bg-white dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                title="Fechar"
              >
                <X className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              </button>
            </div>
          </div>
          
          {/* Importância */}
          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-white text-sm">Importância:</span>
              <div className="flex">
                {[...Array(person.importance || 3)].map((_, i) => (
                  <span key={i} className="text-yellow-300 text-lg">⭐</span>
                ))}
              </div>
            </div>
            {daysSinceLastContact() !== null && (
              <div className="text-white text-sm">
                Último contato há {daysSinceLastContact()} dias
              </div>
            )}
          </div>
        </div>

        {/* Conteúdo */}
        <div className="p-6">
          {/* Grid de informações */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Coluna 1: Informações Pessoais */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <User className="w-5 h-5 mr-2" />
                Informações Pessoais
              </h3>
              <div className="space-y-3">
                {person.birth_date && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Data de Nascimento:</span>
                    <span className="text-gray-900 dark:text-white font-medium">
                      {formatDate(person.birth_date)} ({calculateAge(person.birth_date)} anos)
                    </span>
                  </div>
                )}
                {person.gender && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Gênero:</span>
                    <span className="text-gray-900 dark:text-white font-medium">
                      {person.gender === 'M' ? 'Masculino' : person.gender === 'F' ? 'Feminino' : 'Não informado'}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Nível de Confiança:</span>
                  <span className="text-gray-900 dark:text-white font-medium">
                    {person.trust_level || 3}/5
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Nível de Influência:</span>
                  <span className="text-gray-900 dark:text-white font-medium">
                    {person.influence_level || 3}/5
                  </span>
                </div>
              </div>
            </div>

            {/* Coluna 2: Informações Profissionais */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <Briefcase className="w-5 h-5 mr-2" />
                Informações Profissionais
              </h3>
              <div className="space-y-3">
                {person.occupation && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Profissão:</span>
                    <span className="text-gray-900 dark:text-white font-medium">{person.occupation}</span>
                  </div>
                )}
                {classeProfissional && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Classe Profissional:</span>
                    <span className="text-gray-900 dark:text-white font-medium">{classeProfissional.label}</span>
                  </div>
                )}
                {person.company && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Empresa:</span>
                    <span className="text-gray-900 dark:text-white font-medium">{person.company}</span>
                  </div>
                )}
                {person.position && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Cargo:</span>
                    <span className="text-gray-900 dark:text-white font-medium">{person.position}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Informações Políticas */}
          {(person.political_party || person.political_role || person.is_candidate || person.is_elected) && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <Vote className="w-5 h-5 mr-2" />
                Informações Políticas
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {partidoInfo && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Partido:</span>
                    <span className="text-gray-900 dark:text-white font-medium">
                      {partidoInfo.numero} - {partidoInfo.sigla} - {partidoInfo.nome}
                    </span>
                  </div>
                )}
                {person.political_role && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Função Política:</span>
                    <span className="text-gray-900 dark:text-white font-medium">{person.political_role}</span>
                  </div>
                )}
                {person.is_candidate && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Candidato:</span>
                    <span className="text-green-600 dark:text-green-400 font-medium">Sim</span>
                  </div>
                )}
                {person.is_elected && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Eleito:</span>
                    <span className="text-green-600 dark:text-green-400 font-medium">Sim</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Informações de Contato */}
          <div className="mt-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <Phone className="w-5 h-5 mr-2" />
              Informações de Contato
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {person.mobile && (
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Celular:</span>
                  <a href={`tel:${person.mobile}`} className="text-blue-600 dark:text-blue-400 hover:underline">
                    {person.mobile}
                  </a>
                </div>
              )}
              {person.phone && (
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Telefone:</span>
                  <a href={`tel:${person.phone}`} className="text-blue-600 dark:text-blue-400 hover:underline">
                    {person.phone}
                  </a>
                </div>
              )}
              {person.email && (
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Email:</span>
                  <a href={`mailto:${person.email}`} className="text-blue-600 dark:text-blue-400 hover:underline">
                    {person.email}
                  </a>
                </div>
              )}
              {person.whatsapp && (
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">WhatsApp:</span>
                  <a 
                    href={`https://wa.me/${person.whatsapp.replace(/\D/g, '')}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-green-600 dark:text-green-400 hover:underline"
                  >
                    {person.whatsapp}
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Endereço */}
          {(person.address || person.city || person.state || person.zip_code || person.neighborhood) && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <MapPin className="w-5 h-5 mr-2" />
                Endereço
              </h3>
              <div className="text-gray-900 dark:text-white">
                {person.address && <p>{person.address}</p>}
                {(person.neighborhood || person.city || person.state || person.zip_code) && (
                  <p>
                    {person.neighborhood && `${person.neighborhood}, `}
                    {person.city && `${person.city}`}
                    {person.city && person.state && `, `}
                    {person.state && `${person.state}`}
                    {person.zip_code && ` - CEP: ${person.zip_code}`}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Frequência de Contato */}
          {person.contact_frequency && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <Calendar className="w-5 h-5 mr-2" />
                Gestão de Relacionamento
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Frequência de Contato:</span>
                  <span className="text-gray-900 dark:text-white font-medium">
                    {person.contact_frequency === 'daily' && 'Diário'}
                    {person.contact_frequency === 'weekly' && 'Semanal'}
                    {person.contact_frequency === 'monthly' && 'Mensal'}
                    {person.contact_frequency === 'quarterly' && 'Trimestral'}
                    {person.contact_frequency === 'yearly' && 'Anual'}
                  </span>
                </div>
                {person.last_contact && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Último Contato:</span>
                    <span className="text-gray-900 dark:text-white font-medium">
                      {formatDate(person.last_contact)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tags */}
          {tags && tags.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <TagIcon className="w-5 h-5 mr-2" />
                Tags
              </h3>
              <div className="flex flex-wrap gap-2">
                <PersonTags personId={person.id} personName={person.name} inline={true} />
              </div>
            </div>
          )}

          {/* Observações */}
          {person.notes && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <FileText className="w-5 h-5 mr-2" />
                Observações
              </h3>
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <p className="text-gray-900 dark:text-white whitespace-pre-wrap">{person.notes}</p>
              </div>
            </div>
          )}

          {/* Rodapé com estatísticas */}
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
              <span>ID: {person.id}</span>
              <span>Relevância: {calculateRelevance(person).toFixed(1)}/5.0</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function Page() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Usar o hook para gerenciar pessoas com MySQL
  const { 
    people, 
    loading: peopleLoading, 
    error: peopleError, 
    addPerson: addPersonToDb, 
    updatePerson: updatePersonInDb, 
    deletePerson: deletePersonFromDb,
    refreshPeople
  } = usePeople();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterContext, setFilterContext] = useState('all');
  const [filterProximity, setFilterProximity] = useState('all');
  const [filterImportance, setFilterImportance] = useState('all');
  const [filterParty, setFilterParty] = useState('all');
  const [filterNeighborhood, setFilterNeighborhood] = useState('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingPerson, setEditingPerson] = useState<Person | null>(null);
  const [viewMode, setViewMode] = useState<'table' | 'circles' | 'graph' | 'dashboard' | 'political' | 'geographic' | 'demographic' | 'goals' | 'calendar'>('table');
  const [showWizard, setShowWizard] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);
  const [brainstormList, setBrainstormList] = useState('');
  const [currentContextScan, setCurrentContextScan] = useState('residencial');
  const [showExportModal, setShowExportModal] = useState(false);
  const { tags } = useTags();
  const [showTagManager, setShowTagManager] = useState(false);
  const [selectedPersonForTags, setSelectedPersonForTags] = useState<Person | null>(null);
  const [showImportWizard, setShowImportWizard] = useState(false);
  const [affiliatesData, setAffiliatesData] = useState<any[]>([]);
  const [showCustomOccupation, setShowCustomOccupation] = useState(false);
  const [showCustomNeighborhood, setShowCustomNeighborhood] = useState(false); // 🆕 NOVO ESTADO
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [selectedPersonForProfile, setSelectedPersonForProfile] = useState<Person | null>(null);
  
  // Estados para melhorias de interface
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [selectedPersonForPhoto, setSelectedPersonForPhoto] = useState<string | null>(null);
  const [personPhotos, setPersonPhotos] = useState<Record<string, string>>({});
  const [selectedPeople, setSelectedPeople] = useState<Set<string>>(new Set());
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  
  // Estados para relacionamentos
  const [showRelationshipManager, setShowRelationshipManager] = useState(false);
  const [selectedPersonForRelationship, setSelectedPersonForRelationship] = useState<Person | null>(null);

  // Estados para o PersonMediaVault
  const [showMediaVault, setShowMediaVault] = useState(false);
  const [selectedPersonForMedia, setSelectedPersonForMedia] = useState<Person | null>(null);

  // Carregar dados de filiados
  useEffect(() => {
    fetchAffiliatesData();
  }, []);

  const fetchAffiliatesData = async () => {
    try {
      const response = await fetch('/api/affiliates?city=GRAMADO');
      if (response.ok) {
        const data = await response.json();
        setAffiliatesData(data);
      }
    } catch (error) {
      console.error('Erro ao buscar dados de filiados:', error);
    }
  };
// Adicionar contexto político
  const contexts: Context[] = [
    { value: 'residencial', label: 'Residencial', icon: '🏠', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' },
    { value: 'profissional', label: 'Profissional', icon: '💼', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' },
    { value: 'social', label: 'Social', icon: '👥', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' },
    { value: 'servicos', label: 'Serviços', icon: '🔧', color: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' },
    { value: 'institucional', label: 'Institucional', icon: '🏛️', color: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200' },
    { value: 'politico', label: 'Político', icon: '🗳️', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' }
  ];

  const proximityLevels: ProximityLevel[] = [
    { value: 'nucleo', label: 'Coordenadores', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200', priority: 1 },
    { value: 'primeiro', label: 'Players Políticos', color: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200', priority: 2 },
    { value: 'segundo', label: 'Líderes e Representantes', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200', priority: 3 },
    { value: 'terceiro', label: 'Filiados e Simpatizantes', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200', priority: 4 },
    { value: 'quarto', label: 'Players Potenciais', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200', priority: 5 },
    { value: 'grupo1', label: 'Pertence ao Movimento', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200', priority: 6 },
    { value: 'grupo2', label: 'Não Adere ao Movimento', color: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200', priority: 7 }
  ];

  // Array Partidos - Ordenado por número
  const partidosPoliticos = [
    { numero: '10', sigla: 'REPUBLICANOS', nome: 'Republicanos' },
    { numero: '11', sigla: 'PP', nome: 'Progressistas' },
    { numero: '12', sigla: 'PDT', nome: 'Partido Democrático Trabalhista' },
    { numero: '13', sigla: 'PT', nome: 'Partido dos Trabalhadores' },
    { numero: '14', sigla: 'PTB', nome: 'Partido Trabalhista Brasileiro' },
    { numero: '15', sigla: 'MDB', nome: 'Movimento Democrático Brasileiro' },
    { numero: '16', sigla: 'PSTU', nome: 'Partido Socialista dos Trabalhadores Unificado' },
    { numero: '17', sigla: 'PSL', nome: 'Partido Social Liberal' },
    { numero: '18', sigla: 'REDE', nome: 'Rede Sustentabilidade' },
    { numero: '19', sigla: 'PODE', nome: 'Podemos' },
    { numero: '20', sigla: 'PSC', nome: 'Partido Social Cristão' },
    { numero: '21', sigla: 'PCB', nome: 'Partido Comunista Brasileiro' },
    { numero: '22', sigla: 'PL', nome: 'Partido Liberal' },
    { numero: '23', sigla: 'CIDADANIA', nome: 'Cidadania' },
    { numero: '25', sigla: 'DEM', nome: 'Democratas' },
    { numero: '27', sigla: 'DC', nome: 'Democracia Cristã' },
    { numero: '28', sigla: 'PRTB', nome: 'Partido Renovador Trabalhista Brasileiro' },
    { numero: '29', sigla: 'PCO', nome: 'Partido da Causa Operária' },
    { numero: '30', sigla: 'NOVO', nome: 'Partido Novo' },
    { numero: '31', sigla: 'PHS', nome: 'Partido Humanista da Solidariedade' },
    { numero: '33', sigla: 'PMN', nome: 'Partido da Mobilização Nacional' },
    { numero: '35', sigla: 'PMB', nome: 'Partido da Mulher Brasileira' },
    { numero: '36', sigla: 'PTC', nome: 'Partido Trabalhista Cristão' },
    { numero: '40', sigla: 'PSB', nome: 'Partido Socialista Brasileiro' },
    { numero: '43', sigla: 'PV', nome: 'Partido Verde' },
    { numero: '44', sigla: 'UNIÃO', nome: 'União Brasil' },
    { numero: '45', sigla: 'PSDB', nome: 'Partido da Social Democracia Brasileira' },
    { numero: '50', sigla: 'PSOL', nome: 'Partido Socialismo e Liberdade' },
    { numero: '51', sigla: 'PATRIOTA', nome: 'Patriota' },
    { numero: '54', sigla: 'PPL', nome: 'Partido Pátria Livre' },
    { numero: '55', sigla: 'PSD', nome: 'Partido Social Democrático' },
    { numero: '65', sigla: 'PCdoB', nome: 'Partido Comunista do Brasil' },
    { numero: '70', sigla: 'AVANTE', nome: 'Avante' },
    { numero: '77', sigla: 'SOLIDARIEDADE', nome: 'Solidariedade' },
    { numero: '80', sigla: 'UP', nome: 'Unidade Popular' },
    { numero: '90', sigla: 'PROS', nome: 'Partido Republicano da Ordem Social' },
  ];

  // Array de Classes Profissionais (categorias)
  const classesProfissionais = [
    { valor: 'saude_medicina', label: 'Saúde e Medicina' },
    { valor: 'educacao_pesquisa', label: 'Educação e Pesquisa' },
    { valor: 'tecnologia_informatica', label: 'Tecnologia e Informática' },
    { valor: 'engenharia_arquitetura', label: 'Engenharia e Arquitetura' },
    { valor: 'direito_justica', label: 'Direito e Justiça' },
    { valor: 'comunicacao_midia', label: 'Comunicação e Mídia' },
    { valor: 'administracao_negocios', label: 'Administração e Negócios' },
    { valor: 'vendas_comercio', label: 'Vendas e Comércio' },
    { valor: 'industria_producao', label: 'Indústria e Produção' },
    { valor: 'construcao_civil', label: 'Construção Civil' },
    { valor: 'transporte_logistica', label: 'Transporte e Logística' },
    { valor: 'agricultura_pecuaria', label: 'Agricultura e Pecuária' },
    { valor: 'arte_cultura', label: 'Arte e Cultura' },
    { valor: 'esportes_lazer', label: 'Esportes e Lazer' },
    { valor: 'beleza_estetica', label: 'Beleza e Estética' },
    { valor: 'seguranca', label: 'Segurança' },
    { valor: 'servicos_domesticos_pessoais', label: 'Serviços Domésticos e Pessoais' },
    { valor: 'financas_seguros', label: 'Finanças e Seguros' },
    { valor: 'hospitalidade_alimentacao', label: 'Hospitalidade e Alimentação' },
    { valor: 'meio_ambiente', label: 'Meio Ambiente' },
    { valor: 'servicos_sociais', label: 'Serviços Sociais' },
    { valor: 'religiao_espiritualidade', label: 'Religião e Espiritualidade' },
    { valor: 'servicos_publicos', label: 'Serviços Públicos' },
    { valor: 'energia_utilidades', label: 'Energia e Utilidades' },
    { valor: 'telecomunicacoes', label: 'Telecomunicações' },
    { valor: 'comercio_exterior', label: 'Comércio Exterior' },
    { valor: 'economia_criativa', label: 'Economia Criativa' },
    { valor: 'consultoria_servicos_especializados', label: 'Consultoria e Serviços Especializados' },
    { valor: 'manutencao_reparos', label: 'Manutenção e Reparos' },
    { valor: 'ciencias_exatas_naturais', label: 'Ciências Exatas e Naturais' },
    { valor: 'outros', label: 'Outros' }
  ];

  // 🆕 ARRAY DE BAIRROS E LOCALIDADES DE GRAMADO
  const bairrosGramado = [
    // Bairros Centrais
    'Centro',
    'Avenida Central', 
    'Planalto',
    'Carniel',
    'Floresta',
    'Jardim',
    'Dutra',
    'Piratini',
    
    // Bairros Residenciais
    'Bavária',
    'Bela Vista',
    'Candiago',
    'Carazal',
    'Casagrande',
    'Mato Queimado',
    'Minuano',
    'Monte Verde',
    'Tirol',
    'Três Pinheiros',
    'Vale dos Pinheiros',
    'Várzea Grande',
    'Vila do Sol',
    'Vila Suíça',
    'Pórtico 1',
    'Pórtico 2',
    'Altos da Viação Férrea',
    'Aspen',
    
    // Linhas (Áreas Rurais)
    'Linha 15',
    'Linha 28',
    'Linha Araripe',
    'Linha Ávila',
    'Linha Bonita',
    'Linha Carahá',
    'Linha Furna',
    'Linha Marcondes',
    'Linha Nova',
    'Linha Pedras Brancas',
    'Linha Quilombo',
    'Linha Tapera',
    'Morro do Arame',
    'Serra Grande',
    'Moleque',
    'Gambelo',
    'Moreira',
    
    // Condomínios Fechados
    'Condomínio Residencial Aspen Mountain',
    'Condomínio Vale do Bosque',
    'Condomínio Knorrville',
    'Condomínio O Bosque',
    'Condomínio Portal de Gramado',
    'Condomínio Residencial Villa Bella',
    'Condomínio Saint Morit',
    'Condomínio Villaggio',    
    'Condomínio Lagos de Gramado',
    'Condomínio Buena Vista',
    'Condomínio Montanha Del Fiori'
  ].sort(); // Ordenar alfabeticamente

  // Array de sugestões de profissões organizadas por categoria
  const profissoesPorCategoria = {
  'saude_medicina': [
    'Médico Clínico Geral', 'Médico Cardiologista', 'Médico Pediatra', 'Médico Ginecologista',
    'Médico Ortopedista', 'Médico Psiquiatra', 'Médico Neurologista', 'Médico Dermatologista',
    'Médico Anestesista', 'Médico Oftalmologista', 'Enfermeiro', 'Técnico de Enfermagem', 
    'Farmacêutico', 'Dentista', 'Fisioterapeuta', 'Psicólogo', 'Nutricionista', 'Biomédico', 
    'Radiologista', 'Anestesista', 'Paramédico', 'Terapeuta Ocupacional', 'Fonoaudiólogo', 
    'Veterinário', 'Auxiliar Veterinário', 'Podólogo', 'Optometrista', 'Quiropraxista', 
    'Acupunturista', 'Homeopata', 'Assistente'
  ],
  'educacao_pesquisa': [
    'Professor de Educação Infantil', 'Professor de Ensino Fundamental', 'Professor de Ensino Médio',
    'Professor Universitário', 'Pedagogo', 'Coordenador Pedagógico', 'Diretor Escolar',
    'Orientador Educacional', 'Pesquisador Científico', 'Bibliotecário', 'Intérprete de Libras',
    'Auxiliar de Classe', 'Inspetor de Alunos', 'Psicopedagogo', 'Professor de Educação Especial',
    'Tutor', 'Instrutor de Cursos Livres', 'Museólogo', 'Arquivista', 'Assistente'
  ],
  'tecnologia_informatica': [
    'Programador', 'Desenvolvedor Web', 'Desenvolvedor Mobile', 'Analista de Sistemas',
    'Engenheiro de Software', 'Administrador de Banco de Dados', 'Especialista em Segurança da Informação',
    'Cientista de Dados', 'Analista de Business Intelligence', 'Designer UX/UI', 'Técnico de Suporte',
    'Administrador de Redes', 'Arquiteto de Soluções', 'Engenheiro DevOps', 'Especialista em IA',
    'Desenvolvedor de Games', 'Testador de Software', 'Gerente de Projetos de TI', 'CEO', 'CTO', 'Assistente'
  ],
  'engenharia_arquitetura': [
    'Engenheiro Civil', 'Engenheiro Mecânico', 'Engenheiro Elétrico', 'Engenheiro Eletrônico',
    'Engenheiro Químico', 'Engenheiro de Produção', 'Engenheiro Ambiental', 'Engenheiro de Alimentos',
    'Engenheiro Aeronáutico', 'Engenheiro Naval', 'Arquiteto', 'Urbanista', 'Paisagista',
    'Desenhista Técnico', 'Topógrafo', 'Agrimensor', 'Geólogo', 'Agrônomo', 'Assistente'
  ],
  'direito_justica': [
    'Advogado', 'Juiz', 'Promotor', 'Desembargador', 'Defensor Público', 'Delegado', 'Escrivão',
    'Oficial de Justiça', 'Tabelião', 'Registrador', 'Perito Judicial', 'Mediador',
    'Árbitro', 'Conciliador', 'Analista Judiciário', 'Técnico Judiciário',
    'Assistente Jurídico', 'Consultor Jurídico', 'Procurador', 'Assistente'
  ],
  'comunicacao_midia': [
    'Jornalista', 'Repórter', 'Editor', 'Revisor', 'Tradutor', 'Intérprete',
    'Locutor', 'Apresentador', 'Produtor de TV', 'Produtor de Rádio', 'Cinegrafista',
    'Fotógrafo', 'Designer Gráfico', 'Publicitário', 'Redator', 'Social Media Manager',
    'Assessor de Imprensa', 'Relações Públicas', 'Roteirista', 'Diretor de Arte',
    'Editor de Vídeo', 'Sonoplasta', 'Assistente'
  ],
  'administracao_negocios': [
    'Administrador', 'Gestor Empresarial', 'Analista de Negócios', 'Consultor Empresarial',
    'Contador', 'Auditor', 'Controller', 'Analista Financeiro', 'Gerente de Projetos',
    'Analista de RH', 'Recrutador', 'Comprador', 'Analista de Logística',
    'Gestor de Qualidade', 'Secretário Executivo', 'Assistente Administrativo',
    'Recepcionista', 'Analista de Marketing', 'Gerente de Produto', 'Empresário',
    'CEO', 'CFO', 'Presidente', 'Conselheiro', 'Assistente'
  ],
  'vendas_comercio': [
    'Vendedor', 'Representante Comercial', 'Gerente de Vendas', 'Promotor de Vendas',
    'Demonstrador', 'Caixa', 'Atendente de Loja', 'Comprador', 'Merchandiser',
    'Supervisor de Vendas', 'Consultor de Vendas', 'Operador de Telemarketing',
    'Corretor de Imóveis', 'Corretor de Seguros', 'Leiloeiro', 'Assistente'
  ],
  'industria_producao': [
    'Operador de Máquinas', 'Técnico Industrial', 'Supervisor de Produção',
    'Inspetor de Qualidade', 'Mecânico Industrial', 'Eletricista Industrial',
    'Soldador', 'Torneiro Mecânico', 'Fresador', 'Caldeireiro', 'Montador',
    'Operador de Empilhadeira', 'Almoxarife', 'Encarregado de Produção',
    'Ferramenteiro', 'Modelador', 'Fundidor', 'Assistente'
  ],
  'construcao_civil': [
    'Pedreiro', 'Carpinteiro', 'Eletricista', 'Encanador', 'Pintor', 'Azulejista',
    'Gesseiro', 'Armador', 'Servente', 'Mestre de Obras', 'Técnico em Edificações',
    'Instalador', 'Vidraceiro', 'Serralheiro', 'Marmorista', 'Impermeabilizador',
    'Aplicador de Drywall', 'Assistente'
  ],
  'transporte_logistica': [
    'Motorista de Ônibus', 'Motorista de Caminhão', 'Motorista de Táxi', 'Motorista de Aplicativo',
    'Piloto de Avião', 'Comandante de Navio', 'Maquinista', 'Controlador de Tráfego Aéreo',
    'Despachante Aduaneiro', 'Agente de Carga', 'Conferente', 'Operador Logístico',
    'Motociclista de Entrega', 'Estivador', 'Comissário de Bordo', 'Agente de Aeroporto', 'Assistente'
  ],
  'agricultura_pecuaria': [
    'Agricultor', 'Pecuarista', 'Agrônomo', 'Técnico Agrícola', 'Veterinário Rural',
    'Zootecnista', 'Operador de Máquinas Agrícolas', 'Trabalhador Rural', 'Viveirista',
    'Apicultor', 'Piscicultor', 'Silvicultor', 'Enólogo', 'Cafeicultor', 'Horticultor', 'Assistente'
  ],
  'arte_cultura': [
    'Artista Plástico', 'Músico', 'Cantor', 'Ator', 'Dançarino', 'Escritor', 'Poeta',
    'Escultor', 'Ceramista', 'Artesão', 'Ilustrador', 'Animador', 'Cenógrafo',
    'Figurinista', 'Maquiador', 'Coreógrafo', 'Maestro', 'Compositor', 'DJ',
    'Produtor Cultural', 'Curador', 'Crítico de Arte', 'Restaurador', 'Assistente'
  ],
  'esportes_lazer': [
    'Atleta Profissional', 'Técnico Esportivo', 'Preparador Físico', 'Fisioterapeuta Esportivo',
    'Árbitro', 'Personal Trainer', 'Professor de Educação Física', 'Salva-vidas',
    'Instrutor de Natação', 'Instrutor de Artes Marciais', 'Instrutor de Dança',
    'Instrutor de Yoga', 'Recreador', 'Guia Turístico', 'Agente de Viagem',
    'Organizador de Eventos', 'Assistente'
  ],
  'beleza_estetica': [
    'Cabeleireiro', 'Barbeiro', 'Manicure', 'Pedicure', 'Esteticista', 'Maquiador',
    'Massoterapêuta', 'Depilador', 'Designer de Sobrancelhas', 'Consultor de Imagem',
    'Tatuador', 'Body Piercer', 'Podólogo Estético', 'Assistente'
  ],
  'seguranca': [
    'Policial Civil', 'Policial Militar', 'Policial Federal', 'Policial Rodoviário',
    'Bombeiro', 'Guarda Municipal', 'Vigilante', 'Segurança Privado', 'Detetive Particular',
    'Agente Penitenciário', 'Agente de Trânsito', 'Socorrista', 'Brigadista',
    'Porteiro', 'Vigia Noturno', 'Assistente'
  ],
  'servicos_domesticos_pessoais': [
    'Empregado Doméstico', 'Diarista', 'Cozinheiro', 'Babá', 'Cuidador de Idosos',
    'Mordomo', 'Governanta', 'Jardineiro', 'Piscineiro', 'Passador', 'Lavador',
    'Personal Organizer', 'Dog Walker', 'Pet Sitter', 'Assistente'
  ],
  'financas_seguros': [
    'Bancário', 'Corretor de Valores', 'Analista de Investimentos', 'Gestor de Fundos',
    'Atuário', 'Corretor de Seguros', 'Perito de Seguros', 'Analista de Crédito',
    'Cobrador', 'Tesoureiro', 'Operador de Câmbio', 'Consultor Financeiro',
    'Planejador Financeiro', 'CFO', 'Assistente'
  ],
  'hospitalidade_alimentacao': [
    'Chef de Cozinha', 'Cozinheiro', 'Auxiliar de Cozinha', 'Garçom', 'Bartender',
    'Barista', 'Sommelier', 'Nutricionista de Produção', 'Confeiteiro', 'Padeiro',
    'Pizzaiolo', 'Sushiman', 'Churrasqueiro', 'Maître', 'Hostess', 'Camareira',
    'Recepcionista de Hotel', 'Concierge', 'Hoteleiro', 'Assistente'
  ],
  'meio_ambiente': [
    'Biólogo', 'Ecólogo', 'Gestor Ambiental', 'Técnico Ambiental', 'Analista Ambiental',
    'Oceanógrafo', 'Meteorologista', 'Guarda Florestal', 'Fiscal Ambiental',
    'Educador Ambiental', 'Consultor de Sustentabilidade', 'Reciclador', 'Gestor de Resíduos', 'Assistente'
  ],
  'servicos_sociais': [
    'Assistente Social', 'Educador Social', 'Conselheiro Tutelar', 'Agente Comunitário',
    'Facilitador Social', 'Coordenador de Projetos Sociais', 'Captador de Recursos',
    'Gestor de ONGs', 'Voluntário Profissional', 'Terapeuta Comunitário', 'Assistente'
  ],
  'religiao_espiritualidade': [
    'Padre', 'Pastor', 'Rabino', 'Imã', 'Monge', 'Freira', 'Diácono', 'Ministro Religioso',
    'Missionário', 'Teólogo', 'Capelão', 'Dirigente Espírita', 'Babalorixá', 'Yalorixá',
    'Guru Espiritual', 'Assistente'
  ],
  'servicos_publicos': [
    'Servidor Público Federal', 'Servidor Público Estadual', 'Servidor Público Municipal',
    'Diplomata', 'Fiscal da Receita', 'Fiscal do Trabalho', 'Fiscal de Vigilância Sanitária',
    'Auditor Público', 'Analista de Políticas Públicas', 'Gestor Público',
    'Técnico Administrativo', 'Agente Administrativo', 'Procurador', 'Assistente'
  ],
  'energia_utilidades': [
    'Eletricista de Alta Tensão', 'Técnico em Energia Solar', 'Operador de Usina Hidrelétrica',
    'Operador de Usina Termelétrica', 'Operador de Usina Nuclear', 'Leiturista',
    'Instalador de Gás', 'Técnico de Saneamento', 'Operador de Estação de Tratamento', 'Assistente'
  ],
  'telecomunicacoes': [
    'Técnico de Telecomunicações', 'Instalador de Telefonia', 'Operador de Telecom',
    'Engenheiro de Telecomunicações', 'Técnico de Fibra Ótica', 'Instalador de Antenas',
    'Técnico de Radiodifusão', 'Assistente'
  ],
  'comercio_exterior': [
    'Despachante Aduaneiro', 'Analista de Comércio Exterior', 'Trader',
    'Agente de Carga Internacional', 'Tradutor Juramentado', 'Consultor de Importação/Exportação',
    'Analista de Câmbio', 'Assistente'
  ],
  'economia_criativa': [
    'Designer de Jogos', 'Desenvolvedor de Aplicativos', 'Influenciador Digital',
    'Youtuber', 'Streamer', 'Podcaster', 'Designer de Moda', 'Estilista',
    'Coolhunter', 'Designer de Produtos', 'Designer de Interiores', 'Assistente'
  ],
  'consultoria_servicos_especializados': [
    'Consultor de Gestão', 'Coach', 'Mentor', 'Palestrante', 'Facilitador',
    'Auditor Independente', 'Perito', 'Avaliador', 'Investigador Privado',
    'Genealogista', 'Organizador de Eventos', 'Cerimonialista', 'Conselheiro', 'Assistente'
  ],
  'manutencao_reparos': [
    'Técnico de Manutenção', 'Eletricista Residencial', 'Encanador Residencial',
    'Técnico de Refrigeração', 'Mecânico Automotivo', 'Lanterneiro', 'Pintor Automotivo',
    'Técnico de Eletrônicos', 'Reparador de Eletrodomésticos', 'Chaveiro', 'Vidraceiro', 'Assistente'
  ],
  'ciencias_exatas_naturais': [
    'Matemático', 'Físico', 'Químico', 'Estatístico', 'Astrônomo', 'Oceanógrafo',
    'Climatologista', 'Sismólogo', 'Paleontólogo', 'Botânico', 'Zoólogo',
    'Microbiologista', 'Geneticista', 'Bioquímico', 'Assistente'
  ]
};

  // Função auxiliar para obter todas as profissões em uma lista plana
  const todasProfissoes = Object.values(profissoesPorCategoria).flat();

  // Estado para nova pessoa
  const [newPerson, setNewPerson] = useState<Partial<Person>>({
    name: '',
    context: '',
    proximity: '',
    occupation: '',
    mobile: '',
    city: 'Gramado',
    neighborhood: '',
    notes: '',
    last_contact: '',
    importance: 3,
    contact_frequency: '',
    political_party: '',
    professional_class: ''
  });

  // Redirecionar se não estiver autenticado
  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.push('/login');
    }
  }, [session, status, router]);

  // Carregar fotos salvas
  useEffect(() => {
    people.forEach(person => {
      const savedPhoto = localStorage.getItem(`photo_${person.id}`);
      if (savedPhoto) {
        setPersonPhotos(prev => ({
          ...prev,
          [person.id]: savedPhoto
        }));
      }
    });
  }, [people]);

  // Estatísticas
  const proximityStats = proximityLevels.map(level => ({
    ...level,
    count: people.filter(p => p.proximity === level.value).length
  }));

  const contextStats = contexts.map(context => ({
    ...context,
    count: people.filter(p => p.context === context.value).length
  }));

  // Algoritmo de cálculo de relevância
  const calculateRelevance = (person: Person): number => {
    const proximityScore: Record<string, number> = {
      'nucleo': 5,
      'primeiro': 4,
      'segundo': 3,
      'terceiro': 2,
      'periferia': 1
    };
    
    const frequencyScore: Record<string, number> = {
      'daily': 5,
      'weekly': 4,
      'monthly': 3,
      'quarterly': 2,
      'yearly': 1
    };
    
    const pScore = proximityScore[person.proximity] || 1;
    const iScore = person.importance || 3;
    const fScore = person.contact_frequency ? frequencyScore[person.contact_frequency] || 2 : 2;
    
    return (pScore * 0.4) + (iScore * 0.3) + (fScore * 0.3);
  };

  // Análise de saúde da rede
  const getNetworkHealth = () => {
    const totalPeople = people.length;
    const density = totalPeople > 0 ? (totalPeople / contexts.length).toFixed(1) : "0";
    const centrality = totalPeople > 0 ? 
      ((people.filter(p => p.proximity === 'nucleo' || p.proximity === 'primeiro').length / totalPeople) * 100).toFixed(0) : "0";
    
    const contextDistribution = contexts.map(c => ({
      context: c.label,
      percentage: totalPeople > 0 ? ((people.filter(p => p.context === c.value).length / totalPeople) * 100).toFixed(0) : "0"
    }));
    
    return { density, centrality, contextDistribution };
  };

  // Processar lista do brainstorming
  const processBrainstormList = async () => {
    const names = brainstormList.split('\n').filter(name => name.trim());
    
    for (const name of names) {
      await addPersonToDb({
        name: name.trim(),
        context: 'social',
        proximity: 'terceiro',
        importance: 3
      });
    }
    
    setBrainstormList('');
    setWizardStep(2);
    refreshPeople();
  };

  // Perguntas guiadas por contexto
  const contextQuestions: Record<string, string[]> = {
    residencial: [
      "Quem são seus vizinhos mais próximos?",
      "Você conhece o síndico ou administrador do prédio?",
      "Quem trabalha no seu condomínio? (Porteiros, zeladores, etc.)",
      "Há vizinhos com quem você conversa regularmente?",
      "Conhece pessoas do comércio local? (Padaria, mercado, etc.)"
    ],
    profissional: [
      "Quem são seus colegas de trabalho diretos?",
      "Quem é seu chefe ou supervisor?",
      "Você tem clientes ou fornecedores importantes?",
      "Conhece pessoas de outras áreas/departamentos?",
      "Há ex-colegas com quem mantém contato?"
    ],
    social: [
      "Quem são seus amigos mais próximos?",
      "Você participa de algum grupo ou clube?",
      "Quem você encontra em eventos sociais?",
      "Há pessoas de hobbies ou atividades em comum?",
      "Conhece pessoas através de outros amigos?"
    ],
    servicos: [
      "Quem é seu médico, dentista, ou outros profissionais de saúde?",
      "Você tem mecânico, eletricista ou outros prestadores de confiança?",
      "Quem corta seu cabelo ou faz suas unhas?",
      "Há professores particulares ou personal trainers?",
      "Conhece profissionais de serviços domésticos?"
    ],
    institucional: [
      "Conhece líderes religiosos ou espirituais?",
      "Há professores ou diretores de escolas?",
      "Você conhece políticos ou funcionários públicos?",
      "Participa de ONGs ou associações?",
      "Conhece pessoas de conselhos ou comitês?"
    ],
    politico: [
      "Conhece candidatos ou políticos eleitos?",
      "Participa de partidos políticos?",
      "Conhece assessores ou cabos eleitorais?",
      "Há lideranças comunitárias na sua região?",
      "Conhece pessoas influentes politicamente?"
    ]
  };

  // Função para abrir o perfil
  const openPersonProfile = (person: Person) => {
    setSelectedPersonForProfile(person);
    setShowProfileModal(true);
  };

  // Função para abrir o acervo de mídia
  const openMediaVault = (person: Person) => {
    setSelectedPersonForMedia(person);
    setShowMediaVault(true);
  };

  // Handler para importação em massa
  const handleBulkImport = async (importedPeople: any[]) => {
    try {
      // Processar cada pessoa importada
      for (const person of importedPeople) {
        await addPersonToDb(person);
      }
      
      // Recarregar dados
      await refreshPeople();
      setShowImportWizard(false);
      
      alert(`${importedPeople.length} pessoas importadas com sucesso!`);
    } catch (error) {
      console.error('Erro ao importar pessoas:', error);
      alert('Erro ao importar pessoas. Verifique o console para mais detalhes.');
    }
  };

  // Funções para fotos
  const handlePhotoUpdate = (personId: string, photoData: string) => {
    setPersonPhotos(prev => ({
      ...prev,
      [personId]: photoData
    }));
    localStorage.setItem(`photo_${personId}`, photoData);
  };

  // Função para contatar pessoa - CORRIGIDA
  const handleContactPerson = (person: Person) => {
    // Abrir o canal de contato disponível
    if (person.whatsapp) {
      window.open(`https://wa.me/${person.whatsapp.replace(/\D/g, '')}`, '_blank');
    } else if (person.mobile) {
      window.open(`tel:${person.mobile}`, '_blank');
    } else if (person.email) {
      window.open(`mailto:${person.email}`, '_blank');
    } else {
      alert('Nenhum contato disponível para esta pessoa');
    }
    
    // Atualizar último contato
    const updatedPerson = {
      ...person,
      last_contact: new Date().toISOString().split('T')[0]
    };
    
    // Usar a função auxiliar para garantir dados válidos
    const personData = preparePersonData(updatedPerson, false);
    updatePersonInDb(personData);
    refreshPeople();
  };

  // Funções para ações em massa
  const handleBulkDelete = async () => {
    const confirmed = window.confirm(`Tem certeza que deseja deletar ${selectedPeople.size} pessoas?`);
    if (confirmed) {
      for (const personId of selectedPeople) {
        await deletePersonFromDb(personId);
      }
      setSelectedPeople(new Set());
      refreshPeople();
    }
  };

  const handleBulkContextChange = async (newContext: string) => {
    for (const personId of selectedPeople) {
      const person = people.find(p => p.id === personId);
      if (person) {
        await updatePersonInDb({ ...person, context: newContext });
      }
    }
    setSelectedPeople(new Set());
    refreshPeople();
  };

  const handleBulkProximityChange = async (newProximity: string) => {
    for (const personId of selectedPeople) {
      const person = people.find(p => p.id === personId);
      if (person) {
        await updatePersonInDb({ ...person, proximity: newProximity });
      }
    }
    setSelectedPeople(new Set());
    refreshPeople();
  };

  const handleBulkExport = () => {
    const selectedData = people.filter(p => selectedPeople.has(p.id));
    console.log('Exportar selecionados:', selectedData);
  };

  const togglePersonSelection = (personId: string) => {
    const newSelected = new Set(selectedPeople);
    if (newSelected.has(personId)) {
      newSelected.delete(personId);
    } else {
      newSelected.add(personId);
    }
    setSelectedPeople(newSelected);
  };

  const toggleAllSelection = () => {
    if (selectedPeople.size === filteredPeople.length) {
      setSelectedPeople(new Set());
    } else {
      setSelectedPeople(new Set(filteredPeople.map(p => p.id)));
    }
  };

  // Adicionar pessoa - CORRIGIDA
  const addPerson = async () => {
    try {
      const personData = preparePersonData(newPerson, true);
      
      await addPersonToDb(personData as any);
      
      setNewPerson({
        name: '',
        context: '',
        proximity: '',
        occupation: '',
        mobile: '',
        city: '',
        notes: '',
        last_contact: '',
        importance: 3,
        contact_frequency: '',
        political_party: '',
        professional_class: '',
        neighborhood: ''
      });
      
      setShowAddForm(false);
      setShowCustomOccupation(false);
      setShowCustomNeighborhood(false); // 🆕 RESETAR BAIRRO CUSTOMIZADO
      refreshPeople();
      
    } catch (error) {
      console.error('Erro ao adicionar pessoa:', error);
      if (error instanceof Error) {
        alert(error.message);
      } else {
        alert('Erro ao adicionar pessoa. Verifique o console para mais detalhes.');
      }
    }
  };

  // Atualizar pessoa - CORRIGIDA
  const updatePerson = async () => {
    if (editingPerson) {
      try {
        const personData = preparePersonData(editingPerson, false);
        
        await updatePersonInDb(personData);
        setEditingPerson(null);
        setShowCustomOccupation(false);
        setShowCustomNeighborhood(false); // 🆕 RESETAR BAIRRO CUSTOMIZADO
        refreshPeople();
      } catch (error) {
        console.error('Erro ao atualizar pessoa:', error);
        alert('Erro ao atualizar pessoa. Verifique o console para mais detalhes.');
      }
    }
  };

  // Deletar pessoa
  const deletePerson = async (id: string) => {
    try {
      await deletePersonFromDb(id);
    } catch (error) {
      console.error('Erro ao deletar pessoa:', error);
    }
  };

  // Filtrar pessoas com novos filtros
  const filteredPeople = people.filter(person => {
    const matchesSearch = person.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (person.occupation && person.occupation.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         (person.political_party && person.political_party.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesContext = filterContext === 'all' || person.context === filterContext;
    const matchesProximity = filterProximity === 'all' || person.proximity === filterProximity;
    const matchesImportance = filterImportance === 'all' || (person.importance && person.importance.toString() === filterImportance);
    const matchesParty = filterParty === 'all' || 
                        (filterParty === 'sem_partido' ? !person.political_party : person.political_party === filterParty);    
    const matchesNeighborhood = filterNeighborhood === 'all' || 
                             (filterNeighborhood === 'sem_bairro' ? !person.neighborhood : person.neighborhood === filterNeighborhood);
  
  return matchesSearch && matchesContext && matchesProximity && matchesImportance && matchesParty && matchesNeighborhood;
});

  const getContextInfo = (contextValue: string) => contexts.find(c => c.value === contextValue) || { label: '', icon: '', color: '' };
  const getProximityInfo = (proximityValue: string) => proximityLevels.find(p => p.value === proximityValue) || { label: '', color: '' };

  // Mostrar loading enquanto verifica autenticação
  if (status === 'loading' || peopleLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="loader"></div>
      </div>
    );
  }

  // Se não estiver autenticado, não renderiza nada
  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
        <div className="mb-8 flex justify-between items-start">
          <div className="flex items-center gap-4">
            {/* Logo */}
            <div className="flex items-center">
              <svg 
                width="60" 
                height="60" 
                viewBox="0 0 100 100" 
                className="text-gray-700 dark:text-white"
                fill="currentColor"
              >
                {/* Círculo superior */}
                <circle cx="50" cy="20" r="8" fill="none" stroke="currentColor" strokeWidth="4"/>
                {/* Círculo inferior esquerdo */}
                <circle cx="20" cy="60" r="8" fill="none" stroke="currentColor" strokeWidth="4"/>
                {/* Círculo inferior direito */}
                <circle cx="80" cy="60" r="8" fill="none" stroke="currentColor" strokeWidth="4"/>
                {/* Linhas conectoras */}
                <line x1="46" y1="26" x2="24" y2="54" stroke="currentColor" strokeWidth="4"/>
                <line x1="54" y1="26" x2="76" y2="54" stroke="currentColor" strokeWidth="4"/>
                <line x1="28" y1="60" x2="72" y2="60" stroke="currentColor" strokeWidth="4"/>
              </svg>
              <div className="ml-3">
                <div className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  nodo
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  app.br
                </div>
              </div>
            </div>
            
            <button
              onClick={() => setShowMobileMenu(true)}
              className="md:hidden p-2 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              <Menu className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            </button>
            
            {/* Título e Subtítulo */}
            <div className="ml-4">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Mapeador de Comunidade
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Sistema completo de mapeamento político e social
              </p>
            </div>
          </div> 

          <div className="flex items-center gap-4">
            {mounted && (
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                title={theme === 'light' ? 'Ativar modo escuro' : 'Ativar modo claro'}
              >
                {theme === 'light' ? (
                  <Moon className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                ) : (
                  <Sun className="w-5 h-5 text-yellow-500" />
                )}
              </button>
            )}
            <div className="text-right hidden md:block">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                Olá, {session.user?.name || session.user?.email}
              </p>
              <button
                onClick={() => signOut()}
                className="text-sm text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 flex items-center gap-1"
              >
                <LogOut className="w-4 h-4" />
                Sair
              </button>
            </div>
          </div>
        </div>

        {/* Estatísticas com animações */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 animate-fadeIn hover-lift">
            <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-400 mb-4 flex items-center">
              <Users className="w-5 h-5 mr-2" />
              Total de Pessoas
            </h3>
            <p className="text-3xl font-bold text-blue-600 dark:text-blue-500">{people.length}</p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 animate-fadeIn hover-lift" style={{ animationDelay: '0.1s' }}>
            <h3 className="text-lg font-semibold text-green-900 dark:text-green-400 mb-4">
              Círculos de Proximidade
            </h3>
            <div className="space-y-2">
              {proximityStats.slice(0, 3).map(stat => (
                <div key={stat.value} className="flex justify-between text-sm">
                  <span className="text-gray-700 dark:text-gray-300">{stat.label}</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{stat.count}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 animate-fadeIn hover-lift" style={{ animationDelay: '0.2s' }}>
            <h3 className="text-lg font-semibold text-purple-900 dark:text-purple-400 mb-4">
              Contextos
            </h3>
            <div className="space-y-2">
              {contextStats.slice(0, 3).map(stat => (
                <div key={stat.value} className="flex justify-between text-sm">
                  <span className="text-gray-700 dark:text-gray-300">
                    {stat.icon} {stat.label}
                  </span>
                  <span className="font-semibold text-gray-900 dark:text-white">{stat.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Controles com novos filtros */}
        <div className="flex flex-wrap gap-4 mb-6">
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-700 transition-colors ripple"
          >
            <Plus className="w-4 h-4 mr-2" />
            Adicionar Pessoa
          </button>

          <button
            onClick={() => setShowWizard(true)}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-purple-700 transition-colors ripple"
          >
            <MapPin className="w-4 h-4 mr-2" />
            Mapeamento Guiado
          </button>

          <button
            onClick={() => setShowImportWizard(true)}
            className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-green-700 transition-colors ripple"
          >
            <Upload className="w-4 h-4 mr-2" />
            Importar CSV
          </button>

          <button
            onClick={() => setShowExportModal(true)}
            className="bg-orange-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-orange-700 transition-colors ripple"
          >
            <Download className="w-4 h-4 mr-2" />
            Exportar Dados
          </button>

          <button
            onClick={() => setShowTagManager(true)}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-indigo-700 transition-colors ripple"
          >
            <TagIcon className="w-4 h-4 mr-2" />
            Gerenciar Tags
          </button>

          {/* Linha de filtros de busca */}
          <div className="flex flex-wrap items-center gap-2 w-full">
            <div className="flex items-center space-x-2">
              <Search className="w-4 h-4 text-gray-400 dark:text-gray-500" />
              <input
                type="text"
                placeholder="Buscar por nome, profissão ou partido..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg px-3 py-2 w-64"
              />
            </div>

            <select
              value={filterContext}
              onChange={(e) => setFilterContext(e.target.value)}
              className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg px-3 py-2"
            >
              <option value="all">Todos os Contextos</option>
              {contexts.map(context => (
                <option key={context.value} value={context.value}>
                  {context.icon} {context.label}
                </option>
              ))}
            </select>

            <select
              value={filterProximity}
              onChange={(e) => setFilterProximity(e.target.value)}
              className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg px-3 py-2"
            >
              <option value="all">Todos os Círculos</option>
              {proximityLevels.map(level => (
                <option key={level.value} value={level.value}>
                  {level.label}
                </option>
              ))}
            </select>

            {/* Novo filtro de Importância */}
            <select
              value={filterImportance}
              onChange={(e) => setFilterImportance(e.target.value)}
              className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg px-3 py-2"
            >
              <option value="all">Todas as Importâncias</option>
              <option value="5">⭐⭐⭐⭐⭐ Crítica</option>
              <option value="4">⭐⭐⭐⭐ Muito Alta</option>
              <option value="3">⭐⭐⭐ Alta</option>
              <option value="2">⭐⭐ Média</option>
              <option value="1">⭐ Baixa</option>
            </select>

            {/* Novo filtro de Partido */}
            <select
              value={filterParty}
              onChange={(e) => setFilterParty(e.target.value)}
              className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg px-3 py-2"
            >
              <option value="all">Todos os Partidos</option>
              <option value="sem_partido">Sem partido</option>
              {partidosPoliticos.map(partido => (
                <option key={partido.sigla} value={partido.sigla}>
                  {partido.sigla} - {partido.nome}
                </option>
              ))}
            </select>

            {/* 🆕 FILTRO DE BAIRRO ATUALIZADO */}
            <select
              value={filterNeighborhood}
              onChange={(e) => setFilterNeighborhood(e.target.value)}
              className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg px-3 py-2"
            >
              <option value="all">Todos os Bairros</option>
              <option value="sem_bairro">Sem bairro informado</option>
              {bairrosGramado.map(bairro => (
                <option key={bairro} value={bairro}>
                  {bairro}
                </option>
              ))}
            </select>

            {/* Contador de resultados */}
            <div className="ml-auto text-sm text-gray-600 dark:text-gray-400">
              {filteredPeople.length} pessoa{filteredPeople.length !== 1 ? 's' : ''} encontrada{filteredPeople.length !== 1 ? 's' : ''}
            </div>
          </div>

          <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1 rounded transition-colors ${
                viewMode === 'table' 
                  ? 'bg-white dark:bg-gray-600 shadow' 
                  : 'hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              Tabela
            </button>
            <button
              onClick={() => setViewMode('circles')}
              className={`px-3 py-1 rounded transition-colors ${
                viewMode === 'circles' 
                  ? 'bg-white dark:bg-gray-600 shadow' 
                  : 'hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              Círculos
            </button>
            <button
              onClick={() => setViewMode('graph')}
              className={`px-3 py-1 rounded transition-colors ${
                viewMode === 'graph' 
                  ? 'bg-white dark:bg-gray-600 shadow' 
                  : 'hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              Grafo
            </button>
            <button
              onClick={() => setViewMode('dashboard')}
              className={`px-3 py-1 rounded transition-colors ${
                viewMode === 'dashboard' 
                  ? 'bg-white dark:bg-gray-600 shadow' 
                  : 'hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setViewMode('political')}
              className={`px-3 py-1 rounded transition-colors ${
                viewMode === 'political' 
                  ? 'bg-white dark:bg-gray-600 shadow' 
                  : 'hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              Político
            </button>
            <button
              onClick={() => setViewMode('geographic')}
              className={`px-3 py-1 rounded transition-colors ${
                viewMode === 'geographic' 
                  ? 'bg-white dark:bg-gray-600 shadow' 
                  : 'hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              <Map className="w-4 h-4 inline mr-1" />
              Geográfico
            </button>
            <button
              onClick={() => setViewMode('demographic')}
              className={`px-3 py-1 rounded transition-colors ${
                viewMode === 'demographic' 
                  ? 'bg-white dark:bg-gray-600 shadow' 
                  : 'hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              <BarChart3 className="w-4 h-4 inline mr-1" />
              Demográfico
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`px-3 py-1 rounded transition-colors ${
                viewMode === 'calendar' 
                  ? 'bg-white dark:bg-gray-600 shadow' 
                  : 'hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              <CalendarIcon className="w-4 h-4 inline mr-1" />
              Calendário
            </button>
            <button
              onClick={() => setViewMode('goals')}
              className={`px-3 py-1 rounded transition-colors ${
                viewMode === 'goals' 
                  ? 'bg-white dark:bg-gray-600 shadow' 
                  : 'hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              Metas
            </button>
          </div>
        </div>

        {/* Ações em massa */}
        {selectedPeople.size > 0 && (
          <BulkActions
            selectedCount={selectedPeople.size}
            onDelete={handleBulkDelete}
            onContextChange={handleBulkContextChange}
            onProximityChange={handleBulkProximityChange}
            onExport={handleBulkExport}
            contexts={contexts}
            proximityLevels={proximityLevels}
          />
        )}

        {/* 🆕 FORMULÁRIO DE ADIÇÃO/EDIÇÃO ATUALIZADO COM SELECT DE BAIRRO */}
        {(showAddForm || editingPerson) && (
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg mb-6 shadow-lg animate-slideIn">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
              {editingPerson ? 'Editar Pessoa' : 'Adicionar Nova Pessoa'}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <input
                type="text"
                placeholder="Nome completo"
                value={editingPerson ? editingPerson.name : newPerson.name || ''}
                onChange={(e) => editingPerson 
                  ? setEditingPerson({...editingPerson, name: e.target.value})
                  : setNewPerson({...newPerson, name: e.target.value})}
                className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg px-3 py-2"
              />
              
              <input
                type="text"
                placeholder="Apelido"
                value={editingPerson ? editingPerson.nickname || '' : newPerson.nickname || ''}
                onChange={(e) => editingPerson 
                  ? setEditingPerson({...editingPerson, nickname: e.target.value})
                  : setNewPerson({...newPerson, nickname: e.target.value})}
                className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg px-3 py-2"
              />
              
              <select
                value={editingPerson ? editingPerson.context : newPerson.context || ''}
                onChange={(e) => editingPerson
                  ? setEditingPerson({...editingPerson, context: e.target.value})
                  : setNewPerson({...newPerson, context: e.target.value})}
                className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg px-3 py-2"
              >
                <option value="">Selecione o Contexto</option>
                {contexts.map(context => (
                  <option key={context.value} value={context.value}>
                    {context.icon} {context.label}
                  </option>
                ))}
              </select>

              <select
                value={editingPerson ? editingPerson.proximity : newPerson.proximity || ''}
                onChange={(e) => editingPerson
                  ? setEditingPerson({...editingPerson, proximity: e.target.value})
                  : setNewPerson({...newPerson, proximity: e.target.value})}
                className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg px-3 py-2"
              >
                <option value="">Selecione o Círculo</option>
                {proximityLevels.map(level => (
                  <option key={level.value} value={level.value}>
                    {level.label}
                  </option>
                ))}
              </select>

              {/* Campo de Profissão/Ocupação com opção customizada */}
              {showCustomOccupation ? (
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Digite a profissão"
                    value={editingPerson ? editingPerson.occupation || '' : newPerson.occupation || ''}
                    onChange={(e) => editingPerson
                      ? setEditingPerson({...editingPerson, occupation: e.target.value})
                      : setNewPerson({...newPerson, occupation: e.target.value})}
                    className="flex-1 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg px-3 py-2"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowCustomOccupation(false)}
                    className="px-3 py-2 text-sm bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500"
                  >
                    Voltar
                  </button>
                </div>
              ) : (
                <select
                  value={editingPerson ? editingPerson.occupation || '' : newPerson.occupation || ''}
                  onChange={(e) => {
                    if (e.target.value === 'outro') {
                      setShowCustomOccupation(true);
                      if (editingPerson) {
                        setEditingPerson({...editingPerson, occupation: ''});
                      } else {
                        setNewPerson({...newPerson, occupation: ''});
                      }
                    } else {
                      if (editingPerson) {
                        setEditingPerson({...editingPerson, occupation: e.target.value});
                      } else {
                        setNewPerson({...newPerson, occupation: e.target.value});
                      }
                    }
                  }}
                  className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg px-3 py-2"
                >
                  <option value="">Selecione uma profissão</option>
                  <option value="outro" className="font-semibold text-blue-600 dark:text-blue-400">
                    ➕ Digitar outra profissão...
                  </option>
                  {Object.entries(profissoesPorCategoria).map(([categoria, profissoes]) => {
                    const categoriaLabel = classesProfissionais.find(c => c.valor === categoria)?.label || categoria;
                    return (
                      <optgroup key={categoria} label={categoriaLabel}>
                        {profissoes.map((prof) => (
                          <option key={prof} value={prof}>
                            {prof}
                          </option>
                        ))}
                      </optgroup>
                    );
                  })}
                </select>
              )}
              
              <select
                value={editingPerson ? editingPerson.professional_class || '' : newPerson.professional_class || ''}
                onChange={(e) => editingPerson
                  ? setEditingPerson({...editingPerson, professional_class: e.target.value})
                  : setNewPerson({...newPerson, professional_class: e.target.value})}
                className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg px-3 py-2"
              >
                <option value="">Selecione uma classe profissional</option>
                {classesProfissionais.map(classe => (
                  <option key={classe.valor} value={classe.valor}>
                    {classe.label}
                  </option>
                ))}
              </select>

              <input
                type="text"
                placeholder="Empresa"
                value={editingPerson ? editingPerson.company || '' : newPerson.company || ''}
                onChange={(e) => editingPerson
                  ? setEditingPerson({...editingPerson, company: e.target.value})
                  : setNewPerson({...newPerson, company: e.target.value})}
                className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg px-3 py-2"
              />

              <input
                type="text"
                placeholder="Cargo/Posição"
                value={editingPerson ? editingPerson.position || '' : newPerson.position || ''}
                onChange={(e) => editingPerson
                  ? setEditingPerson({...editingPerson, position: e.target.value})
                  : setNewPerson({...newPerson, position: e.target.value})}
                className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg px-3 py-2"
              />

              <select
                value={editingPerson ? editingPerson.political_party || '' : newPerson.political_party || ''}
                onChange={(e) => editingPerson
                  ? setEditingPerson({...editingPerson, political_party: e.target.value})
                  : setNewPerson({...newPerson, political_party: e.target.value})}
                className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg px-3 py-2"
              >
                <option value="">Selecione um partido</option>
                {partidosPoliticos.map(partido => (
                  <option key={partido.numero} value={partido.sigla}>
                    {partido.numero} - {partido.sigla} - {partido.nome}
                  </option>
                ))}
              </select>

              <input
                type="text"
                placeholder="Telefone/WhatsApp"
                value={editingPerson ? editingPerson.mobile || '' : newPerson.mobile || ''}
                onChange={(e) => editingPerson
                  ? setEditingPerson({...editingPerson, mobile: e.target.value})
                  : setNewPerson({...newPerson, mobile: e.target.value})}
                className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg px-3 py-2"
              />

              <input
                type="email"
                placeholder="Email"
                value={editingPerson ? editingPerson.email || '' : newPerson.email || ''}
                onChange={(e) => editingPerson
                  ? setEditingPerson({...editingPerson, email: e.target.value})
                  : setNewPerson({...newPerson, email: e.target.value})}
                className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg px-3 py-2"
              />

              <input
                type="text"
                placeholder="Cidade"
                value={editingPerson ? editingPerson.city || '' : newPerson.city || ''}
                onChange={(e) => editingPerson
                  ? setEditingPerson({...editingPerson, city: e.target.value})
                  : setNewPerson({...newPerson, city: e.target.value})}
                className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg px-3 py-2"
              />

              {/* 🆕 CAMPO DE BAIRRO COM SELECT CUSTOMIZADO */}
              {showCustomNeighborhood ? (
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Digite o bairro/localidade"
                    value={editingPerson ? editingPerson.neighborhood || '' : newPerson.neighborhood || ''}
                    onChange={(e) => editingPerson
                      ? setEditingPerson({...editingPerson, neighborhood: e.target.value})
                      : setNewPerson({...newPerson, neighborhood: e.target.value})}
                    className="flex-1 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg px-3 py-2"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowCustomNeighborhood(false)}
                    className="px-3 py-2 text-sm bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500"
                  >
                    Voltar
                  </button>
                </div>
              ) : (
                <select
                  value={editingPerson ? editingPerson.neighborhood || '' : newPerson.neighborhood || ''}
                  onChange={(e) => {
                    if (e.target.value === 'outro') {
                      setShowCustomNeighborhood(true);
                      if (editingPerson) {
                        setEditingPerson({...editingPerson, neighborhood: ''});
                      } else {
                        setNewPerson({...newPerson, neighborhood: ''});
                      }
                    } else {
                      if (editingPerson) {
                        setEditingPerson({...editingPerson, neighborhood: e.target.value});
                      } else {
                        setNewPerson({...newPerson, neighborhood: e.target.value});
                      }
                    }
                  }}
                  className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg px-3 py-2"
                >
                  <option value="">Selecione um bairro</option>
                  <optgroup label="Bairros Centrais">
                    <option value="Centro">Centro</option>
                    <option value="Avenida Central">Avenida Central</option>
                    <option value="Planalto">Planalto</option>
                    <option value="Carniel">Carniel</option>
                    <option value="Floresta">Floresta</option>
                    <option value="Jardim">Jardim</option>
                    <option value="Dutra">Dutra</option>
                    <option value="Piratini">Piratini</option>
                  </optgroup>
                  <optgroup label="Bairros Residenciais">
                    <option value="Bavária">Bavária</option>
                    <option value="Bela Vista">Bela Vista</option>
                    <option value="Candiago">Candiago</option>
                    <option value="Carazal">Carazal</option>
                    <option value="Casagrande">Casagrande</option>
                    <option value="Mato Queimado">Mato Queimado</option>
                    <option value="Minuano">Minuano</option>
                    <option value="Monte Verde">Monte Verde</option>
                    <option value="Tirol">Tirol</option>
                    <option value="Três Pinheiros">Três Pinheiros</option>
                    <option value="Vale dos Pinheiros">Vale dos Pinheiros</option>
                    <option value="Varzinha">Varzinha</option>
                    <option value="Várzea Grande">Várzea Grande</option>
                    <option value="Vila do Sol">Vila do Sol</option>
                    <option value="Vila Suíça">Vila Suíça</option>
                    <option value="Pórtico 1">Pórtico 1</option>
                    <option value="Pórtico 2">Pórtico 2</option>
                    <option value="Altos da Viação Férrea">Altos da Viação Férrea</option>
                    <option value="Aspen">Aspen</option>
                  </optgroup>
                  <optgroup label="Áreas Rurais">
                    <option value="Linha 15">Linha 15</option>
                    <option value="Linha 28">Linha 28</option>
                    <option value="Linha Araripe">Linha Araripe</option>
                    <option value="Linha Ávila">Linha Ávila</option>
                    <option value="Linha Bonita">Linha Bonita</option>
                    <option value="Linha Carahá">Linha Carahá</option>
                    <option value="Linha Furna">Linha Furna</option>
                    <option value="Linha Marcondes">Linha Marcondes</option>
                    <option value="Linha Nova">Linha Nova</option>
                    <option value="Linha Pedras Brancas">Linha Pedras Brancas</option>
                    <option value="Linha Quilombo">Linha Quilombo</option>
                    <option value="Linha Tapera">Linha Tapera</option>
                    <option value="Morro do Arame">Morro do Arame</option>
                    <option value="Serra Grande">Serra Grande</option>
                    <option value="Moleque">Moleque</option>
                    <option value="Gambelo">Gambelo</option>
                    <option value="Moreira">Moreira</option>
                  </optgroup>
                  <optgroup label="Condomínios Fechados">
                    <option value="Condomínio Residencial Aspen Mountain">Condomínio Residencial Aspen Mountain</option>
                    <option value="Condomínio Vale do Bosque">Condomínio Vale do Bosque</option>
                    <option value="Condomínio Knorrville">Condomínio Knorrville</option>
                    <option value="Condomínio O Bosque">Condomínio O Bosque</option>
                    <option value="Condomínio Portal de Gramado">Condomínio Portal de Gramado</option>
                    <option value="Condomínio Residencial Villa Bella">Condomínio Residencial Villa Bella</option>
                    <option value="Condomínio Saint Morit">Condomínio Saint Morit</option>
                    <option value="Condomínio Villaggio">Condomínio Villaggio</option>
                    <option value="Condomínio Buena Vista">Condomínio Buena Vista</option>
                    <option value="Condomínio Montanha Del Fiori">Condomínio Montanha Del Fiori</option>
                  </optgroup>
                  <option value="outro" className="font-semibold text-blue-600 dark:text-blue-400">
                    ➕ Outro bairro/localidade...
                  </option>
                </select>
              )}

              <input
                type="date"
                placeholder="Último contato"
                value={editingPerson ? editingPerson.last_contact || '' : newPerson.last_contact || ''}
                onChange={(e) => editingPerson
                  ? setEditingPerson({...editingPerson, last_contact: e.target.value})
                  : setNewPerson({...newPerson, last_contact: e.target.value})}
                className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg px-3 py-2"
              />

              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Importância:</label>
                <select
                  value={editingPerson ? editingPerson.importance || 3 : newPerson.importance || 3}
                  onChange={(e) => editingPerson
                    ? setEditingPerson({...editingPerson, importance: parseInt(e.target.value)})
                    : setNewPerson({...newPerson, importance: parseInt(e.target.value)})}
                  className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg px-2 py-1"
                >
                  <option value={1}>⭐ Baixa</option>
                  <option value={2}>⭐⭐ Média</option>
                  <option value={3}>⭐⭐⭐ Alta</option>
                  <option value={4}>⭐⭐⭐⭐ Muito Alta</option>
                  <option value={5}>⭐⭐⭐⭐⭐ Crítica</option>
                </select>
              </div>

              <select
                value={editingPerson ? editingPerson.contact_frequency || '' : newPerson.contact_frequency || ''}
                onChange={(e) => editingPerson
                  ? setEditingPerson({...editingPerson, contact_frequency: e.target.value})
                  : setNewPerson({...newPerson, contact_frequency: e.target.value})}
                className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg px-3 py-2"
              >
                <option value="">Frequência de Contato</option>
                <option value="daily">Diário</option>
                <option value="weekly">Semanal</option>
                <option value="monthly">Mensal</option>
                <option value="quarterly">Trimestral</option>
                <option value="yearly">Anual</option>
              </select>

              <textarea
                placeholder="Observações"
                value={editingPerson ? editingPerson.notes || '' : newPerson.notes || ''}
                onChange={(e) => editingPerson
                  ? setEditingPerson({...editingPerson, notes: e.target.value})
                  : setNewPerson({...newPerson, notes: e.target.value})}
                className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg px-3 py-2 col-span-full"
                rows={2}
              />
            </div>
            
            <div className="flex space-x-2 mt-4">
              <button
                onClick={editingPerson ? updatePerson : addPerson}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                {editingPerson ? 'Atualizar' : 'Adicionar'}
              </button>
              <button
                onClick={() => {
                  setShowAddForm(false);
                  setEditingPerson(null);
                  setShowCustomOccupation(false);
                  setShowCustomNeighborhood(false); // 🆕 RESETAR BAIRRO CUSTOMIZADO
                }}
                className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}

{/* Wizard de Mapeamento Guiado */}
        {showWizard && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6 animate-slideIn">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Mapeamento Guiado - Passo {wizardStep}
                </h2>
                <button
                  onClick={() => {
                    setShowWizard(false);
                    setWizardStep(1);
                    setBrainstormList('');
                  }}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  ✕
                </button>
              </div>

              {/* Step 1: Brainstorming */}
              {wizardStep === 1 && (
                <div>
                  <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                    Fase 1: Brainstorming Livre (15 minutos)
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Liste todas as pessoas que vêm à sua mente, uma por linha. Não se preocupe com detalhes agora!
                  </p>
                  <textarea
                    value={brainstormList}
                    onChange={(e) => setBrainstormList(e.target.value)}
                    placeholder="João Silva&#10;Maria Santos&#10;Pedro Oliveira&#10;..."
                    className="w-full h-64 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg p-3 mb-4"
                  />
                  <div className="flex justify-between">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {brainstormList.split('\n').filter(n => n.trim()).length} pessoas listadas
                    </p>
                    <button
                      onClick={processBrainstormList}
                      className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                      disabled={!brainstormList.trim()}
                    >
                      Próximo →
                    </button>
                  </div>
                </div>
              )}

              {/* Step 2: Context Scanning */}
              {wizardStep === 2 && (
                <div>
                  <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                    Fase 2: Varredura por Contexto
                  </h3>
                  <div className="mb-4">
                    <div className="flex flex-wrap gap-2 mb-4">
                      {contexts.map(ctx => (
                        <button
                          key={ctx.value}
                          onClick={() => setCurrentContextScan(ctx.value)}
                          className={`px-4 py-2 rounded-lg transition-colors ${
                            currentContextScan === ctx.value
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                          }`}
                        >
                          {ctx.icon} {ctx.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg mb-4">
                    <h4 className="font-semibold mb-3 text-gray-900 dark:text-white">
                      Perguntas para o contexto {contexts.find(c => c.value === currentContextScan)?.label}:
                    </h4>
                    <ul className="space-y-2">
                      {contextQuestions[currentContextScan]?.map((question, idx) => (
                        <li key={idx} className="flex items-start">
                          <span className="text-blue-600 dark:text-blue-400 mr-2">•</span>
                          <span className="text-gray-700 dark:text-gray-300">{question}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex justify-between">
                    <button
                      onClick={() => setWizardStep(1)}
                      className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600"
                    >
                      ← Voltar
                    </button>
                    <button
                      onClick={() => setWizardStep(3)}
                      className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                    >
                      Classificar Pessoas →
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3: Classification */}
              {wizardStep === 3 && (
                <div>
                  <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                    Fase 3: Classificação Sistemática
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Agora vamos classificar as pessoas que você adicionou. Use a tabela principal para editar cada pessoa.
                  </p>
                  
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg mb-4">
                    <h4 className="font-semibold mb-2 text-gray-900 dark:text-white">Critérios de Proximidade:</h4>
                    <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                      <div><strong>Núcleo Central:</strong> Contato &gt; 3x/semana, confiaria segredos, pediria ajuda em emergência</div>
                      <div><strong>Primeiro Círculo:</strong> Contato semanal/quinzenal, próximo mas não íntimo</div>
                      <div><strong>Segundo Círculo:</strong> Contato mensal, conhece bem mas não é próximo</div>
                      <div><strong>Terceiro Círculo:</strong> Contato esporádico, reconhece e cumprimenta</div>
                      <div><strong>Periferia:</strong> Contato raro, conhece "de vista"</div>
                    </div>
                  </div>

                  <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg mb-4">
                    <h4 className="font-semibold mb-2 text-gray-900 dark:text-white">Pessoas sem classificação completa:</h4>
                    <div className="flex flex-wrap gap-2">
                      {people.filter(p => !p.context || !p.proximity).map(person => (
                        <span key={person.id} className="bg-yellow-200 dark:bg-yellow-700 px-3 py-1 rounded-full text-sm text-gray-900 dark:text-white">
                          {person.name}
                        </span>
                      ))}
                    </div>
                    {people.filter(p => !p.context || !p.proximity).length === 0 && (
                      <p className="text-green-600 dark:text-green-400">✓ Todas as pessoas estão classificadas!</p>
                    )}
                  </div>

                  <div className="flex justify-between">
                    <button
                      onClick={() => setWizardStep(2)}
                      className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600"
                    >
                      ← Voltar
                    </button>
                    <button
                      onClick={() => setWizardStep(4)}
                      className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                    >
                      Análise Final →
                    </button>
                  </div>
                </div>
              )}

              {/* Step 4: Analysis */}
              {wizardStep === 4 && (
                <div>
                  <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                    Fase 4: Análise e Otimização
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                      <h4 className="font-semibold mb-2 text-gray-900 dark:text-white">Saúde da Rede</h4>
                      <div className="space-y-1 text-gray-700 dark:text-gray-300">
                        <p>Densidade: {getNetworkHealth().density} pessoas/contexto</p>
                        <p>Centralidade: {getNetworkHealth().centrality}% em círculos próximos</p>
                        <p>Total de pessoas: {people.length}</p>
                      </div>
                    </div>
                    
                    <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                      <h4 className="font-semibold mb-2 text-gray-900 dark:text-white">Distribuição por Contexto</h4>
                      <div className="space-y-1 text-gray-700 dark:text-gray-300">
                        {getNetworkHealth().contextDistribution.map(cd => (
                          <p key={cd.context}>{cd.context}: {cd.percentage}%</p>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg mb-4">
                    <h4 className="font-semibold mb-2 text-gray-900 dark:text-white">Recomendações:</h4>
                    <ul className="space-y-1 text-sm text-gray-700 dark:text-gray-300">
                      {Number(getNetworkHealth().density) < 5 && (
                        <li>• Sua rede está pouco densa. Considere expandir seus contatos.</li>
                      )}
                      {Number(getNetworkHealth().centrality) < 30 && (
                        <li>• Poucos contatos próximos. Invista em fortalecer relacionamentos.</li>
                      )}
                      {contextStats.filter(cs => cs.count === 0).map(cs => (
                        <li key={cs.value}>• Contexto {cs.label} está vazio. Explore essa área!</li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex justify-between">
                    <button
                      onClick={() => setWizardStep(3)}
                      className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600"
                    >
                      ← Voltar
                    </button>
                    <button
                      onClick={() => {
                        setShowWizard(false);
                        setWizardStep(1);
                      }}
                      className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
                    >
                      Concluir ✓
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Visualização */}
        {viewMode === 'graph' && (
          <NetworkGraph 
            people={filteredPeople} 
            onNodeClick={(person) => {
              openPersonProfile(person);
            }}
          />
        )}

        {viewMode === 'dashboard' && (
          <AnalyticsDashboard people={filteredPeople} />
        )}

        {viewMode === 'political' && (
          <PoliticalDashboard people={filteredPeople} />
        )}

        {viewMode === 'geographic' && (
          <GeographicMap people={filteredPeople} />
        )}

        {viewMode === 'demographic' && (
          <DemographicAnalysis people={filteredPeople} city="gramado" />
        )}

        {viewMode === 'calendar' && (
          <PoliticalCalendar people={filteredPeople} onContactPerson={handleContactPerson} onEditPerson={setEditingPerson} />
        )}

        {viewMode === 'goals' && (
          <GoalsDashboard people={filteredPeople} affiliatesData={affiliatesData} />
        )}

        {viewMode === 'table' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 w-12">
                      <input
                        type="checkbox"
                        onChange={toggleAllSelection}
                        checked={selectedPeople.size === filteredPeople.length && filteredPeople.length > 0}
                        className="rounded border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Foto</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Nome</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Contexto</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Círculo</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Profissão</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Localização</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Partido</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Contato</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Importância</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Tags</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Relevância</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Ações</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredPeople.map(person => {
                    const contextInfo = getContextInfo(person.context);
                    const proximityInfo = getProximityInfo(person.proximity);
                    return (
                      <tr key={person.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                        <td className="px-6 py-4">
                          <input
                            type="checkbox"
                            checked={selectedPeople.has(person.id)}
                            onChange={() => togglePersonSelection(person.id)}
                            className="rounded border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => {
                              setSelectedPersonForPhoto(person.id);
                              setShowPhotoModal(true);
                            }}
                            className="relative group"
                          >
                            {personPhotos[person.id] ? (
                              <img
                                src={personPhotos[person.id]}
                                alt={person.name}
                                className="w-10 h-10 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
                                <User className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                              </div>
                            )}
                            <div className="absolute inset-0 rounded-full bg-black bg-opacity-0 group-hover:bg-opacity-30 flex items-center justify-center transition-all">
                              <Camera className="w-4 h-4 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                          </button>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-medium text-gray-900 dark:text-white">{person.name}</div>
                          {person.nickname && <div className="text-sm text-gray-500 dark:text-gray-400">"{person.nickname}"</div>}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${contextInfo.color}`}>
                            {contextInfo.icon} {contextInfo.label}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${proximityInfo.color}`}>
                            {proximityInfo.label}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">
                          {person.occupation || '-'}
                          {person.professional_class && <div className="text-xs text-gray-500 dark:text-gray-400">{classesProfissionais.find(c => c.valor === person.professional_class)?.label}</div>}
                        </td>                        
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">
                          {person.neighborhood ? `${person.neighborhood}, ` : ''}{person.city || 'Gramado'}
                         </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">
                          {person.political_party || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {person.mobile || person.email || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex">
                            {[...Array(person.importance || 3)].map((_, i) => (
                              <span key={i} className="text-yellow-400">⭐</span>
                            ))}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <PersonTags personId={person.id} personName={person.name} inline={true} />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {calculateRelevance(person).toFixed(1)}
                            </div>
                            <div className="ml-2 w-16 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                              <div 
                                className="bg-blue-600 dark:bg-blue-400 h-2 rounded-full" 
                                style={{width: `${(calculateRelevance(person) / 5) * 100}%`}}
                              />
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => openPersonProfile(person)}
                            className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300 mr-2"
                            title="Ver Perfil"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setEditingPerson(person)}
                            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 mr-2"
                            title="Editar"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedPersonForRelationship(person);
                              setShowRelationshipManager(true);
                            }}
                            className="text-purple-600 hover:text-purple-900 dark:text-purple-400 dark:hover:text-purple-300 mr-2"
                            title="Gerenciar Relacionamentos"
                          >
                            <Link className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => deletePerson(person.id)}
                            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                            title="Deletar"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {viewMode === 'circles' && (
          <div className="space-y-8">
            {proximityLevels.map(level => {
              const levelPeople = filteredPeople.filter(p => p.proximity === level.value);
              if (levelPeople.length === 0) return null;
              
              return (
                <div key={level.value} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                  <h3 className={`text-lg font-semibold mb-4 inline-flex items-center px-3 py-1 rounded-full ${level.color}`}>
                    {level.label} ({levelPeople.length})
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {levelPeople.map(person => {
                      const contextInfo = getContextInfo(person.context);
                      return (
                        <div 
                          key={person.id} 
                          className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                          onClick={() => openPersonProfile(person)}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-medium text-gray-900 dark:text-white">
                              {person.name}
                              {person.nickname && <span className="text-sm text-gray-500 dark:text-gray-400"> "{person.nickname}"</span>}
                            </h4>
                            <div className="flex">
                              {[...Array(person.importance || 3)].map((_, i) => (
                                <span key={i} className="text-yellow-400 text-xs">⭐</span>
                              ))}
                            </div>
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">{person.occupation || 'Sem profissão'}</div>
                          {person.political_party && (
                            <div className="text-sm text-blue-600 dark:text-blue-400 mb-1">🗳️ {person.political_party}</div>
                          )}
                          <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${contextInfo.color} mb-2`}>
                            {contextInfo.icon} {contextInfo.label}
                          </div>
                          {person.notes && (
                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">{person.notes}</div>
                          )}
                          <div className="flex space-x-2 mt-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingPerson(person);
                              }}
                              className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                            >
                              <Edit3 className="w-3 h-3" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedPersonForRelationship(person);
                                setShowRelationshipManager(true);
                              }}
                              className="text-purple-600 hover:text-purple-900 dark:text-purple-400 dark:hover:text-purple-300"
                            >
                              <Link className="w-3 h-3" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                deletePerson(person.id);
                              }}
                              className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {filteredPeople.length === 0 && !peopleLoading && (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">Nenhuma pessoa encontrada. Comece adicionando alguém!</p>
          </div>
        )}

        {peopleError && (
          <div className="text-center py-4">
            <p className="text-red-500">Erro: {peopleError}</p>
          </div>
        )}

        {/* Modal de Importação */}
        {showImportWizard && (
          <ImportWizard
            onClose={() => setShowImportWizard(false)}
            onImport={handleBulkImport}
          />
        )}

        {/* Modal de Exportação */}
        <ExportModal
          isOpen={showExportModal}
          onClose={() => setShowExportModal(false)}
          people={people}
          filteredPeople={filteredPeople}
        />

        {/* Modal de Foto */}
        {showPhotoModal && selectedPersonForPhoto && (
          <PhotoUploadModal
            isOpen={showPhotoModal}
            onClose={() => {
              setShowPhotoModal(false);
              setSelectedPersonForPhoto(null);
            }}
            onPhotoSelect={(photoData: string) => {
              handlePhotoUpdate(selectedPersonForPhoto, photoData);
            }}
            currentPhoto={personPhotos[selectedPersonForPhoto] || ''}
          />
        )}

        {/* Modal de Relacionamentos */}
        {showRelationshipManager && selectedPersonForRelationship && (
          <RelationshipManager
            isOpen={showRelationshipManager}
            onClose={() => {
              setShowRelationshipManager(false);
              setSelectedPersonForRelationship(null);
            }}
            person={selectedPersonForRelationship}
            allPeople={people}
          />
        )}

        {/* Modal de Tags */}
        <TagManager
          isOpen={showTagManager}
          onClose={() => setShowTagManager(false)}
        />

        {/* 🆕 MODAL DE PERFIL ATUALIZADO COM BAIRROS */}
        <PersonProfileModal
          person={selectedPersonForProfile}
          isOpen={showProfileModal}
          onClose={() => {
            setShowProfileModal(false);
            setSelectedPersonForProfile(null);
          }}
          onEdit={(person) => {
            setEditingPerson(person);
            setShowProfileModal(false);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onOpenMediaVault={openMediaVault}
          personPhoto={selectedPersonForProfile ? personPhotos[selectedPersonForProfile.id] : undefined}
          contexts={contexts}
          proximityLevels={proximityLevels}
          classesProfissionais={classesProfissionais}
          partidosPoliticos={partidosPoliticos}
          bairrosGramado={bairrosGramado}
        />

        {/* Modal de Acervo de Mídia */}
        {showMediaVault && selectedPersonForMedia && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg max-w-7xl w-full max-h-[90vh] overflow-hidden">
              <PersonMediaVault
                personId={selectedPersonForMedia.id}
                personName={selectedPersonForMedia.name}
                onClose={() => {
                  setShowMediaVault(false);
                  setSelectedPersonForMedia(null);
                }}
              />
            </div>
          </div>
        )}

        {/* Menu Mobile */}
        <MobileMenu
          isOpen={showMobileMenu}
          onClose={() => setShowMobileMenu(false)}
          userEmail={session.user?.email || ''}
          userName={session.user?.name || ''}
          onSignOut={() => signOut()}
        />
      </div>

      {/* Estilos CSS para animações */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out forwards;
        }

        .animate-slideIn {
          animation: slideIn 0.3s ease-out forwards;
        }

        .hover-lift {
          transition: transform 0.2s ease-out;
        }

        .hover-lift:hover {
          transform: translateY(-2px);
        }

        .ripple {
          position: relative;
          overflow: hidden;
        }

        .ripple:after {
          content: "";
          display: block;
          position: absolute;
          width: 100%;
          height: 100%;
          top: 0;
          left: 0;
          pointer-events: none;
          background-image: radial-gradient(circle, #fff 10%, transparent 10.01%);
          background-repeat: no-repeat;
          background-position: 50%;
          transform: scale(10, 10);
          opacity: 0;
          transition: transform 0.5s, opacity 1s;
        }

        .ripple:active:after {
          transform: scale(0, 0);
          opacity: 0.3;
          transition: 0s;
        }

        .loader {
          border: 3px solid rgba(0, 0, 0, 0.1);
          border-radius: 50%;
          border-top: 3px solid #3B82F6;
          width: 40px;
          height: 40px;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .dark .loader {
          border-color: rgba(255, 255, 255, 0.1);
          border-top-color: #60A5FA;
        }
      `}</style>
    </div>
  );
}
