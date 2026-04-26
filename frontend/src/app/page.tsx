import { Demo } from "@/components/Demo";
import { FAQ } from "@/components/FAQ";
import { Footer } from "@/components/Footer";
import { Hero } from "@/components/Hero";
import { HowItWorks } from "@/components/HowItWorks";
import { Nav } from "@/components/Nav";
import { Signals } from "@/components/Signals";

export default function Page() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <HowItWorks />
        <Signals />
        <Demo />
        <FAQ />
      </main>
      <Footer />
    </>
  );
}
