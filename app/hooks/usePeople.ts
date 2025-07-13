import { useState, useEffect, useCallback } from 'react'

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
  photo_url?: string;
}

export function usePeople() {
  const [people, setPeople] = useState<Person[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Função para buscar pessoas da API
  const fetchPeople = useCallback(async () => {
    console.log('🔍 usePeople: Buscando pessoas...')
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/people', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`)
      }

      const data = await response.json()
      console.log('✅ usePeople: Dados recebidos:', data)

      if (data.success && Array.isArray(data.data)) {
        // Converter id para string (garantir compatibilidade)
        const peopleWithStringIds = data.data.map((person: any) => ({
          ...person,
          id: person.id.toString()
        }))
        
        setPeople(peopleWithStringIds)
        console.log(`✅ usePeople: ${peopleWithStringIds.length} pessoas carregadas`)
      } else {
        throw new Error('Formato de resposta inválido')
      }
    } catch (err: any) {
      console.error('❌ usePeople: Erro ao buscar pessoas:', err)
      setError(err.message || 'Erro desconhecido')
      setPeople([])
    } finally {
      setLoading(false)
    }
  }, [])

  // Função para adicionar pessoa
  const addPerson = useCallback(async (personData: Partial<Person>) => {
    console.log('➕ usePeople: Adicionando pessoa:', personData.name)
    setLoading(true)

    try {
      const response = await fetch('/api/people', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...personData,
          user_id: 8 // ID do usuário admin (ajustar conforme necessário)
        }),
      })

      if (!response.ok) {
        throw new Error(`Erro ao adicionar pessoa: ${response.status}`)
      }

      const data = await response.json()
      console.log('✅ usePeople: Pessoa adicionada:', data)

      // Recarregar lista após adicionar
      await fetchPeople()
      return data.data
    } catch (err: any) {
      console.error('❌ usePeople: Erro ao adicionar pessoa:', err)
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [fetchPeople])

  // Função para atualizar pessoa
  const updatePerson = useCallback(async (id: string, personData: Partial<Person>) => {
    console.log('✏️ usePeople: Atualizando pessoa ID:', id)
    setLoading(true)

    try {
      const response = await fetch(`/api/people/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(personData),
      })

      if (!response.ok) {
        throw new Error(`Erro ao atualizar pessoa: ${response.status}`)
      }

      const data = await response.json()
      console.log('✅ usePeople: Pessoa atualizada:', data)

      // Recarregar lista após atualizar
      await fetchPeople()
      return data.data
    } catch (err: any) {
      console.error('❌ usePeople: Erro ao atualizar pessoa:', err)
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [fetchPeople])

  // Função para deletar pessoa
  const deletePerson = useCallback(async (id: string) => {
    console.log('🗑️ usePeople: Deletando pessoa ID:', id)
    setLoading(true)

    try {
      const response = await fetch(`/api/people/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error(`Erro ao deletar pessoa: ${response.status}`)
      }

      console.log('✅ usePeople: Pessoa deletada')

      // Recarregar lista após deletar
      await fetchPeople()
    } catch (err: any) {
      console.error('❌ usePeople: Erro ao deletar pessoa:', err)
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [fetchPeople])

  // Função para recarregar dados
  const refreshPeople = useCallback(() => {
    return fetchPeople()
  }, [fetchPeople])

  // Carregar dados na inicialização
  useEffect(() => {
    fetchPeople()
  }, [fetchPeople])

  return {
    people,
    loading,
    error,
    addPerson,
    updatePerson,
    deletePerson,
    refreshPeople,
  }
}
