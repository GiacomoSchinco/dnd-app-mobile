import { View, Text, Pressable } from 'react-native';
import { useTokens } from '../../ui/prism-provider';
import { spacing, fontSizes, radius } from '../../../utils/styles';
import { Character } from '../../../store/useCharacterStore';
import { ClassName, CLASS_LABELS } from './types';

type Props = {
  activeChar: Character | null;
  onPress: () => void;
};

export default function CharacterBar({ activeChar, onPress }: Props) {
  const t = useTokens();

  return (
    <Pressable
      onPress={onPress}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: t.colors.card,
        borderRadius: radius.md,
        borderWidth: 1,
        borderColor: t.colors.cardBorder,
        padding: spacing[3],
        marginBottom: spacing[4],
      }}
    >
      {activeChar ? (
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: fontSizes.base, fontWeight: '600', color: t.colors.foreground }}>
            {activeChar.name}
          </Text>
          <Text style={{ fontSize: fontSizes.sm, color: t.colors.foregroundSecondary }}>
            {CLASS_LABELS[activeChar.class as ClassName] || activeChar.class} · Livello {activeChar.level}
          </Text>
          <Text style={{ fontSize: fontSizes.xs, color: t.colors.foregroundTertiary, marginTop: 2 }}>
            {activeChar.preparedSpells.length} preparate · {activeChar.favoriteSpells.length} preferite
          </Text>
        </View>
      ) : (
        <Text style={{ fontSize: fontSizes.base, color: t.colors.foregroundSecondary }}>
          👤 Nessun personaggio — tocca per crearne uno
        </Text>
      )}
      <Text style={{ fontSize: 18, color: t.colors.foregroundTertiary }}>›</Text>
    </Pressable>
  );
}
