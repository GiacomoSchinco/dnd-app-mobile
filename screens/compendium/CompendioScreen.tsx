import { View, Text, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { AltroToTabNav, AltroStackParamList } from '../../types/navigation';
import { useTokens } from '../../components/ui/prism-provider';
import Screen from '../../components/custom/Screen';
import ScreenHeader from '../../components/custom/ScreenHeader';
import BackButton from '../../components/custom/BackButton';
import DndIcon from '../../components/custom/DndIcon';
import ListItem from '../../components/custom/ListItem';
import { s } from '../../utils/style-helpers';
import { ROUTES } from '../../lib/routes';
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
  { key: 'classi', label: 'Classi', icon: 'd12', description: '12 classi e 48 sottoclassi' },
  { key: 'razze', label: 'Razze', icon: 'd10', description: 'Umano, Elfo, Nano, Halfling e altre' },
  { key: 'background', label: 'Background', icon: 'd8', description: 'Origini e storie dei personaggi' },
  { key: 'talenti', label: 'Talenti', icon: 'd6', description: 'Talenti e abilità speciali' },
  { key: 'oggetti', label: 'Oggetti', icon: 'd4', description: 'Armi, armature e oggetti' },
  { key: 'magie', label: 'Incantesimi', icon: 'divination', description: 'Lista completa degli incantesimi' },
  { key: 'equipaggiamento', label: 'Equipaggiamento', icon: 'gear', description: 'Equipaggiamento da avventuriero' },
];

// Mappa voce del menu → schermata dello stack Altro
const SECTION_ROUTES: Record<string, keyof AltroStackParamList> = {
  classi: ALTRO_ROUTES.CLASSI,
  razze: ALTRO_ROUTES.RAZZE,
  background: ALTRO_ROUTES.BACKGROUND,
  talenti: ALTRO_ROUTES.TALENTI,
  oggetti: ALTRO_ROUTES.OGGETTI,
  equipaggiamento: ALTRO_ROUTES.EQUIPAGGIAMENTO,
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
  const navigation = useNavigation<AltroToTabNav>();

  const handlePress = (key: CompendioSectionKey) => {
    if (key === 'magie') {
      // Gli incantesimi vivono nella tab Magie esistente
      navigation.navigate(ROUTES.MAGIE);
      return;
    }
    const route = SECTION_ROUTES[key];
    if (route) navigation.navigate(route);
  };

  return (
    <Screen>
      <BackButton onPress={() => navigation.goBack()} label="Torna al menu" />
      <ScreenHeader title="Compendio" icon="book-outline" />
      <Text
        style={{
          fontSize: t.typography.sm,
          color: t.colors.foregroundSecondary,
          marginBottom: t.spacing[4],
          alignSelf: 'flex-start',
        }}
      >
        Consulta tutte le conoscenze di DungeonCraft
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
