"use client";

import Link from 'next/link';
import { useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { ArrowRight, BookOpen, Clock, Shield, Star } from 'lucide-react';
import { useLanguage } from '@/components/language-provider';

export default function HomePage() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { t } = useLanguage();

  useEffect(() => {
    async function checkUser() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setIsLoading(false);
    }
    checkUser();
  }, []);

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
            {!isLoading && user ? (
              <>
                <Button asChild variant="outline">
                  <Link href="/dashboard">{t('nav.dashboard')}</Link>
                </Button>
                <Button variant="ghost" onClick={async () => {
                  const supabase = createClient();
                  await supabase.auth.signOut();
                  window.location.href = '/';
                }}>
                  {t('nav.logout')}
                </Button>
              </>
            ) : !isLoading ? (
              <>
                <Button asChild variant="outline">
                  <Link href="/auth/login">{t('nav.login')}</Link>
                </Button>
                <Button asChild>
                  <Link href="/auth/sign-up">{t('nav.signup')}</Link>
                </Button>
              </>
            ) : null}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-4 text-balance">
                {t('home.title')}
              </h1>
              <p className="text-lg text-muted-foreground text-balance">
                {t('home.subtitle')}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button asChild size="lg" className="w-full sm:w-auto">
                <Link href="/browse">{t('home.explore')} <ArrowRight className="w-4 h-4 ml-2" /></Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="w-full sm:w-auto">
                <Link href="/auth/sign-up">{t('home.becomeTutor')}</Link>
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 pt-8">
              <div>
                <div className="text-2xl sm:text-3xl font-bold text-primary">2,500+</div>
                <p className="text-sm text-muted-foreground">Active Services</p>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-bold text-primary">4.9/5</div>
                <p className="text-sm text-muted-foreground">Avg Rating</p>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-bold text-primary">24h</div>
                <p className="text-sm text-muted-foreground">Fast Delivery</p>
              </div>
            </div>
          </div>

          <div className="hidden lg:flex items-center justify-center">
            <div className="relative w-full aspect-square max-w-md">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl blur-3xl"></div>
              <div className="relative bg-card rounded-2xl border border-border p-8 space-y-4 h-full flex flex-col justify-center">
                <div className="space-y-2">
                  <div className="h-12 w-12 bg-primary/20 rounded-lg"></div>
                  <div className="h-4 w-32 bg-primary/20 rounded"></div>
                  <div className="h-3 w-24 bg-primary/10 rounded"></div>
                </div>
                <div className="space-y-2 pt-4">
                  <div className="h-4 w-40 bg-secondary/30 rounded"></div>
                  <div className="h-4 w-36 bg-secondary/30 rounded"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-card border-t border-border py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">Why Choose AcademiaPro?</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              We provide comprehensive academic solutions trusted by thousands of students across Saudi Arabia.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: Clock, title: '24-Hour Delivery', desc: 'Get your work done fast without compromising quality' },
              { icon: Shield, title: 'Verified Tutors', desc: 'All our tutors are vetted experts in their fields' },
              { icon: Star, title: 'Quality Guaranteed', desc: 'Premium work with satisfaction guarantee' },
              { icon: BookOpen, title: 'Wide Range', desc: 'Essays, research papers, tutoring, and more' }
            ].map((feature, i) => (
              <div key={i} className="bg-background rounded-xl border border-border p-6 hover:border-primary/50 transition-colors">
                <feature.icon className="w-8 h-8 text-primary mb-4" />
                <h3 className="font-semibold text-foreground mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 rounded-2xl p-12 text-center space-y-6">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground">Ready to Get Started?</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Join hundreds of successful students and tutors. Sign up today and explore our premium academic services.
          </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button asChild size="lg">
              <Link href="/browse">Browse Services</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/auth/sign-up">Create Account</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="font-semibold text-foreground mb-4">About</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="#" className="hover:text-primary">About Us</Link></li>
                <li><Link href="#" className="hover:text-primary">Blog</Link></li>
                <li><Link href="#" className="hover:text-primary">Careers</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-4">Services</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="#" className="hover:text-primary">Essay Writing</Link></li>
                <li><Link href="#" className="hover:text-primary">Research Papers</Link></li>
                <li><Link href="#" className="hover:text-primary">Tutoring</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-4">Legal</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="#" className="hover:text-primary">Terms</Link></li>
                <li><Link href="#" className="hover:text-primary">Privacy</Link></li>
                <li><Link href="#" className="hover:text-primary">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-4">Support</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="#" className="hover:text-primary">FAQ</Link></li>
                <li><Link href="#" className="hover:text-primary">Help Center</Link></li>
                <li><Link href="#" className="hover:text-primary">Contact Us</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border pt-8">
            <p className="text-center text-sm text-muted-foreground">
              © 2025 AcademiaPro. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
