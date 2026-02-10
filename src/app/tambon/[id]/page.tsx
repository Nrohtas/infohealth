'use client';

import React, { useEffect, useState, use, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion, Variants } from 'framer-motion';
import SourceReference from '@/components/SourceReference';

interface Hospital {
    hospcode: string;
    hospname: string;
    tmb_name: string;
    population: number;
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

function TambonContent({ params }: PageProps) {
    // Unwrap params using React.use()
    const { id } = use(params); // id is tambon_code (6 digits)
    const searchParams = useSearchParams();
    const router = useRouter();

    // Derived year and affiliation from URL
    const yearParam = searchParams.get('year');
    const year = yearParam ? Number(yearParam) : 2568;
    const affiliation = searchParams.get('affiliation') || '';

    const [hospitals, setHospitals] = useState<Hospital[]>([]);
    const [tambonTotal, setTambonTotal] = useState({ population: 0, house: 0 });
    const [loading, setLoading] = useState(true);
    const [villages, setVillages] = useState<Record<string, any[]>>({});
    const [expandedHosp, setExpandedHosp] = useState<string | null>(null);
    const [tambonName, setTambonName] = useState<string>('');

    // Extract District ID from Tambon ID
    const districtId = id.substring(0, 4);

    useEffect(() => {
        async function fetchData() {
            setLoading(true);
            try {
                // Fetch hospitals & totals by tambon_code
                const hospRes = await fetch(`/api/hospitals?tambon_code=${id}&year=${year}${affiliation ? `&affiliation=${affiliation}` : ''}`);
                const hospData = await hospRes.json();
                setHospitals(hospData.hospitals || []);
                setTambonTotal(hospData.districtTotal || { population: 0, house: 0 });

                if (hospData.hospitals && hospData.hospitals.length > 0) {
                    setTambonName(hospData.hospitals[0].tmb_name);
                }

                // Fetch villages by tambon_code
                const villageRes = await fetch(`/api/villages?tambon_code=${id}&year=${year}`);
                const villageData = await villageRes.json();

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
            } catch (error) {
                console.error('Failed to fetch data', error);
            } finally {
                setLoading(false);
            }
        }
        if (id && id.length === 6) {
            fetchData();
        }
    }, [id, year, affiliation]);

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

    return (
        <div className="min-h-screen flex flex-col items-center py-8 bg-background">
            <motion.div
                initial="hidden"
                animate="visible"
                variants={containerVariants}
                className="w-full max-w-7xl px-4 md:px-8"
            >
                <motion.div variants={itemVariants} className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                    <div className="flex items-center gap-4">
                        <Link href={`/district/${districtId}?year=${year}${affiliation ? `&affiliation=${affiliation}` : ''}`} className="w-10 h-10 flex items-center justify-center rounded-full bg-background shadow-neumorph text-blue-500 hover:scale-110 active:scale-95 transition-all duration-300">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M19 12H5M12 19l-7-7 7-7" />
                            </svg>
                        </Link>
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold text-foreground tracking-wide drop-shadow-sm">
                                ตำบล{tambonName || id}
                            </h1>
                            <p className="text-sm text-gray-500 font-medium">รหัสตำบล: {id}</p>
                        </div>
                    </div>
                </motion.div>

                <motion.div variants={itemVariants} className="rounded-[30px] bg-background shadow-neumorph p-8 mb-8">
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="border-b border-gray-200 text-gray-500 text-sm">
                                    <th className="pb-4 text-left pl-4 w-24">
                                        <div className="flex items-center gap-2">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
                                                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                                                <line x1="12" y1="8" x2="12" y2="16" />
                                                <line x1="8" y1="12" x2="16" y2="12" />
                                            </svg>
                                            <span>รหัส</span>
                                        </div>
                                    </th>
                                    <th className="pb-4 text-left">
                                        <div className="flex items-center gap-2">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
                                                <path d="M3 21h18" />
                                                <path d="M3 7v1a3 3 0 0 0 6 0V7m0 1a3 3 0 0 0 6 0V7m0 1a3 3 0 0 0 6 0V7H3l2-4h14l2 4" />
                                                <path d="M5 21V10.85" />
                                                <path d="M19 21V10.85" />
                                                <path d="M9 21v-4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v4" />
                                            </svg>
                                            <span>ชื่อหน่วยบริการ</span>
                                        </div>
                                    </th>
                                    <th className="pb-4 text-left">
                                        <div className="flex items-center gap-2">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
                                                <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                                                <polyline points="9 22 9 12 15 12 15 22" />
                                            </svg>
                                            <span>ตำบล</span>
                                        </div>
                                    </th>
                                    <th className="pb-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-400">
                                                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                                                <circle cx="9" cy="7" r="4"></circle>
                                                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                                                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                                            </svg>
                                            <span>ประชากร</span>
                                        </div>
                                    </th>
                                    {year !== 2567 && (
                                        <th className="pb-4 text-right pr-4">
                                            <div className="flex items-center justify-end gap-2">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-400">
                                                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                                                    <polyline points="9 22 9 12 15 12 15 22"></polyline>
                                                </svg>
                                                <span>บ้าน</span>
                                            </div>
                                        </th>
                                    )}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {loading ? (
                                    <tr><td colSpan={year === 2567 ? 4 : 5} className="text-center py-8 text-gray-400">Loading...</td></tr>
                                ) : hospitals.length === 0 ? (
                                    <tr><td colSpan={year === 2567 ? 4 : 5} className="text-center py-8 text-gray-400">ไม่พบข้อมูล</td></tr>
                                ) : (
                                    <>
                                        {hospitals.map((hos) => (
                                            <React.Fragment key={hos.hospcode}>
                                                <tr
                                                    className="hover:bg-gray-50/50 transition-colors cursor-pointer group"
                                                    onClick={() => toggleExpand(hos.hospcode)}
                                                >
                                                    <td className={`py-4 pl-4 ${getHostColor(hos.hostype_new)}`}>{hos.hospcode}</td>
                                                    <td className={`py-4 ${getHostColor(hos.hostype_new)}`}>{hos.hospname}</td>
                                                    <td className="py-4 text-gray-600">{hos.tmb_name}</td>
                                                    <td className="py-4 text-right text-blue-600 font-medium">
                                                        {hos.population ? new Intl.NumberFormat('th-TH').format(hos.population) : '-'}
                                                    </td>
                                                    {year !== 2567 && (
                                                        <td className="py-4 pr-4 text-right text-purple-600 font-medium">
                                                            {hos.house ? new Intl.NumberFormat('th-TH').format(hos.house) : '-'}
                                                        </td>
                                                    )}
                                                </tr>
                                                {expandedHosp === hos.hospcode && (
                                                    <tr className="bg-gray-50/30">
                                                        <td colSpan={year === 2567 ? 4 : 5} className="p-4">
                                                            <motion.div
                                                                initial={{ opacity: 0, y: -10 }}
                                                                animate={{ opacity: 1, y: 0 }}
                                                                className="bg-white rounded-xl p-6 shadow-inner border border-gray-100"
                                                            >
                                                                <div className="flex justify-between items-center mb-4">
                                                                    <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider">
                                                                        รายชื่อหมู่บ้านในเขตรับผิดชอบ ({villages[hos.hospcode]?.length || 0})
                                                                    </h4>
                                                                    <div className="flex gap-4 text-[10px] font-black uppercase text-gray-400 tracking-widest">
                                                                        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500"></span> ประชากร</span>
                                                                        {year !== 2567 && <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-purple-500"></span> บ้าน</span>}
                                                                    </div>
                                                                </div>
                                                                {villages[hos.hospcode] && villages[hos.hospcode].length > 0 ? (
                                                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                                                        {villages[hos.hospcode].map((v) => (
                                                                            <div key={v.villagecode} className="flex flex-col p-3 rounded-xl bg-gray-50 border border-gray-100 hover:bg-white hover:shadow-md transition-all duration-300">
                                                                                <div className="flex justify-between items-start mb-3">
                                                                                    <span className="text-gray-400 text-xs font-mono">{v.villagecode.slice(-2)}</span>
                                                                                    <span className="text-gray-800 font-bold text-sm truncate">{v.villagename}</span>
                                                                                </div>
                                                                                <div className="flex justify-between items-center">
                                                                                    <div className="flex flex-col">
                                                                                        <span className="text-[10px] text-gray-400 uppercase font-black tracking-tighter">ประชากร</span>
                                                                                        <span className="text-blue-600 font-bold text-sm">{new Intl.NumberFormat('th-TH').format(v.population)}</span>
                                                                                    </div>
                                                                                    {year !== 2567 && (
                                                                                        <>
                                                                                            <div className="w-px h-6 bg-gray-200"></div>
                                                                                            <div className="flex flex-col items-end">
                                                                                                <span className="text-[10px] text-gray-400 uppercase font-black tracking-tighter">บ้าน</span>
                                                                                                <span className="text-purple-600 font-bold text-sm">{new Intl.NumberFormat('th-TH').format(v.house || 0)}</span>
                                                                                            </div>
                                                                                        </>
                                                                                    )}
                                                                                </div>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                ) : (
                                                                    <p className="text-sm text-gray-400 italic text-center py-4">ไม่มีข้อมูลหมู่บ้าน</p>
                                                                )}
                                                            </motion.div>
                                                        </td>
                                                    </tr>
                                                )}
                                            </React.Fragment>
                                        ))}
                                        <tr className="border-t font-bold text-gray-800">
                                            <td className="py-4 pl-4">รวมทั้งหมด</td>
                                            <td colSpan={2}></td>
                                            <td className="py-4 text-right">
                                                {new Intl.NumberFormat('th-TH').format(tambonTotal.population)}
                                            </td>
                                            {year !== 2567 && (
                                                <td className="py-4 pr-4 text-right">
                                                    {new Intl.NumberFormat('th-TH').format(tambonTotal.house)}
                                                </td>
                                            )}
                                        </tr>
                                    </>
                                )}
                            </tbody>
                        </table>
                    </div>
                </motion.div>
                <SourceReference
                    url="https://stat.bora.dopa.go.th/new_stat/webPage/statByAgeMonth.php"
                    subTitle="ระบบสถิติจำนวนประชากรและบ้าน (สถิติจำนวนประชากร)"
                />
            </motion.div>
        </div>
    );
}

export default function TambonPage(props: PageProps) {
    return (
        <Suspense fallback={<div className="p-8 text-center animate-pulse text-indigo-500">กำลังโหลด...</div>}>
            <TambonContent {...props} />
        </Suspense>
    );
}
