// app/page.tsx
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  ArrowRight,
  ShieldCheck,
  Clock,
  FileText,
  Smartphone,
  CheckCircle2,
  Building2,
  Users,
  HeartHandshake,
} from "lucide-react";
import Newsletter from "@/components/layout/Newsletter";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-linear-to-br from-primary/10 via-background to-accent/10 pt-20 pb-32 md:pt-32 md:pb-48 overflow-hidden">
        <div className="absolute inset-0 bg-grid-slate-900/[0.04] dark:bg-grid-slate-100/[0.02]" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
              Digital Referrals.{" "}
              <span className="text-primary">Faster Care.</span> Better
              Outcomes.
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-10 max-w-3xl mx-auto">
              Eliminate paper-based delays. Track referrals in real-time. Ensure
              continuity of care across Kenyan facilities.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/dashboard">
                <Button
                  size="lg"
                  className="bg-primary hover:bg-primary/90 text-lg px-8"
                >
                  Get Started <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/about">
                <Button size="lg" variant="outline" className="text-lg px-8">
                  Learn More
                </Button>
              </Link>
            </div>

            <p className="mt-6 text-sm text-muted-foreground">
              Built for physicians, administrators, and healthcare facilities •
              Powered by secure Kenyan digital infrastructure
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 md:py-32 bg-muted/20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Why UzimaCare?
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Solving real problems in Kenya's referral system with modern,
              accessible technology.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
            <Card className="border-none shadow-lg hover:shadow-xl transition-all duration-300 p-8 text-center">
              <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-6">
                <Clock className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Faster Referrals</h3>
              <p className="text-muted-foreground text-lg leading-relaxed">
                Replace paper with instant digital referrals — reduce wait from
                days to minutes.
              </p>
            </Card>

            <Card className="border-none shadow-lg hover:shadow-xl transition-all duration-300 p-8 text-center">
              <div className="w-16 h-16 mx-auto rounded-full bg-accent/10 flex items-center justify-center mb-6">
                <ShieldCheck className="h-8 w-8 text-accent" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Secure & Compliant</h3>
              <p className="text-muted-foreground text-lg leading-relaxed">
                End-to-end encryption. Compliant with Kenyan health data
                regulations.
              </p>
            </Card>

            <Card className="border-none shadow-lg hover:shadow-xl transition-all duration-300 p-8 text-center">
              <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-6">
                <Smartphone className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Mobile-First</h3>
              <p className="text-muted-foreground text-lg leading-relaxed">
                Works on any device. STK push payments. USSD fallback for
                low-connectivity areas.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section
        id="how-it-works"
        className="py-20 md:py-32 bg-linear-to-b from-background to-muted/10"
      >
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              How It Works
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Simple, secure, and efficient workflow from referral creation to
              patient arrival.
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8 lg:gap-12 max-w-6xl mx-auto">
            {[
              {
                step: "1",
                title: "Physician Creates Referral",
                desc: "Enter patient details, history, diagnosis.",
                icon: FileText,
              },
              {
                step: "2",
                title: "Admin Reviews & Books",
                desc: "Add biodata, book slot, send STK prompt.",
                icon: Clock,
              },
              {
                step: "3",
                title: "Patient Pays & Confirms",
                desc: "Receive M-Pesa push. Payment confirms instantly.",
                icon: Smartphone,
              },
              {
                step: "4",
                title: "Seamless Care Delivery",
                desc: "Patient arrives with full digital record.",
                icon: ShieldCheck,
              },
            ].map((item, i) => (
              <div key={i} className="relative">
                <Card className="border-none shadow-lg hover:shadow-xl transition-all duration-300 p-6 h-full flex flex-col items-center text-center">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4 text-primary font-bold text-xl">
                    {item.step}
                  </div>
                  <item.icon className="h-10 w-10 text-primary mb-4" />
                  <h3 className="text-xl font-semibold mb-3">{item.title}</h3>
                  <p className="text-muted-foreground">{item.desc}</p>
                </Card>
                {i < 3 && (
                  <div className="hidden md:block absolute top-1/2 -right-12 w-24 h-0.5 bg-border" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────── */}
      {/*                UPDATED PRICING SECTION           */}
      {/* ─────────────────────────────────────────────── */}
      <section id="pricing" className="py-20 md:py-32 bg-muted/20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Choose the plan that matches your facility size and referral
              volume.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 lg:gap-12 max-w-6xl mx-auto">
            {/* Demo / Pilot */}
            <Card className="border-2 border-muted shadow-lg hover:shadow-xl transition-all duration-300 relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-muted text-muted-foreground text-xs font-semibold px-4 py-1 rounded-bl-lg">
                Demo
              </div>
              <div className="p-8 text-center">
                <h3 className="text-2xl font-bold mb-2">Demo</h3>
                <p className="text-4xl font-bold mb-1">KSh 0</p>
                <p className="text-sm text-muted-foreground mb-8">
                  Test / Pilot plan
                </p>

                <ul className="space-y-4 text-left mb-8">
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                    Max 20 referrals/month
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                    Access to 5 hospitals in network
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                    Access by 5 physicians max
                  </li>
                </ul>

                <Link href="/dashboard">
                  <Button variant="outline" className="w-full">
                    Start Demo
                  </Button>
                </Link>
              </div>
            </Card>

            {/* Sub-County Level */}
            <Card className="border-2 border-primary shadow-2xl relative overflow-hidden scale-105 z-10">
              <div className="absolute top-0 inset-x-0 bg-primary text-primary-foreground text-xs font-semibold py-1 text-center">
                Most Popular
              </div>
              <div className="p-8 text-center">
                <h3 className="text-2xl font-bold mb-2">
                  Sub-County Level Hospitals
                </h3>
                <p className="text-4xl font-bold mb-1">KSh 50</p>
                <p className="text-sm text-muted-foreground mb-8">per month</p>

                <ul className="space-y-4 text-left mb-8">
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                    Access to 45 referrals/month
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                    Access to 10 hospitals in network
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                    Access by 10 physicians
                  </li>
                </ul>

                <Link href="/dashboard">
                  <Button className="w-full bg-primary hover:bg-primary/90">
                    Choose Sub-County Plan
                  </Button>
                </Link>
              </div>
            </Card>

            {/* County Facilities */}
            <Card className="border-2 border-muted shadow-lg hover:shadow-xl transition-all duration-300 relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-primary/10 text-primary text-xs font-semibold px-4 py-1 rounded-bl-lg">
                Unlimited
              </div>
              <div className="p-8 text-center">
                <h3 className="text-2xl font-bold mb-2">County Facilities</h3>
                <p className="text-4xl font-bold mb-1">KSh 150</p>
                <p className="text-sm text-muted-foreground mb-8">per month</p>

                <ul className="space-y-4 text-left mb-8">
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                    Unlimited referrals
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                    Unlimited facilities in network
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                    Unlimited number of physicians
                  </li>
                </ul>

                <Link href="/dashboard">
                  <Button variant="outline" className="w-full">
                    Choose County Plan
                  </Button>
                </Link>
              </div>
            </Card>
          </div>

          <div className="text-center mt-12">
            <p className="text-muted-foreground mb-4">
              Need a custom plan for your county or large network? We offer
              special rates.
            </p>
            <Link href="/contact">
              <Button variant="link">Talk to our team →</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Partnerships Section */}
      <section id="partnerships" className="py-20 md:py-32 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Partnerships & Collaboration
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              We're actively seeking partners to scale digital referrals across
              Kenya.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 lg:gap-12 max-w-5xl mx-auto">
            <Card className="p-8 text-center border-none shadow-lg hover:shadow-xl transition-all">
              <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-6">
                <Building2 className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Hospitals & Clinics</h3>
              <p className="text-muted-foreground mb-6">
                Join as a referring or receiving facility. Pilot free for 3
                months.
              </p>
              <Link href="/contact">
                <Button variant="outline" size="sm">
                  Partner as a Facility
                </Button>
              </Link>
            </Card>

            <Card className="p-8 text-center border-none shadow-lg hover:shadow-xl transition-all">
              <div className="w-16 h-16 mx-auto rounded-full bg-accent/10 flex items-center justify-center mb-6">
                <Users className="h-8 w-8 text-accent" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Counties & Government</h3>
              <p className="text-muted-foreground mb-6">
                Integrate with county health systems. Special pricing and
                support.
              </p>
              <Link href="/contact">
                <Button variant="outline" size="sm">
                  Government Partnership
                </Button>
              </Link>
            </Card>

            <Card className="p-8 text-center border-none shadow-lg hover:shadow-xl transition-all">
              <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-6">
                <HeartHandshake className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-2xl font-bold mb-4">NGOs & Tech Partners</h3>
              <p className="text-muted-foreground mb-6">
                Co-develop features, integrate APIs, or co-fund rural pilots.
              </p>
              <Link href="/contact">
                <Button variant="outline" size="sm">
                  Become a Partner
                </Button>
              </Link>
            </Card>
          </div>

          <div className="text-center mt-16">
            <p className="text-xl font-medium mb-6">
              Let's build a stronger referral network together.
            </p>
            <Link href="/contact">
              <Button size="lg" className="bg-primary hover:bg-primary/90">
                Get in Touch →
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 md:py-32 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Transform Referrals?
          </h2>
          <p className="text-xl md:text-2xl opacity-90 mb-10 max-w-3xl mx-auto">
            Join facilities already using UzimaCare to deliver faster, safer,
            and more coordinated care.
          </p>

          <Link href="/dashboard">
            <Button
              size="lg"
              variant="secondary"
              className="text-lg px-10 py-7 text-primary"
            >
              Start Using UzimaCare Today
            </Button>
          </Link>
        </div>
      </section>

      {/* Newsletter */}
      <Newsletter />
    </div>
  );
}
