// Canonical currency list served when upstream is unreachable.
// Kept in sync with ISO 4217 majors used by ExchangeRate API.
const SUPPORTED_CURRENCIES = [
  "USD", "EUR", "GBP", "JPY", "INR",
  "AUD", "CAD", "CHF", "CNY", "SGD",
  "AED", "BRL", "ZAR", "KRW", "MXN",
  "NZD", "SEK", "THB", "TRY", "SAR",
];

const MAJOR_BUDGET_CURRENCIES = ["USD", "EUR", "GBP", "JPY", "INR", "AUD"];

function normalizeCode(code) {
  return String(code || "").trim().toUpperCase();
}

function isSupported(code) {
  return SUPPORTED_CURRENCIES.includes(normalizeCode(code));
}

module.exports = { SUPPORTED_CURRENCIES, MAJOR_BUDGET_CURRENCIES, normalizeCode, isSupported };
