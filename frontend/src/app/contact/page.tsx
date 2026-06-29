import Navbar from "@/components/landing/navbar";
import Footer from "@/components/landing/footer";
import Link from "next/link";
export default function ContactPage() {
  return (
    <>
      <Navbar />{" "}
      <main>
        <section className="relative pt-32 pb-24">
          <div className="absolute inset-0 bg-gradient-to-b from-gold/5 via-transparent to-background pointer-events-none" />{" "}
          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6">
                Get in <span className="text-gold">Touch</span>{" "}
              </h1>{" "}
              <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed">
                Have a question or want to see ProcurAI in action? We&apos;d
                love to hear from you.{" "}
              </p>{" "}
            </div>{" "}
            <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
              <div>
                <form className="space-y-5">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label
                        htmlFor="firstName"
                        className="text-sm font-medium"
                      >
                        First name
                      </label>{" "}
                      <input
                        id="firstName"
                        className="flex h-10 w-full rounded-lg border border-card-border bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:border-gold/50 focus-visible:ring-1 focus-visible:ring-gold/30 transition-all"
                        placeholder="John"
                      />{" "}
                    </div>{" "}
                    <div className="space-y-2">
                      <label htmlFor="lastName" className="text-sm font-medium">
                        Last name
                      </label>{" "}
                      <input
                        id="lastName"
                        className="flex h-10 w-full rounded-lg border border-card-border bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:border-gold/50 focus-visible:ring-1 focus-visible:ring-gold/30 transition-all"
                        placeholder="Doe"
                      />{" "}
                    </div>{" "}
                  </div>{" "}
                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-medium">
                      Email
                    </label>{" "}
                    <input
                      id="email"
                      type="email"
                      className="flex h-10 w-full rounded-lg border border-card-border bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:border-gold/50 focus-visible:ring-1 focus-visible:ring-gold/30 transition-all"
                      placeholder="you@company.com"
                    />{" "}
                  </div>{" "}
                  <div className="space-y-2">
                    <label htmlFor="company" className="text-sm font-medium">
                      Company
                    </label>{" "}
                    <input
                      id="company"
                      className="flex h-10 w-full rounded-lg border border-card-border bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:border-gold/50 focus-visible:ring-1 focus-visible:ring-gold/30 transition-all"
                      placeholder="Your company"
                    />{" "}
                  </div>{" "}
                  <div className="space-y-2">
                    <label htmlFor="message" className="text-sm font-medium">
                      Message
                    </label>{" "}
                    <textarea
                      id="message"
                      rows={5}
                      className="flex w-full rounded-lg border border-card-border bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:border-gold/50 focus-visible:ring-1 focus-visible:ring-gold/30 transition-all resize-none"
                      placeholder="How can we help?"
                    />{" "}
                  </div>{" "}
                  <button
                    type="submit"
                    className="inline-flex items-center justify-center h-12 rounded-lg px-8 text-base font-medium bg-gold text-black hover:bg-gold-light shadow-lg shadow-gold/20 hover:shadow-gold/30 transition-all duration-300"
                  >
                    Send Message{" "}
                  </button>{" "}
                </form>{" "}
              </div>{" "}
              <div className="space-y-8">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Email</h3>{" "}
                  <p className="text-muted-foreground">
                    hello@procuray.com
                  </p>{" "}
                </div>{" "}
                <div>
                  <h3 className="text-lg font-semibold mb-2">Sales</h3>{" "}
                  <p className="text-muted-foreground">
                    sales@procuray.com
                  </p>{" "}
                </div>{" "}
                <div>
                  <h3 className="text-lg font-semibold mb-2">Support</h3>{" "}
                  <p className="text-muted-foreground">
                    support@procuray.com
                  </p>{" "}
                </div>{" "}
                <div>
                  <h3 className="text-lg font-semibold mb-2">Office</h3>{" "}
                  <p className="text-muted-foreground">
                    123 Innovation Drive
                    <br /> San Francisco, CA 94105
                    <br /> United States{" "}
                  </p>{" "}
                </div>{" "}
                <div className="pt-4">
                  <Link href="/signup">
                    <span className="text-gold hover:underline font-medium">
                      Start your free trial →
                    </span>{" "}
                  </Link>{" "}
                </div>{" "}
              </div>{" "}
            </div>{" "}
          </div>{" "}
        </section>{" "}
      </main>{" "}
      <Footer />{" "}
    </>
  );
}
