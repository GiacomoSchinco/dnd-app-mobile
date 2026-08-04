import { View, Text, Pressable } from 'react-native';
import { useTokens } from '../../ui/prism-provider';
import { s } from '../../../utils/style-helpers';
import type { Character, ClassName } from '../../../types';
import { CLASS_LABELS } from './types';

type Props = {
  activeChar: Character | null;
  onPress: () => void;
};

export default function CharacterBar({ activeChar, onPress }: Props) {
  const t = useTokens();

  return (
    <Pressable
      onPress={onPress}
      style={[s.row, { justifyContent: 'space-between', backgroundColor: t.colors.card, borderRadius: t.radius.md, borderWidth: 1, borderColor: t.colors.cardBorder, padding: t.spacing[3], marginBottom: t.spacing[4] }]}>
      {activeChar ? (
        <View style={s.flex}>
          <Text style={{ fontSize: t.typography.base, fontWeight: '600', color: t.colors.foreground }}>
            {activeChar.name}
          </Text>
          <Text style={{ fontSize: t.typography.sm, color: t.colors.foregroundSecondary }}>
            {CLASS_LABELS[activeChar.classes?.[0]?.className] || activeChar.classes?.[0]?.className} · Livello {activeChar.level}
          </Text>
          <Text style={{ fontSize: t.typography.xs, color: t.colors.foregroundTertiary, marginTop: 2 }}>
            {(activeChar.preparedSpells ?? []).length} preparate · {(activeChar.favoriteSpells ?? []).length} preferite
          </Text>
        </View>
      ) : (
        <Text style={{ fontSize: t.typography.base, color: t.colors.foregroundSecondary }}>
          👤 Nessun personaggio — tocca per crearne uno
        </Text>
      )}
      <Text style={{ fontSize: 18, color: t.colors.foregroundTertiary }}>›</Text>
    </Pressable>
  );
}
