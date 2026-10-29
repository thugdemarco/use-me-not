const KEY = "useless-hesitation-tax";
type TaxMap = Record<string, number>;

function read(): TaxMap {
  try {
    const value: unknown = JSON.parse(localStorage.getItem(KEY) || "{}");
    return value && typeof value === "object" ? value as TaxMap : {};
  } catch {
    return {};
  }
}

export function hesitationTaxFor(productId: string) {
  return read()[productId] || 0;
}

export function saveHesitationTax(productId: string, amount: number) {
  localStorage.setItem(KEY, JSON.stringify({ ...read(), [productId]: Math.max(0, amount) }));
}

export function clearHesitationTaxes() {
  localStorage.removeItem(KEY);
}
