import Link from "next/link";
import { useTranslations } from "next-intl";
import ShareButtons from "@/components/ShareButtons";
import { siteUrl } from "@/lib/share";

export default function SuccessCard({
  title,
  message,
  shareText,
  sharePath,
  primaryHref,
  primaryLabel,
}: {
  title: string;
  message: string;
  shareText: string;
  sharePath: string;
  primaryHref: string;
  primaryLabel: string;
}) {
  const t = useTranslations("forms");
  return (
    <div className="rounded-2xl border border-green-200 bg-green-50 p-6 text-center">
      <div aria-hidden className="text-5xl">✅</div>
      <h2 className="mt-3 text-2xl font-bold text-slate-900">{title}</h2>
      <p className="mx-auto mt-2 max-w-md text-slate-700">{message}</p>

      <div className="mt-5 flex justify-center">
        <ShareButtons text={shareText} url={siteUrl(sharePath)} compact />
      </div>

      <div className="mt-4 flex flex-wrap justify-center gap-2">
        <Link
          href={primaryHref}
          className="rounded-xl bg-slate-900 px-5 py-3 font-bold text-white"
        >
          {primaryLabel}
        </Link>
        <Link href="/" className="rounded-xl bg-white px-5 py-3 font-bold text-slate-700 ring-1 ring-slate-300">
          {t("home")}
        </Link>
      </div>
    </div>
  );
}
