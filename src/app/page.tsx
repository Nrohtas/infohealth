'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

interface District {
  ampurcode: string;
  ampurname: string;
  population: number;
  households: number;
}

interface Stats {
  year: number;
  midYearPopulation: number;
  households: number;
  districts: District[];
}

export default function Home() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [year, setYear] = useState(2568);

  useEffect(() => {
    async function fetchStats() {
      setLoading(true);
      try {
        const res = await fetch(`/api/stats?year=${year}`);
        const data = await res.json();
        setStats(data);
      } catch (error) {
        console.error('Failed to fetch stats', error);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, [year]);

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('th-TH').format(num);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 gap-8">
      <div className="w-full max-w-4xl flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
        <h1 className="text-3xl md:text-5xl font-bold text-foreground tracking-wide drop-shadow-sm text-center md:text-left">
          Dashboard ข้อมูลสุขภาพ {stats?.year ? `ปี ${stats.year}` : ''}
        </h1>

        <div className="flex items-center gap-2 bg-background shadow-neumorph rounded-xl px-4 py-2">
          <span className="text-gray-500 font-medium">ปีงบประมาณ:</span>
          <select
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="bg-transparent text-blue-600 font-bold outline-none cursor-pointer"
          >
            <option value={2568}>2568</option>
            <option value={2567}>2567</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 w-full max-w-4xl">
        {/* Mid-year Population Card */}
        <div className="rounded-[30px] bg-background shadow-neumorph p-10 flex flex-col items-center justify-center transition-transform hover:scale-105 duration-300">
          <div className="w-20 h-20 rounded-full bg-background shadow-neumorph flex items-center justify-center mb-6 text-blue-500">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
            </svg>
          </div>
          <h2 className="text-xl text-gray-500 font-semibold mb-2">ประชากรกลางปี</h2>
          {loading ? (
            <div className="h-10 w-32 bg-gray-300 animate-pulse rounded"></div>
          ) : (
            <p className="text-4xl font-bold text-blue-600 tracking-tight">
              {stats ? formatNumber(stats.midYearPopulation) : '-'}
            </p>
          )}
        </div>

        {/* Households Card */}
        <div className="rounded-[30px] bg-background shadow-neumorph p-10 flex flex-col items-center justify-center transition-transform hover:scale-105 duration-300">
          <div className="w-20 h-20 rounded-full bg-background shadow-neumorph flex items-center justify-center mb-6 text-purple-500">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
            </svg>
          </div>
          <h2 className="text-xl text-gray-500 font-semibold mb-2">หลังคาเรือน</h2>
          {loading ? (
            <div className="h-10 w-32 bg-gray-300 animate-pulse rounded"></div>
          ) : (
            <p className="text-4xl font-bold text-purple-600 tracking-tight">
              {stats ? formatNumber(stats.households) : '-'}
            </p>
          )}
        </div>
      </div>

      {/* District Breakdown Table */}
      <div className="w-full max-w-4xl rounded-[30px] bg-background shadow-neumorph p-8 mb-8">
        <h3 className="text-xl font-bold text-foreground mb-6 text-center text-gray-600">ข้อมูลรายอำเภอ</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 text-gray-500">
                <th className="pb-4 text-left font-semibold pl-4">อำเภอ</th>
                <th className="pb-4 text-right font-semibold">ประชากร</th>
                <th className="pb-4 text-right font-semibold pr-4">หลังคาเรือน</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={3} className="text-center py-6 text-gray-400">Loading data...</td></tr>
              ) : stats?.districts?.map((district) => (
                <tr key={district.ampurcode} className="hover:bg-gray-50/50 transition-colors">
                  <td className="py-4 pl-4 text-foreground font-medium">
                    <Link href={`/district/${district.ampurcode}`} className="text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-2 w-full">
                      {district.ampurname}
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                    </Link>
                  </td>
                  <td className="py-4 text-right text-blue-600 font-medium">{formatNumber(district.population)}</td>
                  <td className="py-4 pr-4 text-right text-purple-600 font-medium">{formatNumber(district.households)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
