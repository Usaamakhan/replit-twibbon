// Server Component - renders instantly!
import Hero from "../components/Hero";
import Footer from "../components/Footer";
import InteractiveClient from "../components/InteractiveClient";
import AuthGate from "../components/AuthGate";
import ClientAuthProvider from "../components/ClientAuthProvider";

export default function Home() {
  return (
    <ClientAuthProvider>
      <AuthGate>
        <InteractiveClient>
          <Hero />
          <Footer />
        </InteractiveClient>
      </AuthGate>
    </ClientAuthProvider>
  );
}
