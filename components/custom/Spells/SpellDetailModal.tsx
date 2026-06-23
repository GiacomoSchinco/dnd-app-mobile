import { View, Text, TouchableOpacity, Modal, ScrollView, Dimensions } from 'react-native';
import { useTokens } from '../../ui/prism-provider';
import { Badge } from '../../ui/badge';
import { Button } from '../../ui/button';
import { spacing, fontSizes, radius } from '../../../utils/styles';
import { Spell, ClassName, SCHOOL_LABELS, CLASS_LABELS, SCHOOL_MAP } from './types';
import { Character } from '../../../store/useCharacterStore';
import DndIcon from '../DndIcon';

type Props = {
  spell: Spell | null;
  activeChar: Character | null;
  onClose: () => void;
  onToggleFavorite: () => void;
  onTogglePrepared: () => void;
};

function DetailChip({ label, value, t, color }: { label: string; value: string; t: any; color?: string }) {
  return (
    <View style={{
      backgroundColor: t.colors.backgroundSecondary,
      borderRadius: radius.sm,
      paddingHorizontal: spacing[2],
      paddingVertical: spacing[1],
    }}>
      <Text style={{ fontSize: 10, color: t.colors.foregroundTertiary, fontWeight: '600', textTransform: 'uppercase' }}>
        {label}
      </Text>
      <Text style={{ fontSize: fontSizes.sm, color: color || t.colors.foreground, fontWeight: '500' }}>
        {value}
      </Text>
    </View>
  );
}

export default function SpellDetailModal({
  spell,
  activeChar,
  onClose,
  onToggleFavorite,
  onTogglePrepared,
}: Props) {
  const t = useTokens();

  return (
    <Modal visible={!!spell} transparent animationType="fade" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', padding: spacing[4] }}>
        <TouchableOpacity
          activeOpacity={1}
          style={{ flex: 1, position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
          onPress={onClose}
        />
        {spell && (
          <View style={{
            backgroundColor: t.colors.card,
            borderRadius: radius.xl,
            maxHeight: Dimensions.get('window').height * 0.8,
          }}>
            <ScrollView
              showsVerticalScrollIndicator={true}
              contentContainerStyle={{ padding: spacing[6] }}
            >
              {/* Header */}
              <View style={{ flexDirection: 'row', gap: spacing[3], marginBottom: spacing[3] }}>
                <View style={{
                  backgroundColor: (SCHOOL_MAP[spell.school]?.color || '#888') + '20',
                  borderRadius: radius.xl,
                  width: 56,
                  height: 56,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <DndIcon name={spell.school} size={30} color={SCHOOL_MAP[spell.school]?.color || '#fff'} />
                </View>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Text style={{ fontSize: fontSizes.xl, fontWeight: '700', color: t.colors.foreground, flex: 1, marginRight: spacing[2] }}>
                      {spell.name}
                    </Text>
                    <TouchableOpacity onPress={onClose} style={{ padding: spacing[1] }}>
                      <Text style={{ fontSize: 20, color: t.colors.foregroundTertiary }}>✕</Text>
                    </TouchableOpacity>
                  </View>
                  <View style={{ flexDirection: 'row', gap: spacing[1.5], marginTop: spacing[1], flexWrap: 'wrap' }}>
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
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing[2], marginBottom: spacing[3] }}>
                <DetailChip label="Tempo" value={spell.casting ?? '—'} t={t} />
                <DetailChip label="Gittata" value={spell.range ?? '—'} t={t} />
                <DetailChip label="Durata" value={spell.duration ?? '—'} t={t} />
                <DetailChip label="Componenti" value={spell.components?.join(', ') ?? '—'} t={t} />
                {spell.material && <DetailChip label="Materiale" value={spell.material} t={t} />}
                {spell.concentration && <DetailChip label="Concentrazione" value="Sì" t={t} color={t.colors.accent} />}
                {spell.ritual && <DetailChip label="Rituale" value="Sì" t={t} color={t.colors.accent} />}
                {spell.damage && <DetailChip label="Danno" value={spell.damage} t={t} color={t.colors.danger} />}
                {spell.save && <DetailChip label="TS" value={spell.save} t={t} />}
                <DetailChip label="Classi" value={spell.classes.map((c) => CLASS_LABELS[c as ClassName] || c).join(', ')} t={t} />
              </View>

              {/* Description */}
              <Text style={{ fontSize: fontSizes.base, color: t.colors.foreground, lineHeight: 22 }}>
                {spell.description}
              </Text>

              {spell.upgrade && (
                <View style={{
                  marginTop: spacing[3],
                  backgroundColor: t.colors.backgroundSecondary,
                  borderRadius: radius.md,
                  padding: spacing[3],
                }}>
                  <Text style={{ fontSize: fontSizes.sm, fontWeight: '600', color: t.colors.accent, marginBottom: spacing[1] }}>
                    ↗ Potenziamento
                  </Text>
                  <Text style={{ fontSize: fontSizes.sm, color: t.colors.foregroundSecondary, lineHeight: 20 }}>
                    {spell.upgrade}
                  </Text>
                </View>
              )}

              {/* Action buttons */}
              {activeChar && (
                <View style={{ flexDirection: 'row', gap: spacing[2], marginTop: spacing[4] }}>
                  <Button
                    variant={activeChar.favoriteSpells.includes(spell.name) ? 'solid' : 'outline'}
                    size="md"
                    onPress={onToggleFavorite}
                    style={{ flex: 1 }}
                  >
                    {activeChar.favoriteSpells.includes(spell.name) ? '★ Preferita' : '☆ Preferita'}
                  </Button>
                  <Button
                    variant={activeChar.preparedSpells.includes(spell.name) ? 'solid' : 'outline'}
                    size="md"
                    onPress={onTogglePrepared}
                    style={{ flex: 1 }}
                  >
                    {activeChar.preparedSpells.includes(spell.name) ? '✓ Preparata' : '+ Prepara'}
                  </Button>
                </View>
              )}
            </ScrollView>
          </View>
        )}
      </View>
    </Modal>
  );
}
