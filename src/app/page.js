// Server Component - renders instantly!
import Hero from "../components/Hero";
import Footer from "../components/Footer";
import InteractiveClient from "../components/InteractiveClient";

export default function Home() {
  return (
    <InteractiveClient>
      <Hero />
      <Footer />
    </InteractiveClient>
  );
}
