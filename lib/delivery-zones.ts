// Postcode-district zones Franklyn covers on his own van, roughly Hertfordshire,
// Bedfordshire and London within the M25. Everything else that's still a valid
// UK postcode books a courier instead. The customer is never asked to choose
// between the two; this only decides which fulfilment method the order gets.
const OWN_FLEET_OUTWARD_AREAS = [
  // Hertfordshire
  "AL", "WD", "HP", "SG",
  // Bedfordshire
  "LU", "MK", "SG",
  // Greater London (broad coverage inside the M25)
  "E", "EC", "N", "NW", "SE", "SW", "W", "WC",
  "BR", "CR", "DA", "EN", "HA", "IG", "KT", "RM", "SM", "TW", "UB",
];

export type DeliveryMethod = "own-fleet" | "courier";

function outwardCode(postcode: string): string | null {
  const normalised = postcode.trim().toUpperCase().replace(/\s+/g, "");
  const match = normalised.match(/^([A-Z]{1,2})\d[A-Z\d]?\d[A-Z]{2}$/);
  return match ? match[1] : null;
}

export function isValidUkPostcode(postcode: string): boolean {
  return outwardCode(postcode) !== null;
}

export function resolveDeliveryMethod(postcode: string): DeliveryMethod | null {
  const area = outwardCode(postcode);
  if (!area) return null;
  return OWN_FLEET_OUTWARD_AREAS.includes(area) ? "own-fleet" : "courier";
}
