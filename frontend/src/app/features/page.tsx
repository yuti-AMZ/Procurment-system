import Navbar from "@/components/landing/navbar";
import Footer from "@/components/landing/footer";
const categories = [
  {
    title: "Supplier Management",
    features: [
      "AI-powered supplier discovery and scoring",
      "Automated onboarding and qualification",
      "Performance tracking with real-time dashboards",
      "Risk assessment and monitoring",
    ],
  },
  {
    title: "Sourcing & RFx",
    features: [
      "Intelligent RFP and RFQ creation",
      "Automated supplier matching and invitation",
      "Collaborative bid evaluation",
      "AI-driven quotation comparison",
    ],
  },
  {
    title: "Contract Intelligence",
    features: [
      "Automated contract analysis and extraction",
      "Clause comparison and risk flagging",
      "Obligation tracking and compliance monitoring",
      "Renewal and expiration alerts",
    ],
  },
  {
    title: "Spend Analytics",
    features: [
      "Real-time spend visibility across categories",
      "AI-driven savings identification",
      "Budget tracking and forecasting",
      "Customizable reports and dashboards",
    ],
  },
  {
    title: "Procurement Automation",
    features: [
      "Automated purchase request workflows",
      "Multi-level approval routing",
      "PO generation and supplier notification",
      "Invoice matching and processing",
    ],
  },
  {
    title: "Market Intelligence",
    features: [
      "Real-time market price monitoring",
      "Category trend analysis",
      "Supplier market mapping",
      "Predictive price forecasting",
    ],
  },
];
export default function FeaturesPage() {
  return (
    <>
      <Navbar />{" "}
      <main>
        <section className="relative pt-32 pb-24">
          <div className="absolute inset-0 bg-gradient-to-b from-gold/5 via-transparent to-background pointer-events-none" />{" "}
          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto">
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6">
                Platform <span className="text-gold">Features</span>{" "}
              </h1>{" "}
              <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed">
                A comprehensive suite of AI-powered tools designed to transform
                every aspect of your procurement operation.{" "}
              </p>{" "}
            </div>{" "}
          </div>{" "}
        </section>{" "}
        <section className="py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories.map((cat) => (
                <div
                  key={cat.title}
                  className="rounded-xl border border-card-border bg-card p-8 hover:border-gold/30 transition-all duration-500"
                >
                  <h3 className="text-xl font-semibold mb-5">{cat.title}</h3>{" "}
                  <ul className="space-y-3">
                    {cat.features.map((f) => (
                      <li
                        key={f}
                        className="flex items-start gap-3 text-sm text-muted-foreground"
                      >
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          className="text-gold shrink-0 mt-0.5"
                        >
                          <path d="M20 6L9 17l-5-5" />{" "}
                        </svg>{" "}
                        {f}{" "}
                      </li>
                    ))}{" "}
                  </ul>{" "}
                </div>
              ))}{" "}
            </div>{" "}
          </div>{" "}
        </section>{" "}
      </main>{" "}
      <Footer />{" "}
    </>
  );
}
