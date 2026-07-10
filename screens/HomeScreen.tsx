import { View, Text, Pressable, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTokens } from '../components/ui/prism-provider';
import { ROUTES } from '../lib/routes';
import Screen from '../components/custom/Screen';
import DndIcon from '../components/custom/DndIcon';
import { s } from '../utils/style-helpers';

export default function HomeScreen() {
  const t = useTokens();
  const navigation = useNavigation<any>();

  return (
    <Screen scrollable={false} center style={{ justifyContent: 'center' }}>
      {/* Logo / Titolo */}
      <View style={[{ alignItems: 'center' }, s.mb(t.spacing[12])]}>
        <View style={[s.box(80, 0), s.mb(t.spacing[4])]}>
          <Image
            source={require('../assets/logo.png')}
            style={{ width: 80, height: 80 }}
            resizeMode="contain"
          />
        </View>
        <Text style={{
          fontSize: t.typography['3xl'],
          fontWeight: t.typography.heavy,
          color: t.colors.foreground,
          textAlign: 'center',
        }}>
          DungeonCraft
        </Text>
        <Text style={{
          fontSize: t.typography.base,
          color: t.colors.foregroundSecondary,
          textAlign: 'center',
          marginTop: t.spacing[1],
        }}>
          Il tuo compagno di avventure D&D
        </Text>
      </View>

      {/* Pulsanti grandi */}
      <View style={[s.fullWidth, s.gap(t.spacing[4])]}>
        <Pressable
          onPress={() => navigation.navigate(ROUTES.PERSONAGGI)}
          style={({ pressed }) => ({
            flexDirection: 'row',
            alignItems: 'center',
            padding: t.spacing[5],
            backgroundColor: pressed ? t.colors.accent + '20' : t.colors.backgroundSecondary,
            borderRadius: t.radius.lg,
            borderWidth: 1,
            borderColor: t.colors.border,
          })}
        >
          <View style={{
            width: 50,
            height: 50,
            borderRadius: t.radius.md,
            backgroundColor: t.colors.accent + '18',
            ...s.center,
            marginRight: t.spacing[4],
          }}>
            <Text style={{ fontSize: 24 }}>👥</Text>
          </View>
          <View style={s.flex}>
            <Text style={{ fontSize: t.typography.md, fontWeight: t.typography.semibold, color: t.colors.foreground }}>
              Personaggi
            </Text>
            <Text style={{ fontSize: t.typography.sm, color: t.colors.foregroundSecondary, marginTop: t.spacing[0.5] }}>
              Crea e gestisci i tuoi eroi
            </Text>
          </View>
          <Text style={{ color: t.colors.foregroundTertiary, fontSize: 22 }}>›</Text>
        </Pressable>

        <Pressable
          onPress={() => navigation.navigate(ROUTES.COMPENDIO)}
          style={({ pressed }) => ({
            flexDirection: 'row',
            alignItems: 'center',
            padding: t.spacing[5],
            backgroundColor: pressed ? t.colors.accent + '20' : t.colors.backgroundSecondary,
            borderRadius: t.radius.lg,
            borderWidth: 1,
            borderColor: t.colors.border,
          })}
        >
          <View style={{
            width: 50,
            height: 50,
            borderRadius: t.radius.md,
            backgroundColor: t.colors.accent + '18',
            ...s.center,
            marginRight: t.spacing[4],
          }}>
            <Text style={{ fontSize: 24 }}>📖</Text>
          </View>
          <View style={s.flex}>
            <Text style={{ fontSize: t.typography.md, fontWeight: t.typography.semibold, color: t.colors.foreground }}>
              Compendio
            </Text>
            <Text style={{ fontSize: t.typography.sm, color: t.colors.foregroundSecondary, marginTop: t.spacing[0.5] }}>
              Consulta regole, classi, magie e altro
            </Text>
          </View>
          <Text style={{ color: t.colors.foregroundTertiary, fontSize: 22 }}>›</Text>
        </Pressable>
      </View>

      {/* Pulsante Impostazioni */}
      <View style={[s.center, s.mt(t.spacing[10])]}>
        <Pressable
          onPress={() => navigation.navigate(ROUTES.IMPOSTAZIONI)}
          style={({ pressed }) => ({
            flexDirection: 'row',
            alignItems: 'center',
            paddingVertical: t.spacing[2],
            paddingHorizontal: t.spacing[5],
            opacity: pressed ? 0.6 : 1,
          })}
        >
          <DndIcon name="gear" size={16} color={t.colors.foregroundTertiary} />
          <Text style={{
            fontSize: t.typography.sm,
            color: t.colors.foregroundTertiary,
            fontWeight: t.typography.medium,
            marginLeft: 6,
          }}>
            Impostazioni
          </Text>
        </Pressable>
      </View>
    </Screen>
  );
}
