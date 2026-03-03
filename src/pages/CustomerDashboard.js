function CustomerDashboard({
  company,
  usageLogs,
  receipts,
  onUploadReceipt,
  onUpdateReceipt,
  onUpdateStatus,
  onDeleteReceipt,
  onRefreshReceipts,
  receiptTableSimple,
  profile,
  uploading
}) {
  const totalCostUsd = usageLogs.reduce((acc, item) => acc + Number(item.estimated_cost || 0), 0);
  const totalReceiptSpend = receipts.reduce((acc, item) => acc + Number(item.total_amount || 0), 0);
  const totalLimit = Number(company?.monthly_limit || 0) + Number(company?.extra_credits || 0);
  const limitExceeded = Number(company?.used_this_month || 0) >= totalLimit && totalLimit > 0;
  const [file, setFile] = React.useState(null);

  const submitUpload = async (e) => {
    e.preventDefault();
    if (!file || !onUploadReceipt) return;
    const base64Image = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = String(reader.result || "");
        resolve(result.includes(",") ? result.split(",")[1] : result);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

    await onUploadReceipt({
      file_name: file.name,
      base64_image: base64Image,
      mime_type: file.type || "image/jpeg"
    });
    setFile(null);
  };

  return (
    <div className="space-y-4">
      <ProgressBar
        used={company?.used_this_month}
        limit={company?.monthly_limit}
        extra={company?.extra_credits}
      />
      <SupportBanner isLimitExceeded={limitExceeded} />
      <form onSubmit={submitUpload} className="bg-white border border-slate-200 rounded-xl p-4 space-y-3 shadow-sm">
        <div className="flex items-center gap-2 mb-1">
          <div className="p-2 bg-brand/10 rounded-lg text-brand">
            <Icon name="Upload" size={18} />
          </div>
          <p className="font-semibold">Fis Gorseli Yukle</p>
        </div>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="w-full border border-slate-200 rounded-lg p-2 text-sm focus:ring-2 focus:ring-brand/20 outline-none"
        />
        <button
          disabled={!file || uploading || limitExceeded}
          className="w-full px-4 py-2.5 rounded-lg bg-brand text-white text-sm font-semibold transition-all hover:bg-brand/90 disabled:opacity-60 flex items-center justify-center gap-2"
        >
          {uploading ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Yukleniyor...</span>
            </>
          ) : (
            <>
              <Icon name="PlusCircle" size={18} />
              <span>Yukle ve Isle</span>
            </>
          )}
        </button>
      </form>
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

