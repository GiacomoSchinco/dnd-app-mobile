import { View, Text, Pressable } from 'react-native';
import { useTokens } from '../../components/ui/prism-provider';
import { Badge } from '../../components/ui/badge';
import Screen from '../../components/custom/Screen';
import ScreenHeader from '../../components/custom/ScreenHeader';
import { s } from '../../utils/style-helpers';
import { useActiveCharacter } from '../../store/useActiveCharacter';

const CLASS_LABELS: Record<string, string> = {
  barbarian: 'Barbaro', bard: 'Bardo', cleric: 'Chierico', druid: 'Druido',
  fighter: 'Guerriero', monk: 'Monaco', paladin: 'Paladino', ranger: 'Ranger',
  rogue: 'Ladro', sorcerer: 'Stregone', warlock: 'Warlock', wizard: 'Mago',
};

const SECTIONS = [
  { key: 'stats', icon: '💪', label: 'Caratteristiche', desc: 'FOR, DES, COS, INT, SAG, CAR' },
  { key: 'magie', icon: '🔮', label: 'Incantesimi', desc: 'Slot, preparati e preferiti' },
  { key: 'equip', icon: '⚔️', label: 'Equipaggiamento', desc: 'Armi, armature e oggetti' },
  { key: 'talenti', icon: '⭐', label: 'Talenti', desc: 'Talenti e abilità speciali' },
  { key: 'note', icon: '📝', label: 'Note', desc: 'Appunti e storia del personaggio' },
];

export default function CharacterDetailScreen() {
  const t = useTokens();
  const { activeChar } = useActiveCharacter();

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
  const classLabel = mainClass ? CLASS_LABELS[mainClass.className] || mainClass.className : '—';

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
          <View style={{
            width: 56,
            height: 56,
            borderRadius: t.radius.md,
            backgroundColor: t.colors.accent + '18',
            ...s.center,
            marginRight: t.spacing[4],
          }}>
            <Text style={{ fontSize: 28 }}>🧙</Text>
          </View>
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
            onPress={() => {}}
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
    </Screen>
  );
}
