import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "InfoPLKHealth บ้าน",
    description: "สรุปข้อมูลจำนวนบ้าน จังหวัดพิษณุโลก",
};

export default function HouseLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
