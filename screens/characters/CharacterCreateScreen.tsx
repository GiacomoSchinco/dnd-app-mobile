import { useState } from 'react';
import { View, Text, TextInput, Pressable, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../types/navigation';
import { useTokens } from '../../components/ui/prism-provider';
import Screen from '../../components/custom/Screen';
import ScreenHeader from '../../components/custom/ScreenHeader';
import BackButton from '../../components/custom/BackButton';
import ClassCarousel from '../../components/custom/ClassCarousel';
import { getAllClasses } from '../../lib/rules/classes';
import { s } from '../../utils/style-helpers';
import { useCharacterStore } from '../../store/useCharacterStore';
import type { ClassName } from '../../types';

// Dati reali dal JSON delle classi: etichetta italiana + descrizione autentica
const CLASSES: { key: ClassName; label: string; desc: string }[] = getAllClasses().map((c) => ({
  key: c.name as ClassName,
  label: c.labelIt,
  desc: c.description,
}));

export default function CharacterCreateScreen() {
  const t = useTokens();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const createCharacter = useCharacterStore((st) => st.createCharacter);

  const [name, setName] = useState('');
  const [selectedClass, setSelectedClass] = useState<ClassName>(CLASSES[0].key);

  const isValid = name.trim().length > 0 && selectedClass !== null;

  const handleCreate = () => {
    if (!isValid) return;
    createCharacter(name.trim(), selectedClass!, 1);
    navigation.goBack();
  };

  return (
    <Screen>
      <ScreenHeader title="Nuovo Personaggio" icon="person-add-outline" />
      <BackButton onPress={() => navigation.goBack()} />

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

        {/* Classe — carousel infinito */}
        <Text style={{ fontSize: t.typography.sm, fontWeight: t.typography.semibold, color: t.colors.foregroundSecondary, marginBottom: t.spacing[1.5] }}>
          CLASSE
        </Text>
        <ClassCarousel
          items={CLASSES}
          selected={selectedClass}
          onSelect={setSelectedClass}
        />
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
