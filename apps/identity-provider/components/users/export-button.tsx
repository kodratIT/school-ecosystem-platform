'use client';

import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { exportToCSV } from '@/lib/export-utils';

interface User {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  role?: string;
  is_active: boolean;
  created_at: string;
}

interface ExportButtonProps {
  users: User[];
}

export function ExportButton({ users }: ExportButtonProps) {
  const handleExport = () => {
    // Prepare data for export (exclude sensitive fields)
    const exportData = users.map((user) => ({
      Name: user.name,
      Email: user.email,
      Phone: user.phone || '',
      Role: user.role || '',
      Status: user.is_active ? 'Active' : 'Inactive',
      'Created At': new Date(user.created_at).toLocaleDateString(),
    }));

    exportToCSV(exportData, 'users');
  };

  return (
    <Button variant="outline" onClick={handleExport}>
      <Download className="mr-2 h-4 w-4" />
      Export ({users.length})
    </Button>
  );
}
