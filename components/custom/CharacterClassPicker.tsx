import { View, Text, TouchableOpacity } from 'react-native';
import { useTokens } from '../ui/prism-provider';
import { spacing, fontSizes, radius } from '../../utils/styles';
import type { ClassName } from '../../types';
import { CLASS_LABELS, ALL_CLASSES } from './Spells/types';

type Props = {
  selected: ClassName;
  onSelect: (cls: ClassName) => void;
};

/**
 * Reusable pill-style class picker used in character creation.
 */
export default function CharacterClassPicker({ selected, onSelect }: Props) {
  const t = useTokens();

  return (
    <View style={{ flexDirection: 'row', gap: spacing[1.5], flexWrap: 'wrap' }}>
      {ALL_CLASSES.map((cls) => {
        const active = selected === cls;
        return (
          <TouchableOpacity
            key={cls}
            onPress={() => onSelect(cls)}
            style={{
              paddingHorizontal: spacing[2.5],
              paddingVertical: spacing[1.5],
              borderRadius: radius.full,
              backgroundColor: active ? t.colors.accent : t.colors.backgroundSecondary,
              borderWidth: 1,
              borderColor: active ? 'transparent' : t.colors.border,
            }}
          >
            <Text style={{
              fontSize: fontSizes.sm,
              fontWeight: active ? '600' : '400',
              color: active ? t.colors.accentForeground : t.colors.foreground,
            }}>
              {CLASS_LABELS[cls]}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
