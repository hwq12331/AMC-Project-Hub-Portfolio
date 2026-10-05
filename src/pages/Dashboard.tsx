import { useState, useEffect } from 'react';
import { 
  Activity, 
  AlertCircle, 
  Clock, 
  DollarSign, 
  Package,
  TrendingUp,
  TrendingDown,
  Minus
} from 'lucide-react';
import { cn } from '../utils/cn';
import { supabase } from '../lib/supabase';
import { format, subDays } from 'date-fns';

interface DashboardStats {
  activeProjects: number;
  pendingPOs: number;
  qaIssues: number;
  overdueTasks: number;
  totalRevenue: number;
  projectsChange: number;
  posChange: number;
  qaChange: number;
}

export function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    activeProjects: 0,
    pendingPOs: 0,
    qaIssues: 0,
    overdueTasks: 0,
    totalRevenue: 0,
    projectsChange: 0,
    posChange: 0,
    qaChange: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [recentActivities, setRecentActivities] = useState<any[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  async function fetchDashboardData() {
    try {
      setLoading(true);
      setError(null);

      // Test the connection first
      const { error: connectionError } = await supabase.from('projects').select('id').limit(1);
      if (connectionError) {
        throw new Error(`Database connection failed: ${connectionError.message}`);
      }

      // Get active projects count
      const { data: activeProjects, error: projectsError } = await supabase
        .from('projects')
        .select('id')
        .eq('status', 'in-progress');

      if (projectsError) {
        throw new Error(`Failed to fetch projects: ${projectsError.message}`);
      }

      // Get projects created in last 7 days
      const lastWeek = format(subDays(new Date(), 7), 'yyyy-MM-dd');
      const { data: newProjects, error: newProjectsError } = await supabase
        .from('projects')
        .select('id')
        .gte('created_at', lastWeek);

      if (newProjectsError) {
        throw new Error(`Failed to fetch new projects: ${newProjectsError.message}`);
      }

      // Get pending POs
      const { data: pendingPOs, error: posError } = await supabase
        .from('purchase_orders')
        .select('id, total_amount')
        .in('status', ['requested', 'ordered']);

      if (posError) {
        throw new Error(`Failed to fetch purchase orders: ${posError.message}`);
      }

      // Get POs created in last 7 days
      const { data: newPOs, error: newPOsError } = await supabase
        .from('purchase_orders')
        .select('id')
        .gte('created_at', lastWeek);

      if (newPOsError) {
        throw new Error(`Failed to fetch new purchase orders: ${newPOsError.message}`);
      }

      // Get QA issues
      const { data: qaIssues, error: qaError } = await supabase
        .from('qa_items')
        .select('id')
        .eq('status', 'failed');

      if (qaError) {
        throw new Error(`Failed to fetch QA issues: ${qaError.message}`);
      }

      // Get QA issues from last 7 days
      const { data: newQAIssues, error: newQAError } = await supabase
        .from('qa_items')
        .select('id')
        .eq('status', 'failed')
        .gte('created_at', lastWeek);

      if (newQAError) {
        throw new Error(`Failed to fetch new QA issues: ${newQAError.message}`);
      }

      // Calculate total revenue from completed POs
      const { data: completedPOs, error: completedPOsError } = await supabase
        .from('purchase_orders')
        .select('total_amount')
        .eq('status', 'received');

      if (completedPOsError) {
        throw new Error(`Failed to fetch completed purchase orders: ${completedPOsError.message}`);
      }

      const totalRevenue = completedPOs?.reduce((sum, po) => sum + (po.total_amount || 0), 0) || 0;

      // Get recent activities
      const { data: recentProjects, error: recentProjectsError } = await supabase
        .from('projects')
        .select('name, status, created_at')
        .order('created_at', { ascending: false })
        .limit(5);

      if (recentProjectsError) {
        throw new Error(`Failed to fetch recent projects: ${recentProjectsError.message}`);
      }

      const { data: recentPOs, error: recentPOsError } = await supabase
        .from('purchase_orders')
        .select('supplier_id, status, created_at')
        .order('created_at', { ascending: false })
        .limit(5);

      if (recentPOsError) {
        throw new Error(`Failed to fetch recent purchase orders: ${recentPOsError.message}`);
      }

      const activities = [
        ...(recentProjects?.map(p => ({
          type: 'project',
          name: p.name,
          status: p.status,
          date: p.created_at,
        })) || []),
        ...(recentPOs?.map(po => ({
          type: 'po',
          name: `PO-${po.supplier_id}`,
          status: po.status,
          date: po.created_at,
        })) || []),
      ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 5);

      setStats({
        activeProjects: activeProjects?.length || 0,
        pendingPOs: pendingPOs?.length || 0,
        qaIssues: qaIssues?.length || 0,
        overdueTasks: 0,
        totalRevenue,
        projectsChange: newProjects?.length || 0,
        posChange: newPOs?.length || 0,
        qaChange: newQAIssues?.length || 0,
      });

      setRecentActivities(activities);
      setError(null);
    } catch (err) {
      console.error('Dashboard data fetch error:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch dashboard data. Please check your connection and try again.');
      setStats({
        activeProjects: 0,
        pendingPOs: 0,
        qaIssues: 0,
        overdueTasks: 0,
        totalRevenue: 0,
        projectsChange: 0,
        posChange: 0,
        qaChange: 0,
      });
      setRecentActivities([]);
    } finally {
      setLoading(false);
    }
  }

  const statItems = [
    {
      name: 'Active Projects',
      value: stats.activeProjects,
      icon: Activity,
      change: `+${stats.projectsChange}`,
      changeType: stats.projectsChange > 0 ? 'increase' : 'neutral',
    },
    {
      name: 'Pending POs',
      value: stats.pendingPOs,
      icon: Package,
      change: stats.posChange.toString(),
      changeType: stats.posChange > 0 ? 'increase' : 'decrease',
    },
    {
      name: 'QA Issues',
      value: stats.qaIssues,
      icon: AlertCircle,
      change: stats.qaChange.toString(),
      changeType: stats.qaChange > 0 ? 'increase' : 'decrease',
    },
    {
      name: 'Overdue Tasks',
      value: stats.overdueTasks,
      icon: Clock,
      change: '0',
      changeType: 'neutral',
    },
    {
      name: 'Revenue (YTD)',
      value: `${(stats.totalRevenue / 1000000).toFixed(1)}M SAR`,
      icon: DollarSign,
      change: '+8%',
      changeType: 'increase',
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-lg text-gray-600">Loading dashboard data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-md bg-red-50 p-4 mb-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <AlertCircle className="h-5 w-5 text-red-400" aria-hidden="true" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error Loading Dashboard</h3>
            <div className="mt-2 text-sm text-red-700">{error}</div>
            <div className="mt-4">
              <button
                type="button"
                onClick={() => fetchDashboardData()}
                className="rounded-md bg-red-50 px-2 py-1.5 text-sm font-medium text-red-800 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-sm text-gray-700">
          Overview of AMC's key performance indicators and metrics
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {statItems.map((stat) => (
          <div
            key={stat.name}
            className="relative overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:px-6 sm:py-6"
          >
            <dt>
              <div className="absolute rounded-md bg-indigo-500 p-3">
                <stat.icon className="h-6 w-6 text-white" aria-hidden="true" />
              </div>
              <p className="ml-16 truncate text-sm font-medium text-gray-500">
                {stat.name}
              </p>
            </dt>
            <dd className="ml-16 flex items-baseline">
              <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
              <p
                className={cn(
                  'ml-2 flex items-baseline text-sm font-semibold',
                  {
                    'text-green-600': stat.changeType === 'increase',
                    'text-red-600': stat.changeType === 'decrease',
                    'text-gray-600': stat.changeType === 'neutral',
                  }
                )}
              >
                <span className="sr-only">
                  {stat.changeType === 'increase' ? 'Increased by' : 'Decreased by'}
                </span>
                {stat.changeType === 'increase' && (
                  <TrendingUp className="h-4 w-4 mr-1" />
                )}
                {stat.changeType === 'decrease' && (
                  <TrendingDown className="h-4 w-4 mr-1" />
                )}
                {stat.changeType === 'neutral' && (
                  <Minus className="h-4 w-4 mr-1" />
                )}
                {stat.change}
              </p>
            </dd>
          </div>
        ))}
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-lg bg-white p-6 shadow">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Recent Activities</h2>
          <div className="flow-root">
            <ul className="-mb-8">
              {recentActivities.map((activity, index) => (
                <li key={index}>
                  <div className="relative pb-8">
                    {index !== recentActivities.length - 1 && (
                      <span
                        className="absolute left-5 top-5 -ml-px h-full w-0.5 bg-gray-200"
                        aria-hidden="true"
                      />
                    )}
                    <div className="relative flex items-start space-x-3">
                      <div className={cn(
                        'relative flex h-10 w-10 items-center justify-center rounded-full',
                        activity.type === 'project' ? 'bg-blue-100' : 'bg-green-100'
                      )}>
                        {activity.type === 'project' ? (
                          <Activity className="h-5 w-5 text-blue-600" />
                        ) : (
                          <Package className="h-5 w-5 text-green-600" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {activity.name}
                          </div>
                          <p className="mt-0.5 text-sm text-gray-500">
                            Status: {activity.status}
                          </p>
                        </div>
                        <div className="mt-2 text-sm text-gray-500">
                          {new Date(activity.date).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="rounded-lg bg-white p-6 shadow">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Project Status Overview</h2>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Active Projects</span>
                <span className="font-medium text-gray-900">{stats.activeProjects}</span>
              </div>
              <div className="mt-2 h-2 rounded-full bg-gray-200">
                <div
                  className="h-2 rounded-full bg-green-500"
                  style={{ width: `${(stats.activeProjects / (stats.activeProjects + 2)) * 100}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Pending Purchase Orders</span>
                <span className="font-medium text-gray-900">{stats.pendingPOs}</span>
              </div>
              <div className="mt-2 h-2 rounded-full bg-gray-200">
                <div
                  className="h-2 rounded-full bg-yellow-500"
                  style={{ width: `${(stats.pendingPOs / (stats.pendingPOs + 5)) * 100}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">QA Issues</span>
                <span className="font-medium text-gray-900">{stats.qaIssues}</span>
              </div>
              <div className="mt-2 h-2 rounded-full bg-gray-200">
                <div
                  className="h-2 rounded-full bg-red-500"
                  style={{ width: `${(stats.qaIssues / (stats.qaIssues + 10)) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
