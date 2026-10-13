import React from 'react';
import { Link } from 'react-router-dom';
import {
  Bus,
  MapPin,
  Clock,
  Shield,
  Users,
  GraduationCap,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  QrCode,
  Navigation,
  Bell,
  ChevronRight,
  Compass,
  PhoneCall,
  Activity,
  Layers,
  Map,
  AlertTriangle,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/services/api';

const features = [
  {
    icon: Bus,
    tag: 'Fleet Directory',
    title: 'Scheduled Route Mapping',
    description: 'Interactive route directories and stop coordinates across campus corridors. Vehicle live GPS tracking is pending hardware installation.',
    link: '/buses',
    linkText: 'Explore fleet',
  },
  {
    icon: MapPin,
    tag: 'Network Coverage',
    title: 'Smart Route Planning',
    description: 'Structured transit network covering 6 city zones with 69 scheduled route runs and 389 verified boarding points.',
    link: '/routes',
    linkText: 'View routes',
  },
  {
    icon: Clock,
    tag: 'Dual Shifts',
    title: 'Morning & Evening Schedules',
    description: 'Independent morning inbound (Home → Campus) and evening outbound (Campus → Home) timetables with stop-by-stop timings.',
    link: '/timings',
    linkText: 'Check schedules',
  },
  {
    icon: Shield,
    tag: 'Campus Safety',
    title: 'Emergency SOS & Alerts',
    description: 'Connected emergency SOS logging with category tagging, transport coordinator response, and live disruption notices.',
    link: '/register/student',
    linkText: 'Safety features',
  },
  {
    icon: Users,
    tag: 'Role Portals',
    title: 'Student & Faculty Dashboards',
    description: 'Dedicated access: students manage boarding points and bus passes; faculty and transport coordinators oversee operations.',
    link: '/login',
    linkText: 'Sign in to portal',
  },
  {
    icon: GraduationCap,
    tag: 'Pass Verification',
    title: 'Digital Bus Pass & QR Vehicle Scanner',
    description: 'Mobile camera QR scanner to verify official university buses, plus student pass document uploads for coordinator review.',
    link: '/scan',
    linkText: 'Scan bus QR',
  },
];

// Authoritative zone data matching backend transport_data.json
const coverageZones = [
  {
    code: 'DSNR',
    name: 'Dilsukhnagar & LB Nagar Zone',
    routes: 24,
    buses: 24,
    stops: 114,
    corridors: 'Dilsukhnagar, LB Nagar, Kothapet, Saroornagar, Karmanghat',
  },
  {
    code: 'RAM',
    name: 'Ramanthapur Zone',
    routes: 9,
    buses: 9,
    stops: 73,
    corridors: 'Ramanthapur, Amberpet, Kachiguda, Liberty, Nallakunta',
  },
  {
    code: 'UPL',
    name: 'Uppal Zone',
    routes: 8,
    buses: 8,
    stops: 34,
    corridors: 'Uppal Ring Road, Boduppal, Medipally, Peerzadiguda, Chengicherla',
  },
  {
    code: 'SEC',
    name: 'Secunderabad Zone',
    routes: 7,
    buses: 6,
    stops: 49,
    corridors: 'Secunderabad JBS, Clock Tower, Tarnaka, Habsiguda, Malkajgiri',
  },
  {
    code: 'ECIL',
    name: 'ECIL Zone',
    routes: 19,
    buses: 18,
    stops: 108,
    corridors: 'ECIL X Roads, Kushaiguda, Sainikpuri, Moula-Ali, AS Rao Nagar',
  },
  {
    code: 'BHON',
    name: 'Bhongir Zone',
    routes: 2,
    buses: 2,
    stops: 11,
    corridors: 'Bhongir Town, Alair, Bibinagar, Ghatkesar Highway',
  },
];

const steps = [
  {
    step: '01',
    title: 'Register Your Account',
    description: 'Sign up with your university student roll number or faculty employee ID for instant verification.',
  },
  {
    step: '02',
    title: 'Select Zone & Boarding Point',
    description: 'Browse the 6 transit zones to select your nearest morning pickup and evening drop-off stops.',
  },
  {
    step: '03',
    title: 'Review Schedule & Verify Bus',
    description: 'Check assigned morning and evening timetables, and use the mobile QR scanner to authenticate official university buses.',
  },
];

export function HomePage() {
  const { data: liveStats, isLoading: statsLoading, isError: statsError } = useQuery({
    queryKey: ['public-transit-stats'],
    queryFn: async () => {
      const [zones, buses, routes] = await Promise.all([
        api.getZones().catch(() => null),
        api.getBuses().catch(() => null),
        api.getRoutes().catch(() => null),
      ]);
      const zoneCount = Array.isArray(zones) && zones.length > 0 ? zones.length : 6;
      const busCount = Array.isArray(buses) && buses.length > 0 ? buses.length : 67;
      const routeCount = Array.isArray(routes) && routes.length > 0 ? routes.length : 69;
      return [
        { value: `${zoneCount}`, label: 'Transit Zones', detail: 'Greater Hyderabad Corridors', icon: MapPin },
        { value: `${busCount}`, label: 'Registered Buses', detail: 'Authorized campus fleet', icon: Bus },
        { value: '389', label: 'Scheduled Stops', detail: 'Verified boarding points', icon: Compass },
        { value: `${routeCount}`, label: 'Daily Route Runs', detail: 'Dual-shift morning & evening', icon: Clock },
      ];
    },
    staleTime: 1000 * 60 * 10,
  });

  const displayStats = liveStats || [
    { value: '6', label: 'Transit Zones', detail: 'Greater Hyderabad Corridors', icon: MapPin },
    { value: '67', label: 'Registered Buses', detail: 'Authorized campus fleet', icon: Bus },
    { value: '389', label: 'Scheduled Stops', detail: 'Verified boarding points', icon: Compass },
    { value: '69', label: 'Daily Route Runs', detail: 'Dual-shift morning & evening', icon: Clock },
  ];

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-[#121214] text-stone-900 dark:text-[#F4F4F6] transition-colors">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-8 pb-20 lg:pt-16 lg:pb-32 bg-gradient-to-b from-stone-100/80 via-stone-50 to-stone-100 dark:from-[#0E0E10] dark:via-[#121214] dark:to-[#18181B] border-b border-stone-200/70 dark:border-stone-800/80">
        {/* Subtle Decorative Ambient Glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-terracotta-500/10 dark:bg-terracotta-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-10 right-10 w-72 h-72 bg-amber-500/5 dark:bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="container-app relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            
            {/* Hero Left: Headline, Value Proposition, Action CTAs */}
            <div className="lg:col-span-7 text-center lg:text-left">
              {/* Official AU Badge */}
              <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-terracotta-100/70 dark:bg-terracotta-950/60 text-terracotta-700 dark:text-terracotta-300 text-xs sm:text-sm font-medium mb-6 border border-terracotta-200/80 dark:border-terracotta-800/80 shadow-sm">
                <span className="relative flex h-2 w-2">
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
                </span>
                <span className="font-semibold tracking-wide uppercase text-[11px] sm:text-xs text-terracotta-800 dark:text-terracotta-200">
                  Anurag University Transit
                </span>
                <span className="text-stone-300 dark:text-stone-700">•</span>
                <span>Scheduled Fleet Directory</span>
              </div>

              {/* Main Headline */}
              <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-extrabold text-charcoal-500 dark:text-[#F4F4F6] tracking-tight leading-[1.12] mb-6">
                Intelligent Campus{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-terracotta-500 via-terracotta-600 to-amber-600 dark:from-terracotta-400 dark:to-amber-400">
                  Transportation
                </span>{' '}
                for Anurag University
              </h1>

              {/* Subtitle */}
              <p className="text-base sm:text-lg lg:text-xl text-stone-600 dark:text-stone-300 mb-8 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                Official scheduled routes across 6 Hyderabad transit zones, digital bus pass verification, emergency SOS alerts, and campus fleet directories — all unified in one portal.
              </p>

              {/* Action Buttons Cluster */}
              <div className="flex flex-col sm:flex-row flex-wrap items-center justify-center lg:justify-start gap-3.5 mb-10">
                <Link to="/register/student" className="w-full sm:w-auto">
                  <Button
                    size="lg"
                    className="w-full sm:w-auto shadow-md hover:shadow-lg transition-all gap-2"
                    rightIcon={<ArrowRight className="h-4 w-4" />}
                  >
                    Get Started as Student
                  </Button>
                </Link>

                <Link to="/register/teacher" className="w-full sm:w-auto">
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full sm:w-auto"
                    leftIcon={<Users className="h-4 w-4 text-terracotta-500" />}
                  >
                    Teacher Registration
                  </Button>
                </Link>

                <Link to="/scan" className="w-full sm:w-auto">
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full sm:w-auto border-terracotta-500 text-terracotta-600 hover:bg-terracotta-50 dark:text-terracotta-400 dark:border-terracotta-700 dark:hover:bg-terracotta-950/40"
                    leftIcon={<QrCode className="h-4 w-4 text-terracotta-500" />}
                  >
                    Scan Bus QR
                  </Button>
                </Link>

                <Link to="/login" className="w-full sm:w-auto">
                  <Button variant="ghost" size="lg" className="w-full sm:w-auto">
                    Sign In
                  </Button>
                </Link>
              </div>

              {/* Key Platform Badges */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-y-2 gap-x-6 text-xs text-stone-500 dark:text-stone-400 font-medium">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  <span>6 Official Transit Zones</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  <span>389 Verified Stops</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  <span>Digital Pass &amp; Bus QR Scanner</span>
                </div>
              </div>
            </div>

            {/* Hero Right: Honest Scheduled Route Directory Card */}
            <div className="lg:col-span-5">
              <div className="relative mx-auto max-w-md lg:max-w-none">
                {/* Visual Card Wrapper with Glassmorphism */}
                <div className="rounded-2xl p-6 bg-white/90 dark:bg-[#18181B]/95 border border-stone-200 dark:border-stone-800 shadow-xl backdrop-blur-md transition-all duration-300 hover:shadow-2xl">
                  
                  {/* Card Header: Scheduled Route & Status */}
                  <div className="flex items-center justify-between pb-4 border-b border-stone-100 dark:border-stone-800">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-terracotta-500 text-white flex items-center justify-center shadow-sm">
                        <Bus className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-heading font-bold text-charcoal-500 dark:text-stone-100 text-base">Route R-11</span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60">
                            Live tracking not connected
                          </span>
                        </div>
                        <p className="text-xs text-stone-500 dark:text-stone-400">DSNR Zone • Saroornagar Corridor</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      <div className="flex items-center gap-1 text-[11px] font-medium text-amber-600 dark:text-amber-400">
                        <AlertTriangle className="h-3 w-3" />
                        <span>Telemetry Inactive</span>
                      </div>
                      <span className="text-[10px] text-stone-400">Schedule Active</span>
                    </div>
                  </div>

                  {/* Scheduled Route Parameters Row */}
                  <div className="grid grid-cols-3 gap-2 py-4 my-2 text-center bg-stone-50 dark:bg-[#121214] rounded-xl border border-stone-100 dark:border-stone-800/60">
                    <div className="px-2">
                      <p className="text-[11px] text-stone-500 dark:text-stone-400">Shift</p>
                      <p className="font-heading font-bold text-xs sm:text-sm text-charcoal-500 dark:text-stone-200">Morning</p>
                    </div>
                    <div className="px-2 border-x border-stone-200/70 dark:border-stone-800">
                      <p className="text-[11px] text-stone-500 dark:text-stone-400">Timetable</p>
                      <p className="font-heading font-bold text-xs sm:text-sm text-terracotta-600 dark:text-terracotta-400">07:35 - 08:40</p>
                    </div>
                    <div className="px-2">
                      <p className="text-[11px] text-stone-500 dark:text-stone-400">Assigned Bus</p>
                      <p className="font-heading font-bold text-xs sm:text-sm text-charcoal-500 dark:text-stone-200">TS08U7726</p>
                    </div>
                  </div>

                  {/* Route Stop Overview */}
                  <div className="py-2 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-stone-500 dark:text-stone-400 flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5 text-stone-400" />
                        <span>Saroornagar Post Office</span>
                      </span>
                      <span className="font-semibold text-terracotta-600 dark:text-terracotta-400 flex items-center gap-1">
                        <Navigation className="h-3.5 w-3.5" />
                        <span>College Campus</span>
                      </span>
                    </div>

                    <div className="p-2.5 rounded-lg bg-stone-100/70 dark:bg-[#151518] border border-stone-200/70 dark:border-stone-800/70 text-[11px] text-stone-600 dark:text-stone-400 leading-relaxed">
                      Vehicle GPS tracking is pending onboard OBD-II hardware integration. Official timetables and verified stop coordinates are operational.
                    </div>
                  </div>

                  {/* Quick Transit Direct Links Inside Card */}
                  <div className="mt-4 pt-3 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between text-xs">
                    <Link to="/routes" className="text-terracotta-600 dark:text-terracotta-400 hover:underline font-medium inline-flex items-center gap-1">
                      <span>Browse Verified Routes</span>
                      <ChevronRight className="h-3.5 w-3.5" />
                    </Link>
                    <Link to="/timings" className="text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200 font-medium">
                      Morning &amp; Evening Shifts
                    </Link>
                  </div>
                </div>

                {/* Floating Micro-Badge */}
                <div className="absolute -bottom-3 -right-2 bg-charcoal-500 text-stone-50 dark:bg-stone-100 dark:text-charcoal-500 px-3 py-1.5 rounded-lg text-xs font-semibold shadow-lg flex items-center gap-1.5 border border-white/20 dark:border-black/10">
                  <Activity className="h-3.5 w-3.5 text-terracotta-400 dark:text-terracotta-600" />
                  <span>6 Transit Zones Active</span>
                </div>
              </div>
            </div>

          </div>

          {/* Dynamic Metrics Bar */}
          <div className="mt-16 sm:mt-20 grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {displayStats.map((stat) => (
              <div
                key={stat.label}
                className="group p-5 sm:p-6 rounded-xl bg-white/70 dark:bg-[#18181B]/70 border border-stone-200/80 dark:border-stone-800 backdrop-blur-sm shadow-sm hover:shadow-md hover:border-terracotta-300 dark:hover:border-terracotta-800/80 transition-all duration-200"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="h-10 w-10 rounded-lg bg-terracotta-50 dark:bg-terracotta-950/60 flex items-center justify-center text-terracotta-600 dark:text-terracotta-400 group-hover:bg-terracotta-500 group-hover:text-white transition-colors duration-200">
                    <stat.icon className="h-5 w-5" />
                  </div>
                  {statsLoading ? (
                    <Loader2 className="h-3 w-3 animate-spin text-terracotta-500" />
                  ) : (
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-400 dark:text-stone-500">Official</span>
                  )}
                </div>
                <div className="font-heading text-3xl sm:text-4xl font-extrabold text-charcoal-500 dark:text-[#F1F5F9]">
                  {stat.value}
                </div>
                <div className="text-sm font-semibold text-stone-800 dark:text-stone-200 mt-1">
                  {stat.label}
                </div>
                <div className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                  {stat.detail}
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* Feature Showcase (Bento Grid) */}
      <section className="py-20 lg:py-28 bg-stone-50 dark:bg-[#121214] border-b border-stone-200/60 dark:border-stone-800">
        <div className="container-app">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 text-xs font-semibold uppercase tracking-wider mb-4 border border-stone-200 dark:border-stone-700">
              <Sparkles className="h-3.5 w-3.5 text-terracotta-500" />
              <span>Full Mobility Stack</span>
            </div>
            <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-charcoal-500 dark:text-[#F4F4F6] mb-4">
              Everything You Need for a{' '}
              <span className="text-terracotta-500">Reliable Commute</span>
            </h2>
            <p className="text-base sm:text-lg text-stone-600 dark:text-stone-400 leading-relaxed">
              Engineered to eliminate uncertainty for Anurag University students, faculty members, and campus transport dispatchers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <Card
                key={feature.title}
                className="group flex flex-col justify-between p-6 sm:p-7 rounded-2xl bg-white dark:bg-[#18181B] border border-stone-200 dark:border-stone-800 hover:border-terracotta-300 dark:hover:border-terracotta-700/60 hover:shadow-lg transition-all duration-300"
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div className="w-12 h-12 rounded-xl bg-terracotta-50 dark:bg-terracotta-950/60 border border-terracotta-100 dark:border-terracotta-900/40 flex items-center justify-center text-terracotta-600 dark:text-terracotta-400 group-hover:scale-105 transition-transform duration-200">
                      <feature.icon className="h-6 w-6" />
                    </div>
                    <span className="text-[11px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300">
                      {feature.tag}
                    </span>
                  </div>

                  <h3 className="font-heading text-xl font-bold text-charcoal-500 dark:text-[#F4F4F6] mb-2.5 group-hover:text-terracotta-600 dark:group-hover:text-terracotta-400 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-stone-600 dark:text-stone-400 leading-relaxed mb-6">
                    {feature.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-stone-100 dark:border-stone-800/80">
                  <Link
                    to={feature.link}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-terracotta-600 dark:text-terracotta-400 hover:text-terracotta-700 dark:hover:text-terracotta-300 group-hover:translate-x-0.5 transition-all"
                  >
                    <span>{feature.linkText}</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </Card>
            ))}
          </div>

        </div>
      </section>

      {/* 6-Zone Transit Coverage Explorer */}
      <section className="py-20 lg:py-28 bg-stone-100/60 dark:bg-[#101012] border-b border-stone-200/60 dark:border-stone-800">
        <div className="container-app">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-14 gap-6">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-terracotta-100/80 dark:bg-terracotta-950/60 text-terracotta-700 dark:text-terracotta-300 text-xs font-semibold uppercase tracking-wider mb-3">
                <Map className="h-3.5 w-3.5" />
                <span>Greater Hyderabad &amp; Surrounds</span>
              </div>
              <h2 className="font-heading text-3xl sm:text-4xl font-bold text-charcoal-500 dark:text-[#F4F4F6]">
                Serving <span className="text-terracotta-500">6 Strategic Transit Zones</span>
              </h2>
              <p className="text-sm sm:text-base text-stone-600 dark:text-stone-400 mt-2">
                Authoritative coverage linking every campus corridor to Anurag University through 69 scheduled route runs and 389 stops.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Link to="/routes">
                <Button variant="outline" size="md" rightIcon={<ArrowRight className="h-4 w-4" />}>
                  Explore All Routes
                </Button>
              </Link>
              <Link to="/timings">
                <Button variant="ghost" size="md">
                  View Timings
                </Button>
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {coverageZones.map((zone) => (
              <div
                key={zone.code}
                className="group p-5 sm:p-6 rounded-xl bg-white dark:bg-[#18181B] border border-stone-200 dark:border-stone-800 hover:border-terracotta-300 dark:hover:border-terracotta-700 transition-all shadow-sm hover:shadow"
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-heading font-bold text-base text-charcoal-500 dark:text-stone-100">
                    {zone.name}
                  </h3>
                  <span className="p-1 rounded bg-stone-100 dark:bg-stone-800 text-stone-500 dark:text-stone-400 group-hover:text-terracotta-500 transition-colors">
                    <Navigation className="h-3.5 w-3.5" />
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 py-3 my-2 text-center bg-stone-50 dark:bg-[#121214] rounded-lg border border-stone-100 dark:border-stone-800/80">
                  <div>
                    <div className="font-heading font-extrabold text-base text-terracotta-600 dark:text-terracotta-400">{zone.routes}</div>
                    <div className="text-[10px] uppercase font-semibold text-stone-500 dark:text-stone-400">Routes</div>
                  </div>
                  <div className="border-x border-stone-200/70 dark:border-stone-800">
                    <div className="font-heading font-extrabold text-base text-terracotta-600 dark:text-terracotta-400">{zone.buses}</div>
                    <div className="text-[10px] uppercase font-semibold text-stone-500 dark:text-stone-400">Buses</div>
                  </div>
                  <div>
                    <div className="font-heading font-extrabold text-base text-terracotta-600 dark:text-terracotta-400">{zone.stops}</div>
                    <div className="text-[10px] uppercase font-semibold text-stone-500 dark:text-stone-400">Stops</div>
                  </div>
                </div>

                <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-2 leading-relaxed">
                  <span className="font-medium text-stone-700 dark:text-stone-300">Corridors: </span>
                  {zone.corridors}
                </p>

                <div className="mt-4 pt-3 border-t border-stone-100 dark:border-stone-800/70 flex items-center justify-between">
                  <Link
                    to="/routes"
                    className="text-[11px] font-semibold text-terracotta-600 dark:text-terracotta-400 hover:underline inline-flex items-center gap-1"
                  >
                    <span>View zone routes</span>
                    <ChevronRight className="h-3 w-3" />
                  </Link>
                  <span className="text-[10px] font-mono text-stone-400">Zone {zone.code}</span>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* How It Works Workflow */}
      <section className="py-20 lg:py-28 bg-stone-50 dark:bg-[#121214] border-b border-stone-200/60 dark:border-stone-800">
        <div className="container-app">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 text-xs font-semibold uppercase tracking-wider mb-4 border border-stone-200 dark:border-stone-700">
              <Layers className="h-3.5 w-3.5 text-terracotta-500" />
              <span>Easy Onboarding</span>
            </div>
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-charcoal-500 dark:text-[#F4F4F6] mb-4">
              How SmartRoute Works in 3 Steps
            </h2>
            <p className="text-base text-stone-600 dark:text-stone-400">
              From enrollment to your morning boarding point in under two minutes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((item, index) => (
              <div
                key={item.step}
                className="relative p-6 sm:p-8 rounded-2xl bg-white dark:bg-[#18181B] border border-stone-200 dark:border-stone-800 shadow-sm"
              >
                <div className="font-heading font-extrabold text-4xl text-terracotta-500/20 dark:text-terracotta-400/20 mb-4">
                  {item.step}
                </div>
                <h3 className="font-heading text-xl font-bold text-charcoal-500 dark:text-stone-100 mb-2">
                  {item.title}
                </h3>
                <p className="text-sm text-stone-600 dark:text-stone-400 leading-relaxed">
                  {item.description}
                </p>
                {index < 2 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 -translate-y-1/2 z-10 text-stone-300 dark:text-stone-700">
                    <ArrowRight className="h-6 w-6" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Safety & Transit Operations Trust Banner */}
      <section className="py-16 bg-stone-100/70 dark:bg-[#151518] border-b border-stone-200/60 dark:border-stone-800">
        <div className="container-app">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
              <div className="h-12 w-12 rounded-xl bg-terracotta-100 dark:bg-terracotta-950/60 flex items-center justify-center text-terracotta-600 dark:text-terracotta-400 shrink-0">
                <Shield className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-heading font-bold text-base text-charcoal-500 dark:text-stone-100 mb-1">
                  67 Registered Campus Buses
                </h3>
                <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
                  Maintained under strict university transport guidelines with assigned drivers and conductor contacts.
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
              <div className="h-12 w-12 rounded-xl bg-terracotta-100 dark:bg-terracotta-950/60 flex items-center justify-center text-terracotta-600 dark:text-terracotta-400 shrink-0">
                <Bell className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-heading font-bold text-base text-charcoal-500 dark:text-stone-100 mb-1">
                  Real-Time Disruption Alerts
                </h3>
                <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
                  Traffic jams, weather delays, or route diversions are pushed directly to student and teacher dashboards.
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
              <div className="h-12 w-12 rounded-xl bg-terracotta-100 dark:bg-terracotta-950/60 flex items-center justify-center text-terracotta-600 dark:text-terracotta-400 shrink-0">
                <PhoneCall className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-heading font-bold text-base text-charcoal-500 dark:text-stone-100 mb-1">
                  Connected Emergency SOS Desk
                </h3>
                <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
                  Emergency transport helpline, SOS coordination, and campus transit office assistance during all travel hours.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Conversion Call-to-Action Section */}
      <section className="py-20 lg:py-28 bg-stone-50 dark:bg-[#121214]">
        <div className="container-app">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-charcoal-500 via-charcoal-600 to-[#1F1E24] dark:from-[#18181B] dark:via-[#1F1F24] dark:to-[#141416] text-white p-8 sm:p-12 lg:p-16 border border-stone-700/50 shadow-2xl">
            
            {/* Ambient Background Accent */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-terracotta-500/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 max-w-3xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 text-stone-200 text-xs font-semibold uppercase tracking-wider mb-6 border border-white/15">
                <Sparkles className="h-3.5 w-3.5 text-amber-300" />
                <span>Modernize Your Campus Travel</span>
              </div>

              <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight mb-6">
                Ready to Experience Seamless Daily Commute?
              </h2>

              <p className="text-base sm:text-lg text-stone-300 mb-10 max-w-2xl mx-auto leading-relaxed">
                Join thousands of Anurag University students and faculty members who rely on SmartRoute for scheduled routes, digital passes, and worry-free transit.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link to="/register/student" className="w-full sm:w-auto">
                  <Button
                    size="lg"
                    variant="secondary"
                    rightIcon={<ArrowRight className="h-5 w-5" />}
                    className="w-full sm:w-auto shadow-lg"
                  >
                    Register as Student
                  </Button>
                </Link>

                <Link to="/register/teacher" className="w-full sm:w-auto">
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full sm:w-auto border-white/30 text-white hover:bg-white/10 hover:text-white"
                  >
                    Register as Teacher
                  </Button>
                </Link>

                <Link to="/login" className="w-full sm:w-auto">
                  <Button
                    size="lg"
                    variant="ghost"
                    className="w-full sm:w-auto text-stone-200 hover:text-white hover:bg-white/10"
                  >
                    Sign In
                  </Button>
                </Link>
              </div>

              <div className="mt-8 pt-8 border-t border-white/10 flex flex-wrap items-center justify-center gap-6 text-xs text-stone-400">
                <span>✓ 100% Free for Students &amp; Staff</span>
                <span>✓ Instant Account Setup</span>
                <span>✓ 6 Hyderabad Zones Covered</span>
              </div>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
}