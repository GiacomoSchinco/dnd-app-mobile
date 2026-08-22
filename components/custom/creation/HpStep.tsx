import { Text, View } from 'react-native';
import { useTokens } from '../../ui/prism-provider';
import { Button } from '../../ui/button';
import { rollDie, DICE_COLORS } from '../../../utils/dice';
import { s } from '../../../utils/style-helpers';
import StepLabel from './StepLabel';
import CardBox from '../CardBox';
import LabelValueRow from '../LabelValueRow';
import type { DiceType } from '../../../types';

type Props = {
  /** Facce del dado vita della classe (6 | 8 | 10 | 12) */
  hitDie?: number;
  level: number;
  /** Modificatore di Costituzione finale (punteggi + boost + ASI) */
  conMod: number;
  /** PF guadagnati per livello dopo il 1° (media del dado + CON) */
  averagePerLevel: number;
  /** Risultato del tiro del dado vita al 1° livello (null = non ancora tirato) */
  hpRoll: number | null;
  onRoll: (value: number) => void;
  onTakeMax: () => void;
};

/** Step 7 — Punti Ferita: tiro del dado vita al 1° livello + CON */
export default function HpStep({
  hitDie,
  level,
  conMod,
  averagePerLevel,
  hpRoll,
  onRoll,
  onTakeMax,
}: Props) {
  const t = useTokens();
  const sides = hitDie ?? 8;
  const die = `d${sides}` as DiceType;

  const lvl1Hp = hpRoll != null ? hpRoll + conMod : null;
  const totalHp = lvl1Hp != null ? lvl1Hp + (level - 1) * averagePerLevel : null;

  return (
    <View style={[s.gap(t.spacing[4])]}>
      <StepLabel>PUNTI FERITA</StepLabel>
      <Text style={{ fontSize: t.typography.sm, color: t.colors.foregroundSecondary }}>
        Al 1° livello tiri il dado vita della classe ({die}) e aggiungi il modificatore di Costituzione.
        {level > 1
          ? ` Dal 2° livello in poi guadagni ${averagePerLevel} PF per livello.`
          : ' Puoi anche scegliere il massimo.'}
      </Text>

      {/* Riepilogo */}
      <CardBox gap={t.spacing[2]}>
        <LabelValueRow label="Dado vita" value={die} />
        <LabelValueRow
          label="Modificatore COS"
          value={conMod >= 0 ? `+${conMod}` : conMod}
        />
        <LabelValueRow
          label="PF totali"
          value={totalHp != null ? totalHp : '—'}
          valueColor={t.colors.accent}
          valueSize={t.typography.lg}
          valueWeight="800"
          labelColor={t.colors.foreground}
          labelWeight="600"
          dividerTop
        />
      </CardBox>

      {/* Lancio */}
      <View style={[s.row, s.gap(t.spacing[3])]}>
        <Button onPress={() => onRoll(rollDie(die))} style={{ flex: 1 }}>🎲 Tira il dado</Button>
        <Button variant="outline" onPress={onTakeMax} style={{ flex: 1 }}>Massimo</Button>
      </View>

      {hpRoll != null && (
        <Text style={{ fontSize: t.typography.sm, color: t.colors.foregroundSecondary, textAlign: 'center' }}>
          Hai tirato{' '}
          <Text style={{ fontWeight: '700', color: DICE_COLORS[die] }}>{hpRoll}</Text> su {die}
          {' '}→ PF al 1° livello:{' '}
          <Text style={{ fontWeight: '700', color: t.colors.foreground }}>{lvl1Hp}</Text>
        </Text>
      )}
    </View>
  );
}
