import { Link } from 'react-router-dom';
import { Bus, MapPin, Mail, Phone, Github, Twitter, Linkedin } from 'lucide-react';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-charcoal-500 text-stone-100" role="contentinfo">
      <div className="container-app py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          <div className="lg:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4" aria-label="SmartRoute Home">
              <Bus className="h-8 w-8 text-terracotta-400" />
              <span className="font-heading text-xl font-bold text-stone-50">SmartRoute</span>
            </Link>
            <p className="text-stone-400 text-sm leading-relaxed mb-6">
              Intelligent University Transportation Management System for Anurag University.
              Real-time tracking, route optimization, and seamless transport management.
            </p>
            <div className="flex gap-4">
              <a href="https://github.com/Charansingaraju1/SmartRoute" target="_blank" rel="noopener noreferrer" className="text-stone-400 hover:text-stone-100 transition-colors" aria-label="GitHub">
                <Github className="h-5 w-5" />
              </a>
              <a href="#" target="_blank" rel="noopener noreferrer" className="text-stone-400 hover:text-stone-100 transition-colors" aria-label="Twitter">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" target="_blank" rel="noopener noreferrer" className="text-stone-400 hover:text-stone-100 transition-colors" aria-label="LinkedIn">
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="font-heading text-lg font-semibold mb-4">Quick Links</h3>
            <nav aria-label="Quick links">
              <ul className="space-y-2">
                <li><Link to="/buses" className="text-stone-400 hover:text-stone-100 text-sm transition-colors">Bus Information</Link></li>
                <li><Link to="/routes" className="text-stone-400 hover:text-stone-100 text-sm transition-colors">Routes & Zones</Link></li>
                <li><Link to="/timings" className="text-stone-400 hover:text-stone-100 text-sm transition-colors">Timings & Schedule</Link></li>
                <li><Link to="/login" className="text-stone-400 hover:text-stone-100 text-sm transition-colors">Sign In</Link></li>
                <li><Link to="/register/student" className="text-stone-400 hover:text-stone-100 text-sm transition-colors">Student Registration</Link></li>
                <li><Link to="/register/teacher" className="text-stone-400 hover:text-stone-100 text-sm transition-colors">Teacher Registration</Link></li>
              </ul>
            </nav>
          </div>

          <div>
            <h3 className="font-heading text-lg font-semibold mb-4">Student Resources</h3>
            <nav aria-label="Student resources">
              <ul className="space-y-2">
                <li><Link to="/student/dashboard" className="text-stone-400 hover:text-stone-100 text-sm transition-colors">Dashboard</Link></li>
                <li><Link to="/student/my-bus" className="text-stone-400 hover:text-stone-100 text-sm transition-colors">My Bus & Route</Link></li>
                <li><Link to="/student/boarding-point" className="text-stone-400 hover:text-stone-100 text-sm transition-colors">Boarding Point</Link></li>
                <li><Link to="/student/bus-pass" className="text-stone-400 hover:text-stone-100 text-sm transition-colors">Bus Pass</Link></li>
                <li><Link to="/student/payments" className="text-stone-400 hover:text-stone-100 text-sm transition-colors">Payments</Link></li>
                <li><Link to="/student/notifications" className="text-stone-400 hover:text-stone-100 text-sm transition-colors">Notifications</Link></li>
              </ul>
            </nav>
          </div>

          <div>
            <h3 className="font-heading text-lg font-semibold mb-4">Contact & Support</h3>
            <address className="not-italic text-stone-400 text-sm space-y-3">
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 mt-0.5 flex-shrink-0 text-terracotta-400" />
                <p>Anurag University, Venkatapur (V), Ghatkesar (M), Medchal District, Telangana - 500088</p>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 flex-shrink-0 text-terracotta-400" />
                <a href="mailto:transport@anuraguniversity.edu.in" className="hover:text-stone-100 transition-colors">transport@anuraguniversity.edu.in</a>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 flex-shrink-0 text-terracotta-400" />
                <a href="tel:+914012345678" className="hover:text-stone-100 transition-colors">+91 40 1234 5678</a>
              </div>
            </address>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-charcoal-400">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-stone-500 text-sm">
              © {currentYear} Anurag University. All rights reserved.
            </p>
            <div className="flex items-center gap-6 text-sm text-stone-500">
              <Link to="/privacy" className="hover:text-stone-100 transition-colors">Privacy Policy</Link>
              <Link to="/terms" className="hover:text-stone-100 transition-colors">Terms of Service</Link>
              <Link to="/accessibility" className="hover:text-stone-100 transition-colors">Accessibility</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}