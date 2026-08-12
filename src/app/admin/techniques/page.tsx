"use client";
import CollectionAdmin from "@/components/admin/CollectionAdmin";

const ml = { fa: "", en: "", zh: "" };
export default function Page() {
  return (
    <CollectionAdmin
      collection="techniques" title="مدیریت تکنیک‌ها" labelKey="title"
      template={{ slug: "", image: "/images/hero.jpg", icon: "拳", level: { ...ml }, title: { ...ml }, desc: { ...ml }, keys: { fa: [], en: [], zh: [] } }}
    />
  );
}
