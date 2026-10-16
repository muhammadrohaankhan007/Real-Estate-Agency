"use client";

import React, { useEffect, useRef, useState } from "react";
import { Compass, MapPin, ExternalLink, Navigation } from "lucide-react";

interface PropertyGisMapProps {
  latitude?: number | null;
  longitude?: number | null;
  title: string;
  location: string;
  demand: string;
}

export default function PropertyGisMap({
  latitude,
  longitude,
  title,
  location,
  demand,
}: PropertyGisMapProps) {
  const [isMounted, setIsMounted] = useState(false);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);

  // Strict hydration guard: prevent SSR / window mismatch
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Fallback to DHA Phase 8 Karachi if coordinates are missing
  const hasExactCoords =
    typeof latitude === "number" &&
    typeof longitude === "number" &&
    !isNaN(latitude) &&
    !isNaN(longitude);

  const lat = hasExactCoords ? (latitude as number) : 24.7836;
  const lng = hasExactCoords ? (longitude as number) : 67.0622;

  useEffect(() => {
    if (!isMounted) return;
    let isSubscribed = true;

    async function initMap() {
      if (typeof window === "undefined" || !mapContainerRef.current) return;
      if (mapInstanceRef.current) return;

      const L = (await import("leaflet")).default;
      if (!isSubscribed || !mapContainerRef.current) return;

      // Custom gold GIS luxury pin marker icon
      const customGoldIcon = L.divIcon({
        className: "custom-gis-pin-container",
        html: `
          <div style="position: relative; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center;">
            <div style="position: absolute; width: 36px; height: 36px; border-radius: 50%; background: rgba(212, 175, 55, 0.3); animation: gis-pulse 2s infinite ease-in-out;"></div>
            <div style="position: relative; width: 28px; height: 28px; border-radius: 50%; background: #D4AF37; border: 2.5px solid #ffffff; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(0,0,0,0.85);">
              <div style="width: 10px; height: 10px; border-radius: 50%; background: #0a0a0a;"></div>
            </div>
            <div style="position: absolute; bottom: 0; width: 2px; height: 8px; background: #D4AF37;"></div>
          </div>
        `,
        iconSize: [40, 40],
        iconAnchor: [20, 40],
        popupAnchor: [0, -40],
      });

      const map = L.map(mapContainerRef.current, {
        center: [lat, lng],
        zoom: hasExactCoords ? 15 : 13,
        zoomControl: true,
        attributionControl: false,
        scrollWheelZoom: false,
      });

      // Tile Layer with NEXT_PUBLIC_GIS_MAP_API_KEY and CartoDB Dark Matter automatic fallback
      const gisApiKey = process.env.NEXT_PUBLIC_GIS_MAP_API_KEY;
      const fallbackTileLayer = L.tileLayer(
        "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
        {
          maxZoom: 19,
          subdomains: "abcd",
        }
      );

      if (gisApiKey) {
        const stadiaTileUrl = `https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png?api_key=${gisApiKey}`;
        const stadiaLayer = L.tileLayer(stadiaTileUrl, {
          maxZoom: 20,
        });

        let hasFallenBack = false;
        stadiaLayer.on("tileerror", () => {
          if (!hasFallenBack) {
            hasFallenBack = true;
            if (map.hasLayer(stadiaLayer)) {
              map.removeLayer(stadiaLayer);
            }
            fallbackTileLayer.addTo(map);
          }
        });

        stadiaLayer.addTo(map);
      } else {
        fallbackTileLayer.addTo(map);
      }

      // Marker
      const marker = L.marker([lat, lng], {
        icon: customGoldIcon,
      }).addTo(map);

      // Luxury Popup
      marker.bindPopup(
        `<div style="font-family: inherit; font-size: 12px; color: #fff; min-width: 180px;">
          <span style="color: #D4AF37; font-size: 9px; text-transform: uppercase; letter-spacing: 0.15em; font-weight: 600; display: block; margin-bottom: 2px;">
            ${hasExactCoords ? "Cadastral Verified Coordinate" : "Enclave General Area"}
          </span>
          <strong style="font-size: 13px; color: #fff; display: block; margin-bottom: 4px;">${title}</strong>
          <span style="color: #D4AF37; font-weight: 600; font-size: 12px; display: block; margin-bottom: 4px;">${demand}</span>
          <span style="color: #999; font-size: 10px; display: block;">${location}</span>
          <div style="margin-top: 6px; font-family: monospace; font-size: 9px; color: #aaa; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 4px;">
            GPS: ${lat.toFixed(6)}, ${lng.toFixed(6)}
          </div>
        </div>`
      );

      marker.openPopup();
      mapInstanceRef.current = map;
    }

    initMap();

    return () => {
      isSubscribed = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [isMounted, lat, lng, title, demand, location, hasExactCoords]);

  const googleMapsDirectionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;

  const resetView = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([lat, lng], hasExactCoords ? 15 : 13, {
        animate: true,
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h3 className="font-serif text-xl sm:text-2xl font-light text-white flex items-center gap-2">
            <Compass className="w-5 h-5 text-[#D4AF37]" />
            <span>Cadastral GIS & Satellitic Geolocation</span>
          </h3>
          <p className="text-xs text-zinc-400 mt-1">
            {hasExactCoords
              ? `Sub-meter verified coordinates: ${lat.toFixed(6)}° N, ${lng.toFixed(6)}° E`
              : `Enclave overview for ${location}`}
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={resetView}
            className="text-[10px] uppercase tracking-wider font-mono bg-white/5 hover:bg-white/10 text-zinc-300 border border-white/15 px-3 py-2 transition-colors flex items-center gap-1.5"
          >
            <span>Reset View</span>
          </button>

          <a
            href={googleMapsDirectionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[10px] uppercase tracking-wider font-semibold bg-[#D4AF37] hover:bg-white text-black px-3.5 py-2 transition-colors flex items-center gap-1.5 shadow-md"
          >
            <Navigation className="w-3.5 h-3.5" />
            <span>Open Navigation</span>
            <ExternalLink className="w-3 h-3 ml-0.5" />
          </a>
        </div>
      </div>

      {/* Leaflet GIS Map Container */}
      <div className="relative w-full h-80 sm:h-96 overflow-hidden border border-white/10 bg-black shadow-2xl">
        {!isMounted ? (
          <div className="w-full h-full flex items-center justify-center bg-black/60 font-mono text-xs text-zinc-500">
            <span className="w-2 h-2 rounded-full bg-[#D4AF37] animate-pulse mr-2" />
            <span>INITIALIZING GIS CADASTRAL SATELLITE TILES...</span>
          </div>
        ) : (
          <div ref={mapContainerRef} className="w-full h-full" />
        )}

        {/* Cadastral Coordinate Watermark */}
        <div className="absolute top-4 right-4 z-[400] bg-black/85 backdrop-blur-md border border-[#D4AF37]/40 px-3 py-1.5 text-[10px] font-mono text-[#D4AF37] flex items-center space-x-2 shadow-lg">
          <MapPin className="w-3 h-3 text-[#D4AF37]" />
          <span>
            {lat.toFixed(6)}° N, {lng.toFixed(6)}° E
          </span>
        </div>

        {/* Map Engine Badge */}
        <div className="absolute bottom-3 left-3 z-[400] bg-black/80 backdrop-blur-sm border border-white/15 px-2.5 py-1 text-[9px] font-mono text-zinc-400">
          <span>CartoDB Dark Matter • GIS WGS 84</span>
        </div>
      </div>
    </div>
  );
}
