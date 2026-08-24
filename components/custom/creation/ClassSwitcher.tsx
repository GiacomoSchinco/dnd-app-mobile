import { Text, View } from 'react-native';
import { useTokens } from '../../ui/prism-provider';
import { getClassNameItalian } from '../../../lib/rules/classes';
import { s } from '../../../utils/style-helpers';
import Chip from './Chip';
import type { ClassName } from '../../../types';

type Props = {
  classList: { className: ClassName; level: number }[];
  activeIndex: number;
  onSelectActive: (i: number) => void;
};

/**
 * Switcher delle classi configurate (multiclasse): chips per scegliere QUALe
 * classe si sta configurando (livello, sottoclasse, competenze) senza dover
 * tornare allo step Classe. Mostrato solo con 2+ classi.
 */
export default function ClassSwitcher({ classList, activeIndex, onSelectActive }: Props) {
  const t = useTokens();

  if (!classList || classList.length <= 1) return null;

  return (
    <View style={{ marginBottom: t.spacing[3] }}>
      <Text style={{ fontSize: t.typography.xs, fontWeight: '600', color: t.colors.foregroundTertiary, marginBottom: t.spacing[1] }}>
        CLASSE IN CONFIGURAZIONE
      </Text>
      <View style={[s.row, { gap: t.spacing[1.5], flexWrap: 'wrap' }]}>
        {classList.map((c, i) => (
          <Chip
            key={i}
            label={`${getClassNameItalian(c.className)} ${c.level}°${i === 0 ? ' · primaria' : ''}`}
            selected={i === activeIndex}
            compact
            onPress={() => onSelectActive(i)}
          />
        ))}
      </View>
    </View>
  );
}
