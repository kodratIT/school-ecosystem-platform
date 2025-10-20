'use client';

import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { exportToCSV } from '@/lib/export-utils';

interface School {
  id: string;
  name: string;
  npsn?: string | null;
  address?: string | null;
  city?: string | null;
  province?: string | null;
  phone?: string | null;
  email?: string | null;
  website?: string | null;
  is_active: boolean;
  created_at: string;
}

interface SchoolsExportButtonProps {
  schools: School[];
}

export function SchoolsExportButton({ schools }: SchoolsExportButtonProps) {
  const handleExport = () => {
    const exportData = schools.map((school) => ({
      Name: school.name,
      NPSN: school.npsn || '',
      Address: school.address || '',
      City: school.city || '',
      Province: school.province || '',
      Phone: school.phone || '',
      Email: school.email || '',
      Website: school.website || '',
      Status: school.is_active ? 'Active' : 'Inactive',
      'Created At': new Date(school.created_at).toLocaleDateString(),
    }));

    exportToCSV(exportData, 'schools');
  };

  return (
    <Button variant="outline" onClick={handleExport}>
      <Download className="mr-2 h-4 w-4" />
      Export ({schools.length})
    </Button>
  );
}
