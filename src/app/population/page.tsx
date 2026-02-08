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

export default function PopulationPage() {
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
                {/* Header Removed - Moved to Global Layout */}

                {/* Stats Row */}
                <motion.div
                    key={year}
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
                >
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

                    <motion.div variants={itemVariants} className="dasher-card p-6 flex flex-col gap-8 bg-gradient-to-br from-[#E1F5FE] to-[#B3E5FC] border-none shadow-sm">
                        <div className="flex justify-between items-center">
                            <span className="font-bold text-blue-800 uppercase text-sm tracking-widest">ชาย</span>
                            <div className="w-10 h-10 rounded-xl bg-white/60 flex items-center justify-center text-blue-500 shadow-sm">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M16 3h5v5" />
                                    <path d="m21 3-7 7" />
                                    <circle cx="9" cy="15" r="6" />
                                </svg>
                            </div>
                        </div>
                        <div className="flex flex-col gap-2">
                            {loading ? <div className="h-10 w-24 bg-white/40 animate-pulse rounded-lg" /> : <p className="text-3xl font-heading font-black text-blue-900">{stats ? formatNumber(stats.male) : '-'}</p>}
                            <p className="text-sm font-bold text-blue-500/70 uppercase tracking-wider">จำนวนประชากรชายทั้งหมด</p>
                        </div>
                    </motion.div>

                    <motion.div variants={itemVariants} className="dasher-card p-6 flex flex-col gap-8 bg-gradient-to-br from-[#FCE4EC] to-[#F8BBD0] border-none shadow-sm">
                        <div className="flex justify-between items-center">
                            <span className="font-bold text-pink-800 uppercase text-sm tracking-widest">หญิง</span>
                            <div className="w-10 h-10 rounded-xl bg-white/60 flex items-center justify-center text-pink-500 shadow-sm">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="12" cy="9" r="6" />
                                    <path d="M12 15v7" />
                                    <path d="M9 19h6" />
                                </svg>
                            </div>
                        </div>
                        <div className="flex flex-col gap-2">
                            {loading ? <div className="h-10 w-24 bg-white/40 animate-pulse rounded-lg" /> : <p className="text-3xl font-heading font-black text-pink-900">{stats ? formatNumber(stats.female) : '-'}</p>}
                            <p className="text-sm font-bold text-pink-500/70 uppercase tracking-wider">จำนวนประชากรหญิงทั้งหมด</p>
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
                <motion.div variants={itemVariants} className="space-y-6">
                    <div className="flex justify-between items-center">
                        <h3 className="font-heading font-black text-black uppercase tracking-tight">ข้อมูลรายอำเภอ</h3>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">เลือกอำเภอเพื่อดูรายละเอียด</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {loading ? (
                            Array.from({ length: 9 }).map((_, i) => (
                                <div key={i} className="dasher-card p-6 h-48 animate-pulse bg-gray-50/50" />
                            ))
                        ) : stats?.districts?.filter(d => !districtId || d.ampurcode === districtId).map((district, index) => {
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
                                <Link href={`/population/${district.ampurcode}?year=${year}${affiliation ? `&affiliation=${affiliation}` : ''}`} key={district.ampurcode}>
                                    <motion.div
                                        whileHover={{ y: -8, scale: 1.02, boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)' }}
                                        whileTap={{ scale: 0.97 }}
                                        className={`dasher-card p-7 h-full flex flex-col justify-between group cursor-pointer border-none transition-all duration-300 ${color.bg}`}
                                    >
                                        <div className="flex justify-between items-start mb-6">
                                            <div className="flex flex-col">
                                                <h4 className={`text-lg font-black ${color.text} tracking-tight group-hover:drop-shadow-sm`}>{district.ampurname}</h4>
                                                <span className={`text-[10px] font-black ${color.subText} tracking-wider mt-1 uppercase`}>รหัสอำเภอ: {district.ampurcode}</span>
                                            </div>
                                            <div className={`w-11 h-11 rounded-2xl bg-white/40 flex items-center justify-center ${color.icon} group-hover:scale-110 group-hover:bg-white/60 transition-all duration-500 shadow-sm border border-white/20`}>
                                                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 256 256">
                                                    <path d="M128,32a96,96,0,1,0,96,96A96,96,0,0,0,128,32Zm0,176a80,80,0,1,1,80-80A80,80,0,0,1,128,208Z" fill="currentColor" opacity="0.2"></path>
                                                    <path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Zm45.66-93.66a8,8,0,0,1,0,11.32l-32,32a8,8,0,0,1-11.32-11.32L148.69,136H88a8,8,0,0,1,0-16h60.69l-18.35-18.34a8,8,0,0,1,11.32-11.32Z" fill="currentColor"></path>
                                                </svg>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-3 gap-3">
                                            <div className={`flex flex-col gap-1.5 p-3 rounded-2xl ${color.statBg} shadow-sm backdrop-blur-md transition-all duration-300 group-hover:shadow-md text-center`}>
                                                <span className={`text-[11px] font-black ${color.subText} uppercase tracking-tighter`}>รวม</span>
                                                <p className={`text-base font-black ${color.text}`}>{formatNumber(district.population)}</p>
                                            </div>

                                            <div className={`flex flex-col gap-1.5 p-3 rounded-2xl ${color.statBg} shadow-sm backdrop-blur-md transition-all duration-300 group-hover:shadow-md text-center`}>
                                                <div className="flex items-center justify-center gap-1">
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500">
                                                        <path d="M16 3h5v5" />
                                                        <path d="m21 3-7 7" />
                                                        <circle cx="9" cy="15" r="6" />
                                                    </svg>
                                                    <span className={`text-[11px] font-black ${color.subText} uppercase tracking-tighter`}>ชาย</span>
                                                </div>
                                                <p className={`text-base font-black ${color.text}`}>{formatNumber(district.male)}</p>
                                            </div>

                                            <div className={`flex flex-col gap-1.5 p-3 rounded-2xl ${color.statBg} shadow-sm backdrop-blur-md transition-all duration-300 group-hover:shadow-md text-center`}>
                                                <div className="flex items-center justify-center gap-1">
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-pink-500">
                                                        <circle cx="12" cy="9" r="6" />
                                                        <path d="M12 15v7" />
                                                        <path d="M9 19h6" />
                                                    </svg>
                                                    <span className={`text-[11px] font-black ${color.subText} uppercase tracking-tighter`}>หญิง</span>
                                                </div>
                                                <p className={`text-base font-black ${color.text}`}>{formatNumber(district.female)}</p>
                                            </div>
                                        </div>

                                    </motion.div>
                                </Link>
                            );
                        })}
                    </div>
                </motion.div>
            </motion.div>
        </main>
    );
}
