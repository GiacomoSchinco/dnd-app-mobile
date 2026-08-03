import { View, Text, Pressable, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTokens } from '../../components/ui/prism-provider';
import { Card } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import CompendiumList, {
  CompendiumSectionTitle,
  CompendiumRow,
} from '../../components/custom/Compendium/CompendiumList';
import { getAllClasses } from '../../lib/rules/classes';
import type { ClassDefinition } from '../../lib/rules/classes';
import { getSubclassesByClassId } from '../../lib/rules/subclasses';
import { getAbilityAbbreviation } from '../../lib/rules/abilities';
import { getClassToken } from '../../utils/class-tokens';
import { s } from '../../utils/style-helpers';

const CASTER_LABELS: Record<string, string> = {
  full: 'Incantatore completo',
  half: 'Mezzo incantatore',
  pact: 'Magia del patto',
};

export default function ClassiListScreen() {
  const t = useTokens();
  const navigation = useNavigation<any>();
  const classes = getAllClasses();

  return (
    <CompendiumList<ClassDefinition>
      title="Classi"
      icon="d20"
      onBack={() => navigation.goBack()}
      items={classes}
      keyExtractor={(c) => String(c.id)}
      searchPlaceholder="Cerca classe..."
      filterBy={(c, q) => c.labelIt.toLowerCase().includes(q) || c.name.includes(q)}
      renderCard={(c, onPress) => (
        <Pressable onPress={onPress}>
          <Card variant="elevated" style={{ marginBottom: t.spacing[3] }}>
            <View style={s.row}>
              <View style={[s.box(52, 26), { backgroundColor: t.colors.accent + '18', marginRight: t.spacing[3], overflow: 'hidden' }]}>
                <Image source={getClassToken(c.name)} style={{ width: 52, height: 52 }} resizeMode="cover" />
              </View>
              <View style={s.flex}>
                <Text style={{ fontSize: t.typography.md, fontWeight: t.typography.semibold, color: t.colors.foreground }}>
                  {c.labelIt}
                </Text>
                <View style={[s.row, s.gap(t.spacing[1.5]), s.mt(t.spacing[0.5])]}>
                  <Badge variant="solid" size="sm" color={t.colors.accent}>Dado vita d{c.hitDie}</Badge>
                  {c.isSpellcaster && <Badge variant="subtle" size="sm">Incantatore</Badge>}
                </View>
              </View>
              <Text style={{ color: t.colors.foregroundTertiary, fontSize: 20 }}>›</Text>
            </View>
          </Card>
        </Pressable>
      )}
      renderDetail={(c) => {
        const subclasses = getSubclassesByClassId(c.id);
        return (
          <View>
            <View style={[s.row, s.gap(t.spacing[3])]}>
              <View style={[s.box(64, 32), { backgroundColor: t.colors.accent + '18', overflow: 'hidden' }]}>
                <Image source={getClassToken(c.name)} style={{ width: 64, height: 64 }} resizeMode="cover" />
              </View>
              <View style={s.flex}>
                <Text style={{ fontSize: t.typography.xl, fontWeight: '700', color: t.colors.foreground }}>{c.labelIt}</Text>
                <View style={[s.row, s.gap(t.spacing[1.5]), s.mt(t.spacing[0.5])]}>
                  <Badge variant="solid" size="sm" color={t.colors.accent}>Dado vita d{c.hitDie}</Badge>
                  {c.isSpellcaster && c.spellcastingType && (
                    <Badge variant="subtle" size="sm">{CASTER_LABELS[c.spellcastingType]}</Badge>
                  )}
                </View>
              </View>
            </View>

            <Text style={{ fontSize: t.typography.sm, color: t.colors.foregroundSecondary, lineHeight: 20, marginTop: t.spacing[3] }}>
              {c.description}
            </Text>

            <CompendiumSectionTitle>Caratteristiche</CompendiumSectionTitle>
            <CompendiumRow label="Abilità primarie" value={c.primaryAbilities.map((a) => getAbilityAbbreviation(a)).join(', ') || '—'} />
            <CompendiumRow label="Tiri salvezza" value={c.savingThrows.map((a) => getAbilityAbbreviation(a)).join(', ')} />
            <CompendiumRow label="Armi" value={c.proficiencies.weapons.join(', ') || '—'} />
            <CompendiumRow label="Armature" value={c.proficiencies.armor.join(', ') || '—'} />
            <CompendiumRow
              label="Perizie"
              value={c.proficiencies.skills.count ? `ne scegli ${c.proficiencies.skills.count} tra: ${c.proficiencies.skills.options.join(', ')}` : '—'}
            />
            {c.isSpellcaster && c.spellcasting && (
              <CompendiumRow label="Abilità magica" value={c.spellcasting.ability ? getAbilityAbbreviation(c.spellcasting.ability) : '—'} />
            )}

            <CompendiumSectionTitle>Privilegi di classe</CompendiumSectionTitle>
            {c.features.map((f) => (
              <View
                key={f.name}
                style={[s.mb(t.spacing[2]), { backgroundColor: t.colors.backgroundSecondary, borderRadius: t.radius.md, padding: t.spacing[3] }]}
              >
                <View style={[s.row, s.gap(t.spacing[2])]}>
                  <Badge variant="subtle" size="sm">{f.level}°</Badge>
                  <Text style={{ fontSize: t.typography.sm, fontWeight: '600', color: t.colors.foreground, flex: 1 }}>{f.name}</Text>
                </View>
                <Text style={{ fontSize: t.typography.xs, color: t.colors.foregroundSecondary, lineHeight: 18, marginTop: t.spacing[1] }}>
                  {f.description}
                </Text>
              </View>
            ))}

            <CompendiumSectionTitle>Sottoclassi</CompendiumSectionTitle>
            {subclasses.map((sc) => (
              <View
                key={sc.id}
                style={[s.mb(t.spacing[2]), { backgroundColor: t.colors.backgroundSecondary, borderRadius: t.radius.md, padding: t.spacing[3] }]}
              >
                <Text style={{ fontSize: t.typography.base, fontWeight: '600', color: t.colors.foreground }}>{sc.name}</Text>
                <Text style={{ fontSize: t.typography.xs, color: t.colors.foregroundSecondary, lineHeight: 18, marginTop: t.spacing[1] }}>
                  {sc.description}
                </Text>
                {sc.features.map((f) => (
                  <Text key={f.name} style={{ fontSize: t.typography.xs, color: t.colors.foregroundSecondary, marginTop: t.spacing[1] }}>
                    • {f.name} — {f.description}
                  </Text>
                ))}
              </View>
            ))}
          </View>
        );
      }}
    />
  );
}
