const formatCurrency = (amount) => {
  const value = Number(amount || 0);
  return value.toLocaleString("tr-TR", {
    style: "currency",
    currency: "TRY",
    minimumFractionDigits: 2
  });
};

const formatUSD = (amount) => {
  const value = Number(amount || 0);
  return value.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 4,
    maximumFractionDigits: 4
  });
};

const getQuotaRatio = (used, limit, extra) => {
  const total = Number(limit || 0) + Number(extra || 0);
  if (!total) return 0;
  return Math.min(100, Math.round((Number(used || 0) / total) * 100));
};

window.formatCurrency = formatCurrency;
window.formatUSD = formatUSD;
window.getQuotaRatio = getQuotaRatio;
