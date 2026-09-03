import { View, Text, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTokens } from '../../components/ui/prism-provider';
import TabHeader from '../../components/custom/TabHeader';
import MissingActiveCharacter from '../../components/custom/MissingActiveCharacter';
import CardBox from '../../components/custom/CardBox';
import CharacterBar from '../../components/custom/Spells/CharacterBar';
import { getFeatByName } from '../../lib/rules/feats';
import { getClassNameItalian, getClass } from '../../lib/rules/classes';
import { useActiveCharacter } from '../../store/useActiveCharacter';
import { s } from '../../utils/style-helpers';
import DndIcon, { type IconName } from '../../components/custom/DndIcon';

/** Raggruppa le feature di classe per livello (ordine di apprendimento) */
function groupClassFeaturesByLevel(features: { level: number; name: string }[]) {
  const groups: { level: number; names: string[] }[] = [];
  for (const f of features) {
    const g = groups.find((x) => x.level === f.level);
    if (g) g.names.push(f.name);
    else groups.push({ level: f.level, names: [f.name] });
  }
  return groups;
}

/** Intestazione di sezione ordinata: titolo uppercase + contatore in badge + nota */
function SectionHeader({ title, count, note }: { title: string; count: number; note?: string }) {
  const t = useTokens();
  return (
    <View style={{ marginBottom: t.spacing[2] }}>
      <View style={[s.row, { justifyContent: 'space-between', alignItems: 'center' }]}>
        <Text
          style={{
            fontSize: t.typography.sm,
            fontWeight: '700',
            color: t.colors.foreground,
            textTransform: 'uppercase',
            letterSpacing: 0.5,
            flex: 1,
          }}
        >
          {title}
        </Text>
        <View
          style={{
            backgroundColor: t.colors.accentSubtle,
            borderRadius: t.radius.full,
            paddingHorizontal: t.spacing[2],
            paddingVertical: t.spacing[0.5],
          }}
        >
          <Text style={{ fontSize: t.typography.xs, fontWeight: '700', color: t.colors.accent }}>{count}</Text>
        </View>
      </View>
      {note ? (
        <Text style={{ fontSize: t.typography.xs, color: t.colors.foregroundTertiary, marginTop: t.spacing[0.5] }}>
          {note}
        </Text>
      ) : null}
    </View>
  );
}

/**
 * Card unificata per talenti/doni/feature di classe/sottoclasse.
 * Gerarchia leggibile: header (icona in box + nome + categoria) → descrizione →
 * blocchi distinti "Effetti" e tabella. Tutto con i token del tema.
 */
function FeatureCard({
  title,
  dndIcon,
  category,
  description,
  effects,
  table,
}: {
  title: string;
  dndIcon: IconName;
  category: string;
  description?: string;
  effects?: string[];
  table?: string;
}) {
  const t = useTokens();
  return (
    <CardBox padding={t.spacing[3]} gap={t.spacing[2]}>
      {/* Header: icona in box + nome + categoria */}
      <View style={[s.row, { alignItems: 'center', gap: t.spacing[2] }]}>
        <View style={[s.box(40, t.radius.sm), { backgroundColor: t.colors.accentSubtle, ...s.center }]}>
          <DndIcon name={dndIcon} size={20} color={t.colors.accent} />
        </View>
        <View style={s.flex}>
          <Text style={{ fontSize: t.typography.md, fontWeight: '700', color: t.colors.foreground, lineHeight: Math.round(20 * (t.scale ?? 1)) }}>
            {title}
          </Text>
          <Text
            style={{
              fontSize: t.typography.xs,
              color: t.colors.foregroundTertiary,
              textTransform: 'uppercase',
              letterSpacing: 0.5,
              marginTop: t.spacing[0.25],
            }}
          >
            {category}
          </Text>
        </View>
      </View>

      {description ? (
        <Text style={{ fontSize: t.typography.sm, color: t.colors.foregroundSecondary, lineHeight: Math.round(20 * (t.scale ?? 1)) }}>
          {description}
        </Text>
      ) : null}

      {effects && effects.length > 0 ? (
        <View
          style={{
            backgroundColor: t.colors.backgroundTertiary,
            borderRadius: t.radius.sm,
            padding: t.spacing[2],
            gap: t.spacing[1],
          }}
        >
          <Text
            style={{
              fontSize: t.typography.xs,
              fontWeight: '700',
              color: t.colors.foregroundTertiary,
              textTransform: 'uppercase',
              letterSpacing: 0.5,
            }}
          >
            Effetti
          </Text>
          {effects.map((e, i) => (
            <Text key={i} style={{ fontSize: t.typography.sm, color: t.colors.foregroundSecondary, lineHeight: Math.round(19 * (t.scale ?? 1)) }}>
              • {e}
            </Text>
          ))}
        </View>
      ) : null}

      {table ? (
        <View style={{ backgroundColor: t.colors.backgroundTertiary, borderRadius: t.radius.sm, padding: t.spacing[2] }}>
          <Text style={{ fontSize: t.typography.sm, color: t.colors.foregroundSecondary, lineHeight: Math.round(18 * (t.scale ?? 1)) }}>{table}</Text>
        </View>
      ) : null}
    </CardBox>
  );
}

/** Card di un talento/dono epico: descrizione + effetti risolti da feats.json */
function FeatCard({ name, dndIcon, category }: { name: string; dndIcon: IconName; category: string }) {
  const feat = getFeatByName(name);
  return (
    <FeatureCard
      title={name}
      dndIcon={dndIcon}
      category={category}
      description={feat?.description}
      effects={(feat?.granted_modifiers ?? [])
        .map((m) => m.description)
        .filter((d): d is string => typeof d === 'string' && d.length > 0)}
    />
  );
}

