import { useState } from 'react';
import { View, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { AltroStackParamList } from '../../types/navigation';
import { useTokens } from '../../components/ui/prism-provider';
import { s } from '../../utils/style-helpers';
import Screen from '../../components/custom/Screen';
import ScreenHeader from '../../components/custom/ScreenHeader';
import ConfirmDeleteCharacterModal from '../../components/custom/ConfirmDeleteCharacterModal';
import SectionButton from '../../components/custom/SectionButton';
import type { IconName } from '../../components/custom/DndIcon';
import { ROUTES } from '../../lib/routes';
import { ALTRO_ROUTES } from './altro-routes';
import { useActiveCharacter } from '../../store/useActiveCharacter';

/**
 * Menu della tab "Altro": qui vivono le sezioni di secondo piano / delicate.
 * Impostazioni e Compendio restano raggiungibili dalla Home.
 */
export default function MoreScreen() {
  const t = useTokens();
  const navigation = useNavigation<NativeStackNavigationProp<AltroStackParamList>>();
  const { activeChar, deleteCharacter } = useActiveCharacter();
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleDelete = () => {
    if (!activeChar) return;
    deleteCharacter(activeChar.id);
    setConfirmDelete(false);
    // Torna alla Home (lista personaggi) — risale al navigator a tab
    navigation.getParent()?.getParent()?.navigate(ROUTES.HOME);
  };

  // Voci del menu: lista dichiarativa → facile aggiungerne altre (basta una riga)
  const menuItems: {
    key: string;
    dndIcon: IconName;
    label: string;
    description: string;
    danger?: boolean;
    onPress: () => void;
  }[] = [
    {
      key: 'modifica',
      dndIcon: 'pencil-ruler',
      label: 'Modifica personaggio',
      description: activeChar ? `Nome, statistiche e modificatori di ${activeChar.name}` : 'Nessun personaggio attivo',
      onPress: () => navigation.navigate(ALTRO_ROUTES.MODIFICA_PG),
    },
    {
      key: 'note',
      dndIcon: 'notebook',
      label: 'Note',
      description: 'Appunti e storia del personaggio',
      onPress: () => navigation.getParent()?.getParent()?.navigate(ROUTES.NOTES),
    },
    {
      key: 'elimina',
      dndIcon: 'trash-can',
      label: 'Elimina personaggio',
      description: activeChar ? activeChar.name : 'Nessun personaggio attivo',
      danger: true,
      onPress: () => setConfirmDelete(true),
    },
  ];

  return (
    <>
      <Screen>
        <ScreenHeader title="Altro" icon="ellipsis-horizontal-outline" />

        <Text style={{ fontSize: t.typography.sm, color: t.colors.foregroundSecondary, marginBottom: t.spacing[4], alignSelf: 'flex-start' }}>
          Altre funzioni e sezioni di secondo piano
        </Text>

        <View style={[s.fullWidth, s.gap(t.spacing[3])]}>
          {menuItems.map((item) => (
            <SectionButton
              key={item.key}
              dndIcon={item.dndIcon}
              label={item.label}
              description={item.description}
              danger={item.danger}
              onPress={item.onPress}
            />
          ))}
        </View>
      </Screen>

      {/* Conferma eliminazione — FUORI dallo Screen (ScrollView), come nella Scheda PG */}
      <ConfirmDeleteCharacterModal
        visible={confirmDelete}
        characterName={activeChar?.name ?? ''}
        onClose={() => setConfirmDelete(false)}
        onConfirm={handleDelete}
      />
    </>
  );
}
