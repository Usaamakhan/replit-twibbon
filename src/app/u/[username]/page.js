// User profile route with /u/ prefix to avoid conflicts
import InteractiveClient from "../../../components/InteractiveClient";
import ProfilePage from "../../../components/ProfilePage";

export async function generateMetadata({ params }) {
  const { username } = await params;
  return {
    title: `@${username} - Frame Your Voice`,
    description: `View ${username}'s profile and campaigns`,
  };
}

export default async function UserProfile({ params }) {
  const { username } = await params;
  
  return (
    <InteractiveClient>
      <ProfilePage isOwnProfile={false} username={username} />
    </InteractiveClient>
  );
}