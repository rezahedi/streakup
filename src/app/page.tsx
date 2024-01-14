import Link from "next/link";
import {redirect} from "next/navigation";
import {prisma} from "@/db";
import HabitItem from "@/components/HabitItem";
import DoneHabitItem from "@/components/DoneHabitItem";
import BrokenHabitItem from "@/components/BrokenHabitItem";
import ComingHabitItem from "@/components/ComingHabitItem";
import {faSquarePlus} from "@fortawesome/free-regular-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import Header from "@/components/templates/Header";
import {
  patternFormatChecker,
  getRepeatPatternObject,
  getStartEndDate,
} from "@/utils/dates";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { CustomUser } from "@/type";

async function checkinHabit(id: string) {
  "use server";

  const session = await getServerSession(authOptions);
  if (!session || !session.user)
    throw new Error("User not logged in");

  // Get data by id
  let habit = await prisma.habits.findFirst({
    where: {
      id,
      userId: session.user.id,
    },
  });

  if (!habit) {
    throw new Error("Habit not found");
  }

  if (
    habit.repeatPattern.length === 0 ||
    !patternFormatChecker(habit.repeatPattern)
  )
    throw new Error("Habit repeat type Error");

  // Get pattern object
  let patternObj = getRepeatPatternObject(habit.repeatPattern);

  // calculate first checkin start/end dates
  const {startDate, endDate, lastLevel, streakIncrease} = getStartEndDate(
    patternObj,
    habit.lastLevel + 1
  );

  return await prisma.habits.update({
    where: {
      id,
    },
    data: {
      startDate,
      endDate,
      lastLevel,
      streak: habit.streak + streakIncrease,
    },
  });
}

async function activateHabit(id: string) {
  "use server";

  const session = await getServerSession(authOptions);
  if (!session || !session.user)
    throw new Error("User not logged in");

  // Get data by id
  let habit = await prisma.habits.findFirst({
    where: {
      id,
      userId: session.user.id,
    },
  });

  if (!habit) {
    throw new Error("Habit not found");
  }

  if (
    habit.repeatPattern.length === 0 ||
    !patternFormatChecker(habit.repeatPattern)
  )
    throw new Error("Habit repeat type Error");

  // Get pattern object
  let patternObj = getRepeatPatternObject(habit.repeatPattern);

  // calculate first checkin start/end dates
  const {startDate, endDate} = getStartEndDate(patternObj, 0);

  return await prisma.habits.update({
    where: {
      id,
    },
    data: {
      startDate,
      endDate,
      status: true,
    },
  });
}

// Get all active but missed check-in habits and update them as unactive and streak broken
async function updateHabits(user: CustomUser) {

  const records = await prisma.habits.findMany({
    where: {
      userId: user.id,
      status: true,
      endDate: {
        lt: new Date(),
      },
    },
  });

  records.forEach(async (record) => {
    let bestStreak =
      record.streak > record.lastStreak ? record.streak : record.lastStreak;
    await prisma.habits.update({
      where: {
        id: record.id,
      },
      data: {
        status: false,
        lastStreak: bestStreak,
        streak: 0,
        lastLevel: 0,
        startDate: null,
        endDate: null,
        streakBreaks: {
          increment: 1,
        },
      },
    });
  });
}

async function getHabits() {

  const data = await fetch(process.env.NEXT_PUBLIC_API_URL + "/checkin", { next:{revalidate: 1} });
  const habits = await data.json();

  if (habits.length === 0) return [];

  // Change all string dates as Date objects
  habits.forEach((obj, i) => {
    habits[i] = {
      ...obj,
      startDate: new Date(obj.startDate),
      endDate: new Date(obj.endDate),
      createdAt: new Date(obj.createdAt),
      updatedAt: new Date(obj.updatedAt),
    };
  });

  return habits;
}

