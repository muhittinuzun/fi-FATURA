function ReceiptsPage({ profile }) {
  const [receipts, setReceipts] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  const loadReceipts = React.useCallback(async () => {
    setLoading(true);
    try {
      const data = await window.fetchReceipts({});
      setReceipts(data?.receipts || []);
    } catch (err) {
      console.error("Fiş yükleme hatası:", err);
    } finally {
      setLoading(false);
    }
  }, []);

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
      <ReceiptTable
        receipts={receipts}
        loading={loading}
        simple={false}
        profile={profile}
        onRefresh={loadReceipts}
      />
    </div>
  );
}

window.ReceiptsPage = ReceiptsPage;
