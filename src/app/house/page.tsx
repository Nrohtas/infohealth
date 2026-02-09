'use client';

export default function HousePage() {
    return (
        <div className="min-h-screen bg-gray-50/50 py-8 px-4 md:px-8 flex flex-col items-center justify-center">
            <h1 className="text-3xl font-bold text-gray-800 mb-4">ข้อมูลบ้าน</h1>
            <p className="text-gray-500">อยู่ระหว่างการพัฒนา... (Coming Soon)</p>
            <button
                onClick={() => window.history.back()}
                className="mt-6 px-6 py-2 bg-purple-600 text-white rounded-xl shadow-lg hover:bg-purple-700 transition-all font-bold"
            >
                กลับไปก่อนหน้า
            </button>
        </div>
    );
}
