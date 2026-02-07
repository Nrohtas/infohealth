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
        <div className="bg-white/50 backdrop-blur-sm border-b border-gray-100 py-3 px-4 md:px-8 relative z-30">
            <div className="max-w-[1920px] mx-auto flex justify-end items-center">

                <div className="flex items-center gap-6 bg-white p-2 rounded-2xl shadow-sm border border-gray-100/50">
                    {/* Year Selector */}
                    <div className="flex items-center gap-3 px-2">
                        <span className="text-gray-400 text-sm font-bold">ปี พ.ศ.</span>
                        <div className="relative group">
                            <select
                                value={year}
                                onChange={(e) => handleYearChange(Number(e.target.value))}
                                className="appearance-none bg-transparent text-[#00BFA5] font-black text-xl outline-none cursor-pointer pr-6 z-10 relative"
                            >
                                <option value={2568}>2568</option>
                                <option value={2567}>2567</option>
                            </select>
                            <div className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none text-[#00BFA5]">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="m6 9 6 6 6-6" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
