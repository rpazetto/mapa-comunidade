// app/utils/exportUtils.ts

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

// Mapeamento de valores para labels legíveis
const contextLabels: Record<string, string> = {
  residencial: 'Residencial',
  profissional: 'Profissional',
  social: 'Social',
  servicos: 'Serviços',
  institucional: 'Institucional',
  politico: 'Político'
};

const proximityLabels: Record<string, string> = {
  nucleo: 'Núcleo Central',
  primeiro: 'Primeiro Círculo',
  segundo: 'Segundo Círculo',
  terceiro: 'Terceiro Círculo',
  periferia: 'Periferia'
};

const frequencyLabels: Record<string, string> = {
  daily: 'Diário',
  weekly: 'Semanal',
  monthly: 'Mensal',
  quarterly: 'Trimestral',
  yearly: 'Anual'
};

// Função para converter dados para CSV
export function convertToCSV(people: Person[]): string {
  // Cabeçalhos
  const headers = [
    'Nome',
    'Apelido',
    'Contexto',
    'Proximidade',
    'Importância',
    'Profissão',
    'Empresa',
    'Cargo',
    'Classe Profissional',
    'Partido Político',
    'Telefone',
    'WhatsApp',
    'Email',
    'Cidade',
    'Estado',
    'Último Contato',
    'Frequência de Contato',
    'Observações'
  ];

  // Converter dados
  const rows = people.map(person => [
    person.name,
    person.nickname || '',
    contextLabels[person.context] || person.context,
    proximityLabels[person.proximity] || person.proximity,
    person.importance || 3,
    person.occupation || '',
    person.company || '',
    person.position || '',
    person.professional_class || '',
    person.political_party || '',
    person.phone || '',
    person.mobile || '',
    person.email || '',
    person.city || '',
    person.state || '',
    person.last_contact || '',
    frequencyLabels[person.contact_frequency || ''] || '',
    (person.notes || '').replace(/"/g, '""') // Escapar aspas duplas
  ]);

  // Montar CSV
  const csvContent = [
    headers.join(','),
    ...rows.map(row => 
      row.map(cell => {
        // Se contém vírgula, quebra de linha ou aspas, envolver em aspas
        if (String(cell).includes(',') || String(cell).includes('\n') || String(cell).includes('"')) {
          return `"${String(cell).replace(/"/g, '""')}"`;
        }
        return cell;
      }).join(',')
    )
  ].join('\n');

  return csvContent;
}

// Função para baixar CSV
export function downloadCSV(people: Person[], filename: string = 'mapa_comunidade.csv') {
  const csv = convertToCSV(people);
  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' }); // BOM para UTF-8
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Função para preparar dados para Excel (formato JSON)
export function prepareExcelData(people: Person[]) {
  return people.map(person => ({
    'Nome': person.name,
    'Apelido': person.nickname || '',
    'Contexto': contextLabels[person.context] || person.context,
    'Proximidade': proximityLabels[person.proximity] || person.proximity,
    'Importância': person.importance || 3,
    'Profissão': person.occupation || '',
    'Empresa': person.company || '',
    'Cargo': person.position || '',
    'Classe Profissional': person.professional_class || '',
    'Partido Político': person.political_party || '',
    'Telefone': person.phone || '',
    'WhatsApp': person.mobile || '',
    'Email': person.email || '',
    'Cidade': person.city || '',
    'Estado': person.state || '',
    'Último Contato': person.last_contact || '',
    'Frequência de Contato': frequencyLabels[person.contact_frequency || ''] || '',
    'Observações': person.notes || ''
  }));
}

// Função para gerar relatório em texto
export function generateTextReport(people: Person[]): string {
  const totalPeople = people.length;
  const contexts = ['residencial', 'profissional', 'social', 'servicos', 'institucional', 'politico'];
  const proximities = ['nucleo', 'primeiro', 'segundo', 'terceiro', 'periferia'];
  
  let report = '='.repeat(60) + '\n';
  report += 'RELATÓRIO DO MAPA DE COMUNIDADE\n';
  report += '='.repeat(60) + '\n\n';
  
  report += `Data do Relatório: ${new Date().toLocaleDateString('pt-BR')}\n`;
  report += `Total de Pessoas: ${totalPeople}\n\n`;
  
  // Estatísticas por Contexto
  report += 'DISTRIBUIÇÃO POR CONTEXTO:\n';
  report += '-'.repeat(40) + '\n';
  contexts.forEach(context => {
    const count = people.filter(p => p.context === context).length;
    const percentage = totalPeople > 0 ? ((count / totalPeople) * 100).toFixed(1) : '0';
    report += `${contextLabels[context].padEnd(20)} ${count.toString().padStart(5)} (${percentage}%)\n`;
  });
  
  report += '\n';
  
  // Estatísticas por Proximidade
  report += 'DISTRIBUIÇÃO POR PROXIMIDADE:\n';
  report += '-'.repeat(40) + '\n';
  proximities.forEach(proximity => {
    const count = people.filter(p => p.proximity === proximity).length;
    const percentage = totalPeople > 0 ? ((count / totalPeople) * 100).toFixed(1) : '0';
    report += `${proximityLabels[proximity].padEnd(20)} ${count.toString().padStart(5)} (${percentage}%)\n`;
  });
  
  report += '\n';
  
  // Top 10 Partidos Políticos
  const partyCount: Record<string, number> = {};
  people.forEach(person => {
    if (person.political_party) {
      partyCount[person.political_party] = (partyCount[person.political_party] || 0) + 1;
    }
  });
  
  const sortedParties = Object.entries(partyCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);
  
  if (sortedParties.length > 0) {
    report += 'TOP 10 PARTIDOS POLÍTICOS:\n';
    report += '-'.repeat(40) + '\n';
    sortedParties.forEach(([party, count]) => {
      report += `${party.padEnd(30)} ${count}\n`;
    });
    report += '\n';
  }
  
  // Pessoas por importância
  report += 'PESSOAS POR IMPORTÂNCIA:\n';
  report += '-'.repeat(40) + '\n';
  for (let i = 5; i >= 1; i--) {
    const count = people.filter(p => (p.importance || 3) === i).length;
    const stars = '⭐'.repeat(i);
    report += `${stars.padEnd(15)} ${count} pessoas\n`;
  }
  
  return report;
}

// Função para baixar relatório de texto
export function downloadTextReport(people: Person[], filename: string = 'relatorio_mapa_comunidade.txt') {
  const report = generateTextReport(people);
  const blob = new Blob([report], { type: 'text/plain;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
