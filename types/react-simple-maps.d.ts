declare module 'react-simple-maps' {
  import * as React from 'react';

  interface ProjectionConfig {
    center?: [number, number];
    scale?: number;
    rotate?: [number, number, number];
    parallels?: [number, number];
  }

  interface ComposableMapProps {
    projection?: string;
    projectionConfig?: ProjectionConfig;
    width?: number;
    height?: number;
    className?: string;
    children?: React.ReactNode;
  }

  interface GeographyObject {
    rsmKey: string;
    properties: Record<string, any>;
    geometry: any;
    [key: string]: any;
  }

  interface GeographiesProps {
    geography: string | object;
    children: (props: { geographies: GeographyObject[] }) => React.ReactNode;
  }

  interface GeographyProps {
    geography: GeographyObject;
    onMouseEnter?: () => void;
    onMouseLeave?: () => void;
    onClick?: () => void;
    style?: {
      default?: React.CSSProperties;
      hover?: React.CSSProperties;
      pressed?: React.CSSProperties;
    };
    className?: string;
  }

  interface MarkerProps {
    coordinates: [number, number];
    children?: React.ReactNode;
  }

  export const ComposableMap: React.FC<ComposableMapProps>;
  export const Geographies: React.FC<GeographiesProps>;
  export const Geography: React.FC<GeographyProps>;
  export const Marker: React.FC<MarkerProps>;
}

declare module 'd3-geo' {
  export function geoCentroid(feature: any): [number, number];
}
