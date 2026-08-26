import { useCallback } from 'react';
import { View, Text, FlatList, Image, type StyleProp, type ViewStyle } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { TabToRootNav } from '../../types/navigation';
import { useTokens } from '../../components/ui/prism-provider';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { ROUTES } from '../../lib/routes';
import { getClassNameItalian } from '../../lib/rules/classes';
import Screen from '../../components/custom/Screen';
import ClassAvatar from '../../components/custom/ClassAvatar';
import ListItem from '../../components/custom/ListItem';
import EmptyState from '../../components/custom/EmptyState';
import HomeQuickActions from '../../components/custom/HomeQuickActions';
import { s } from '../../utils/style-helpers';
import { useCharacterStore } from '../../store/useCharacterStore';
import type { Character } from '../../types';
import type { QuickActionRoute } from '../../components/custom/HomeQuickActions';

/** Intestazione con logo e titolo, riusata in entrambi gli stati della Home */
function LogoHeader({ size = 72, subtitle, style }: { size?: number; subtitle?: string; style?: StyleProp<ViewStyle> }) {
  const t = useTokens();
  const big = size >= 72;
  return (
    <View style={[s.fullWidth, { alignItems: 'center' }, s.mb(t.spacing[big ? 8 : 5]), style]}>
      <View style={[s.box(size, 0), s.mb(t.spacing[big ? 3 : 2])]}>
        <Image
          source={require('../../assets/logo.png')}
          style={{ width: size, height: size }}
          resizeMode="contain"
        />
      </View>
      <Text style={{ fontSize: big ? t.typography['2xl'] : t.typography.xl, fontWeight: t.typography.heavy, color: t.colors.foreground, textAlign: 'center' }}>
        Campaign Chronicle
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
    <ListItem
      variant="card"
      iconBoxed={false}
      icon={<ClassAvatar className={mainClass?.className} size={52} />}
      title={character.name}
      onPress={onPress}
      badges={
        <>
          <Badge variant="solid" size="sm" color={t.colors.accent}>
            {classLabel} {character.level}°
          </Badge>
          {character.race && (
            <Badge variant="subtle" size="sm">{character.race}</Badge>
          )}
        </>
      }
    />
  );
}

export default function HomeScreen() {
  const t = useTokens();
  const navigation = useNavigation<TabToRootNav>();
  const characters = useCharacterStore((st) => st.characters);
  const setActiveCharacterId = useCharacterStore((st) => st.setActiveCharacterId);

  const handleCreate = useCallback(() => {
    navigation.navigate(ROUTES.CHARACTER_CREATE);
  }, [navigation]);

  const handleCharacterPress = useCallback(
    (character: Character) => {
      setActiveCharacterId(character.id);
      navigation.navigate(ROUTES.CHARACTER_DETAIL);
    },
    [navigation, setActiveCharacterId]
  );

  // renderItem memoizzato per la FlatList della Home
  const renderCharacter = useCallback(
    ({ item }: { item: Character }) => (
      <CharacterCard character={item} onPress={() => handleCharacterPress(item)} />
    ),
    [handleCharacterPress]
  );

  // Accesso diretto a Impostazioni/Compendio: pusha sullo stack radice (schermo intero, back = Home)
  const handleQuickAction = useCallback(
    (screen: QuickActionRoute) => {
      navigation.navigate(screen);
    },
    [navigation]
  );

  return (
    <Screen scrollable={false}>
      {characters.length === 0 ? (
        <>
          <LogoHeader size={72} subtitle="Il tuo compagno di avventure D&D" style={{ marginBottom: t.spacing[0] }} />
          <View style={[s.flex, s.fullWidth]}>
            <EmptyState
              title="Nessun personaggio"
              message="Crea il tuo primo eroe per iniziare l'avventura!"
            />
          </View>
        </>
      ) : (
        <>
          <LogoHeader size={56} />
          <FlatList
            data={characters}
            keyExtractor={(item) => item.id}
            renderItem={renderCharacter}
            maxToRenderPerBatch={8}
            windowSize={5}
            style={[s.flex, s.fullWidth]}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: t.spacing[2] }}
          />
        </>
      )}

      {/* Barra azioni in fondo (Thumb Zone): quick actions + CTA primaria ancorata in basso, sopra la tab bar */}
      <View style={[s.fullWidth, s.gap(t.spacing[2]), { paddingTop: t.spacing[2] }]}>
        <HomeQuickActions onPress={handleQuickAction} />
        <Button onPress={handleCreate} fullWidth size="md">
          {characters.length === 0 ? '+ Crea Personaggio' : '+ Nuovo Personaggio'}
        </Button>
      </View>
    </Screen>
  );
}
