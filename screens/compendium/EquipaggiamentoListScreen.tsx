import { View, Text, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTokens } from '../../components/ui/prism-provider';
import { Card } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import CompendiumList, {
  CompendiumSectionTitle,
  CompendiumRow,
} from '../../components/custom/Compendium/CompendiumList';
import { EQUIPMENT_PRESETS_DATA } from '../../lib/rules/equipment-preset';
import type { EquipmentPresetDefinition } from '../../lib/rules/equipment-preset';
import { getClassById } from '../../lib/rules/classes';
import { getBackground } from '../../lib/rules/backgrounds';
import { s } from '../../utils/style-helpers';

function presetTargetName(p: EquipmentPresetDefinition): string {
  if (p.type === 'class') {
    const c = getClassById(p.targetId);
    return c ? c.labelIt : String(p.targetId);
  }
  const b = getBackground(p.targetId);
  return b ? b.name : String(p.targetId);
}

export default function EquipaggiamentoListScreen() {
  const t = useTokens();
  const navigation = useNavigation<any>();

  return (
    <CompendiumList<EquipmentPresetDefinition>
      title="Equipaggiamento"
      icon="gear"
      onBack={() => navigation.goBack()}
      items={EQUIPMENT_PRESETS_DATA}
      keyExtractor={(p) => String(p.id)}
      searchPlaceholder="Cerca equipaggiamento..."
      filterBy={(p, q) => presetTargetName(p).toLowerCase().includes(q) || p.description.toLowerCase().includes(q)}
      renderCard={(p, onPress) => (
        <Pressable onPress={onPress}>
          <Card variant="elevated" style={{ marginBottom: t.spacing[3] }}>
            <View style={s.row}>
              <View style={[s.box(52, t.radius.md), { backgroundColor: t.colors.accent + '18', marginRight: t.spacing[3] }]}>
                <Text style={{ fontSize: 22 }}>🎒</Text>
              </View>
              <View style={s.flex}>
                <Text style={{ fontSize: t.typography.md, fontWeight: t.typography.semibold, color: t.colors.foreground }}>
                  {presetTargetName(p)}
                </Text>
                <View style={[s.row, s.gap(t.spacing[1.5]), s.mt(t.spacing[0.5])]}>
                  <Badge variant="solid" size="sm" color={t.colors.accent}>
                    {p.type === 'class' ? 'Classe' : 'Background'}
                  </Badge>
                  <Badge variant="subtle" size="sm">{p.startingGold} mo</Badge>
                </View>
              </View>
              <Text style={{ color: t.colors.foregroundTertiary, fontSize: 20 }}>›</Text>
            </View>
          </Card>
        </Pressable>
      )}
      renderDetail={(p) => (
        <View>
          <Text style={{ fontSize: t.typography.xl, fontWeight: '700', color: t.colors.foreground }}>{presetTargetName(p)}</Text>
          <Text style={{ fontSize: t.typography.sm, color: t.colors.foregroundSecondary, lineHeight: 20, marginTop: t.spacing[2] }}>
            {p.description}
          </Text>

          <CompendiumSectionTitle>Dettagli</CompendiumSectionTitle>
          <CompendiumRow label="Tipo" value={p.type === 'class' ? 'Classe' : 'Background'} />
          <CompendiumRow label="Oro iniziale" value={`${p.startingGold} mo`} />

          <CompendiumSectionTitle>Oggetti ({p.items.length})</CompendiumSectionTitle>
          {p.items.map((it, i) => (
            <View
              key={i}
              style={[s.mb(t.spacing[2]), { backgroundColor: t.colors.backgroundSecondary, borderRadius: t.radius.md, padding: t.spacing[3] }]}
            >
              <Text style={{ fontSize: t.typography.sm, fontWeight: '600', color: t.colors.foreground }}>
                {it.quantity > 1 ? `${it.quantity}× ` : ''}{it.name}
              </Text>
            </View>
          ))}
        </View>
      )}
    />
  );
}
