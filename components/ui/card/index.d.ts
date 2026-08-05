// Dichiarazioni di tipo per card/index.js
import React from 'react';
import { ViewProps } from 'react-native';

export interface CardProps extends ViewProps {
  variant?: 'default' | 'elevated' | 'outlined' | 'ghost';
  theme?: any;
}

declare const Card: React.FC<CardProps> & {
  Header: React.FC<{ children?: React.ReactNode }>;
  Title: React.FC<{ children?: React.ReactNode }>;
  Body: React.FC<{ children?: React.ReactNode }>;
  Footer: React.FC<{ children?: React.ReactNode }>;
};

export { Card };
export default Card;
