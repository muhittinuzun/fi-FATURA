function ReceiptsPage({ profile }) {
  const [receipts, setReceipts] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");

  const loadReceipts = React.useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await window.fetchReceipts({});
      setReceipts(data?.receipts || []);
    } catch (err) {
      setError(err.message || "Fis yukleme hatasi.");
    } finally {
      setLoading(false);
    }
  }, []);

  const handleDeleteReceipt = async (receiptId) => {
    if (!receiptId) return;
    if (!window.confirm("Bu fisi silmek istediginize emin misiniz?")) return;
    try {
      await window.gatewayRequest("delete_receipt", { receipt_id: receiptId });
      await loadReceipts();
    } catch (err) {
      setError(err.message || "Silme islemi basarisiz.");
    }
  };

  React.useEffect(() => {
    loadReceipts();
  }, [loadReceipts]);

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Fiş Kayıtları</h2>
        <button
          onClick={loadReceipts}
          className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50"
          title="Yenile"
        >
          <Icon name="refresh-ccw" size={18} />
        </button>
      </div>
      {error && <p className="text-sm text-rose-600 mb-3">{error}</p>}
      <ReceiptTable
        receipts={receipts}
        loading={loading}
        simple={false}
        profile={profile}
        onRefresh={loadReceipts}
        onDeleteReceipt={handleDeleteReceipt}
      />
    </div>
  );
}

window.ReceiptsPage = ReceiptsPage;
