import { View, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../types/navigation';
import { useTokens } from '../../components/ui/prism-provider';
import { Badge } from '../../components/ui/badge';
import CompendiumList, {
  CompendiumSectionTitle,
  CompendiumDetailHeader,
} from '../../components/custom/Compendium/CompendiumList';
import DetailBlock from '../../components/custom/Compendium/DetailBlock';
import ListItem from '../../components/custom/ListItem';
import DndIcon from '../../components/custom/DndIcon';
import { getAllRaces } from '../../lib/rules/races';
import type { RaceDefinition } from '../../lib/rules/races';
import { s } from '../../utils/style-helpers';

export default function RazzeListScreen() {
  const t = useTokens();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const races = getAllRaces();

  return (
    <CompendiumList<RaceDefinition>
      title="Razze"
      icon="person"
      onBack={() => navigation.goBack()}
      items={races}
      keyExtractor={(r) => String(r.id)}
      searchPlaceholder="Cerca razza..."
      filterBy={(r, q) => r.name.toLowerCase().includes(q)}
      renderCard={(r, onPress) => (
        <ListItem
          title={r.name}
          onPress={onPress}
          icon={<DndIcon name="person" size={20} color={t.colors.accent} />}
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
          <CompendiumDetailHeader
            icon={<DndIcon name="person" size={20} color={t.colors.accent} />}
            title={r.name}
            badges={
              <>
                <Badge variant="solid" size="sm" color={t.colors.accent}>{r.sizeOptions.join(' / ')}</Badge>
                <Badge variant="subtle" size="sm">Velocità {r.baseSpeed} {r.speedUnit}</Badge>
              </>
            }
          />
          <Text style={{ fontSize: t.typography.sm, color: t.colors.foregroundSecondary, lineHeight: 20, marginTop: t.spacing[3] }}>
            {r.description}
          </Text>

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
                    <View key={e.id} style={{ marginTop: t.spacing[2] }}>
                      <Text style={{ fontSize: t.typography.xs, fontWeight: '700', color: t.colors.foreground }}>{e.name}</Text>
                      <Text style={{ fontSize: t.typography.xs, color: t.colors.foregroundSecondary, lineHeight: 17, marginTop: t.spacing[0.5] }}>
                        {e.description}
                      </Text>
                    </View>
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
