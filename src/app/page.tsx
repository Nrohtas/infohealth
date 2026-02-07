'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useSearchParams } from 'next/navigation';

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
  totalVillages: number;
  totalHospitals: number;
  districts: District[];
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: 'spring' as const, stiffness: 100 }
  }
};

export default function Home() {
  const searchParams = useSearchParams();
  const yearParam = searchParams.get('year');
  const year = yearParam ? Number(yearParam) : 2568;

  const affiliation = searchParams.get('affiliation') || '';
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      setLoading(true);
      try {
        const res = await fetch(`/api/stats?year=${year}&affiliation=${affiliation}`);
        const data = await res.json();
        setStats(data);
      } catch (error) {
        console.error('Failed to fetch stats', error);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, [year, affiliation]);

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('th-TH').format(num);
  };

  return (
    <main className="p-4 md:p-8 max-w-7xl mx-auto">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="space-y-10"
      >
        {/* Header Removed - Moved to Global Layout */}

        {/* Stats Row */}
        <motion.div
          key={year}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          <motion.div variants={itemVariants} className="dasher-card p-6 flex flex-col gap-8">
            <div className="flex justify-between items-center">
              <span className="font-bold text-gray-500 uppercase text-xs tracking-widest">ประชากร</span>
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary text-xl">👥</div>
            </div>
            <div className="flex flex-col gap-2">
              {loading ? <div className="h-10 w-24 bg-gray-100 animate-pulse rounded-lg" /> : <p className="text-3xl font-heading font-black text-gray-800">{stats ? formatNumber(stats.midYearPopulation) : '-'}</p>}
              <p className="text-xs font-bold"><span className="text-primary">+2.4%</span> <span className="text-gray-400">เพิ่มขึ้นจากปีที่แล้ว</span></p>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="dasher-card p-6 flex flex-col gap-8">
            <div className="flex justify-between items-center">
              <span className="font-bold text-gray-500 uppercase text-xs tracking-widest">หลังคาเรือน</span>
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500 text-xl">🏡</div>
            </div>
            <div className="flex flex-col gap-2">
              {loading ? <div className="h-10 w-24 bg-gray-100 animate-pulse rounded-lg" /> : <p className="text-3xl font-heading font-black text-gray-800">{year === 2567 ? '-' : (stats ? formatNumber(stats.households) : '-')}</p>}
              <p className="text-xs font-bold"><span className="text-blue-500">{year === 2567 ? '-' : '+1.2%'}</span> <span className="text-gray-400">อัตราการเติบโตคงที่</span></p>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="dasher-card p-6 flex flex-col gap-8">
            <div className="flex justify-between items-center">
              <span className="font-bold text-gray-500 uppercase text-xs tracking-widest">หมู่บ้าน</span>
              <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-orange-500 text-xl">📍</div>
            </div>
            <div className="flex flex-col gap-2">
              <p className="text-3xl font-heading font-black text-gray-800">
                {loading ? "..." : formatNumber(stats?.totalVillages || 0)}
              </p>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-tighter">จำนวนพื้นที่ดำเนินการ</p>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="dasher-card p-6 flex flex-col gap-8">
            <div className="flex justify-between items-center">
              <span className="font-bold text-gray-500 uppercase text-xs tracking-widest">จำนวนหน่วยบริการ</span>
              <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center text-teal-500 text-xl">🏥</div>
            </div>
            <div className="flex flex-col gap-2">
              <p className="text-3xl font-heading font-black text-gray-800">
                {loading ? "..." : formatNumber(stats?.totalHospitals || 0)}
              </p>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">หน่วยบริการในจังหวัด</p>
            </div>
          </motion.div>
        </motion.div>

        {/* Details Row */}
        <motion.div variants={itemVariants} className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="font-heading font-black text-gray-800 uppercase tracking-tight">ข้อมูลรายอำเภอ</h3>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">เลือกอำเภอเพื่อดูรายละเอียด</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? (
              Array.from({ length: 9 }).map((_, i) => (
                <div key={i} className="dasher-card p-6 h-48 animate-pulse bg-gray-50/50" />
              ))
            ) : stats?.districts?.map((district) => (
              <Link href={`/district/${district.ampurcode}?year=${year}${affiliation ? `&affiliation=${affiliation}` : ''}`} key={district.ampurcode}>
                <motion.div
                  whileHover={{ y: -5, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="dasher-card p-6 h-full flex flex-col justify-between group cursor-pointer border-transparent hover:border-primary/20 transition-all duration-300"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex flex-col">
                      <h4 className="text-xl font-black text-gray-800 group-hover:text-primary transition-colors">{district.ampurname}</h4>
                      <span className="text-[10px] font-black text-gray-400 tracking-wider mt-0.5">รหัสอำเภอ: {district.ampurcode}</span>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-primary/10 group-hover:text-primary transition-all duration-300">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M7 17l9.2-9.2M17 17V7H7" />
                      </svg>
                    </div>
                  </div>

                  <div className={`grid ${year === 2567 ? 'grid-cols-1' : 'grid-cols-2'} gap-4`}>
                    <div className="flex flex-col gap-1 p-3 rounded-2xl bg-blue-50/50 group-hover:bg-blue-50 transition-colors">
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="text-blue-500">👥</span>
                        <span className="text-[9px] font-black text-blue-400 uppercase tracking-widest">ประชากร</span>
                      </div>
                      <p className="text-lg font-black text-blue-600">{formatNumber(district.population)}</p>
                    </div>

                    {year !== 2567 && (
                      <div className="flex flex-col gap-1 p-3 rounded-2xl bg-purple-50/50 group-hover:bg-purple-50 transition-colors">
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className="text-purple-500">🏡</span>
                          <span className="text-[9px] font-black text-purple-400 uppercase tracking-widest">หลังคาเรือน</span>
                        </div>
                        <p className="text-lg font-black text-purple-600">{formatNumber(district.households)}</p>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-50 flex items-center justify-between">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">สถานะ: ตรวจสอบแล้ว</span>
                    <div className="flex -space-x-2">
                      <div className="w-5 h-5 rounded-full border-2 border-white bg-green-400"></div>
                      <div className="w-5 h-5 rounded-full border-2 border-white bg-blue-400"></div>
                    </div>
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </main>
  );
}
