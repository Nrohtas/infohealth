import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "InfoPLKHealth ประชากรกลางปี",
    description: "รายงานข้อมูลประชากรกลางปี แยกตามอำเภอและหน่วยบริการ",
};

export default function PopulationLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
