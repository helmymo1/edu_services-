'use client';

import { useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { useParams, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { BookOpen, Download, MessageSquare, CheckCircle2 } from 'lucide-react';
import { MessagingPanel } from '@/components/messaging-panel';

export default function OrderDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const orderId = params.orderId as string;
  const isSuccess = searchParams.get('success') === 'true';
  const reviewSubmitted = searchParams.get('review') === 'submitted';

  const [order, setOrder] = useState<any>(null);
  const [tutor, setTutor] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [showMessaging, setShowMessaging] = useState(false);

  useEffect(() => {
    async function fetchData() {
      const supabase = createClient();
      
      try {
        const { data: { user: currentUser } } = await supabase.auth.getUser();
        setUser(currentUser);

        const { data: orderData, error: orderError } = await supabase
          .from('orders')
          .select('*, services(title, category), tutor:profiles(id, full_name, bio)')
          .eq('id', orderId)
          .single();

        if (orderError) throw orderError;
        setOrder(orderData);
        if (orderData?.tutor) {
          setTutor(orderData.tutor);
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [orderId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading order details...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <p className="text-muted-foreground">Order not found</p>
          <Link href="/dashboard">
            <Button asChild className="mt-4">
              <a>Back to Dashboard</a>
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    in_progress: 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
  };

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
        </div>
      </nav>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {isSuccess && (
          <div className="mb-8 p-4 bg-green-50 border border-green-200 rounded-lg flex gap-3">
            <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-green-900">Order Placed Successfully!</h3>
              <p className="text-sm text-green-800">Your order has been confirmed and your tutor will start working on it soon.</p>
            </div>
          </div>
        )}

        {reviewSubmitted && (
          <div className="mb-8 p-4 bg-blue-50 border border-blue-200 rounded-lg flex gap-3">
            <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-blue-900">Thank you for your review!</h3>
              <p className="text-sm text-blue-800">Your feedback has been submitted and will help other students.</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Details */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <CardTitle className="text-2xl">{order.title}</CardTitle>
                    <CardDescription>Order #{orderId.slice(0, 8)}</CardDescription>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColors[order.status]}`}>
                    {order.status.replace('_', ' ').charAt(0).toUpperCase() + order.status.replace('_', ' ').slice(1)}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Description</p>
                  <p className="text-foreground whitespace-pre-wrap">{order.description}</p>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Service Type</p>
                    <p className="font-semibold text-foreground">{order.services?.category.replace(/_/g, ' ')}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Delivery Date</p>
                    <p className="font-semibold text-foreground">
                      {new Date(order.delivery_date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Messages */}
            <Card>
              <CardHeader>
                <CardTitle>Communication</CardTitle>
                <CardDescription>Chat with your tutor about this order</CardDescription>
              </CardHeader>
              <CardContent>
                {user && tutor && (
                  <div className="h-96">
                    <MessagingPanel orderId={orderId} userId={user.id} recipientId={tutor.id} />
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Tutor Info */}
            {tutor && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Your Tutor</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="font-semibold text-foreground">{tutor.full_name}</p>
                    <p className="text-sm text-muted-foreground mt-1">{tutor.bio || 'Professional tutor'}</p>
                  </div>
                  <Button variant="outline" className="w-full">View Profile</Button>
                </CardContent>
              </Card>
            )}

            {/* Order Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Order Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Price</span>
                  <span className="font-semibold">${order.price}</span>
                </div>
                <div className="flex justify-between items-center text-sm border-t border-border pt-3">
                  <span className="text-muted-foreground">Status</span>
                  <span className="font-semibold">{order.status}</span>
                </div>
                {order.file_url && (
                  <Button variant="outline" className="w-full mt-4">
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                )}
                {order.status === 'completed' && (
                  <Link href={`/orders/${orderId}/review`}>
                    <Button asChild className="w-full mt-4">
                      <a>Leave a Review</a>
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>

            <Link href="/dashboard">
              <Button asChild variant="outline" className="w-full">
                <a>Back to Dashboard</a>
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
