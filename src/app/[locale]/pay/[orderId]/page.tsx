import { redirect } from "next/navigation";
import { getDict, pick, type Locale } from "@/lib/i18n";
import { readCollection } from "@/lib/db";
import PayClient from "@/components/PayClient";

export const dynamic = "force-dynamic";

export default async function PayPage({ params }: { params: { locale: Locale; orderId: string } }) {
  const locale = params.locale;
  const dict = getDict(locale);
  const orders = await readCollection<any[]>("orders");
  const order = orders.find((o) => o.id === params.orderId);
  if (!order) redirect(`/${locale}/shop`);
  if (order.status !== "pending") redirect(`/${locale}/payment/result?order=${order.id}`);

  const content = await readCollection<any>("content");
  const gatewayName = pick(content.payment?.gatewayName, locale) || dict.checkout.gateway;

  return (
    <div className="mx-auto max-w-6xl px-4 pb-10 pt-32">
      <div className="mb-10 text-center">
        <div className="badge mx-auto mb-4">🔒 {dict.checkout.gateway}</div>
        <h1 className="gold-text text-3xl font-black md:text-4xl">{dict.checkout.title}</h1>
      </div>
      <PayClient order={order} locale={locale} dict={dict} gatewayName={gatewayName} />
    </div>
  );
}
