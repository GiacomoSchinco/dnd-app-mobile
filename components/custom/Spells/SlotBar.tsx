import { View, Text, TouchableOpacity } from 'react-native';
import { useTokens } from '../../ui/prism-provider';
import { s } from '../../../utils/style-helpers';
import { LEVEL_LABELS } from './types';

type Props = {
  level: number;
  current: number;
  max: number;
  onUseSlot: () => void;
  onRestore: () => void;
};

export default function SlotBar({ level, current, max, onUseSlot, onRestore }: Props) {
  const t = useTokens();

  return (
    <View style={[s.row, { justifyContent: 'space-between', backgroundColor: t.colors.backgroundSecondary, borderRadius: t.radius.md, padding: t.spacing[3], marginBottom: t.spacing[3] }]}>
      <Text style={{ fontSize: t.typography.sm, fontWeight: '600', color: t.colors.foreground }}>
        Slot {LEVEL_LABELS[level]}
      </Text>
      <View style={[s.row, s.gap(t.spacing[2])]}>
        <Text style={{ fontSize: t.typography.lg, fontWeight: '700', color: t.colors.accent }}>
          {current}/{max}
        </Text>
        <TouchableOpacity
          onPress={onUseSlot}
          style={{
            paddingHorizontal: 12, paddingVertical: 4,
            borderRadius: t.radius.sm,
            backgroundColor: current > 0 ? t.colors.accent : t.colors.backgroundSecondary,
            opacity: current > 0 ? 1 : 0.4,
          }}
        >
          <Text style={{ fontSize: t.typography.xs, fontWeight: '600', color: t.colors.accentForeground }}>
            -1 Slot
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={onRestore}
          style={{
            paddingHorizontal: 12, paddingVertical: 4,
            borderRadius: t.radius.sm,
            backgroundColor: t.colors.backgroundSecondary,
            borderWidth: 1, borderColor: t.colors.border,
          }}
        >
          <Text style={{ fontSize: t.typography.xs, color: t.colors.foregroundSecondary }}>
            Ripristina
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
