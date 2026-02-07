import Link from 'next/link';

const Header = () => {
  return (
    <header className="py-4 bg-purple-50/95 backdrop-blur-sm border-b border-purple-100 flex items-center justify-between px-4 md:px-8 relative z-40 shadow-sm">
      <div className="flex items-center gap-4">
        {/* Logo Placeholder */}
        <div className="w-12 h-12 relative flex-shrink-0">
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-sm" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M50 20C50 20 60 30 60 40C60 50 50 60 50 60C50 60 40 50 40 40C40 30 50 20 50 20Z" fill="#E0F7FA" />
            <path d="M50 25L55 35H45L50 25Z" fill="#00BCD4" />
            <path d="M50 60V80" stroke="#00BCD4" strokeWidth="4" strokeLinecap="round" />
            <path d="M30 40C30 40 40 40 40 40" stroke="#B2EBF2" strokeWidth="2" />
            <path d="M70 40C70 40 60 40 60 40" stroke="#B2EBF2" strokeWidth="2" />
            {/* Simple Winged representation */}
            <path d="M20 30Q35 20 50 35Q65 20 80 30" stroke="#AB47BC" strokeWidth="3" fill="none" />
          </svg>
        </div>

        <div className="flex flex-col">
          <h1 className="text-teal-600/90 text-lg md:text-xl font-bold tracking-tight hover:text-teal-800 transition-colors">
            <Link href="/">สำนักงานสาธารณสุขจังหวัดพิษณุโลก</Link>
          </h1>
          <div className="flex items-center gap-2 text-sm md:text-base">
            <Link href="/" className="text-purple-700 font-bold hover:text-purple-900 transition-colors">กลุ่มงานสุขภาพดิจิทัล</Link>
            <div className="h-4 w-px bg-gray-300 mx-1"></div>
            <Link href="/" className="text-gray-500 font-medium hover:text-teal-600 transition-colors">ข้อมูลพื้นฐาน</Link>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
