"use client";
import CollectionAdmin from "@/components/admin/CollectionAdmin";

const ml = { fa: "", en: "", zh: "" };
export default function Page() {
  return (
    <CollectionAdmin
      collection="testimonials" title="نظرات شاگردان" labelKey="name"
      template={{ name: { ...ml }, role: { ...ml }, text: { ...ml } }}
    />
  );
}
