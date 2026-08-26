import { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { TabToRootNav } from '../../types/navigation';
import { useTokens } from '../ui/prism-provider';
import { Button } from '../ui/button';
import BottomModal from './BottomModal';
import SectionButton from './SectionButton';
import DndIcon, { type IconName } from './DndIcon';
import SectionTitle from './SectionTitle';
import { s } from '../../utils/style-helpers';
import { ROUTES } from '../../lib/routes';
import { ALTRO_ROUTES } from '../../screens/more/altro-routes';

type Props = {
  /** Se true (dopo "Ho capito") mostra solo la riga info compatta che riapre tutto */
  dismissed: boolean;
  /** Nasconde la card per questo personaggio (va persistita nello store) */
  onDismiss: () => void;
  /** Margine inferiore (per il posizionamento nella Scheda) */
  marginBottom?: number;
};

type ToolItem = {
  key: string;
  dndIcon: IconName;
  label: string;
  description: string;
  onPress: () => void;
};

/**
 * Card informativa "Regole da verificare" per la Scheda del personaggio.
 * Ricorda che non tutte le regole sono automatiche (magie da talenti/sottoclasse,
 * bonus particolari) e apre un modale con gli strumenti manuali già esistenti
 * (editor, gestisci magie/oggetti, note). Chiudibile per personaggio via `onDismiss`.
 */
export default function ManualCheckCard({ dismissed, onDismiss, marginBottom }: Props) {
  const t = useTokens();
  const navigation = useNavigation<TabToRootNav>();
  const [toolsVisible, setToolsVisible] = useState(false);

  const tools: ToolItem[] = [
    {
      key: 'editor',
      dndIcon: 'pencil-ruler',
      label: 'Modifica personaggio',
      description: 'Correggi nome, statistiche, CA, PF e modificatori',
      onPress: () => {
        setToolsVisible(false);
        navigation.navigate(ROUTES.ALTRO, { screen: ALTRO_ROUTES.MODIFICA_PG });
      },
    },
    {
      key: 'magie',
      dndIcon: 'spell-book',
      label: 'Gestisci magie',
      description: 'Assegna a mano magie da talenti, sottoclasse o altre fonti',
      onPress: () => {
        setToolsVisible(false);
        navigation.navigate(ROUTES.SPELL_ASSIGN);
      },
    },
    {
      key: 'oggetti',
      dndIcon: 'backpack',
      label: 'Gestisci oggetti',
      description: 'Aggiungi o togli oggetti e quantità',
      onPress: () => {
        setToolsVisible(false);
        navigation.navigate(ROUTES.ITEM_ASSIGN);
      },
    },
    {
      key: 'note',
      dndIcon: 'notebook',
      label: 'Note',
      description: 'Segna regole particolari e promemoria del personaggio',
      onPress: () => {
        setToolsVisible(false);
        navigation.navigate(ROUTES.NOTES);
      },
    },
  ];

  return (
    <>
      {dismissed ? (
        /* Riga info compatta: dopo "Ho capito" resta per rileggere tutto */
        <Pressable
          onPress={() => setToolsVisible(true)}
          accessibilityRole="button"
          accessibilityLabel="Rileggi le regole da verificare e apri gli strumenti manuali"
          style={({ pressed }) => [
            {
              flexDirection: 'row',
              alignItems: 'center',
              padding: t.spacing[3],
              backgroundColor: pressed ? t.colors.warningSubtle : t.colors.backgroundSecondary,
              borderWidth: 1,
              borderColor: t.colors.border,
              borderRadius: t.radius.lg,
              gap: t.spacing[3],
            },
            marginBottom != null && { marginBottom },
            s.fullWidth,
          ]}
        >
          <View
            style={[
              s.center,
              { width: 32, height: 32, borderRadius: t.radius.sm, backgroundColor: t.colors.warningSubtle },
            ]}
          >
            <DndIcon name="info" size={18} color={t.colors.warning} />
          </View>
          <Text style={{ fontSize: t.typography.sm, color: t.colors.foregroundSecondary, flex: 1 }}>
            Regole da verificare — rileggi e apri gli strumenti
          </Text>
          <Text style={{ color: t.colors.foregroundTertiary, fontSize: 20 }}>›</Text>
        </Pressable>
      ) : (
        /* Banner informativo completo (chiudibile per PG) */
        <View
          style={[
            {
              backgroundColor: t.colors.warningSubtle,
              borderWidth: 1,
              borderColor: t.colors.warning,
              borderRadius: t.radius.lg,
              padding: t.spacing[4],
              gap: t.spacing[2],
            },
            marginBottom != null && { marginBottom },
            s.fullWidth,
          ]}
        >
          <View style={[s.row, { gap: t.spacing[3], alignItems: 'center' }]}>
            <View
              style={[
                s.center,
                { width: 40, height: 40, borderRadius: t.radius.md, backgroundColor: t.colors.warning },
              ]}
            >
              <DndIcon name="info" size={22} color={t.colors.accentForeground} />
            </View>
            <Text
              style={{
                fontSize: t.typography.md,
                fontWeight: t.typography.bold,
                color: t.colors.foreground,
                flex: 1,
              }}
            >
              Regole da verificare
            </Text>
          </View>

          <Text
            style={{
              fontSize: t.typography.base,
              color: t.colors.foregroundSecondary,
              lineHeight: 22,
            }}
          >
            Alcune regole non sono automatiche (magie da talenti o sottoclasse, bonus
            particolari). Controlla i manuali, la sezione talenti e regola il personaggio con gli strumenti.
          </Text>

          <View style={[s.row, { gap: t.spacing[2], marginTop: t.spacing[1] }]}>
            <Button size="sm" onPress={() => setToolsVisible(true)} style={{ flex: 1 }}>
              Apri gli strumenti
            </Button>
            <Button size="sm" variant="ghost" onPress={onDismiss}>
              Ho capito
            </Button>
          </View>
        </View>
      )}

      {/* Modale con TUTTO il contenuto (per rileggere da qui) */}
      <BottomModal visible={toolsVisible} onClose={() => setToolsVisible(false)}>
        <Text
          style={{
            fontSize: t.typography.lg,
            fontWeight: t.typography.bold,
            color: t.colors.foreground,
            marginBottom: t.spacing[1],
          }}
        >
          Regole da verificare
        </Text>
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
    </>
  );
}
