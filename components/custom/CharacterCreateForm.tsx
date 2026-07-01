import { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useTokens } from '../ui/prism-provider';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { spacing, fontSizes, radius } from '../../utils/styles';
import type { ClassName } from '../../types';
import CharacterClassPicker from './CharacterClassPicker';

type Props = {
  onCreate: (name: string, className: ClassName, level: number) => void;
  onCancel: () => void;
};

/**
 * Reusable character creation form with name input, class picker, level selector, and action buttons.
 */
export default function CharacterCreateForm({ onCreate, onCancel }: Props) {
  const t = useTokens();
  const [name, setName] = useState('');
  const [charClass, setCharClass] = useState<ClassName>('wizard');
  const [level, setLevel] = useState(1);

  const handleCreate = () => {
    if (!name.trim()) return;
    onCreate(name.trim(), charClass, level);
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

      {/* Selettore livello */}
      <View>
        <Text style={{ fontSize: fontSizes.sm, fontWeight: '600', color: t.colors.foregroundSecondary, marginBottom: spacing[1.5] }}>
          Livello
        </Text>
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: spacing[3],
          backgroundColor: t.colors.backgroundSecondary,
          borderRadius: radius.md,
          padding: spacing[2],
        }}>
          <TouchableOpacity
            onPress={() => setLevel((l) => Math.max(1, l - 1))}
            style={{
              width: 36,
              height: 36,
              borderRadius: radius.full,
              backgroundColor: t.colors.card,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text style={{ fontSize: fontSizes.lg, fontWeight: '700', color: t.colors.foreground }}>−</Text>
          </TouchableOpacity>
          <Text style={{ fontSize: fontSizes['2xl'], fontWeight: '800', color: t.colors.accent, minWidth: 48, textAlign: 'center' }}>
            {level}
          </Text>
          <TouchableOpacity
            onPress={() => setLevel((l) => Math.min(20, l + 1))}
            style={{
              width: 36,
              height: 36,
              borderRadius: radius.full,
              backgroundColor: t.colors.card,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text style={{ fontSize: fontSizes.lg, fontWeight: '700', color: t.colors.foreground }}>+</Text>
          </TouchableOpacity>
        </View>
      </View>

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
