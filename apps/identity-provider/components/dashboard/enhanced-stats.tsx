import { getSupabaseClient } from '@/lib/db';
import { Users, Building2, Activity, Shield, TrendingUp } from 'lucide-react';

export async function EnhancedStats() {
  const supabase = getSupabaseClient();

  // Get real counts from database
  const [
    { count: totalUsers },
    { count: activeUsers },
    { count: totalSchools },
    { count: totalRoles },
  ] = await Promise.all([
    supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .is('deleted_at', null),
    supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true)
      .is('deleted_at', null),
    supabase
      .from('schools')
      .select('*', { count: 'exact', head: true })
      .is('deleted_at', null),
    supabase
      .from('roles')
      .select('*', { count: 'exact', head: true })
      .is('deleted_at', null),
  ]);

  // Calculate percentages (mock for now - in real app, compare with previous period)
  const getUserPercentage = () => {
    if (!totalUsers) return 0;
    return Math.round(((activeUsers || 0) / totalUsers) * 100);
  };

  const stats = [
    {
      label: 'Total Users',
      value: totalUsers || 0,
      icon: Users,
      change: '+12%',
      changeType: 'positive' as const,
      color: 'blue',
    },
    {
      label: 'Active Users',
      value: activeUsers || 0,
      icon: Activity,
      change: `${getUserPercentage()}% active`,
      changeType: 'positive' as const,
      color: 'green',
    },
    {
      label: 'Schools',
      value: totalSchools || 0,
      icon: Building2,
      change: '+3 this month',
      changeType: 'positive' as const,
      color: 'purple',
    },
    {
      label: 'Roles',
      value: totalRoles || 0,
      icon: Shield,
      change: 'System stable',
      changeType: 'neutral' as const,
      color: 'orange',
    },
  ];

  const getColorClasses = (color: string) => {
    const colors = {
      blue: 'bg-blue-100 text-blue-600',
      green: 'bg-green-100 text-green-600',
      purple: 'bg-purple-100 text-purple-600',
      orange: 'bg-orange-100 text-orange-600',
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        const colorClasses = getColorClasses(stat.color);

        return (
          <div
            key={stat.label}
            className="rounded-lg border bg-white p-6 shadow-sm transition hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">
                  {stat.label}
                </p>
                <p className="mt-2 text-3xl font-bold text-gray-900">
                  {stat.value.toLocaleString()}
                </p>
              </div>
              <div className={`rounded-full p-3 ${colorClasses}`}>
                <Icon className="h-6 w-6" />
              </div>
            </div>

            <div className="mt-4 flex items-center gap-2">
              <TrendingUp
                className={`h-4 w-4 ${
                  stat.changeType === 'positive'
                    ? 'text-green-600'
                    : stat.changeType === 'negative'
                      ? 'text-red-600'
                      : 'text-gray-600'
                }`}
              />
              <p
                className={`text-sm ${
                  stat.changeType === 'positive'
                    ? 'text-green-600'
                    : stat.changeType === 'negative'
                      ? 'text-red-600'
                      : 'text-gray-600'
                }`}
              >
                {stat.change}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
