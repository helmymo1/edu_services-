"use client";

import { useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { BookOpen, LogOut, Plus, TrendingUp, AlertCircle } from 'lucide-react';

export default function TutorDashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [services, setServices] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({ 
    activeServices: 0, 
    totalOrders: 0, 
    completedOrders: 0,
    totalEarnings: 0 
  });

  useEffect(() => {
    async function fetchData() {
      const supabase = createClient();
      
      try {
        const { data: { user: currentUser }, error: userError } = await supabase.auth.getUser();
        if (userError || !currentUser) {
          router.push('/auth/login');
          return;
        }
        setUser(currentUser);

        // Fetch tutor profile
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', currentUser.id)
          .single();

        if (profileData?.user_type !== 'tutor') {
          router.push('/dashboard');
          return;
        }

        setProfile(profileData);

        // Fetch tutor's services
        const { data: servicesData, error: servicesError } = await supabase
          .from('services')
          .select('*')
          .eq('tutor_id', currentUser.id)
          .order('created_at', { ascending: false });

        if (!servicesError && servicesData) {
          setServices(servicesData);
          setStats(prev => ({ ...prev, activeServices: servicesData.filter(s => s.is_active).length }));
        }

        // Fetch tutor's orders
        const { data: ordersData, error: ordersError } = await supabase
          .from('orders')
          .select('*')
          .eq('tutor_id', currentUser.id)
          .order('created_at', { ascending: false });

        if (!ordersError && ordersData) {
          setOrders(ordersData);
          
          // Calculate stats
          const completed = ordersData.filter(o => o.status === 'completed').length;
          const earnings = ordersData
            .filter(o => o.status === 'completed')
            .reduce((sum, o) => sum + (o.price || 0), 0);
          
          setStats(prev => ({
            ...prev,
            totalOrders: ordersData.length,
            completedOrders: completed,
            totalEarnings: earnings,
          }));
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [router]);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border bg-card sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg text-foreground hidden sm:inline">AcademiaPro</span>
          </Link>
          
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-foreground">{profile?.full_name || user?.email}</p>
              <p className="text-xs text-muted-foreground">Tutor Account</p>
            </div>
            <Button variant="ghost" size="sm" onClick={handleLogout} className="gap-2">
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          </div>
        </div>
      </nav>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-12 flex justify-between items-start gap-4">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">
              Welcome, {profile?.full_name?.split(' ')[0]}!
            </h1>
            <p className="text-lg text-muted-foreground">Manage your services and orders</p>
          </div>
          <Button asChild size="lg" className="gap-2">
            <Link href="/tutor/services/new">
              <Plus className="w-5 h-5" />
              New Service
            </Link>
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Active Services</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">{stats.activeServices}</div>
              <p className="text-xs text-muted-foreground mt-1">Services available</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-accent">{stats.totalOrders}</div>
              <p className="text-xs text-muted-foreground mt-1">All orders</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Completed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{stats.completedOrders}</div>
              <p className="text-xs text-muted-foreground mt-1">Finished work</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Earnings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">${stats.totalEarnings.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground mt-1">From completed work</p>
            </CardContent>
          </Card>
        </div>

        {/* Services and Orders */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Services */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Your Services</CardTitle>
                  <CardDescription>Manage your academic services</CardDescription>
                </div>
                <Button asChild size="sm" variant="outline">
                  <Link href="/tutor/services/new">
                    <Plus className="w-4 h-4 mr-1" />
                    Add
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {services.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">No services yet</p>
                  <Button asChild>
                    <Link href="/tutor/services/new">Create Your First Service</Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {services.map((service) => (
                    <Link key={service.id} href={`/tutor/services/${service.id}/edit`}>
                      <div className="p-3 border border-border rounded-lg hover:bg-accent/5 transition-colors cursor-pointer">
                        <div className="flex justify-between items-start gap-2">
                          <div className="flex-1">
                            <h4 className="font-semibold text-foreground text-sm">{service.title}</h4>
                            <p className="text-xs text-muted-foreground mt-1">
                              ${service.price} • {service.delivery_days}d delivery
                            </p>
                          </div>
                          <span className={`text-xs px-2 py-1 rounded ${service.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                            {service.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Orders */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Orders</CardTitle>
              <CardDescription>Orders from students</CardDescription>
            </CardHeader>
            <CardContent>
              {orders.length === 0 ? (
                <div className="text-center py-8">
                  <AlertCircle className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground text-sm">No orders yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {orders.slice(0, 5).map((order) => (
                    <Link key={order.id} href={`/tutor/orders/${order.id}`}>
                      <div className="p-3 border border-border rounded-lg hover:bg-accent/5 transition-colors cursor-pointer">
                        <div className="flex justify-between items-start gap-2">
                          <div className="flex-1">
                            <h4 className="font-semibold text-foreground text-sm">{order.title}</h4>
                            <p className="text-xs text-muted-foreground mt-1">${order.price}</p>
                          </div>
                          <span className={`text-xs px-2 py-1 rounded ${
                            order.status === 'completed' ? 'bg-green-100 text-green-800' :
                            order.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {order.status.replace('_', ' ')}
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
              {orders.length > 5 && (
                <Button asChild variant="outline" className="w-full mt-4">
                  <Link href="/tutor/orders">View All Orders</Link>
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
