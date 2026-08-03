import { View, Text, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTokens } from '../../components/ui/prism-provider';
import { Card } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import CompendiumList, {
  CompendiumSectionTitle,
  CompendiumRow,
} from '../../components/custom/Compendium/CompendiumList';
import { getAllBackgrounds } from '../../lib/rules/backgrounds';
import type { BackgroundDefinition } from '../../lib/rules/backgrounds';
import { getSkillNameItalian } from '../../lib/rules/skills';
import { s } from '../../utils/style-helpers';

export default function BackgroundListScreen() {
  const t = useTokens();
  const navigation = useNavigation<any>();
  const backgrounds = getAllBackgrounds();

  return (
    <CompendiumList<BackgroundDefinition>
      title="Background"
      icon="d8"
      onBack={() => navigation.goBack()}
      items={backgrounds}
      keyExtractor={(b) => String(b.id)}
      searchPlaceholder="Cerca background..."
      filterBy={(b, q) => b.name.toLowerCase().includes(q)}
      renderCard={(b, onPress) => (
        <Pressable onPress={onPress}>
          <Card variant="elevated" style={{ marginBottom: t.spacing[3] }}>
            <View style={s.row}>
              <View style={[s.box(52, t.radius.md), { backgroundColor: t.colors.accent + '18', marginRight: t.spacing[3] }]}>
                <Text style={{ fontSize: 24 }}>📜</Text>
              </View>
              <View style={s.flex}>
                <Text style={{ fontSize: t.typography.md, fontWeight: t.typography.semibold, color: t.colors.foreground }}>
                  {b.name}
                </Text>
                <View style={[s.row, s.gap(t.spacing[1.5]), s.mt(t.spacing[0.5])]}>
                  <Badge variant="solid" size="sm" color={t.colors.accent}>
                    {b.skills.length} perizie
                  </Badge>
                  {b.feat.name && <Badge variant="subtle" size="sm">{b.feat.name}</Badge>}
                </View>
              </View>
              <Text style={{ color: t.colors.foregroundTertiary, fontSize: 20 }}>›</Text>
            </View>
          </Card>
        </Pressable>
      )}
      renderDetail={(b) => (
        <View>
          <Text style={{ fontSize: t.typography.xl, fontWeight: '700', color: t.colors.foreground }}>{b.name}</Text>
          <Text style={{ fontSize: t.typography.sm, color: t.colors.foregroundSecondary, lineHeight: 20, marginTop: t.spacing[2] }}>
            {b.description}
          </Text>

          <CompendiumSectionTitle>Bonus</CompendiumSectionTitle>
          <CompendiumRow label="Punteggi abilità" value={b.abilityScoreBoosts.allowedScores.join(', ') || '—'} />
          <CompendiumRow label="Perizie" value={b.skills.map((sk) => getSkillNameItalian(sk)).join(', ') || '—'} />
          <CompendiumRow
            label="Attrezzi"
            value={b.toolProficiency.type === 'CHOICE' ? `a scelta (${b.toolProficiency.category || 'strumenti'})` : (b.toolProficiency.toolId || '—')}
          />
          <CompendiumRow label="Talento" value={b.feat.name || '—'} />
        </View>
      )}
    />
  );
}
