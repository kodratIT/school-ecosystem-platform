'use client';

import { Clock, User, FileText, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

interface AuditLog {
  id: string;
  user_id: string | null;
  action: string;
  resource_type?: string | null;
  resource_id?: string | null;
  description?: string | null;
  ip_address?: string | null;
  user_agent?: string | null;
  created_at: string;
  users?: {
    name: string;
    email: string;
  } | null;
}

interface AuditLogsTableProps {
  logs: AuditLog[];
  currentPage: number;
  totalPages: number;
}

export function AuditLogsTable({
  logs,
  currentPage,
  totalPages,
}: AuditLogsTableProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getActionColor = (action: string) => {
    if (action.includes('create')) return 'success';
    if (action.includes('update')) return 'default';
    if (action.includes('delete')) return 'error';
    return 'secondary';
  };

  return (
    <div className="space-y-4">
      <div className="rounded-lg border bg-white">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Action
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Resource
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  IP Address
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Timestamp
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50">
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {log.users?.name || 'Unknown User'}
                        </p>
                        <p className="text-xs text-gray-500">
                          {log.users?.email}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <Badge variant={getActionColor(log.action)}>
                      {log.action}
                    </Badge>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    {log.resource_type && (
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-900">
                          {log.resource_type}
                        </span>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <p className="max-w-xs truncate text-sm text-gray-600">
                      {log.description || '-'}
                    </p>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                    {log.ip_address || '-'}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        {formatDate(log.created_at)}
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {logs.length === 0 && (
          <div className="py-12 text-center text-gray-500">
            <Clock className="mx-auto h-12 w-12 text-gray-300" />
            <p className="mt-2">No audit logs found</p>
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Page {currentPage} of {totalPages}
          </p>

          <div className="flex gap-2">
            {currentPage > 1 && (
              <Link href={`/audit?page=${currentPage - 1}`}>
                <Button variant="outline" size="sm">
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  Previous
                </Button>
              </Link>
            )}

            {currentPage < totalPages && (
              <Link href={`/audit?page=${currentPage + 1}`}>
                <Button variant="outline" size="sm">
                  Next
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
