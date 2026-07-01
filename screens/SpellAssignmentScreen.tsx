import { ScrollView, View, Text, Pressable } from 'react-native';
import { useTokens } from '../components/ui/prism-provider';
import ScreenHeader from '../components/custom/ScreenHeader';
import { spacing, fontSizes } from '../utils/styles';
import { useActiveCharacter } from '../store/useActiveCharacter';
import { CLASS_LABELS } from '../components/custom/Spells/types';
import type { Character } from '../types';
import SpellAssignment from '../components/custom/Spells/SpellAssignment';

type Props = {
  characterId: string;
  onBack: () => void;
};

export default function SpellAssignmentScreen({ characterId, onBack }: Props) {
  const t = useTokens();
  const { characters } = useActiveCharacter();
  const char = characters.find((c) => c.id === characterId);

  return (
    <View style={{ flex: 1, backgroundColor: t.colors.background }}>
      <View style={{ padding: spacing[6], paddingBottom: 0 }}>
        <Pressable onPress={onBack} style={{ marginBottom: spacing[3] }}>
          <Text style={{ color: t.colors.accent, fontSize: fontSizes.base }}>← Indietro</Text>
        </Pressable>
        <ScreenHeader title="📖 Incantesimi" />
        {char && (
          <Text style={{ fontSize: fontSizes.sm, color: t.colors.foregroundSecondary, marginTop: spacing[1] }}>
            {char.name} — {CLASS_LABELS[char.classes?.[0]?.className as keyof typeof CLASS_LABELS] || char.classes?.[0]?.className} · Livello {char.level}
          </Text>
        )}
      </View>
      <ScrollView
        style={{ flex: 1, backgroundColor: t.colors.background }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: spacing[6], paddingTop: spacing[4] }}
      >
        <SpellAssignment characterId={characterId} />
      </ScrollView>
    </View>
  );
}
