import { View, Pressable, StyleSheet } from 'react-native';
import { spacing, radius } from '../../../utils/styles';
import DndIcon from '../DndIcon';
import { DiceType, DICE_TYPES, DICE_COLORS } from '../../../utils/dice';

type Props = {
  selected: DiceType;
  onSelect: (type: DiceType) => void;
};

const ICON_SIZE = 40;

export default function DiceTypeGrid({ selected, onSelect }: Props) {
  return (
    <View style={styles.grid}>
      {DICE_TYPES.map((dt) => {
        const isSelected = dt === selected;
        const c = DICE_COLORS[dt];
        return (
          <Pressable
            key={dt}
            onPress={() => onSelect(dt)}
            style={[
              styles.option,
              {
                borderColor: isSelected ? c : 'transparent',
                backgroundColor: isSelected ? c + '20' : 'transparent',
              },
            ]}
          >
            <DndIcon name={dt} size={ICON_SIZE} color={isSelected ? c : '#666'} />
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: spacing[2],
  },
  option: {
    width: 58,
    height: 58,
    borderRadius: radius.md,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
