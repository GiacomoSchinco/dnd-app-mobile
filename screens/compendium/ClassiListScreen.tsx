import { View, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { AltroStackParamList } from '../../types/navigation';
import { useTokens } from '../../components/ui/prism-provider';
import { Badge } from '../../components/ui/badge';
import CompendiumList, {
  CompendiumSectionTitle,
  CompendiumRow,
} from '../../components/custom/Compendium/CompendiumList';
import DetailBlock from '../../components/custom/Compendium/DetailBlock';
import ListItem from '../../components/custom/ListItem';
import ClassAvatar from '../../components/custom/ClassAvatar';
import { getAllClasses } from '../../lib/rules/classes';
import type { ClassDefinition } from '../../lib/rules/classes';
import { getSubclassesByClassId } from '../../lib/rules/subclasses';
import { getAbilityAbbreviation } from '../../lib/rules/abilities';
import { s } from '../../utils/style-helpers';

const CASTER_LABELS: Record<string, string> = {
  full: 'Incantatore completo',
  half: 'Mezzo incantatore',
  pact: 'Magia del patto',
};

export default function ClassiListScreen() {
  const t = useTokens();
  const navigation = useNavigation<NativeStackNavigationProp<AltroStackParamList>>();
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
        <ListItem
          title={c.labelIt}
          onPress={onPress}
          icon={<ClassAvatar className={c.name} size={52} />}
          badges={
            <>
              <Badge variant="solid" size="sm" color={t.colors.accent}>Dado vita d{c.hitDie}</Badge>
              {c.isSpellcaster && <Badge variant="subtle" size="sm">Incantatore</Badge>}
            </>
          }
        />
      )}
      renderDetail={(c) => {
        const subclasses = getSubclassesByClassId(c.id);
        return (
          <View>
            <View style={[s.row, s.gap(t.spacing[3])]}>
              <ClassAvatar className={c.name} size={64} />
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
              <DetailBlock key={f.name}>
                <View style={[s.row, s.gap(t.spacing[2])]}>
                  <Badge variant="subtle" size="sm">{f.level}°</Badge>
                  <Text style={{ fontSize: t.typography.sm, fontWeight: '600', color: t.colors.foreground, flex: 1 }}>{f.name}</Text>
                </View>
                <Text style={{ fontSize: t.typography.xs, color: t.colors.foregroundSecondary, lineHeight: 18, marginTop: t.spacing[1] }}>
                  {f.description}
                </Text>
              </DetailBlock>
            ))}

            <CompendiumSectionTitle>Sottoclassi</CompendiumSectionTitle>
            {subclasses.map((sc) => (
              <DetailBlock key={sc.id} title={sc.name}>
                <Text style={{ fontSize: t.typography.xs, color: t.colors.foregroundSecondary, lineHeight: 18, marginTop: t.spacing[1] }}>
                  {sc.description}
                </Text>
                {sc.features.map((f) => (
                  <Text key={f.name} style={{ fontSize: t.typography.xs, color: t.colors.foregroundSecondary, marginTop: t.spacing[1] }}>
                    • {f.name} — {f.description}
                  </Text>
                ))}
              </DetailBlock>
            ))}
          </View>
        );
      }}
    />
  );
}
