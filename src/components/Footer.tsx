import React from 'react';

const Footer = () => {
    return (
        <footer className="w-full py-10 mt-auto border-t border-slate-100 bg-white/50 backdrop-blur-sm">
            <div className="max-w-7xl mx-auto px-4 md:px-8 text-center sm:text-left">
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div className="flex flex-col gap-1">
                        <p className="text-slate-400 text-xs font-medium tracking-tight">
                            Copyright &copy; 2026 <span className="text-indigo-600/80 font-bold">Digital Health Group</span> of Phitsanulok Provincial Public Health Office
                            <span className="mx-2 text-slate-200">|</span>
                            <span className="text-[10px] text-slate-300 font-bold tracking-widest uppercase">V20260210</span>
                        </p>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="text-[10px] text-slate-300 font-bold uppercase tracking-widest hidden sm:block">
                            Digital Health Driven Foundation
                        </span>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
