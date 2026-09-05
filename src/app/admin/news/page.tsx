"use client";
import CollectionAdmin from "@/components/admin/CollectionAdmin";

const ml = { fa: "", en: "", zh: "" };
export default function Page() {
  return (
    <CollectionAdmin
      collection="news"
      title="اخبار و اطلاعیه‌ها"
      labelKey="title"
      extraCols={["date"]}
      template={{
        date: new Date().toISOString().slice(0, 10),
        pinned: false,
        image: "",
        title: { ...ml },
        summary: { ...ml },
        body: { ...ml },
      }}
    />
  );
}
