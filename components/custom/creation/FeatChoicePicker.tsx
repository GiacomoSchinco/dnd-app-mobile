import { View, Text } from 'react-native';
import { useMemo } from 'react';
import { useTokens } from '../../ui/prism-provider';
import { getToolLabel, getToolOptions, normalizeToolPool, type ToolOption } from '../../../lib/rules/apply-feat';
import { getAllSkills } from '../../../lib/rules/skills';
import { getAllSpells, getClassSpellsAtLevel } from '../../../lib/rules/spells';
import { parseAbilityFromAbbreviation, getAbilityLabel } from '../../../lib/rules/abilities';
import FilterChip from '../FilterChip';
import { s } from '../../../utils/style-helpers';
import type { FeatRaw, SkillName, Ability } from '../../../types';
import type { FeatChoiceSelection } from '../../../types';

type Props = {
  feat: FeatRaw;
  /** Scelte correnti per questo talento */
  value?: FeatChoiceSelection;
  onChange: (v: FeatChoiceSelection) => void;
  /** Skill in cui il PG ha già competenza (per prof_or_expertise / maestria) */
  knownSkills?: SkillName[];
  /** Maestrie già possedute */
  knownExpertise?: SkillName[];
  /** Bonus di competenza (per il numero di rituali di Incantatore Rituale) */
  proficiencyBonus?: number;
};

type ChoiceCfg = {
  type?: string;
  pool?: string | string[];
  count?: number;
  skill_count?: number;
  expertise_count?: number;
  schools?: string[];
  spell_level?: number;
  max_level?: number;
  spell_list?: string;
  cantrips_count?: number;
  first_level_spells_count?: number;
  spell_casting_ability_choices?: string[];
};

/** Etichette italiane per i tipi di danno/energia (categoria, come TYPE_COLORS) */
const DAMAGE_LABELS: Record<string, string> = {
  acid: 'Acido', bludgeoning: 'Contundente', cold: 'Freddo', fire: 'Fuoco',
  force: 'Forza', lightning: 'Fulmine', necrotic: 'Necrotico', piercing: 'Perforante',
  poison: 'Veleno', psychic: 'Psichico', radiant: 'Radioso', slashing: 'Tagliente',
  thunder: 'Tuono',
};

/** Etichetta skill italiana */
const SKILL_BY_NAME = getAllSkills().reduce<Record<string, string>>((acc, sk) => {
  acc[sk.name] = sk.nameIt ?? sk.name;
  return acc;
}, {});
const skillLabel = (s: string) => SKILL_BY_NAME[s] ?? s;

function SectionLabel({ text }: { text: string }) {
  const t = useTokens();
  return (
    <Text style={{ fontSize: t.typography.xs, fontWeight: '600', color: t.colors.foregroundTertiary, textTransform: 'uppercase', letterSpacing: 0.5 }}>
      {text}
    </Text>
  );
}

/**
 * Picker delle scelte extra dei talenti generali/epici (choice_config):
 * tool, skill (competenza/maestria), tiri salvezza, tipi di danno, incantesimi.
 * Riusato dal wizard (FeatStep) e dal level-up (LevelUpModal).
 */
