import { Text, View } from 'react-native';
import { useTokens } from '../../ui/prism-provider';
import { s } from '../../../utils/style-helpers';
import StepLabel from './StepLabel';
import Chip from './Chip';
import type { SkillOption } from './wizardSteps';
import type { SkillName } from '../../../types';

type Props = {
  /** Etichetta della classe scelta (es. 'Barbaro') */
  classNameLabel: string;
  skillOptions: SkillOption[];
  skillCount: number;
  selectedSkills: SkillName[];
  onToggleSkill: (skill: SkillName) => void;
};

/** Step 4 — Competenze in abilità scelte dalla classe */
export default function SkillsStep({
  classNameLabel,
  skillOptions,
  skillCount,
  selectedSkills,
  onToggleSkill,
}: Props) {
  const t = useTokens();

  return (
    <View>
      <StepLabel>COMPETENZE DI {classNameLabel.toUpperCase()}</StepLabel>
      <Text style={{ fontSize: t.typography.sm, color: t.colors.foregroundSecondary, marginBottom: t.spacing[1] }}>
        Scegli {skillCount} competenze in abilità tra quelle offerte dalla classe.
      </Text>
      <Text style={{ fontSize: t.typography.xs, color: t.colors.foregroundTertiary, marginBottom: t.spacing[2] }}>
        {selectedSkills.length}/{skillCount} selezionate
      </Text>

      {skillOptions.length > 0 ? (
        <View style={[s.row, s.gap(t.spacing[2]), { flexWrap: 'wrap' }]}>
          {skillOptions.map((opt) => (
            <Chip
              key={opt.key}
              label={opt.label}
              selected={selectedSkills.includes(opt.key)}
              onPress={() => onToggleSkill(opt.key)}
            />
          ))}
        </View>
      ) : (
        <Text style={{ fontSize: t.typography.sm, color: t.colors.foregroundTertiary }}>
          Nessuna opzione di competenza disponibile per questa classe.
        </Text>
      )}
    </View>
  );
}
