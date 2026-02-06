'use client';

import { useEffect, useState, use } from 'react';
import Link from 'next/link';

interface Hospital {
    hospcode: string;
    hospname: string;
    tmb_name: string;
    population: number;
    households: number;
}

interface PageProps {
    params: Promise<{ id: string }>;
}

export default function DistrictPage({ params }: PageProps) {
    // Unwrap params using React.use() or await in async component (Next.js 15+)
    const { id } = use(params);

    const [hospitals, setHospitals] = useState<Hospital[]>([]);
    const [loading, setLoading] = useState(true);

    // Map of Ampur Codes to Names (Hardcoded for immediate display, ideally fetched)
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
        async function fetchHospitals() {
            try {
                const res = await fetch(`/api/hospitals?ampurcode=${id}`);
                const data = await res.json();
                setHospitals(data.hospitals || []);
            } catch (error) {
                console.error('Failed to fetch hospitals', error);
            } finally {
                setLoading(false);
            }
        }
        fetchHospitals();
    }, [id]);

    return (
        <div className="min-h-screen flex flex-col items-center p-8 bg-background">
            <div className="w-full max-w-5xl">
                <div className="mb-8 flex items-center gap-4">
                    <Link href="/" className="px-4 py-2 rounded-xl bg-background shadow-neumorph text-blue-500 font-bold hover:scale-105 transition-transform">
                        ← ย้อนกลับ
                    </Link>
                    <h1 className="text-2xl md:text-3xl font-bold text-foreground tracking-wide drop-shadow-sm">
                        รายชื่อหน่วยบริการ {districtName}
                    </h1>
                </div>

                <div className="rounded-[30px] bg-background shadow-neumorph p-8">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-200 text-gray-500 text-sm">
                                    <th className="pb-4 text-left pl-4 w-20">รหัส</th>
                                    <th className="pb-4 text-left">ชื่อหน่วยบริการ</th>
                                    <th className="pb-4 text-left">ตำบล</th>
                                    <th className="pb-4 text-right">ประชากร</th>
                                    <th className="pb-4 text-right pr-4">หลังคาเรือน</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {loading ? (
                                    <tr><td colSpan={5} className="text-center py-8 text-gray-400">Loading hospitals...</td></tr>
                                ) : hospitals.length === 0 ? (
                                    <tr><td colSpan={5} className="text-center py-8 text-gray-400">ไม่พบข้อมูล</td></tr>
                                ) : (
                                    hospitals.map((hos) => (
                                        <tr key={hos.hospcode} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="py-4 pl-4 text-gray-500">{hos.hospcode}</td>
                                            <td className="py-4 text-blue-600 font-medium">{hos.hospname}</td>
                                            <td className="py-4 text-gray-600">{hos.tmb_name}</td>
                                            <td className="py-4 text-right font-medium text-blue-600">
                                                {hos.population ? new Intl.NumberFormat('th-TH').format(hos.population) : '-'}
                                            </td>
                                            <td className="py-4 pr-4 text-right font-medium text-purple-600">
                                                {hos.households ? new Intl.NumberFormat('th-TH').format(hos.households) : '-'}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
