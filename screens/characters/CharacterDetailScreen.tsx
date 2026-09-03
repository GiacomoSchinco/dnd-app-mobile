import { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { TabToRootNav } from '../../types/navigation';
import type { CharacterResource } from '../../types';
import { useTokens } from '../../components/ui/prism-provider';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import Screen from '../../components/custom/Screen';
import ScreenHeader from '../../components/custom/ScreenHeader';
import MissingActiveCharacter from '../../components/custom/MissingActiveCharacter';
import ManualCheckCard from '../../components/custom/ManualCheckCard';
import ManualToolsModal from '../../components/custom/ManualToolsModal';
import DndIcon from '../../components/custom/DndIcon';
import StatsGrid from '../../components/custom/StatsGrid';
import ClassAvatar from '../../components/custom/ClassAvatar';
import CardBox from '../../components/custom/CardBox';
import BottomModal from '../../components/custom/BottomModal';
import LevelUpModal from '../../components/custom/LevelUpModal';
import SectionButton from '../../components/custom/SectionButton';
import SectionTitle from '../../components/custom/SectionTitle';
import StatTile from '../../components/custom/StatTile';
import StepperRow from '../../components/custom/StepperRow';
import { getClassNameItalian } from '../../lib/rules/classes';
import { getEffectiveAbilityScores } from '../../lib/rules/abilities';
import { ROUTES } from '../../lib/routes';
import { s } from '../../utils/style-helpers';
import { useActiveCharacter } from '../../store/useActiveCharacter';

/** Etichette leggibili per il campo resetOn delle risorse */
const RESET_LABELS: Record<string, string> = {
  short_rest: 'breve',
  short_rest_one: 'breve',
  long_rest: 'lungo',
  none: 'nessuno',
};

export default function CharacterDetailScreen() {
  const t = useTokens();
  const navigation = useNavigation<TabToRootNav>();
  const { activeChar, updateCharacter, applyLevelUp } = useActiveCharacter();
  const [levelUpVisible, setLevelUpVisible] = useState(false);
  /** Modale "Regole da verificare" (banner o icona info della card nome) */
  const [manualToolsVisible, setManualToolsVisible] = useState(false);
  /** Risorsa selezionata per la spiegazione (modale) */
  const [resourceInfo, setResourceInfo] = useState<CharacterResource | null>(null);

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

  // ── Gestione risorse (consuma/recupera + ripristino) ────────
  const changeResource = (key: string, delta: number) => {
    if (!activeChar?.resources?.[key]) return;
    const res = activeChar.resources[key];
    updateCharacter(activeChar.id, {
      resources: {
        ...activeChar.resources,
        [key]: { ...res, current: Math.max(0, Math.min(res.max, res.current + delta)) },
      },
    });
  };

  const restoreAllResources = () => {
    if (!activeChar?.resources) return;
    const restored = Object.fromEntries(
      Object.entries(activeChar.resources).map(([k, r]) => [k, { ...r, current: r.max }])
    );
    updateCharacter(activeChar.id, { resources: restored });
  };

  if (!activeChar) {
    return <MissingActiveCharacter message="Apri un personaggio dalla Home per gestire la sua scheda." />;
  }

  const mainClass = activeChar.classes[0];

  return (
    <>
      <Screen>
        <ScreenHeader
        title="Scheda Personaggio"
        icon="person-outline"
        onBack={() => navigation.navigate(ROUTES.HOME)}
        backLabel="Personaggi"
        />

      {/* Card informativa "Regole da verificare" — chiudibile per PG (persistita);
          dopo "Ho capito" resta l'icona info in alto a destra della card del nome */}
      {!activeChar.manualCheckDismissed && (
        <ManualCheckCard
          marginBottom={t.spacing[5]}
          onDismiss={() => updateCharacter(activeChar.id, { manualCheckDismissed: true })}
          onOpenTools={() => setManualToolsVisible(true)}
        />
      )}

      {/* Card nome e classe — stile HomeScreen */}
      <CardBox padding={t.spacing[5]} radius={t.radius.lg} marginBottom={t.spacing[5]} style={s.fullWidth}>
        <View style={s.row}>
          <ClassAvatar className={mainClass?.className} size={56} style={{ marginRight: t.spacing[4] }} />
          <View style={s.flex}>
            <Text style={{ fontSize: t.typography.lg, fontWeight: t.typography.bold, color: t.colors.foreground }}>
              {activeChar.name}
            </Text>
            <View style={[s.row, s.gap(t.spacing[1.5]), s.mt(t.spacing[0.5]), { flexWrap: 'wrap' }]}>
              {activeChar.classes.map((cl) => (
                <Badge key={cl.className} variant="solid" size="sm" color={t.colors.accent}>
                  {getClassNameItalian(cl.className)} {cl.level}°
                </Badge>
              ))}
              {activeChar.race && (
                <Badge variant="subtle" size="sm">{activeChar.race}</Badge>
              )}
            </View>
          </View>

          {/* Info "Regole da verificare" — dopo "Ho capito", in alto a destra */}
          {activeChar.manualCheckDismissed && (
            <Pressable
              onPress={() => setManualToolsVisible(true)}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel="Rileggi le regole da verificare e apri gli strumenti manuali"
              style={({ pressed }) => ({
                width: 32,
                height: 32,
                borderRadius: t.radius.full,
                backgroundColor: pressed ? t.colors.warningSubtle : t.colors.backgroundTertiary,
                ...s.center,
                alignSelf: 'flex-start',
                marginLeft: t.spacing[2],
              })}
            >
              <DndIcon name="info" size={18} color={t.colors.warning} />
            </Pressable>
          )}
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

      {/* Salì di livello — disabilitato al livello massimo (feedback attenuato) */}
      <View style={[s.fullWidth, s.mb(t.spacing[4])]}>
        <SectionButton
          dndIcon="upgrade"
          label="Salì di livello"
          description={activeChar.level >= 20 ? 'Livello massimo raggiunto (20)' : `${activeChar.level}° → ${activeChar.level + 1}°`}
          disabled={activeChar.level >= 20}
          onPress={() => setLevelUpVisible(true)}
        />
      </View>

      {/* Punti Ferita — gestione diretta (danno / cura / temporanei) */}
      <CardBox marginBottom={t.spacing[4]} gap={t.spacing[3]} style={s.fullWidth}>
        <View style={[s.row, { justifyContent: 'space-between' }]}>
          <Text style={{ fontSize: t.typography.sm, fontWeight: t.typography.semibold, color: t.colors.foreground }}>
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

      {/* Risorse (Ira, Ki, Punti Fortuna…) — stepper consuma/recupera + info */}
      {activeChar.resources && Object.keys(activeChar.resources).length > 0 && (
        <CardBox marginBottom={t.spacing[4]} gap={t.spacing[2]} style={s.fullWidth}>
          <View style={[s.row, { justifyContent: 'space-between', alignItems: 'center' }]}>
            <Text style={{ fontSize: t.typography.sm, fontWeight: t.typography.semibold, color: t.colors.foreground }}>
              Risorse
            </Text>
            <Button size="sm" variant="ghost" onPress={restoreAllResources}>
              Ripristina tutte
            </Button>
          </View>
          {Object.entries(activeChar.resources).map(([key, res]) => (
            <StepperRow
              key={key}
              label={res.label}
              value={`${res.current}/${res.max}`}
              onDecrement={() => changeResource(key, -1)}
              onIncrement={() => changeResource(key, +1)}
              onInfo={res.description ? () => setResourceInfo(res) : undefined}
            />
          ))}
        </CardBox>
      )}

      </Screen>

      {/* Modale "Regole da verificare" (da banner o icona info della card nome) */}
      <ManualToolsModal
        visible={manualToolsVisible}
        onClose={() => setManualToolsVisible(false)}
      />

      {/* Spiegazione risorsa (FUORI dallo Screen, pattern modali) */}
      <BottomModal visible={resourceInfo != null} onClose={() => setResourceInfo(null)} showCloseButton>
        {resourceInfo && (
          <>
            <Text
              style={{
                fontSize: t.typography.lg,
                fontWeight: t.typography.bold,
                color: t.colors.foreground,
                marginBottom: t.spacing[1],
              }}
            >
              {resourceInfo.label}
            </Text>
            <Text
              style={{
                fontSize: t.typography.sm,
                color: t.colors.foregroundTertiary,
                marginBottom: t.spacing[3],
              }}
            >
              {resourceInfo.current}/{resourceInfo.max}
              {resourceInfo.resetOn
                ? ` · riposo ${RESET_LABELS[resourceInfo.resetOn] ?? resourceInfo.resetOn}`
                : ''}
            </Text>
            <Text style={{ fontSize: t.typography.base, color: t.colors.foregroundSecondary, lineHeight: Math.round(22 * (t.scale ?? 1)) }}>
              {resourceInfo.description}
            </Text>
          </>
        )}
      </BottomModal>

      {/* Level up */}
      <LevelUpModal
        visible={levelUpVisible}
        character={activeChar}
        onClose={() => setLevelUpVisible(false)}
        onConfirm={(className, options) => applyLevelUp(activeChar.id, className, options)}
      />
    </>
  );
}
