// app/contact/page.tsx
import { Button } from "@/components/ui/button";
import { Mail, Phone, MapPin, Clock, MessageSquare, Send } from "lucide-react";

export default function ContactPage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero / Intro */}
      <section className="relative bg-linear-to-br from-primary/5 via-background to-accent/5 py-24 md:py-40 overflow-hidden">
        <div className="absolute inset-0 bg-grid-slate-900/[0.02] dark:bg-grid-slate-100/[0.02]" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight mb-8">
              Get in <span className="text-primary">Touch</span>
            </h1>
            <p className="text-xl md:text-2xl lg:text-3xl text-muted-foreground font-medium max-w-4xl mx-auto leading-relaxed">
              We're here to help — whether you're a clinician, facility manager,
              partner, or just curious about UzimaCare.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Info + Form */}
      <section className="py-20 md:py-32 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16">
            {/* Left: Rich Contact Details */}
            <div className="space-y-12">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold mb-8">
                  Let's Start a Conversation
                </h2>
                <p className="text-lg text-muted-foreground leading-relaxed mb-10">
                  Whether you want to pilot UzimaCare at your facility, discuss
                  a partnership, report a bug, or just say hello — our team
                  responds within 24 hours (usually much faster).
                </p>
              </div>

              {/* Contact cards */}
              <div className="space-y-8">
                {/* Email */}
                <div className="flex items-start gap-6">
                  <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <Mail className="h-7 w-7 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Email Us</h3>
                    <p className="text-lg">
                      <a
                        href="mailto:ericadeshh@gmail.com"
                        className="text-primary hover:underline font-medium"
                      >
                        uzimacare@gmail.com
                      </a>
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Expect a reply within 24 hours (often same day)
                    </p>
                  </div>
                </div>

                {/* Phone / WhatsApp */}
                <div className="flex items-start gap-6">
                  <div className="w-14 h-14 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
                    <Phone className="h-7 w-7 text-accent" />
                  </div>
                  <div>
                    <h3 className=" text-xl font-semibold mb-2">
                      Phone / WhatsApp
                    </h3>
                    <p className="text-lg text-primary font-medium">
                      +254 741 091661
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Monday–Friday, 9:00 AM – 5:00 PM EAT
                    </p>
                    <p className="text-sm text-muted-foreground">
                      WhatsApp preferred for quickest response
                    </p>
                  </div>
                </div>

                {/* Location */}
                <div className="flex items-start gap-6">
                  <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <MapPin className="h-7 w-7 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Location</h3>
                    <p className="text-lg text-primary">
                      Nairobi, Kenya (Virtual-first team)
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Open to in-person meetings in Nairobi and select counties
                    </p>
                  </div>
                </div>

                {/* Response Promise */}
                <div className="flex items-start gap-6 bg-muted/40 p-6 rounded-xl">
                  <div className="w-14 h-14 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center shrink-0">
                    <Clock className="h-7 w-7 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">
                      Our Response Commitment
                    </h3>
                    <p className="text-muted-foreground">
                      We aim to reply to every message within{" "}
                      <strong className="text-foreground">24 hours</strong>.
                      Urgent facility onboarding or partnership inquiries are
                      prioritized and often answered same-day.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Contact Form */}
            <div className="bg-linear-to-br from-muted/30 to-background p-8 md:p-10 rounded-2xl border shadow-sm">
              <h2 className="text-3xl font-bold mb-8 flex items-center gap-3">
                <MessageSquare className="h-8 w-8 text-primary" />
                Send a Message
              </h2>

              <form className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label
                      htmlFor="name"
                      className="block text-sm font-medium mb-2"
                    >
                      Full Name <span className="text-destructive">*</span>
                    </label>
                    <input
                      id="name"
                      placeholder="Dr. Jane Doe / Facility Manager"
                      required
                      className="h-12 w-full px-4 py-3 rounded-md border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium mb-2"
                    >
                      Email Address <span className="text-destructive">*</span>
                    </label>
                    <input
                      id="email"
                      type="email"
                      placeholder="your.name@facility.ke"
                      required
                      className="h-12 w-full px-4 py-3 rounded-md border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="phone"
                    className="block text-sm font-medium mb-2"
                  >
                    Phone / WhatsApp Number
                  </label>
                  <input
                    id="phone"
                    type="tel"
                    placeholder="+254 7XX XXX XXX (optional but recommended)"
                    className="h-12 w-full px-4 py-3 rounded-md border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label
                    htmlFor="subject"
                    className="block text-sm font-medium mb-2"
                  >
                    Subject / Topic <span className="text-destructive">*</span>
                  </label>
                  <input
                    id="subject"
                    placeholder="Partnership inquiry / Facility pilot interest / Technical question / Other"
                    required
                    className="h-12 w-full px-4 py-3 rounded-md border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label
                    htmlFor="message"
                    className="block text-sm font-medium mb-2"
                  >
                    Your Message <span className="text-destructive">*</span>
                  </label>
                  <textarea
                    id="message"
                    placeholder="Tell us about your facility, your needs, or any questions you have about UzimaCare..."
                    rows={7}
                    required
                    className="resize-none w-full px-4 py-3 rounded-md border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div className="pt-4">
                  <Button
                    type="submit"
                    size="lg"
                    className="w-full bg-primary hover:bg-primary/90 h-14 text-lg font-medium"
                  >
                    <Send className="mr-3 h-5 w-5" />
                    Send Message
                  </Button>
                </div>

                <p className="text-xs text-muted-foreground text-center pt-4">
                  We respect your privacy. Your information will only be used to
                  respond to your inquiry.
                </p>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Final Trust / CTA */}
      <section className="py-16 md:py-24 bg-muted/20">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-2xl md:text-3xl font-bold mb-6">
            We're excited to hear from you
          </h3>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto mb-10">
            Whether you're ready to pilot, explore partnership opportunities, or
            just want more information — our team is standing by.
          </p>
          <a href="mailto:ericadeshh@gmail.com">
            <Button variant="outline" size="lg" className="min-w-60">
              Email us directly → uzimacare@gmail.com
            </Button>
          </a>
        </div>
      </section>
    </div>
  );
}
