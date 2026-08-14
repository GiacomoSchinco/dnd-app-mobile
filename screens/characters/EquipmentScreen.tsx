import { View, Text, ScrollView, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { TabToRootNav } from '../../types/navigation';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTokens } from '../../components/ui/prism-provider';
import TabHeader from '../../components/custom/TabHeader';
import EmptyState from '../../components/custom/EmptyState';
import CharacterBar from '../../components/custom/Spells/CharacterBar';
import ListItem from '../../components/custom/ListItem';
import { ALTRO_ROUTES } from '../more/altro-routes';
import { useActiveCharacter } from '../../store/useActiveCharacter';
import { s } from '../../utils/style-helpers';

/** Bottone quadrato ± per i conteggi (denaro) */
function StepperButton({ onPress, children }: { onPress: () => void; children: string }) {
  const t = useTokens();
  return (
    <Pressable
      onPress={onPress}
      hitSlop={8}
      style={({ pressed }) => ({
        width: 34,
        height: 34,
        borderRadius: t.radius.sm,
        backgroundColor: pressed ? t.colors.accent : t.colors.accent + '18',
        ...s.center,
      })}
    >
      <Text style={{ fontSize: t.typography.base, fontWeight: '700', color: t.colors.accent }}>{children}</Text>
    </Pressable>
  );
}

/** Riga con etichetta, stepper ± e valore */
function MoneyRow({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (delta: number) => void;
}) {
  const t = useTokens();
  return (
    <View style={[s.row, { justifyContent: 'space-between' }]}>
      <Text style={{ fontSize: t.typography.base, color: t.colors.foreground }}>{label}</Text>
      <View style={[s.row, s.gap(t.spacing[3])]}>
        <StepperButton onPress={() => onChange(-1)}>−</StepperButton>
        <Text style={{ minWidth: 40, textAlign: 'center', fontSize: t.typography.base, fontWeight: '600', color: t.colors.foreground }}>
          {value}
        </Text>
        <StepperButton onPress={() => onChange(1)}>+</StepperButton>
      </View>
    </View>
  );
}

export default function EquipmentScreen() {
  const t = useTokens();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<TabToRootNav>();
  const { activeChar, updateCharacter } = useActiveCharacter();

  if (!activeChar) {
    return (
      <EmptyState
        emoji="🎒"
        title="Nessun personaggio selezionato"
        message="Apri un personaggio dalla Home per vedere il suo equipaggiamento."
      />
    );
  }

  const money = activeChar.money ?? { mo: 0, ma: 0, mr: 0 };
  const equipment = activeChar.equipment ?? [];

  const changeMoney = (key: 'mo' | 'ma' | 'mr', delta: number) => {
    updateCharacter(activeChar.id, {
      money: {
        ...money,
        [key]: Math.max(0, (money[key] ?? 0) + delta),
      },
    });
  };

  const toggleEquipped = (itemId: number) => {
    updateCharacter(activeChar.id, {
      equipment: equipment.map((it) => (it.itemId === itemId ? { ...it, equipped: !it.equipped } : it)),
    });
  };

  return (
    <View style={[s.flex, { backgroundColor: t.colors.background }]}>
      <TabHeader title="Equipaggiamento" icon="bag-handle-outline">
        <CharacterBar activeChar={activeChar} spellInformation={false} />
        <Text style={{ fontSize: t.typography.xs, color: t.colors.foregroundTertiary, marginTop: t.spacing[1] }}>
          Tocca un oggetto per equipaggiarlo/smetterlo
        </Text>
      </TabHeader>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: t.spacing[4], paddingBottom: insets.bottom + 88 }}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Denaro ── */}
        <View
          style={{
            backgroundColor: t.colors.backgroundSecondary,
            borderRadius: t.radius.md,
            borderWidth: 1,
            borderColor: t.colors.border,
            padding: t.spacing[4],
            gap: t.spacing[2],
            marginBottom: t.spacing[5],
          }}
        >
          <Text style={{ fontSize: t.typography.xs, fontWeight: '600', color: t.colors.foregroundTertiary, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: t.spacing[1] }}>
            Denaro
          </Text>
          <MoneyRow label="🪙 Oro (mo)" value={money.mo ?? 0} onChange={(d) => changeMoney('mo', d)} />
          <MoneyRow label="🪙 Argento (ma)" value={money.ma ?? 0} onChange={(d) => changeMoney('ma', d)} />
          <MoneyRow label="🪙 Rame (mr)" value={money.mr ?? 0} onChange={(d) => changeMoney('mr', d)} />
        </View>

        {/* ── Oggetti ── */}
        <Text style={{ fontSize: t.typography.xs, fontWeight: '600', color: t.colors.foregroundTertiary, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: t.spacing[2] }}>
          Oggetti ({equipment.length})
        </Text>

        {equipment.length === 0 ? (
          <Text style={{ fontSize: t.typography.base, color: t.colors.foregroundSecondary, marginBottom: t.spacing[5] }}>
            Nessun oggetto — l'equipaggiamento iniziale viene assegnato in creazione.
          </Text>
        ) : (
          <View
            style={{
              borderRadius: t.radius.lg,
              borderWidth: 1,
              borderColor: t.colors.border,
              backgroundColor: t.colors.backgroundSecondary,
              overflow: 'hidden',
              marginBottom: t.spacing[5],
            }}
          >
            {equipment.map((it, idx) => (
              <Pressable
                key={it.itemId}
                onPress={() => toggleEquipped(it.itemId)}
                style={({ pressed }) => [
                  s.row,
                  { justifyContent: 'space-between', paddingHorizontal: t.spacing[3], paddingVertical: t.spacing[2.5] },
                  idx > 0 && { borderTopWidth: 1, borderTopColor: t.colors.border },
                  pressed && { backgroundColor: t.colors.backgroundTertiary },
                ]}
              >
                <View style={s.row}>
                  <Text style={{ fontSize: t.typography.md, marginRight: t.spacing[2] }}>{it.equipped ? '⚔️' : '🎒'}</Text>
                  <View>
                    <Text style={{ fontSize: t.typography.base, fontWeight: '600', color: t.colors.foreground }}>
                      {it.name}
                    </Text>
                    <Text style={{ fontSize: t.typography.xs, color: t.colors.foregroundTertiary, marginTop: 2 }}>
                      {it.quantity > 1 ? `${it.quantity}× ` : ''}
                      {it.equipped ? 'Equipaggiato' : 'Non equipaggiato'}
                    </Text>
                  </View>
                </View>
                <Text style={{ fontSize: 20, color: it.equipped ? t.colors.accent : t.colors.foregroundTertiary }}>
                  {it.equipped ? '✓' : '○'}
                </Text>
              </Pressable>
            ))}
          </View>
        )}

        {/* ── Link al Compendio (equipaggiamento iniziale) ── */}
        <ListItem
          variant="menu"
          icon={<Text style={{ fontSize: 22 }}>📖</Text>}
          title="Equipaggiamento iniziale"
          description="Consulta i preset di classe e background (Compendio)"
          onPress={() => navigation.navigate(ALTRO_ROUTES.EQUIPAGGIAMENTO)}
        />
      </ScrollView>
    </View>
  );
}
