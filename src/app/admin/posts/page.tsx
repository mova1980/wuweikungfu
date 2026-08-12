"use client";
import CollectionAdmin from "@/components/admin/CollectionAdmin";

const ml = { fa: "", en: "", zh: "" };
export default function Page() {
  return (
    <CollectionAdmin
      collection="posts" title="مدیریت مقالات" labelKey="title" extraCols={["date"]}
      template={{ slug: "", image: "/images/hero.jpg", date: new Date().toISOString().slice(0, 10), category: { ...ml }, author: { fa: "سیفو احسان شایانفر", en: "Sifu Ehsan Shayanfar", zh: "Ehsan Shayanfar 师父" }, title: { ...ml }, excerpt: { ...ml }, body: { ...ml } }}
    />
  );
}
