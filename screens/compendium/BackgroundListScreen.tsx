import { View, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../types/navigation';
import { useTokens } from '../../components/ui/prism-provider';
import { Badge } from '../../components/ui/badge';
import CompendiumList, {
  CompendiumSectionTitle,
  CompendiumRow,
  CompendiumDetailHeader,
} from '../../components/custom/Compendium/CompendiumList';
import ListItem from '../../components/custom/ListItem';
import { getAllBackgrounds } from '../../lib/rules/backgrounds';
import type { BackgroundDefinition } from '../../lib/rules/backgrounds';
import { getSkillNameItalian } from '../../lib/rules/skills';
import { s } from '../../utils/style-helpers';

export default function BackgroundListScreen() {
  const t = useTokens();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const backgrounds = getAllBackgrounds();

  return (
    <CompendiumList<BackgroundDefinition>
      title="Background"
      icon="d8"
      onBack={() => navigation.goBack()}
      items={backgrounds}
      keyExtractor={(b) => String(b.id)}
      searchPlaceholder="Cerca background..."
      filterBy={(b, q) => b.name.toLowerCase().includes(q)}
      renderCard={(b, onPress) => (
        <ListItem
          title={b.name}
          onPress={onPress}
          icon={<Text style={{ fontSize: 24 }}>📜</Text>}
          badges={
            <>
              <Badge variant="solid" size="sm" color={t.colors.accent}>
                {b.skills.length} perizie
              </Badge>
              {b.feat.name && <Badge variant="subtle" size="sm">{b.feat.name}</Badge>}
            </>
          }
        />
      )}
      renderDetail={(b) => (
        <View>
          <CompendiumDetailHeader
            icon={<Text style={{ fontSize: 24 }}>📜</Text>}
            title={b.name}
            badges={b.feat.name ? <Badge variant="solid" size="sm" color={t.colors.accent}>{b.feat.name}</Badge> : undefined}
          />
          <Text style={{ fontSize: t.typography.sm, color: t.colors.foregroundSecondary, lineHeight: 20, marginTop: t.spacing[3] }}>
            {b.description}
          </Text>

          <CompendiumSectionTitle>Bonus</CompendiumSectionTitle>
          <CompendiumRow label="Punteggi abilità" value={b.abilityScoreBoosts.allowedScores.join(', ') || '—'} />
          <CompendiumRow label="Perizie" value={b.skills.map((sk) => getSkillNameItalian(sk)).join(', ') || '—'} />
          <CompendiumRow
            label="Attrezzi"
            value={b.toolProficiency.type === 'CHOICE' ? `a scelta (${b.toolProficiency.category || 'strumenti'})` : (b.toolProficiency.toolId || '—')}
          />
        </View>
      )}
    />
  );
}
