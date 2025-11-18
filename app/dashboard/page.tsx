'use client';

import { useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { BookOpen, LogOut, Plus, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { DashboardStatsSkeleton, OrderCardSkeleton } from '@/components/skeleton-loader';

type Profile = {
  full_name: string | null;
  user_type: string;
};

type Order = {
  id: string;
  title: string;
  description: string;
  status: string;
  price: number;
  delivery_date: string;
  created_at: string;
  services: {
    title: string;
    category: string;
    price: number;
  };
};

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, pending: 0, completed: 0 });

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

        // Fetch user profile
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', currentUser.id)
          .single();

        setProfile(profileData);

        // Fetch user's orders
        const { data: ordersData, error: ordersError } = await supabase
          .from('orders')
          .select('id, title, description, status, price, delivery_date, created_at, services(title, category, price)')
          .eq('student_id', currentUser.id)
          .order('created_at', { ascending: false });

        if (!ordersError && ordersData) {
          setOrders(ordersData);
          
          // Calculate stats
          setStats({
            total: ordersData.length,
            pending: ordersData.filter(o => o.status === 'pending' || o.status === 'in_progress').length,
            completed: ordersData.filter(o => o.status === 'completed').length,
          });
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
      <div className="min-h-screen bg-background">
        {/* Navigation skeleton */}
        <nav className="border-b border-border bg-card sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-muted rounded-lg animate-pulse"></div>
              <div className="w-24 h-5 bg-muted rounded animate-pulse hidden sm:block"></div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <div className="w-20 h-4 bg-muted rounded mb-1 animate-pulse"></div>
                <div className="w-16 h-3 bg-muted rounded animate-pulse"></div>
              </div>
              <div className="w-16 h-8 bg-muted rounded animate-pulse"></div>
            </div>
          </div>
        </nav>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Header skeleton */}
          <div className="mb-12 flex justify-between items-start gap-4">
            <div>
              <div className="w-48 h-10 bg-muted rounded mb-2 animate-pulse"></div>
              <div className="w-64 h-5 bg-muted rounded animate-pulse"></div>
            </div>
            <div className="w-24 h-10 bg-muted rounded animate-pulse"></div>
          </div>

          {/* Stats skeleton */}
          <DashboardStatsSkeleton />

          {/* Orders skeleton */}
          <Card className="mt-12">
            <CardHeader>
              <div className="w-32 h-6 bg-muted rounded animate-pulse"></div>
              <div className="w-48 h-4 bg-muted rounded animate-pulse"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, index) => (
                  <OrderCardSkeleton key={index} />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
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
              <p className="text-xs text-muted-foreground capitalize">{profile?.user_type}</p>
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
            <p className="text-lg text-muted-foreground">Manage your orders and services</p>
          </div>
          <Button asChild size="lg" className="gap-2">
            <Link href="/browse">
              <Plus className="w-5 h-5" />
              New Order
            </Link>
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">{stats.total}</div>
              <p className="text-xs text-muted-foreground mt-1">All time orders</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">In Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-accent">{stats.pending}</div>
              <p className="text-xs text-muted-foreground mt-1">Active orders</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Completed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{stats.completed}</div>
              <p className="text-xs text-muted-foreground mt-1">Finished orders</p>
            </CardContent>
          </Card>
        </div>

        {/* Orders */}
        <Card>
          <CardHeader>
            <CardTitle>Your Orders</CardTitle>
            <CardDescription>View and manage all your orders</CardDescription>
          </CardHeader>
          <CardContent>
            {orders.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">No orders yet</p>
                <Button asChild>
                  <Link href="/browse">Browse Services</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <Link key={order.id} href={`/orders/${order.id}`}>
                    <div className="p-4 border border-border rounded-lg hover:bg-accent/5 transition-colors cursor-pointer">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h3 className="font-semibold text-foreground">{order.title}</h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            {order.services?.title} • ${order.price}
                          </p>
                          <p className="text-xs text-muted-foreground mt-2">
                            Order placed: {new Date(order.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                              {order.status === 'pending' && <Clock className="w-3 h-3" />}
                              {order.status === 'in_progress' && <Clock className="w-3 h-3" />}
                              {order.status === 'completed' && <CheckCircle2 className="w-3 h-3" />}
                              {order.status === 'cancelled' && <AlertCircle className="w-3 h-3" />}
                              {order.status.replace('_', ' ').charAt(0).toUpperCase() + order.status.replace('_', ' ').slice(1)}
                            </div>
                            {order.delivery_date && (
                              <p className="text-xs text-muted-foreground mt-2">
                                Due: {new Date(order.delivery_date).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
