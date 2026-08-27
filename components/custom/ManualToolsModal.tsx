import { View, Text, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { TabToRootNav } from '../../types/navigation';
import { useTokens } from '../ui/prism-provider';
import BottomModal from './BottomModal';
import SectionButton from './SectionButton';
import SectionTitle from './SectionTitle';
import type { IconName } from './DndIcon';
import { s } from '../../utils/style-helpers';
import { ROUTES } from '../../lib/routes';
import { ALTRO_ROUTES } from '../../screens/more/altro-routes';

type Props = {
  visible: boolean;
  onClose: () => void;
};

type ToolItem = {
  key: string;
  dndIcon: IconName;
  label: string;
  description: string;
  onPress: () => void;
};

/**
 * Modale "Regole da verificare": ricorda che non tutto è automatico e apre gli
 * strumenti manuali (editor, gestisci magie/oggetti, note). Raggiungibile dal
 * banner della Scheda (via `ManualCheckCard`) o dall'icona info della card nome.
 */
export default function ManualToolsModal({ visible, onClose }: Props) {
  const t = useTokens();
  const navigation = useNavigation<TabToRootNav>();

  const tools: ToolItem[] = [
    {
      key: 'editor',
      dndIcon: 'pencil-ruler',
      label: 'Modifica personaggio',
      description: 'Correggi nome, statistiche, CA, PF e modificatori',
      onPress: () => {
        onClose();
        navigation.navigate(ROUTES.ALTRO, { screen: ALTRO_ROUTES.MODIFICA_PG });
      },
    },
    {
      key: 'magie',
      dndIcon: 'spell-book',
      label: 'Gestisci magie',
      description: 'Assegna a mano magie da talenti, sottoclasse o altre fonti',
      onPress: () => {
        onClose();
        navigation.navigate(ROUTES.SPELL_ASSIGN);
      },
    },
    {
      key: 'oggetti',
      dndIcon: 'backpack',
      label: 'Gestisci oggetti',
      description: 'Aggiungi o togli oggetti e quantità',
      onPress: () => {
        onClose();
        navigation.navigate(ROUTES.ITEM_ASSIGN);
      },
    },
    {
      key: 'note',
      dndIcon: 'notebook',
      label: 'Note',
      description: 'Segna regole particolari e promemoria del personaggio',
      onPress: () => {
        onClose();
        navigation.navigate(ROUTES.NOTES);
      },
    },
  ];

  return (
    <BottomModal visible={visible} onClose={onClose}>
      <View style={[s.row, { justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: t.spacing[1] }]}>
        <Text
          style={{
            fontSize: t.typography.lg,
            fontWeight: t.typography.bold,
            color: t.colors.foreground,
            flex: 1,
            marginRight: t.spacing[2],
          }}
        >
          Regole da verificare
        </Text>
        <Pressable
          onPress={onClose}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Chiudi"
          style={s.p(t.spacing[1])}
        >
          <Text style={{ fontSize: 20, color: t.colors.foregroundTertiary }}>✕</Text>
        </Pressable>
      </View>
      <Text
        style={{
          fontSize: t.typography.base,
          color: t.colors.foregroundSecondary,
          lineHeight: 22,
          marginBottom: t.spacing[4],
        }}
      >
        Alcune regole non sono automatiche (magie da talenti o sottoclasse, bonus
        particolari). Controlla i manuali, la sezione talenti e regola il personaggio con gli strumenti.
      </Text>

      <SectionTitle variant="accent">Strumenti manuali</SectionTitle>
      <View style={[s.gap(t.spacing[3])]}>
        {tools.map((tool) => (
          <SectionButton
            key={tool.key}
            dndIcon={tool.dndIcon}
            label={tool.label}
            description={tool.description}
            onPress={tool.onPress}
          />
        ))}
      </View>
    </BottomModal>
  );
}
