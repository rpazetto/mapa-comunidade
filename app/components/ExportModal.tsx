'use client';

import React, { useState } from 'react';
import { Download, FileText, FileSpreadsheet, X } from 'lucide-react';
import { downloadCSV, downloadTextReport, prepareExcelData } from '../utils/exportUtils';
import * as XLSX from 'xlsx';

interface Person {
  id: string;
  name: string;
  nickname?: string;
  context: string;
  proximity: string;
  importance?: number;
  occupation?: string;
  company?: string;
  position?: string;
  professional_class?: string;
  political_party?: string;
  phone?: string;
  mobile?: string;
  email?: string;
  city?: string;
  state?: string;
  notes?: string;
  last_contact?: string;
  contact_frequency?: string;
}

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  people: Person[];
  filteredPeople: Person[];
}

export default function ExportModal({ isOpen, onClose, people, filteredPeople }: ExportModalProps) {
  const [exportType, setExportType] = useState<'all' | 'filtered'>('filtered');
  const [format, setFormat] = useState<'csv' | 'excel' | 'txt'>('csv');

  if (!isOpen) return null;

  const handleExport = () => {
    const dataToExport = exportType === 'all' ? people : filteredPeople;
    const timestamp = new Date().toISOString().split('T')[0];
    
    switch (format) {
      case 'csv':
        downloadCSV(dataToExport, `mapa_comunidade_${timestamp}.csv`);
        break;
        
      case 'excel':
        const ws = XLSX.utils.json_to_sheet(prepareExcelData(dataToExport));
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Pessoas');
        
        // Ajustar largura das colunas
        const colWidths = [
          { wch: 30 }, // Nome
          { wch: 20 }, // Apelido
          { wch: 15 }, // Contexto
          { wch: 20 }, // Proximidade
          { wch: 12 }, // Importância
          { wch: 25 }, // Profissão
          { wch: 25 }, // Empresa
          { wch: 20 }, // Cargo
          { wch: 20 }, // Classe Prof
          { wch: 15 }, // Partido
          { wch: 15 }, // Telefone
          { wch: 15 }, // WhatsApp
          { wch: 30 }, // Email
          { wch: 20 }, // Cidade
          { wch: 10 }, // Estado
          { wch: 15 }, // Último Contato
          { wch: 20 }, // Frequência
          { wch: 40 }, // Observações
        ];
        ws['!cols'] = colWidths;
        
        XLSX.writeFile(wb, `mapa_comunidade_${timestamp}.xlsx`);
        break;
        
      case 'txt':
        downloadTextReport(dataToExport, `relatorio_mapa_comunidade_${timestamp}.txt`);
        break;
    }
    
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Exportar Dados</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Seleção de dados */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Quais dados exportar?</h3>
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="radio"
                value="filtered"
                checked={exportType === 'filtered'}
                onChange={() => setExportType('filtered')}
                className="mr-2"
              />
              <span>Dados filtrados ({filteredPeople.length} pessoas)</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                value="all"
                checked={exportType === 'all'}
                onChange={() => setExportType('all')}
                className="mr-2"
              />
              <span>Todos os dados ({people.length} pessoas)</span>
            </label>
          </div>
        </div>

        {/* Seleção de formato */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Formato de exportação</h3>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => setFormat('csv')}
              className={`p-3 rounded-lg border ${
                format === 'csv'
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-300 hover:bg-gray-50'
              }`}
            >
              <FileText className="w-6 h-6 mx-auto mb-1" />
              <span className="text-sm">CSV</span>
            </button>
            
            <button
              onClick={() => setFormat('excel')}
              className={`p-3 rounded-lg border ${
                format === 'excel'
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-300 hover:bg-gray-50'
              }`}
            >
              <FileSpreadsheet className="w-6 h-6 mx-auto mb-1" />
              <span className="text-sm">Excel</span>
            </button>
            
            <button
              onClick={() => setFormat('txt')}
              className={`p-3 rounded-lg border ${
                format === 'txt'
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-300 hover:bg-gray-50'
              }`}
            >
              <FileText className="w-6 h-6 mx-auto mb-1" />
              <span className="text-sm">Relatório</span>
            </button>
          </div>
          
          <div className="mt-2 text-xs text-gray-600">
            {format === 'csv' && 'Arquivo separado por vírgulas, compatível com Excel'}
            {format === 'excel' && 'Planilha Excel com formatação'}
            {format === 'txt' && 'Relatório detalhado em texto'}
          </div>
        </div>

        {/* Botões de ação */}
        <div className="flex space-x-3">
          <button
            onClick={handleExport}
            className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center justify-center"
          >
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}
