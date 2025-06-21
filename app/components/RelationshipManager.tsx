'use client';

import React, { useState } from 'react';
import { UserPlus, Link, Trash2, Edit3, X, Users } from 'lucide-react';
import { useRelationships } from '../hooks/useRelationships';

interface Person {
  id: string;
  name: string;
  context: string;
  proximity: string;
}

interface RelationshipManagerProps {
  person: Person;
  allPeople: Person[];
  onClose: () => void;
}

const relationshipTypes = [
  { value: 'amigo', label: 'Amigo', emoji: '👥' },
  { value: 'familiar', label: 'Familiar', emoji: '👨‍👩‍👧‍👦' },
  { value: 'colega', label: 'Colega de Trabalho', emoji: '💼' },
  { value: 'conhecido', label: 'Conhecido', emoji: '🤝' },
  { value: 'vizinho', label: 'Vizinho', emoji: '🏠' },
  { value: 'cliente', label: 'Cliente', emoji: '💰' },
  { value: 'fornecedor', label: 'Fornecedor', emoji: '📦' },
  { value: 'parceiro', label: 'Parceiro de Negócios', emoji: '🤝' },
];

export default function RelationshipManager({ person, allPeople, onClose }: RelationshipManagerProps) {
  const { 
    relationships, 
    loading, 
    error, 
    createRelationship, 
    updateRelationship, 
    deleteRelationship 
  } = useRelationships(person.id);

  const [showAddForm, setShowAddForm] = useState(false);
  const [editingRelationship, setEditingRelationship] = useState<any>(null);
  const [formData, setFormData] = useState({
    person_b_id: '',
    relationship_type: '',
    strength: 3,
    notes: ''
  });

  // Filtrar pessoas disponíveis (excluir a própria pessoa e as já relacionadas)
  const availablePeople = allPeople.filter(p => {
    if (p.id === person.id) return false;
    const alreadyRelated = relationships.some(r => 
      r.related_person_id?.toString() === p.id
    );
    return !alreadyRelated;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingRelationship) {
        await updateRelationship(editingRelationship.id, {
          relationship_type: formData.relationship_type,
          strength: formData.strength,
          notes: formData.notes
        });
      } else {
        await createRelationship({
          person_a_id: parseInt(person.id),
          person_b_id: parseInt(formData.person_b_id),
          relationship_type: formData.relationship_type,
          strength: formData.strength,
          notes: formData.notes
        });
      }
      
      // Limpar formulário
      setFormData({
        person_b_id: '',
        relationship_type: '',
        strength: 3,
        notes: ''
      });
      setShowAddForm(false);
      setEditingRelationship(null);
    } catch (err: any) {
      alert(err.message || 'Erro ao salvar relacionamento');
    }
  };

  const handleEdit = (relationship: any) => {
    setEditingRelationship(relationship);
    setFormData({
      person_b_id: relationship.related_person_id?.toString() || '',
      relationship_type: relationship.relationship_type,
      strength: relationship.strength,
      notes: relationship.notes || ''
    });
    setShowAddForm(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm('Tem certeza que deseja remover este relacionamento?')) {
      try {
        await deleteRelationship(id);
      } catch (err) {
        alert('Erro ao deletar relacionamento');
      }
    }
  };

  const getRelationshipType = (type: string) => {
    return relationshipTypes.find(rt => rt.value === type) || { label: type, emoji: '🔗' };
  };

  const getStrengthColor = (strength: number) => {
    const colors = [
      'bg-gray-200 dark:bg-gray-700',
      'bg-red-200 dark:bg-red-900',
      'bg-yellow-200 dark:bg-yellow-900',
      'bg-green-200 dark:bg-green-900',
      'bg-blue-200 dark:bg-blue-900',
      'bg-purple-200 dark:bg-purple-900'
    ];
    return colors[strength] || colors[3];
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Link className="w-6 h-6" />
                Relacionamentos de {person.name}
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Gerencie as conexões e relacionamentos desta pessoa
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Conteúdo */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Botão Adicionar */}
          <div className="mb-6">
            <button
              onClick={() => {
                setShowAddForm(true);
                setEditingRelationship(null);
                setFormData({
                  person_b_id: '',
                  relationship_type: '',
                  strength: 3,
                  notes: ''
                });
              }}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-700 transition-colors"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Adicionar Relacionamento
            </button>
          </div>

          {/* Formulário */}
          {showAddForm && (
            <form onSubmit={handleSubmit} className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg mb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {!editingRelationship && (
                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                      Relacionado com:
                    </label>
                    <select
                      value={formData.person_b_id}
                      onChange={(e) => setFormData({...formData, person_b_id: e.target.value})}
                      className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg px-3 py-2"
                      required
                    >
                      <option value="">Selecione uma pessoa</option>
                      {availablePeople.map(p => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({p.context})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className={editingRelationship ? 'md:col-span-2' : ''}>
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                    Tipo de Relacionamento:
                  </label>
                  <select
                    value={formData.relationship_type}
                    onChange={(e) => setFormData({...formData, relationship_type: e.target.value})}
                    className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg px-3 py-2"
                    required
                  >
                    <option value="">Selecione o tipo</option>
                    {relationshipTypes.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.emoji} {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                    Força do Relacionamento:
                  </label>
                  <select
                    value={formData.strength}
                    onChange={(e) => setFormData({...formData, strength: parseInt(e.target.value)})}
                    className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg px-3 py-2"
                  >
                    <option value={1}>⭐ Muito Fraco</option>
                    <option value={2}>⭐⭐ Fraco</option>
                    <option value={3}>⭐⭐⭐ Médio</option>
                    <option value={4}>⭐⭐⭐⭐ Forte</option>
                    <option value={5}>⭐⭐⭐⭐⭐ Muito Forte</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                    Observações:
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                    className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg px-3 py-2"
                    rows={2}
                    placeholder="Detalhes sobre o relacionamento..."
                  />
                </div>
              </div>

              <div className="flex gap-2 mt-4">
                <button
                  type="submit"
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                >
                  {editingRelationship ? 'Atualizar' : 'Adicionar'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddForm(false);
                    setEditingRelationship(null);
                  }}
                  className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
                >
                  Cancelar
                </button>
              </div>
            </form>
          )}

          {/* Lista de Relacionamentos */}
          {loading && <p className="text-center py-4">Carregando...</p>}
          
          {error && (
            <div className="text-red-500 text-center py-4">{error}</div>
          )}

          {!loading && !error && relationships.length === 0 && (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">
                Nenhum relacionamento cadastrado ainda.
              </p>
            </div>
          )}

          {!loading && relationships.length > 0 && (
            <div className="space-y-3">
              {relationships.map(relationship => {
                const type = getRelationshipType(relationship.relationship_type);
                return (
                  <div
                    key={relationship.id}
                    className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-2xl">{type.emoji}</span>
                          <div>
                            <h4 className="font-semibold text-gray-900 dark:text-white">
                              {relationship.related_person_name}
                            </h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {type.label}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm">
                          <div className="flex items-center gap-1">
                            <span className="text-gray-500 dark:text-gray-400">Força:</span>
                            <div className={`px-2 py-1 rounded-full ${getStrengthColor(relationship.strength)}`}>
                              {[...Array(relationship.strength)].map((_, i) => (
                                <span key={i}>⭐</span>
                              ))}
                            </div>
                          </div>
                          
                          {relationship.related_person_context && (
                            <div className="text-gray-500 dark:text-gray-400">
                              Contexto: <span className="font-medium">{relationship.related_person_context}</span>
                            </div>
                          )}
                        </div>
                        
                        {relationship.notes && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                            {relationship.notes}
                          </p>
                        )}
                      </div>
                      
                      <div className="flex gap-2 ml-4">
                        <button
                          onClick={() => handleEdit(relationship)}
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(relationship.id)}
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
