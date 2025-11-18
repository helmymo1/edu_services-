'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { BookOpen, Search, Star, Clock } from 'lucide-react';
import { ServiceCardSkeleton } from '@/components/skeleton-loader';
import sampleServices from '@/lib/sample-services';
import { useLanguage } from '@/components/language-provider';

type Service = {
  id: string;
  title: string;
  description: string;
  price: number;
  delivery_days: number;
  category: string;
  rating: number;
  total_reviews: number;
  image_url: string;
  tutor_id: string;
  profiles: {
    full_name: string | null;
  };
};

export default function BrowseServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { value: 'all', label: 'All Services' },
    { value: 'essay_writing', label: 'Essay Writing' },
    { value: 'research_paper', label: 'Research Papers' },
    { value: 'homework', label: 'Homework Help' },
    { value: 'tutoring', label: 'Tutoring' },
    { value: 'exam_prep', label: 'Exam Prep' },
    { value: 'editing', label: 'Editing' },
  ];

  useEffect(() => {
    async function fetchServices() {
      const supabase = createClient();
      try {
        let query = supabase
          .from('services')
          .select('id, title, description, price, delivery_days, category, rating, total_reviews, image_url, tutor_id, profiles(full_name)')
          .eq('is_active', true);

        if (selectedCategory !== 'all') {
          query = query.eq('category', selectedCategory);
        }

        const { data, error } = await query;
        if (error) throw error;
  setServices((data && data.length > 0) ? data : sampleServices);
      } catch (error: unknown) {
        // Log detailed error information for easier debugging (handles non-enumerable properties)
        try {
          const detailed = JSON.stringify(error, Object.getOwnPropertyNames(error as object), 2);
          console.error('Error fetching services (detailed):', detailed);
        } catch {
          console.error('Error fetching services:', error);
        }
        // Fallback to sample services so the UI remains usable when the API fails
        setServices(sampleServices);
      } finally {
        setIsLoading(false);
      }
    }

    fetchServices();
  }, [selectedCategory]);

  const filteredServices = services.filter(
    (service) =>
      service.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const { t } = useLanguage();

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
            <Button asChild variant="outline" size="sm">
              <Link href="/dashboard">Dashboard</Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Search and Filters */}
        <div className="mb-12 space-y-6">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">{t('browse.heading')}</h1>
            <p className="text-lg text-muted-foreground">{t('browse.subheading')}</p>
          </div>

          <div className="flex items-center gap-2 bg-card border border-border rounded-lg px-4 py-2">
            <Search className="w-5 h-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder={t('browse.searchPlaceholder')}
              className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <Button
                key={cat.value}
                variant={selectedCategory === cat.value ? 'default' : 'outline'}
                onClick={() => setSelectedCategory(cat.value)}
                size="sm"
              >
                {cat.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Services Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, index) => (
              <ServiceCardSkeleton key={index} />
            ))}
          </div>
        ) : filteredServices.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">{t('browse.noServices')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredServices.map((service) => (
              <Link key={service.id} href={`/service/${service.id}`}>
                <Card className="h-full hover:border-primary/50 transition-all cursor-pointer hover:shadow-md">
                  {service.image_url && (
                    <div className="h-48 bg-gradient-to-br from-primary/10 to-accent/10 overflow-hidden rounded-t-lg">
                      <img src={service.image_url || "/placeholder.svg"} alt={service.title} className="w-full h-full object-cover" />
                    </div>
                  )}
                  <CardHeader>
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex-1">
                        <CardTitle className="text-lg line-clamp-2">{service.title}</CardTitle>
                        <CardDescription className="text-sm">
                          {service.profiles?.full_name || 'Tutor'}
                        </CardDescription>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-primary">${service.price}</div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm text-muted-foreground line-clamp-2">{service.description}</p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-accent text-accent" />
                        <span>{service.rating || 0} ({service.total_reviews || 0})</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{service.delivery_days}d</span>
                      </div>
                    </div>
                    <Button className="w-full mt-4">View Details</Button>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
