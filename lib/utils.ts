import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(date: string | Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}

export function formatRelativeTime(date: string | Date) {
  const now = new Date();
  const d = new Date(date);
  const diff = (now.getTime() - d.getTime()) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return formatDate(date);
}

export const CATEGORIES = [
  { value: "HOME_REPAIR", label: "Home Repair", icon: "🔨" },
  { value: "CLEANING", label: "Cleaning", icon: "🧹" },
  { value: "MOVING", label: "Moving", icon: "📦" },
  { value: "PAINTING", label: "Painting", icon: "🎨" },
  { value: "PLUMBING", label: "Plumbing", icon: "🔧" },
  { value: "ELECTRICAL", label: "Electrical", icon: "⚡" },
  { value: "FURNITURE_ASSEMBLY", label: "Furniture Assembly", icon: "🪑" },
  { value: "YARD_WORK", label: "Yard Work", icon: "🌿" },
  { value: "CAR_SERVICES", label: "Car Services", icon: "🚗" },
  { value: "OTHER", label: "Other", icon: "💼" },
];

export function getCategoryLabel(value: string) {
  return CATEGORIES.find((c) => c.value === value)?.label ?? value;
}

export function getCategoryIcon(value: string) {
  return CATEGORIES.find((c) => c.value === value)?.icon ?? "💼";
}

export const STATUS_COLORS: Record<string, string> = {
  OPEN: "bg-emerald-100 text-emerald-700",
  IN_PROGRESS: "bg-blue-100 text-blue-700",
  COMPLETED: "bg-gray-100 text-gray-700",
  CANCELLED: "bg-red-100 text-red-700",
  PENDING: "bg-yellow-100 text-yellow-700",
  ACCEPTED: "bg-emerald-100 text-emerald-700",
  REJECTED: "bg-red-100 text-red-700",
};
