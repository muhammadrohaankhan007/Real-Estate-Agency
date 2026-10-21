"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { 
  MapPin, 
  Crosshair, 
  Compass, 
  Check, 
  Copy, 
  Search,
  Loader2,
  Layers,
  Sparkles,
  AlertCircle
} from "lucide-react";

interface GisCoordinatePickerProps {
  latitude: number | null;
  longitude: number | null;
  onChange: (coords: { lat: number; lng: number }) => void;
  locationLabel?: string;
}

// Karachi Luxury Enclave Cadastral Presets
const PRESET_ENCLAVES = [
  { name: "DHA Phase 8", lat: 24.7836, lng: 67.0622 },
  { name: "Emaar Crescent Bay", lat: 24.7875, lng: 67.0758 },
  { name: "Khayaban-e-Ghalib", lat: 24.7795, lng: 67.0684 },
  { name: "Khayaban-e-Faisal", lat: 24.7725, lng: 67.0712 },
  { name: "DHA Phase 6", lat: 24.8012, lng: 67.0543 },
  { name: "Clifton", lat: 24.8198, lng: 67.0289 },
];

type MapTileStyle = "dark" | "satellite" | "streets";

export default function GisCoordinatePicker({
  latitude,
  longitude,
  onChange,
  locationLabel,
}: GisCoordinatePickerProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerInstanceRef = useRef<any>(null);
  const activeTileLayerRef = useRef<any>(null);

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
  const [activeStyle, setActiveStyle] = useState<MapTileStyle>("dark");
  const [isFallbackActive, setIsFallbackActive] = useState(false);

  // Geocoding Search States
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchFeedback, setSearchFeedback] = useState<string | null>(null);

  // Strict Hydration Guard
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

  // Switch Tile Layer Helper
  const switchLayerStyle = useCallback(async (style: MapTileStyle) => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;
    const L = (await import("leaflet")).default;

    // Remove existing layer
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
      // Dark Matter with automatic OpenStreetMap fallback
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
          console.warn("Carto basemap tile issue detected. Seamlessly falling back to high-uptime OpenStreetMap Dark GIS layer.");
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

  // Initialize Leaflet map safely on client side
  useEffect(() => {
    if (!isMounted) return;
    let isSubscribed = true;

    async function initMap() {
      if (typeof window === "undefined" || !mapContainerRef.current) return;
      if (mapInstanceRef.current) return;

      // Crucial Fix: Clear any stale Leaflet instance ID on the DOM container to prevent "Map container is already initialized"
      if ((mapContainerRef.current as any)._leaflet_id) {
        delete (mapContainerRef.current as any)._leaflet_id;
      }

      // Dynamically load leaflet
      const L = (await import("leaflet")).default;
      if (!isSubscribed || !mapContainerRef.current) return;

      // Custom Gold SVG Pinpoint Marker (#D4AF37) with Radial Aura Glow
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

      // Create Leaflet map instance
      const map = L.map(mapContainerRef.current, {
        center: [currentLat, currentLng],
        zoom: 14,
        zoomControl: true,
        attributionControl: false,
      });

      // Multi-tier Tile Layer: CartoDB Dark Matter with automatic OSM Fallback
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
          console.warn("Carto basemap tile error. Falling back to OpenStreetMap Dark layer.");
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

      // Create draggable marker
      const marker = L.marker([currentLat, currentLng], {
        icon: customGoldIcon,
        draggable: true,
        autoPan: true,
      }).addTo(map);

      const updatePopupContent = (latVal: number, lngVal: number) => {
        marker.setPopupContent(
          `<div style="font-family: inherit; font-size: 11px;">
            <strong style="color: #D4AF37; text-transform: uppercase; letter-spacing: 0.1em; display: block; margin-bottom: 2px;">Cadastral GIS Coordinate</strong>
            <span>${latVal.toFixed(6)}, ${lngVal.toFixed(6)}</span>
            <br/><span style="color: #888; font-size: 9px;">Drag pin or click map to reposition</span>
          </div>`
        );
      };

      // Initial Popup
      updatePopupContent(currentLat, currentLng);

      // Marker dragend event: update coordinates
      marker.on("dragend", (e: any) => {
        const pos = e.target.getLatLng();
        const lat = parseFloat(pos.lat.toFixed(6));
        const lng = parseFloat(pos.lng.toFixed(6));
        onChange({ lat, lng });
        setInputLat(lat.toFixed(6));
        setInputLng(lng.toFixed(6));
        updatePopupContent(lat, lng);
      });

      // Map click event: reposition marker to clicked point
      map.on("click", (e: any) => {
        const lat = parseFloat(e.latlng.lat.toFixed(6));
        const lng = parseFloat(e.latlng.lng.toFixed(6));
        marker.setLatLng([lat, lng]);
        onChange({ lat, lng });
        setInputLat(lat.toFixed(6));
        setInputLng(lng.toFixed(6));
        updatePopupContent(lat, lng);
      });

      mapInstanceRef.current = map;
      markerInstanceRef.current = marker;
      setMapReady(true);
    }

    initMap();

    // Resize event listener for responsive container changes
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
        markerInstanceRef.current = null;
        activeTileLayerRef.current = null;
      }
      if (mapContainerRef.current && (mapContainerRef.current as any)._leaflet_id) {
        delete (mapContainerRef.current as any)._leaflet_id;
      }
    };
  }, [isMounted]);

  // Secondary Invalidation Guard: run when mapReady changes
  useEffect(() => {
    if (mapReady && mapInstanceRef.current) {
      const timer = setTimeout(() => {
        mapInstanceRef.current?.invalidateSize();
      }, 250);
      return () => clearTimeout(timer);
    }
  }, [mapReady]);

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
      if (markerInstanceRef.current && mapInstanceRef.current) {
        markerInstanceRef.current.setLatLng([parsed, lng]);
        mapInstanceRef.current.panTo([parsed, lng], { animate: true });
      }
    }
  };

  const handleLngInputChange = (val: string) => {
    setInputLng(val);
    const parsed = parseFloat(val);
    if (!isNaN(parsed) && parsed >= -180 && parsed <= 180) {
      const lat = parseFloat(inputLat) || currentLat;
      onChange({ lat, lng: parsed });
      if (markerInstanceRef.current && mapInstanceRef.current) {
        markerInstanceRef.current.setLatLng([lat, parsed]);
        mapInstanceRef.current.panTo([lat, parsed], { animate: true });
      }
    }
  };

  // Preset location select: smooth flyTo and exact coordinates
  const selectPreset = (preset: { lat: number; lng: number; name: string }) => {
    onChange({ lat: preset.lat, lng: preset.lng });
    setInputLat(preset.lat.toFixed(6));
    setInputLng(preset.lng.toFixed(6));
    setSearchFeedback(`Pinned: ${preset.name}`);
    if (mapInstanceRef.current && markerInstanceRef.current) {
      markerInstanceRef.current.setLatLng([preset.lat, preset.lng]);
      mapInstanceRef.current.flyTo([preset.lat, preset.lng], 16, {
        animate: true,
        duration: 1.5,
      });
      mapInstanceRef.current.invalidateSize();
    }
  };

  // Live Cadastral Geocoding Search Engine
  const handleGeocodeSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const query = searchQuery.trim() || locationLabel?.trim();
    if (!query) {
      setSearchFeedback("Please enter a Karachi enclave, street, or landmark");
      return;
    }

    setIsSearching(true);
    setSearchFeedback("Resolving cadastral coordinates...");

    try {
      const res = await fetch(`/api/map/geocode?query=${encodeURIComponent(query)}`);
      const data = await res.json();

      if (data?.coordinates?.lat && data?.coordinates?.lng) {
        const lat = parseFloat(data.coordinates.lat.toFixed(6));
        const lng = parseFloat(data.coordinates.lng.toFixed(6));

        onChange({ lat, lng });
        setInputLat(lat.toFixed(6));
        setInputLng(lng.toFixed(6));
        setSearchFeedback(data.name || `Located: ${lat}, ${lng}`);

        if (mapInstanceRef.current && markerInstanceRef.current) {
          markerInstanceRef.current.setLatLng([lat, lng]);
          mapInstanceRef.current.flyTo([lat, lng], 16, {
            animate: true,
            duration: 1.5,
          });
          mapInstanceRef.current.invalidateSize();
        }
      } else {
        setSearchFeedback("Enclave not resolved. Click on map or choose a preset.");
      }
    } catch (err) {
      console.error("Geocoding search error:", err);
      setSearchFeedback("Search engine notice: using manual pin placement.");
    } finally {
      setIsSearching(false);
    }
  };

  // Device Geolocation Detector (GPS ON-SITE)
  const handleDetectLocation = () => {
    if (typeof window === "undefined" || !navigator.geolocation) {
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
        setSearchFeedback(`GPS Acquired: ${lat.toFixed(4)}, ${lng.toFixed(4)}`);
        if (mapInstanceRef.current && markerInstanceRef.current) {
          markerInstanceRef.current.setLatLng([lat, lng]);
          mapInstanceRef.current.flyTo([lat, lng], 16, { duration: 1.2 });
          mapInstanceRef.current.invalidateSize();
        }
        setIsLocating(false);
      },
      (error) => {
        console.error("Geolocation error:", error);
        alert(`Location acquisition notice: ${error.message}. You can click the map to place the pin.`);
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
    <div className="space-y-4 rounded-xl border border-white/10 bg-black/60 p-4 sm:p-5 backdrop-blur-md">
      {/* Header with Title and Action Badges */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-white/10 pb-3">
        <div className="flex items-center space-x-2">
          <div className="w-7 h-7 bg-[#D4AF37]/10 border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37]">
            <Compass className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs uppercase tracking-widest text-[#D4AF37] font-semibold flex items-center gap-1.5">
              <span>Cadastral GIS Coordinate Engine</span>
              <span className="text-[9px] px-1.5 py-0.2 bg-[#D4AF37]/20 border border-[#D4AF37]/40 text-[#D4AF37] font-mono">
                MULTI-PROVIDER FAILSAFE
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

      {/* Cadastral Geocoding Search Bar */}
      <form onSubmit={handleGeocodeSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={locationLabel ? `Search or sync location: "${locationLabel}"` : "Search DHA enclave, road, or landmark (e.g. Emaar, Khayaban-e-Ghalib)..."}
            className="w-full bg-black/80 border border-white/15 pl-9 pr-3 py-2 text-xs text-white placeholder-zinc-500 focus:border-[#D4AF37] outline-none transition-colors"
          />
        </div>
        <button
          type="submit"
          disabled={isSearching}
          className="bg-[#D4AF37] hover:bg-[#c49f2e] text-black font-semibold text-xs px-4 py-2 uppercase tracking-wider flex items-center space-x-1 transition-colors disabled:opacity-50"
        >
          {isSearching ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
          <span>{isSearching ? "PINPOINTING..." : "LOCATE"}</span>
        </button>

        {locationLabel && locationLabel.trim() !== searchQuery.trim() && (
          <button
            type="button"
            onClick={() => {
              setSearchQuery(locationLabel);
              const fakeEvent = { preventDefault: () => {} } as any;
              handleGeocodeSearch(fakeEvent);
            }}
            className="bg-white/10 hover:bg-white/15 text-zinc-200 border border-white/20 text-xs px-3 py-2 uppercase tracking-wider transition-colors hidden sm:inline-flex items-center space-x-1"
            title="Sync with current Location input value"
          >
            <span>USE FORM LOCATION</span>
          </button>
        )}
      </form>

      {searchFeedback && (
        <div className="text-[10px] text-zinc-400 flex items-center space-x-1 font-mono">
          <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]" />
          <span>{searchFeedback}</span>
        </div>
      )}

      {/* Preset Luxury Enclave Quick-Select Ribbon */}
      <div className="space-y-1.5">
        <label className="text-[9px] font-mono uppercase tracking-widest text-zinc-400">
          Fast Geodetic Enclave Presets:
        </label>
        <div className="flex flex-wrap gap-1.5">
          {PRESET_ENCLAVES.map((preset) => {
            const isSelected =
              Math.abs(currentLat - preset.lat) < 0.003 &&
              Math.abs(currentLng - preset.lng) < 0.003;

            return (
              <button
                key={preset.name}
                type="button"
                onClick={() => selectPreset(preset)}
                className={`text-[10px] px-2.5 py-1 transition-all border ${
                  isSelected
                    ? "bg-[#D4AF37] text-black font-semibold border-[#D4AF37] shadow-sm shadow-[#D4AF37]/30"
                    : "bg-white/[0.03] text-zinc-300 border-white/10 hover:border-[#D4AF37]/50 hover:text-white"
                }`}
              >
                {preset.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Interactive Leaflet Map Viewport with Explicit Container Dimensions */}
      <div 
        className="relative z-0 overflow-hidden rounded-xl border border-neutral-800"
        style={{ height: "350px", width: "100%" }}
      >
        <div ref={mapContainerRef} style={{ height: "100%", width: "100%" }} />
        
        {/* Top-Left: Map Layer Style Switcher HUD */}
        <div className="absolute top-3 left-3 z-[400] flex items-center space-x-1 bg-black/85 backdrop-blur-md border border-white/20 p-1">
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

        {/* Floating Map HUD overlay */}
        <div className="absolute bottom-3 left-3 z-[400] bg-black/85 backdrop-blur-md border border-white/20 px-3 py-1 text-[9px] font-mono text-zinc-300 flex items-center space-x-2">
          <span className={`w-1.5 h-1.5 rounded-full ${isFallbackActive ? "bg-amber-400" : "bg-emerald-400"} animate-pulse`} />
          <span>
            {activeStyle === "satellite" 
              ? "Esri World Imagery High-Res Satellite" 
              : activeStyle === "streets" 
              ? "OpenStreetMap Cadastral Streets" 
              : isFallbackActive 
              ? "OpenStreetMap Dark GIS (Failsafe Active)" 
              : "CartoDB Dark Matter GIS"}
          </span>
        </div>

        {/* Live Coordinate Watermark */}
        <div className="absolute top-3 right-3 z-[400] bg-black/85 backdrop-blur-md border border-[#D4AF37]/30 px-2.5 py-1 text-[9px] font-mono text-[#D4AF37] flex items-center space-x-1.5">
          <MapPin className="w-3 h-3 text-[#D4AF37]" />
          <span>{currentLat.toFixed(6)}, {currentLng.toFixed(6)}</span>
        </div>
      </div>

      {/* Two-Way Precise Numerical Coordinate Inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
        <div className="space-y-1">
          <label className="text-[10px] uppercase tracking-wider text-zinc-300 font-mono flex items-center justify-between">
            <span>Latitude (double precision)</span>
            <span className="text-[9px] text-zinc-500">-90.0 to +90.0</span>
          </label>
          <input
            type="number"
            step="0.000001"
            name="latitude"
            value={inputLat}
            onChange={(e) => handleLatInputChange(e.target.value)}
            placeholder="24.783600"
            className="w-full bg-black/80 border border-white/10 p-2.5 text-xs font-mono text-white focus:border-[#D4AF37] outline-none transition-colors rounded-none"
          />
        </div>

        <div className="space-y-1">
          <label className="text-[10px] uppercase tracking-wider text-zinc-300 font-mono flex items-center justify-between">
            <span>Longitude (double precision)</span>
            <span className="text-[9px] text-zinc-500">-180.0 to +180.0</span>
          </label>
          <input
            type="number"
            step="0.000001"
            name="longitude"
            value={inputLng}
            onChange={(e) => handleLngInputChange(e.target.value)}
            placeholder="67.062200"
            className="w-full bg-black/80 border border-white/10 p-2.5 text-xs font-mono text-white focus:border-[#D4AF37] outline-none transition-colors rounded-none"
          />
        </div>
      </div>
    </div>
  );
}
