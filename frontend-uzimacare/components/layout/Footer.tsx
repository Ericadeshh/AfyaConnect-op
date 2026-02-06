import Link from "next/link";
import { Facebook, Twitter, Linkedin, Mail, Phone, MapPin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main content */}
        <div className="py-16 md:py-20 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-10 lg:gap-12">
          {/* Brand column */}
          <div className="col-span-2 md:col-span-1 lg:col-span-2">
            <Link href="/" className="inline-flex items-center space-x-2 mb-6">
              <span className="text-2xl font-bold tracking-tight">
                <span className="text-primary">UZIMA</span>
                <span className="text-foreground">CARE</span>
              </span>
            </Link>

            <p className="text-muted-foreground leading-relaxed mb-6 max-w-md">
              Secure, real-time digital referral platform empowering healthcare
              facilities across Kenya to deliver faster, safer, and more
              coordinated patient care.
            </p>

            {/* Social icons */}
            <div className="flex items-center gap-5">
              <a
                href="#"
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin className="h-5 w-5" />
              </a>
              <a
                href="mailto:hello@uzimacare.ke"
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="Email"
              >
                <Mail className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Platform links */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground mb-6">
              Platform
            </h3>
            <ul className="space-y-4 text-sm">
              <li>
                <Link
                  href="/#features"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Features
                </Link>
              </li>
              <li>
                <Link
                  href="/#how-it-works"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  How It Works
                </Link>
              </li>
              <li>
                <Link
                  href="/#pricing"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Pricing
                </Link>
              </li>
              <li>
                <Link
                  href="/dashboard"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Dashboard
                </Link>
              </li>
            </ul>
          </div>

          {/* Company links */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground mb-6">
              Company
            </h3>
            <ul className="space-y-4 text-sm">
              <li>
                <Link
                  href="/about"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  href="/partnerships"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Partnerships
                </Link>
              </li>
              <li>
                <Link
                  href="/blog"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Blog
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal & Support */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground mb-6">
              Legal & Support
            </h3>
            <ul className="space-y-4 text-sm">
              <li>
                <Link
                  href="#"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Data Protection
                </Link>
              </li>
              <li>
                <a
                  href="mailto:support@uzimacare.ke"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Support
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t py-8 text-center text-sm text-muted-foreground">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
              © {new Date().getFullYear()} UzimaCare by AfyaConnect. All rights
              reserved.
            </div>

            <div className="flex items-center gap-6">
              <span className="flex items-center gap-2">
                <span className="text-xs font-medium">Built for</span>
                <span className="inline-flex items-center gap-1 text-primary font-medium">
                  Red White & Build Hackathon
                </span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
