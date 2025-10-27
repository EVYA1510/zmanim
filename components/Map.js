import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { ISRAEL_BOUNDS, ISRAEL_CENTER } from "../lib/boot/types";

// Custom pin icon with IDF branding
const createCustomIcon = () => {
  return L.divIcon({
    className: "custom-pin",
    html: `
      <div style="
        width: 30px;
        height: 30px;
        background-color: #9aae86;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        border: 3px solid #ffd133;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        position: relative;
        animation: bounce 2s infinite;
      ">
        <div style="
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%) rotate(45deg);
          width: 8px;
          height: 8px;
          background-color: #ffd133;
          border-radius: 50%;
        "></div>
      </div>
      <style>
        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% {
            transform: translateY(0) rotate(-45deg);
          }
          40% {
            transform: translateY(-5px) rotate(-45deg);
          }
          60% {
            transform: translateY(-3px) rotate(-45deg);
          }
        }
      </style>
    `,
    iconSize: [30, 30],
    iconAnchor: [15, 30],
    popupAnchor: [0, -30],
  });
};

// Load saved map view from localStorage
const loadMapView = () => {
  if (typeof window === "undefined") return null;

  try {
    const saved = localStorage.getItem("idf-zmanim:map:view");
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (error) {
    console.warn("Failed to load map view:", error);
  }

  return null;
};

// Save map view to localStorage
const saveMapView = (center, zoom) => {
  if (typeof window === "undefined") return;

  try {
    const view = {
      center: [center.lat, center.lng],
      zoom: zoom,
      timestamp: Date.now(),
    };
    localStorage.setItem("idf-zmanim:map:view", JSON.stringify(view));
  } catch (error) {
    console.warn("Failed to save map view:", error);
  }
};

export default function Map({
  onLocationSelect,
  initialLat = ISRAEL_CENTER[0],
  initialLng = ISRAEL_CENTER[1],
  enableGeolocation = false,
}) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const currentZoomRef = useRef(8); // Store current zoom level

  useEffect(() => {
    // Initialize map only once
    if (!mapInstanceRef.current && mapRef.current) {
      // Load saved view or use defaults
      const savedView = loadMapView();
      let initialView = [initialLat, initialLng];
      let initialZoom = 8;

      if (savedView && savedView.center && savedView.zoom) {
        initialView = savedView.center;
        initialZoom = savedView.zoom;
        currentZoomRef.current = initialZoom;
      }

      // Initialize map with Israel bounds
      mapInstanceRef.current = L.map(mapRef.current, {
        maxBounds: ISRAEL_BOUNDS,
        maxBoundsViscosity: 0.8,
      }).setView(initialView, initialZoom);

      // Fit to Israel bounds on first load if no saved view
      if (!savedView) {
        mapInstanceRef.current.fitBounds(ISRAEL_BOUNDS);
      }

      // Add OpenStreetMap tiles
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors",
        maxZoom: 19,
      }).addTo(mapInstanceRef.current);

      // Track view changes and save them
      mapInstanceRef.current.on("moveend zoomend", () => {
        const center = mapInstanceRef.current.getCenter();
        const zoom = mapInstanceRef.current.getZoom();
        currentZoomRef.current = zoom;
        saveMapView(center, zoom);
      });

      // Add click handler
      mapInstanceRef.current.on("click", (e) => {
        const { lat, lng } = e.latlng;

        // Remove existing marker
        if (markerRef.current) {
          mapInstanceRef.current.removeLayer(markerRef.current);
        }

        // Create new marker with custom icon
        markerRef.current = L.marker([lat, lng], {
          icon: createCustomIcon(),
        }).addTo(mapInstanceRef.current);

        // Call the callback with coordinates
        onLocationSelect({ latitude: lat, longitude: lng });

        // Show coordinates in Hebrew popup
        const popupContent = `
          <div dir="rtl" style="text-align: right; font-family: Arial, sans-serif;">
            <strong>📍 מיקום נבחר</strong><br/>
            <strong>קו רוחב:</strong> ${lat.toFixed(6)}<br/>
            <strong>קו אורך:</strong> ${lng.toFixed(6)}<br/>
            <small style="color: #666;">זום נוכחי: ${
              currentZoomRef.current
            }</small>
          </div>
        `;
        markerRef.current.bindPopup(popupContent).openPopup();

        // Zoom to the selected location with zoom level 12
        if (mapInstanceRef.current) {
          mapInstanceRef.current.setView([lat, lng], 12);
        }
      });

      // Add initial marker if coordinates are provided
      if (initialLat !== 31.7683 || initialLng !== 35.2137) {
        markerRef.current = L.marker([initialLat, initialLng], {
          icon: createCustomIcon(),
        }).addTo(mapInstanceRef.current);

        const popupContent = `
          <div dir="rtl" style="text-align: right; font-family: Arial, sans-serif;">
            <strong>📍 מיקום נוכחי</strong><br/>
            <strong>קו רוחב:</strong> ${initialLat.toFixed(6)}<br/>
            <strong>קו אורך:</strong> ${initialLng.toFixed(6)}
          </div>
        `;
        markerRef.current.bindPopup(popupContent);

        // Zoom to the initial location with zoom level 12
        if (mapInstanceRef.current) {
          mapInstanceRef.current.setView([initialLat, initialLng], 12);
        }
      }
    }

    // Update marker position if initial coordinates change
    if (mapInstanceRef.current && markerRef.current) {
      const currentPos = markerRef.current.getLatLng();
      if (currentPos.lat !== initialLat || currentPos.lng !== initialLng) {
        markerRef.current.setLatLng([initialLat, initialLng]);

        // Update popup content
        const popupContent = `
          <div dir="rtl" style="text-align: right; font-family: Arial, sans-serif;">
            <strong>📍 מיקום נוכחי</strong><br/>
            <strong>קו רוחב:</strong> ${initialLat.toFixed(6)}<br/>
            <strong>קו אורך:</strong> ${initialLng.toFixed(6)}
          </div>
        `;
        markerRef.current.bindPopup(popupContent);

        // Zoom to the new location with zoom level 12
        if (mapInstanceRef.current) {
          mapInstanceRef.current.setView([initialLat, initialLng], 12);
        }
      }
    }

    // Cleanup
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markerRef.current = null;
      }
    };
  }, [onLocationSelect, initialLat, initialLng]);

  return (
    <div className="map-container">
      <div
        ref={mapRef}
        style={{
          height: "250px", // Smaller for mobile
          width: "100%",
          borderRadius: "8px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          border: "1px solid #ddd",
          minHeight: "200px", // Ensure minimum height
        }}
        className="sm:h-[300px] md:h-[350px]" // Responsive heights
      />
      <div
        style={{
          marginTop: "8px",
          fontSize: "12px",
          color: "#666",
          textAlign: "right",
        }}
      >
        💡 טיפ: השתמש בגלגל העכבר או בכפתורי +/- כדי לשנות זום
      </div>
      <style jsx>{`
        .custom-pin {
          background: transparent !important;
          border: none !important;
        }
        .leaflet-control-zoom {
          border: 2px solid #9aae86 !important;
          border-radius: 8px !important;
        }
        .leaflet-control-zoom a {
          background-color: #9aae86 !important;
          color: white !important;
          font-weight: bold !important;
        }
        .leaflet-control-zoom a:hover {
          background-color: #7d8f6b !important;
        }
      `}</style>
    </div>
  );
}
