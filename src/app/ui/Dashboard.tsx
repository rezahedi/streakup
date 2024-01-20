"use client";

import { useEffect, useState } from "react";
import { fetchAllData } from "@/app/lib/data";
import { habits } from "@prisma/client";
import { TodaySkeleton } from "@/app/ui/skeletons";
import { BrokenItem, NoHabits, TodayItem, TomorrowItem, Welcome } from "@/app/ui";
import { filterToday, filterTomorrow, filterBroken } from "@/app/lib/filters";

export default function Dashboard() {
  const [habits, setHabits] = useState<habits[] | null>(null);
  const [today, setToday] = useState<habits[]>([]);
  const [tomorrow, setTomorrow] = useState<habits[]>([]);
  const [broken, setBroken] = useState<habits[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<boolean>(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      let data = await fetchAllData();
      setLoading(false);
      
      if (data === null) {
        setError(true);
        return;
      }
      
      setHabits(data);
    })();
  }, []);

  useEffect(() => {
    if (habits === null) return;

    setToday( filterToday(habits) );
    setTomorrow( filterTomorrow(habits) );
    setBroken( filterBroken(habits) );
  }, [habits]);

  const checkinAction = async (habit: habits) => {
    console.log('checkinAction', habit);
  }

  const activateAction = async (habit: habits) => {
    console.log('activateAction', habit);
  }

  return (
    <div className="mx-auto lg:max-w-screen-xl px-2.5 lg:px-20">
      {loading && <TodaySkeleton count={3} />}
      {error && <div>Not logged in</div>}
      {habits && (
        <>
          {habits.length === 0 && <Welcome />}
          {habits.length !== 0 && (
            <>
              <h2>Today</h2>
              {today.length === 0 && <NoHabits />}
              {today.length > 0 && (
                <ul role="list">
                  {today.map((habit) => (
                    <TodayItem key={habit.id} habit={habit} action={checkinAction} />
                  ))}
                </ul>
              )}
            </>
          )}
          {tomorrow.length > 0 && (
            <>
              <h2>Tomorrow</h2>
              <ul role="list">
                {tomorrow.map((habit) => (
                  <TomorrowItem key={habit.id} habit={habit} />
                ))}
              </ul>
            </>
          )}
          {broken.length > 0 && (
            <>
              <h2>Broken</h2>
              <ul role="list">
                {broken.map((habit) => (
                  <BrokenItem key={habit.id} habit={habit} action={activateAction} />
                ))}
              </ul>
            </>
          )}
        </>
      )}
    </div>
  )
}
