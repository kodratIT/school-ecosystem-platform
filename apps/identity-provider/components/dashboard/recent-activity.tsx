import { Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity, index) => (
            <div
              key={index}
              className="flex items-center justify-between border-b pb-4 last:border-0"
            >
              <div className="flex items-center gap-3">
                <Badge
                  variant={
                    activity.type === 'login'
                      ? 'default'
                      : activity.type === 'create'
                        ? 'secondary'
                        : 'outline'
                  }
                >
                  {activity.type}
                </Badge>
                <div>
                  <p className="font-medium">{activity.user}</p>
                  <p className="text-sm text-muted-foreground">
                    {activity.action}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span>{activity.time}</span>
              </div>
            </div>
          ))}
        </div>
        <Button variant="outline" className="mt-4 w-full">
          View All Activity
        </Button>
      </CardContent>
    </Card>
  );
}
