'use client';

import { useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { BookOpen, ArrowLeft, Loader2 } from 'lucide-react';
import sampleServices from '@/lib/sample-services';
import { useLanguage } from '@/components/language-provider';

type Service = {
  id: string;
  title: string;
  price: number;
  delivery_days: number;
  tutor_id: string;
};

export default function CheckoutPage() {
  const params = useParams();
  const router = useRouter();
  const serviceId = params.serviceId as string;
  
  const [service, setService] = useState<Service | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [error, setError] = useState<string | null>(null);
  const { t } = useLanguage();

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

        // Fetch service
        const { data: serviceData, error: serviceError } = await supabase
          .from('services')
          .select('*')
          .eq('id', serviceId)
          .single();

        if (!serviceData) {
          const sample = sampleServices.find((s) => String(s.id) === String(serviceId));
          if (sample) {
            setService(sample);
          } else if (serviceError) {
            throw serviceError;
          }
        } else {
          setService(serviceData);
        }
      } catch (error) {
        console.error('Error:', error);
        setError('Failed to load checkout details');
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [serviceId, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !service) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const supabase = createClient();

      // Create order
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert({
          student_id: user.id,
          service_id: service.id,
          tutor_id: service.tutor_id,
          title,
          description,
          price: service.price,
          status: 'pending',
          delivery_date: new Date(Date.now() + service.delivery_days * 24 * 60 * 60 * 1000).toISOString(),
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Create payment record
      const { data: paymentData, error: paymentError } = await supabase
        .from('payments')
        .insert({
          order_id: orderData.id,
          student_id: user.id,
          amount: service.price,
          payment_method: paymentMethod,
          status: 'pending',
        })
        .select()
        .single();

      if (paymentError) throw paymentError;

      // In a real app, integrate with Stripe or payment processor here
      // For now, mark as completed
      await supabase
        .from('payments')
        .update({ status: 'completed' })
        .eq('id', paymentData.id);

      await supabase
        .from('orders')
        .update({ status: 'in_progress' })
        .eq('id', orderData.id);

      router.push(`/orders/${orderData.id}?success=true`);
    } catch (error) {
      console.error('Error:', error);
      setError(error instanceof Error ? error.message : 'Failed to place order');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">{t('browse.heading')}...</p>
      </div>
    );
  }

  if (!service || !user) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <p className="text-muted-foreground">{t('service.notFound')}</p>
          <Button asChild className="mt-4">
            <Link href="/browse">{t('service.backToServices')}</Link>
          </Button>
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
        </div>
      </nav>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link href={`/service/${serviceId}`} className="flex items-center gap-2 text-primary hover:underline mb-8">
          <ArrowLeft className="w-4 h-4" />
          Back to Service
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2">
            <Card>
                <CardHeader>
                <CardTitle>{t('buttons.placeOrder')}</CardTitle>
                <CardDescription>Provide your requirements for this service</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid gap-2">
                    <Label htmlFor="title">Order Title</Label>
                    <Input
                      id="title"
                      placeholder="e.g., English Literature Essay on Shakespeare"
                      required
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="description">Order Description</Label>
                    <textarea
                      id="description"
                      placeholder="Describe your requirements in detail..."
                      className="flex min-h-32 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      required
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    />
                  </div>

                  <div className="border-t border-border pt-6">
                    <h3 className="font-semibold text-foreground mb-4">Payment Method</h3>
                    <div className="space-y-3">
                      <label className="flex items-center gap-3 p-3 border border-input rounded-lg cursor-pointer hover:bg-accent/5">
                        <input
                          type="radio"
                          name="payment"
                          value="card"
                          checked={paymentMethod === 'card'}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                        />
                        <span className="font-medium text-foreground">Credit/Debit Card</span>
                      </label>
                      <label className="flex items-center gap-3 p-3 border border-input rounded-lg cursor-pointer hover:bg-accent/5">
                        <input
                          type="radio"
                          name="payment"
                          value="bank_transfer"
                          checked={paymentMethod === 'bank_transfer'}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                        />
                        <span className="font-medium text-foreground">Bank Transfer</span>
                      </label>
                    </div>
                  </div>

                  {error && <p className="text-sm text-destructive">{error}</p>}

                  <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      t('buttons.placeOrder')
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div>
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle className="text-lg">Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Service</p>
                  <p className="font-semibold text-foreground">{service.title}</p>
                </div>

                <div className="border-t border-border pt-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Price</span>
                    <span className="font-semibold">${service.price}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Delivery</span>
                    <span className="font-semibold">{service.delivery_days} days</span>
                  </div>
                </div>

                <div className="border-t border-border pt-4 flex justify-between items-center">
                  <span className="font-semibold text-foreground">Total</span>
                  <span className="text-2xl font-bold text-primary">${service.price}</span>
                </div>

                <p className="text-xs text-muted-foreground pt-4">
                  By placing this order, you agree to our terms and conditions
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