export default function FeatChoicePicker({
  feat,
  value,
  onChange,
  knownSkills = [],
  knownExpertise = [],
  proficiencyBonus = 2,
}: Props) {
  const t = useTokens();
  const cfg = (feat.choice_config ?? {}) as ChoiceCfg;
  const update = (patch: Partial<FeatChoiceSelection>) => onChange({ ...value, ...patch });

  // Strumenti (tool_proficiency — Chef): pool come chiave o singolo slug
  const toolOptions: ToolOption[] = useMemo(() => {
    if (cfg.type !== 'tool_proficiency') return [];
    const pool = cfg.pool as string | undefined;
    const key = normalizeToolPool(pool);
    if (key) return getToolOptions(key);
    if (pool && getToolLabel(pool) !== pool) return [{ slug: pool, label: getToolLabel(pool) }];
    return [];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cfg.type, cfg.pool]);

  // Skill di un pool
  const skillPool = (Array.isArray(cfg.pool) ? cfg.pool : []) as SkillName[];
  const poolCount = cfg.count ?? 1;

  // Incantesimi per spell_selection (scuola + livello)
  const spellOptions = useMemo(() => {
    if (cfg.type !== 'spell_selection') return [];
    const schools = (cfg.schools ?? []) as string[];
    const level = cfg.spell_level ?? 1;
    return getAllSpells().filter((sp) => sp.level === level && schools.includes(sp.school));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cfg.type, cfg.schools, cfg.spell_level]);

  // Incantesimi rituali (ritual_spells_gain)
  const ritualOptions = useMemo(() => {
    if (cfg.type !== 'ritual_spells_gain') return [];
    const maxLevel = cfg.max_level ?? 1;
    return getAllSpells().filter((sp) => sp.ritual && sp.level <= maxLevel);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cfg.type, cfg.max_level]);

  if (!cfg.type) return null;

  // ── tool_proficiency ─────────────────────────────────────────
  if (cfg.type === 'tool_proficiency') {
    const selected = value?.toolChoices ?? [];
    const count = cfg.count ?? toolOptions.length;
    const toggle = (slug: string) => {
      if (selected.includes(slug)) update({ toolChoices: selected.filter((x) => x !== slug) });
      else if (selected.length < count) update({ toolChoices: [...selected, slug] });
    };
    return (
      <View style={{ gap: t.spacing[1.5] }}>
        <SectionLabel text={`Strumenti (${selected.length}/${count})`} />
        <View style={[s.rowWrap, s.gap(t.spacing[1.5])]}>
          {toolOptions.map((o) => (
            <FilterChip key={o.slug} size="sm" label={o.label} active={selected.includes(o.slug)} onPress={() => toggle(o.slug)} />
          ))}
        </View>
      </View>
    );
  }

  // ── hybrid_proficiency (Abile): abilità + strumenti, budget totale ──
  if (cfg.type === 'hybrid_proficiency') {
    const total = cfg.count ?? 3;
    const prof = value?.skillChoices ?? [];
    const tools = value?.toolChoices ?? [];
    const allSkills = getAllSkills().map((sk) => ({ key: sk.name as SkillName, label: sk.nameIt ?? sk.name }));
    const allTools = getToolOptions();
    const used = prof.length + tools.length;
    const toggleSkill = (skill: SkillName) => {
      if (prof.includes(skill)) update({ skillChoices: prof.filter((x) => x !== skill) });
      else if (used < total) update({ skillChoices: [...prof, skill] });
    };
    const toggleTool = (slug: string) => {
      if (tools.includes(slug)) update({ toolChoices: tools.filter((x) => x !== slug) });
      else if (used < total) update({ toolChoices: [...tools, slug] });
    };
    return (
      <View style={{ gap: t.spacing[1.5] }}>
        <SectionLabel text={`Abilità e strumenti (${used}/${total})`} />
        <View style={[s.rowWrap, s.gap(t.spacing[1.5])]}>
          {allSkills.map((o) => (
            <FilterChip key={o.key} size="sm" label={o.label} active={prof.includes(o.key)} onPress={() => toggleSkill(o.key)} />
          ))}
        </View>
        <View style={[s.rowWrap, s.gap(t.spacing[1.5])]}>
          {allTools.map((o) => (
            <FilterChip key={o.slug} size="sm" label={o.label} active={tools.includes(o.slug)} onPress={() => toggleTool(o.slug)} />
          ))}
        </View>
      </View>
    );
  }

  // ── skill pool: competenza o maestria ────────────────────────
  if (cfg.type === 'observant_skill_choice' || cfg.type === 'skill_proficiency_or_expertise') {
    const prof = value?.skillChoices ?? [];
    const exp = value?.expertiseChoices ?? [];
    const toggleProf = (skill: SkillName) => {
      if (prof.includes(skill)) update({ skillChoices: prof.filter((x) => x !== skill) });
      else if (exp.includes(skill)) update({ skillChoices: [...prof, skill], expertiseChoices: exp.filter((x) => x !== skill) });
      else if (prof.length + exp.length < poolCount) update({ skillChoices: [...prof, skill] });
    };
    const toggleExp = (skill: SkillName) => {
      if (exp.includes(skill)) update({ expertiseChoices: exp.filter((x) => x !== skill) });
      else if (prof.includes(skill)) update({ expertiseChoices: [...exp, skill], skillChoices: prof.filter((x) => x !== skill) });
      else if (prof.length + exp.length < poolCount) update({ expertiseChoices: [...exp, skill] });
    };
    return (
      <View style={{ gap: t.spacing[1.5] }}>
        <SectionLabel text={`Skill (${prof.length + exp.length}/${poolCount}) — tocca due volte per la maestria`} />
        <View style={[s.rowWrap, s.gap(t.spacing[1.5])]}>
          {skillPool.map((skill) => {
            const isProf = prof.includes(skill);
            const isExp = exp.includes(skill);
            return (
              <FilterChip
                key={skill}
                size="sm"
                label={isExp ? `${skillLabel(skill)} ★` : isProf ? `${skillLabel(skill)} ✓` : skillLabel(skill)}
                active={isProf || isExp}
                onPress={() => {
                  if (isExp) toggleExp(skill);
                  else if (isProf) toggleExp(skill);
                  else toggleProf(skill);
                }}
              />
            );
          })}
        </View>
      </View>
    );
  }

  // ── hybrid_proficiency_expertise (Abilità Impeccabile) ───────
  if (cfg.type === 'hybrid_proficiency_expertise') {
    const skillCount = cfg.skill_count ?? 1;
    const expCount = cfg.expertise_count ?? 1;
    const prof = value?.skillChoices ?? [];
    const exp = value?.expertiseChoices ?? [];
    const expOptions = getAllSkills()
      .map((sk) => sk.name)
      .filter((s) => knownSkills.includes(s) && !knownExpertise.includes(s));
    const toggleProf = (skill: SkillName) =>
      prof.includes(skill)
        ? update({ skillChoices: prof.filter((x) => x !== skill) })
        : prof.length < skillCount && update({ skillChoices: [...prof, skill] });
    const toggleExp = (skill: SkillName) =>
      exp.includes(skill)
        ? update({ expertiseChoices: exp.filter((x) => x !== skill) })
        : exp.length < expCount && update({ expertiseChoices: [...exp, skill] });
    return (
      <View style={{ gap: t.spacing[2] }}>
        <View style={{ gap: t.spacing[1] }}>
          <SectionLabel text={`Nuova competenza (${prof.length}/${skillCount})`} />
          <View style={[s.rowWrap, s.gap(t.spacing[1.5])]}>
            {getAllSkills().map((sk) => (
              <FilterChip key={sk.name} size="sm" label={skillLabel(sk.name)} active={prof.includes(sk.name)} onPress={() => toggleProf(sk.name)} />
            ))}
          </View>
        </View>
        <View style={{ gap: t.spacing[1] }}>
          <SectionLabel text={`Maestria (${exp.length}/${expCount}) — da skill già competenti`} />
          <View style={[s.rowWrap, s.gap(t.spacing[1.5])]}>
            {expOptions.length > 0 ? (
              expOptions.map((skill) => (
                <FilterChip key={skill} size="sm" label={`${skillLabel(skill)} ★`} active={exp.includes(skill)} onPress={() => toggleExp(skill)} />
              ))
            ) : (
              <Text style={{ fontSize: t.typography.xs, color: t.colors.foregroundTertiary }}>
                Nessuna skill competente da potenziare a maestria.
              </Text>
            )}
          </View>
        </View>
      </View>
    );
  }

  // ── expertise_gain (Dono dell'Abilità) ───────────────────────
  if (cfg.type === 'expertise_gain') {
    const count = cfg.count ?? 1;
    const exp = value?.expertiseChoices ?? [];
    const options = getAllSkills()
      .map((sk) => sk.name)
      .filter((s) => !knownExpertise.includes(s));
    const toggle = (skill: SkillName) =>
      exp.includes(skill)
        ? update({ expertiseChoices: exp.filter((x) => x !== skill) })
        : exp.length < count && update({ expertiseChoices: [...exp, skill] });
    return (
      <View style={{ gap: t.spacing[1.5] }}>
        <SectionLabel text={`Maestria (${exp.length}/${count})`} />
        <View style={[s.rowWrap, s.gap(t.spacing[1.5])]}>
          {options.map((skill) => (
            <FilterChip key={skill} size="sm" label={`${skillLabel(skill)} ★`} active={exp.includes(skill)} onPress={() => toggle(skill)} />
          ))}
        </View>
      </View>
    );
  }

  // ── element_damage_choice / energy_resistance_choice ─────────
  if (cfg.type === 'element_damage_choice' || cfg.type === 'energy_resistance_choice') {
    const pool = (Array.isArray(cfg.pool) ? cfg.pool : []) as string[];
    const count = cfg.count ?? 1;
    const selected = value?.damageTypes ?? [];
    const toggle = (dmg: string) =>
      selected.includes(dmg)
        ? update({ damageTypes: selected.filter((x) => x !== dmg) })
        : selected.length < count && update({ damageTypes: [...selected, dmg] });
    return (
      <View style={{ gap: t.spacing[1.5] }}>
        <SectionLabel text={`Tipi (${selected.length}/${count})`} />
        <View style={[s.rowWrap, s.gap(t.spacing[1.5])]}>
          {pool.map((dmg) => (
            <FilterChip key={dmg} size="sm" label={DAMAGE_LABELS[dmg] ?? dmg} active={selected.includes(dmg)} onPress={() => toggle(dmg)} />
          ))}
        </View>
      </View>
    );
  }

  // ── saving_throw_proficiency_gain (Resiliente) ───────────────
  if (cfg.type === 'saving_throw_proficiency_gain') {
    return (
      <View style={{ gap: t.spacing[1] }}>
        <SectionLabel text="Tiro salvezza" />
        <Text style={{ fontSize: t.typography.xs, color: t.colors.foregroundSecondary, lineHeight: Math.round(17 * (t.scale ?? 1)) }}>
          Ottieni la competenza nel tiro salvezza della caratteristica scelta per l'aumento (+1) qui sopra.
        </Text>
      </View>
    );
  }

  // ── spell_selection (Contaminazione Fatata/Oscura) ───────────
  if (cfg.type === 'spell_selection') {
    const count = cfg.count ?? 1;
    const selected = value?.spellName;
    return (
      <View style={{ gap: t.spacing[1.5] }}>
        <SectionLabel text={`Incantesimo (${selected ? 1 : 0}/${count})`} />
        <View style={[s.rowWrap, s.gap(t.spacing[1.5])]}>
          {spellOptions.map((sp) => (
            <FilterChip
              key={sp.name}
              size="sm"
              label={sp.name}
              active={selected === sp.name}
              onPress={() => update({ spellName: selected === sp.name ? undefined : sp.name })}
            />
          ))}
        </View>
      </View>
    );
  }

  // ── ritual_spells_gain (Incantatore Rituale) ─────────────────
  if (cfg.type === 'ritual_spells_gain') {
    const count = typeof cfg.count === 'number' ? cfg.count : proficiencyBonus;
    const selected = value?.ritualSpells ?? [];
    const toggle = (name: string) =>
      selected.includes(name)
        ? update({ ritualSpells: selected.filter((x) => x !== name) })
        : selected.length < count && update({ ritualSpells: [...selected, name] });
    return (
      <View style={{ gap: t.spacing[1.5] }}>
        <SectionLabel text={`Incantesimi rituali (${selected.length}/${count})`} />
        <View style={[s.rowWrap, s.gap(t.spacing[1.5])]}>
          {ritualOptions.map((sp) => (
            <FilterChip key={sp.name} size="sm" label={sp.name} active={selected.includes(sp.name)} onPress={() => toggle(sp.name)} />
          ))}
        </View>
      </View>
    );
  }

  // ── spellcasting (Iniziato alla Magia): caratteristica + trucchetti + incantesimo ──
  if (cfg.type === 'spellcasting') {
    const abilityOptions = (cfg.spell_casting_ability_choices ?? [])
      .map((ab) => parseAbilityFromAbbreviation(ab))
      .filter((a): a is Ability => a != null)
      .map((a) => ({ key: a, label: getAbilityLabel(a) }));
    const cantrips = cfg.spell_list ? getClassSpellsAtLevel(cfg.spell_list, 0) : [];
    const spells = cfg.spell_list ? getClassSpellsAtLevel(cfg.spell_list, 1) : [];
    const cantripCount = cfg.cantrips_count ?? 2;
    const spellCount = cfg.first_level_spells_count ?? 1;
    const selAbility = value?.spellAbility;
    const selCantrips = value?.cantrips ?? [];
    const selSpells = value?.spells ?? [];
    const toggleCantrip = (name: string) => {
      if (selCantrips.includes(name)) update({ cantrips: selCantrips.filter((x) => x !== name) });
      else if (selCantrips.length < cantripCount) update({ cantrips: [...selCantrips, name] });
    };
    const toggleSpell = (name: string) => {
      if (selSpells.includes(name)) update({ spells: selSpells.filter((x) => x !== name) });
      else if (selSpells.length < spellCount) update({ spells: [...selSpells, name] });
    };
    return (
      <View style={{ gap: t.spacing[1.5] }}>
        <SectionLabel text={`Caratteristica da incantatore (${selAbility ? 1 : 0}/1)`} />
        <View style={[s.rowWrap, s.gap(t.spacing[1.5])]}>
          {abilityOptions.map((o) => (
            <FilterChip
              key={o.key}
              size="sm"
              label={o.label}
              active={selAbility === o.key}
              onPress={() => update({ spellAbility: selAbility === o.key ? undefined : o.key })}
            />
          ))}
        </View>
        <SectionLabel text={`Trucchetti (${selCantrips.length}/${cantripCount})`} />
        <View style={[s.rowWrap, s.gap(t.spacing[1.5])]}>
          {cantrips.map((sp) => (
            <FilterChip
              key={sp.name}
              size="sm"
              label={sp.name}
              active={selCantrips.includes(sp.name)}
              onPress={() => toggleCantrip(sp.name)}
            />
          ))}
        </View>
        <SectionLabel text={`Incantesimo di 1° livello (${selSpells.length}/${spellCount})`} />
        <View style={[s.rowWrap, s.gap(t.spacing[1.5])]}>
          {spells.map((sp) => (
            <FilterChip
              key={sp.name}
              size="sm"
              label={sp.name}
              active={selSpells.includes(sp.name)}
              onPress={() => toggleSpell(sp.name)}
            />
          ))}
        </View>
      </View>
    );
  }

  return null;
}
