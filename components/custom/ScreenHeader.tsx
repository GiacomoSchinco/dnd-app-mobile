import { View, Text } from 'react-native';
import { useTokens } from '../ui/prism-provider';
import { spacing, fontSizes } from '../../utils/styles';
import BackButton from './BackButton';

type Props = {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  backLabel?: string;
  center?: boolean; // <-- Nuova prop opzionale
};

export default function ScreenHeader({ title, subtitle, onBack, backLabel, center = false }: Props) {
  const t = useTokens();

  return (
    // Usiamo un View invece del Fragment se vogliamo assicurarci che l'allineamento 
    // del BackButton e dei testi funzioni correttamente insieme quando 'center' è true
    <View style={{ alignItems: center ? 'center' : 'flex-start', width: '100%' }}>
      {onBack && <BackButton onPress={onBack} label={backLabel} />}
      
      <Text
        style={{
          color: t.colors.foreground,
          fontSize: fontSizes.xl,
          fontWeight: '700',
          textAlign: center ? 'center' : 'left', // <-- Centra il testo
          marginBottom: subtitle ? spacing[1] : spacing[6],
          width: '100%', // Garantisce che il testo occupi lo spazio necessario per centrarsi
        }}
      >
        {title}
      </Text>
      
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