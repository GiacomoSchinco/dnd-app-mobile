import { Text, View } from 'react-native';
import { useTokens } from '../../ui/prism-provider';
import { getRaceById, getLineageById } from '../../../lib/rules/races';
import { getBackground } from '../../../lib/rules/backgrounds';
import { getClassNameItalian } from '../../../lib/rules/classes';
import { getSubclass } from '../../../lib/rules/subclasses';
import { getFeat } from '../../../lib/rules/feats';
import { s } from '../../../utils/style-helpers';
import StepLabel from './StepLabel';
import CardBox from '../CardBox';
import LabelValueRow from '../LabelValueRow';
import StatsGrid from '../StatsGrid';
import type { AbilityScores, ClassName } from '../../../types';

type Props = {
  name: string;
  /** Classi configurate (la prima = primaria) */
  classList: { className: ClassName; level: number; subclassId: number | null }[];
  totalLevel: number;
  raceId: number | null;
  lineageId: number | null;
  backgroundId: number | null;
  abilityMethod: 'standard' | 'point_buy';
  /** Punteggi finali (con boost + ASI + ASI dei talenti) */
  finalScores: AbilityScores | null;
  generalFeatIds: number[];
  fightingStyleId: number | null;
  epicBoonId: number | null;
  hitDie?: number;
  conMod: number;
  averagePerLevel: number;
  hpRoll: number | null;
};

/**
 * Step finale — Riepilogo del personaggio prima della creazione.
 * Mostra identità, classi (multiclasse), razza, background, punteggi finali,
 * talenti e punti ferita. Niente più creazione "a sorpresa".
 */
export default function SummaryStep({
  name,
  classList,
  totalLevel,
  raceId,
  lineageId,
  backgroundId,
  abilityMethod,
  finalScores,
  generalFeatIds,
  fightingStyleId,
  epicBoonId,
  hitDie,
  conMod,
  averagePerLevel,
  hpRoll,
}: Props) {
  const t = useTokens();
  const race = raceId != null ? getRaceById(raceId) : undefined;
  const lineage =
    race != null && lineageId != null ? getLineageById(race, lineageId) : undefined;
  const background = backgroundId != null ? getBackground(backgroundId) : undefined;
  const generalFeats = generalFeatIds
    .map((id) => getFeat(id))
    .filter((f): f is NonNullable<typeof f> => f != null);
  const fightingStyle = fightingStyleId != null ? getFeat(fightingStyleId) : undefined;
  const epicBoon = epicBoonId != null ? getFeat(epicBoonId) : undefined;

  const lvl1Hp = hpRoll != null ? hpRoll + conMod : null;
  const totalHp = lvl1Hp != null ? lvl1Hp + (totalLevel - 1) * averagePerLevel : null;

  return (
    <View style={[s.gap(t.spacing[4])]}>
      <StepLabel>RIEPILOGO</StepLabel>
      <Text style={{ fontSize: t.typography.sm, color: t.colors.foregroundSecondary }}>
        Controlla il personaggio prima di crearlo. Puoi tornare indietro per modificare qualsiasi scelta.
      </Text>

      {/* Identità */}
      <CardBox gap={t.spacing[1]}>
        <Text style={{ fontSize: t.typography.lg, fontWeight: '800', color: t.colors.foreground }}>{name}</Text>
        <Text style={{ fontSize: t.typography.sm, color: t.colors.foregroundSecondary }}>
          {classList.map((c) => `${getClassNameItalian(c.className)} ${c.level}°`).join(' · ')} — Livello totale {totalLevel}
        </Text>
      </CardBox>

      {/* Classi + sottoclasse */}
      <CardBox gap={t.spacing[2]}>
        <Text style={{ fontSize: t.typography.xs, fontWeight: '600', color: t.colors.foregroundTertiary }}>CLASSI</Text>
        {classList.map((c, i) => {
          const sub = c.subclassId != null ? getSubclass(c.subclassId) : undefined;
          return (
            <View key={`${c.className}-${i}`}>
              <Text style={{ fontSize: t.typography.sm, color: t.colors.foreground }}>
                {getClassNameItalian(c.className)} {c.level}°{i === 0 ? ' · primaria' : ''}
              </Text>
              {sub && (
                <Text style={{ fontSize: t.typography.sm, color: t.colors.foregroundSecondary }}>
                  Sottoclasse: {sub.name}
                </Text>
              )}
            </View>
          );
        })}
        <LabelValueRow
          label="Razza"
          value={[race?.name, lineage?.name].filter(Boolean).join(' — ') || '—'}
        />
        <LabelValueRow label="Background" value={background?.name ?? '—'} />
      </CardBox>

      {/* Punteggi finali */}
      <View>
        <StepLabel>
          PUNTEGGI FINALI ({abilityMethod === 'point_buy' ? 'Punto Acquisto' : 'Standard Array'})
        </StepLabel>
        {finalScores ? (
          <StatsGrid scores={finalScores} />
        ) : (
          <Text style={{ fontSize: t.typography.sm, color: t.colors.foregroundTertiary }}>—</Text>
        )}
      </View>

      {/* Talenti */}
      <CardBox gap={t.spacing[1]}>
        <Text style={{ fontSize: t.typography.xs, fontWeight: '600', color: t.colors.foregroundTertiary }}>TALENTI</Text>
        {generalFeats.length > 0 ? (
          generalFeats.map((f) => (
            <Text key={f.id} style={{ fontSize: t.typography.sm, color: t.colors.foreground }}>
              {f.name}
            </Text>
          ))
        ) : (
          <Text style={{ fontSize: t.typography.sm, color: t.colors.foregroundTertiary }}>
            Nessun talento generale
          </Text>
        )}
        {fightingStyle && <LabelValueRow label="Stile di combattimento" value={fightingStyle.name} />}
        {epicBoon && <LabelValueRow label="Dono epico" value={epicBoon.name} />}
      </CardBox>

      {/* Punti ferita */}
      <CardBox gap={t.spacing[1]}>
        <Text style={{ fontSize: t.typography.xs, fontWeight: '600', color: t.colors.foregroundTertiary }}>PUNTI FERITA</Text>
        {hitDie != null && <LabelValueRow label="Dado vita" value={`d${hitDie}`} />}
        <LabelValueRow label="Modificatore COS" value={conMod >= 0 ? `+${conMod}` : conMod} />
        <LabelValueRow
          label="PF totali"
          value={totalHp != null ? String(totalHp) : '—'}
          valueColor={t.colors.accent}
          valueWeight="800"
          dividerTop
        />
      </CardBox>
    </View>
  );
}
