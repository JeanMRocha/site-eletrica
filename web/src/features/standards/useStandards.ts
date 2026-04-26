import { useEffect } from 'react';
import { listStandards, listHierarchy, type Standard, type HierarchyLevel } from '../../domain/standards';
import { useAsync } from '../../hooks/useAsync';

export function useStandards() {
  const { data, loading, error, execute } = useAsync<{ standards: Standard[]; hierarchy: HierarchyLevel[] }>();

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (cancelled) return;
      await execute(
        Promise.all([listStandards(), listHierarchy()]).then(([s, h]) => ({
          standards: s,
          hierarchy: h,
        }))
      );
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [execute]);

  return {
    standards: data?.standards || [],
    hierarchy: data?.hierarchy || [],
    loading,
    error: error || '',
  };
}
