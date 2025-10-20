import { Clock } from 'lucide-react';

export function RecentActivity() {
  // TODO: Fetch real activity from database
  const activities = [
    {
      user: 'John Doe',
      action: 'logged in',
      time: '2 minutes ago',
      type: 'login',
    },
    {
      user: 'Jane Smith',
      action: 'updated profile',
      time: '15 minutes ago',
      type: 'update',
    },
    {
      user: 'Admin',
      action: 'created new role',
      time: '1 hour ago',
      type: 'create',
    },
    {
      user: 'Teacher Mike',
      action: 'logged out',
      time: '2 hours ago',
      type: 'logout',
    },
  ];

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'login':
        return 'bg-green-100 text-green-800';
      case 'logout':
        return 'bg-gray-100 text-gray-800';
      case 'create':
        return 'bg-blue-100 text-blue-800';
      case 'update':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="rounded-lg border bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-lg font-semibold text-gray-900">
        Recent Activity
      </h2>
      <div className="space-y-4">
        {activities.map((activity, index) => (
          <div
            key={index}
            className="flex items-center justify-between border-b pb-4 last:border-0"
          >
            <div className="flex items-center gap-3">
              <div
                className={`rounded-full px-2 py-1 text-xs font-medium ${getActivityColor(activity.type)}`}
              >
                {activity.type}
              </div>
              <div>
                <p className="font-medium text-gray-900">{activity.user}</p>
                <p className="text-sm text-gray-600">{activity.action}</p>
              </div>
            </div>
            <div className="flex items-center gap-1 text-sm text-gray-500">
              <Clock className="h-3 w-3" />
              <span>{activity.time}</span>
            </div>
          </div>
        ))}
      </div>
      <button className="mt-4 w-full rounded-lg border border-gray-300 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
        View All Activity
      </button>
    </div>
  );
}
