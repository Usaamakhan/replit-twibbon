// Dynamic route for viewing other user profiles
import ClientAuthProvider from "../../components/ClientAuthProvider";
import InteractiveClient from "../../components/InteractiveClient";
import ProfilePage from "../../components/ProfilePage";

export async function generateMetadata({ params }) {
  const { username } = params;
  return {
    title: `@${username} - Frame Your Voice`,
    description: `View ${username}'s profile and campaigns`,
  };
}

export default function UserProfile({ params }) {
  const { username } = params;
  
  return (
    <ClientAuthProvider>
      <InteractiveClient>
        <ProfilePage isOwnProfile={false} username={username} />
      </InteractiveClient>
    </ClientAuthProvider>
  );
}