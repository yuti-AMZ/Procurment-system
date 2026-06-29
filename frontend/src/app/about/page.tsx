import Navbar from "@/components/landing/navbar";
import Footer from "@/components/landing/footer";
const values = [
  {
    title: "Innovation First",
    description:
      "We leverage cutting-edge AI and machine learning to solve real procurement challenges, constantly pushing the boundaries of what's possible.",
  },
  {
    title: "Transparency",
    description:
      "Every recommendation, insight, and automation is explainable and auditable. No black boxes, just clear, actionable intelligence.",
  },
  {
    title: "Customer Success",
    description:
      "Our platform is designed to deliver measurable ROI from day one. We succeed when our customers achieve their procurement goals.",
  },
  {
    title: "Data Sovereignty",
    description:
      "Your data is your own. We maintain the highest standards of security, compliance, and data protection across all our services.",
  },
];
const stats = [
  { value: "B+", label: "Procurement Managed" },
  { value: "500+", label: "Enterprise Clients" },
  { value: "98%", label: "Client Retention" },
  { value: "40%", label: "Avg. Cost Savings" },
];
export default function AboutPage() {
  return (
    <>
      <Navbar />{" "}
      <main>
        <section className="relative pt-32 pb-24">
          <div className="absolute inset-0 bg-gradient-to-b from-gold/5 via-transparent to-background pointer-events-none" />{" "}
          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl">
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6">
                About <span className="text-gold">ProcurAI</span>{" "}
              </h1>{" "}
              <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed">
                We&apos;re on a mission to transform procurement from a cost
                center into a strategic advantage. Founded by supply chain
                experts and AI researchers, ProcurAI delivers intelligent
                automation that empowers procurement teams to make faster,
                smarter decisions.{" "}
              </p>{" "}
            </div>{" "}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16">
              {stats.map((stat) => (
                <div
                  key={stat.label}
                  className="text-center p-6 rounded-xl border border-card-border bg-card"
                >
                  <div className="text-3xl sm:text-4xl font-bold text-gold mb-2">
                    {stat.value}
                  </div>{" "}
                  <div className="text-sm text-muted-foreground">
                    {stat.label}
                  </div>{" "}
                </div>
              ))}{" "}
            </div>{" "}
          </div>{" "}
        </section>{" "}
        <section className="py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                Our <span className="text-gold">Values</span>
              </h2>{" "}
              <p className="max-w-2xl mx-auto text-muted-foreground text-lg">
                The principles that guide everything we build.{" "}
              </p>{" "}
            </div>{" "}
            <div className="grid md:grid-cols-2 gap-6">
              {values.map((v) => (
                <div
                  key={v.title}
                  className="rounded-xl border border-card-border bg-card p-8 hover:border-gold/30 transition-all duration-500"
                >
                  <h3 className="text-xl font-semibold mb-3">{v.title}</h3>{" "}
                  <p className="text-muted-foreground leading-relaxed">
                    {v.description}
                  </p>{" "}
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
