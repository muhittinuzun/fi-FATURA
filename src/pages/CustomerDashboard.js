function CustomerDashboard({
  company,
  usageLogs,
  receipts,
  onUpdateReceipt,
  onUpdateStatus,
  onDeleteReceipt,
  onRefreshReceipts,
  receiptTableSimple,
  profile
}) {
  const totalCostUsd = usageLogs.reduce((acc, item) => acc + Number(item.estimated_cost || 0), 0);
  const totalReceiptSpend = receipts.reduce((acc, item) => acc + Number(item.toplam_tutar || item.total_amount || 0), 0);
  const totalLimit = Number(company?.monthly_limit || 0) + Number(company?.extra_credits || 0);
  const limitExceeded = Number(company?.used_this_month || 0) >= totalLimit && totalLimit > 0;

  return (
    <div className="space-y-4">
      <ProgressBar
        used={company?.used_this_month}
        limit={company?.monthly_limit}
        extra={company?.extra_credits}
      />
      <SupportBanner isLimitExceeded={limitExceeded} />
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
        receipts={receipts}
        loading={false}
        simple={Boolean(receiptTableSimple)}
        profile={profile}
        onRefresh={onRefreshReceipts}
      />
    </div>
  );
}

window.CustomerDashboard = CustomerDashboard;

