// Profile page for the authenticated user
import InteractiveClient from "../../components/InteractiveClient";
import ProfilePageWrapper from "../../components/ProfilePageWrapper";

export const metadata = {
  title: "Profile - Frame Your Voice",
  description: "Manage your profile and view your campaigns",
};

export default function Profile() {
  return (
    <InteractiveClient>
      <ProfilePageWrapper isOwnProfile={true} />
    </InteractiveClient>
  );
}