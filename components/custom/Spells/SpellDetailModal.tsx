import { View, Text, TouchableOpacity } from 'react-native';
import { useTokens } from '../../ui/prism-provider';
import { Badge } from '../../ui/badge';
import { Button } from '../../ui/button';
import { s } from '../../../utils/style-helpers';
import type { Spell, ClassName, Character } from '../../../types';
import { SCHOOL_LABELS, CLASS_LABELS, SCHOOL_MAP } from './types';
import DndIcon, { type IconName } from '../DndIcon';
import BottomModal from '../BottomModal';
import DetailChip from '../DetailChip';

type Props = {
  spell: Spell | null;
  activeChar: Character | null;
  onClose: () => void;
  /** Se fornito mostra il pulsante "Lancia incantesimo" (consuma lo slot) */
  onCast?: (spell: Spell) => void;
  onToggleFavorite?: () => void;
  onTogglePrepared?: () => void;
};

export default function SpellDetailModal({
  spell,
  activeChar,
  onClose,
  onCast,
  onToggleFavorite,
  onTogglePrepared,
}: Props) {
  const t = useTokens();

  return (
    <BottomModal visible={!!spell} onClose={onClose}>
      {spell && (
      <>
      {/* Header */}
      <View style={[s.row, s.gap(t.spacing[3]), s.mb(t.spacing[3])]}>
                <View style={[s.box(56, t.radius.xl), { backgroundColor: (SCHOOL_MAP[spell.school]?.color || '#888') + '20' }]}>
                  <DndIcon name={spell.school as IconName} size={30} color={SCHOOL_MAP[spell.school]?.color || '#fff'} />
                </View>
                <View style={s.flex}>
                  <View style={[s.row, { justifyContent: 'space-between', alignItems: 'flex-start' }]}>
                    <Text style={{ fontSize: t.typography.xl, fontWeight: '700', color: t.colors.foreground, flex: 1, marginRight: t.spacing[2] }}>
                      {spell.name}
                    </Text>
                    <TouchableOpacity onPress={onClose} style={s.p(t.spacing[1])}>
                      <Text style={{ fontSize: 20, color: t.colors.foregroundTertiary }}>✕</Text>
                    </TouchableOpacity>
                  </View>
                  <View style={[s.rowWrap, s.gap(t.spacing[1.5]), s.mt(t.spacing[1])]}>
                    <Badge variant="solid" color={SCHOOL_MAP[spell.school]?.color || '#888'}>
                      {SCHOOL_LABELS[spell.school] || spell.school}
                    </Badge>
                    <Badge variant="subtle">
                      {spell.level === 0 ? 'Trucchetto' : `${spell.level}° livello`}
                    </Badge>
                  </View>
                </View>
              </View>

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
