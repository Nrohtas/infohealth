'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Modern Dropdown Component
interface DropdownOption {
    code: string;
    name: string;
}

interface ModernDropdownProps {
    options: DropdownOption[];
    value: string;
    onChange: (value: string) => void;
    placeholder: string;
    icon?: React.ReactNode;
    disabled?: boolean;
    label?: string;
    minWidth?: string;
}

function ModernDropdown({ options, value, onChange, placeholder, icon, disabled = false, label, minWidth = 'min-w-[140px]' }: ModernDropdownProps) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const selectedOption = options.find(o => o.code === String(value));

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (code: string) => {
        onChange(code);
        setIsOpen(false);
    };

    return (
        <div className={`relative group ${disabled ? 'opacity-60 pointer-events-none' : ''}`} ref={dropdownRef}>
            {label && <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 block group-hover:text-indigo-400 transition-colors">{label}</span>}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`flex items-center justify-between gap-2 bg-white/50 px-3 py-1.5 rounded-full border border-gray-100 shadow-sm transition-all hover:shadow-md hover:border-blue-100 outline-none ${minWidth}`}
            >
                <div className="flex items-center gap-2 overflow-hidden">
                    {icon && <span className="text-indigo-600/60 group-hover:text-indigo-600 transition-colors flex-shrink-0">{icon}</span>}
                    <span className={`text-sm font-black truncate ${selectedOption ? 'text-indigo-900' : 'text-indigo-900/50'}`}>
                        {selectedOption ? selectedOption.name : placeholder}
                    </span>
                </div>
                <div className={`text-[#00BFA5]/60 transition-transform duration-300 flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 12 0l-6 6z" /></svg>
                </div>
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 5, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 5, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute top-full left-0 mt-2 w-full min-w-[200px] bg-white/90 backdrop-blur-xl border border-white/60 shadow-xl rounded-xl z-50 overflow-hidden"
                    >
                        <div className="max-h-[240px] overflow-y-auto p-1 custom-scrollbar">
                            {options.map((option) => (
                                <button
                                    key={option.code}
                                    onClick={() => handleSelect(option.code)}
                                    className={`w-full text-left px-3 py-2 rounded-lg text-sm font-bold transition-colors flex items-center justify-between group/item
                                        ${String(value) === String(option.code) ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50 hover:text-indigo-600'}
                                    `}
                                >
                                    <span>{option.name}</span>
                                    {String(value) === String(option.code) && (
                                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-500">
                                            <polyline points="20 6 9 17 4 12" />
                                        </svg>
                                    )}
                                </button>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default function UtilityBar() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const year = Number(searchParams.get('year')) || 2568;

    const [openTab, setOpenTab] = useState<string | null>(null);
    const tabsRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (tabsRef.current && !tabsRef.current.contains(event.target as Node)) {
                setOpenTab(null);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Determine active tab based on pathname
    let activeTab: 'home' | 'population' | 'house' = 'home';
    if (pathname.startsWith('/population')) activeTab = 'population';
    else if (pathname.startsWith('/house')) activeTab = 'house';
    else if (pathname === '/' || pathname.startsWith('/district/') || pathname.startsWith('/tambon/')) activeTab = 'home';

    const [districts, setDistricts] = useState<{ code: string; name: string }[]>([]);
    const [tambons, setTambons] = useState<{ code: string; name: string }[]>([]);

    // Get district and tambon IDs from URL or pathname
    const districtId = searchParams.get('id') ||
        (pathname.includes('/district/') ? pathname.split('/')[2] :
            (pathname.startsWith('/population/') && pathname.split('/').length > 2 ? pathname.split('/')[2] :
                (pathname.startsWith('/house/') && pathname.split('/').length > 2 ? pathname.split('/')[2] : "")));
    const tambonId = searchParams.get('tambon') ||
        (pathname.includes('/tambon/') ? pathname.split('/')[2] : "");

    const handleTabChange = (tab: 'home' | 'population' | 'house') => {
        const params = new URLSearchParams(searchParams.toString());
        if (tab === 'home') {
            params.delete('id');
            params.delete('tambon');
            router.push(`/?${params.toString()}`);
        }
        else if (tab === 'population') router.push(`/population?${params.toString()}`);
        else if (tab === 'house') router.push(`/house?${params.toString()}`);
        setOpenTab(null);
    };

    useEffect(() => {
        fetch('/api/districts')
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) setDistricts(data);
            })
            .catch(err => console.error(err));
    }, []);

    useEffect(() => {
        if (districtId) {
            fetch(`/api/tambons?ampurcode=${districtId}`)
                .then(res => res.json())
                .then(data => {
                    if (Array.isArray(data)) {
                        setTambons(data);
                    } else {
                        setTambons([]);
                    }
                })
                .catch(err => console.error(err));
        } else {
            setTambons([]);
        }
    }, [districtId]);

    const handleYearChange = (newYear: string) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set('year', newYear);
        router.push(`?${params.toString()}`);
    };

    const handleDistrictChange = (val: string) => {
        const params = new URLSearchParams(searchParams.toString());
        params.delete('tambon');

        if (activeTab === 'population') {
            if (val) router.push(`/population/${val}?${params.toString()}`);
            else router.push(`/population?${params.toString()}`);
        } else if (activeTab === 'house') {
            if (val) router.push(`/house/${val}?${params.toString()}`);
            else router.push(`/house?${params.toString()}`);
        } else {
            // On Home tab
            if (val) {
                router.push(`/district/${val}?${params.toString()}`);
            } else {
                router.push(`/?${params.toString()}`);
            }
        }
    };

    const handleTambonChange = (val: string) => {
        const params = new URLSearchParams(searchParams.toString());
        if (val) params.set('tambon', val);
        else params.delete('tambon');

        if (pathname.startsWith('/population/')) {
            router.push(`${pathname}?${params.toString()}`);
        } else if (activeTab === 'house') {
            if (pathname.startsWith('/house/') && pathname.split('/').length > 2) {
                router.push(`${pathname}?${params.toString()}`);
            } else {
                router.push(`/house?${params.toString()}`);
            }
        } else {
            router.push(`/population?${params.toString()}`);
        }
    };

    const handleAffiliationChange = (val: string) => {
        const params = new URLSearchParams(searchParams.toString());
        if (val) params.set('affiliation', val);
        else params.delete('affiliation');
        router.push(`?${params.toString()}`);
    };


    const tabs = [
        {
            id: 'home',
            label: 'หน้าหลัก',
            icon: (props: any) => (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
                    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                    <polyline points="9 22 9 12 15 12 15 22" />
                </svg>
            ),
            color: 'blue'
        },
        {
            id: 'population',
            label: 'ประชากร',
            icon: (props: any) => (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
            ),
            color: 'teal',
            dropdown: [
                { label: 'ประชากรกลางปี', href: '/population' }
            ]
        },
        {
            id: 'house',
            label: 'บ้าน',
            icon: (props: any) => (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
                    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                    <circle cx="12" cy="10" r="3" />
                </svg>
            ),
            color: 'purple',
        },
    ];

    const yearOptions = [
        { code: '2568', name: '2568' },
        { code: '2567', name: '2567' }
    ];

    const districtOptions = [
        { code: "", name: "ทุกอำเภอ" },
        ...districts
    ];

    const tambonOptions = [
        { code: "", name: districtId ? "ทุกตำบล" : "เลือกอำเภอ" },
        ...tambons
    ];

    const affiliationOptions = [
        { code: "", name: "ทุกสังกัด" },
        { code: "moph", name: "กระทรวงสาธารณสุข" },
        { code: "local", name: "องค์กรปกครองส่วนท้องถิ่น" },
        { code: "other", name: "อื่นๆ" }
    ];

    return (
        <div className="w-full px-4 pt-4 pb-2 bg-[#f9fafb]/80 backdrop-blur-md relative z-[500]">
            <div className="max-w-7xl mx-auto">
                <div className="bg-white/70 backdrop-blur-xl border border-white/40 shadow-2xl shadow-gray-200/50 rounded-3xl">
                    <div className="flex flex-col md:flex-row items-center justify-between p-2 gap-4">

                        {/* Elegant Tab Group */}
                        <div className="flex items-center bg-gray-100/50 p-1 rounded-2xl relative" ref={tabsRef}>
                            {tabs.map((tab: any) => (
                                <div key={tab.id} className="relative group">
                                    <button
                                        onClick={(e) => {
                                            if (tab.dropdown) {
                                                setOpenTab(openTab === tab.id ? null : tab.id);
                                            } else {
                                                handleTabChange(tab.id as any);
                                            }
                                        }}
                                        className={`relative z-10 flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300 focus:outline-none ${tab.dropdown ? 'cursor-pointer' : ''}`}
                                    >
                                        {activeTab === tab.id && (
                                            <motion.div
                                                layoutId="activeTab"
                                                className="absolute inset-0 bg-white shadow-sm rounded-xl"
                                                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                            />
                                        )}
                                        <span className={`relative z-20 transition-transform duration-300 ${activeTab === tab.id ? 'scale-110 text-indigo-600' : 'group-hover:scale-110 text-slate-400 group-hover:text-indigo-400'}`}>
                                            {tab.icon({ className: "w-5 h-5" })}
                                        </span>
                                        <span className={`relative z-20 font-black text-sm transition-colors duration-300 ${activeTab === tab.id ? 'text-indigo-950' : 'text-indigo-600/60 group-hover:text-indigo-950'}`}>
                                            {tab.label}
                                        </span>
                                        {tab.dropdown && (
                                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={`relative z-20 ml-1 opacity-50 transition-transform duration-300 ${openTab === tab.id ? 'rotate-180' : 'group-hover:rotate-180'} ${activeTab === tab.id ? 'text-indigo-950' : 'text-indigo-600/60 group-hover:text-indigo-950'}`}>
                                                <path d="m6 9 12 0l-6 6z" />
                                            </svg>
                                        )}
                                    </button>

                                    {/* Dropdown Menu for Tabs */}
                                    {tab.dropdown && (
                                        <div className={`absolute top-full left-0 mt-2 w-48 bg-white/90 backdrop-blur-xl border border-white/60 shadow-xl rounded-xl overflow-hidden transition-all duration-200 transform origin-top-left z-50 
                                            ${openTab === tab.id ? 'opacity-100 visible' : 'opacity-0 invisible group-hover:opacity-100 group-hover:visible'}`}>
                                            <div className="p-1">
                                                {tab.dropdown.map((item: any, idx: number) => (
                                                    <button
                                                        key={idx}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            const params = new URLSearchParams(searchParams.toString());
                                                            router.push(`${item.href}?${params.toString()}`);
                                                            setOpenTab(null);
                                                        }}
                                                        className="w-full text-left px-3 py-2.5 rounded-lg text-sm font-bold text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 transition-colors flex items-center gap-2 group/item"
                                                    >
                                                        <span className="w-1.5 h-1.5 rounded-full bg-slate-300 group-hover/item:bg-indigo-400 transition-colors"></span>
                                                        {item.label}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Integrated Filter Pills */}
                        <div className="flex flex-wrap items-center gap-2 md:gap-4 px-4 py-1">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={activeTab}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="flex flex-wrap items-center gap-3 justify-center md:justify-end"
                                >
                                    {/* Year Dropdown */}
                                    <ModernDropdown
                                        options={yearOptions}
                                        value={String(year)}
                                        onChange={handleYearChange}
                                        placeholder="ปี"
                                        minWidth="min-w-[100px]"
                                        icon={(
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
                                                <line x1="16" x2="16" y1="2" y2="6" />
                                                <line x1="8" x2="8" y1="2" y2="6" />
                                                <line x1="3" x2="21" y1="10" y2="10" />
                                            </svg>
                                        )}
                                    />

                                    {(activeTab === 'population' || activeTab === 'house') && (
                                        <>
                                            {/* District Dropdown */}
                                            <ModernDropdown
                                                options={districtOptions}
                                                value={districtId}
                                                onChange={handleDistrictChange}
                                                placeholder="เลือกอำเภอ"
                                                minWidth="min-w-[160px]"
                                                icon={(
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                        <path d="M14.106 5.553a2 2 0 0 0 1.788 0l3.659-1.83A1 1 0 0 1 21 4.619v12.764a1 1 0 0 1-.553.894l-4.553 2.277a2 2 0 0 1-1.788 0l-4.212-2.106a2 2 0 0 0-1.788 0l-3.659 1.83A1 1 0 0 1 3 19.381V6.618a1 1 0 0 1 .553-.894l4.553-2.277a2 2 0 0 1 1.788 0z" />
                                                        <path d="m9 5.5v12.5" />
                                                        <path d="m15 6v12.5" />
                                                    </svg>
                                                )}
                                            />

                                            {/* Tambon Dropdown */}
                                            <ModernDropdown
                                                options={tambonOptions}
                                                value={tambonId}
                                                onChange={handleTambonChange}
                                                placeholder={districtId ? "เลือกตำบล" : "เลือกอำเภอก่อน"}
                                                disabled={!districtId}
                                                minWidth="min-w-[160px]"
                                                icon={(
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                        <polygon points="3 11 22 2 13 21 11 13 3 11" />
                                                    </svg>
                                                )}
                                            />
                                        </>
                                    )}

                                    {(activeTab === 'population' || activeTab === 'house') && (
                                        <ModernDropdown
                                            options={affiliationOptions}
                                            value={searchParams.get('affiliation') || ""}
                                            onChange={handleAffiliationChange}
                                            placeholder="เลือกสังกัด"
                                            minWidth="min-w-[120px]"
                                            icon={(
                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                    <path d="M12 6v4" />
                                                    <path d="M14 14h-4" />
                                                    <path d="M14 18h-4" />
                                                    <path d="M14 8h-4" />
                                                    <path d="M18 12h2a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-9a2 2 0 0 1 2-2h2" />
                                                    <path d="M18 22V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v18" />
                                                </svg>
                                            )}
                                        />
                                    )}
                                </motion.div>
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
