"use client";
import { useState, useEffect } from "react";
import { MapPin } from "lucide-react";
import { PANAMA_PROVINCES, getDistricts, getAreas } from "@/lib/panama";
import Select from "./Select";

interface LocationPickerProps {
  province: string;
  district: string;
  area?: string;
  onProvinceChange: (v: string) => void;
  onDistrictChange: (v: string) => void;
  onAreaChange?: (v: string) => void;
  required?: boolean;
}

export default function LocationPicker({
  province, district, area = "",
  onProvinceChange, onDistrictChange, onAreaChange,
  required,
}: LocationPickerProps) {
  const districts = getDistricts(province);
  const areas = getAreas(province, district);

  useEffect(() => { onDistrictChange(""); }, [province]);
  useEffect(() => { onAreaChange?.(""); }, [district]);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-1.5 text-sm font-medium text-slate-700">
        <MapPin className="w-4 h-4 text-slate-400" />
        Ubicación en Panamá
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Select
          placeholder="Provincia"
          value={province}
          onChange={(e) => onProvinceChange(e.target.value)}
          options={PANAMA_PROVINCES.map((p) => ({ value: p.value, label: p.label }))}
          required={required}
        />
        <Select
          placeholder="Distrito"
          value={district}
          onChange={(e) => onDistrictChange(e.target.value)}
          options={districts.map((d) => ({ value: d.value, label: d.label }))}
          required={required}
          disabled={!province}
        />
      </div>
      {areas.length > 0 && onAreaChange && (
        <Select
          placeholder="Área / Barrio (opcional)"
          value={area}
          onChange={(e) => onAreaChange(e.target.value)}
          options={areas.map((a) => ({ value: a, label: a }))}
        />
      )}
    </div>
  );
}
