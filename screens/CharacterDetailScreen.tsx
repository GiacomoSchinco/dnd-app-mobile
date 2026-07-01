import { ScrollView, View, Text, TouchableOpacity } from 'react-native';
import { useTokens } from '../components/ui/prism-provider';
import ScreenHeader from '../components/custom/ScreenHeader';
import { spacing, fontSizes, radius } from '../utils/styles';
import { useActiveCharacter } from '../store/useActiveCharacter';
import { CLASS_LABELS } from '../components/custom/Spells/types';
import type { Character, SpellSlot } from '../types';
import SpellSlotManager from '../components/custom/Spells/SpellSlotManager';

type Props = {
  characterId: string;
};

export default function CharacterDetailScreen({ characterId }: Props) {
  const t = useTokens();
  const { characters, updateCharacter } = useActiveCharacter();
  const char = characters.find((c) => c.id === characterId);

  if (!char) {
    return (
      <View style={{ flex: 1, backgroundColor: t.colors.background, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ color: t.colors.foregroundSecondary }}>Personaggio non trovato</Text>
      </View>
    );
  }

  const changeLevel = (delta: number) => {
    const newLevel = Math.max(1, Math.min(20, char.level + delta));
    if (newLevel !== char.level) {
      updateCharacter(char.id, { level: newLevel });
    }
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: t.colors.background }} showsVerticalScrollIndicator={false}>
      <View style={{ padding: spacing[6], gap: spacing[6] }}>
        {/* Header personaggio */}
        <View>
          <Text style={{ fontSize: fontSizes['2xl'], fontWeight: '800', color: t.colors.foreground }}>
            {char.name}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing[2], marginTop: spacing[1] }}>
            <Text style={{ fontSize: fontSizes.base, color: t.colors.foregroundSecondary }}>
              {CLASS_LABELS[char.classes?.[0]?.className as keyof typeof CLASS_LABELS] || char.classes?.[0]?.className}
            </Text>
            <Text style={{ color: t.colors.foregroundTertiary }}>·</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing[1] }}>
              <TouchableOpacity
                onPress={() => changeLevel(-1)}
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: radius.full,
                  backgroundColor: t.colors.backgroundSecondary,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text style={{ fontSize: 14, fontWeight: '700', color: t.colors.foregroundSecondary }}>−</Text>
              </TouchableOpacity>
              <Text style={{ fontSize: fontSizes.base, fontWeight: '700', color: t.colors.accent, minWidth: 24, textAlign: 'center' }}>
                {char.level}
              </Text>
              <TouchableOpacity
                onPress={() => changeLevel(1)}
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: radius.full,
                  backgroundColor: t.colors.backgroundSecondary,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text style={{ fontSize: 14, fontWeight: '700', color: t.colors.foregroundSecondary }}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Gestione slot incantesimi */}
        <View>
          <ScreenHeader title="🔮 Slot Incantesimi" />
          <SpellSlotManager characterId={characterId} />
        </View>

      </View>
    </ScrollView>
  );
}
