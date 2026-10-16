"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { 
  MapPin, 
  Crosshair, 
  Compass, 
  Layers, 
  Check, 
  Copy, 
  Navigation,
  RotateCcw
} from "lucide-react";

interface GisCoordinatePickerProps {
  latitude: number | null;
  longitude: number | null;
  onChange: (coords: { lat: number; lng: number }) => void;
  locationLabel?: string;
}

// Karachi Luxury Enclave Cadastral Presets
const PRESET_ENCLAVES = [
  { name: "DHA Phase 8 (Zone A / Beachfront)", lat: 24.7836, lng: 67.0622 },
  { name: "Emaar Crescent Bay", lat: 24.7875, lng: 67.0758 },
  { name: "DHA Phase 6 (Ittehad Corridor)", lat: 24.8012, lng: 67.0543 },
  { name: "DHA Phase 5 (Creek Vistas)", lat: 24.8150, lng: 67.0700 },
  { name: "Clifton (Block 2 / 4 Sea View)", lat: 24.8198, lng: 67.0289 },
];

export default function GisCoordinatePicker({
  latitude,
  longitude,
  onChange,
  locationLabel,
}: GisCoordinatePickerProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerInstanceRef = useRef<any>(null);

  // Default coordinate: DHA Phase 8 Zone A Karachi
  const currentLat = typeof latitude === "number" && !isNaN(latitude) ? latitude : 24.7836;
  const currentLng = typeof longitude === "number" && !isNaN(longitude) ? longitude : 67.0622;

  const [inputLat, setInputLat] = useState<string>(
    typeof latitude === "number" ? latitude.toFixed(6) : "24.783600"
  );
  const [inputLng, setInputLng] = useState<string>(
    typeof longitude === "number" ? longitude.toFixed(6) : "67.062200"
  );
  const [copied, setCopied] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [mapReady, setMapReady] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Sync internal input text when external props change
  useEffect(() => {
    if (typeof latitude === "number" && !isNaN(latitude)) {
      setInputLat(latitude.toFixed(6));
    }
    if (typeof longitude === "number" && !isNaN(longitude)) {
      setInputLng(longitude.toFixed(6));
    }
  }, [latitude, longitude]);

  // Initialize Leaflet map safely on client side
  useEffect(() => {
    if (!isMounted) return;
    let isSubscribed = true;

    async function initMap() {
      if (typeof window === "undefined" || !mapContainerRef.current) return;
      if (mapInstanceRef.current) return; // Map already initialized

      // Dynamically load leaflet
      const L = (await import("leaflet")).default;
      if (!isSubscribed || !mapContainerRef.current) return;

      // Custom gold GIS luxury pin marker icon
      const customGoldIcon = L.divIcon({
        className: "custom-gis-pin-container",
        html: `
          <div style="position: relative; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center;">
            <div style="position: absolute; width: 32px; height: 32px; border-radius: 50%; background: rgba(212, 175, 55, 0.25); animation: gis-pulse 2s infinite ease-in-out;"></div>
            <div style="position: relative; width: 24px; height: 24px; border-radius: 50%; background: #D4AF37; border: 2px solid #ffffff; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 10px rgba(0,0,0,0.8);">
              <div style="width: 8px; height: 8px; border-radius: 50%; background: #0a0a0a;"></div>
            </div>
            <div style="position: absolute; bottom: 0; width: 2px; height: 6px; background: #D4AF37;"></div>
          </div>
        `,
        iconSize: [36, 36],
        iconAnchor: [18, 36],
        popupAnchor: [0, -36],
      });

      // Create Leaflet map
      const map = L.map(mapContainerRef.current, {
        center: [currentLat, currentLng],
        zoom: 14,
        zoomControl: true,
        attributionControl: false,
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

      // Create draggable marker
      const marker = L.marker([currentLat, currentLng], {
        icon: customGoldIcon,
        draggable: true,
        autoPan: true,
      }).addTo(map);

      // Bind popup
      marker.bindPopup(
        `<div style="font-family: inherit; font-size: 11px;">
          <strong style="color: #D4AF37; text-transform: uppercase; letter-spacing: 0.1em; display: block; margin-bottom: 2px;">Cadastral GIS Coordinate</strong>
          <span>${currentLat.toFixed(6)}, ${currentLng.toFixed(6)}</span>
          <br/><span style="color: #888; font-size: 9px;">Drag pin or click map to reposition</span>
        </div>`
      );

      // Marker drag event
      marker.on("dragend", (e: any) => {
        const pos = e.target.getLatLng();
        const lat = parseFloat(pos.lat.toFixed(6));
        const lng = parseFloat(pos.lng.toFixed(6));
        onChange({ lat, lng });
        marker.setPopupContent(
          `<div style="font-family: inherit; font-size: 11px;">
            <strong style="color: #D4AF37; text-transform: uppercase; letter-spacing: 0.1em; display: block; margin-bottom: 2px;">Cadastral GIS Coordinate</strong>
            <span>${lat.toFixed(6)}, ${lng.toFixed(6)}</span>
            <br/><span style="color: #888; font-size: 9px;">Drag pin or click map to reposition</span>
          </div>`
        );
      });

      // Map click event: reposition marker to clicked point
      map.on("click", (e: any) => {
        const lat = parseFloat(e.latlng.lat.toFixed(6));
        const lng = parseFloat(e.latlng.lng.toFixed(6));
        marker.setLatLng([lat, lng]);
        onChange({ lat, lng });
        marker.setPopupContent(
          `<div style="font-family: inherit; font-size: 11px;">
            <strong style="color: #D4AF37; text-transform: uppercase; letter-spacing: 0.1em; display: block; margin-bottom: 2px;">Cadastral GIS Coordinate</strong>
            <span>${lat.toFixed(6)}, ${lng.toFixed(6)}</span>
            <br/><span style="color: #888; font-size: 9px;">Drag pin or click map to reposition</span>
          </div>`
        );
      });

      mapInstanceRef.current = map;
      markerInstanceRef.current = marker;
      setMapReady(true);
    }

    initMap();

    return () => {
      isSubscribed = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markerInstanceRef.current = null;
      }
    };
  }, []);

  // Update marker & map position when latitude/longitude props change externally
  useEffect(() => {
    if (mapReady && mapInstanceRef.current && markerInstanceRef.current) {
      if (typeof latitude === "number" && typeof longitude === "number") {
        const currentMarkerPos = markerInstanceRef.current.getLatLng();
        if (
          Math.abs(currentMarkerPos.lat - latitude) > 0.00001 ||
          Math.abs(currentMarkerPos.lng - longitude) > 0.00001
        ) {
          markerInstanceRef.current.setLatLng([latitude, longitude]);
          mapInstanceRef.current.panTo([latitude, longitude], { animate: true });
        }
      }
    }
  }, [latitude, longitude, mapReady]);

  // Handle manual coordinate input changes
  const handleLatInputChange = (val: string) => {
    setInputLat(val);
    const parsed = parseFloat(val);
    if (!isNaN(parsed) && parsed >= -90 && parsed <= 90) {
      const lng = parseFloat(inputLng) || currentLng;
      onChange({ lat: parsed, lng });
    }
  };

  const handleLngInputChange = (val: string) => {
    setInputLng(val);
    const parsed = parseFloat(val);
    if (!isNaN(parsed) && parsed >= -180 && parsed <= 180) {
      const lat = parseFloat(inputLat) || currentLat;
      onChange({ lat, lng: parsed });
    }
  };

  // Preset location select
  const selectPreset = (preset: { lat: number; lng: number; name: string }) => {
    onChange({ lat: preset.lat, lng: preset.lng });
    setInputLat(preset.lat.toFixed(6));
    setInputLng(preset.lng.toFixed(6));
    if (mapInstanceRef.current && markerInstanceRef.current) {
      markerInstanceRef.current.setLatLng([preset.lat, preset.lng]);
      mapInstanceRef.current.flyTo([preset.lat, preset.lng], 15, {
        duration: 1.2,
      });
    }
  };

  // Device Geolocation Detector
  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = parseFloat(position.coords.latitude.toFixed(6));
        const lng = parseFloat(position.coords.longitude.toFixed(6));
        onChange({ lat, lng });
        setInputLat(lat.toFixed(6));
        setInputLng(lng.toFixed(6));
        if (mapInstanceRef.current && markerInstanceRef.current) {
          markerInstanceRef.current.setLatLng([lat, lng]);
          mapInstanceRef.current.flyTo([lat, lng], 16, { duration: 1.2 });
        }
        setIsLocating(false);
      },
      (error) => {
        console.error("Geolocation error:", error);
        alert(`Location acquisition failed: ${error.message}`);
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  // Copy coordinate to clipboard
  const copyCoordinates = () => {
    const text = `${currentLat.toFixed(6)}, ${currentLng.toFixed(6)}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4 rounded-none border border-white/10 bg-black/60 p-4 sm:p-5 backdrop-blur-md">
      {/* Header with Title and Coordinate Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-white/10 pb-3">
        <div className="flex items-center space-x-2">
          <div className="w-7 h-7 bg-[#D4AF37]/10 border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37]">
            <Compass className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs uppercase tracking-widest text-[#D4AF37] font-semibold flex items-center gap-1.5">
              <span>Cadastral GIS Coordinate Engine</span>
              <span className="text-[9px] px-1.5 py-0.2 bg-[#D4AF37]/20 border border-[#D4AF37]/40 text-[#D4AF37] font-mono">
                PRECISION 1.0m
              </span>
            </h4>
            <p className="text-[10px] text-zinc-400">
              Pinpoint precise DHA Karachi coordinates. Click map or drag the gold pin.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={copyCoordinates}
            className="inline-flex items-center space-x-1 text-[10px] font-mono tracking-wider bg-white/5 hover:bg-white/10 border border-white/15 px-2.5 py-1.5 text-zinc-300 transition-colors"
            title="Copy coordinates to clipboard"
          >
            {copied ? (
              <>
                <Check className="w-3 h-3 text-emerald-400" />
                <span className="text-emerald-400">COPIED</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3 text-zinc-400" />
                <span>{currentLat.toFixed(4)}°, {currentLng.toFixed(4)}°</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleDetectLocation}
            disabled={isLocating}
            className="inline-flex items-center space-x-1 text-[10px] uppercase tracking-wider bg-[#D4AF37]/10 hover:bg-[#D4AF37] hover:text-black border border-[#D4AF37]/40 text-[#D4AF37] px-2.5 py-1.5 transition-colors disabled:opacity-50"
            title="Acquire current device GPS position"
          >
            <Crosshair className={`w-3 h-3 ${isLocating ? "animate-spin" : ""}`} />
            <span>{isLocating ? "ACQUIRING..." : "GPS ON-SITE"}</span>
          </button>
        </div>
      </div>

      {/* Preset Luxury Enclave Quick-Select Ribbon */}
      <div className="space-y-1.5">
        <label className="text-[9px] font-mono uppercase tracking-widest text-zinc-400">
          Fast Geodetic Enclave Presets:
        </label>
        <div className="flex flex-wrap gap-1.5">
          {PRESET_ENCLAVES.map((preset) => {
            const isSelected =
              Math.abs(currentLat - preset.lat) < 0.005 &&
              Math.abs(currentLng - preset.lng) < 0.005;

            return (
              <button
                key={preset.name}
                type="button"
                onClick={() => selectPreset(preset)}
                className={`text-[10px] px-2.5 py-1 transition-all border ${
                  isSelected
                    ? "bg-[#D4AF37] text-black font-semibold border-[#D4AF37]"
                    : "bg-white/[0.03] text-zinc-300 border-white/10 hover:border-[#D4AF37]/50 hover:text-white"
                }`}
              >
                {preset.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Interactive Leaflet Map Viewport */}
      <div className="relative w-full h-[280px] sm:h-[320px] overflow-hidden border border-white/15 bg-black shadow-inner">
        <div ref={mapContainerRef} className="w-full h-full" />
        
        {/* Floating Map HUD overlay */}
        <div className="absolute bottom-3 left-3 z-[400] bg-black/85 backdrop-blur-md border border-white/20 px-3 py-1 text-[9px] font-mono text-zinc-300 flex items-center space-x-2">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>WGS 84 / CartoDB Dark Matter GIS</span>
        </div>
      </div>

      {/* Two-Way Precise Numerical Coordinate Inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
        <div className="space-y-1">
          <label className="text-[10px] uppercase tracking-wider text-zinc-300 font-mono flex items-center justify-between">
            <span>Latitude (float8)</span>
            <span className="text-[9px] text-zinc-500">-90.0 to +90.0</span>
          </label>
          <input
            type="number"
            step="0.000001"
            name="latitude"
            value={inputLat}
            onChange={(e) => handleLatInputChange(e.target.value)}
            placeholder="24.783600"
            className="w-full bg-black/80 border border-white/10 p-2.5 text-xs font-mono text-white focus:border-[#D4AF37] outline-none transition-colors"
          />
        </div>

        <div className="space-y-1">
          <label className="text-[10px] uppercase tracking-wider text-zinc-300 font-mono flex items-center justify-between">
            <span>Longitude (float8)</span>
            <span className="text-[9px] text-zinc-500">-180.0 to +180.0</span>
          </label>
          <input
            type="number"
            step="0.000001"
            name="longitude"
            value={inputLng}
            onChange={(e) => handleLngInputChange(e.target.value)}
            placeholder="67.062200"
            className="w-full bg-black/80 border border-white/10 p-2.5 text-xs font-mono text-white focus:border-[#D4AF37] outline-none transition-colors"
          />
        </div>
      </div>
    </div>
  );
}
