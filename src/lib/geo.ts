// Geocoding via OpenStreetMap Nominatim (no API key). The parse step is a pure
// function so it can be unit-tested without hitting the network.

export function parseNominatim(data: unknown): { lat: number; lng: number } | null {
  if (Array.isArray(data) && data.length > 0) {
    const first = data[0] as { lat?: string; lon?: string };
    const lat = parseFloat(String(first.lat));
    const lng = parseFloat(String(first.lon));
    if (!Number.isNaN(lat) && !Number.isNaN(lng)) return { lat, lng };
  }
  return null;
}

export async function geocode(query: string): Promise<{ lat: number; lng: number } | null> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(query)}`,
      { headers: { "User-Agent": "Itinera/1.0 (portfolio demo)" } },
    );
    if (!res.ok) return null;
    return parseNominatim(await res.json());
  } catch {
    return null;
  }
}

/** Validate an AI-provided coordinate pair. */
export function validCoord(lat: unknown, lng: unknown): { lat: number; lng: number } | null {
  const a = Number(lat);
  const b = Number(lng);
  if (Number.isFinite(a) && Number.isFinite(b) && a >= -90 && a <= 90 && b >= -180 && b <= 180) {
    return { lat: a, lng: b };
  }
  return null;
}
