// app/about/page.tsx
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Target,
  Users,
  HeartPulse,
  ShieldCheck,
  Clock,
  Smartphone,
  Building2,
  ArrowRight,
} from "lucide-react";
import { GiCheckMark } from "react-icons/gi";

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero / Intro */}
      <section className="relative bg-linear-to-br from-primary/10 via-background to-accent/10 py-24 md:py-40 overflow-hidden">
        <div className="absolute inset-0 bg-grid-slate-900/[0.03] dark:bg-grid-slate-100/[0.02]" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight mb-8">
              About <span className="text-primary">UzimaCare</span>
            </h1>
            <p className="text-xl md:text-2xl lg:text-3xl text-muted-foreground font-medium max-w-4xl mx-auto leading-relaxed">
              Transforming healthcare access in Kenya through secure, real-time,
              and inclusive digital referral systems.
            </p>
          </div>
        </div>
      </section>

      {/* The Problem We Solve */}
      <section className="py-20 md:py-32 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold mb-8">
                The Challenge in Kenya's Referral System
              </h2>

              <div className="space-y-6 text-lg text-muted-foreground">
                <p className="leading-relaxed">
                  Despite significant progress in primary healthcare coverage,
                  the referral process between facilities remains one of the
                  weakest links in Kenya's health system.
                </p>

                <ul className="space-y-5">
                  <li className="flex items-start gap-4">
                    <GiCheckMark className="h-5 w-5 text-primary shrink-0 mt-1" />
                    <span>
                      <strong className="text-foreground">
                        Paper-based letters
                      </strong>{" "}
                      are frequently lost, illegible, or arrive too late
                    </span>
                  </li>
                  <li className="flex items-start gap-4">
                    <GiCheckMark className="h-5 w-5 text-primary shrink-0 mt-1" />
                    <span>
                      <strong className="text-foreground">
                        No real-time tracking
                      </strong>{" "}
                      — patients and referring clinicians often have no idea
                      if/when the patient was received
                    </span>
                  </li>
                  <li className="flex items-start gap-4">
                    <GiCheckMark className="h-5 w-5 text-primary shrink-0 mt-1" />
                    <span>
                      Critical{" "}
                      <strong className="text-foreground">
                        patient history and test results
                      </strong>{" "}
                      are not reliably transferred
                    </span>
                  </li>
                  <li className="flex items-start gap-4">
                    <GiCheckMark className="h-5 w-5 text-primary shrink-0 mt-1" />
                    <span>
                      Long delays contribute to{" "}
                      <strong className="text-foreground">
                        worsening conditions
                      </strong>
                      , avoidable complications, and increased mortality
                    </span>
                  </li>
                </ul>
              </div>
            </div>

            <Card className="p-8 lg:p-10 shadow-2xl border-none bg-linear-to-br from-primary/5 to-accent/5">
              <h3 className="text-3xl font-bold mb-8 text-primary">
                Our Purpose
              </h3>
              <p className="text-xl leading-relaxed mb-8">
                UzimaCare was created to close this critical gap — building a{" "}
                <strong>
                  simple, secure, mobile-friendly digital referral platform
                </strong>{" "}
                that works even in low-connectivity environments.
              </p>
              <p className="text-xl leading-relaxed">
                We aim to reduce referral delays from days to hours, improve
                continuity of care, and ultimately save lives across urban and
                rural Kenya.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Core Values & Commitment – New Section */}
      <section className="py-20 md:py-32 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-16">
            Our Core Values & Commitment
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10">
            {[
              {
                icon: ShieldCheck,
                title: "Privacy & Security First",
                desc: "End-to-end encryption, minimal data collection, full compliance with Kenya's Data Protection Act 2019.",
                color: "text-primary",
              },
              {
                icon: Users,
                title: "Inclusive by Design",
                desc: "Mobile-first, USSD/SMS fallback, offline capabilities — accessible to patients and facilities in every county.",
                color: "text-accent",
              },
              {
                icon: HeartPulse,
                title: "Patient-Centered",
                desc: "Every feature is built to improve health outcomes, reduce suffering, and ensure dignity in care delivery.",
                color: "text-primary",
              },
              {
                icon: Target,
                title: "Impact-Driven",
                desc: "We measure success by lives improved, delays reduced, and facilities empowered — not just users or revenue.",
                color: "text-accent",
              },
            ].map((item, i) => (
              <Card
                key={i}
                className="p-8 border-none shadow-lg hover:shadow-xl transition-all duration-300 text-center"
              >
                <div
                  className={`w-16 h-16 mx-auto rounded-full bg-muted flex items-center justify-center mb-6 ${item.color}`}
                >
                  <item.icon className="h-8 w-8" />
                </div>
                <h3 className="text-2xl font-bold mb-4">{item.title}</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {item.desc}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Built For & Impact Vision */}
      <section className="py-20 md:py-32 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="order-2 lg:order-1">
              <h2 className="text-4xl md:text-5xl font-bold mb-8">
                Built For Every Level of Care
              </h2>

              <div className="space-y-8 text-lg">
                <div className="flex items-start gap-5">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Building2 className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-1.9xl font-semibold mb-2">
                      From Dispensary to National Hospital
                    </h3>
                    <p className="text-muted-foreground">
                      Whether you're a rural health center referring a complex
                      case or a level 5 hospital managing inbound referrals —
                      UzimaCare adapts to your workflow.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-5">
                  <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
                    <Clock className="h-6 w-6 text-accent" />
                  </div>
                  <div>
                    <h3 className="text-1.9xl font-semibold mb-2">
                      Time-Sensitive & Life-Saving
                    </h3>
                    <p className="text-muted-foreground">
                      Emergency referrals flagged and prioritized. Real-time
                      status updates reduce anxiety for patients and families.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-5">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Smartphone className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-1.9xl font-semibold mb-2">
                      Accessible Technology
                    </h3>
                    <p className="text-muted-foreground">
                      Works on basic smartphones. M-Pesa STK integration. No
                      need for constant high-speed internet.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="order-1 lg:order-2">
              <Card className="p-10 shadow-2xl border-none bg-linear-to-br from-primary/5 via-background to-accent/5">
                <h3 className="text-4xl font-bold mb-8 text-primary">
                  Our Long-Term Vision
                </h3>
                <p className="text-1.9xl leading-relaxed mb-8">
                  A future where no Kenyan patient is lost in the referral chain
                  — where every referral is tracked, every payment confirmed,
                  and every clinician has the full picture needed to provide
                  life-saving care.
                </p>
                <p className="text-xl leading-relaxed">
                  We are building the digital backbone for a more equitable,
                  efficient, and compassionate healthcare system in Kenya.
                </p>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 md:py-32 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-8">
            Join Us in Building Better Healthcare
          </h2>
          <p className="text-xl md:text-2xl opacity-90 mb-12 max-w-4xl mx-auto">
            Whether you're a clinician, facility administrator, policymaker,
            partner, or patient advocate — we'd love to hear from you.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link href="/contact">
              <Button
                size="lg"
                variant="secondary"
                className="text-xl py-7 px-12 text-primary"
              >
                Contact the Team <ArrowRight className="ml-3 h-6 w-6" />
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button
                size="lg"
                className="bg-white/20 hover:bg-white/30 text-xl py-7 px-12 backdrop-blur-sm"
              >
                Try the Platform
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
