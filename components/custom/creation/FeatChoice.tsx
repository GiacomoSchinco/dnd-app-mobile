import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useTokens } from '../../ui/prism-provider';
import FilterChip from '../FilterChip';
import SectionTitle from '../SectionTitle';
import { s } from '../../../utils/style-helpers';
import type { Ability, SkillName } from '../../../types';
import type { ToolOption } from '../../../lib/rules/apply-feat';

/**
 * FeatChoice.tsx — Picker della scelta del talento di origine.
 * Supporta i tre choice_config dei talenti:
 *   - tool_proficiency      (es. "Lavoro Manuale" → N strumenti da un pool)
 *   - hybrid_proficiency    (es. "Abile" → combinazione di skill e/o strumenti)
 *   - spellcasting          (es. "Iniziato alla Magia" → caratteristica + trucchetti + incantesimo)
 */

export interface SpellOption {
  key: string;
  label: string;
}

export type FeatChoiceType = 'tool_proficiency' | 'hybrid_proficiency' | 'spellcasting';

export interface FeatChoiceState {
  name?: string;
  type?: FeatChoiceType;
  /** Il talento ha_choices ma il tipo non è gestito → nota informativa */
  hasChoices?: boolean;

  // tool_proficiency / hybrid_proficiency
  toolOptions: ToolOption[];
  toolSelected: string[];
  toolCount: number;
  toggleTool: (slug: string) => void;

  // hybrid_proficiency (Abile)
  skillOptions: { key: SkillName; label: string }[];
  skillSelected: SkillName[];
  total: number;
  toggleSkill: (skill: SkillName) => void;

  // spellcasting (Iniziato alla Magia)
  abilityOptions: { key: Ability; label: string }[];
  abilitySelected: Ability | null;
  selectAbility: (a: Ability) => void;
  cantripOptions: SpellOption[];
  cantripSelected: string[];
  cantripCount: number;
  toggleCantrip: (name: string) => void;
  spellOptions: SpellOption[];
  spellSelected: string | null;
  selectSpell: (name: string) => void;
}

function Chips({ options, isActive, onToggle }: {
  options: { key: string; label: string }[];
  isActive: (key: string) => boolean;
  onToggle: (key: string) => void;
}) {
  const t = useTokens();
  return (
    <View style={[s.rowWrap, s.gap(t.spacing[1.5])]}>
      {options.map((o) => (
        <FilterChip
          key={o.key}
          label={o.label}
          active={isActive(o.key)}
          onPress={() => onToggle(o.key)}
        />
      ))}
    </View>
  );
}

/**
 * Picker INLINE espandibile per liste lunghe (trucchetti, incantesimi):
 * un riquadro riassuntivo che si apre a pannello con tutte le opzioni come
 * righe selezionabili — evita decine di chip inline e non usa modali nativi
 * (compatibile con lo ScrollView del wizard su nativo e web).
 */
function InlineListPicker({
  title,
  count,
  options,
  selected,
  onToggle,
}: {
  title: string;
  count: string;
  options: { key: string; label: string }[];
  selected: string[];
  onToggle: (key: string) => void;
}) {
  const t = useTokens();
  const [open, setOpen] = useState(false);

  return (
    <View style={{ marginTop: t.spacing[2] }}>
      <Pressable
        onPress={() => setOpen((o) => !o)}
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        style={[
          s.row,
          {
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: t.spacing[3],
            borderRadius: t.radius.md,
            borderWidth: 1,
            borderColor: t.colors.border,
            backgroundColor: t.colors.backgroundSecondary,
          },
        ]}
      >
        <Text style={{ fontSize: t.typography.sm, fontWeight: '600', color: t.colors.foreground }}>
          {title}{' '}
          <Text style={{ color: t.colors.foregroundTertiary, fontWeight: '400' }}>({count})</Text>
        </Text>
        <Text style={{ fontSize: t.typography.sm, color: t.colors.accent }}>
          {open ? 'Chiudi ▴' : 'Scegli ▾'}
        </Text>
      </Pressable>

      {open && (
        <View style={{ marginTop: t.spacing[2], gap: t.spacing[1] }}>
          {options.map((o) => {
            const active = selected.includes(o.key);
            return (
              <Pressable
                key={o.key}
                onPress={() => onToggle(o.key)}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: active }}
                style={[
                  s.row,
                  {
                    alignItems: 'center',
                    paddingVertical: t.spacing[2],
                    paddingHorizontal: t.spacing[3],
                    borderRadius: t.radius.sm,
                    borderWidth: 1,
                    borderColor: active ? t.colors.accent : t.colors.border,
                    backgroundColor: active ? t.colors.accent + '10' : t.colors.card,
                  },
                ]}
              >
                <Text style={[s.flex, { fontSize: t.typography.sm, color: t.colors.foreground }]}>
                  {o.label}
                </Text>
                <Text
                  style={{
                    fontSize: t.typography.sm,
                    color: active ? t.colors.accent : t.colors.foregroundTertiary,
                  }}
                >
                  {active ? '✓' : ''}
                </Text>
              </Pressable>
            );
          })}
        </View>
      )}
    </View>
  );
}

