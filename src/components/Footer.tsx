"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const SystemUpdateModal = ({ isOpen, onClose, updates }: { isOpen: boolean; onClose: () => void; updates: any[] }) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100"
                    >
                        {/* Header */}
                        <div className="bg-gradient-to-r from-emerald-500 to-lime-500 p-6 flex justify-between items-center text-white">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-white/20 rounded-xl">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
                                        <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
                                        <path d="M9 12H4s.55-3.03 2-5c1.62-2.2 5-3 5-3" />
                                        <path d="M12 15v5s.8 3.38 3 5c1.97 1.45 5 2 5 2" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-bold tracking-tight">System Update</h3>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-white/10 rounded-full transition-colors"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Timeline */}
                        <div className="p-8 max-h-[60vh] overflow-y-auto custom-scrollbar">
                            <div className="space-y-8 relative before:absolute before:inset-0 before:left-2 before:w-0.5 before:bg-slate-100">
                                {Array.isArray(updates) && updates.map((update, index) => {
                                    const date = new Date(update.update_date);
                                    const thaiDate = `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear() + 543}`;

                                    return (
                                        <div key={update.update_version} className="relative pl-8">
                                            {/* Dot */}
                                            <div className={`absolute left-0 top-1.5 w-4 h-4 rounded-full border-4 border-white shadow-sm z-10 ${index === 0 ? 'bg-emerald-600 animate-pulse' : 'bg-slate-300'}`} />

                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center gap-3">
                                                    <span className="text-sm font-bold text-emerald-600/80">{thaiDate}</span>
                                                    <span className="text-xs font-bold text-slate-300 tracking-wider uppercase">({update.update_version})</span>
                                                    {index === 0 && (
                                                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-600 text-[10px] font-bold rounded-full uppercase tracking-tighter">New</span>
                                                    )}
                                                </div>
                                                <p className="text-slate-600 font-medium leading-relaxed">
                                                    {update.update_description}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

const Footer = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [updates, setUpdates] = useState<any[]>([]);

    React.useEffect(() => {
        const fetchUpdates = async () => {
            try {
                const res = await fetch('/api/updates');
                const data = await res.json();
                if (Array.isArray(data)) {
                    setUpdates(data);
                } else {
                    console.error('API response is not an array:', data);
                    setUpdates([]);
                }
            } catch (error) {
                console.error('Failed to fetch updates:', error);
            }
        };
        fetchUpdates();
    }, []);

    const latestVersion = updates.length > 0 ? updates[0].update_version : "System Update";

    return (
        <footer className="w-full py-10 mt-auto border-t border-slate-100 bg-white/50 backdrop-blur-sm">
            <div className="max-w-7xl mx-auto px-4 md:px-8 text-center sm:text-left">
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div className="flex flex-col gap-1">
                        <p className="text-slate-400 text-xs font-medium tracking-tight">
                            Copyright &copy; 2026 <span className="text-indigo-600/80 font-bold">Digital Health Group</span> of Phitsanulok Provincial Public Health Office
                            <span className="mx-2 text-slate-200">|</span>
                            <button
                                onClick={() => setIsModalOpen(true)}
                                className="text-[10px] text-slate-300 font-bold tracking-widest uppercase hover:text-emerald-600 transition-colors cursor-pointer"
                            >
                                {latestVersion}
                            </button>
                        </p>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="text-[10px] text-slate-300 font-bold uppercase tracking-widest hidden sm:block">
                            Digital Health Driven Foundation
                        </span>
                    </div>
                </div>
            </div>

            <SystemUpdateModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} updates={updates} />
        </footer>
    );
};

export default Footer;