async function getComingHabits() {
  let data = await fetch(process.env.NEXT_PUBLIC_API_URL + "/coming", { next:{revalidate: 1} });
  const habits = await data.json();
  console.log('habits', habits)

  if (habits.length === 0) return [];

  // Change all string dates as Date objects
  habits.forEach((obj, i) => {
    habits[i] = {
      ...obj,
      startDate: new Date(obj.startDate),
      endDate: new Date(obj.endDate),
      createdAt: new Date(obj.createdAt),
      updatedAt: new Date(obj.updatedAt),
    };
  });

  return habits;
}

async function getDoneHabits() {
  "use client";
  let data = await fetch(process.env.NEXT_PUBLIC_API_URL + "/done", { next:{revalidate: 1} });
  const habits = await data.json();

  if (habits.length === 0) return [];

  // Change all string dates as Date objects
  habits.forEach((obj, i) => {
    habits[i] = {
      ...obj,
      startDate: new Date(obj.startDate),
      endDate: new Date(obj.endDate),
      createdAt: new Date(obj.createdAt),
      updatedAt: new Date(obj.updatedAt),
    };
  });

  return habits;
}

async function getBrokenHabits() {
  "use client";
  let data = await fetch(process.env.NEXT_PUBLIC_API_URL + "/broken", { next:{revalidate: 1} });
  const habits = await data.json();

  if (habits.length === 0) return [];

  // Change all string dates as Date objects
  habits.forEach((obj, i) => {
    habits[i] = {
      ...obj,
      startDate: new Date(obj.startDate),
      endDate: new Date(obj.endDate),
      createdAt: new Date(obj.createdAt),
      updatedAt: new Date(obj.updatedAt),
    };
  });

  return habits;
}

export default async function Home() {

  // Get user session token
  const session = await getServerSession(authOptions);
  if (!session || !session.user)
    redirect("/api/auth/signin");

  // TODO: before getting list of habits, update all missed checkins
  await updateHabits(session.user);
  const habits = await getHabits();
  const comingHabits = await getComingHabits();
  const doneHabits = await getDoneHabits();
  const brokenHabits = await getBrokenHabits();
  console.log('session', session);
  return (
    <>
      <Header>
        {session && (
          <div>
            <p>Signed in as {session.user && session.user.name}</p>
            <a href="/api/auth/signout">Sign out by link</a>
          </div>
        )}
        {!session && (
          <p><a href="/api/auth/signin">Sign in</a></p>
        )}
        <Link
          className="border border-slate-300 text-slate-300 rounded px-2 py-1 hover:bg-slate-700 focus-within:bg-slate-700 outline-none flex gap-2"
          href="/new"
        >
          <FontAwesomeIcon icon={faSquarePlus} className="w-4" /> New Habit
        </Link>
      </Header>
      <h2 className="text-xl text-orange-500 border-b border-orange-500 pb-2 my-4">
        Today:
      </h2>
      {habits.length === 0 && (
        <p className="text-center text-green-500 py-16">
          You are all set for now!
        </p>
      )}
      <ul>
        {habits.map((habit) => (
          <HabitItem key={habit.id} {...habit} checkinHabit={checkinHabit} />
        ))}
      </ul>
      {comingHabits.length > 0 && (
        <>
          <h2 className="text-xl text-orange-500 border-b border-orange-500 pb-2 my-4">
            Tomorrow:
          </h2>
          <ul>
            {comingHabits.map((habit) => (
              <ComingHabitItem key={habit.id} {...habit} />
            ))}
          </ul>
        </>
      )}
      {doneHabits.length > 0 && (
        <>
          <h2 className="text-xl text-orange-500 border-b border-orange-500 pb-2 my-4">
            Done:
          </h2>
          <ul>
            {doneHabits.map((habit) => (
              <DoneHabitItem key={habit.id} {...habit} />
            ))}
          </ul>
        </>
      )}
      {brokenHabits.length > 0 && (
        <>
          <h2 className="text-xl text-orange-500 border-b border-orange-500 pb-2 my-4">
            Broken:
          </h2>
          <ul>
            {brokenHabits.map((habit) => (
              <BrokenHabitItem
                key={habit.id}
                {...habit}
                activateHabit={activateHabit}
              />
            ))}
          </ul>
        </>
      )}
    </>
  );
}
