"use client";
import CollectionAdmin from "@/components/admin/CollectionAdmin";

const ml = { fa: "", en: "", zh: "" };
export default function Page() {
  return (
    <CollectionAdmin
      collection="coaches" title="مدیریت مربیان" labelKey="name" extraCols={["image"]}
      template={{ image: "/images/coach-m1.jpg", name: { ...ml }, role: { ...ml } }}
    />
  );
}
