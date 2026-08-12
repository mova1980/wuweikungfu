"use client";
import CollectionAdmin from "@/components/admin/CollectionAdmin";

const ml = { fa: "", en: "", zh: "" };
export default function Page() {
  return (
    <CollectionAdmin
      collection="videos" title="مدیریت ویدئوها" labelKey="title" extraCols={["duration"]}
      template={{ image: "/images/hero.jpg", duration: "0:00", category: { ...ml }, title: { ...ml }, src: "aparat:A_136369" }}
    />
  );
}
