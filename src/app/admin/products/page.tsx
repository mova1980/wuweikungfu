"use client";
import CollectionAdmin from "@/components/admin/CollectionAdmin";

const ml = { fa: "", en: "", zh: "" };
export default function Page() {
  return (
    <CollectionAdmin
      collection="products" title="مدیریت محصولات" labelKey="title" extraCols={["price"]}
      template={{ price: 0, image: "/images/book.jpg", badge: null, title: { ...ml }, desc: { ...ml } }}
    />
  );
}
