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
import { EQUIPMENT_PRESETS_DATA } from '../../lib/rules/equipment-preset';
import type { EquipmentPresetDefinition } from '../../lib/rules/equipment-preset';
import { getClassById } from '../../lib/rules/classes';
import { getBackground } from '../../lib/rules/backgrounds';
import { s } from '../../utils/style-helpers';

function presetTargetName(p: EquipmentPresetDefinition): string {
  if (p.type === 'class') {
    const c = getClassById(p.targetId);
    return c ? c.labelIt : String(p.targetId);
  }
  const b = getBackground(p.targetId);
  return b ? b.name : String(p.targetId);
}

export default function EquipaggiamentoListScreen() {
  const t = useTokens();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  return (
    <CompendiumList<EquipmentPresetDefinition>
      title="Equipaggiamento"
      icon="gear"
      onBack={() => navigation.goBack()}
      items={EQUIPMENT_PRESETS_DATA}
      keyExtractor={(p) => String(p.id)}
      searchPlaceholder="Cerca equipaggiamento..."
      filterBy={(p, q) => presetTargetName(p).toLowerCase().includes(q) || p.description.toLowerCase().includes(q)}
      renderCard={(p, onPress) => (
        <ListItem
          title={presetTargetName(p)}
          onPress={onPress}
          icon={<Text style={{ fontSize: 22 }}>🎒</Text>}
          badges={
            <>
              <Badge variant="solid" size="sm" color={t.colors.accent}>
                {p.type === 'class' ? 'Classe' : 'Background'}
              </Badge>
              <Badge variant="subtle" size="sm">{p.startingGold} mo</Badge>
            </>
          }
        />
      )}
      renderDetail={(p) => (
        <View>
          <CompendiumDetailHeader
            icon={<Text style={{ fontSize: 22 }}>🎒</Text>}
            title={presetTargetName(p)}
            badges={
              <>
                <Badge variant="solid" size="sm" color={t.colors.accent}>{p.type === 'class' ? 'Classe' : 'Background'}</Badge>
                <Badge variant="subtle" size="sm">{p.startingGold} mo</Badge>
              </>
            }
          />
          <Text style={{ fontSize: t.typography.sm, color: t.colors.foregroundSecondary, lineHeight: 20, marginTop: t.spacing[3] }}>
            {p.description}
          </Text>

          <CompendiumSectionTitle>Oggetti ({p.items.length})</CompendiumSectionTitle>
          {p.items.map((it, i) => (
            <DetailBlock key={i}>
              <Text style={{ fontSize: t.typography.sm, fontWeight: '600', color: t.colors.foreground }}>
                {it.quantity > 1 ? `${it.quantity}× ` : ''}{it.name}
              </Text>
            </DetailBlock>
          ))}
        </View>
      )}
    />
  );
}
