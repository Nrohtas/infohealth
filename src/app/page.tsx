'use client';

import Link from 'next/link';
import { useEffect, useState, Suspense } from 'react';
import { motion } from 'framer-motion';
import { useSearchParams } from 'next/navigation';
import SourceReference from '@/components/SourceReference';

interface District {
  ampurcode: string;
  ampurname: string;
  population: number;
  house: number;
}

interface Stats {
  year: number;
  midYearPopulation: number;
  house: number;
  totalTambons: number;
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

function HomeContent() {
  const searchParams = useSearchParams();
  const yearParam = searchParams.get('year');
  const year = yearParam ? Number(yearParam) : 2568;

  const affiliation = searchParams.get('affiliation') || '';
  const districtId = searchParams.get('id');
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      setLoading(true);
      try {
        const idParam = districtId ? `&id=${districtId}` : '';
        const res = await fetch(`/api/stats?year=${year}&affiliation=${affiliation}${idParam}`);
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
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6"
        >
          {/* 1. ประชากร */}
          <motion.div variants={itemVariants} className="dasher-card p-6 flex flex-col gap-8 bg-gradient-to-br from-[#E8EAF6] to-[#C5CAE9] border-none shadow-sm">
            <div className="flex justify-between items-center">
              <span className="font-bold text-indigo-800 uppercase text-sm tracking-widest">ประชากร</span>
              <div className="w-10 h-10 rounded-xl bg-white/60 flex items-center justify-center text-indigo-400 shadow-sm">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-users">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              {loading ? <div className="h-10 w-24 bg-white/40 animate-pulse rounded-lg" /> : <p className="text-3xl font-heading font-black text-indigo-900">{stats ? formatNumber(stats.midYearPopulation) : '-'}</p>}
              <p className="text-sm font-bold text-indigo-500/70 uppercase tracking-wider">จำนวนประชากรทั้งหมดในจังหวัด</p>
            </div>
          </motion.div>

          {/* 2. ตำบล */}
          <motion.div variants={itemVariants} className="dasher-card p-6 flex flex-col gap-8 bg-gradient-to-br from-[#F5F5F5] to-[#EEEEEE] border-none shadow-sm">
            <div className="flex justify-between items-center">
              <span className="font-bold text-slate-800 uppercase text-sm tracking-widest">ตำบล</span>
              <div className="w-10 h-10 rounded-xl bg-white/60 flex items-center justify-center text-slate-500 shadow-sm">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-navigation">
                  <polygon points="3 11 22 2 13 21 11 13 3 11" />
                </svg>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              {loading ? <div className="h-10 w-24 bg-white/40 animate-pulse rounded-lg" /> : <p className="text-3xl font-heading font-black text-slate-900">{stats ? formatNumber(stats.totalTambons || 0) : '-'}</p>}
              <p className="text-sm font-bold text-slate-500/70 uppercase tracking-wider">จำนวนตำบลทั้งหมดในจังหวัด</p>
            </div>
          </motion.div>

          {/* 3. หน่วยบริการ */}
          <motion.div variants={itemVariants} className="dasher-card p-6 flex flex-col gap-8 bg-gradient-to-br from-[#E0F2F1] to-[#B2DFDB] border-none shadow-sm">
            <div className="flex justify-between items-center">
              <span className="font-bold text-teal-800 uppercase text-sm tracking-widest">หน่วยบริการ</span>
              <div className="w-10 h-10 rounded-xl bg-white/60 flex items-center justify-center text-teal-500 shadow-sm">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-hospital">
                  <path d="M12 6v4" />
                  <path d="M14 14h-4" />
                  <path d="M14 18h-4" />
                  <path d="M14 8h-4" />
                  <path d="M18 12h2a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-9a2 2 0 0 1 2-2h2" />
                  <path d="M18 22V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v18" />
                </svg>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              {loading ? <div className="h-10 w-24 bg-white/40 animate-pulse rounded-lg" /> : <p className="text-3xl font-heading font-black text-teal-900">{stats ? formatNumber(stats.totalHospitals || 0) : '-'}</p>}
              <p className="text-sm font-bold text-teal-500/70 uppercase tracking-wider">หน่วยบริการที่เปิดให้บริการในจังหวัด</p>
            </div>
          </motion.div>

          {/* 4. หมู่บ้าน */}
          <motion.div variants={itemVariants} className="dasher-card p-6 flex flex-col gap-8 bg-gradient-to-br from-[#FFF3E0] to-[#FFE0B2] border-none shadow-sm">
            <div className="flex justify-between items-center">
              <span className="font-bold text-orange-800 uppercase text-sm tracking-widest">หมู่บ้าน</span>
              <div className="w-10 h-10 rounded-xl bg-white/60 flex items-center justify-center text-orange-500 shadow-sm">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-flag">
                  <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
                  <line x1="4" x2="4" y1="22" y2="15" />
                </svg>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <p className="text-3xl font-heading font-black text-orange-900">
                {loading ? "..." : formatNumber(stats?.totalVillages || 0)}
              </p>
              <p className="text-sm font-bold text-orange-500/70 uppercase tracking-wider">จำนวนพื้นที่ดำเนินการทั้งหมด</p>
            </div>
          </motion.div>

          {/* 5. บ้าน */}
          <motion.div variants={itemVariants} className="dasher-card p-6 flex flex-col gap-8 bg-gradient-to-br from-[#F3E5F5] to-[#E1BEE7] border-none shadow-sm">
            <div className="flex justify-between items-center">
              <span className="font-bold text-purple-800 uppercase text-sm tracking-widest">บ้าน</span>
              <div className="w-10 h-10 rounded-xl bg-white/60 flex items-center justify-center text-purple-500 shadow-sm">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-map-pin">
                  <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              {loading ? <div className="h-10 w-24 bg-white/40 animate-pulse rounded-lg" /> : <p className="text-3xl font-heading font-black text-purple-900">{stats ? formatNumber(stats.house) : '-'}</p>}
              <p className="text-sm font-bold text-purple-500/70 uppercase tracking-wider">จำนวนที่อยู่อาศัยทั้งหมด</p>
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
            ) : stats?.districts?.map((district, index) => {
              const colors = [
                { bg: 'bg-gradient-to-br from-[#E3F2FD] to-[#E1F5FE]', text: 'text-blue-800', subText: 'text-blue-500/70', accent: 'bg-blue-500/10', icon: 'text-blue-400', statBg: 'bg-white/60' },
                { bg: 'bg-gradient-to-br from-[#FCE4EC] to-[#F8BBD0]', text: 'text-pink-800', subText: 'text-pink-500/70', accent: 'bg-pink-500/10', icon: 'text-pink-400', statBg: 'bg-white/60' },
                { bg: 'bg-gradient-to-br from-[#E0F2F1] to-[#B2DFDB]', text: 'text-teal-800', subText: 'text-teal-500/70', accent: 'bg-teal-500/10', icon: 'text-teal-400', statBg: 'bg-white/60' },
                { bg: 'bg-gradient-to-br from-[#F3E5F5] to-[#E1BEE7]', text: 'text-purple-800', subText: 'text-purple-500/70', accent: 'bg-purple-500/10', icon: 'text-purple-400', statBg: 'bg-white/60' },
                { bg: 'bg-gradient-to-br from-[#FFF3E0] to-[#FFE0B2]', text: 'text-orange-800', subText: 'text-orange-500/70', accent: 'bg-orange-500/10', icon: 'text-orange-400', statBg: 'bg-white/60' },
                { bg: 'bg-gradient-to-br from-[#F1F8E9] to-[#DCEDC8]', text: 'text-green-800', subText: 'text-green-500/70', accent: 'bg-green-500/10', icon: 'text-green-400', statBg: 'bg-white/60' },
                { bg: 'bg-gradient-to-br from-[#E8EAF6] to-[#C5CAE9]', text: 'text-indigo-800', subText: 'text-indigo-500/70', accent: 'bg-indigo-500/10', icon: 'text-indigo-400', statBg: 'bg-white/60' },
                { bg: 'bg-gradient-to-br from-[#FFFDE7] to-[#FFF9C4]', text: 'text-yellow-800', subText: 'text-yellow-600/70', accent: 'bg-yellow-500/10', icon: 'text-yellow-500', statBg: 'bg-white/60' },
                { bg: 'bg-gradient-to-br from-[#EFEBE9] to-[#D7CCC8]', text: 'text-brown-800', subText: 'text-brown-500/70', accent: 'bg-brown-500/10', icon: 'text-brown-400', statBg: 'bg-white/60' },
              ];
              const color = colors[index % colors.length];

              return (
                <motion.div
                  key={district.ampurcode}
                  className={`dasher-card p-7 h-full flex flex-col justify-between group border-none transition-all duration-300 ${color.bg}`}
                >
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex flex-col">
                      <h4 className={`text-lg font-black ${color.text} tracking-tight`}>{district.ampurname}</h4>
                      <span className={`text-[10px] font-black ${color.subText} tracking-wider mt-1 uppercase`}>รหัสอำเภอ: {district.ampurcode}</span>
                    </div>
                  </div>

                  <div className={`grid grid-cols-2 gap-4`}>
                    <div className={`flex flex-col gap-1.5 p-3 rounded-2xl ${color.statBg} shadow-sm backdrop-blur-md transition-all duration-300`}>
                      <div className="flex items-center gap-1.5 mb-1">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500/70">
                          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                          <circle cx="9" cy="7" r="4" />
                          <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                        </svg>
                        <span className={`text-[11px] font-black ${color.subText} uppercase tracking-widest`}>ประชากร</span>
                      </div>
                      <p className={`text-lg font-black ${color.text}`}>{formatNumber(district.population)}</p>
                    </div>

                    <div className={`flex flex-col gap-1.5 p-3 rounded-2xl ${color.statBg} shadow-sm backdrop-blur-md transition-all duration-300`}>
                      <div className="flex items-center gap-1.5 mb-1">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-purple-500/70">
                          <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                          <circle cx="12" cy="10" r="3" />
                        </svg>
                        <span className={`text-[11px] font-black ${color.subText} uppercase tracking-widest`}>บ้าน</span>
                      </div>
                      <p className={`text-lg font-black ${color.text}`}>{formatNumber(district.house)}</p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
        <SourceReference
          url="https://stat.bora.dopa.go.th/new_stat/webPage/statByAgeMonth.php"
          subTitle="ระบบสถิติจำนวนประชากรและบ้าน (สถิติจำนวนประชากร)"
        />
      </motion.div>
    </main >
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div className="p-8 text-center animate-pulse text-indigo-500">กำลังโหลด...</div>}>
      <HomeContent />
    </Suspense>
  );
}
