'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion, Variants } from 'framer-motion';
import SourceReference from '@/components/SourceReference';

interface Hospital {
    hospcode: string;
    hospname: string;
    tmb_name: string;
    population: number;
    male: number;
    female: number;
    house: number;
    hostype_new: string;
}

interface PageProps {
    params: Promise<{ id: string }>;
}

const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
};

const itemVariants: Variants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
        y: 0,
        opacity: 1,
        transition: {
            type: "spring",
            stiffness: 100
        }
    }
};

export default function HouseDistrictPage({ params }: PageProps) {
    const { id } = use(params);
    const searchParams = useSearchParams();
    const router = useRouter();

    const yearParam = searchParams.get('year');
    const year = yearParam ? Number(yearParam) : 2568;
    const affiliation = searchParams.get('affiliation') || '';
    const tambonId = searchParams.get('tambon') || '';

    const [hospitals, setHospitals] = useState<Hospital[]>([]);
    const [districtTotal, setDistrictTotal] = useState({ population: 0, male: 0, female: 0, house: 0 });
    const [loading, setLoading] = useState(true);
    const [villages, setVillages] = useState<Record<string, any[]>>({});
    const [expandedHosp, setExpandedHosp] = useState<string | null>(null);

    const ampurNames: Record<string, string> = {
        '6501': 'อำเภอเมืองพิษณุโลก',
        '6502': 'อำเภอนครไทย',
        '6503': 'อำเภอชาติตระการ',
        '6504': 'อำเภอบางระกำ',
        '6505': 'อำเภอบางกระทุ่ม',
        '6506': 'อำเภอพรหมพิราม',
        '6507': 'อำเภอวัดโบสถ์',
        '6508': 'อำเภอวังทอง',
        '6509': 'อำเภอเนินมะปราง',
    };

    const districtName = ampurNames[id] || `อำเภอ รหัส ${id}`;

    useEffect(() => {
        async function fetchData() {
            setLoading(true);
            try {
                const filterParam = tambonId ? `tambon_code=${tambonId}` : `ampurcode=${id}`;
                const hospRes = await fetch(`/api/hospitals?${filterParam}&year=${year}${affiliation ? `&affiliation=${affiliation}` : ''}`);
                const hospData = await hospRes.json();
                setHospitals(hospData.hospitals || []);
                setDistrictTotal(hospData.districtTotal || { population: 0, male: 0, female: 0, house: 0 });

                const villageRes = await fetch(`/api/villages?${filterParam}&year=${year}`);
                const villageData = await villageRes.json();

                const villageMap: Record<string, any[]> = {};
                if (villageData.villages) {
                    villageData.villages.forEach((v: any) => {
                        if (!villageMap[v.hospcode]) {
                            villageMap[v.hospcode] = [];
                        }
                        villageMap[v.hospcode].push(v);
                    });
                }
                setVillages(villageMap);
            } catch (error) {
                console.error('Failed to fetch data', error);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, [id, tambonId, year, affiliation]);

    const toggleExpand = (hospcode: string) => {
        setExpandedHosp(expandedHosp === hospcode ? null : hospcode);
    };

    const getThemeColors = (hostype: string) => {
        const greenTypes = ['5', '7', '8', '11', '18'];
        const purpleTypes = ['21'];
        if (greenTypes.includes(hostype)) return {
            text: 'text-green-600',
            textDark: 'text-green-700',
            textLight: 'text-green-400',
            bg: 'bg-green-50',
            bgLight: 'bg-green-50/20',
            bgIcon: 'bg-green-100',
            border: 'border-green-100',
            hover: 'hover:bg-green-50/50',
            active: 'bg-green-50/50',
            shadow: 'shadow-green-100'
        };
        if (purpleTypes.includes(hostype)) return {
            text: 'text-purple-600',
            textDark: 'text-purple-700',
            textLight: 'text-purple-400',
            bg: 'bg-purple-50',
            bgLight: 'bg-purple-50/20',
            bgIcon: 'bg-purple-100',
            border: 'border-purple-100',
            hover: 'hover:bg-purple-50/50',
            active: 'bg-purple-50/50',
            shadow: 'shadow-purple-100'
        };
        return {
            text: 'text-slate-600',
            textDark: 'text-slate-700',
            textLight: 'text-slate-400',
            bg: 'bg-slate-50',
            bgLight: 'bg-slate-50/20',
            bgIcon: 'bg-slate-100',
            border: 'border-slate-200',
            hover: 'hover:bg-slate-50',
            active: 'bg-slate-50',
            shadow: 'shadow-slate-100'
        };
    };

    const formatNumber = (num: number) => new Intl.NumberFormat('th-TH').format(num);

    return (
        <div className="min-h-screen flex flex-col items-center py-8 bg-gradient-to-br from-[#F3E5F5] via-white to-[#F3E5F5]">
            <motion.div
                initial="hidden"
                animate="visible"
                variants={containerVariants}
                className="w-full max-w-7xl px-4 md:px-8"
            >
                <motion.div variants={itemVariants} className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                    <div className="flex items-center gap-4">
                        <Link href={`/house?year=${year}${affiliation ? `&affiliation=${affiliation}` : ''}`} className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white/80 shadow-lg text-purple-600 hover:scale-110 active:scale-95 transition-all duration-300 backdrop-blur-md border border-white/50">
                            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 256 256">
                                <path d="M128,32a96,96,0,1,0,96,96A96,96,0,0,0,128,32Zm0,176a80,80,0,1,1,80-80A80,80,0,0,1,128,208Z" fill="currentColor" opacity="0.2"></path>
                                <path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Zm10.34-114.34a8,8,0,0,1,0,11.32L119.31,136H168a8,8,0,0,1,0,16H119.31l19.03,19.03a8,8,0,0,1-11.32,11.32l-32.68-32.69a8,8,0,0,1,0-11.32l32.68-32.68A8,8,0,0,1,138.34,101.66Z" fill="currentColor"></path>
                            </svg>
                        </Link>
                        <div>
                            <h1 className="text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600 tracking-tight drop-shadow-sm">
                                {districtName}
                            </h1>
                            <p className="text-slate-500 font-medium">ข้อมูลบ้านรายอำเภอ ปี {year}</p>
                        </div>
                    </div>
                </motion.div>

                <div className="rounded-[30px] bg-white/70 backdrop-blur-xl shadow-xl border border-white/60 p-6 md:p-8 mb-8 relative overflow-visible">
                    <div className="relative z-10 w-full overflow-x-auto">
                        <table className="w-full border-collapse">
                            <thead className="sticky top-[80px] z-30">
                                <tr className="text-slate-600 text-sm bg-purple-50/95 backdrop-blur-md rounded-xl shadow-sm">
                                    <th className="py-4 pl-4 w-24 rounded-l-xl text-left font-bold sticky top-[80px] bg-purple-50/95 backdrop-blur-md z-30">รหัส</th>
                                    <th className="py-4 text-left font-bold sticky top-[80px] bg-purple-50/95 backdrop-blur-md z-30">ชื่อหน่วยบริการ</th>
                                    <th className="py-4 text-left font-bold sticky top-[80px] bg-purple-50/95 backdrop-blur-md z-30">ตำบล</th>
                                    <th className="py-4 text-right pr-4 rounded-r-xl font-bold sticky top-[80px] bg-purple-50/95 backdrop-blur-md z-30">
                                        <div className="flex items-center justify-end gap-2 text-purple-600">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                                                <circle cx="12" cy="10" r="3" />
                                            </svg>
                                            <span>บ้าน</span>
                                        </div>
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {loading ? (
                                    <tr><td colSpan={4} className="text-center py-12 text-slate-400 font-bold">กำลังโหลดข้อมูล...</td></tr>
                                ) : hospitals.length === 0 ? (
                                    <tr><td colSpan={4} className="text-center py-12 text-slate-400">ไม่พบข้อมูล</td></tr>
                                ) : (
                                    <>
                                        {hospitals.map((hos) => {
                                            const theme = getThemeColors(hos.hostype_new);
                                            return (
                                                <React.Fragment key={hos.hospcode}>
                                                    <tr
                                                        className={`transition-all cursor-pointer group ${theme.hover} ${expandedHosp === hos.hospcode ? `${theme.active} shadow-sm` : ''}`}
                                                        onClick={() => toggleExpand(hos.hospcode)}
                                                    >
                                                        <td className={`py-5 pl-4 font-mono text-sm font-bold ${theme.text}`}>{hos.hospcode}</td>
                                                        <td className={`py-5 font-bold ${theme.text}`}>{hos.hospname}</td>
                                                        <td className="py-5 text-slate-600 font-medium">{hos.tmb_name}</td>
                                                        <td className={`py-5 pr-4 text-right font-black text-xl tracking-tight ${theme.text}`}>
                                                            {hos.house ? formatNumber(hos.house) : '-'}
                                                        </td>
                                                    </tr>
                                                    {expandedHosp === hos.hospcode && (
                                                        <tr>
                                                            <td colSpan={4} className="p-0 border-none">
                                                                <motion.div
                                                                    initial={{ opacity: 0, height: 0 }}
                                                                    animate={{ opacity: 1, height: 'auto' }}
                                                                    className={`${theme.bgLight} p-6 shadow-inner`}
                                                                >
                                                                    <div className={`bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border ${theme.border}`}>
                                                                        <div className="flex justify-between items-center mb-6">
                                                                            <div className="flex items-center gap-3">
                                                                                <div className={`p-2 ${theme.bgIcon} rounded-lg ${theme.text}`}>
                                                                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                                                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                                                                                        <circle cx="12" cy="10" r="3" />
                                                                                    </svg>
                                                                                </div>
                                                                                <h4 className="font-bold text-slate-700 uppercase tracking-tighter">
                                                                                    รายชื่อหมู่บ้านในเขตรับผิดชอบ ({villages[hos.hospcode]?.length || 0})
                                                                                </h4>
                                                                            </div>
                                                                        </div>
                                                                        {villages[hos.hospcode] && villages[hos.hospcode].length > 0 ? (
                                                                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                                                                {villages[hos.hospcode].map((v, i) => (
                                                                                    <div key={`${v.villagecode}-${i}`} className="flex flex-col p-5 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300">
                                                                                        <div className="flex items-baseline gap-2 mb-4 border-b border-slate-50 pb-2">
                                                                                            <span className={`${theme.textLight} text-xs font-mono font-bold`}>{v.villagecode.slice(-2)}</span>
                                                                                            <span className="text-slate-700 font-black truncate">{v.villagename}</span>
                                                                                        </div>
                                                                                        <div className="flex justify-between items-center">
                                                                                            <div className="flex flex-col">
                                                                                                <span className="text-[10px] text-slate-400 uppercase font-black tracking-wider mb-0.5">จำนวนบ้าน</span>
                                                                                                <span className={`${theme.textDark} font-black text-2xl tracking-tighter`}>{formatNumber(v.households)}</span>
                                                                                            </div>
                                                                                            <div className={`p-3 ${theme.bg} rounded-xl ${theme.textLight}`}>
                                                                                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                                                                    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                                                                                                </svg>
                                                                                            </div>
                                                                                        </div>
                                                                                    </div>
                                                                                ))}
                                                                            </div>
                                                                        ) : (
                                                                            <p className="text-center py-8 text-slate-400 italic bg-slate-50 rounded-xl border border-dashed border-slate-200">ไม่มีข้อมูลหมู่บ้าน</p>
                                                                        )}
                                                                    </div>
                                                                </motion.div>
                                                            </td>
                                                        </tr>
                                                    )}
                                                </React.Fragment>
                                            );
                                        })}
                                        <tr className="border-t-2 border-purple-100 bg-white/40 font-bold text-slate-800">
                                            <td colSpan={3} className="py-6 text-right pr-6 text-xl">รวมทั้งหมด</td>
                                            <td className="py-6 pr-4 text-right text-slate-800 text-3xl font-black tracking-tight drop-shadow-sm">
                                                {formatNumber(districtTotal.house)}
                                            </td>
                                        </tr>
                                    </>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
                <SourceReference />
            </motion.div>
        </div >
    );
}
