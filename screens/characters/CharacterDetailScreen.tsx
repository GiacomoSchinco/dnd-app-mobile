import { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { TabParamList } from '../../types/navigation';
import { useTokens } from '../../components/ui/prism-provider';
import { Badge } from '../../components/ui/badge';
import Screen from '../../components/custom/Screen';
import ScreenHeader from '../../components/custom/ScreenHeader';
import ClassAvatar from '../../components/custom/ClassAvatar';
import BottomModal from '../../components/custom/BottomModal';
import { getClassNameItalian } from '../../lib/rules/classes';
import { ROUTES } from '../../lib/routes';
import { s } from '../../utils/style-helpers';
import { useActiveCharacter } from '../../store/useActiveCharacter';

const SECTIONS = [
  { key: 'stats', icon: '💪', label: 'Caratteristiche', desc: 'FOR, DES, COS, INT, SAG, CAR' },
  { key: 'magie', icon: '🔮', label: 'Incantesimi', desc: 'Slot, preparati e preferiti' },
  { key: 'equip', icon: '⚔️', label: 'Equipaggiamento', desc: 'Armi, armature e oggetti' },
  { key: 'talenti', icon: '⭐', label: 'Talenti', desc: 'Talenti e abilità speciali' },
  { key: 'note', icon: '📝', label: 'Note', desc: 'Appunti e storia del personaggio' },
];

const ABILITY_ROWS = [
  { key: 'strength', label: 'Forza', abbr: 'FOR' },
  { key: 'dexterity', label: 'Destrezza', abbr: 'DES' },
  { key: 'constitution', label: 'Costituzione', abbr: 'COS' },
  { key: 'intelligence', label: 'Intelligenza', abbr: 'INT' },
  { key: 'wisdom', label: 'Saggezza', abbr: 'SAG' },
  { key: 'charisma', label: 'Carisma', abbr: 'CAR' },
] as const;

export default function CharacterDetailScreen() {
  const t = useTokens();
  const navigation = useNavigation<BottomTabNavigationProp<TabParamList>>();
  const { activeChar } = useActiveCharacter();
  const [selectedSection, setSelectedSection] = useState<(typeof SECTIONS)[number] | null>(null);

  const handleSection = (key: string) => {
    if (key === 'magie') navigation.navigate(ROUTES.MAGIE);
    else if (key === 'equip') navigation.navigate(ROUTES.OGGETTI);
    else {
      const sec = SECTIONS.find((x) => x.key === key);
      if (sec) setSelectedSection(sec);
    }
  };

  if (!activeChar) {
    return (
      <Screen>
        <View style={[s.flex, s.center, s.gap(t.spacing[4])]}>
          <Text style={{ fontSize: 60 }}>🔮</Text>
          <Text style={{ fontSize: t.typography.base, color: t.colors.foregroundSecondary, textAlign: 'center' }}>
            Nessun personaggio selezionato
          </Text>
        </View>
      </Screen>
    );
  }

  const mainClass = activeChar.classes[0];
  const classLabel = mainClass ? getClassNameItalian(mainClass.className) : '—';

  return (
    <Screen>
      <ScreenHeader title="Scheda Personaggio" icon="person-outline" />

      {/* Card nome e classe — stile HomeScreen */}
      <View style={[s.fullWidth, s.mb(t.spacing[5]), {
        backgroundColor: t.colors.backgroundSecondary,
        borderRadius: t.radius.lg,
        borderWidth: 1,
        borderColor: t.colors.border,
        padding: t.spacing[5],
      }]}>
        <View style={s.row}>
          <ClassAvatar className={mainClass?.className} size={56} style={{ marginRight: t.spacing[4] }} />
          <View style={s.flex}>
            <Text style={{ fontSize: t.typography.lg, fontWeight: t.typography.bold, color: t.colors.foreground }}>
              {activeChar.name}
            </Text>
            <View style={[s.row, s.gap(t.spacing[1.5]), s.mt(t.spacing[0.5])]}>
              <Badge variant="solid" size="sm" color={t.colors.accent}>
                {classLabel} {activeChar.level}°
              </Badge>
              {activeChar.race && (
                <Badge variant="subtle" size="sm">{activeChar.race}</Badge>
              )}
            </View>
          </View>
        </View>
      </View>

      {/* Sezioni — stesso stile dei pulsanti HomeScreen */}
      <View style={[s.fullWidth, s.gap(t.spacing[3])]}>
        {SECTIONS.map((section) => (
          <Pressable
            key={section.key}
            onPress={() => handleSection(section.key)}
            style={({ pressed }) => ({
              flexDirection: 'row',
              alignItems: 'center',
              padding: t.spacing[4],
              backgroundColor: pressed ? t.colors.accent + '20' : t.colors.backgroundSecondary,
              borderRadius: t.radius.lg,
              borderWidth: 1,
              borderColor: t.colors.border,
            })}
          >
            <View style={{
              width: 48,
              height: 48,
              borderRadius: t.radius.md,
              backgroundColor: t.colors.accent + '18',
              ...s.center,
              marginRight: t.spacing[4],
            }}>
              <Text style={{ fontSize: 22 }}>{section.icon}</Text>
            </View>
            <View style={s.flex}>
              <Text style={{ fontSize: t.typography.base, fontWeight: t.typography.semibold, color: t.colors.foreground }}>
                {section.label}
              </Text>
              <Text style={{ fontSize: t.typography.sm, color: t.colors.foregroundSecondary, marginTop: t.spacing[0.5] }}>
                {section.desc}
              </Text>
            </View>
            <Text style={{ color: t.colors.foregroundTertiary, fontSize: 20 }}>›</Text>
          </Pressable>
        ))}
      </View>

      {selectedSection && (
        <BottomModal visible={!!selectedSection} onClose={() => setSelectedSection(null)}>
          <Text style={{ fontSize: t.typography.xl, fontWeight: '700', color: t.colors.foreground }}>
            {selectedSection.label}
          </Text>

          {selectedSection.key === 'stats' && (
            <View style={[s.mt(t.spacing[3]), s.gap(t.spacing[2])]}>
              {ABILITY_ROWS.map((a) => (
                <View key={a.key} style={[s.row, { justifyContent: 'space-between' }]}>
                  <Text style={{ fontSize: t.typography.sm, color: t.colors.foregroundSecondary }}>
                    {a.label} ({a.abbr})
                  </Text>
                  <Text style={{ fontSize: t.typography.sm, fontWeight: '600', color: t.colors.foreground }}>
                    {activeChar.abilities[a.key] ?? 10}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {selectedSection.key === 'talenti' && (
            <Text style={{ fontSize: t.typography.sm, color: t.colors.foregroundSecondary, marginTop: t.spacing[3] }}>
              {activeChar.feats && activeChar.feats.length > 0
                ? activeChar.feats.join(', ')
                : 'Nessun talento ancora.'}
            </Text>
          )}

          {selectedSection.key === 'note' && (
            <Text style={{ fontSize: t.typography.sm, color: t.colors.foregroundSecondary, marginTop: t.spacing[3] }}>
              {activeChar.background ? `Background: ${activeChar.background}` : 'Nessuna nota — sezione in arrivo.'}
            </Text>
          )}
        </BottomModal>
      )}
    </Screen>
  );
}
