import { View, Text, Pressable, FlatList } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useTokens } from '../../components/ui/prism-provider';
import { Card } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import Screen from '../../components/custom/Screen';
import ScreenHeader from '../../components/custom/ScreenHeader';
import { s } from '../../utils/style-helpers';
import { ROUTES } from '../../lib/routes';
import { useCharacterStore } from '../../store/useCharacterStore';
import type { Character } from '../../types';
import { useCallback } from 'react';

const CLASS_LABELS: Record<string, string> = {
  barbarian: 'Barbaro',
  bard: 'Bardo',
  cleric: 'Chierico',
  druid: 'Druido',
  fighter: 'Guerriero',
  monk: 'Monaco',
  paladin: 'Paladino',
  ranger: 'Ranger',
  rogue: 'Ladro',
  sorcerer: 'Stregone',
  warlock: 'Warlock',
  wizard: 'Mago',
};

function CharacterCard({ character, onPress }: { character: Character; onPress: () => void }) {
  const t = useTokens();
  const mainClass = character.classes[0];
  const classLabel = mainClass ? CLASS_LABELS[mainClass.className] || mainClass.className : '—';

  return (
    <Pressable onPress={onPress}>
      <Card variant="elevated" style={{ marginBottom: t.spacing[3] }}>
        <View style={s.row}>
          <View style={[s.box(52, t.radius.md), { backgroundColor: t.colors.accent + '18', marginRight: t.spacing[3] }]}>
            <Text style={{ fontSize: 26 }}>🧙</Text>
          </View>
          <View style={s.flex}>
            <Text style={{ fontSize: t.typography.md, fontWeight: t.typography.semibold, color: t.colors.foreground }}>
              {character.name}
            </Text>
            <View style={[s.row, s.gap(t.spacing[1.5]), s.mt(t.spacing[0.5])]}>
              <Badge variant="solid" size="sm" color={t.colors.accent}>
                {classLabel} {character.level}°
              </Badge>
              {character.race && (
                <Badge variant="subtle" size="sm">
                  {character.race}
                </Badge>
              )}
            </View>
          </View>
          <Text style={{ color: t.colors.foregroundTertiary, fontSize: 20 }}>›</Text>
        </View>
      </Card>
    </Pressable>
  );
}

export default function CharactersScreen() {
  const t = useTokens();
  const navigation = useNavigation<any>();
  const characters = useCharacterStore((st) => st.characters);
  const setActiveCharacterId = useCharacterStore((st) => st.setActiveCharacterId);

  // Ricarica la lista ogni volta che si torna sulla schermata
  useFocusEffect(
    useCallback(() => {
      // Il re-render avviene automaticamente grazie a Zustand
    }, []),
  );

  const handleCreate = () => {
    navigation.navigate(ROUTES.CHARACTER_CREATE);
  };

  const handleCharacterPress = (character: Character) => {
    setActiveCharacterId(character.id);
    navigation.navigate(ROUTES.CHARACTER_DETAIL);
  };

  if (characters.length === 0) {
    return (
      <Screen>
        <ScreenHeader title="Personaggi" icon="people-outline" />
        <View style={[s.flex, s.center, s.gap(t.spacing[6])]}>
          <Text style={{ fontSize: 60 }}>👥</Text>
          <Text style={{ fontSize: t.typography.lg, fontWeight: t.typography.semibold, color: t.colors.foreground, textAlign: 'center' }}>
            Nessun personaggio
          </Text>
          <Text style={{ fontSize: t.typography.base, color: t.colors.foregroundSecondary, textAlign: 'center' }}>
            Crea il tuo primo eroe per iniziare{'\n'}l'avventura!
          </Text>
          <Pressable
            onPress={handleCreate}
            style={({ pressed }) => ({
              backgroundColor: pressed ? t.colors.accent + 'CC' : t.colors.accent,
              paddingHorizontal: t.spacing[8],
              paddingVertical: t.spacing[3],
              borderRadius: t.radius.md,
            })}
          >
            <Text style={{ color: t.colors.accentForeground, fontSize: t.typography.base, fontWeight: t.typography.semibold }}>
              + Crea Personaggio
            </Text>
          </Pressable>
        </View>
      </Screen>
    );
  }

  return (
    <Screen scrollable={false}>
      <ScreenHeader title="Personaggi" icon="people-outline" />

      <View style={[s.fullWidth, s.mb(t.spacing[3])]}>
        <Pressable
          onPress={handleCreate}
          style={({ pressed }) => ({
            backgroundColor: pressed ? t.colors.accent + 'CC' : t.colors.accent,
            paddingVertical: t.spacing[2.5],
            borderRadius: t.radius.md,
            alignItems: 'center',
          })}
        >
          <Text style={{ color: t.colors.accentForeground, fontSize: t.typography.base, fontWeight: t.typography.semibold }}>
            + Nuovo Personaggio
          </Text>
        </Pressable>
      </View>

      <FlatList
        data={characters}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <CharacterCard character={item} onPress={() => handleCharacterPress(item)} />
        )}
        style={[s.flex, s.fullWidth]}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: t.spacing[8] }}
      />
    </Screen>
  );
}