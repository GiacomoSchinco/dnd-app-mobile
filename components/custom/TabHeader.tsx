import type { ReactNode } from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTokens } from '../ui/prism-provider';
import ScreenHeader from './ScreenHeader';

type Props = {
  title: string;
  icon?: keyof typeof Ionicons.glyphMap;
  /** Icona custom (es. DndIcon SVG): ha precedenza su `icon` */
  iconNode?: ReactNode;
  onBack?: () => void;
  backLabel?: string;
  /** Contenuto sotto l'header (CharacterBar, filtri…): NON scrolla con la lista */
  children?: ReactNode;
};

/**
 * Header fisso delle tab con safe-area: applica il padding sicuro (notch in alto +
 * padding orizzontale) e mostra `ScreenHeader` + contenuto opzionale sotto.
 * Usato dalle schermate tab con lista scrollabile sotto l'header fisso
 * (es. SkillsScreen, SpellsScreen).
 */
export default function TabHeader({ title, icon, iconNode, onBack, backLabel, children }: Props) {
  const t = useTokens();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={{
        paddingTop: insets.top + t.spacing[4],
        paddingHorizontal: t.spacing[4],
        paddingBottom: t.spacing[2],
      }}
    >
      <ScreenHeader title={title} icon={icon} iconNode={iconNode} onBack={onBack} backLabel={backLabel} />
      {children}
    </View>
  );
}
