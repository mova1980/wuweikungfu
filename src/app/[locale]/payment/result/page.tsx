import { getDict, type Locale } from "@/lib/i18n";
import PaymentResultClient from "@/components/PaymentResultClient";

export const dynamic = "force-dynamic";

export default function PaymentResult({
  params,
  searchParams,
}: {
  params: { locale: Locale };
  searchParams: { order?: string };
}) {
  const locale = params.locale;
  const dict = getDict(locale);
  return (
    <div className="mx-auto max-w-5xl px-4 pb-10 pt-32">
      <PaymentResultClient orderId={searchParams.order || ""} locale={locale} dict={dict} />
    </div>
  );
}
