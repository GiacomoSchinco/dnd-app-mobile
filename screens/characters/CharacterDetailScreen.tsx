import { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { TabToRootNav } from '../../types/navigation';
import { useTokens } from '../../components/ui/prism-provider';
import { Badge } from '../../components/ui/badge';
import Screen from '../../components/custom/Screen';
import ScreenHeader from '../../components/custom/ScreenHeader';
import EmptyState from '../../components/custom/EmptyState';
import StatsGrid from '../../components/custom/StatsGrid';
import ClassAvatar from '../../components/custom/ClassAvatar';
import BottomModal from '../../components/custom/BottomModal';
import SectionButton from '../../components/custom/SectionButton';
import { Button } from '../../components/ui/button';
import { getClassNameItalian } from '../../lib/rules/classes';
import { ROUTES } from '../../lib/routes';
import { s } from '../../utils/style-helpers';
import { useActiveCharacter } from '../../store/useActiveCharacter';

const SECTIONS = [
  { key: 'talenti', icon: '⭐', label: 'Talenti', desc: 'Talenti e abilità speciali' },
  { key: 'note', icon: '📝', label: 'Note', desc: 'Appunti e storia del personaggio' },
];

/** Statistica derivata dell'header — quadrato con etichetta + valore */
function StatItem({ label, value }: { label: string; value: string }) {
  const t = useTokens();
  return (
    <View
      style={{
        flex: 1,
        aspectRatio: 1,
        backgroundColor: t.colors.card,
        borderRadius: t.radius.md,
        borderWidth: 1,
        borderColor: t.colors.border,
        alignItems: 'center',
        justifyContent: 'center',
        gap: t.spacing[1],
      }}
    >
      <Text style={{ fontSize: t.typography.xs, color: t.colors.foregroundTertiary }}>{label}</Text>
      <Text style={{ fontSize: t.typography.base, fontWeight: t.typography.semibold, color: t.colors.foreground }}>
        {value}
      </Text>
    </View>
  );
}

/** Bottone quadrato ± per i punti ferita (attuali/temporanei) */
function StepperButton({ onPress, children }: { onPress: () => void; children: string }) {
  const t = useTokens();
  return (
    <Pressable
      onPress={onPress}
      hitSlop={8}
      style={({ pressed }) => ({
        width: 34,
        height: 34,
        borderRadius: t.radius.sm,
        backgroundColor: pressed ? t.colors.accent : t.colors.accent + '18',
        ...s.center,
      })}
    >
      <Text style={{ fontSize: t.typography.base, fontWeight: '700', color: t.colors.accent }}>{children}</Text>
    </Pressable>
  );
}

export default function CharacterDetailScreen() {
  const t = useTokens();
  const navigation = useNavigation<TabToRootNav>();
  const { activeChar, updateCharacter, deleteCharacter } = useActiveCharacter();
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleSection = (key: string) => {
    if (key === 'magie') navigation.navigate(ROUTES.MAGIE);
    else if (key === 'talenti') navigation.navigate(ROUTES.TALENTI);
    else if (key === 'note') navigation.navigate(ROUTES.NOTES);
  };

  // ── Gestione punti ferita ───────────────────────────────────
  const changeHp = (delta: number) => {
    if (!activeChar?.hitPoints) return;
    const hp = activeChar.hitPoints;
    updateCharacter(activeChar.id, {
      hitPoints: { ...hp, current: Math.max(0, Math.min(hp.max, hp.current + delta)) },
    });
  };

  const changeTempHp = (delta: number) => {
    if (!activeChar?.hitPoints) return;
    const hp = activeChar.hitPoints;
    updateCharacter(activeChar.id, {
      hitPoints: { ...hp, temporary: Math.max(0, hp.temporary + delta) },
    });
  };

  const handleDelete = () => {
    if (!activeChar) return;
    deleteCharacter(activeChar.id);
    setConfirmDelete(false);
    // Torna alla Home (lista personaggi)
    navigation.navigate(ROUTES.HOME);
  };

  if (!activeChar) {
    return (
      <EmptyState
        emoji="🔮"
        title="Nessun personaggio selezionato"
        message="Apri un personaggio dalla Home per gestire la sua scheda."
      />
    );
  }

  const mainClass = activeChar.classes[0];
  const classLabel = mainClass ? getClassNameItalian(mainClass.className) : '—';

  return (
    <>
      <Screen>
        <ScreenHeader
        title="Scheda Personaggio"
        icon="person-outline"
        onBack={() => navigation.navigate(ROUTES.HOME)}
        backLabel="Personaggi"
        />

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

        {/* Statistiche derivate — 4 quadrati in fila */}
        {(activeChar.armorClass != null || activeChar.proficiencyBonus != null || activeChar.speed != null || activeChar.initiative != null) && (
          <View style={[s.mt(t.spacing[4]), s.row, { gap: t.spacing[2] }]}>
            <StatItem label="CA" value={activeChar.armorClass != null ? String(activeChar.armorClass) : '—'} />
            <StatItem label="PB" value={activeChar.proficiencyBonus != null ? `+${activeChar.proficiencyBonus}` : '—'} />
            <StatItem label="Velocità" value={activeChar.speed != null ? `${activeChar.speed} m` : '—'} />
            <StatItem
              label="Iniz."
              value={activeChar.initiative != null ? `${activeChar.initiative >= 0 ? '+' : ''}${activeChar.initiative}` : '—'}
            />
          </View>
        )}
      </View>

      {/* Punti Ferita — gestione diretta (danno / cura / temporanei) */}
      <View style={[s.fullWidth, s.mb(t.spacing[4]), {
        backgroundColor: t.colors.backgroundSecondary,
        borderRadius: t.radius.md,
        borderWidth: 1,
        borderColor: t.colors.border,
        padding: t.spacing[4],
        gap: t.spacing[3],
      }]}>
        <View style={[s.row, { justifyContent: 'space-between' }]}>
          <Text style={{ fontSize: t.typography.sm, fontWeight: '600', color: t.colors.foreground }}>
            Punti Ferita
          </Text>
          <Text style={{ fontSize: t.typography.xs, color: t.colors.foregroundTertiary }}>
            Dadi vita:{' '}
            {activeChar.hitPoints
              ? `${activeChar.hitPoints.hitDiceCurrent}/${activeChar.hitPoints.hitDiceMax} × ${activeChar.hitPoints.hitDie}`
              : '—'}
          </Text>
        </View>

        {/* Attuali — danno / cura */}
        <View style={[s.row, { justifyContent: 'space-between' }]}>
          <Text style={{ fontSize: t.typography.sm, color: t.colors.foregroundSecondary }}>Attuali</Text>
          <View style={[s.row, s.gap(t.spacing[3])]}>
            <StepperButton onPress={() => changeHp(-1)}>−</StepperButton>
            <Text style={{ minWidth: 56, textAlign: 'center', fontSize: t.typography.lg, fontWeight: '700', color: t.colors.foreground }}>
              {activeChar.hitPoints?.current ?? 0}/{activeChar.hitPoints?.max ?? 0}
            </Text>
            <StepperButton onPress={() => changeHp(1)}>+</StepperButton>
          </View>
        </View>

        {/* Temporanei */}
        <View style={[s.row, { justifyContent: 'space-between' }]}>
          <Text style={{ fontSize: t.typography.sm, color: t.colors.foregroundSecondary }}>Temporanei</Text>
          <View style={[s.row, s.gap(t.spacing[3])]}>
            <StepperButton onPress={() => changeTempHp(-1)}>−</StepperButton>
            <Text style={{ minWidth: 56, textAlign: 'center', fontSize: t.typography.base, fontWeight: '600', color: t.colors.foreground }}>
              {activeChar.hitPoints?.temporary ?? 0}
            </Text>
            <StepperButton onPress={() => changeTempHp(1)}>+</StepperButton>
          </View>
        </View>
      </View>

      {/* Caratteristiche — griglia 3×2 con icone, rombo e bonus */}
      <View style={[s.fullWidth, s.mb(t.spacing[4])]}>
        <Text style={{ fontSize: t.typography.xs, fontWeight: '600', color: t.colors.foregroundTertiary, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: t.spacing[2] }}>
          Caratteristiche
        </Text>
        <StatsGrid scores={activeChar.abilities} />
      </View>

      {/* Risorse (Punti Fortuna, Ira, Ki…) */}
      {activeChar.resources && Object.keys(activeChar.resources).length > 0 && (
        <View style={[s.fullWidth, s.mb(t.spacing[4]), {
          backgroundColor: t.colors.backgroundSecondary,
          borderRadius: t.radius.md,
          borderWidth: 1,
          borderColor: t.colors.border,
          padding: t.spacing[4],
          gap: t.spacing[2],
        }]}>
          <Text style={{ fontSize: t.typography.sm, fontWeight: '600', color: t.colors.foreground }}>
            Risorse
          </Text>
          {Object.entries(activeChar.resources).map(([key, res]) => (
            <View key={key} style={[s.row, { justifyContent: 'space-between' }]}>
              <Text style={{ fontSize: t.typography.sm, color: t.colors.foregroundSecondary }}>
                {res.label}
              </Text>
              <Text style={{ fontSize: t.typography.sm, fontWeight: '600', color: t.colors.foreground }}>
                {res.current}/{res.max}
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* Sezioni — pulsanti condivisi (stesso stile anche in Altro) */}
      <View style={[s.fullWidth, s.gap(t.spacing[3])]}>
        {SECTIONS.map((section) => (
          <SectionButton
            key={section.key}
            icon={section.icon}
            label={section.label}
            description={section.desc}
            onPress={() => handleSection(section.key)}
          />
        ))}
      </View>
      </Screen>

      {/* Conferma eliminazione */}
      <BottomModal visible={confirmDelete} onClose={() => setConfirmDelete(false)}>
        <Text style={{ fontSize: t.typography.xl, fontWeight: '700', color: t.colors.foreground }}>
          Eliminare &quot;{activeChar.name}&quot;?
        </Text>
        <Text style={{ fontSize: t.typography.sm, color: t.colors.foregroundSecondary, marginTop: t.spacing[2], marginBottom: t.spacing[4] }}>
          Questa azione è irreversibile: il personaggio e tutti i suoi dati verranno rimossi.
        </Text>
        <View style={[s.row, s.gap(t.spacing[3])]}>
          <Button variant="outline" onPress={() => setConfirmDelete(false)} style={{ flex: 1 }}>Annulla</Button>
          <Button variant="danger" onPress={handleDelete} style={{ flex: 1 }}>Elimina</Button>
        </View>
      </BottomModal>
    </>
  );
}
