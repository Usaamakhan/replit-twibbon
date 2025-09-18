// Dynamic route for viewing other user profiles
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
    <InteractiveClient>
      <ProfilePage isOwnProfile={false} username={username} />
    </InteractiveClient>
  );
}