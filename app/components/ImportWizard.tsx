'use client';

import React, { useState, useCallback } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle, Download, X, Users, Loader2 } from 'lucide-react';
import Papa from 'papaparse';

interface ImportWizardProps {
  onClose: () => void;
  onImport: (people: any[]) => void;
}

function ImportWizard({ onClose, onImport }: ImportWizardProps) {
  const [step, setStep] = useState(1);
  const [file, setFile] = useState<File | null>(null);
  const [parseResults, setParseResults] = useState<any[]>([]);
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [importing, setImporting] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  // Campos do sistema
  const systemFields = [
    { key: 'name', label: 'Nome', required: true },
    { key: 'email', label: 'Email', required: false },
    { key: 'phone', label: 'Telefone', required: false },
    { key: 'mobile', label: 'Celular', required: false },
    { key: 'whatsapp', label: 'WhatsApp', required: false },
    { key: 'birth_date', label: 'Data de Nascimento', required: false },
    { key: 'gender', label: 'Gênero', required: false },
    { key: 'city', label: 'Cidade', required: false },
    { key: 'state', label: 'Estado', required: false },
    { key: 'address', label: 'Endereço', required: false },
    { key: 'political_party', label: 'Partido Político', required: false },
    { key: 'occupation', label: 'Profissão', required: false },
    { key: 'company', label: 'Empresa', required: false },
    { key: 'context', label: 'Contexto', required: true },
    { key: 'proximity', label: 'Proximidade', required: true },
  ];

  // Processar arquivo CSV simulado (sem dependências externas por enquanto)
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = event.target.files?.[0];
    if (!uploadedFile) return;

    setFile(uploadedFile);
    setErrors([]);

    // Usar Papa Parse para processar o CSV
    Papa.parse(uploadedFile, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.errors.length > 0) {
          setErrors(results.errors.map(e => e.message));
          return;
        }

        setParseResults(results.data);
        
        // Auto-mapear campos com nomes similares
        const csvColumns = Object.keys(results.data[0] || {});
        const autoMapping: Record<string, string> = {};
        
        systemFields.forEach(field => {
          const match = csvColumns.find(col => 
            col.toLowerCase().includes(field.key.toLowerCase()) ||
            field.label.toLowerCase().includes(col.toLowerCase())
          );
          if (match) {
            autoMapping[field.key] = match;
          }
        });
        
        setMapping(autoMapping);
        setStep(2);
      },
      error: (error) => {
        setErrors([error.message]);
      }
    });
  };

  // Validar dados
  const validateData = () => {
    const validationErrors: string[] = [];
    const requiredFields = systemFields.filter(f => f.required);

    requiredFields.forEach(field => {
      if (!mapping[field.key]) {
        validationErrors.push(`Campo obrigatório não mapeado: ${field.label}`);
      }
    });

    setErrors(validationErrors);
    return validationErrors.length === 0;
  };

  // Processar importação
  const handleImport = async () => {
    if (!validateData()) return;

    setImporting(true);
    setStep(3);

    try {
      // Mapear dados
      const mappedData = parseResults.map(row => {
        const person: any = {
          context: 'profissional',
          proximity: 'terceiro',
          importance: 3,
        };

        Object.entries(mapping).forEach(([systemField, csvColumn]) => {
          if (csvColumn && row[csvColumn]) {
            person[systemField] = row[csvColumn];
          }
        });

        return person;
      });

      // Chamar callback
      await onImport(mappedData);
      setStep(4);
    } catch (error) {
      setErrors(['Erro ao importar dados']);
      setStep(2);
    } finally {
      setImporting(false);
    }
  };

  // Download template
  const downloadTemplate = () => {
    const template = [
      {
        Nome: 'João Silva',
        Email: 'joao@example.com',
        Telefone: '(51) 3333-4444',
        Celular: '(51) 99999-8888',
        WhatsApp: '(51) 99999-8888',
        'Data de Nascimento': '1980-05-15',
        Gênero: 'M',
        Cidade: 'Gramado',
        Estado: 'RS',
        Endereço: 'Rua das Flores, 123',
        'Partido Político': 'PP',
        Profissão: 'Empresário',
        Empresa: 'Silva & Cia',
        Contexto: 'profissional',
        Proximidade: 'primeiro'
      },
      {
        Nome: 'Maria Santos',
        Email: 'maria@example.com',
        Telefone: '(51) 3333-5555',
        Celular: '(51) 88888-7777',
        WhatsApp: '(51) 88888-7777',
        'Data de Nascimento': '1975-08-20',
        Gênero: 'F',
        Cidade: 'Gramado',
        Estado: 'RS',
        Endereço: 'Av. Principal, 456',
        'Partido Político': 'MDB',
        Profissão: 'Professora',
        Empresa: 'Escola Municipal',
        Contexto: 'social',
        Proximidade: 'segundo'
      }
    ];

    const csv = Papa.unparse(template);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'template_importacao.csv';
    link.click();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
            <Upload className="w-6 h-6" />
            Importação em Massa
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Progress Steps */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            {[
              { num: 1, label: 'Upload' },
              { num: 2, label: 'Mapeamento' },
              { num: 3, label: 'Importação' },
              { num: 4, label: 'Concluído' }
            ].map((s, index) => (
              <div key={s.num} className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                  step >= s.num 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                }`}>
                  {step > s.num ? <CheckCircle className="w-6 h-6" /> : s.num}
                </div>
                <span className={`ml-2 text-sm ${
                  step >= s.num 
                    ? 'text-gray-800 dark:text-white font-medium' 
                    : 'text-gray-500 dark:text-gray-400'
                }`}>
                  {s.label}
                </span>
                {index < 3 && (
                  <div className={`w-12 h-0.5 mx-4 ${
                    step > s.num ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 200px)' }}>
          {/* Step 1: Upload */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="text-center">
                <Upload className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
                  Faça upload do arquivo CSV
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Selecione um arquivo CSV com os dados das pessoas que deseja importar
                </p>
              </div>

              <div className="flex justify-center">
                <label className="cursor-pointer">
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <div className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Selecionar Arquivo CSV
                  </div>
                </label>
              </div>

              <div className="flex justify-center">
                <button
                  onClick={downloadTemplate}
                  className="text-blue-500 hover:text-blue-600 text-sm flex items-center gap-1"
                >
                  <Download className="w-4 h-4" />
                  Baixar template de exemplo
                </button>
              </div>

              {errors.length > 0 && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                  <p className="text-red-800 dark:text-red-200 font-medium mb-2">Erros encontrados:</p>
                  <ul className="list-disc list-inside text-sm text-red-700 dark:text-red-300">
                    {errors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Step 2: Mapeamento */}
          {step === 2 && parseResults.length > 0 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
                  Mapeamento de Campos
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Arquivo carregado: {file?.name} ({parseResults.length} registros)
                </p>
              </div>

              <div className="space-y-4">
                {systemFields.map(field => (
                  <div key={field.key} className="flex items-center gap-4">
                    <div className="w-1/3">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {field.label}
                        {field.required && <span className="text-red-500 ml-1">*</span>}
                      </label>
                    </div>
                    <select
                      value={mapping[field.key] || ''}
                      onChange={(e) => setMapping({ ...mapping, [field.key]: e.target.value })}
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="">-- Não mapear --</option>
                      {Object.keys(parseResults[0] || {}).map(column => (
                        <option key={column} value={column}>{column}</option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>

              {errors.length > 0 && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                  <p className="text-red-800 dark:text-red-200 font-medium mb-2">Validação:</p>
                  <ul className="list-disc list-inside text-sm text-red-700 dark:text-red-300">
                    {errors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Importando */}
          {step === 3 && (
            <div className="text-center py-12">
              <Loader2 className="w-16 h-16 mx-auto text-blue-500 animate-spin mb-4" />
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
                Importando dados...
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Por favor, aguarde enquanto processamos os {parseResults.length} registros
              </p>
            </div>
          )}

          {/* Step 4: Concluído */}
          {step === 4 && (
            <div className="text-center py-12">
              <CheckCircle className="w-16 h-16 mx-auto text-green-500 mb-4" />
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
                Importação concluída!
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {parseResults.length} pessoas foram importadas com sucesso
              </p>
              <button
                onClick={onClose}
                className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
              >
                Fechar
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        {step === 2 && (
          <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-between">
            <button
              onClick={() => setStep(1)}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
            >
              Voltar
            </button>
            <button
              onClick={handleImport}
              disabled={importing}
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {importing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Importando...
                </>
              ) : (
                <>
                  <Users className="w-4 h-4" />
                  Importar {parseResults.length} Pessoas
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default ImportWizard;
