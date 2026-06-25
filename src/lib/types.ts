import type {
  CheckinStatus,
  HelpCategory,
  OfferCategory,
  UrgencyLevel,
  RequestStatus,
  DamageSeverity,
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
  found_at: string | null;
  place_name: string | null;
  source: string | null;
  source_url: string | null;
}

// A needed tool/equipment with an estimated quantity.
export interface NeededItem {
  name: string;
  qty: number;
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
  place_name: string | null;
  items: NeededItem[] | null;
  source: string | null;
  source_url: string | null;
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

// Mirrors public_damaged_reports (no contact / manage_token).
export interface PublicDamagedReport {
  id: string;
  place_name: string;
  description: string | null;
  severity: DamageSeverity;
  city: string | null;
  latitude: number | null;
  longitude: number | null;
  photo_url: string | null;
  status: RequestStatus;
  created_at: string;
  verified_at: string | null;
  verified_by: string | null;
  source: string | null;
  source_url: string | null;
}

// A sighting / "aviso" left by someone who recognized a missing person.
export interface Sighting {
  id: string;
  finder_name: string | null;
  finder_contact: string | null;
  message: string | null;
  created_at: string;
}

// A volunteer's response to a help request (relay).
export interface RequestResponse {
  id: string;
  responder_name: string | null;
  responder_contact: string | null;
  message: string | null;
  created_at: string;
}

export type LatLng = { lat: number; lng: number };

// Unified shape consumed by the map. Kinds: places that need help, missing
// people, available helpers, and curated relief/collection centers.
export type MarkerKind = "need" | "missing" | "helper" | "center" | "damaged";

export interface MapMarker {
  id: string;
  kind: MarkerKind;
  lat: number;
  lng: number;
  title: string;
  subtitle?: string;
  href: string;
  // Optional popup extras (used by damaged-building reports / centers).
  confidence?: string; // e.g. "Alta plausibilidad"
  source?: string; // e.g. "@ReporteYa + familiares"
  note?: string; // caution note
  linkLabel?: string; // overrides the popup link text (e.g. "Ver fuente →")
  approx?: boolean; // location is approximate (geocoded by area)
  color?: string; // overrides the kind color for this pin (e.g. by severity)
}
