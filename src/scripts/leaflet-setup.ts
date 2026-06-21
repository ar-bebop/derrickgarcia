// leaflet.markercluster is a UMD plugin that attaches itself to a GLOBAL `L` at evaluation time
// (`L.MarkerClusterGroup = L.FeatureGroup.extend(...)`). Under Vite/ESM there is no global L, so the
// plugin throws. This module imports Leaflet and exposes it on window.L; importing it BEFORE
// 'leaflet.markercluster' (ES modules evaluate in source order) guarantees the plugin finds L.
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

if (typeof window !== 'undefined') (window as unknown as { L: typeof L }).L = L;

export default L;
