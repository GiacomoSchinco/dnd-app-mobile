import { useState } from 'react';
import { View, Text, TextInput, Pressable, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTokens } from '../components/ui/prism-provider';
import { Card } from '../components/ui/card';
import Screen from '../components/custom/Screen';
import ScreenHeader from '../components/custom/ScreenHeader';
import BackButton from '../components/custom/BackButton';
import { s } from '../utils/style-helpers';
import { ROUTES } from '../lib/routes';
import { useCharacterStore } from '../store/useCharacterStore';
import type { ClassName } from '../types';

const CLASSES: { key: ClassName; label: string; icon: string; desc: string }[] = [
  { key: 'barbarian', label: 'Barbaro', icon: '🪓', desc: 'Ira primordiale' },
  { key: 'bard', label: 'Bardo', icon: '🎵', desc: 'Ispirazione arcana' },
  { key: 'cleric', label: 'Chierico', icon: '⚜️', desc: 'Potere divino' },
  { key: 'druid', label: 'Druido', icon: '🌿', desc: 'Forza della natura' },
  { key: 'fighter', label: 'Guerriero', icon: '⚔️', desc: 'Maestro d\'armi' },
  { key: 'monk', label: 'Monaco', icon: '🥋', desc: 'Arte marziale' },
  { key: 'paladin', label: 'Paladino', icon: '🛡️', desc: 'Giuramento sacro' },
  { key: 'ranger', label: 'Ranger', icon: '🏹', desc: 'Predatore solitario' },
  { key: 'rogue', label: 'Ladro', icon: '🗡️', desc: 'Astuzia mortale' },
  { key: 'sorcerer', label: 'Stregone', icon: '🔮', desc: 'Sangue magico' },
  { key: 'warlock', label: 'Warlock', icon: '☠️', desc: 'Patto oscuro' },
  { key: 'wizard', label: 'Mago', icon: '📜', desc: 'Sapere arcano' },
];

export default function CharacterCreateScreen() {
  const t = useTokens();
  const navigation = useNavigation<any>();
  const createCharacter = useCharacterStore((st) => st.createCharacter);

  const [name, setName] = useState('');
  const [selectedClass, setSelectedClass] = useState<ClassName | null>(null);

  const isValid = name.trim().length > 0 && selectedClass !== null;

  const handleCreate = () => {
    if (!isValid) return;
    createCharacter(name.trim(), selectedClass!, 1);
    navigation.navigate(ROUTES.PERSONAGGI);
  };

  return (
    <Screen>
      <ScreenHeader title="Nuovo Personaggio" icon="person-add-outline" />
      <BackButton onPress={() => navigation.navigate(ROUTES.PERSONAGGI)} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: t.spacing[12] }}
      >
        {/* Nome */}
        <View style={[s.mb(t.spacing[5])]}>
          <Text style={{ fontSize: t.typography.sm, fontWeight: t.typography.semibold, color: t.colors.foregroundSecondary, marginBottom: t.spacing[1.5] }}>
            NOME DEL PERSONAGGIO
          </Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Es. Aric Elvendusk"
            placeholderTextColor={t.colors.placeholder}
            style={{
              backgroundColor: t.colors.input,
              borderWidth: 1,
              borderColor: t.colors.inputBorder,
              borderRadius: t.radius.md,
              paddingHorizontal: t.spacing[3],
              paddingVertical: t.spacing[2.5],
              fontSize: t.typography.md,
              color: t.colors.foreground,
            }}
          />
        </View>

        {/* Classe */}
        <Text style={{ fontSize: t.typography.sm, fontWeight: t.typography.semibold, color: t.colors.foregroundSecondary, marginBottom: t.spacing[1.5] }}>
          CLASSE
        </Text>
        <View style={{ gap: t.spacing[2] }}>
          {CLASSES.map((cls) => {
            const isSelected = selectedClass === cls.key;
            return (
              <Pressable key={cls.key} onPress={() => setSelectedClass(cls.key)}>
                <Card
                  variant={isSelected ? 'elevated' : 'outlined'}
                  style={{
                    borderColor: isSelected ? t.colors.accent : t.colors.border,
                    borderWidth: isSelected ? 2 : 1,
                  }}
                >
                  <View style={s.row}>
                    <Text style={{ fontSize: 28, marginRight: t.spacing[3] }}>{cls.icon}</Text>
                    <View style={s.flex}>
                      <Text style={{ fontSize: t.typography.base, fontWeight: t.typography.semibold, color: t.colors.foreground }}>
                        {cls.label}
                      </Text>
                      <Text style={{ fontSize: t.typography.sm, color: t.colors.foregroundSecondary }}>
                        {cls.desc}
                      </Text>
                    </View>
                    {isSelected && (
                      <Text style={{ color: t.colors.accent, fontSize: 20 }}>✓</Text>
                    )}
                  </View>
                </Card>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>

      {/* Bottone conferma in fondo */}
      <View style={[s.px(t.spacing[4]), s.py(t.spacing[3])]}>
        <Pressable
          onPress={handleCreate}
          disabled={!isValid}
          style={({ pressed }) => ({
            backgroundColor: isValid
              ? pressed ? t.colors.accent + 'CC' : t.colors.accent
              : t.colors.backgroundTertiary,
            paddingVertical: t.spacing[3],
            borderRadius: t.radius.md,
            alignItems: 'center',
            opacity: isValid ? 1 : 0.5,
          })}
        >
          <Text style={{ color: isValid ? t.colors.accentForeground : t.colors.foregroundTertiary, fontSize: t.typography.md, fontWeight: t.typography.semibold }}>
            Crea Personaggio
          </Text>
        </Pressable>
      </View>
    </Screen>
  );
}
