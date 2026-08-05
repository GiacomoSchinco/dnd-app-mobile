import { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { TabParamList } from '../../types/navigation';
import { useTokens } from '../../components/ui/prism-provider';
import { Badge } from '../../components/ui/badge';
import Screen from '../../components/custom/Screen';
import ScreenHeader from '../../components/custom/ScreenHeader';
import EmptyState from '../../components/custom/EmptyState';
import ClassAvatar from '../../components/custom/ClassAvatar';
import BottomModal from '../../components/custom/BottomModal';
import { Button } from '../../components/ui/button';
import { getClassNameItalian } from '../../lib/rules/classes';
import { getSkillNameItalian } from '../../lib/rules/skills';
import { getToolLabel } from '../../lib/rules/apply-feat';
import { getAllAbilities } from '../../lib/rules/abilities';
import { ROUTES } from '../../lib/routes';
import { s } from '../../utils/style-helpers';
import { useActiveCharacter } from '../../store/useActiveCharacter';

const SECTIONS = [
  { key: 'stats', icon: '💪', label: 'Caratteristiche', desc: 'FOR, DES, COS, INT, SAG, CAR' },
  { key: 'magie', icon: '🔮', label: 'Incantesimi', desc: 'Slot, preparati e preferiti' },
  { key: 'talenti', icon: '⭐', label: 'Talenti', desc: 'Talenti e abilità speciali' },
  { key: 'note', icon: '📝', label: 'Note', desc: 'Appunti e storia del personaggio' },
];

/** Statistica derivata dell'header (PF, CA, PB, Velocità, Iniz.) */
function StatItem({ label, value }: { label: string; value: string }) {
  const t = useTokens();
  return (
    <View style={s.flex}>
      <Text style={{ fontSize: t.typography.xs, color: t.colors.foregroundTertiary }}>{label}</Text>
      <Text style={{ fontSize: t.typography.base, fontWeight: t.typography.semibold, color: t.colors.foreground }}>
        {value}
      </Text>
    </View>
  );
}

/** Bottone quadrato ± per i punti ferita (attuali/temporanei) */
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

export default function CharacterDetailScreen() {
  const t = useTokens();
  const navigation = useNavigation<BottomTabNavigationProp<TabParamList>>();
  const { activeChar, updateCharacter, deleteCharacter } = useActiveCharacter();
  const [selectedSection, setSelectedSection] = useState<(typeof SECTIONS)[number] | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleSection = (key: string) => {
    if (key === 'magie') navigation.navigate(ROUTES.MAGIE);
    else {
      const sec = SECTIONS.find((x) => x.key === key);
      if (sec) setSelectedSection(sec);
    }
  };

  // ── Gestione punti ferita ───────────────────────────────────
  const changeHp = (delta: number) => {
    if (!activeChar?.hitPoints) return;
    const hp = activeChar.hitPoints;
    updateCharacter(activeChar.id, {
      hitPoints: { ...hp, current: Math.max(0, Math.min(hp.max, hp.current + delta)) },
    });
  };

  const changeTempHp = (delta: number) => {
    if (!activeChar?.hitPoints) return;
    const hp = activeChar.hitPoints;
    updateCharacter(activeChar.id, {
      hitPoints: { ...hp, temporary: Math.max(0, hp.temporary + delta) },
    });
  };

  const handleDelete = () => {
    if (!activeChar) return;
    deleteCharacter(activeChar.id);
    setConfirmDelete(false);
    // Torna alla Home (lista personaggi)
    navigation.navigate(ROUTES.HOME);
  };

  if (!activeChar) {
    return (
      <EmptyState
        emoji="🔮"
        title="Nessun personaggio selezionato"
        message="Apri un personaggio dalla Home per gestire la sua scheda."
      />
    );
  }

  const mainClass = activeChar.classes[0];
  const classLabel = mainClass ? getClassNameItalian(mainClass.className) : '—';

  return (
    <Screen>
      <ScreenHeader
        title="Scheda Personaggio"
        icon="person-outline"
        onBack={() => navigation.navigate(ROUTES.HOME)}
        backLabel="Personaggi"
      />

      {/* Card nome e classe — stile HomeScreen */}
      <View style={[s.fullWidth, s.mb(t.spacing[5]), {
        backgroundColor: t.colors.backgroundSecondary,
        borderRadius: t.radius.lg,
        borderWidth: 1,
        borderColor: t.colors.border,
        padding: t.spacing[5],
      }]}>
        <View style={s.row}>
          <ClassAvatar className={mainClass?.className} size={56} style={{ marginRight: t.spacing[4] }} />
          <View style={s.flex}>
            <Text style={{ fontSize: t.typography.lg, fontWeight: t.typography.bold, color: t.colors.foreground }}>
              {activeChar.name}
            </Text>
            <View style={[s.row, s.gap(t.spacing[1.5]), s.mt(t.spacing[0.5])]}>
              <Badge variant="solid" size="sm" color={t.colors.accent}>
                {classLabel} {activeChar.level}°
              </Badge>
              {activeChar.race && (
                <Badge variant="subtle" size="sm">{activeChar.race}</Badge>
              )}
            </View>
          </View>
        </View>

        {/* Statistiche derivate (popolate da createCharacterFull) */}
        {(activeChar.hitPoints || activeChar.armorClass != null || activeChar.proficiencyBonus != null) && (
          <View style={[s.row, s.gap(t.spacing[3]), s.mt(t.spacing[4]), {
            borderTopWidth: 1,
            borderTopColor: t.colors.border,
            paddingTop: t.spacing[3],
          }]}>
            <StatItem
              label="PF"
              value={activeChar.hitPoints ? `${activeChar.hitPoints.current}/${activeChar.hitPoints.max}` : '—'}
            />
            <StatItem label="CA" value={activeChar.armorClass != null ? String(activeChar.armorClass) : '—'} />
            <StatItem label="PB" value={activeChar.proficiencyBonus != null ? `+${activeChar.proficiencyBonus}` : '—'} />
            <StatItem label="Velocità" value={activeChar.speed != null ? `${activeChar.speed} m` : '—'} />
            <StatItem
              label="Iniz."
              value={activeChar.initiative != null ? `${activeChar.initiative >= 0 ? '+' : ''}${activeChar.initiative}` : '—'}
            />
          </View>
        )}
      </View>

      {/* Sezioni — stesso stile dei pulsanti HomeScreen */}
      <View style={[s.fullWidth, s.gap(t.spacing[3])]}>
        {SECTIONS.map((section) => (
          <Pressable
            key={section.key}
            onPress={() => handleSection(section.key)}
            style={({ pressed }) => ({
              flexDirection: 'row',
              alignItems: 'center',
              padding: t.spacing[4],
              backgroundColor: pressed ? t.colors.accent + '20' : t.colors.backgroundSecondary,
              borderRadius: t.radius.lg,
              borderWidth: 1,
              borderColor: t.colors.border,
            })}
          >
            <View style={{
              width: 48,
              height: 48,
              borderRadius: t.radius.md,
              backgroundColor: t.colors.accent + '18',
              ...s.center,
              marginRight: t.spacing[4],
            }}>
              <Text style={{ fontSize: 22 }}>{section.icon}</Text>
            </View>
            <View style={s.flex}>
              <Text style={{ fontSize: t.typography.base, fontWeight: t.typography.semibold, color: t.colors.foreground }}>
                {section.label}
              </Text>
              <Text style={{ fontSize: t.typography.sm, color: t.colors.foregroundSecondary, marginTop: t.spacing[0.5] }}>
                {section.desc}
              </Text>
            </View>
            <Text style={{ color: t.colors.foregroundTertiary, fontSize: 20 }}>›</Text>
          </Pressable>
        ))}
      </View>

      {/* Eliminazione personaggio */}
      <Button
        variant="danger"
        fullWidth
        onPress={() => setConfirmDelete(true)}
        style={{ marginTop: t.spacing[6] }}
      >
        Elimina personaggio
      </Button>

      {selectedSection && (
        <BottomModal visible={!!selectedSection} onClose={() => setSelectedSection(null)}>
          <Text style={{ fontSize: t.typography.xl, fontWeight: '700', color: t.colors.foreground }}>
            {selectedSection.label}
          </Text>

          {selectedSection.key === 'stats' && (
            <View style={[s.mt(t.spacing[3]), s.gap(t.spacing[4])]}>
              {/* Punti ferita */}
              <View style={{
                backgroundColor: t.colors.backgroundSecondary,
                borderRadius: t.radius.md,
                borderWidth: 1,
                borderColor: t.colors.border,
                padding: t.spacing[4],
                gap: t.spacing[3],
              }}>
                <View style={[s.row, { justifyContent: 'space-between' }]}>
                  <Text style={{ fontSize: t.typography.sm, fontWeight: '600', color: t.colors.foreground }}>
                    Punti Ferita
                  </Text>
                  <Text style={{ fontSize: t.typography.xs, color: t.colors.foregroundTertiary }}>
                    Dadi vita:{' '}
                    {activeChar.hitPoints
                      ? `${activeChar.hitPoints.hitDiceCurrent}/${activeChar.hitPoints.hitDiceMax} × ${activeChar.hitPoints.hitDie}`
                      : '—'}
                  </Text>
                </View>

                {/* Attuali — danno / cura */}
                <View style={[s.row, { justifyContent: 'space-between' }]}>
                  <Text style={{ fontSize: t.typography.sm, color: t.colors.foregroundSecondary }}>Attuali</Text>
                  <View style={[s.row, s.gap(t.spacing[3])]}>
                    <StepperButton onPress={() => changeHp(-1)}>−</StepperButton>
                    <Text style={{ minWidth: 56, textAlign: 'center', fontSize: t.typography.lg, fontWeight: '700', color: t.colors.foreground }}>
                      {activeChar.hitPoints?.current ?? 0}/{activeChar.hitPoints?.max ?? 0}
                    </Text>
                    <StepperButton onPress={() => changeHp(1)}>+</StepperButton>
                  </View>
                </View>

                {/* Temporanei */}
                <View style={[s.row, { justifyContent: 'space-between' }]}>
                  <Text style={{ fontSize: t.typography.sm, color: t.colors.foregroundSecondary }}>Temporanei</Text>
                  <View style={[s.row, s.gap(t.spacing[3])]}>
                    <StepperButton onPress={() => changeTempHp(-1)}>−</StepperButton>
                    <Text style={{ minWidth: 56, textAlign: 'center', fontSize: t.typography.base, fontWeight: '600', color: t.colors.foreground }}>
                      {activeChar.hitPoints?.temporary ?? 0}
                    </Text>
                    <StepperButton onPress={() => changeTempHp(1)}>+</StepperButton>
                  </View>
                </View>
              </View>

              {/* Caratteristiche */}
              <View style={[s.gap(t.spacing[2])]}>
                {getAllAbilities().map((a) => (
                  <View key={a.name} style={[s.row, { justifyContent: 'space-between' }]}>
                    <Text style={{ fontSize: t.typography.sm, color: t.colors.foregroundSecondary }}>
                      {a.nameIt} ({a.abbreviation})
                    </Text>
                    <Text style={{ fontSize: t.typography.sm, fontWeight: '600', color: t.colors.foreground }}>
                      {activeChar.abilities[a.name] ?? 10}
                    </Text>
                  </View>
                ))}
              </View>

              {/* Competenze (skill, strumenti, lingue) — incluse quelle dei talenti */}
              <View style={[s.gap(t.spacing[2])]}>
                <Text style={{ fontSize: t.typography.sm, fontWeight: '600', color: t.colors.foreground }}>
                  Competenze
                </Text>
                {(activeChar.proficiencies?.skills ?? []).length > 0 && (
                  <View style={[s.rowWrap, s.gap(t.spacing[1.5])]}>
                    {(activeChar.proficiencies.skills).map((sk) => (
                      <Badge key={`sk-${sk}`} variant="subtle" size="sm">
                        {getSkillNameItalian(sk)}
                      </Badge>
                    ))}
                  </View>
                )}
                {(activeChar.proficiencies?.tools ?? []).length > 0 && (
                  <View style={[s.rowWrap, s.gap(t.spacing[1.5])]}>
                    {(activeChar.proficiencies.tools).map((tl) => (
                      <Badge key={`tl-${tl}`} variant="subtle" size="sm">
                        {getToolLabel(tl)}
                      </Badge>
                    ))}
                  </View>
                )}
                {(activeChar.proficiencies?.languages ?? []).length > 0 && (
                  <Text style={{ fontSize: t.typography.xs, color: t.colors.foregroundSecondary }}>
                    Lingue: {(activeChar.proficiencies.languages).join(', ')}
                  </Text>
                )}
              </View>

              {/* Risorse (Punti Fortuna, Ira, Ki…) */}
              {activeChar.resources && Object.keys(activeChar.resources).length > 0 && (
                <View style={[s.gap(t.spacing[2])]}>
                  <Text style={{ fontSize: t.typography.sm, fontWeight: '600', color: t.colors.foreground }}>
                    Risorse
                  </Text>
                  {Object.entries(activeChar.resources).map(([key, res]) => (
                    <View key={key} style={[s.row, { justifyContent: 'space-between' }]}>
                      <Text style={{ fontSize: t.typography.sm, color: t.colors.foregroundSecondary }}>
                        {res.label}
                      </Text>
                      <Text style={{ fontSize: t.typography.sm, fontWeight: '600', color: t.colors.foreground }}>
                        {res.current}/{res.max}
                      </Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          )}

          {selectedSection.key === 'talenti' && (
            <View style={{ marginTop: t.spacing[3] }}>
              {(activeChar.feats ?? []).length === 0 ? (
                <Text style={{ fontSize: t.typography.sm, color: t.colors.foregroundSecondary }}>
                  Nessun talento ancora.
                </Text>
              ) : (
                (activeChar.feats ?? []).map((f) => (
                  <View key={f} style={{ marginBottom: t.spacing[3] }}>
                    <Text style={{ fontSize: t.typography.md, fontWeight: '600', color: t.colors.foreground }}>
                      🎖 {f}
                    </Text>
                    {(activeChar.featModifiers ?? [])
                      .filter((m) => m.description)
                      .map((m, i) => (
                        <Text
                          key={i}
                          style={{ fontSize: t.typography.sm, color: t.colors.foregroundSecondary, marginTop: t.spacing[1] }}
                        >
                          • {m.description}
                        </Text>
                      ))}
                    {/* Scelta incantesimi (Iniziato alla Magia) */}
                    {typeof activeChar.choices?.featChoice === 'object' && (
                      <View style={{ marginTop: t.spacing[2], gap: t.spacing[1] }}>
                        <Text style={{ fontSize: t.typography.sm, color: t.colors.foregroundSecondary }}>
                          🔮 Trucchetti: {activeChar.choices.featChoice.cantrips.join(', ')}
                        </Text>
                        <Text style={{ fontSize: t.typography.sm, color: t.colors.foregroundSecondary }}>
                          Incantesimo: {activeChar.choices.featChoice.spells.join(', ')}
                        </Text>
                      </View>
                    )}
                  </View>
                ))
              )}
            </View>
          )}

          {selectedSection.key === 'note' && (
            <Text style={{ fontSize: t.typography.sm, color: t.colors.foregroundSecondary, marginTop: t.spacing[3] }}>
              {activeChar.background ? `Background: ${activeChar.background}` : 'Nessuna nota — sezione in arrivo.'}
            </Text>
          )}
        </BottomModal>
      )}

      {/* Conferma eliminazione */}
      <BottomModal visible={confirmDelete} onClose={() => setConfirmDelete(false)}>
        <Text style={{ fontSize: t.typography.xl, fontWeight: '700', color: t.colors.foreground }}>
          Eliminare &quot;{activeChar.name}&quot;?
        </Text>
        <Text style={{ fontSize: t.typography.sm, color: t.colors.foregroundSecondary, marginTop: t.spacing[2], marginBottom: t.spacing[4] }}>
          Questa azione è irreversibile: il personaggio e tutti i suoi dati verranno rimossi.
        </Text>
        <View style={[s.row, s.gap(t.spacing[3])]}>
          <Button variant="outline" onPress={() => setConfirmDelete(false)} style={{ flex: 1 }}>Annulla</Button>
          <Button variant="danger" onPress={handleDelete} style={{ flex: 1 }}>Elimina</Button>
        </View>
      </BottomModal>
    </Screen>
  );
}
