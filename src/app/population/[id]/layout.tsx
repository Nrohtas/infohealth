import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "ข้อมูลประชากรรายหมู่บ้าน - จังหวัดพิษณุโลก",
    description: "รายละเอียดประชากรแยกตามหน่วยบริการและหมู่บ้าน",
};

export default function DistrictLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