export default function FeatsScreen() {
  const t = useTokens();
  const insets = useSafeAreaInsets();
  const { activeChar } = useActiveCharacter();

  if (!activeChar) {
    return <MissingActiveCharacter dndIcon="medal" message="Apri un personaggio dalla Home per vedere talenti e caratteristiche." />;
  }

  const mainClass = activeChar.classes[0];
  const classLabel = mainClass ? getClassNameItalian(mainClass.className) : '—';
  const featChoice = typeof activeChar.choices?.featChoice === 'object' ? activeChar.choices.featChoice : null;

  // Info delle feature di classe (descrizione + tabella): prima dal PG, poi classes.json
  const classFeatureInfo = new Map<string, { description?: string; table?: string }>();
  for (const f of activeChar.classFeatures ?? []) {
    classFeatureInfo.set(f.name, { description: f.description, table: f.table });
  }
  for (const f of mainClass ? getClass(mainClass.className)?.features ?? [] : []) {
    if (!classFeatureInfo.has(f.name)) {
      classFeatureInfo.set(f.name, { description: f.description, table: f.table });
    }
  }

  const feats = activeChar.feats ?? [];
  const epicBoons = activeChar.epicBoons ?? [];
  const classFeatures = activeChar.classFeatures ?? [];
  const subclassFeatures = activeChar.subclassFeatures ?? [];
  const featCount = feats.length + (featChoice ? 1 : 0);

  return (
    <View style={[s.flex, { backgroundColor: t.colors.background }]}>
      {/* Header della tab — stessa struttura di Magie e Abilità */}
      <TabHeader title="Talenti e Tratti" icon="star">
        <CharacterBar activeChar={activeChar} spellInformation={false} />
        <Text style={{ fontSize: t.typography.xs, color: t.colors.foregroundTertiary, marginTop: t.spacing[1] }}>
          Talenti, doni, caratteristiche di classe e sottoclasse
        </Text>
      </TabHeader>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: t.spacing[4], paddingBottom: insets.bottom + 88 }}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Talenti ── */}
        <View style={{ marginBottom: t.spacing[5] }}>
          <SectionHeader
            title={`Talenti · ${classLabel}`}
            count={featCount}
            note={featCount === 0 ? undefined : 'Talenti generali e di origine'}
          />
          {featCount === 0 ? (
            <Text style={{ fontSize: t.typography.sm, color: t.colors.foregroundSecondary }}>
              Nessun talento acquisito.
            </Text>
          ) : (
            <View style={{ gap: t.spacing[2.5] }}>
              {feats.map((f) => (
                <FeatCard key={f} name={f} dndIcon="medal" category="Talento" />
              ))}
              {featChoice && (
                <FeatureCard
                  title="Iniziato alla Magia"
                  dndIcon="magic-swirl"
                  category="Talento di origine"
                  description={`Caratteristica da incantatore: ${featChoice.ability}`}
                  effects={[
                    `Trucchetti: ${featChoice.cantrips.join(', ')}`,
                    `Incantesimo: ${featChoice.spells.join(', ')}`,
                  ]}
                />
              )}
            </View>
          )}
        </View>

        {/* ── Doni epici ── */}
        {epicBoons.length > 0 && (
          <View style={{ marginBottom: t.spacing[5] }}>
            <SectionHeader title="Doni epici" count={epicBoons.length} />
            <View style={{ gap: t.spacing[2.5] }}>
              {epicBoons.map((b) => (
                <FeatCard key={b} name={b} dndIcon="laurel-crown" category="Dono epico" />
              ))}
            </View>
          </View>
        )}

        {/* ── Caratteristiche di classe ── */}
        {classFeatures.length > 0 && (
          <View style={{ marginBottom: t.spacing[5] }}>
            <SectionHeader
              title={`Caratteristiche di classe · ${classLabel}`}
              count={classFeatures.length}
            />
            <View style={{ gap: t.spacing[3] }}>
              {groupClassFeaturesByLevel(classFeatures).map(({ level, names }) => (
                <View key={level} style={{ gap: t.spacing[2] }}>
                  {/* Etichetta livello + linea divisoria per separare i gruppi */}
                  <View style={[s.row, { alignItems: 'center', gap: t.spacing[2] }]}>
                    <View
                      style={{
                        backgroundColor: t.colors.backgroundTertiary,
                        borderRadius: t.radius.sm,
                        paddingHorizontal: t.spacing[2],
                        paddingVertical: t.spacing[0.5],
                      }}
                    >
                      <Text style={{ fontSize: t.typography.xs, fontWeight: '700', color: t.colors.foreground }}>
                        Liv. {level}
                      </Text>
                    </View>
                    <View style={{ flex: 1, height: 1, backgroundColor: t.colors.border }} />
                  </View>
                  <View style={{ gap: t.spacing[2.5] }}>
                    {names.map((name) => {
                      const info = classFeatureInfo.get(name);
                      return (
                        <FeatureCard
                          key={name}
                          title={name}
                          dndIcon="sword-wound"
                          category="Classe"
                          description={info?.description}
                          table={info?.table}
                        />
                      );
                    })}
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* ── Sottoclasse ── */}
        {subclassFeatures.length > 0 && (
          <View style={{ marginBottom: t.spacing[4] }}>
            <SectionHeader title={`Sottoclasse · ${mainClass?.subclass ?? ''}`} count={subclassFeatures.length} />
            <View style={{ gap: t.spacing[2.5] }}>
              {subclassFeatures.map((f) => (
                <FeatureCard
                  key={f.name}
                  title={f.name}
                  dndIcon="rosa-shield"
                  category="Sottoclasse"
                  description={f.description}
                />
              ))}
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
