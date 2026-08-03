import { View, Text, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTokens } from '../../components/ui/prism-provider';
import { Card } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import CompendiumList, {
  CompendiumSectionTitle,
  CompendiumRow,
} from '../../components/custom/Compendium/CompendiumList';
import { getAllRaces } from '../../lib/rules/races';
import type { RaceDefinition } from '../../lib/rules/races';
import { s } from '../../utils/style-helpers';

export default function RazzeListScreen() {
  const t = useTokens();
  const navigation = useNavigation<any>();
  const races = getAllRaces();

  return (
    <CompendiumList<RaceDefinition>
      title="Razze"
      icon="d10"
      onBack={() => navigation.goBack()}
      items={races}
      keyExtractor={(r) => String(r.id)}
      searchPlaceholder="Cerca razza..."
      filterBy={(r, q) => r.name.toLowerCase().includes(q)}
      renderCard={(r, onPress) => (
        <Pressable onPress={onPress}>
          <Card variant="elevated" style={{ marginBottom: t.spacing[3] }}>
            <View style={s.row}>
              <View style={[s.box(52, t.radius.md), { backgroundColor: t.colors.accent + '18', marginRight: t.spacing[3] }]}>
                <Text style={{ fontSize: 24 }}>🧝</Text>
              </View>
              <View style={s.flex}>
                <Text style={{ fontSize: t.typography.md, fontWeight: t.typography.semibold, color: t.colors.foreground }}>
                  {r.name}
                </Text>
                <View style={[s.row, s.gap(t.spacing[1.5]), s.mt(t.spacing[0.5])]}>
                  <Badge variant="solid" size="sm" color={t.colors.accent}>Velocità {r.baseSpeed} {r.speedUnit}</Badge>
                  {r.lineages && <Badge variant="subtle" size="sm">Con sottorazze</Badge>}
                </View>
              </View>
              <Text style={{ color: t.colors.foregroundTertiary, fontSize: 20 }}>›</Text>
            </View>
          </Card>
        </Pressable>
      )}
      renderDetail={(r) => (
        <View>
          <Text style={{ fontSize: t.typography.xl, fontWeight: '700', color: t.colors.foreground }}>{r.name}</Text>
          <Text style={{ fontSize: t.typography.sm, color: t.colors.foregroundSecondary, lineHeight: 20, marginTop: t.spacing[2] }}>
            {r.description}
          </Text>

          <CompendiumRow label="Velocità" value={`${r.baseSpeed} ${r.speedUnit}`} />
          <CompendiumRow label="Taglie" value={r.sizeOptions.join(', ')} />

          <CompendiumSectionTitle>Tratti razziali</CompendiumSectionTitle>
          {r.effects.map((e) => (
            <View
              key={e.id}
              style={[s.mb(t.spacing[2]), { backgroundColor: t.colors.backgroundSecondary, borderRadius: t.radius.md, padding: t.spacing[3] }]}
            >
              <Text style={{ fontSize: t.typography.sm, fontWeight: '600', color: t.colors.foreground }}>{e.name}</Text>
              <Text style={{ fontSize: t.typography.xs, color: t.colors.foregroundSecondary, lineHeight: 18, marginTop: t.spacing[1] }}>
                {e.description}
              </Text>
            </View>
          ))}

          {r.lineages && (
            <>
              <CompendiumSectionTitle>Sottorazze</CompendiumSectionTitle>
              {r.lineages.map((l) => (
                <View
                  key={l.id}
                  style={[s.mb(t.spacing[2]), { backgroundColor: t.colors.backgroundSecondary, borderRadius: t.radius.md, padding: t.spacing[3] }]}
                >
                  <Text style={{ fontSize: t.typography.base, fontWeight: '600', color: t.colors.foreground }}>{l.name}</Text>
                  {l.effects.map((e) => (
                    <Text key={e.id} style={{ fontSize: t.typography.xs, color: t.colors.foregroundSecondary, marginTop: t.spacing[1] }}>
                      • {e.name} — {e.description}
                    </Text>
                  ))}
                </View>
              ))}
            </>
          )}
        </View>
      )}
    />
  );
}
