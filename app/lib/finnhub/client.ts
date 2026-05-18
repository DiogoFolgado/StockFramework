const BASE = "https://finnhub.io/api/v1";

async function fh<T>(path: string): Promise<T> {
  const key = process.env.FINNHUB_API_KEY;
  if (!key) throw new Error("FINNHUB_API_KEY not configured");
  const sep = path.includes("?") ? "&" : "?";
  const res = await fetch(`${BASE}${path}${sep}token=${key}`, {
    next: { revalidate: 60 },
  });
  if (res.status === 401 || res.status === 403) throw new Error("Invalid Finnhub API key");
  if (!res.ok) throw new Error(`Finnhub error (HTTP ${res.status})`);
  return res.json() as Promise<T>;
}

export interface MarketNewsItem {
  category: string;
  datetime: number;
  headline: string;
  id: number;
  image: string;
  related: string;
  source: string;
  summary: string;
  url: string;
}

export interface IPOCalendarItem {
  date: string;
  exchange: string;
  name: string;
  numberOfShares: number;
  price: string;
  status: string;
  symbol: string;
  totalSharesValue: number;
}

export interface EarningsCalendarItem {
  date: string;
  epsActual?: number;
  epsEstimate?: number;
  hour: string;
  quarter: number;
  revenueActual?: number;
  revenueEstimate?: number;
  symbol: string;
  year: number;
}

export async function getMarketNews(category: "general" | "forex" | "crypto" | "merger" = "general"): Promise<MarketNewsItem[]> {
  return fh<MarketNewsItem[]>(`/news?category=${category}&minId=0`);
}

export async function getIPOCalendar(from: string, to: string): Promise<{ ipoCalendar: IPOCalendarItem[] }> {
  return fh<{ ipoCalendar: IPOCalendarItem[] }>(`/calendar/ipo?from=${from}&to=${to}`);
}

export async function getEarningsCalendar(from: string, to: string, symbol?: string): Promise<{ earningsCalendar: EarningsCalendarItem[] }> {
  const q = symbol ? `&symbol=${symbol}` : "";
  return fh<{ earningsCalendar: EarningsCalendarItem[] }>(`/calendar/earnings?from=${from}&to=${to}${q}`);
}

export async function getCompanyNews(symbol: string, from: string, to: string): Promise<MarketNewsItem[]> {
  return fh<MarketNewsItem[]>(`/company-news?symbol=${encodeURIComponent(symbol)}&from=${from}&to=${to}`);
}

export interface ForexRates {
  base: string;
  quote: Record<string, number>;
}

export async function getForexRates(base: "USD" | "EUR" = "USD"): Promise<ForexRates> {
  return fh<ForexRates>(`/forex/rates?base=${base}`);
}
