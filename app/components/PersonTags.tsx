import React, { useState, useEffect } from 'react';
import { X, Plus, Tag as TagIcon } from 'lucide-react';
import { useTags } from '../hooks/useTags';

interface PersonTagsProps {
  personId: string;
  personName: string;
  onClose?: () => void;
  inline?: boolean;
}

export default function PersonTags({ personId, personName, onClose, inline = false }: PersonTagsProps) {
  const { tags, addTagToPerson, removeTagFromPerson, getPersonTags } = useTags();
  const [personTags, setPersonTags] = useState<any[]>([]);
  const [showSelector, setShowSelector] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPersonTags();
  }, [personId]);

  const loadPersonTags = async () => {
    setLoading(true);
    const tags = await getPersonTags(personId);
    setPersonTags(tags);
    setLoading(false);
  };

  const handleAddTag = async (tagId: number) => {
    const success = await addTagToPerson(personId, tagId);
    if (success) {
      await loadPersonTags();
      setShowSelector(false);
    }
  };

  const handleRemoveTag = async (tagId: number) => {
    const success = await removeTagFromPerson(personId, tagId);
    if (success) {
      await loadPersonTags();
    }
  };

  const availableTags = tags.filter(
    tag => !personTags.some(pt => pt.id === tag.id)
  );

  if (inline) {
    return (
      <div className="flex flex-wrap gap-1 items-center">
        {personTags.map(tag => (
          <span
            key={tag.id}
            className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium text-white"
            style={{ backgroundColor: tag.color }}
          >
            {tag.name}
          </span>
        ))}
        {personTags.length === 0 && (
          <span className="text-xs text-gray-500 dark:text-gray-400">-</span>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {onClose && (
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Tags de {personName}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Tags atuais */}
      <div className="flex flex-wrap gap-2">
        {personTags.map(tag => (
          <span
            key={tag.id}
            className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium text-white group"
            style={{ backgroundColor: tag.color }}
          >
            {tag.name}
            <button
              onClick={() => handleRemoveTag(tag.id)}
              className="ml-2 hover:bg-black hover:bg-opacity-20 rounded-full p-0.5"
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}
        
        {!showSelector && (
          <button
            onClick={() => setShowSelector(true)}
            className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
          >
            <Plus className="w-4 h-4 mr-1" />
            Adicionar Tag
          </button>
        )}
      </div>

      {/* Seletor de tags */}
      {showSelector && (
        <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Selecione uma tag:
          </h4>
          <div className="flex flex-wrap gap-2">
            {availableTags.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Todas as tags já foram adicionadas
              </p>
            ) : (
              availableTags.map(tag => (
                <button
                  key={tag.id}
                  onClick={() => handleAddTag(tag.id)}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium text-white hover:opacity-80"
                  style={{ backgroundColor: tag.color }}
                >
                  {tag.name}
                </button>
              ))
            )}
          </div>
          <button
            onClick={() => setShowSelector(false)}
            className="mt-3 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
          >
            Cancelar
          </button>
        </div>
      )}

      {loading && (
        <div className="text-center py-4">
          <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900 dark:border-white"></div>
        </div>
      )}
    </div>
  );
}
