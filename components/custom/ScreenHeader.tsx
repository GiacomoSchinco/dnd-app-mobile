import { View, Text } from 'react-native';
import type { ReactNode } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useTokens } from '../ui/prism-provider';
import { s } from '../../utils/style-helpers';
import BackButton from './BackButton';

type Props = {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  backLabel?: string;
  center?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
  /** Icona custom (es. DndIcon SVG): ha precedenza su `icon` */
  iconNode?: ReactNode;
  iconColor?: string;
  iconSize?: number;
};

export default function ScreenHeader({ title, subtitle, onBack, backLabel, center = false, icon, iconNode, iconColor, iconSize = 22 }: Props) {
  const t = useTokens();

  return (
    <View style={[s.fullWidth, { alignItems: center ? 'center' : 'flex-start' }]}>
      {onBack && <BackButton onPress={onBack} label={backLabel} />}
      
      <View style={[s.row, s.gap(t.spacing[2]), s.fullWidth, { marginBottom: subtitle ? t.spacing[1] : t.spacing[6], justifyContent: center ? 'center' : 'flex-start' }]}>
        {iconNode ??
          (icon && (
            <Ionicons
              name={icon}
              size={iconSize}
              color={iconColor ?? t.colors.accent}
            />
          ))}
        <Text
          style={{
            color: t.colors.foreground,
            fontSize: t.typography.xl,
            fontWeight: '700',
            textAlign: center ? 'center' : 'left',
          }}
        >
          {title}
        </Text>
      </View>
      
      {subtitle && (
        <Text
          style={{
            color: t.colors.foregroundSecondary,
            fontSize: t.typography.sm,
            textAlign: center ? 'center' : 'left', // <-- Centra il sottotitolo
            marginBottom: t.spacing[6],
            width: '100%',
          }}
        >
          {subtitle}
        </Text>
      )}
    </View>
  );
}