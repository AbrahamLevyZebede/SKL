export const PANAMA_PROVINCES = [
  {
    value: "panama",
    label: "Panamá",
    districts: [
      {
        value: "panama_city",
        label: "Ciudad de Panamá",
        areas: [
          "Costa del Este", "Punta Pacífica", "Obarrio", "El Cangrejo", "Marbella",
          "Bella Vista", "San Francisco", "Casco Viejo", "Albrook", "Clayton",
          "Los Andes", "Tocumen", "Pedregal", "Bethania", "Pueblo Nuevo",
        ],
      },
      { value: "san_miguelito", label: "San Miguelito", areas: ["San Miguelito", "Amelia Denis", "Belisario Porras", "Rufina Alfaro"] },
      { value: "chepo", label: "Chepo", areas: ["Chepo", "La Palma"] },
    ],
  },
  {
    value: "panama_oeste",
    label: "Panamá Oeste",
    districts: [
      { value: "arraijan", label: "Arraiján", areas: ["Arraiján", "Vista Alegre", "Juan Demóstenes", "Nuevo Emperador"] },
      { value: "la_chorrera", label: "La Chorrera", areas: ["La Chorrera", "Barrio Balboa", "El Coco", "Herrera"] },
      { value: "capira", label: "Capira", areas: ["Capira", "Campana"] },
      { value: "chame", label: "Chame", areas: ["Chame", "San Carlos", "Punta Chame"] },
    ],
  },
  {
    value: "colon",
    label: "Colón",
    districts: [
      { value: "colon_city", label: "Colón", areas: ["Colón", "Cativá", "Salamanca"] },
      { value: "portobelo", label: "Portobelo", areas: ["Portobelo", "La Guaira"] },
    ],
  },
  {
    value: "chiriqui",
    label: "Chiriquí",
    districts: [
      { value: "david", label: "David", areas: ["David", "Las Lomas", "Pedregal"] },
      { value: "boquete", label: "Boquete", areas: ["Boquete", "Alto Boquete"] },
      { value: "bugaba", label: "Bugaba", areas: ["Bugaba", "Volcán", "Concepción"] },
    ],
  },
  {
    value: "veraguas",
    label: "Veraguas",
    districts: [
      { value: "santiago", label: "Santiago", areas: ["Santiago", "La Colorada", "San Francisco"] },
    ],
  },
  {
    value: "herrera",
    label: "Herrera",
    districts: [
      { value: "chitre", label: "Chitré", areas: ["Chitré", "Monagrillo", "La Arena"] },
    ],
  },
  {
    value: "cocle",
    label: "Coclé",
    districts: [
      { value: "penonome", label: "Penonomé", areas: ["Penonomé", "Coclé", "Chiguirí Arriba"] },
      { value: "aguadulce", label: "Aguadulce", areas: ["Aguadulce", "Pocrí"] },
    ],
  },
  {
    value: "bocas",
    label: "Bocas del Toro",
    districts: [
      { value: "bocas_town", label: "Bocas del Toro", areas: ["Bocas del Toro", "Isla Colón"] },
      { value: "changuinola", label: "Changuinola", areas: ["Changuinola", "Almirante"] },
    ],
  },
  {
    value: "darien",
    label: "Darién",
    districts: [
      { value: "la_palma", label: "La Palma", areas: ["La Palma", "Metetí"] },
    ],
  },
];

export function getProvinceLabel(value: string) {
  return PANAMA_PROVINCES.find((p) => p.value === value)?.label ?? value;
}

export function getDistrictLabel(provinceValue: string, districtValue: string) {
  const province = PANAMA_PROVINCES.find((p) => p.value === provinceValue);
  return province?.districts.find((d) => d.value === districtValue)?.label ?? districtValue;
}

export function getDistricts(provinceValue: string) {
  return PANAMA_PROVINCES.find((p) => p.value === provinceValue)?.districts ?? [];
}

export function getAreas(provinceValue: string, districtValue: string) {
  const province = PANAMA_PROVINCES.find((p) => p.value === provinceValue);
  return province?.districts.find((d) => d.value === districtValue)?.areas ?? [];
}

export function formatPanamaLocation(province?: string | null, district?: string | null) {
  if (!province) return "Panamá";
  const pl = getProvinceLabel(province);
  if (!district) return pl;
  const dl = getDistrictLabel(province, district);
  return `${dl}, ${pl}`;
}
