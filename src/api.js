const SESSION_KEY_STORAGE = "fismatik_session_key";

const parseResponse = async (response) => {
  const contentType = response.headers.get("content-type") || "";
  const isJson = contentType.includes("application/json");
  const rawText = await response.text();
  const body = isJson
    ? (rawText ? JSON.parse(rawText) : {})
    : rawText;
  if (!response.ok) {
    const message = typeof body === "string" ? body : body?.message || "API hatasi";
    throw new Error(message);
  }
  return body;
};

const getSessionKey = () => localStorage.getItem(SESSION_KEY_STORAGE) || "";
const setSessionKey = (value) => localStorage.setItem(SESSION_KEY_STORAGE, value);
const clearSessionKey = () => localStorage.removeItem(SESSION_KEY_STORAGE);

const gatewayRequest = async (action, payload = {}, sessionKey = getSessionKey()) => {
  const response = await fetch(window.N8N_GATEWAY_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      action,
      payload,
      session_key: sessionKey || ""
    })
  });
  return parseResponse(response);
};

const loginRequest = async (email, password) => {
  const data = await gatewayRequest("login", { email, password }, "");
  if (data?.session_key) setSessionKey(data.session_key);
  return data;
};

const registerRequest = async (payload) => gatewayRequest("register", payload, "");
const bootstrapRequest = async () => gatewayRequest("get_reports", { view: "bootstrap" });
const adminDashboardRequest = async () => gatewayRequest("get_reports", { view: "admin_dashboard" });
const checkQuotaRequest = async () => gatewayRequest("check_quota", {});
const uploadReceiptRequest = async (payload) => gatewayRequest("upload_receipt", payload);
const forgotPasswordRequest = async (email) => gatewayRequest("forgot_password", { email }, "");

window.getSessionKey = getSessionKey;
window.setSessionKey = setSessionKey;
window.clearSessionKey = clearSessionKey;
window.gatewayRequest = gatewayRequest;
window.loginRequest = loginRequest;
window.registerRequest = registerRequest;
window.bootstrapRequest = bootstrapRequest;
window.adminDashboardRequest = adminDashboardRequest;
window.checkQuotaRequest = checkQuotaRequest;
window.uploadReceiptRequest = uploadReceiptRequest;
window.forgotPasswordRequest = forgotPasswordRequest;

const normalizeReceiptsResponse = (raw) => {
  if (Array.isArray(raw)) return { receipts: raw };
  if (!raw || typeof raw !== "object") return { receipts: [] };

  const receipts =
    (Array.isArray(raw.receipts) && raw.receipts) ||
    (Array.isArray(raw.items) && raw.items) ||
    (Array.isArray(raw.rows) && raw.rows) ||
    (Array.isArray(raw.data) && raw.data) ||
    (Array.isArray(raw.result?.receipts) && raw.result.receipts) ||
    (Array.isArray(raw.result) && raw.result) ||
    [];

  return { ...raw, receipts };
};

// TODO: Backend'de "get_receipts" action'ını implemente et
const fetchReceipts = async (filters = {}) => {
  const raw = await gatewayRequest("get_receipts", filters);
  return normalizeReceiptsResponse(raw);
};

// TODO: Backend'de "update_receipt" action'ını implemente et
const updateReceipt = async (receiptId, data) => gatewayRequest("update_receipt", { receipt_id: receiptId, data });

// TODO: Backend'de "get_team" action'ını implemente et
const fetchTeam = async () => gatewayRequest("get_team", {});

// TODO: Backend'de "add_user" action'ını implemente et
const addUser = async (userData) => gatewayRequest("add_user", {
  email: userData.email,
  full_name: userData.full_name,
  password: userData.password,
  role: userData.role,
  phone: userData.phone
});

// TODO: Backend'de "delete_user" action'ını implemente et
const deleteUser = async (userId) => gatewayRequest("delete_user", { user_id: userId });

// TODO: Backend'de "manage_metadata" action'ını implemente et
const fetchMetadata = async (table) => gatewayRequest("manage_metadata", { table, operation: "list" });

// TODO: Backend'de "manage_metadata" action'ını implemente et
const addMetadata = async (table, data) => gatewayRequest("manage_metadata", { table, operation: "insert", data });

// TODO: Backend'de "manage_metadata" action'ını implemente et
const deleteMetadata = async (table, id) => gatewayRequest("manage_metadata", { table, operation: "delete", id });

// TODO: Backend'de "update_receipt" action'ını implemente et
const updateReceiptStatus = async (receiptId, newStatus) =>
  gatewayRequest("update_receipt", { receipt_id: receiptId, data: { durum: newStatus } });

window.fetchReceipts = fetchReceipts;
window.updateReceipt = updateReceipt;
window.fetchTeam = fetchTeam;
window.addUser = addUser;
window.deleteUser = deleteUser;
window.fetchMetadata = fetchMetadata;
window.addMetadata = addMetadata;
window.deleteMetadata = deleteMetadata;
window.updateReceiptStatus = updateReceiptStatus;