function FeatChoice({ choice }: { choice: FeatChoiceState }) {
  const t = useTokens();

  if (!choice.type) {
    return choice.hasChoices ? (
      <Text style={{ fontSize: t.typography.xs, color: t.colors.foregroundTertiary, marginTop: t.spacing[2] }}>
        ⚠️ La scelta di questo talento sarà disponibile in un prossimo aggiornamento.
      </Text>
    ) : null;
  }

  return (
    <View style={{ marginTop: t.spacing[3] }}>
      {choice.type === 'tool_proficiency' && (
        <>
          <SectionTitle
            large
            text={`Strumenti di ${choice.name ?? 'origine'}`}
            count={`(${choice.toolSelected.length}/${choice.toolCount})`}
          />
          <Chips
            options={choice.toolOptions.map((o) => ({ key: o.slug, label: o.label }))}
            isActive={(k) => choice.toolSelected.includes(k)}
            onToggle={choice.toggleTool}
          />
        </>
      )}

      {choice.type === 'hybrid_proficiency' && (
        <>
          <SectionTitle
            large
            text={`Competenze di ${choice.name ?? 'origine'}`}
            count={`(${choice.skillSelected.length + choice.toolSelected.length}/${choice.total})`}
          />
          <Text style={{ fontSize: t.typography.xs, color: t.colors.foregroundTertiary, marginBottom: t.spacing[2] }}>
            Qualsiasi combinazione di abilità e strumenti.
          </Text>
          <Chips
            options={choice.skillOptions}
            isActive={(k) => choice.skillSelected.includes(k as SkillName)}
            onToggle={(k) => choice.toggleSkill(k as SkillName)}
          />
          <View style={{ height: t.spacing[2] }} />
          <Chips
            options={choice.toolOptions.map((o) => ({ key: o.slug, label: o.label }))}
            isActive={(k) => choice.toolSelected.includes(k)}
            onToggle={choice.toggleTool}
          />
        </>
      )}

      {choice.type === 'spellcasting' && (
        <>
          <SectionTitle large text={`${choice.name ?? 'Iniziato alla Magia'} — caratteristica`} count="" />
          <Chips
            options={choice.abilityOptions}
            isActive={(k) => choice.abilitySelected === k}
            onToggle={(k) => choice.selectAbility(k as Ability)}
          />

          <InlineListPicker
            title="Trucchetti"
            count={`${choice.cantripSelected.length}/${choice.cantripCount}`}
            options={choice.cantripOptions}
            selected={choice.cantripSelected}
            onToggle={choice.toggleCantrip}
          />

          <InlineListPicker
            title="Incantesimo di 1° livello"
            count={choice.spellSelected ? '1/1' : '0/1'}
            options={choice.spellOptions}
            selected={choice.spellSelected ? [choice.spellSelected] : []}
            onToggle={choice.selectSpell}
          />
        </>
      )}
    </View>
  );
}

export default FeatChoice;
