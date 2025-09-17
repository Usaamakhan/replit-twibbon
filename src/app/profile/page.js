// Profile page for the authenticated user
import ClientAuthProvider from "../../components/ClientAuthProvider";
import AuthGate from "../../components/AuthGate";
import InteractiveClient from "../../components/InteractiveClient";
import ProfilePage from "../../components/ProfilePage";

export const metadata = {
  title: "Profile - Frame Your Voice",
  description: "Manage your profile and view your campaigns",
};

export default function Profile() {
  return (
    <ClientAuthProvider>
      <AuthGate>
        <InteractiveClient>
          <ProfilePage isOwnProfile={true} />
        </InteractiveClient>
      </AuthGate>
    </ClientAuthProvider>
  );
}