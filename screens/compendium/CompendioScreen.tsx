import { View, Text, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../types/navigation';
import { useTokens } from '../../components/ui/prism-provider';
import Screen from '../../components/custom/Screen';
import ScreenHeader from '../../components/custom/ScreenHeader';
import BackButton from '../../components/custom/BackButton';
import DndIcon from '../../components/custom/DndIcon';
import ListItem from '../../components/custom/ListItem';
import { s } from '../../utils/style-helpers';
import { ALTRO_ROUTES } from '../more/altro-routes';
import type { IconName } from '../../components/custom/DndIcon';

type CompendioSectionKey =
  | 'classi'
  | 'razze'
  | 'background'
  | 'talenti'
  | 'oggetti'
  | 'magie'
  | 'equipaggiamento';

interface CompendioSection {
  key: CompendioSectionKey;
  label: string;
  icon: IconName;
  description: string;
}

const SECTIONS: CompendioSection[] = [
  { key: 'classi', label: 'Classi', icon: 'sword-wound', description: '12 classi e 48 sottoclassi' },
  { key: 'razze', label: 'Razze', icon: 'person', description: 'Umano, Elfo, Nano, Halfling e altre' },
  { key: 'background', label: 'Background', icon: 'notebook', description: 'Origini e storie dei personaggi' },
  { key: 'talenti', label: 'Talenti', icon: 'medal', description: 'Talenti e abilità speciali' },
  { key: 'oggetti', label: 'Oggetti', icon: 'backpack', description: 'Armi, armature e oggetti' },
  { key: 'magie', label: 'Magie', icon: 'spell-book', description: 'Lista completa degli incantesimi' },
  { key: 'equipaggiamento', label: 'Equipaggiamento', icon: 'knapsack', description: 'Equipaggiamento da avventuriero' },
];

// Mappa voce del menu → schermata dello stack radice (RootStack)
const SECTION_ROUTES: Record<string, keyof RootStackParamList> = {
  classi: ALTRO_ROUTES.CLASSI,
  razze: ALTRO_ROUTES.RAZZE,
  background: ALTRO_ROUTES.BACKGROUND,
  talenti: ALTRO_ROUTES.TALENTI,
  oggetti: ALTRO_ROUTES.OGGETTI,
  equipaggiamento: ALTRO_ROUTES.EQUIPAGGIAMENTO,
  magie: ALTRO_ROUTES.COMPENDIO_MAGIE,
};

const SECTION_COLORS: Record<string, string> = {
  classi: '#EF4444',
  razze: '#3B82F6',
  background: '#10B981',
  talenti: '#F59E0B',
  oggetti: '#8B5CF6',
  magie: '#EC4899',
  equipaggiamento: '#F97316',
};

export default function CompendioScreen() {
  const t = useTokens();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const handlePress = (key: CompendioSectionKey) => {
    // Tutte le sezioni (inclusa "Incantesimi") aprono una schermata dello stack radice
    const route = SECTION_ROUTES[key];
    if (route) navigation.navigate(route);
  };

  return (
    <Screen>
      <BackButton onPress={() => navigation.goBack()} label="Torna alla Home" />
      <ScreenHeader title="Compendio" icon="book-outline" />
      <Text
        style={{
          fontSize: t.typography.sm,
          color: t.colors.foregroundSecondary,
          marginBottom: t.spacing[4],
          alignSelf: 'flex-start',
        }}
      >
        Consulta tutte le conoscenze di Campaign Chronicle
      </Text>

      <ScrollView
        style={s.fullWidth}
        contentContainerStyle={{ gap: t.spacing[3], paddingBottom: t.spacing[8] }}
        showsVerticalScrollIndicator={false}
      >
        {SECTIONS.map((section) => {
          const accentColor = SECTION_COLORS[section.key] || t.colors.accent;
          return (
            <ListItem
              key={section.key}
              variant="menu"
              accent={accentColor}
              iconBoxed
              iconBg={accentColor + '20'}
              title={section.label}
              description={section.description}
              icon={<DndIcon name={section.icon} size={26} color={accentColor} />}
              onPress={() => handlePress(section.key)}
            />
          );
        })}
      </ScrollView>
    </Screen>
  );
}
