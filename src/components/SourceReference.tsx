'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface SourceReferenceProps {
    url?: string;
    subTitle?: string;
    label?: string;
    className?: string;
}

const SourceReference = ({
    url = "https://stat.bora.dopa.go.th/new_stat/webPage/statByYear.php",
    subTitle = "ระบบสถิติจำนวนประชากรและบ้านรายปี",
    label = "ข้อมูลอ้างอิง: กรมการปกครอง (DOPA)",
    className = "mt-16 pb-12 flex flex-col items-center justify-center gap-2"
}: SourceReferenceProps) => {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className={className}
        >
            <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-2 text-slate-400 hover:text-indigo-500 transition-all duration-300"
            >
                <div className="w-1.5 h-1.5 rounded-full bg-slate-300 group-hover:bg-indigo-400 transition-colors" />
                <span className="text-[11px] font-bold uppercase tracking-[0.2em]">{label}</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="opacity-0 -translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                    <polyline points="15 3 21 3 21 9" />
                    <line x1="10" y1="14" x2="21" y2="3" />
                </svg>
            </a>
            {subTitle && (
                <p className="text-[9px] text-slate-300 font-medium tracking-wider text-center max-w-[250px]">
                    {subTitle}
                </p>
            )}
        </motion.div>
    );
};

export default SourceReference;
