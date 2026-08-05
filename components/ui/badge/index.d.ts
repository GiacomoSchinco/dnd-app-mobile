// Dichiarazioni di tipo per badge/index.js
import React from 'react';
import { ViewProps } from 'react-native';

export interface BadgeProps extends ViewProps {
  variant?: 'solid' | 'outline' | 'subtle';
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  dot?: boolean;
  theme?: any;
}

declare const Badge: React.FC<BadgeProps>;

export { Badge };
export default Badge;
