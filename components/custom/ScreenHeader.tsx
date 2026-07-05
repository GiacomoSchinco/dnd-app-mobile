import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTokens } from '../ui/prism-provider';
import { spacing, fontSizes } from '../../utils/styles';
import BackButton from './BackButton';

type Props = {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  backLabel?: string;
  center?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
  iconColor?: string;
  iconSize?: number;
};

export default function ScreenHeader({ title, subtitle, onBack, backLabel, center = false, icon, iconColor, iconSize = 22 }: Props) {
  const t = useTokens();

  return (
    <View style={{ alignItems: center ? 'center' : 'flex-start', width: '100%' }}>
      {onBack && <BackButton onPress={onBack} label={backLabel} />}
      
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing[2], marginBottom: subtitle ? spacing[1] : spacing[6], width: '100%', justifyContent: center ? 'center' : 'flex-start' }}>
        {icon && (
          <Ionicons
            name={icon}
            size={iconSize}
            color={iconColor ?? t.colors.accent}
          />
        )}
        <Text
          style={{
            color: t.colors.foreground,
            fontSize: fontSizes.xl,
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
            fontSize: fontSizes.sm,
            textAlign: center ? 'center' : 'left', // <-- Centra il sottotitolo
            marginBottom: spacing[6],
            width: '100%',
          }}
        >
          {subtitle}
        </Text>
      )}
    </View>
  );
}