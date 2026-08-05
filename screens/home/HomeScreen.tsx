import { View, Text, Pressable, FlatList, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { TabToRootNav } from '../../types/navigation';
import { useTokens } from '../../components/ui/prism-provider';
import { Card } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { ROUTES } from '../../lib/routes';
import { getClassNameItalian } from '../../lib/rules/classes';
import Screen from '../../components/custom/Screen';
import ClassAvatar from '../../components/custom/ClassAvatar';
import HomeQuickActions from '../../components/custom/HomeQuickActions';
import { s } from '../../utils/style-helpers';
import { useCharacterStore } from '../../store/useCharacterStore';
import type { Character } from '../../types';
import type { QuickActionRoute } from '../../components/custom/HomeQuickActions';

/** Intestazione con logo e titolo, riusata in entrambi gli stati della Home */
function LogoHeader({ size = 72, subtitle }: { size?: number; subtitle?: string }) {
  const t = useTokens();
  const big = size >= 72;
  return (
    <View style={[s.fullWidth, { alignItems: 'center' }, s.mb(t.spacing[big ? 8 : 5])]}>
      <View style={[s.box(size, 0), s.mb(t.spacing[big ? 3 : 2])]}>
        <Image
          source={require('../../assets/logo.png')}
          style={{ width: size, height: size }}
          resizeMode="contain"
        />
      </View>
      <Text style={{ fontSize: big ? t.typography['2xl'] : t.typography.xl, fontWeight: t.typography.heavy, color: t.colors.foreground, textAlign: 'center' }}>
        DungeonCraft
      </Text>
      {subtitle && (
        <Text style={{ fontSize: t.typography.base, color: t.colors.foregroundSecondary, textAlign: 'center', marginTop: t.spacing[1] }}>
          {subtitle}
        </Text>
      )}
    </View>
  );
}

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

  // Accesso diretto a Impostazioni/Compendio: pusha sullo stack radice (schermo intero, back = Home)
  const handleQuickAction = (screen: QuickActionRoute) => {
    navigation.navigate(screen);
  };

  if (characters.length === 0) {
    return (
      <Screen scrollable={false}>
        <LogoHeader size={72} subtitle="Il tuo compagno di avventure D&D" />

        <View style={[s.flex, s.center, s.gap(t.spacing[6]), s.fullWidth]}>
          <Text style={{ fontSize: 60 }}>👥</Text>
          <Text style={{ fontSize: t.typography.lg, fontWeight: t.typography.semibold, color: t.colors.foreground, textAlign: 'center' }}>
            Nessun personaggio
          </Text>
          <Text style={{ fontSize: t.typography.base, color: t.colors.foregroundSecondary, textAlign: 'center' }}>
            Crea il tuo primo eroe per iniziare{'\n'}l'avventura!
          </Text>
          <Button onPress={handleCreate} size="md">+ Crea Personaggio</Button>
        </View>

        <HomeQuickActions onPress={handleQuickAction} />
      </Screen>
    );
  }

  return (
    <Screen scrollable={false}>
      <LogoHeader size={56} />

      <View style={[s.fullWidth, s.mb(t.spacing[3])]}>
        <Button onPress={handleCreate} fullWidth size="md">+ Nuovo Personaggio</Button>
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

      <HomeQuickActions onPress={handleQuickAction} />
    </Screen>
  );
}
