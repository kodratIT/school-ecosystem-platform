import { getCurrentUser } from '@/lib/auth-utils';
import { StatsCards } from '@/components/dashboard/stats-cards';
import { RecentActivity } from '@/components/dashboard/recent-activity';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default async function DashboardPage() {
  const user = await getCurrentUser();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Welcome back, {user?.name}!
        </p>
      </div>

      <StatsCards />

      <div className="grid gap-6 md:grid-cols-2">
        <RecentActivity />

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              variant="outline"
              className="w-full justify-start h-auto py-3"
            >
              <div className="text-left">
                <p className="font-medium">Create New User</p>
                <p className="text-sm text-muted-foreground">
                  Add a new user to the system
                </p>
              </div>
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start h-auto py-3"
            >
              <div className="text-left">
                <p className="font-medium">Manage Roles</p>
                <p className="text-sm text-muted-foreground">
                  Configure roles and permissions
                </p>
              </div>
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start h-auto py-3"
            >
              <div className="text-left">
                <p className="font-medium">View Reports</p>
                <p className="text-sm text-muted-foreground">
                  Access system reports and analytics
                </p>
              </div>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
