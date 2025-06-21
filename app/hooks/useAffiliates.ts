import { useState, useEffect } from 'react';

interface AffiliateData {
  city: string;
  party: string;
  age_group?: string;
  count: number;
  total_by_party?: number;
}

export function useAffiliates(city: string = 'GRAMADO') {
  const [affiliates, setAffiliates] = useState<AffiliateData[]>([]);
  const [totals, setTotals] = useState<AffiliateData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAffiliates();
  }, [city]);

  const fetchAffiliates = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/affiliates?city=${city}`);
      
      if (!response.ok) {
        throw new Error('Erro ao carregar dados');
      }

      const data = await response.json();
      setAffiliates(data.affiliates);
      setTotals(data.totals);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  return {
    affiliates,
    totals,
    loading,
    error,
    refetch: fetchAffiliates
  };
}
