function ProgressBar({ used, limit, extra }) {
  const ratio = getQuotaRatio(used, limit, extra);
  const total = Number(limit || 0) + Number(extra || 0);
  const remaining = Math.max(0, total - Number(used || 0));

  return (
    <section className="bg-white rounded-xl border border-slate-200 p-5">
      <div className="flex justify-between mb-2 text-sm">
        <p className="font-semibold">Aylık Fiş Kotası</p>
        <p className="text-slate-600">{used || 0} / {total}</p>
      </div>
      <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
        <div className="h-full bg-brand" style={{ width: `${ratio}%` }} />
      </div>
      <p className="mt-3 text-sm text-slate-500">Kalan fiş: <b>{remaining}</b></p>
    </section>
  );
}

window.ProgressBar = ProgressBar;
