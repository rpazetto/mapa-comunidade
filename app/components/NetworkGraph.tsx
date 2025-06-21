'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

interface Person {
  id: string;
  name: string;
  nickname?: string;
  context: string;
  proximity: string;
  importance?: number;
  occupation?: string;
  political_party?: string;
  mobile?: string;
  email?: string;
}

interface NetworkGraphProps {
  people: Person[];
  onNodeClick?: (person: Person) => void;
}

export default function NetworkGraph({ people, onNodeClick }: NetworkGraphProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  
  // Cores por contexto
  const contextColors: Record<string, string> = {
    residencial: '#10b981',
    profissional: '#3b82f6', 
    social: '#8b5cf6',
    servicos: '#f97316',
    institucional: '#6b7280',
    politico: '#ef4444'
  };

  // Tamanhos por proximidade
  const proximitySizes: Record<string, number> = {
    nucleo: 30,
    primeiro: 25,
    segundo: 20,
    terceiro: 15,
    periferia: 10
  };

  useEffect(() => {
    if (!svgRef.current || people.length === 0) return;

    // Limpar SVG anterior
    d3.select(svgRef.current).selectAll('*').remove();

    const width = 1000;
    const height = 600;

    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height);

    // Criar grupos para organização
    const g = svg.append('g');

    // Adicionar zoom
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 4])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });

    svg.call(zoom);

    // Preparar dados para o grafo
    const nodes = people.map(person => ({
      id: person.id,
      name: person.name,
      group: person.context,
      proximity: person.proximity,
      radius: proximitySizes[person.proximity] || 15,
      color: contextColors[person.context] || '#94a3b8',
      data: person
    }));

    // Criar links fictícios baseados em contexto e proximidade
    // Em uma versão real, isso viria do banco de dados
    const links: any[] = [];
    
    // Conectar pessoas do mesmo contexto se estão próximas
    nodes.forEach((source, i) => {
      nodes.forEach((target, j) => {
        if (i < j) {
          if (source.group === target.group) {
            // Mesmo contexto = conexão mais forte
            links.push({
              source: source.id,
              target: target.id,
              strength: 2
            });
          } else if (
            (source.proximity === 'nucleo' || source.proximity === 'primeiro') &&
            (target.proximity === 'nucleo' || target.proximity === 'primeiro')
          ) {
            // Pessoas próximas mesmo de contextos diferentes
            links.push({
              source: source.id,
              target: target.id,
              strength: 1
            });
          }
        }
      });
    });

    // Criar simulação de força
    const simulation = d3.forceSimulation(nodes)
      .force('link', d3.forceLink(links)
        .id((d: any) => d.id)
        .distance(d => d.strength === 2 ? 100 : 200))
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius((d: any) => d.radius + 5));

    // Criar links
    const link = g.append('g')
      .selectAll('line')
      .data(links)
      .enter().append('line')
      .attr('stroke', '#94a3b8')
      .attr('stroke-opacity', d => d.strength === 2 ? 0.6 : 0.3)
      .attr('stroke-width', d => d.strength);

    // Criar nós
    const node = g.append('g')
      .selectAll('g')
      .data(nodes)
      .enter().append('g')
      .attr('cursor', 'pointer')
      .call(d3.drag<any, any>()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended));

    // Adicionar círculos
    node.append('circle')
      .attr('r', d => d.radius)
      .attr('fill', d => d.color)
      .attr('stroke', '#fff')
      .attr('stroke-width', 2)
      .on('click', (event, d) => {
        setSelectedNode(d.id);
        if (onNodeClick) onNodeClick(d.data);
      })
      .on('mouseover', function(event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('r', d.radius * 1.2);
        
        // Mostrar tooltip
        const tooltip = g.append('g')
          .attr('id', 'tooltip');
        
        const rect = tooltip.append('rect')
          .attr('x', d.x - 80)
          .attr('y', d.y - 60)
          .attr('width', 160)
          .attr('height', 40)
          .attr('fill', 'white')
          .attr('stroke', '#e5e7eb')
          .attr('rx', 4);
        
        tooltip.append('text')
          .attr('x', d.x)
          .attr('y', d.y - 45)
          .attr('text-anchor', 'middle')
          .attr('font-size', '12px')
          .attr('font-weight', 'bold')
          .text(d.name);
        
        tooltip.append('text')
          .attr('x', d.x)
          .attr('y', d.y - 30)
          .attr('text-anchor', 'middle')
          .attr('font-size', '11px')
          .attr('fill', '#6b7280')
          .text(d.data.occupation || d.group);
      })
      .on('mouseout', function(event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('r', d.radius);
        
        g.select('#tooltip').remove();
      });

    // Adicionar texto
    node.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '.35em')
      .attr('font-size', d => d.radius > 20 ? '12px' : '10px')
      .attr('fill', 'white')
      .attr('font-weight', 'bold')
      .attr('pointer-events', 'none')
      .text(d => {
        const name = d.name.split(' ')[0];
        return name.length > 10 ? name.substring(0, 8) + '...' : name;
      });

    // Funções de drag
    function dragstarted(event: any, d: any) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(event: any, d: any) {
      d.fx = event.x;
      d.fy = event.y;
    }

    function dragended(event: any, d: any) {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }

    // Atualizar posições
    simulation.on('tick', () => {
      link
        .attr('x1', (d: any) => d.source.x)
        .attr('y1', (d: any) => d.source.y)
        .attr('x2', (d: any) => d.target.x)
        .attr('y2', (d: any) => d.target.y);

      node
        .attr('transform', (d: any) => `translate(${d.x},${d.y})`);
    });

    // Cleanup
    return () => {
      simulation.stop();
    };
  }, [people, onNodeClick]);

  return (
    <div className="bg-white rounded-lg shadow-lg p-4">
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2">Grafo de Relacionamentos</h3>
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <span className="font-medium">Contextos:</span>
            {Object.entries(contextColors).map(([context, color]) => (
              <div key={context} className="flex items-center gap-1">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: color }}
                />
                <span className="capitalize">{context}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-4 text-sm mt-2">
          <div className="flex items-center gap-2">
            <span className="font-medium">Tamanho = Proximidade:</span>
            <span className="text-gray-600">Núcleo (maior) → Periferia (menor)</span>
          </div>
        </div>
      </div>
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <svg ref={svgRef} className="w-full" />
      </div>
      <div className="mt-2 text-sm text-gray-600">
        💡 Arraste os nós para reorganizar • Scroll para zoom • Clique para detalhes
      </div>
    </div>
  );
}
