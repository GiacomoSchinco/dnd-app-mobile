import { useMemo } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useTokens } from '../../ui/prism-provider';
import { Badge } from '../../ui/badge';
import { Button } from '../../ui/button';
import { s } from '../../../utils/style-helpers';
import type { Spell, ClassName, Character, ManualSpellBadge } from '../../../types';
import { SCHOOL_LABELS, CLASS_LABELS, SCHOOL_MAP } from './types';
import { MANUAL_BADGES, resolveSpellBadgeForSpell } from './spellSourceBadges';
import DndIcon, { type IconName } from '../DndIcon';
import BottomModal from '../BottomModal';
import DetailChip from '../DetailChip';
import DetailModalHeader from '../DetailModalHeader';

type Props = {
  spell: Spell | null;
  activeChar: Character | null;
  onClose: () => void;
  /** Se fornito mostra il pulsante "Lancia incantesimo" (consuma lo slot) */
  onCast?: (spell: Spell) => void;
  onToggleFavorite?: () => void;
  onTogglePrepared?: () => void;
  /** Se fornito mostra il selettore di badge colorato (imposta/rimuove il badge manuale) */
  onSetBadge?: (badge: ManualSpellBadge | null) => void;
};

export default function SpellDetailModal({
  spell,
  activeChar,
  onClose,
  onCast,
  onToggleFavorite,
  onTogglePrepared,
  onSetBadge,
}: Props) {
  const t = useTokens();

  // Badge manuale scelto dall'utente (ha precedenza) + badge risolto
  // (automatico da fonte speciale → multiclasse per la seconda classe)
  const manualBadge = activeChar?.spellBadges?.[spell?.name ?? ''] ?? null;
  const badge = useMemo(
    () => (activeChar && spell ? resolveSpellBadgeForSpell(activeChar, spell) : null),
    [activeChar, spell],
  );

  return (
    <BottomModal visible={!!spell} onClose={onClose}>
      {spell && (
      <>
      {/* Header */}
      <DetailModalHeader
        icon={<DndIcon name={spell.school as IconName} size={30} color={SCHOOL_MAP[spell.school]?.color || '#fff'} />}
        iconBg={(SCHOOL_MAP[spell.school]?.color || '#888') + '20'}
        title={spell.name}
        onClose={onClose}
        badges={
          <>
            <Badge variant="solid" color={SCHOOL_MAP[spell.school]?.color || '#888'}>
              {SCHOOL_LABELS[spell.school] || spell.school}
            </Badge>
            <Badge variant="subtle">
              {spell.level === 0 ? 'Trucchetto' : `${spell.level}° livello`}
            </Badge>
            {badge && (
              <Badge variant="subtle" color={badge.color}>{badge.label}</Badge>
            )}
          </>
        }
      />

              {/* Detail Grid */}
              <View style={[s.rowWrap, s.gap(t.spacing[2]), s.mb(t.spacing[3])]}>
                <DetailChip label="Tempo" value={spell.casting ?? '—'} t={t} />
                <DetailChip label="Gittata" value={spell.range ?? '—'} t={t} />
                <DetailChip label="Durata" value={spell.duration ?? '—'} t={t} />
                <DetailChip label="Componenti" value={spell.components?.join(', ') ?? '—'} t={t} />
                {spell.materials && <DetailChip label="Materiale" value={spell.materials} t={t} />}
                {spell.concentration && <DetailChip label="Concentrazione" value="Sì" t={t} color={t.colors.accent} />}
                {spell.ritual && <DetailChip label="Rituale" value="Sì" t={t} color={t.colors.accent} />}
                <DetailChip label="Classi" value={spell.classes.map((c) => CLASS_LABELS[c as ClassName] || c).join(', ')} t={t} />
              </View>

              {/* Description */}
              <Text style={{ fontSize: t.typography.base, color: t.colors.foreground, lineHeight: 22 }}>
                {spell.description}
              </Text>

              {/* Regola particolare automatica: gratis 1/gg senza slot (da bg/talento/razza) */}
              {badge && badge.source && badge.source !== 'manual' && (
                <View
                  style={[s.mt(t.spacing[3]), {
                    backgroundColor: badge.color + '1A',
                    borderRadius: t.radius.md,
                    padding: t.spacing[3],
                    borderWidth: 1,
                    borderColor: badge.color + '55',
                  }]}
                >
                  <Text style={{ fontSize: t.typography.sm, fontWeight: '600', color: badge.color, marginBottom: t.spacing[1] }}>
                    {badge.label}
                  </Text>
                  <Text style={{ fontSize: t.typography.sm, color: t.colors.foregroundSecondary, lineHeight: 20 }}>
                    {badge.source === 'background'
                      ? 'Da talento di origine del background: puoi lanciarla una volta per riposo lungo senza consumare slot.'
                      : badge.source === 'feat'
                        ? 'Da un talento scelto: puoi lanciarla una volta per riposo lungo senza consumare slot.'
                        : badge.source === 'race'
                          ? 'Da razza/lineage: puoi lanciarla una volta per riposo lungo senza consumare slot.'
                          : 'Dalla seconda classe (multiclasse): la magia appartiene a una classe diversa dalla primaria e va aggiunta manualmente da "Gestisci magie".'}
                  </Text>
                </View>
              )}

              {spell.upgrade && spell.upgrade.trim().toLowerCase() !== 'nessuno' && (
                <View style={[s.mt(t.spacing[3]), { backgroundColor: t.colors.backgroundSecondary, borderRadius: t.radius.md, padding: t.spacing[3] }]}>
                  <Text style={{ fontSize: t.typography.sm, fontWeight: '600', color: t.colors.accent, marginBottom: t.spacing[1] }}>
                    ↗ Potenziamento
                  </Text>
                  <Text style={{ fontSize: t.typography.sm, color: t.colors.foregroundSecondary, lineHeight: 20 }}>
                    {spell.upgrade}
                  </Text>
                </View>
              )}

              {/* Selettore badge colore (in fondo, prima di "Lancia") */}
              {onSetBadge && (
                <View style={[s.mt(t.spacing[4])]}>
                  <Text style={{ fontSize: t.typography.xs, fontWeight: '600', color: t.colors.foregroundTertiary, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: t.spacing[2] }}>
                    Badge colore
                  </Text>
                  <View style={[s.row, { alignItems: 'center', gap: t.spacing[2] }]}>
                    <TouchableOpacity
                      onPress={() => onSetBadge(null)}
                      style={[s.box(40, 20), { backgroundColor: t.colors.backgroundTertiary, ...s.center, borderWidth: 2, borderColor: manualBadge ? t.colors.border : t.colors.accent }]}
                    >
                      <Text style={{ color: t.colors.foregroundTertiary, fontSize: t.typography.md }}>✕</Text>
                    </TouchableOpacity>
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      style={{ flex: 1 }}
                      contentContainerStyle={{ gap: t.spacing[2] }}
                    >
                      {MANUAL_BADGES.map((b) => {
                        const active = manualBadge?.color === b.color;
                        return (
                          <TouchableOpacity
                            key={b.key}
                            onPress={() => onSetBadge(active ? null : { color: b.color, label: b.label })}
                            style={[s.box(40, 20), { backgroundColor: b.color, ...s.center, borderWidth: 2, borderColor: active ? t.colors.accent : t.colors.border }]}
                          >
                            {active && <Text style={{ color: '#FFFFFF', fontWeight: '800', fontSize: t.typography.md }}>✓</Text>}
                          </TouchableOpacity>
                        );
                      })}
                    </ScrollView>
                  </View>
                  <Text style={{ fontSize: t.typography.xs, color: t.colors.foregroundTertiary, marginTop: t.spacing[1] }}>
                    {manualBadge ? `Badge: ${manualBadge.label}` : 'Nessun badge: tocca un colore per aggiungerlo.'}
                  </Text>
                </View>
              )}

              {/* Action buttons — nella sezione Magie solo "Lancia" (consuma slot); i trucchetti non hanno tasto */}
              {onCast && spell.level > 0 && (
                <Button
                  variant="solid"
                  size="md"
                  fullWidth
                  onPress={() => onCast(spell)}
                  style={{ marginTop: t.spacing[4] }}
                >
                  Lancia (slot {spell.level}°)
                </Button>
              )}
              {(onToggleFavorite || onTogglePrepared) && (
                <View style={[s.row, s.gap(t.spacing[2]), s.mt(t.spacing[4])]}>
                  {onToggleFavorite && (
                    <Button
                      variant={activeChar?.favoriteSpells.includes(spell.name) ? 'solid' : 'outline'}
                      size="md"
                      onPress={onToggleFavorite}
                      style={{ flex: 1 }}
                    >
                      {activeChar?.favoriteSpells.includes(spell.name) ? '★ Preferita' : '☆ Preferita'}
                    </Button>
                  )}
                  {onTogglePrepared && (
                    <Button
                      variant={activeChar?.preparedSpells.includes(spell.name) ? 'solid' : 'outline'}
                      size="md"
                      onPress={onTogglePrepared}
                      style={{ flex: 1 }}
                    >
                      {activeChar?.preparedSpells.includes(spell.name) ? '✓ Preparata' : '+ Prepara'}
                    </Button>
                  )}
                </View>
              )}
      </>
      )}
    </BottomModal>
  );
}
