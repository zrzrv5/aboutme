export const VARIANTS = ['worlds', 'plain', 'wall', 'margins'];

export function getRedesignVariant() {
  if (typeof window === 'undefined') return null;
  const v = new URLSearchParams(window.location.search).get('v');
  if (!v) return null;
  return v === 'lab' || VARIANTS.includes(v) ? v : null;
}
