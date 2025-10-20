'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';

interface AuditFiltersProps {
  actions: string[];
}

export function AuditFilters({ actions }: AuditFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentAction = searchParams.get('action');

  const handleFilterChange = (action: string | null) => {
    const params = new URLSearchParams(searchParams);

    if (action) {
      params.set('action', action);
    } else {
      params.delete('action');
    }

    params.delete('page'); // Reset to page 1

    router.push(`/audit?${params.toString()}`);
  };

  return (
    <div className="rounded-lg border bg-white p-4">
      <h3 className="mb-3 text-sm font-medium text-gray-700">
        Filter by Action
      </h3>
      <div className="flex flex-wrap gap-2">
        <Button
          variant={!currentAction ? 'default' : 'outline'}
          size="sm"
          onClick={() => handleFilterChange(null)}
        >
          All Actions
        </Button>

        {actions.map((action) => (
          <Button
            key={action}
            variant={currentAction === action ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleFilterChange(action)}
          >
            {action}
          </Button>
        ))}
      </div>
    </div>
  );
}
