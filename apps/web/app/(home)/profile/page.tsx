import { getProfile } from "./_lib/get-profile";
import { UserInfoCard } from "./_components/user-info-card";
import { SecurityCard } from "./_components/security-card";
import { SessionsCard } from "./_components/sessions-card";

export const metadata = {
  title: "Profile",
};

export default async function ProfilePage() {
  const { userSessions, ...user } = await getProfile();

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4 flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold text-foreground">
          Account & Profile
        </h1>
        <p className="text-xs text-muted-foreground mt-1">
          Manage your account settings, security credentials, and active login
          sessions.
        </p>
      </div>

      <div className="flex flex-col gap-6">
        <UserInfoCard user={user} />
        <SecurityCard />
        <SessionsCard sessions={userSessions} />
      </div>
    </div>
  );
}
