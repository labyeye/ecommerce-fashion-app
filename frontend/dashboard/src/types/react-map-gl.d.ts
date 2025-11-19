declare module 'react-map-gl' {
  import type { ComponentType } from 'react';
  export const Marker: ComponentType<any>;
  const Map: ComponentType<any>;
  export default Map;
}

declare module 'mapbox-gl' {
  // Minimal placeholder types to satisfy TS when @types/mapbox-gl is not installed.
  export interface MapboxOptions { [key: string]: any }
  export default any;
}
