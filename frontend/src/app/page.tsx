import Navbar from "@/components/landing/navbar";
import Hero from "@/components/landing/hero";
import PlatformOverview from "@/components/landing/platform-overview";
import Modules from "@/components/landing/modules";
import HowItWorks from "@/components/landing/how-it-works";
import Roadmap from "@/components/landing/roadmap";
import Pricing from "@/components/landing/pricing";
import CTA from "@/components/landing/cta";
import Footer from "@/components/landing/footer";
export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <PlatformOverview />
        <Modules />
        <HowItWorks />
        <Roadmap />
        <Pricing />
        <CTA />
      </main>
      <Footer />
    </>
  );
}
