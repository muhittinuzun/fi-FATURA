function SupportBanner({ isLimitExceeded }) {
  if (!isLimitExceeded) return null;

  return (
    <div className="bg-amber-50 border border-amber-200 text-amber-900 rounded-xl p-4">
      <p className="font-semibold">Aylık fiş limitiniz doldu.</p>
      <p className="text-sm mt-1">
        Paket yükseltmek veya kontör yüklemek için destek hattına ulaşın.
      </p>
      <div className="mt-3 flex gap-3 text-sm">
        <a className="underline" href={window.SUPPORT_LINKS.whatsapp} target="_blank" rel="noreferrer">WhatsApp Destek</a>
        <a className="underline" href={window.SUPPORT_LINKS.telegram} target="_blank" rel="noreferrer">Telegram Destek</a>
      </div>
    </div>
  );
}

window.SupportBanner = SupportBanner;
