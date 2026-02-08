'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';

interface PopulationData {
    ageGroup: string;
    male: number;
    female: number;
}

interface Props {
    data: PopulationData[];
}

export default function PopulationPyramid({ data }: Props) {
    const maxVal = useMemo(() => {
        return Math.max(...data.map(d => Math.max(d.male, d.female)));
    }, [data]);

    return (
        <div className="w-full bg-white rounded-3xl shadow-sm border border-gray-100 p-6 md:p-8">
            <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <span className="w-2 h-8 rounded-full bg-gradient-to-b from-blue-500 to-purple-500"></span>
                พีระมิดประชากร
            </h3>

            <div className="flex justify-center items-center gap-8 mb-4 text-sm font-bold text-gray-500">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                    <span>ชาย</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                    <span>หญิง</span>
                </div>
            </div>

            <div className="relative">
                {/* Central Axis Line */}
                <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gray-200 -translate-x-1/2 z-0"></div>

                <div className="space-y-2 relative z-10">
                    {data.map((item, index) => (
                        <div key={item.ageGroup} className="grid grid-cols-[1fr_auto_1fr] items-center gap-4 h-8 group hover:bg-gray-50/50 rounded transition-colors">
                            {/* Male Bar (Right to Left) */}
                            <div className="flex justify-end items-center h-full w-full">
                                <span className="text-xs text-gray-400 mr-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    {new Intl.NumberFormat('th-TH').format(item.male)}
                                </span>
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${(item.male / maxVal) * 100}%` }}
                                    transition={{ duration: 1, delay: index * 0.05 }}
                                    className="h-6 rounded-l-md bg-blue-500/80 group-hover:bg-blue-500 transition-colors relative"
                                >
                                </motion.div>
                            </div>

                            {/* Age Label */}
                            <div className="w-12 text-center text-xs font-bold text-gray-600">
                                {item.ageGroup}
                            </div>

                            {/* Female Bar (Left to Right) */}
                            <div className="flex justify-start items-center h-full w-full">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${(item.female / maxVal) * 100}%` }}
                                    transition={{ duration: 1, delay: index * 0.05 }}
                                    className="h-6 rounded-r-md bg-purple-500/80 group-hover:bg-purple-500 transition-colors"
                                >
                                </motion.div>
                                <span className="text-xs text-gray-400 ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    {new Intl.NumberFormat('th-TH').format(item.female)}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-[1fr_auto_1fr] gap-4 mt-2 text-xs text-gray-400 font-mono">
                <div className="text-right">Male</div>
                <div className="w-12 text-center">Age</div>
                <div className="text-left">Female</div>
            </div>
        </div>
    );
}
