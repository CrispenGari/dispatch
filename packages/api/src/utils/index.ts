import moment from "moment";

export const distanceToReadable = (distance: number) => {
  if (distance === 0) return `0m`;
  if (distance < 1000) return `${distance.toFixed(1)} m`;
  return `${(distance / 1000).toFixed(1)} km`;
};

// Converts numeric degrees to radians
const toRad = (value: number) => {
  return (value * Math.PI) / 180;
};

export type Coord = {
  lon: number;
  lat: number;
};

export const calculateDistance = (a: Coord, b: Coord) => {
  const R = 6371; // km
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lon - a.lon);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const x =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
  const d = R * c;
  return d;
};

export const expiryDate = (exp: string) => {
  const [a, b] = exp.split(/\s/);
  const value: number = Number.parseInt(a);
  const _value: string = b.trim();
  const date = moment()
    .add(value, _value as any)
    .toDate();
  return date;
};
