"use client";

import { useEffect, useRef } from "react";

type Point = { lat: number; lng: number; title: string; day: number };

// Loads Leaflet from CDN (no npm dependency) and renders itinerary markers.
export function TripMap({ points }: { points: Point[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<unknown>(null);

  useEffect(() => {
    if (!points.length) return;
    let cancelled = false;

    async function ensureLeaflet(): Promise<any> {
      const w = window as any;
      if (w.L) return w.L;

      if (!document.getElementById("leaflet-css")) {
        const link = document.createElement("link");
        link.id = "leaflet-css";
        link.rel = "stylesheet";
        link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
        document.head.appendChild(link);
      }

      await new Promise<void>((resolve, reject) => {
        const existing = document.getElementById("leaflet-js") as HTMLScriptElement | null;
        if (existing) {
          if ((window as any).L) resolve();
          else existing.addEventListener("load", () => resolve());
          return;
        }
        const script = document.createElement("script");
        script.id = "leaflet-js";
        script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
        script.onload = () => resolve();
        script.onerror = () => reject(new Error("Failed to load Leaflet"));
        document.body.appendChild(script);
      });

      return (window as any).L;
    }

    ensureLeaflet()
      .then((L) => {
        if (cancelled || !containerRef.current) return;

        // Fix default marker icon URLs (they otherwise 404 with bundlers).
        delete (L.Icon.Default.prototype as any)._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
          iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
          shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
        });

        if (mapRef.current) {
          (mapRef.current as any).remove();
          mapRef.current = null;
        }

        const map = L.map(containerRef.current);
        mapRef.current = map;

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: "&copy; OpenStreetMap contributors",
          maxZoom: 19,
        }).addTo(map);

        const latlngs: [number, number][] = [];
        for (const p of points) {
          L.marker([p.lat, p.lng])
            .addTo(map)
            .bindPopup(`<strong>Day ${p.day}</strong><br/>${p.title}`);
          latlngs.push([p.lat, p.lng]);
        }

        if (latlngs.length === 1) {
          map.setView(latlngs[0], 11);
        } else {
          map.fitBounds(latlngs, { padding: [40, 40] });
        }
      })
      .catch(() => {
        // Map failed to load — fail silently, the itinerary list still works.
      });

    return () => {
      cancelled = true;
      if (mapRef.current) {
        (mapRef.current as any).remove();
        mapRef.current = null;
      }
    };
  }, [points]);

  if (!points.length) return null;

  return (
    <div
      ref={containerRef}
      className="z-0 h-72 w-full overflow-hidden rounded-2xl border border-slate-100"
    />
  );
}
