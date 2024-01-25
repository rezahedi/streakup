import { updateProfile } from "@/app/lib/actions";
import Link from "next/link";
import { getServerSession } from "next-auth/next";
import { authOptions } from '@/app/lib/auth';
import { redirect } from 'next/navigation';

export default async function page() {
  // Get user session token
  const session = await getServerSession(authOptions);
  if (!session || !session.user)
    redirect('/')
  const { user } = session

  // TODO: Loading, error, and success states
  // TODO: Update user profile - global state
  // TODO: Handle image upload to CDN
  // TODO: Handle timezone change

  return (
		<div className='col-span-1 auto-rows-min grid-cols-1 lg:col-span-5 border-gray-50 rounded-lg border-2 bg-white mt-4 p-3 shadow sm:p-4'>
			<h2 className="text-xl text-orange-500 border-b border-orange-500 pb-2 my-4">Profile:</h2>
      <form action={updateProfile} className="flex flex-col gap-4">
        <label htmlFor="name" className="text-slate-400 text-xs">
          Name:
        </label>
        <input id="name" name="name" defaultValue={user.name!} type="text" minLength={3} maxLength={20} required
          placeholder='John Doe or Jane'
          className="grow border border-slate-300 rounded px-2 py-1 outline-none text-slate-800" />
        <label htmlFor="image" className="text-slate-400 text-xs">
          Upload a profile picture:
        </label>
        <input id="image" name="image" type="file" accept="image/*" required
          className="grow border border-slate-300 rounded px-2 py-1 outline-none text-slate-800" />
        <label htmlFor="timezone" className="text-slate-400 text-xs">
          Timezone:
        </label>
        <select id="timezone" name="timezone" required
          className="grow border border-slate-300 rounded px-2 py-1 outline-none text-slate-800">
          <option value="America/New_York">America/New_York</option>
          <option value="America/Chicago">America/Chicago</option>
          <option value="America/Denver">America/Denver</option>
          <option value="America/Phoenix">America/Phoenix</option>
          <option value="America/Los_Angeles">America/Los_Angeles</option>
          <option value="America/Anchorage">America/Anchorage</option>
          <option value="America/Adak">America/Adak</option>
          <option value="Pacific/Honolulu">Pacific/Honolulu</option>
          <option value="Pacific/Midway">Pacific/Midway</option>
          <option value="Pacific/Wake">Pacific/Wake</option>
          <option value="Pacific/Guam">Pacific/Guam</option>
          <option value="Pacific/Samoa">Pacific/Samoa</option>
          <option value="Pacific/Tongatapu">Pacific/Tongatapu</option>
          <option value="Pacific/Kiritimati">Pacific/Kiritimati</option>
        </select>
        <div className='flex justify-end gap-2'>
          <button type="submit" className="border text-orange-500 border-orange-500 rounded px-2 py-1 hover:bg-orange-500 hover:bg-opacity-20 focus-within:bg-orange-500 focus-within:bg-opacity-20 active:scale-95 transition-all duration-75">Save Changes</button>
          <Link href="/dashboard" className='border border-gray-300 rounded px-2 py-1 hover:bg-gray-200 focus-within:bg-gray-200 active:scale-95 transition-all duration-75'>Cancel</Link>
        </div>
      </form>
    </div>
  )
}
