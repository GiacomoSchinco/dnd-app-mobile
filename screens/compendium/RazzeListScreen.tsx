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
import DetailBlock from '../../components/custom/Compendium/DetailBlock';
import ListItem from '../../components/custom/ListItem';
import { getAllRaces } from '../../lib/rules/races';
import type { RaceDefinition } from '../../lib/rules/races';
import { s } from '../../utils/style-helpers';

export default function RazzeListScreen() {
  const t = useTokens();
  const navigation = useNavigation<NativeStackNavigationProp<AltroStackParamList>>();
  const races = getAllRaces();

  return (
    <CompendiumList<RaceDefinition>
      title="Razze"
      icon="d10"
      onBack={() => navigation.goBack()}
      items={races}
      keyExtractor={(r) => String(r.id)}
      searchPlaceholder="Cerca razza..."
      filterBy={(r, q) => r.name.toLowerCase().includes(q)}
      renderCard={(r, onPress) => (
        <ListItem
          title={r.name}
          onPress={onPress}
          icon={<Text style={{ fontSize: 24 }}>🧝</Text>}
          badges={
            <>
              <Badge variant="solid" size="sm" color={t.colors.accent}>Velocità {r.baseSpeed} {r.speedUnit}</Badge>
              {r.lineages && <Badge variant="subtle" size="sm">Con sottorazze</Badge>}
            </>
          }
        />
      )}
      renderDetail={(r) => (
        <View>
          <Text style={{ fontSize: t.typography.xl, fontWeight: '700', color: t.colors.foreground }}>{r.name}</Text>
          <Text style={{ fontSize: t.typography.sm, color: t.colors.foregroundSecondary, lineHeight: 20, marginTop: t.spacing[2] }}>
            {r.description}
          </Text>

          <CompendiumRow label="Velocità" value={`${r.baseSpeed} ${r.speedUnit}`} />
          <CompendiumRow label="Taglie" value={r.sizeOptions.join(', ')} />

          <CompendiumSectionTitle>Tratti razziali</CompendiumSectionTitle>
          {r.effects.map((e) => (
            <DetailBlock key={e.id} title={e.name}>
              <Text style={{ fontSize: t.typography.xs, color: t.colors.foregroundSecondary, lineHeight: 18, marginTop: t.spacing[1] }}>
                {e.description}
              </Text>
            </DetailBlock>
          ))}

          {r.lineages && (
            <>
              <CompendiumSectionTitle>Sottorazze</CompendiumSectionTitle>
              {r.lineages.map((l) => (
                <DetailBlock key={l.id} title={l.name}>
                  {l.effects.map((e) => (
                    <Text key={e.id} style={{ fontSize: t.typography.xs, color: t.colors.foregroundSecondary, marginTop: t.spacing[1] }}>
                      • {e.name} — {e.description}
                    </Text>
                  ))}
                </DetailBlock>
              ))}
            </>
          )}
        </View>
      )}
    />
  );
}
