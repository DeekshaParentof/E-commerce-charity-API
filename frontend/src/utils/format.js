const currency = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2,
});

export const formatPrice = (value) => currency.format(Number(value) || 0);

// Discount is stored as a percentage (0-100), matching the order API.
export function finalPrice(price, discount = 0) {
  const pct = Math.min(Math.max(Number(discount) || 0, 0), 100);
  return Math.round(Number(price) * (100 - pct)) / 100;
}

export const formatDate = (value) =>
  new Date(value).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

export const formatAddress = (a) =>
  a ? [a.location, a.city, a.state, a.country].filter(Boolean).join(", ") + ` - ${a.pincode}` : "";

export const FALLBACK_IMAGE =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"><rect width="400" height="300" fill="#e5e7eb"/><text x="50%" y="50%" fill="#9ca3af" font-family="sans-serif" font-size="20" text-anchor="middle" dominant-baseline="middle">No image</text></svg>'
  );

// Mirrors the order API's rules: product active, in stock, and its charity live.
export function isPurchasable(product) {
  const charityLive = !product.charity_id?.status || product.charity_id.status === "live";
  return product.status === "active" && product.quantity > 0 && charityLive;
}

export const ADMIN_ROLES = ["admin", "super_admin"];
export const isAdmin = (user) => ADMIN_ROLES.includes(user?.role);

// The charity API expects UTC timestamps like 2026-10-24T09:30:00Z.
// <input type="datetime-local"> works in local time without a zone.
export function localInputToUtc(value) {
  if (!value) return "";
  return new Date(value).toISOString().split(".")[0] + "Z";
}

export function utcToLocalInput(value) {
  if (!value) return "";
  const d = new Date(value);
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export const formatDateTime = (value) =>
  new Date(value).toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" });

export const toFormData = (values) => {
  const fd = new FormData();
  for (const [key, value] of Object.entries(values)) {
    if (value !== undefined && value !== null && value !== "") fd.append(key, value);
  }
  return fd;
};

// Splits an order amount using its charity's percentages.
export function splitAmount(amount, charity) {
  const pct = (v) => (Number(amount) * Number(v || 0)) / 100;
  return { donation: pct(charity.donation_fee), platform: pct(charity.platform_fee), profit: pct(charity.profit) };
}
