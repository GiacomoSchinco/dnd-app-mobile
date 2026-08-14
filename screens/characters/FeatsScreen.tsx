import { View, Text, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTokens } from '../../components/ui/prism-provider';
import TabHeader from '../../components/custom/TabHeader';
import EmptyState from '../../components/custom/EmptyState';
import CharacterBar from '../../components/custom/Spells/CharacterBar';
import { getFeatByName } from '../../lib/rules/feats';
import { getClassNameItalian, getClass } from '../../lib/rules/classes';
import { useActiveCharacter } from '../../store/useActiveCharacter';
import { s } from '../../utils/style-helpers';

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

/** Sezione con titolo minuscolo (stile coerente col resto dell'app) */
function SectionTitle({ children }: { children: React.ReactNode }) {
  const t = useTokens();
  return (
    <Text
      style={{
        fontSize: t.typography.xs,
        fontWeight: '600',
        color: t.colors.foregroundTertiary,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: t.spacing[2],
      }}
    >
      {children}
    </Text>
  );
}

/** Card con il testo (regole sempre leggibili) */
function InfoCard({ icon, title, subtitle, children }: { icon?: string; title: string; subtitle?: string; children?: React.ReactNode }) {
  const t = useTokens();
  return (
    <View
      style={{
        backgroundColor: t.colors.backgroundSecondary,
        borderRadius: t.radius.md,
        borderWidth: 1,
        borderColor: t.colors.border,
        padding: t.spacing[3],
        gap: t.spacing[1.5],
      }}
    >
      <View style={[s.row, s.gap(t.spacing[2]), { alignItems: 'flex-start' }]}>
        {icon ? <Text style={{ fontSize: t.typography.md }}>{icon}</Text> : null}
        <View style={s.flex}>
          <Text style={{ fontSize: t.typography.md, fontWeight: '600', color: t.colors.foreground, lineHeight: 21 }}>
            {title}
          </Text>
          {subtitle ? (
            <Text style={{ fontSize: t.typography.sm, color: t.colors.foregroundSecondary, marginTop: t.spacing[0.5] }}>
              {subtitle}
            </Text>
          ) : null}
        </View>
      </View>
      {children}
    </View>
  );
}

/** Dettaglio di un singolo talento/dono: descrizione + effetti */
function FeatCard({ name, icon }: { name: string; icon: string }) {
  const t = useTokens();
  const feat = getFeatByName(name);
  return (
    <InfoCard icon={icon} title={name}>
      {feat ? (
        <>
          <Text style={{ fontSize: t.typography.sm, color: t.colors.foregroundSecondary, lineHeight: 20 }}>
            {feat.description}
          </Text>
          {feat.granted_modifiers.filter((m) => m.description).map((m, i) => (
            <Text key={i} style={{ fontSize: t.typography.sm, color: t.colors.foregroundSecondary, lineHeight: 19, marginLeft: t.spacing[2] }}>
              • {m.description}
            </Text>
          ))}
        </>
      ) : (
        <Text style={{ fontSize: t.typography.sm, color: t.colors.foregroundTertiary }}>
          Descrizione non disponibile.
        </Text>
      )}
    </InfoCard>
  );
}

export default function FeatsScreen() {
  const t = useTokens();
  const insets = useSafeAreaInsets();
  const { activeChar } = useActiveCharacter();

  if (!activeChar) {
    return (
      <EmptyState
        emoji="🎖️"
        title="Nessun personaggio selezionato"
        message="Apri un personaggio dalla Home per vedere talenti e caratteristiche."
      />
    );
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

  const hasFeats = (activeChar.feats ?? []).length > 0;
  const hasEpicBoons = (activeChar.epicBoons ?? []).length > 0;
  const hasClassFeatures = (activeChar.classFeatures ?? []).length > 0;
  const hasSubclassFeatures = (activeChar.subclassFeatures ?? []).length > 0;

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
          <SectionTitle>Talenti · {classLabel}</SectionTitle>
          {!hasFeats && !featChoice ? (
            <Text style={{ fontSize: t.typography.sm, color: t.colors.foregroundSecondary }}>
              Nessun talento acquisito.
            </Text>
          ) : (
            <View style={{ gap: t.spacing[2.5] }}>
              {(activeChar.feats ?? []).map((f) => (
                <FeatCard key={f} name={f} icon="🎖️" />
              ))}
              {featChoice && (
                <InfoCard icon="🔮" title="Iniziato alla Magia" subtitle={`Caratteristica da incantatore: ${featChoice.ability}`}>
                  <Text style={{ fontSize: t.typography.sm, color: t.colors.foregroundSecondary, lineHeight: 19 }}>
                    Trucchetti: {featChoice.cantrips.join(', ')}
                  </Text>
                  <Text style={{ fontSize: t.typography.sm, color: t.colors.foregroundSecondary, lineHeight: 19 }}>
                    Incantesimo: {featChoice.spells.join(', ')}
                  </Text>
                </InfoCard>
              )}
            </View>
          )}
        </View>

        {/* ── Doni epici ── */}
        {hasEpicBoons && (
          <View style={{ marginBottom: t.spacing[5] }}>
            <SectionTitle>Doni epici</SectionTitle>
            <View style={{ gap: t.spacing[2.5] }}>
              {(activeChar.epicBoons ?? []).map((b) => (
                <FeatCard key={b} name={b} icon="🏆" />
              ))}
            </View>
          </View>
        )}

        {/* ── Caratteristiche di classe ── */}
        {hasClassFeatures && (
          <View style={{ marginBottom: t.spacing[5] }}>
            <SectionTitle>Caratteristiche di classe</SectionTitle>
            <View style={{ gap: t.spacing[3] }}>
              {groupClassFeaturesByLevel(activeChar.classFeatures ?? []).map(({ level, names }) => (
                <View key={level}>
                  <Text
                    style={{
                      fontSize: t.typography.xs,
                      fontWeight: '700',
                      color: t.colors.foregroundTertiary,
                      textTransform: 'uppercase',
                      letterSpacing: 0.5,
                      marginBottom: t.spacing[1.5],
                    }}
                  >
                    Livello {level}
                  </Text>
                  <View style={{ gap: t.spacing[2.5] }}>
                    {names.map((name) => {
                      const info = classFeatureInfo.get(name);
                      return (
                        <InfoCard key={name} title={name} icon="⚔️">
                          {info?.description ? (
                            <Text style={{ fontSize: t.typography.sm, color: t.colors.foregroundSecondary, lineHeight: 20 }}>
                              {info.description}
                            </Text>
                          ) : null}
                          {info?.table ? (
                            <View
                              style={{
                                padding: t.spacing[2],
                                borderRadius: t.radius.sm,
                                backgroundColor: t.colors.backgroundTertiary,
                              }}
                            >
                              <Text style={{ fontSize: t.typography.sm, color: t.colors.foregroundSecondary, lineHeight: 18 }}>
                                {info.table}
                              </Text>
                            </View>
                          ) : null}
                        </InfoCard>
                      );
                    })}
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* ── Sottoclasse ── */}
        {hasSubclassFeatures && (
          <View style={{ marginBottom: t.spacing[4] }}>
            <SectionTitle>Sottoclasse · {mainClass?.subclass ?? ''}</SectionTitle>
            <View style={{ gap: t.spacing[2.5] }}>
              {(activeChar.subclassFeatures ?? []).map((f) => (
                <InfoCard key={f.name} title={f.name} icon="🛡️">
                  <Text style={{ fontSize: t.typography.sm, color: t.colors.foregroundSecondary, lineHeight: 20 }}>
                    {f.description}
                  </Text>
                </InfoCard>
              ))}
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
