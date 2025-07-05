import { useState, useEffect } from 'react';

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
  photo_url?: string; // 🆕 Campo para URL da foto
}

export const usePeople = () => {
  const [people, setPeople] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Função para buscar pessoas
  const fetchPeople = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/people', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-cache'
      });
      
      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success && Array.isArray(data.people)) {
        setPeople(data.people);
      } else if (Array.isArray(data)) {
        setPeople(data);
      } else {
        throw new Error('Formato de dados inválido');
      }
    } catch (err) {
      console.error('Erro ao buscar pessoas:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      setPeople([]);
    } finally {
      setLoading(false);
    }
  };

  // Função para adicionar pessoa
  const addPerson = async (personData: Omit<Person, 'id'>) => {
    try {
      setError(null);
      
      // Validar dados obrigatórios
      if (!personData.name || !personData.context || !personData.proximity) {
        throw new Error('Nome, contexto e proximidade são obrigatórios');
      }

      // Preparar dados para envio
      const dataToSend = {
        ...personData,
        // Garantir valores padrão
        importance: personData.importance || 3,
        trust_level: personData.trust_level || 3,
        influence_level: personData.influence_level || 3,
        city: personData.city || 'Gramado',
        state: personData.state || 'RS',
        gender: personData.gender || 'N',
        is_candidate: Boolean(personData.is_candidate),
        is_elected: Boolean(personData.is_elected),
        // Converter strings vazias para null
        nickname: personData.nickname || null,
        birth_date: personData.birth_date || null,
        occupation: personData.occupation || null,
        company: personData.company || null,
        position: personData.position || null,
        professional_class: personData.professional_class || null,
        political_party: personData.political_party || null,
        political_position: personData.political_position || null,
        political_role: personData.political_role || null,
        phone: personData.phone || null,
        mobile: personData.mobile || null,
        email: personData.email || null,
        address: personData.address || null,
        neighborhood: personData.neighborhood || null,
        zip_code: personData.zip_code || null,
        whatsapp: personData.whatsapp || null,
        notes: personData.notes || null,
        last_contact: personData.last_contact || null,
        contact_frequency: personData.contact_frequency || null,
        photo_url: personData.photo_url || null
      };

      const response = await fetch('/api/people', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSend),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.error || `Erro HTTP: ${response.status}`);
      }

      // Recarregar lista
      await fetchPeople();
      return responseData;
      
    } catch (err) {
      console.error('Erro ao adicionar pessoa:', err);
      setError(err instanceof Error ? err.message : 'Erro ao adicionar pessoa');
      throw err;
    }
  };

  // Função para atualizar pessoa
  const updatePerson = async (personData: Person) => {
    try {
      setError(null);
      
      if (!personData.id) {
        throw new Error('ID da pessoa é obrigatório para atualização');
      }

      // Preparar dados para envio (mesmo processo do addPerson)
      const dataToSend = {
        ...personData,
        // Garantir valores padrão
        importance: personData.importance || 3,
        trust_level: personData.trust_level || 3,
        influence_level: personData.influence_level || 3,
        city: personData.city || 'Gramado',
        state: personData.state || 'RS',
        gender: personData.gender || 'N',
        is_candidate: Boolean(personData.is_candidate),
        is_elected: Boolean(personData.is_elected),
        // Converter strings vazias para null
        nickname: personData.nickname || null,
        birth_date: personData.birth_date || null,
        occupation: personData.occupation || null,
        company: personData.company || null,
        position: personData.position || null,
        professional_class: personData.professional_class || null,
        political_party: personData.political_party || null,
        political_position: personData.political_position || null,
        political_role: personData.political_role || null,
        phone: personData.phone || null,
        mobile: personData.mobile || null,
        email: personData.email || null,
        address: personData.address || null,
        neighborhood: personData.neighborhood || null,
        zip_code: personData.zip_code || null,
        whatsapp: personData.whatsapp || null,
        notes: personData.notes || null,
        last_contact: personData.last_contact || null,
        contact_frequency: personData.contact_frequency || null,
        photo_url: personData.photo_url || null
      };

      const response = await fetch('/api/people', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSend),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.error || `Erro HTTP: ${response.status}`);
      }

      // Recarregar lista
      await fetchPeople();
      return responseData;
      
    } catch (err) {
      console.error('Erro ao atualizar pessoa:', err);
      setError(err instanceof Error ? err.message : 'Erro ao atualizar pessoa');
      throw err;
    }
  };

  // Função para deletar pessoa
  const deletePerson = async (personId: string) => {
    try {
      setError(null);
      
      if (!personId) {
        throw new Error('ID da pessoa é obrigatório');
      }

      const response = await fetch(`/api/people?id=${personId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const responseData = await response.json();
        throw new Error(responseData.error || `Erro HTTP: ${response.status}`);
      }

      // Recarregar lista
      await fetchPeople();
      
    } catch (err) {
      console.error('Erro ao deletar pessoa:', err);
      setError(err instanceof Error ? err.message : 'Erro ao deletar pessoa');
      throw err;
    }
  };

  // Função para recarregar dados
  const refreshPeople = async () => {
    await fetchPeople();
  };

  // Carregar dados na inicialização
  useEffect(() => {
    fetchPeople();
  }, []);

  return {
    people,
    loading,
    error,
    addPerson,
    updatePerson,
    deletePerson,
    refreshPeople,
  };
};
