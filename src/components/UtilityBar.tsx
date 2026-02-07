'use client';

import { useRouter, useSearchParams } from 'next/navigation';

export default function UtilityBar() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const year = Number(searchParams.get('year')) || 2568;

    const handleYearChange = (newYear: number) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set('year', newYear.toString());
        router.push(`?${params.toString()}`);
    };

    return (
        <div className="bg-white/50 backdrop-blur-sm border-b border-gray-100 py-1 md:py-2 relative z-30">
            <div className="max-w-7xl mx-auto px-4 md:px-8 flex justify-end items-center">

                <div className="flex flex-wrap justify-center md:justify-end items-center gap-2 md:gap-3 w-full md:w-auto">
                    <div className="flex flex-wrap items-center gap-1 md:gap-2 bg-white/80 p-1 md:p-1.5 rounded-2xl shadow-sm border border-gray-100 w-full md:w-auto justify-center">

                        {/* Year Selector */}
                        <div className="flex items-center gap-2 px-3 border-r border-gray-100 last:border-r-0">
                            <span className="text-gray-400 text-[10px] md:text-xs font-bold whitespace-nowrap">ปี พ.ศ.</span>
                            <div className="relative group">
                                <select
                                    value={year}
                                    onChange={(e) => handleYearChange(Number(e.target.value))}
                                    className="appearance-none bg-transparent text-[#00BFA5] font-black text-sm md:text-lg outline-none cursor-pointer pr-5 z-10 relative"
                                >
                                    <option value={2568}>2568</option>
                                    <option value={2567}>2567</option>
                                </select>
                                <div className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none text-[#00BFA5]/60 group-hover:text-[#00BFA5] transition-colors">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="m6 9 6 6 6-6" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        {/* District Selector */}
                        <div className="flex items-center gap-2 px-3 border-r border-gray-100 last:border-r-0">
                            <div className="relative group">
                                <select
                                    value={searchParams.get('id') || (typeof window !== 'undefined' && window.location.pathname.includes('/district/') ? window.location.pathname.split('/')[2] : "")}
                                    onChange={(e) => {
                                        const params = new URLSearchParams(searchParams.toString());
                                        if (e.target.value) {
                                            router.push(`/district/${e.target.value}?${params.toString()}`);
                                        } else {
                                            router.push(`/?${params.toString()}`);
                                        }
                                    }}
                                    className="appearance-none bg-transparent text-[#00BFA5] font-black text-sm md:text-lg outline-none cursor-pointer pr-5 z-10 relative min-w-[100px] md:min-w-[130px]"
                                >
                                    <option value="">ภาพรวมจังหวัด</option>
                                    <option value="6501">อ.เมือง</option>
                                    <option value="6502">อ.นครไทย</option>
                                    <option value="6503">อ.ชาติตระการ</option>
                                    <option value="6504">อ.บางระกำ</option>
                                    <option value="6505">อ.บางกระทุ่ม</option>
                                    <option value="6506">อ.พรหมพิราม</option>
                                    <option value="6507">อ.วัดโบสถ์</option>
                                    <option value="6508">อ.วังทอง</option>
                                    <option value="6509">อ.เนินมะปราง</option>
                                </select>
                                <div className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none text-[#00BFA5]/60 group-hover:text-[#00BFA5] transition-colors">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="m6 9 6 6 6-6" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        {/* Affiliation Selector */}
                        <div className="flex items-center gap-2 px-3 border-r border-gray-100 last:border-r-0">
                            <span className="text-gray-400 text-[10px] md:text-xs font-bold whitespace-nowrap">สังกัด</span>
                            <div className="relative group">
                                <select
                                    value={searchParams.get('affiliation') || ""}
                                    onChange={(e) => {
                                        const params = new URLSearchParams(searchParams.toString());
                                        if (e.target.value) {
                                            params.set('affiliation', e.target.value);
                                        } else {
                                            params.delete('affiliation');
                                        }
                                        router.push(`?${params.toString()}`);
                                    }}
                                    className="appearance-none bg-transparent text-[#00BFA5] font-black text-sm md:text-lg outline-none cursor-pointer pr-5 z-10 relative min-w-[80px] md:min-w-[110px]"
                                >
                                    <option value="">ทั้งหมด</option>
                                    <option value="moph">สธ.</option>
                                    <option value="local">อปท.</option>
                                    <option value="other">อื่นๆ</option>
                                </select>
                                <div className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none text-[#00BFA5]/60 group-hover:text-[#00BFA5] transition-colors">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="m6 9 6 6 6-6" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
