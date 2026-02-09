'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useSearchParams } from 'next/navigation';

interface District {
    ampurcode: string;
    ampurname: string;
    population: number;
    male: number;
    female: number;
    house: number;
}

interface Stats {
    year: number;
    midYearPopulation: number;
    male: number;
    female: number;
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

export default function HousePage() {
    const searchParams = useSearchParams();
    const yearParam = searchParams.get('year');
    const year = yearParam ? Number(yearParam) : 2568;

    const affiliation = searchParams.get('affiliation') || '';
    const districtId = searchParams.get('id');
    const tambonId = searchParams.get('tambon');
    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchStats() {
            setLoading(true);
            try {
                const idParam = districtId ? `&id=${districtId}` : '';
                const tambonParam = tambonId ? `&tambon=${tambonId}` : '';
                const res = await fetch(`/api/stats?year=${year}&affiliation=${affiliation}${idParam}${tambonParam}`);
                const data = await res.json();
                setStats(data);
            } catch (error) {
                console.error('Failed to fetch stats', error);
            } finally {
                setLoading(false);
            }
        }
        fetchStats();
    }, [year, affiliation, districtId, tambonId]);

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
                {/* Stats Row */}
                <motion.div
                    key={year}
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
                >
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
                            <p className="text-sm font-bold text-purple-500/70 uppercase tracking-wider">บ้านทั้งหมด</p>
                        </div>
                    </motion.div>

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
                            {loading ? <div className="h-10 w-24 bg-white/40 animate-pulse rounded-lg" /> : <p className="text-3xl font-heading font-black text-orange-900">{stats ? formatNumber(stats.totalVillages) : '-'}</p>}
                            <p className="text-sm font-bold text-orange-500/70 uppercase tracking-wider">จำนวนพื้นที่ดำเนินการ</p>
                        </div>
                    </motion.div>

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
                            {loading ? <div className="h-10 w-24 bg-white/40 animate-pulse rounded-lg" /> : <p className="text-3xl font-heading font-black text-slate-900">{stats?.totalTambons ? formatNumber(stats.totalTambons) : '-'}</p>}
                            <p className="text-sm font-bold text-slate-500/70 uppercase tracking-wider">จำนวนเขตการปกครอง</p>
                        </div>
                    </motion.div>

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
                            <p className="text-sm font-bold text-teal-500/70 uppercase tracking-wider">หน่วยบริการที่เปิดให้บริการ</p>
                        </div>
                    </motion.div>
                </motion.div>

                {/* Details Row */}
                <div className="space-y-6">
                    <div className="flex justify-between items-center sticky top-[100px] z-30 py-6 bg-white/95 backdrop-blur-md -mx-4 px-4 md:-mx-8 md:px-8 border-b border-gray-100 shadow-sm transition-all duration-300">
                        <h3 className="font-heading font-black text-black uppercase tracking-tight">ข้อมูลบ้านรายอำเภอ</h3>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">เลือกอำเภอเพื่อดูรายละเอียด</p>
                    </div>

                    <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {loading ? (
                            Array.from({ length: 9 }).map((_, i) => (
                                <div key={i} className="dasher-card p-6 h-48 animate-pulse bg-gray-50/50" />
                            ))
                        ) : stats?.districts?.filter(d => !districtId || d.ampurcode === districtId).map((district, index) => {
                            const colors = [
                                { bg: 'bg-gradient-to-br from-[#F3E5F5] to-[#E1BEE7]', text: 'text-purple-800', subText: 'text-purple-500/70', accent: 'bg-purple-500/10', icon: 'text-purple-400', statBg: 'bg-white/60', bar: 'bg-purple-500' },
                                { bg: 'bg-gradient-to-br from-[#E3F2FD] to-[#E1F5FE]', text: 'text-blue-800', subText: 'text-blue-500/70', accent: 'bg-blue-500/10', icon: 'text-blue-400', statBg: 'bg-white/60', bar: 'bg-blue-500' },
                                { bg: 'bg-gradient-to-br from-[#FCE4EC] to-[#F8BBD0]', text: 'text-pink-800', subText: 'text-pink-500/70', accent: 'bg-pink-500/10', icon: 'text-pink-400', statBg: 'bg-white/60', bar: 'bg-pink-500' },
                                { bg: 'bg-gradient-to-br from-[#E0F2F1] to-[#B2DFDB]', text: 'text-teal-800', subText: 'text-teal-500/70', accent: 'bg-teal-500/10', icon: 'text-teal-400', statBg: 'bg-white/60', bar: 'bg-teal-500' },
                                { bg: 'bg-gradient-to-br from-[#FFF3E0] to-[#FFE0B2]', text: 'text-orange-800', subText: 'text-orange-500/70', accent: 'bg-orange-500/10', icon: 'text-orange-400', statBg: 'bg-white/60', bar: 'bg-orange-500' },
                                { bg: 'bg-gradient-to-br from-[#F1F8E9] to-[#DCEDC8]', text: 'text-green-800', subText: 'text-green-500/70', accent: 'bg-green-500/10', icon: 'text-green-400', statBg: 'bg-white/60', bar: 'bg-green-500' },
                                { bg: 'bg-gradient-to-br from-[#E8EAF6] to-[#C5CAE9]', text: 'text-indigo-800', subText: 'text-indigo-500/70', accent: 'bg-indigo-500/10', icon: 'text-indigo-400', statBg: 'bg-white/60', bar: 'bg-indigo-500' },
                                { bg: 'bg-gradient-to-br from-[#FFFDE7] to-[#FFF9C4]', text: 'text-yellow-800', subText: 'text-yellow-600/70', accent: 'bg-yellow-500/10', icon: 'text-yellow-500', statBg: 'bg-white/60', bar: 'bg-yellow-500' },
                                { bg: 'bg-gradient-to-br from-[#EFEBE9] to-[#D7CCC8]', text: 'text-slate-800', subText: 'text-slate-500/70', accent: 'bg-slate-500/10', icon: 'text-slate-400', statBg: 'bg-white/60', bar: 'bg-slate-500' },
                            ];
                            const color = colors[index % colors.length];

                            // Calculate max house for relative bar and ranking
                            const maxHouse = stats?.districts ? Math.max(...stats.districts.map(d => d.house)) : 0;
                            const rankedDistricts = stats?.districts ? [...stats.districts].sort((a, b) => b.house - a.house) : [];
                            const ranking = rankedDistricts.findIndex(d => d.ampurcode === district.ampurcode) + 1;

                            return (
                                <Link href={`/house/${district.ampurcode}?year=${year}${affiliation ? `&affiliation=${affiliation}` : ''}`} key={district.ampurcode}>
                                    <motion.div
                                        whileHover={{ y: -8, scale: 1.02, boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)' }}
                                        whileTap={{ scale: 0.97 }}
                                        className={`dasher-card p-7 h-full flex flex-col justify-between group cursor-pointer border-none transition-all duration-300 ${color.bg}`}
                                    >
                                        <div className="flex justify-between items-start mb-6">
                                            <div className="flex flex-col">
                                                <h4 className={`text-lg font-black ${color.text} tracking-tight group-hover:drop-shadow-sm`}>{district.ampurname}</h4>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className={`text-[10px] font-black ${color.subText} tracking-wider uppercase whitespace-nowrap`}>รหัสอำเภอ: {district.ampurcode}</span>
                                                </div>
                                            </div>
                                            <div className={`w-11 h-11 rounded-2xl bg-white/40 flex items-center justify-center ${color.icon} group-hover:scale-110 group-hover:bg-white/60 transition-all duration-500 shadow-sm border border-white/20 relative`}>
                                                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                    <path d="M7 7h10v10" />
                                                    <path d="M7 17 17 7" />
                                                </svg>
                                                {ranking === 1 && (
                                                    <motion.div
                                                        animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
                                                        transition={{ repeat: Infinity, duration: 2 }}
                                                        className="absolute -top-2 -right-2 text-yellow-500 drop-shadow-sm"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                                            <path d="M5 16L3 5L8.5 10L12 4L15.5 10L21 5L19 16H5M19 19c0 .6-.4 1-1 1H6c-.6 0-1-.4-1-1v-1h14v1Z" />
                                                        </svg>
                                                    </motion.div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex flex-col gap-3">
                                            <div className={`flex flex-col gap-1 p-4 rounded-2xl ${color.statBg} shadow-sm backdrop-blur-md transition-all duration-300 group-hover:shadow-md`}>
                                                <div className="flex justify-between items-baseline">
                                                    <span className={`text-sm font-black ${color.subText} uppercase tracking-tighter`}>บ้าน</span>
                                                    <span className={`text-xl font-black ${color.text} tracking-tight`}>{formatNumber(district.house)}</span>
                                                </div>
                                                <div className="w-full h-2 bg-white/40 rounded-full overflow-hidden mt-1.5 shadow-inner">
                                                    <motion.div
                                                        initial={{ width: 0 }}
                                                        animate={{ width: maxHouse > 0 ? `${(district.house / maxHouse) * 100}%` : '0%' }}
                                                        transition={{ duration: 1.5, ease: "easeOut" }}
                                                        className={`h-full ${color.bar} opacity-60 shadow-sm`}
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                    </motion.div>
                                </Link>
                            );
                        })}
                    </motion.div>
                </div>
            </motion.div>
        </main>
    );
}
