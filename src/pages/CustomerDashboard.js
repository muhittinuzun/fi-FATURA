function CustomerDashboard({
  company,
  usageLogs,
  receipts,
  onUpdateReceipt,
  onUpdateStatus,
  onDeleteReceipt,
  onRefreshReceipts,
  receiptTableSimple,
  profile,
  onOpenBilling
}) {
  const totalCostUsd = usageLogs.reduce((acc, item) => acc + Number(item.estimated_cost || 0), 0);
  const totalReceiptSpend = receipts.reduce((acc, item) => acc + Number(item.toplam_tutar || item.total_amount || 0), 0);
  const kalanKredi = Number(company?.kalan_kredi || 0);
  const recentReceipts = React.useMemo(() => {
    const getSortValue = (item) => {
      const candidate = item?.created_at || item?.inserted_at || item?.uploaded_at || item?.tarih || null;
      const ts = candidate ? new Date(candidate).getTime() : 0;
      if (Number.isFinite(ts) && ts > 0) return ts;
      return Number(item?.id || 0);
    };
    return [...(receipts || [])]
      .sort((a, b) => getSortValue(b) - getSortValue(a))
      .slice(0, 20);
  }, [receipts]);

  return (
    <div className="space-y-4">
      <section className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm text-slate-500 mb-1">Kalan Fis Kontorunuz</p>
            <p className="text-3xl font-black text-slate-900">{kalanKredi}</p>
          </div>
          <button
            onClick={() => typeof onOpenBilling === "function" && onOpenBilling()}
            className="px-4 py-2 rounded-lg bg-brand text-white text-sm font-semibold hover:bg-brand/90"
          >
            Kontor Yukle
          </button>
        </div>
      </section>
      <section className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
        <p className="text-sm text-slate-600">
          Fis gorselleri panelden yuklenmez. Kullanici yuklemeleri Telegram bot uzerinden alinir,
          arka planda n8n akisi ile <span className="font-medium">fisler</span> tablosuna islenir.
        </p>
      </section>
      <section className="grid md:grid-cols-3 gap-4">
        <article className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-2 text-slate-500">
            <Icon name="TurkishLira" size={16} />
            <p className="text-sm font-medium">Aylık Fiș Harcaması</p>
          </div>
          <p className="text-2xl font-bold text-slate-800">{formatCurrency(totalReceiptSpend)}</p>
        </article>
        <article className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-2 text-slate-500">
            <Icon name="Zap" size={16} />
            <p className="text-sm font-medium">AI Tahmini Maliyet</p>
          </div>
          <p className="text-2xl font-bold text-slate-800">{formatUSD(totalCostUsd)}</p>
        </article>
        <article className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-2 text-slate-500">
            <Icon name="Hash" size={16} />
            <p className="text-sm font-medium">Toplam İşlem</p>
          </div>
          <p className="text-2xl font-bold text-slate-800">{usageLogs.length}</p>
        </article>
      </section>
      <ReceiptTable
        receipts={recentReceipts}
        loading={false}
        simple={Boolean(receiptTableSimple)}
        profile={profile}
        onRefresh={onRefreshReceipts}
      />
    </div>
  );
}

window.CustomerDashboard = CustomerDashboard;

