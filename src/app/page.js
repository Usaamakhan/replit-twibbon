// Server Component - renders instantly!
import Hero from "../components/Hero";
import InteractiveClient from "../components/InteractiveClient";

export default function Home() {
  return (
    <InteractiveClient>
      <Hero />
    </InteractiveClient>
  );
}
