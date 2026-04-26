import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { LibraryDashboard } from "@/components/dashboard/library-dashboard";
import { auth } from "@/lib/auth";
import { getDashboardSnapshot, getNotificationSnapshot } from "@/lib/library-data";

export default async function DashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/sign-in");
  }

  const [snapshot, notifications] = await Promise.all([
    getDashboardSnapshot(),
    getNotificationSnapshot(),
  ]);

  return (
    <main className="min-h-screen bg-[var(--color-canvas)] px-6 py-10 sm:px-8 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <LibraryDashboard
          initialStats={snapshot.stats}
          initialBooks={snapshot.books}
          initialMembers={snapshot.members}
          initialBorrowTransactions={snapshot.borrowTransactions}
          notificationCount={notifications.total}
          userName={session.user.name}
          userEmail={session.user.email}
        />
      </div>
    </main>
  );
}
