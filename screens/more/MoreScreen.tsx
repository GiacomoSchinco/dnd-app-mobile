import { View, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { AltroStackParamList } from '../../types/navigation';
import { useTokens } from '../../components/ui/prism-provider';
import { s } from '../../utils/style-helpers';
import Screen from '../../components/custom/Screen';
import ScreenHeader from '../../components/custom/ScreenHeader';
import DndIcon from '../../components/custom/DndIcon';
import ListItem from '../../components/custom/ListItem';
import { ALTRO_ROUTES } from './altro-routes';

interface AltroItem {
  key: string;
  route: keyof AltroStackParamList;
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
  const navigation = useNavigation<NativeStackNavigationProp<AltroStackParamList>>();

  return (
    <Screen>
      <ScreenHeader title="Altro" icon="ellipsis-horizontal-outline" />

      <Text style={{ fontSize: t.typography.sm, color: t.colors.foregroundSecondary, marginBottom: t.spacing[2], alignSelf: 'flex-start' }}>
        Tutte le altre funzioni
      </Text>

      <View style={[s.fullWidth, s.gap(t.spacing[3])]}>
        {ITEMS.map((item) => (
          <ListItem
            key={item.key}
            variant="menu"
            title={item.label}
            description={item.description}
            icon={<DndIcon name={item.icon as any} size={32} color={t.colors.accent} />}
            onPress={() => navigation.navigate(item.route)}
          />
        ))}
      </View>
    </Screen>
  );
}
