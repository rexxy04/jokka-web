'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { GoogleMap, Marker, useLoadScript } from '@react-google-maps/api';
import usePlacesAutocomplete, { getGeocode, getLatLng } from 'use-places-autocomplete';

// Setting Default: Makassar
const DEFAULT_CENTER = { lat: -5.147665, lng: 119.432731 };
const LIBRARIES: ("places")[] = ["places"]; // Wajib diluar component agar tidak reload terus

interface LocationPickerProps {
  onLocationSelect: (lat: number, lng: number, address: string) => void;
}

export default function LocationPicker({ onLocationSelect }: LocationPickerProps) {
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string,
    libraries: LIBRARIES,
  });

  if (!isLoaded) return <div className="p-4 bg-gray-100 rounded text-center">Memuat Peta...</div>;

  return <MapWithSearch onLocationSelect={onLocationSelect} />;
}

// --- SUB KOMPONEN: PETA & SEARCH ---
function MapWithSearch({ onLocationSelect }: LocationPickerProps) {
  const [selected, setSelected] = useState(DEFAULT_CENTER);
  
  // Hook Autocomplete Google Places
  const {
    ready,
    value,
    setValue,
    suggestions: { status, data },
    clearSuggestions,
  } = usePlacesAutocomplete();

  // Handle saat user memilih saran alamat dari dropdown
  const handleSelectAddress = async (address: string) => {
    setValue(address, false);
    clearSuggestions();

    try {
      const results = await getGeocode({ address });
      const { lat, lng } = await getLatLng(results[0]);
      
      const newPos = { lat, lng };
      setSelected(newPos);
      onLocationSelect(lat, lng, address); // Kirim ke Parent
    } catch (error) {
      console.error("Error: ", error);
    }
  };

  // Handle saat user klik manual di peta
  const handleMapClick = async (e: google.maps.MapMouseEvent) => {
    if (e.latLng) {
      const lat = e.latLng.lat();
      const lng = e.latLng.lng();
      
      setSelected({ lat, lng });

      // Reverse Geocoding (Cari nama jalan dari koordinat klik)
      try {
        const results = await getGeocode({ location: { lat, lng } });
        const address = results[0]?.formatted_address || "Lokasi terpilih";
        setValue(address, false); // Update text di search bar
        onLocationSelect(lat, lng, address); // Kirim ke Parent
      } catch (error) {
        onLocationSelect(lat, lng, "Koordinat terpilih");
      }
    }
  };

  return (
    <div className="space-y-4">
      {/* SEARCH BAR */}
      <div className="relative">
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          disabled={!ready}
          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none text-gray-900"
          placeholder="Cari lokasi (contoh: Phinisi Point)..."
        />
        {/* Dropdown Suggestion */}
        {status === "OK" && (
          <ul className="absolute z-10 w-full bg-white border border-gray-200 rounded-lg mt-1 shadow-lg max-h-60 overflow-y-auto">
            {data.map(({ place_id, description }) => (
              <li
                key={place_id}
                onClick={() => handleSelectAddress(description)}
                className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm text-gray-900"
              >
                {description}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* GOOGLE MAP */}
      <div className="h-64 w-full rounded-xl overflow-hidden border border-gray-300">
        <GoogleMap
          zoom={15}
          center={selected}
          mapContainerClassName="w-full h-full"
          onClick={handleMapClick}
          options={{ disableDefaultUI: true, zoomControl: true }} // UI Bersih
        >
          {/* Marker Merah */}
          <Marker position={selected} />
        </GoogleMap>
      </div>
      
      <p className="text-xs text-gray-500">
        *Klik pada peta atau gunakan pencarian untuk menentukan titik lokasi tepat.
      </p>
    </div>
  );
}