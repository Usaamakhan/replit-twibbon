// Server Component - renders instantly!
import Hero from "../components/Hero";
import Footer from "../components/Footer";
import InteractiveClient from "../components/InteractiveClient";
import AuthenticatedLayout from "../components/AuthenticatedLayout";
import AuthGate from "../components/AuthGate";

export default function Home() {
  return (
    <AuthenticatedLayout>
      <AuthGate>
        <InteractiveClient>
          <Hero />
          <Footer />
        </InteractiveClient>
      </AuthGate>
    </AuthenticatedLayout>
  );
}
