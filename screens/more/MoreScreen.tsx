import { View, Text, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTokens } from '../../components/ui/prism-provider';
import { s } from '../../utils/style-helpers';
import Screen from '../../components/custom/Screen';
import ScreenHeader from '../../components/custom/ScreenHeader';
import DndIcon from '../../components/custom/DndIcon';
import { ALTRO_ROUTES } from './altro-routes';

interface AltroItem {
  key: string;
  route: string;
  label: string;
  icon: string;
  description: string;
}

const ITEMS: AltroItem[] = [
  { key: 'compendio', route: ALTRO_ROUTES.COMPENDIO, label: 'Compendio', icon: 'd12', description: 'Classi, razze, talenti, oggetti e altro' },
  { key: 'impostazioni', route: ALTRO_ROUTES.IMPOSTAZIONI, label: 'Impostazioni', icon: 'divination', description: 'Temi, info app' },
];

export default function MoreScreen() {
  const t = useTokens();
  const navigation = useNavigation<any>();

  return (
    <Screen>
      <ScreenHeader title="Altro" icon="ellipsis-horizontal-outline" />

      <Text style={{ fontSize: t.typography.sm, color: t.colors.foregroundSecondary, marginBottom: t.spacing[2], alignSelf: 'flex-start' }}>
        Tutte le altre funzioni
      </Text>

      <View style={[s.fullWidth, s.gap(t.spacing[3])]}>
        {ITEMS.map((item) => (
          <Pressable
            key={item.key}
            onPress={() => navigation.navigate(item.route)}
            style={({ pressed }) => ({
              ...s.row,
              gap: t.spacing[4],
              padding: t.spacing[4],
              backgroundColor: pressed ? t.colors.backgroundSecondary : 'transparent',
              borderRadius: t.radius.lg,
              borderWidth: 1,
              borderColor: t.colors.backgroundSecondary,
            })}
          >
            <DndIcon name={item.icon as any} size={32} color={t.colors.accent} />
            <View style={s.flex}>
              <Text style={{ fontSize: t.typography.base, fontWeight: '600', color: t.colors.foreground }}>
                {item.label}
              </Text>
              <Text style={{ fontSize: t.typography.sm, color: t.colors.foregroundSecondary, marginTop: 2 }}>
                {item.description}
              </Text>
            </View>
            <Text style={{ color: t.colors.foregroundSecondary, fontSize: 18 }}>›</Text>
          </Pressable>
        ))}
      </View>
    </Screen>
  );
}
