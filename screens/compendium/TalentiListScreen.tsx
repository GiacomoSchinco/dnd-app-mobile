import { View, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { AltroStackParamList } from '../../types/navigation';
import { useTokens } from '../../components/ui/prism-provider';
import { Badge } from '../../components/ui/badge';
import CompendiumList, {
  CompendiumSectionTitle,
  CompendiumRow,
} from '../../components/custom/Compendium/CompendiumList';
import ListItem from '../../components/custom/ListItem';
import { getAllFeats } from '../../lib/rules/feats';
import type { FeatRaw } from '../../types';
import { s } from '../../utils/style-helpers';

const CATEGORY_LABELS: Record<string, string> = {
  origin: 'Origine',
  general: 'Generale',
  epic_boon: 'Boon epico',
  fighting_style: 'Stile di combattimento',
};

const CATEGORY_COLORS: Record<string, string> = {
  origin: '#10B981',
  general: '#3B82F6',
  epic_boon: '#F59E0B',
  fighting_style: '#EC4899',
};

export default function TalentiListScreen() {
  const t = useTokens();
  const navigation = useNavigation<NativeStackNavigationProp<AltroStackParamList>>();
  const feats = getAllFeats();

  return (
    <CompendiumList<FeatRaw>
      title="Talenti"
      icon="d6"
      onBack={() => navigation.goBack()}
      items={feats}
      keyExtractor={(f) => String(f.id)}
      searchPlaceholder="Cerca talento..."
      filterBy={(f, q) => f.name.toLowerCase().includes(q) || (f.name_en || '').toLowerCase().includes(q)}
      renderCard={(f, onPress) => (
        <ListItem
          title={f.name}
          onPress={onPress}
          iconBg={(CATEGORY_COLORS[f.category] || t.colors.accent) + '18'}
          icon={<Text style={{ fontSize: 22 }}>⭐</Text>}
          badges={
            <>
              <Badge variant="solid" size="sm" color={CATEGORY_COLORS[f.category] || t.colors.accent}>
                {CATEGORY_LABELS[f.category] || f.category}
              </Badge>
              {f.level_requirement > 0 && <Badge variant="subtle" size="sm">Liv. {f.level_requirement}+</Badge>}
            </>
          }
        />
      )}
      renderDetail={(f) => (
        <View>
          <Text style={{ fontSize: t.typography.xl, fontWeight: '700', color: t.colors.foreground }}>{f.name}</Text>
          <View style={[s.row, s.gap(t.spacing[1.5]), s.mt(t.spacing[1])]}>
            <Badge variant="solid" size="sm" color={CATEGORY_COLORS[f.category] || t.colors.accent}>
              {CATEGORY_LABELS[f.category] || f.category}
            </Badge>
            {f.level_requirement > 0 && <Badge variant="subtle" size="sm">Richiede livello {f.level_requirement}+</Badge>}
          </View>

          <Text style={{ fontSize: t.typography.sm, color: t.colors.foregroundSecondary, lineHeight: 20, marginTop: t.spacing[3] }}>
            {f.description}
          </Text>

          {f.prerequisites.length > 0 && (
            <>
              <CompendiumSectionTitle>Prerequisiti</CompendiumSectionTitle>
              {f.prerequisites.map((p, i) => (
                <CompendiumRow key={i} label={`${i + 1}.`} value={p.type} />
              ))}
            </>
          )}

          {f.granted_modifiers.length > 0 && (
            <>
              <CompendiumSectionTitle>Effetti</CompendiumSectionTitle>
              {f.granted_modifiers.map((m, i) => (
                <Text key={i} style={{ fontSize: t.typography.xs, color: t.colors.foregroundSecondary, lineHeight: 18, marginTop: t.spacing[1] }}>
                  • {m.description}
                </Text>
              ))}
            </>
          )}
        </View>
      )}
    />
  );
}
