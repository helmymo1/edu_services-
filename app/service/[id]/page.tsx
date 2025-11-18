'use client';

import { useEffect, useState } from 'react';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import { useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { BookOpen, Star, Clock, ArrowLeft, User } from 'lucide-react';
import { ReviewCardSkeleton } from '@/components/skeleton-loader';
import sampleServices from '@/lib/sample-services';
import { useLanguage } from '@/components/language-provider';

type Service = {
  category: string;
  title: string;
  rating: number;
  total_reviews: number;
  delivery_days: number;
  description: string;
  price: number;
  id: string;
  profiles: Tutor;
};

type Tutor = {
  id: string;
  full_name: string | null;
  bio: string | null;
  avatar_url: string | null;
};

type Review = {
  id: string;
  rating: number;
  created_at: string;
  comment: string;
  profiles: {
    full_name: string | null;
  };
};

type RelatedService = {
  id: string;
  title: string;
  price: number;
  delivery_days: number;
  rating: number;
};

export default function ServiceDetailPage() {
  const params = useParams();
  const serviceId = params.id as string;
  const [service, setService] = useState<Service | null>(null);
  const [tutor, setTutor] = useState<Tutor | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [relatedServices, setRelatedServices] = useState<RelatedService[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const { t } = useLanguage();

  useEffect(() => {
    async function fetchData() {
      const supabase = createClient();

      try {
        // Get current user
        const { data: { user: currentUser } } = await supabase.auth.getUser();
        setUser(currentUser);

        // Fetch service details
        const { data: serviceData, error: serviceError } = await supabase
          .from('services')
          .select('*, profiles(id, full_name, bio, avatar_url)')
          .eq('id', serviceId)
          .single();

        // If service not found in DB, try sampleServices fallback (local preview)
        if (!serviceData) {
          const sample = sampleServices.find((s) => String(s.id) === String(serviceId));
          if (sample) {
            setService(sample);
            setTutor(sample.profiles || null);
          } else if (serviceError) {
            throw serviceError;
          }
        } else {
          setService(serviceData);
          if (serviceData?.profiles) {
            setTutor(serviceData.profiles);
          }
        }

        // Fetch reviews for this service
        const { data: reviewsData, error: reviewsError } = await supabase
          .from('reviews')
          .select('*, profiles(full_name)')
          .eq('service_id', serviceId)
          .order('created_at', { ascending: false })
          .limit(10);

        if (!reviewsError) {
          setReviews(reviewsData || []);
        }

        // Fetch related services (same category, different ID)
        const { data: relatedData, error: relatedError } = await supabase
          .from('services')
          .select('id, title, price, delivery_days, rating, total_reviews, category')
          .eq('category', serviceData?.category)
          .eq('is_active', true)
          .neq('id', serviceId)
          .order('rating', { ascending: false })
          .limit(3);

        if (!relatedError) {
          setRelatedServices(relatedData || []);
        }
      } catch (error) {
        console.error('Error fetching service:', error);
      } finally {
        setIsLoading(false);
        setReviewsLoading(false);
      }
    }

    fetchData();
  }, [serviceId]);

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
          </div>
        </nav>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="w-32 h-10 bg-muted rounded mb-8 animate-pulse"></div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="space-y-4">
                <div className="w-24 h-6 bg-muted rounded animate-pulse"></div>
                <div className="w-3/4 h-10 bg-muted rounded animate-pulse"></div>
                <div className="w-1/2 h-4 bg-muted rounded animate-pulse"></div>
              </div>

              <div className="p-6 border border-border rounded-lg space-y-4">
                <div className="w-32 h-6 bg-muted rounded animate-pulse"></div>
                <div className="space-y-2">
                  <div className="w-full h-4 bg-muted rounded animate-pulse"></div>
                  <div className="w-5/6 h-4 bg-muted rounded animate-pulse"></div>
                  <div className="w-4/5 h-4 bg-muted rounded animate-pulse"></div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="p-6 border border-border rounded-lg space-y-4">
                <div className="w-24 h-8 bg-muted rounded animate-pulse"></div>
                <div className="w-32 h-4 bg-muted rounded animate-pulse"></div>
                <div className="w-full h-10 bg-muted rounded animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
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
        <Link href="/browse" className="flex items-center gap-2 text-primary hover:underline mb-8">
          <ArrowLeft className="w-4 h-4" />
          Back to Services
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <div className="inline-block px-3 py-1 bg-accent/20 text-accent text-sm rounded-full mb-4">
                {service.category.replace(/_/g, ' ')}
              </div>
              <h1 className="text-4xl font-bold text-foreground mb-4">{service.title}</h1>
              
              <div className="flex items-center gap-6 text-sm text-muted-foreground mb-6">
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 fill-accent text-accent" />
                  <span>{service.rating || 0} ({service.total_reviews || 0} reviews)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>{service.delivery_days} days delivery</span>
                </div>
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>About This Service</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-foreground whitespace-pre-wrap">{service.description}</p>
              </CardContent>
            </Card>

            {/* Reviews Section */}
            <Card>
              <CardHeader>
                <CardTitle>Customer Reviews</CardTitle>
                <CardDescription>
                  What students are saying about this service
                </CardDescription>
              </CardHeader>
              <CardContent>
                {reviewsLoading ? (
                  <div className="space-y-4">
                    {Array.from({ length: 3 }).map((_, index) => (
                      <ReviewCardSkeleton key={index} />
                    ))}
                  </div>
                ) : reviews.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No reviews yet</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Be the first to review this service!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {reviews.map((review) => (
                      <div key={review.id} className="border-b border-border pb-4 last:border-b-0">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                              <User className="w-5 h-5 text-muted-foreground" />
                            </div>
                            <div>
                              <p className="font-semibold text-foreground">
                                {review.profiles?.full_name || 'Anonymous'}
                              </p>
                              <div className="flex items-center gap-1 mt-1">
                                {Array.from({ length: 5 }).map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`w-4 h-4 ${
                                      i < review.rating
                                        ? 'fill-accent text-accent'
                                        : 'text-muted-foreground'
                                    }`}
                                  />
                                ))}
                              </div>
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {new Date(review.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        {review.comment && (
                          <p className="mt-3 text-foreground">{review.comment}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Price Card */}
            <Card>
              <CardHeader>
                <div className="text-4xl font-bold text-primary">${service.price}</div>
                <CardDescription>{service.delivery_days} days delivery</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {user ? (
                  <Button asChild className="w-full">
                    <Link href={`/checkout/${service.id}`}>Book Now</Link>
                  </Button>
                ) : (
                  <Button asChild className="w-full">
                    <Link href="/auth/login">Login to Book</Link>
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Tutor Card */}
            {tutor && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">About the Tutor</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="font-semibold text-foreground">{tutor.full_name}</p>
                    <p className="text-sm text-muted-foreground mt-2">{tutor.bio || 'Experienced tutor'}</p>
                  </div>
                  <Button variant="outline" className="w-full">Contact Tutor</Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Related Services Section */}
        {relatedServices.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-foreground mb-6">Related Services</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedServices.map((relatedService) => (
                <Link key={relatedService.id} href={`/service/${relatedService.id}`}>
                  <Card className="h-full hover:border-primary/50 transition-all cursor-pointer hover:shadow-md">
                    <CardHeader>
                      <CardTitle className="text-lg line-clamp-2">{relatedService.title}</CardTitle>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 fill-accent text-accent" />
                          <span>{relatedService.rating || 0}</span>
                        </div>
                        <span>•</span>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>{relatedService.delivery_days}d</span>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="text-right">
                        <div className="font-bold text-primary">${relatedService.price}</div>
                      </div>
                      <Button className="w-full" variant="outline">
                        View Details
                      </Button>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
