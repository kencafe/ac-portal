import React from 'react';
import Link from 'next/link';
import AircraftCarrierLogo from './AircraftCarrierLogo';

interface FooterProps {
  className?: string;
}

export function Footer({ className = '' }: FooterProps) {
  return (
    <footer className={`bg-gray-900 text-white ${className}`}>
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1">
            <div className="mb-4">
              <AircraftCarrierLogo 
                size="md" 
                className="text-blue-400" 
                textClassName="text-xl font-bold text-white"
              />
            </div>
            <p className="text-gray-400 text-sm">
              Chuyên gia Cloud & Platform Engineering với kinh nghiệm thực tế từ môi trường production.
            </p>
          </div>

          {/* Services */}
          <div>
            <h3 className="font-semibold mb-4">Services</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link href="/services/consulting" className="hover:text-white transition-colors">Cloud Consulting</Link></li>
              <li><Link href="/services/implementation" className="hover:text-white transition-colors">Implementation</Link></li>
              <li><Link href="/services/operations" className="hover:text-white transition-colors">Managed Services</Link></li>
              <li><Link href="/services/security" className="hover:text-white transition-colors">Cloud Security</Link></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="font-semibold mb-4">Resources</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link href="/blog" className="hover:text-white transition-colors">Technical Blog</Link></li>
              <li><Link href="/blog/categories/devops" className="hover:text-white transition-colors">DevOps Insights</Link></li>
              <li><Link href="/blog/categories/sre" className="hover:text-white transition-colors">SRE Practices</Link></li>
              <li><Link href="/blog/categories/security" className="hover:text-white transition-colors">Security</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold mb-4">Contact</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <a href="mailto:architects@ac-portal.com" className="hover:text-white transition-colors">
                  architects@ac-portal.com
                </a>
              </li>
              <li>Enterprise Support</li>
              <li>8x5 / 24x7 Available</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
          <p>&copy; 2024 AC Portal. Built for engineers, by engineers.</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;