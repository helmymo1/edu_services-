'use client';

import { useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { BookOpen, ArrowLeft, Star, Loader2 } from 'lucide-react';

type Order = {
  tutor_id: string;
};

export default function ReviewPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.orderId as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');

  useEffect(() => {
    async function fetchData() {
      const supabase = createClient();
      
      try {
        const { data: { user: currentUser } } = await supabase.auth.getUser();
        if (!currentUser) {
          router.push('/auth/login');
          return;
        }
        setUser(currentUser);

        const { data: orderData, error: orderError } = await supabase
          .from('orders')
          .select('*')
          .eq('id', orderId)
          .eq('student_id', currentUser.id)
          .single();

        if (orderError) throw orderError;
        setOrder(orderData);
      } catch (error) {
        console.error('Error:', error);
        router.push(`/orders/${orderId}`);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [orderId, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !order) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const supabase = createClient();

      // Create review
      const { error: reviewError } = await supabase
        .from('reviews')
        .insert({
          order_id: orderId,
          student_id: user.id,
          tutor_id: order.tutor_id,
          rating,
          comment: comment || null,
        });

      if (reviewError) throw reviewError;

      // Update service rating
      const { data: reviewsData } = await supabase
        .from('reviews')
        .select('rating')
        .eq('tutor_id', order.tutor_id);

      if (reviewsData && reviewsData.length > 0) {
        const avgRating = reviewsData.reduce((sum, r) => sum + r.rating, 0) / reviewsData.length;
        
        await supabase
          .from('services')
          .update({
            rating: Math.round(avgRating * 10) / 10,
            total_reviews: reviewsData.length,
          })
          .eq('tutor_id', order.tutor_id);
      }

      router.push(`/orders/${orderId}?review=submitted`);
    } catch (error) {
      console.error('Error:', error);
      setError(error instanceof Error ? error.message : 'Failed to submit review');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <p className="text-muted-foreground">Order not found</p>
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
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link href={`/orders/${orderId}`} className="flex items-center gap-2 text-primary hover:underline mb-8">
          <ArrowLeft className="w-4 h-4" />
          Back to Order
        </Link>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Rate Your Experience</CardTitle>
            <CardDescription>Share your feedback about this tutoring service</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-4">
                <Label>Rating</Label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="transition-transform hover:scale-110"
                    >
                      <Star
                        className={`w-12 h-12 ${
                          star <= (hoverRating || rating)
                            ? 'fill-accent text-accent'
                            : 'text-muted-foreground'
                        }`}
                      />
                    </button>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground">
                  {rating === 5 && 'Excellent service!'}
                  {rating === 4 && 'Very good!'}
                  {rating === 3 && 'Good'}
                  {rating === 2 && 'Fair'}
                  {rating === 1 && 'Needs improvement'}
                </p>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="comment">Comments (Optional)</Label>
                <textarea
                  id="comment"
                  placeholder="Share your detailed feedback about the service quality, communication, and delivery..."
                  className="flex min-h-32 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                />
              </div>

              {error && <p className="text-sm text-destructive">{error}</p>}

              <div className="flex gap-4 pt-6 border-t border-border">
                <Button type="submit" className="flex-1" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    'Submit Review'
                  )}
                </Button>
                <Button asChild type="button" variant="outline" className="w-full flex-1">
                  <Link href={`/orders/${orderId}`}>Skip</Link>
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
