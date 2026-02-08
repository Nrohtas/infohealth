import Link from 'next/link';

const Header = () => {
  return (
    <header className="py-4 bg-purple-50/95 backdrop-blur-sm border-b border-purple-100 flex items-center justify-between px-4 md:px-8 relative z-40 shadow-sm">
      <div className="flex items-center gap-4">
        {/* Logo Placeholder */}
        <div className="w-12 h-12 relative flex-shrink-0">
          <img
            src="/image/logo_digital_health.png"
            alt="Digital Health Logo"
            className="w-full h-full object-contain drop-shadow-sm"
          />
        </div>

        <div className="flex flex-col">
          <h1 className="text-indigo-950 text-lg md:text-xl font-black tracking-tight hover:text-indigo-800 transition-colors">
            <Link href="/">สำนักงานสาธารณสุขจังหวัดพิษณุโลก</Link>
          </h1>
          <div className="flex items-center gap-2 text-sm md:text-base">
            <Link href="/" className="text-indigo-600/80 font-bold hover:text-indigo-900 transition-colors">กลุ่มงานสุขภาพดิจิทัล</Link>
            <div className="h-4 w-px bg-indigo-200 mx-1"></div>
            <Link href="/" className="text-teal-600/70 font-bold hover:text-teal-800 transition-colors">ข้อมูลพื้นฐาน</Link>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
