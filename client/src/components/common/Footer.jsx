import React from 'react';
import { Link } from 'react-router-dom';
import { Github, Mail, ShieldAlert, Award, Sparkles, Heart } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-slate-950 border-t border-slate-800/80 pt-16 pb-12 text-slate-400 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-800/80">
          {/* Brand & Developer accreditation */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center font-bold text-white text-base">
                N
              </div>
              <span className="font-display font-bold text-xl text-white tracking-tight">NEXORA</span>
            </Link>
            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed max-w-sm">
              Discover More. Shop Smarter. A modern full-stack e-commerce web platform engineered for seamless browsing, cart management, inventory-verified demo checkout, and order fulfillment tracking.
            </p>
            <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1.5 text-xs">
              <div className="flex items-center gap-2 text-brand-300 font-semibold">
                <Award className="w-4 h-4 text-brand-400" />
                <span>Thiranex Full-Stack Internship — Task 3</span>
              </div>
              <p className="text-slate-300">
                <strong className="text-white">Developer:</strong> Alok Kumar Vishwas
              </p>
              <p className="text-slate-400">
                B.Tech 2nd Year, CSE • GL Bajaj Institute of Technology & Management, Greater Noida
              </p>
              <div className="flex items-center gap-3 pt-1 text-slate-400">
                <a
                  href="https://github.com/alok0204/ecommerce-web-app"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 hover:text-white transition-colors"
                >
                  <Github className="w-3.5 h-3.5" />
                  <span>GitHub: alok0204</span>
                </a>
                <span>•</span>
                <a
                  href="mailto:alokvishwas786@gmail.com"
                  className="flex items-center gap-1 hover:text-white transition-colors"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Contact</span>
                </a>
              </div>
            </div>
          </div>

          {/* Categories */}
          <div>
            <h4 className="font-semibold text-white mb-4 text-xs tracking-wider uppercase">Shop Categories</h4>
            <ul className="space-y-2.5 text-xs sm:text-sm">
              <li>
                <Link to="/catalog?category=electronics" className="hover:text-brand-300 transition-colors">
                  Electronics & Gadgets
                </Link>
              </li>
              <li>
                <Link to="/catalog?category=audio-wearables" className="hover:text-brand-300 transition-colors">
                  Audio & Wearables
                </Link>
              </li>
              <li>
                <Link to="/catalog?category=accessories" className="hover:text-brand-300 transition-colors">
                  Premium Accessories
                </Link>
              </li>
              <li>
                <Link to="/catalog?category=home-living" className="hover:text-brand-300 transition-colors">
                  Smart Home & Living
                </Link>
              </li>
              <li>
                <Link to="/catalog?category=lifestyle-apparel" className="hover:text-brand-300 transition-colors">
                  Modern Lifestyle
                </Link>
              </li>
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-white mb-4 text-xs tracking-wider uppercase">Quick Links</h4>
            <ul className="space-y-2.5 text-xs sm:text-sm">
              <li>
                <Link to="/catalog" className="hover:text-brand-300 transition-colors">
                  All Products
                </Link>
              </li>
              <li>
                <Link to="/cart" className="hover:text-brand-300 transition-colors">
                  Shopping Cart
                </Link>
              </li>
              <li>
                <Link to="/track" className="hover:text-brand-300 transition-colors">
                  Track Order
                </Link>
              </li>
              <li>
                <Link to="/account" className="hover:text-brand-300 transition-colors">
                  My Profile & Orders
                </Link>
              </li>
              <li>
                <Link to="/admin" className="hover:text-brand-300 transition-colors text-brand-400 font-medium">
                  Admin Portal
                </Link>
              </li>
            </ul>
          </div>

          {/* Safety & Compliance notice */}
          <div>
            <h4 className="font-semibold text-white mb-4 text-xs tracking-wider uppercase">Demo Platform</h4>
            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-200/90 text-xs space-y-2">
              <div className="flex items-center gap-1.5 font-semibold text-amber-300">
                <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Simulated Checkout</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                This application is built for academic & internship evaluation. Orders, inventory, and payment tokens are simulated safely. No actual credit card transactions or fees occur.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>
            © {new Date().getFullYear()} NEXORA E-Commerce. Developed with precision by Alok Kumar Vishwas.
          </p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 text-slate-400">
              Built with React, Vite, Tailwind, Express & PostgreSQL
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
