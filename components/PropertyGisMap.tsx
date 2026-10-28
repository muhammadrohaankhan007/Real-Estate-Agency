"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { Compass, MapPin, ExternalLink, Navigation } from "lucide-react";

interface PropertyGisMapProps {
  latitude?: number | null;
  longitude?: number | null;
  title: string;
  location: string;
  demand: string;
}

type MapTileStyle = "dark" | "satellite" | "streets";

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
  const activeTileLayerRef = useRef<any>(null);
  const [activeStyle, setActiveStyle] = useState<MapTileStyle>("dark");
  const [isFallbackActive, setIsFallbackActive] = useState(false);

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

  // Switch Tile Layer Helper
  const switchLayerStyle = useCallback(async (style: MapTileStyle) => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;
    const L = (await import("leaflet")).default;

    if (activeTileLayerRef.current && map.hasLayer(activeTileLayerRef.current)) {
      map.removeLayer(activeTileLayerRef.current);
    }

    let newLayer: any;
    if (style === "satellite") {
      newLayer = L.tileLayer(
        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
        {
          maxZoom: 19,
          attribution: "&copy; Esri &copy; Maxar &copy; Earthstar Geographics",
        }
      );
    } else if (style === "streets") {
      newLayer = L.tileLayer(
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        {
          maxZoom: 19,
          subdomains: "abc",
          attribution: "&copy; OpenStreetMap contributors",
        }
      );
    } else {
      const cartoLayer = L.tileLayer(
        "https://{s}.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}{r}.png",
        {
          maxZoom: 20,
          subdomains: "abcd",
          attribution: "&copy; OpenStreetMap contributors &copy; CARTO",
        }
      );

      let hasFallenBack = false;
      cartoLayer.on("tileerror", () => {
        if (!hasFallenBack && mapInstanceRef.current) {
          hasFallenBack = true;
          setIsFallbackActive(true);
          console.warn("Carto basemap tile issue on property map. Falling back to OpenStreetMap Dark layer.");
          if (map.hasLayer(cartoLayer)) {
            map.removeLayer(cartoLayer);
          }
          const osmDark = L.tileLayer(
            "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
            {
              maxZoom: 19,
              subdomains: "abc",
              className: "leaflet-dark-fallback",
              attribution: "&copy; OpenStreetMap contributors",
            }
          );
          osmDark.addTo(map);
          activeTileLayerRef.current = osmDark;
        }
      });

      newLayer = cartoLayer;
    }

    newLayer.addTo(map);
    activeTileLayerRef.current = newLayer;
    setActiveStyle(style);
  }, []);

  useEffect(() => {
    if (!isMounted) return;
    let isSubscribed = true;

    async function initMap() {
      if (typeof window === "undefined" || !mapContainerRef.current) return;
      if (mapInstanceRef.current) return;

      // Prevent "Map container is already initialized" crash
      if ((mapContainerRef.current as any)._leaflet_id) {
        delete (mapContainerRef.current as any)._leaflet_id;
      }

      const L = (await import("leaflet")).default;
      if (!isSubscribed || !mapContainerRef.current) return;

      // Custom Gold SVG GIS luxury pin marker (#D4AF37) with pulsating radial aura glow
      const customGoldIcon = L.divIcon({
        className: "custom-gis-pin-container",
        html: `
          <div style="position: relative; width: 46px; height: 46px; display: flex; align-items: center; justify-content: center;">
            <div class="gis-pulse-marker" style="position: absolute; width: 42px; height: 42px; border-radius: 50%; background: radial-gradient(circle, rgba(212, 175, 55, 0.6) 0%, rgba(212, 175, 55, 0.2) 55%, transparent 75%); pointer-events: none;"></div>
            <svg width="34" height="34" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(0 4px 10px rgba(0,0,0,0.85)); z-index: 2;">
              <path d="M12 2C8.13401 2 5 5.13401 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.13401 15.866 2 12 2Z" fill="#D4AF37" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              <circle cx="12" cy="9" r="3.2" fill="#0a0a0a" stroke="#ffffff" stroke-width="0.8"/>
            </svg>
          </div>
        `,
        iconSize: [46, 46],
        iconAnchor: [23, 42],
        popupAnchor: [0, -42],
      });

      const map = L.map(mapContainerRef.current, {
        center: [lat, lng],
        zoom: hasExactCoords ? 16 : 14,
        zoomControl: false,
        attributionControl: false,
        scrollWheelZoom: false,
      });

      L.control.zoom({ position: "bottomright" }).addTo(map);

      // Primary CartoDB Layer with Auto-Fallback
      const cartoLayer = L.tileLayer(
        "https://{s}.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}{r}.png",
        {
          maxZoom: 20,
          subdomains: "abcd",
          attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
        }
      );

      let hasFallenBack = false;
      cartoLayer.on("tileerror", () => {
        if (!hasFallenBack && mapInstanceRef.current) {
          hasFallenBack = true;
          setIsFallbackActive(true);
          console.warn("Carto basemap tile issue on detail map. Falling back to OpenStreetMap Dark layer.");
          if (map.hasLayer(cartoLayer)) {
            map.removeLayer(cartoLayer);
          }
          const osmDark = L.tileLayer(
            "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
            {
              maxZoom: 19,
              subdomains: "abc",
              className: "leaflet-dark-fallback",
              attribution: "&copy; OpenStreetMap contributors",
            }
          );
          osmDark.addTo(map);
          activeTileLayerRef.current = osmDark;
        }
      });

      cartoLayer.addTo(map);
      activeTileLayerRef.current = cartoLayer;

      // Multi-tier Invalidation Guards to guarantee zero blank grey states
      map.invalidateSize();
      const timer1 = setTimeout(() => {
        if (map) map.invalidateSize();
      }, 100);
      const timer2 = setTimeout(() => {
        if (map) map.invalidateSize();
      }, 350);

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

    const handleResize = () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    };
    window.addEventListener("resize", handleResize);

    return () => {
      isSubscribed = false;
      window.removeEventListener("resize", handleResize);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        activeTileLayerRef.current = null;
      }
      if (mapContainerRef.current && (mapContainerRef.current as any)._leaflet_id) {
        delete (mapContainerRef.current as any)._leaflet_id;
      }
    };
  }, [isMounted, lat, lng, title, demand, location, hasExactCoords]);

  const googleMapsDirectionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;

  const resetView = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([lat, lng], hasExactCoords ? 16 : 14, {
        animate: true,
        duration: 1.5,
      });
      mapInstanceRef.current.invalidateSize();
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
      <div 
        className="relative z-0 w-full overflow-hidden rounded-xl border border-neutral-800 bg-black shadow-2xl"
        style={{ height: "350px", width: "100%" }}
      >
        {!isMounted ? (
          <div className="w-full h-full flex items-center justify-center bg-black/60 font-mono text-xs text-zinc-500">
            <span className="w-2 h-2 rounded-full bg-[#D4AF37] animate-pulse mr-2" />
            <span>INITIALIZING GIS CADASTRAL SATELLITE TILES...</span>
          </div>
        ) : (
          <div ref={mapContainerRef} style={{ height: "100%", width: "100%" }} />
        )}

        {/* Top-Left: Map Layer Style Switcher HUD */}
        <div className="absolute top-2.5 xs:top-3 left-2.5 xs:left-3 z-[400] flex items-center space-x-1 bg-black/85 backdrop-blur-md border border-white/20 p-1">
          <button
            type="button"
            onClick={() => switchLayerStyle("dark")}
            className={`px-2 py-0.5 text-[9px] uppercase tracking-wider font-mono transition-colors ${
              activeStyle === "dark" 
                ? "bg-[#D4AF37] text-black font-semibold" 
                : "text-zinc-300 hover:text-white"
            }`}
          >
            Dark GIS
          </button>
          <button
            type="button"
            onClick={() => switchLayerStyle("satellite")}
            className={`px-2 py-0.5 text-[9px] uppercase tracking-wider font-mono transition-colors ${
              activeStyle === "satellite" 
                ? "bg-[#D4AF37] text-black font-semibold" 
                : "text-zinc-300 hover:text-white"
            }`}
          >
            Satellite
          </button>
          <button
            type="button"
            onClick={() => switchLayerStyle("streets")}
            className={`px-2 py-0.5 text-[9px] uppercase tracking-wider font-mono transition-colors ${
              activeStyle === "streets" 
                ? "bg-[#D4AF37] text-black font-semibold" 
                : "text-zinc-300 hover:text-white"
            }`}
          >
            Streets
          </button>
        </div>

        {/* Cadastral Coordinate Watermark */}
        <div className="hidden xs:flex absolute top-3 right-3 sm:top-4 sm:right-4 z-[400] bg-black/85 backdrop-blur-md border border-[#D4AF37]/40 px-2.5 xs:px-3 py-1 xs:py-1.5 text-[9px] xs:text-[10px] font-mono text-[#D4AF37] items-center space-x-1.5 shadow-lg">
          <MapPin className="w-3 h-3 text-[#D4AF37]" />
          <span>
            {lat.toFixed(6)}°, {lng.toFixed(6)}°
          </span>
        </div>

        {/* Map Engine Badge */}
        <div className="hidden xs:flex absolute bottom-3 left-3 z-[400] bg-black/80 backdrop-blur-sm border border-white/15 px-2.5 py-1 text-[9px] font-mono text-zinc-400 items-center space-x-1.5 max-w-[calc(100%-90px)] truncate">
          <span className={`w-1.5 h-1.5 rounded-full ${isFallbackActive ? "bg-amber-400" : "bg-emerald-400"} animate-pulse flex-shrink-0`} />
          <span className="truncate">
            {activeStyle === "satellite" 
              ? "Esri World Imagery High-Res Satellite" 
              : activeStyle === "streets" 
              ? "OpenStreetMap Cadastral Streets" 
              : isFallbackActive 
              ? "OpenStreetMap Dark GIS" 
              : "CartoDB Dark Matter GIS"}
          </span>
        </div>
      </div>
    </div>
  );
}
