import type {
  CheckinStatus,
  HelpCategory,
  OfferCategory,
  UrgencyLevel,
  RequestStatus,
} from "./constants";

// These mirror the privacy-safe public_* views — they intentionally omit
// phone / contact fields so private data can never reach the client.

export interface PublicCheckin {
  id: string;
  name: string;
  status: CheckinStatus;
  city: string | null;
  latitude: number | null;
  longitude: number | null;
  message: string | null;
  photo_url: string | null;
  created_at: string;
}

export interface PublicHelpRequest {
  id: string;
  category: HelpCategory;
  description: string;
  urgency: UrgencyLevel;
  city: string | null;
  latitude: number | null;
  longitude: number | null;
  status: RequestStatus;
  created_at: string;
}

export interface PublicHelpOffer {
  id: string;
  category: OfferCategory;
  description: string | null;
  city: string | null;
  latitude: number | null;
  longitude: number | null;
  availability: string | null;
  available: boolean;
  created_at: string;
}

export type LatLng = { lat: number; lng: number };

// Unified shape consumed by the map.
export type MarkerKind = "safe" | "needs_help" | "looking" | "request" | "offer";

export interface MapMarker {
  id: string;
  kind: MarkerKind;
  lat: number;
  lng: number;
  title: string;
  subtitle?: string;
  href: string;
}
