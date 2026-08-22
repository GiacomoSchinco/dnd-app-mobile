import { useState } from 'react';
import { View, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { TabToRootNav } from '../../types/navigation';
import { useTokens } from '../../components/ui/prism-provider';
import { Badge } from '../../components/ui/badge';
import Screen from '../../components/custom/Screen';
import ScreenHeader from '../../components/custom/ScreenHeader';
import MissingActiveCharacter from '../../components/custom/MissingActiveCharacter';
import StatsGrid from '../../components/custom/StatsGrid';
import ClassAvatar from '../../components/custom/ClassAvatar';
import CardBox from '../../components/custom/CardBox';
import ConfirmDeleteCharacterModal from '../../components/custom/ConfirmDeleteCharacterModal';
import LabelValueRow from '../../components/custom/LabelValueRow';
import SectionButton from '../../components/custom/SectionButton';
import SectionTitle from '../../components/custom/SectionTitle';
import StatTile from '../../components/custom/StatTile';
import StepperRow from '../../components/custom/StepperRow';
import { getClassNameItalian } from '../../lib/rules/classes';
import { getEffectiveAbilityScores } from '../../lib/rules/abilities';
import { ROUTES } from '../../lib/routes';
import { s } from '../../utils/style-helpers';
import { useActiveCharacter } from '../../store/useActiveCharacter';

const SECTIONS = [
  { key: 'talenti', icon: '⭐', label: 'Talenti', desc: 'Talenti e abilità speciali' },
  { key: 'note', icon: '📝', label: 'Note', desc: 'Appunti e storia del personaggio' },
];

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
    return <MissingActiveCharacter message="Apri un personaggio dalla Home per gestire la sua scheda." />;
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
      <CardBox padding={t.spacing[5]} radius={t.radius.lg} marginBottom={t.spacing[5]} style={s.fullWidth}>
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
            <StatTile label="CA" value={activeChar.armorClass != null ? String(activeChar.armorClass) : '—'} />
            <StatTile label="PB" value={activeChar.proficiencyBonus != null ? `+${activeChar.proficiencyBonus}` : '—'} />
            <StatTile label="Velocità" value={activeChar.speed != null ? `${activeChar.speed} m` : '—'} />
            <StatTile
              label="Iniz."
              value={activeChar.initiative != null ? `${activeChar.initiative >= 0 ? '+' : ''}${activeChar.initiative}` : '—'}
            />
          </View>
        )}
      </CardBox>

      {/* Punti Ferita — gestione diretta (danno / cura / temporanei) */}
      <CardBox marginBottom={t.spacing[4]} gap={t.spacing[3]} style={s.fullWidth}>
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
        <StepperRow
          label="Attuali"
          value={`${activeChar.hitPoints?.current ?? 0}/${activeChar.hitPoints?.max ?? 0}`}
          onDecrement={() => changeHp(-1)}
          onIncrement={() => changeHp(1)}
          minWidth={56}
          valueSize={t.typography.lg}
          valueWeight="700"
        />

        {/* Temporanei */}
        <StepperRow
          label="Temporanei"
          value={`${activeChar.hitPoints?.temporary ?? 0}`}
          onDecrement={() => changeTempHp(-1)}
          onIncrement={() => changeTempHp(1)}
          minWidth={56}
        />
      </CardBox>

      {/* Caratteristiche — griglia 3×2 con icone, rombo e bonus */}
      <View style={[s.fullWidth, s.mb(t.spacing[4])]}>
        <SectionTitle text="Caratteristiche" />
        <StatsGrid scores={getEffectiveAbilityScores(activeChar.abilities, activeChar.abilityModifiers ?? [])} />
      </View>

      {/* Risorse (Punti Fortuna, Ira, Ki…) */}
      {activeChar.resources && Object.keys(activeChar.resources).length > 0 && (
        <CardBox marginBottom={t.spacing[4]} gap={t.spacing[2]} style={s.fullWidth}>
          <Text style={{ fontSize: t.typography.sm, fontWeight: '600', color: t.colors.foreground }}>
            Risorse
          </Text>
          {Object.entries(activeChar.resources).map(([key, res]) => (
            <LabelValueRow key={key} label={res.label} value={`${res.current}/${res.max}`} />
          ))}
        </CardBox>
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
      <ConfirmDeleteCharacterModal
        visible={confirmDelete}
        characterName={activeChar.name}
        onClose={() => setConfirmDelete(false)}
        onConfirm={handleDelete}
      />
    </>
  );
}
