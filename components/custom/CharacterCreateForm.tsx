import { useState } from 'react';
import { View, Text } from 'react-native';
import { useTokens } from '../ui/prism-provider';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { spacing, fontSizes, radius } from '../../utils/styles';
import { ClassName } from './Spells/types';
import CharacterClassPicker from './CharacterClassPicker';

type Props = {
  onCreate: (name: string, className: ClassName) => void;
  onCancel: () => void;
};

/**
 * Reusable character creation form with name input, class picker, and action buttons.
 */
export default function CharacterCreateForm({ onCreate, onCancel }: Props) {
  const t = useTokens();
  const [name, setName] = useState('');
  const [charClass, setCharClass] = useState<ClassName>('wizard');

  const handleCreate = () => {
    if (!name.trim()) return;
    onCreate(name.trim(), charClass);
    setName('');
  };

  return (
    <View style={{
      backgroundColor: t.colors.card,
      borderRadius: radius.xl,
      borderWidth: 1,
      borderColor: t.colors.cardBorder,
      padding: spacing[4],
      gap: spacing[3],
    }}>
      <Text style={{ fontSize: fontSizes.lg, fontWeight: '700', color: t.colors.foreground }}>
        ✨ Nuovo Personaggio
      </Text>

      <Input
        label="Nome"
        placeholder="Es. Gandalf il Viola"
        value={name}
        onChangeText={setName}
      />

      <Text style={{ fontSize: fontSizes.sm, fontWeight: '600', color: t.colors.foregroundSecondary }}>
        Classe
      </Text>

      <CharacterClassPicker selected={charClass} onSelect={setCharClass} />

      <View style={{ flexDirection: 'row', gap: spacing[2] }}>
        <Button variant="ghost" onPress={onCancel} style={{ flex: 1 }}>
          Annulla
        </Button>
        <Button onPress={handleCreate} disabled={!name.trim()} style={{ flex: 1 }}>
          Crea
        </Button>
      </View>
    </View>
  );
}
