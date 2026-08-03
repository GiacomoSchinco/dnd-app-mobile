import { useCallback, useState } from 'react';
import { View, Text, Pressable, BackHandler } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useTokens } from '../../components/ui/prism-provider';
import { s } from '../../utils/style-helpers';
import Screen from '../../components/custom/Screen';
import ScreenHeader from '../../components/custom/ScreenHeader';
import DndIcon from '../../components/custom/DndIcon';
import SettingsScreen from './SettingsScreen';
import CompendioScreen from '../compendium/CompendioScreen';

type SectionKey = 'impostazioni' | 'compendio';

interface AltroItem {
  key: SectionKey;
  label: string;
  icon: string;
  description: string;
}

const ITEMS: AltroItem[] = [
  { key: 'impostazioni', label: 'Impostazioni', icon: 'divination', description: 'Temi, info app' },
  { key: 'compendio', label: 'Compendio', icon: 'd12', description: 'Regole, classi, magie e altro' },
];

export default function MoreScreen() {
  const t = useTokens();
  const [activeSection, setActiveSection] = useState<SectionKey | null>(null);

  // Riaprendo la tab "Altro" si torna sempre al menu (lo stato interno non persiste)
  useFocusEffect(
    useCallback(() => {
      setActiveSection(null);
    }, []),
  );

  // Con una sezione interna aperta, il back del telefono torna al menu di "Altro"
  useFocusEffect(
    useCallback(() => {
      if (!activeSection) return;
      const sub = BackHandler.addEventListener('hardwareBackPress', () => {
        setActiveSection(null);
        return true;
      });
      return () => sub.remove();
    }, [activeSection]),
  );

  if (activeSection === 'compendio') {
    return (
      <CompendioScreen onBack={() => setActiveSection(null)} />
    );
  }

  if (activeSection === 'impostazioni') {
    return (
      <SettingsScreen onBack={() => setActiveSection(null)} />
    );
  }

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
            onPress={() => setActiveSection(item.key)}
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
