import { View, Text, Pressable, FlatList, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { TabToRootNav } from '../../types/navigation';
import { useTokens } from '../../components/ui/prism-provider';
import { Card } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { ROUTES } from '../../lib/routes';
import { getClassNameItalian } from '../../lib/rules/classes';
import Screen from '../../components/custom/Screen';
import ClassAvatar from '../../components/custom/ClassAvatar';
import { s } from '../../utils/style-helpers';
import { useCharacterStore } from '../../store/useCharacterStore';
import type { Character } from '../../types';

function CharacterCard({ character, onPress }: { character: Character; onPress: () => void }) {
  const t = useTokens();
  const mainClass = character.classes[0];
  const classLabel = mainClass ? getClassNameItalian(mainClass.className) : '—';

  return (
    <Pressable onPress={onPress}>
      <Card variant="elevated" style={{ marginBottom: t.spacing[3] }}>
        <View style={s.row}>
          <ClassAvatar className={mainClass?.className} size={52} style={{ marginRight: t.spacing[3] }} />
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

export default function HomeScreen() {
  const t = useTokens();
  const navigation = useNavigation<TabToRootNav>();
  const characters = useCharacterStore((st) => st.characters);
  const setActiveCharacterId = useCharacterStore((st) => st.setActiveCharacterId);

  const handleCreate = () => {
    navigation.navigate(ROUTES.CHARACTER_CREATE);
  };

  const handleCharacterPress = (character: Character) => {
    setActiveCharacterId(character.id);
    navigation.navigate(ROUTES.CHARACTER_DETAIL);
  };

  if (characters.length === 0) {
    return (
      <Screen scrollable={false}>
        {/* Logo / Titolo */}
        <View style={[s.fullWidth, { alignItems: 'center' }, s.mb(t.spacing[8])]}>
          <View style={[s.box(72, 0), s.mb(t.spacing[3])]}>
            <Image
              source={require('../../assets/logo.png')}
              style={{ width: 72, height: 72 }}
              resizeMode="contain"
            />
          </View>
          <Text style={{ fontSize: t.typography['2xl'], fontWeight: t.typography.heavy, color: t.colors.foreground, textAlign: 'center' }}>
            DungeonCraft
          </Text>
          <Text style={{ fontSize: t.typography.base, color: t.colors.foregroundSecondary, textAlign: 'center', marginTop: t.spacing[1] }}>
            Il tuo compagno di avventure D&D
          </Text>
        </View>

        <View style={[s.flex, s.center, s.gap(t.spacing[6]), s.fullWidth]}>
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
      {/* Logo / Titolo */}
      <View style={[s.fullWidth, { alignItems: 'center' }, s.mb(t.spacing[5])]}>
        <View style={[s.box(56, 0), s.mb(t.spacing[2])]}>
          <Image
            source={require('../../assets/logo.png')}
            style={{ width: 56, height: 56 }}
            resizeMode="contain"
          />
        </View>
        <Text style={{ fontSize: t.typography.xl, fontWeight: t.typography.heavy, color: t.colors.foreground, textAlign: 'center' }}>
          DungeonCraft
        </Text>
      </View>

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
