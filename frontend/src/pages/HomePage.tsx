import React from 'react';
import { Link } from 'react-router-dom';
import { Bus, MapPin, Clock, Shield, Users, GraduationCap, ArrowRight, CheckCircle, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const features = [
  {
    icon: Bus,
    title: 'Real-time Bus Tracking',
    description: 'Live GPS tracking of university buses with accurate arrival predictions and route progress.',
  },
  {
    icon: MapPin,
    title: 'Smart Route Planning',
    description: 'Optimized routes across 8 zones with 389+ boarding points and 67 buses serving the campus.',
  },
  {
    icon: Clock,
    title: 'Morning & Evening Schedules',
    description: 'Separate morning (Home → College) and evening (College → Home) routes with precise timings.',
  },
  {
    icon: Shield,
    title: 'Safety First',
    description: 'SOS emergency alerts, missed bus assistance, and real-time disruption notifications.',
  },
  {
    icon: Users,
    title: 'Role-based Access',
    description: 'Dedicated dashboards for students and teachers with appropriate permissions and data access.',
  },
  {
    icon: GraduationCap,
    title: 'Bus Pass Management',
    description: 'Digital bus passes with QR codes, OCR verification, and secure payment integration.',
  },
];

const stats = [
  { value: '8', label: 'Zones Covered', icon: MapPin },
  { value: '67', label: 'Active Buses', icon: Bus },
  { value: '389+', label: 'Boarding Points', icon: MapPin },
  { value: '69', label: 'Route Assignments', icon: Clock },
];

export function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-stone-50 to-stone-100 py-20 lg:py-32">
        <div className="container-app">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-terracotta-50 text-terracotta-700 text-sm font-medium mb-6 animate-fade-in">
              <Sparkles className="h-4 w-4" />
              <span>Anurag University Official Transport Portal</span>
            </div>
            <h1 className="font-heading text-4xl lg:text-6xl font-bold text-charcoal-500 tracking-tight mb-6 animate-slide-up">
              Intelligent University{' '}
              <span className="text-terracotta-500">Transportation</span>
            </h1>
            <p className="text-lg lg:text-xl text-stone-600 mb-10 max-w-2xl mx-auto animate-slide-up" style={{ animationDelay: '100ms' }}>
              Real-time bus tracking, optimized routes, digital bus passes, and safety features — 
              all in one platform designed for Anurag University students and staff.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up" style={{ animationDelay: '200ms' }}>
              <Link to="/register/student">
                <Button size="lg" rightIcon={<ArrowRight className="h-5 w-5" />}>
                  Get Started as Student
                </Button>
              </Link>
              <Link to="/register/teacher">
                <Button variant="outline" size="lg">
                  Teacher Registration
                </Button>
              </Link>
              <Link to="/login">
                <Button variant="ghost" size="lg">
                  Sign In
                </Button>
              </Link>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="mt-16 grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 animate-fade-in" style={{ animationDelay: '300ms' }}>
            {stats.map((stat, index) => (
              <div key={stat.label} className="text-center p-6 bg-stone-50/50 rounded-xl border border-stone-200/50 backdrop-blur-sm">
                <div className="flex items-center justify-center gap-2 mb-3">
                  <stat.icon className="h-6 w-6 text-terracotta-500" />
                </div>
                <div className="font-heading text-3xl lg:text-4xl font-bold text-charcoal-500">{stat.value}</div>
                <div className="text-sm text-stone-600 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 lg:py-28 bg-stone-50">
        <div className="container-app">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="font-heading text-3xl lg:text-4xl font-bold text-charcoal-500 mb-4">
              Everything You Need for{' '}
              <span className="text-terracotta-500">Seamless Commute</span>
            </h2>
            <p className="text-lg text-stone-600">
              Comprehensive features built for the real transportation needs of Anurag University.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Card key={feature.title} className="h-full animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
                <div className="w-12 h-12 rounded-xl bg-terracotta-100 flex items-center justify-center mb-4">
                  <feature.icon className="h-6 w-6 text-terracotta-600" />
                </div>
                <h3 className="font-heading text-xl font-semibold text-charcoal-500 mb-2">{feature.title}</h3>
                <p className="text-stone-600 leading-relaxed">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Zones Section */}
      <section className="py-20 lg:py-28 bg-charcoal-500">
        <div className="container-app">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="font-heading text-3xl lg:text-4xl font-bold text-stone-50 mb-4">
              Serving <span className="text-terracotta-400">8 Zones</span> Across the City
            </h2>
            <p className="text-lg text-stone-300">
              Comprehensive coverage ensuring every student has access to reliable transportation.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { name: 'DSNR Zone', routes: 12, buses: 10, stops: 58 },
              { name: 'Ramanthapur Zone', routes: 10, buses: 9, stops: 52 },
              { name: 'Uppal Zone', routes: 11, buses: 8, stops: 55 },
              { name: 'Secunderabad Zone', routes: 9, buses: 8, stops: 48 },
              { name: 'ECIL Zone', routes: 8, buses: 7, stops: 42 },
              { name: 'Bhongir Zone', routes: 7, buses: 6, stops: 38 },
              { name: 'Alwal Zone', routes: 6, buses: 5, stops: 35 },
              { name: 'Medchal Zone', routes: 6, buses: 5, stops: 32 },
            ].map((zone, index) => (
              <Card key={zone.name} variant="outlined" className="bg-charcoal-400/50 border-charcoal-300 text-stone-50">
                <h3 className="font-heading text-lg font-semibold mb-2">{zone.name}</h3>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="font-heading text-2xl font-bold text-terracotta-400">{zone.routes}</div>
                    <div className="text-xs text-stone-400">Routes</div>
                  </div>
                  <div>
                    <div className="font-heading text-2xl font-bold text-terracotta-400">{zone.buses}</div>
                    <div className="text-xs text-stone-400">Buses</div>
                  </div>
                  <div>
                    <div className="font-heading text-2xl font-bold text-terracotta-400">{zone.stops}</div>
                    <div className="text-xs text-stone-400">Stops</div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 lg:py-28 bg-stone-50">
        <div className="container-app">
          <Card className="max-w-3xl mx-auto bg-gradient-to-r from-charcoal-500 to-charcoal-400 text-stone-50">
            <div className="text-center">
              <h2 className="font-heading text-3xl lg:text-4xl font-bold mb-4">
                Ready to Transform Your Commute?
              </h2>
              <p className="text-lg text-stone-300 mb-8 max-w-xl mx-auto">
                Join thousands of students and teachers using SmartRoute for reliable, safe, and intelligent university transportation.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link to="/register/student">
                  <Button size="lg" variant="secondary" rightIcon={<ArrowRight className="h-5 w-5" />} className="w-full sm:w-auto">
                    Register as Student
                  </Button>
                </Link>
                <Link to="/register/teacher">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto border-stone-300 text-stone-50 hover:bg-stone-100">
                    Register as Teacher
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
}