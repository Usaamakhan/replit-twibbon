// Server Component - renders instantly!
import Hero from "../components/Hero";
import Footer from "../components/Footer";
import InteractiveClient from "../components/InteractiveClient";
import AuthGate from "../components/AuthGate";

export default function Home() {
  return (
    <AuthGate>
      <InteractiveClient>
        <Hero />
        <Footer />
      </InteractiveClient>
    </AuthGate>
  );
}
