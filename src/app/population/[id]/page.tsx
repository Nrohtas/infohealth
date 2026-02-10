'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion, Variants } from 'framer-motion';

interface Hospital {
    hospcode: string;
    hospname: string;
    tmb_name: string;
    population: number;
    male: number;
    female: number;
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

export default function PopulationDistrictPage({ params }: PageProps) {
    // Unwrap params using React.use()
    const { id } = use(params);
    const searchParams = useSearchParams();
    const router = useRouter();

    // Derived year and affiliation from URL
    const yearParam = searchParams.get('year');
    const year = yearParam ? Number(yearParam) : 2568;
    const affiliation = searchParams.get('affiliation') || '';

    const tambonId = searchParams.get('tambon') || '';

    const [hospitals, setHospitals] = useState<Hospital[]>([]);
    const [districtTotal, setDistrictTotal] = useState({ population: 0, male: 0, female: 0 });
    const [loading, setLoading] = useState(true);
    const [villages, setVillages] = useState<Record<string, any[]>>({});
    const [expandedHosp, setExpandedHosp] = useState<string | null>(null);

    // Map of Ampur Codes to Names
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

                // Fetch hospitals & totals
                const hospRes = await fetch(`/api/hospitals?${filterParam}&year=${year}${affiliation ? `&affiliation=${affiliation}` : ''}`);
                const hospData = await hospRes.json();
                setHospitals(hospData.hospitals || []);
                setDistrictTotal(hospData.districtTotal || { population: 0, male: 0, female: 0 });

                // Fetch villages
                const villageRes = await fetch(`/api/villages?${filterParam}&year=${year}`, { cache: 'no-store' });
                console.log('Village API Status:', villageRes.status, villageRes.statusText);

                const villageText = await villageRes.text();
                console.log('Village API Raw Response:', villageText);

                try {
                    const villageData = JSON.parse(villageText);
                    console.log('Village Data:', villageData);

                    if (!villageRes.ok) {
                        console.error('Village API Error Object:', villageData);
                    }

                    // Group villages by hospcode...
                    // (logic regarding villageData stays here, but need to reconstruct the flow)
                    // Group villages by hospcode
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

                } catch (parseError) {
                    console.error('Failed to parse Village API response:', parseError);
                }
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

    const getHostColor = (hostype: string) => {
        const greenTypes = ['5', '7', '8', '11', '18'];
        const purpleTypes = ['21'];

        if (greenTypes.includes(hostype)) return 'text-green-600 font-bold';
        if (purpleTypes.includes(hostype)) return 'text-purple-600 font-bold';
        return 'text-gray-900 font-bold';
    };

    const getThemeColors = (hostype: string) => {
        const greenTypes = ['5', '7', '8', '11', '18'];
        const purpleTypes = ['21'];

        if (greenTypes.includes(hostype)) return { bg: 'bg-green-100', text: 'text-green-600' };
        if (purpleTypes.includes(hostype)) return { bg: 'bg-purple-100', text: 'text-purple-600' };
        return { bg: 'bg-slate-100', text: 'text-slate-600' };
    };

    return (
        <div className="min-h-screen flex flex-col items-center py-8 bg-gradient-to-br from-[#E3F2FD] via-[#F3E5F5] to-[#E3F2FD]">
            <motion.div
                initial="hidden"
                animate="visible"
                variants={containerVariants}
                className="w-full max-w-7xl px-4 md:px-8"
            >
                <motion.div variants={itemVariants} className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                    <div className="flex items-center gap-4">
                        <Link href={`/population?year=${year}${affiliation ? `&affiliation=${affiliation}` : ''}`} className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white/80 shadow-lg text-indigo-600 hover:scale-110 active:scale-95 transition-all duration-300 backdrop-blur-md border border-white/50">
                            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 256 256">
                                <path d="M128,32a96,96,0,1,0,96,96A96,96,0,0,0,128,32Zm0,176a80,80,0,1,1,80-80A80,80,0,0,1,128,208Z" fill="currentColor" opacity="0.2"></path>
                                <path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Zm10.34-114.34a8,8,0,0,1,0,11.32L119.31,136H168a8,8,0,0,1,0,16H119.31l19.03,19.03a8,8,0,0,1-11.32,11.32l-32.68-32.69a8,8,0,0,1,0-11.32l32.68-32.68A8,8,0,0,1,138.34,101.66Z" fill="currentColor"></path>
                            </svg>
                        </Link>
                        <div>
                            <h1 className="text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 tracking-tight drop-shadow-sm">
                                {districtName}
                            </h1>
                            <p className="text-slate-500 font-medium">ข้อมูลประชากรรายอำเภอ ปี {year}</p>
                        </div>
                    </div>
                </motion.div>

                <div className="rounded-[30px] bg-white/70 backdrop-blur-xl shadow-xl border border-white/60 p-6 md:p-8 mb-8 relative overflow-visible">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-purple-200/20 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-200/20 rounded-full blur-3xl -ml-16 -mb-16 pointer-events-none"></div>

                    <div className="relative z-10 w-full">
                        <table className="w-full border-collapse">
                            <thead className="sticky top-[100px] z-30">
                                <tr className="text-slate-600 text-sm bg-indigo-50/95 backdrop-blur-md rounded-xl">
                                    <th className="py-4 pl-4 w-24 rounded-l-xl text-left sticky top-[100px] bg-indigo-50/95 backdrop-blur-md">
                                        <div className="flex items-center gap-2">
                                            <div className="p-1.5 bg-indigo-100 rounded-lg text-indigo-600">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                                                    <line x1="12" y1="8" x2="12" y2="16" />
                                                    <line x1="8" y1="12" x2="16" y2="12" />
                                                </svg>
                                            </div>
                                            <span className="font-bold">รหัส</span>
                                        </div>
                                    </th>
                                    <th className="py-4 text-left sticky top-[96px] bg-indigo-50/95 backdrop-blur-md">
                                        <div className="flex items-center gap-2">
                                            <div className="p-1.5 bg-blue-100 rounded-lg text-blue-600">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                    <path d="M3 21h18" />
                                                    <path d="M3 7v1a3 3 0 0 0 6 0V7m0 1a3 3 0 0 0 6 0V7m0 1a3 3 0 0 0 6 0V7H3l2-4h14l2 4" />
                                                    <path d="M5 21V10.85" />
                                                    <path d="M19 21V10.85" />
                                                    <path d="M9 21v-4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v4" />
                                                </svg>
                                            </div>
                                            <span className="font-bold">ชื่อหน่วยบริการ</span>
                                        </div>
                                    </th>
                                    <th className="py-4 text-left sticky top-[96px] bg-indigo-50/95 backdrop-blur-md">
                                        <div className="flex items-center gap-2">
                                            <div className="p-1.5 bg-purple-100 rounded-lg text-purple-600">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                    <polygon points="3 11 22 2 13 21 11 13 3 11" />
                                                </svg>
                                            </div>
                                            <span className="font-bold">ตำบล</span>
                                        </div>
                                    </th>
                                    <th className="py-4 text-right sticky top-[96px] bg-purple-50/95 backdrop-blur-md">
                                        <div className="flex items-center justify-end gap-2 text-slate-600">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                                                <circle cx="9" cy="7" r="4"></circle>
                                                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                                                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                                            </svg>
                                            <span className="font-bold">รวม</span>
                                        </div>
                                    </th>
                                    <th className="py-4 text-right sticky top-[96px] bg-purple-50/95 backdrop-blur-md">
                                        <div className="flex items-center justify-end gap-2 text-blue-600">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M16 3h5v5" />
                                                <path d="m21 3-7 7" />
                                                <circle cx="9" cy="15" r="6" />
                                            </svg>
                                            <span className="font-bold">ชาย</span>
                                        </div>
                                    </th>
                                    <th className="py-4 text-right pr-4 rounded-r-xl sticky top-[96px] bg-purple-50/95 backdrop-blur-md">
                                        <div className="flex items-center justify-end gap-2 text-pink-600">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                                <circle cx="12" cy="9" r="6" />
                                                <path d="M12 15v7" />
                                                <path d="M9 19h6" />
                                            </svg>
                                            <span className="font-bold">หญิง</span>
                                        </div>
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {loading ? (
                                    <tr><td colSpan={6} className="text-center py-12 text-slate-400">Loading...</td></tr>
                                ) : hospitals.length === 0 ? (
                                    <tr><td colSpan={6} className="text-center py-12 text-slate-400">ไม่พบข้อมูล</td></tr>
                                ) : (
                                    <>
                                        {hospitals.map((hos) => {
                                            const theme = getThemeColors(hos.hostype_new);
                                            return (
                                                <React.Fragment key={hos.hospcode}>
                                                    <tr
                                                        className={`transition-all cursor-pointer group hover:bg-white/60 ${expandedHosp === hos.hospcode ? 'bg-white/60 shadow-sm' : ''}`}
                                                        onClick={() => toggleExpand(hos.hospcode)}
                                                    >
                                                        <td className={`py-5 pl-4 font-mono text-sm ${getHostColor(hos.hostype_new)}`}>{hos.hospcode}</td>
                                                        <td className={`py-5 ${getHostColor(hos.hostype_new)}`}>{hos.hospname}</td>
                                                        <td className="py-5 text-slate-600">{hos.tmb_name}</td>
                                                        <td className="py-5 text-right text-slate-800 font-bold text-lg">
                                                            {hos.population ? new Intl.NumberFormat('th-TH').format(hos.population) : '-'}
                                                        </td>
                                                        <td className="py-5 text-right text-blue-600 font-bold">
                                                            {hos.male ? new Intl.NumberFormat('th-TH').format(hos.male) : '-'}
                                                        </td>
                                                        <td className="py-5 pr-4 text-right text-pink-600 font-bold">
                                                            {hos.female ? new Intl.NumberFormat('th-TH').format(hos.female) : '-'}
                                                        </td>
                                                    </tr>
                                                    {expandedHosp === hos.hospcode && (
                                                        <tr>
                                                            <td colSpan={6} className="p-0 border-none">
                                                                <motion.div
                                                                    initial={{ opacity: 0, height: 0 }}
                                                                    animate={{ opacity: 1, height: 'auto' }}
                                                                    exit={{ opacity: 0, height: 0 }}
                                                                    className="bg-indigo-50/30 p-6 shadow-inner"
                                                                >
                                                                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-white/60">
                                                                        <div className="flex justify-between items-center mb-6">
                                                                            <div className="flex items-center gap-3">
                                                                                <div className={`p-2 rounded-lg ${theme.bg} ${theme.text}`}>
                                                                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                                                        <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                                                                                        <polyline points="9 22 9 12 15 12 15 22" />
                                                                                    </svg>
                                                                                </div>
                                                                                <h4 className={`font-bold ${theme.text}`}>
                                                                                    รายชื่อหมู่บ้านในเขตรับผิดชอบ ({villages[hos.hospcode]?.length || 0})
                                                                                </h4>
                                                                            </div>
                                                                            <div className="flex gap-4 text-xs font-bold uppercase text-slate-400 tracking-wider">
                                                                                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-slate-800"></span> รวม</span>
                                                                                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span> ชาย</span>
                                                                                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-pink-500"></span> หญิง</span>
                                                                            </div>
                                                                        </div>
                                                                        {villages[hos.hospcode] && villages[hos.hospcode].length > 0 ? (
                                                                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                                                                {villages[hos.hospcode].map((v, i) => (
                                                                                    <div key={`${v.villagecode}-${i}`} className="flex flex-col p-4 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300">
                                                                                        <div className="flex items-baseline gap-2 mb-4 border-b border-slate-50 pb-2">
                                                                                            <span className="text-slate-400 text-xs font-mono">{v.villagecode.slice(-2)}</span>
                                                                                            <span className="text-slate-700 font-bold truncate">{v.villagename}</span>
                                                                                        </div>
                                                                                        <div className="flex justify-between items-center">
                                                                                            <div className="flex flex-col">
                                                                                                <span className="text-[10px] text-slate-400 uppercase font-black tracking-wider mb-0.5">รวม</span>
                                                                                                <span className="text-slate-800 font-black text-lg">{new Intl.NumberFormat('th-TH').format(v.population)}</span>
                                                                                            </div>
                                                                                            <div className="w-px h-8 bg-slate-100"></div>
                                                                                            <div className="flex flex-col items-center">
                                                                                                <span className="text-[10px] text-blue-400 uppercase font-black tracking-wider mb-0.5">ชาย</span>
                                                                                                <span className="text-blue-600 font-bold">{new Intl.NumberFormat('th-TH').format(v.male)}</span>
                                                                                            </div>
                                                                                            <div className="w-px h-8 bg-slate-100"></div>
                                                                                            <div className="flex flex-col items-end">
                                                                                                <span className="text-[10px] text-pink-400 uppercase font-black tracking-wider mb-0.5">หญิง</span>
                                                                                                <span className="text-pink-600 font-bold">{new Intl.NumberFormat('th-TH').format(v.female)}</span>
                                                                                            </div>
                                                                                        </div>
                                                                                    </div>
                                                                                ))}
                                                                            </div>
                                                                        ) : (
                                                                            <div className="flex flex-col items-center justify-center py-8 text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                                                                                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mb-2 opacity-50">
                                                                                    <circle cx="12" cy="12" r="10" />
                                                                                    <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
                                                                                </svg>
                                                                                <p className="text-sm italic">ไม่มีข้อมูลหมู่บ้าน</p>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </motion.div>
                                                            </td>
                                                        </tr>
                                                    )}
                                                </React.Fragment>
                                            );
                                        })}
                                        <tr className="border-t-2 border-indigo-100 bg-white/40 font-bold text-slate-800">
                                            <td className="py-6 pl-4 text-lg"></td>
                                            <td colSpan={2} className="py-6 text-right pr-4 text-lg">รวมทั้งหมด</td>
                                            <td className="py-6 text-right text-slate-900 text-lg">
                                                {new Intl.NumberFormat('th-TH').format(districtTotal.population)}
                                            </td>
                                            <td className="py-6 text-right text-blue-600 text-lg">
                                                {new Intl.NumberFormat('th-TH').format(districtTotal.male)}
                                            </td>
                                            <td className="py-6 pr-4 text-right text-pink-600 text-lg">
                                                {new Intl.NumberFormat('th-TH').format(districtTotal.female)}
                                            </td>
                                        </tr>
                                    </>
                                )
                                }
                            </tbody>
                        </table>
                    </div>
                </div>
            </motion.div>
        </div >
    );
}
