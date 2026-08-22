import { View, Text, TouchableOpacity } from 'react-native';
import type { ReactNode } from 'react';
import { useTokens } from '../ui/prism-provider';
import { s } from '../../utils/style-helpers';

type Props = {
  /** Icona già colorata (DndIcon) da mostrare nella box 56×56 */
  icon: ReactNode;
  /** Colore della box icona (con trasparenza già applicata, es. `color + '20'`) */
  iconBg: string;
  title: string;
  /** Badge sotto il titolo (riga wrap) */
  badges?: ReactNode;
  onClose: () => void;
};

/**
 * Header condiviso dei modali di dettaglio (Incantesimo / Oggetto):
 * box icona 56×56 + titolo + ✕ + riga di badge.
 * Prima duplicato quasi identico in SpellDetailModal e ItemDetailModal.
 */
export default function DetailModalHeader({ icon, iconBg, title, badges, onClose }: Props) {
  const t = useTokens();
  return (
    <View style={[s.row, s.gap(t.spacing[3]), s.mb(t.spacing[3])]}>
      <View style={[s.box(56, t.radius.xl), { backgroundColor: iconBg }]}>{icon}</View>
      <View style={s.flex}>
        <View style={[s.row, { justifyContent: 'space-between', alignItems: 'flex-start' }]}>
          <Text
            style={{
              fontSize: t.typography.xl,
              fontWeight: '700',
              color: t.colors.foreground,
              flex: 1,
              marginRight: t.spacing[2],
            }}
          >
            {title}
          </Text>
          <TouchableOpacity onPress={onClose} style={s.p(t.spacing[1])}>
            <Text style={{ fontSize: 20, color: t.colors.foregroundTertiary }}>✕</Text>
          </TouchableOpacity>
        </View>
        {badges && <View style={[s.rowWrap, s.gap(t.spacing[1.5]), s.mt(t.spacing[1])]}>{badges}</View>}
      </View>
    </View>
  );
}
