"use client";
import CollectionAdmin from "@/components/admin/CollectionAdmin";

const ml = { fa: "", en: "", zh: "" };
export default function Page() {
  return (
    <CollectionAdmin
      collection="events" title="مدیریت رویدادها" labelKey="title" extraCols={["date", "capacity"]}
      template={{ date: new Date().toISOString().slice(0, 10), image: "/images/class.jpg", capacity: 50, title: { ...ml }, location: { ...ml }, desc: { ...ml } }}
    />
  );
}
