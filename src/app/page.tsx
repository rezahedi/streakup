import { Suspense } from "react"
import { TodayCard, TomorrowCard, BrokenCard } from '@/app/ui'
import { TodaySkeleton } from "@/app/ui/skeletons"
import { Signin } from "@/components/templates";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { updateHabits } from "./lib/actions";

export default async function page()
{
  // Get user session token
  const session = await getServerSession(authOptions);
  if (!session || !session.user)
    return <Signin />;

  // TODO: before getting list of habits, update all missed checkins
  await updateHabits(session.user);

  return (
    <div className="w-full flex flex-col">
      <h2>Today</h2>
      <Suspense fallback={<TodaySkeleton />}>
        <TodayCard />
      </Suspense>
      <h2>Tomorrow</h2>
      <Suspense fallback={<TodaySkeleton />}>
        <TomorrowCard />
      </Suspense>
      <h2>Broken</h2>
      <Suspense fallback={<TodaySkeleton />}>
        <BrokenCard />
      </Suspense>
    </div>
  )
}
