import { Users, Building2, Shield, Activity } from 'lucide-react';

export function StatsCards() {
  // TODO: Fetch real stats from database
  const stats = [
    {
      label: 'Total Users',
      value: '1,234',
      icon: Users,
      change: '+12%',
      changeType: 'positive',
    },
    {
      label: 'Schools',
      value: '45',
      icon: Building2,
      change: '+5%',
      changeType: 'positive',
    },
    {
      label: 'Active Sessions',
      value: '892',
      icon: Activity,
      change: '+8%',
      changeType: 'positive',
    },
    {
      label: 'Roles',
      value: '8',
      icon: Shield,
      change: '0%',
      changeType: 'neutral',
    },
  ];

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        const changeColor =
          stat.changeType === 'positive'
            ? 'text-green-600'
            : stat.changeType === 'negative'
              ? 'text-red-600'
              : 'text-gray-600';

        return (
          <div
            key={stat.label}
            className="rounded-lg border bg-white p-6 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{stat.label}</p>
                <p className="mt-2 text-3xl font-bold text-gray-900">
                  {stat.value}
                </p>
              </div>
              <div className="rounded-full bg-blue-100 p-3">
                <Icon className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <p className={`mt-4 text-sm ${changeColor}`}>
              {stat.change} from last month
            </p>
          </div>
        );
      })}
    </div>
  );
}
