import { useState } from 'react';
import { View, Text, ScrollView, Pressable, Keyboard } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../types/navigation';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTokens } from '../../components/ui/prism-provider';
import ScreenHeader from '../../components/custom/ScreenHeader';
import BackButton from '../../components/custom/BackButton';
import MissingActiveCharacter from '../../components/custom/MissingActiveCharacter';
import SectionBlock from '../../components/custom/SectionBlock';
import CircleCheck from '../../components/custom/CircleCheck';
import ListCard from '../../components/custom/ListCard';
import CharacterBar from '../../components/custom/Spells/CharacterBar';
import DndIcon from '../../components/custom/DndIcon';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { useActiveCharacter } from '../../store/useActiveCharacter';
import { s } from '../../utils/style-helpers';

let noteCounter = 0;
function noteId(): string {
  noteCounter += 1;
  return `nota_${Date.now()}_${noteCounter}`;
}

export default function NotesScreen() {
  const t = useTokens();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { activeChar, updateCharacter } = useActiveCharacter();
  const [draft, setDraft] = useState('');

  if (!activeChar) {
    return <MissingActiveCharacter dndIcon="notebook" message="Apri un personaggio dalla Home per prendere appunti." />;
  }

  const notes = activeChar.notesList ?? [];

  const addNote = () => {
    const text = draft.trim();
    if (!text) return;
    updateCharacter(activeChar.id, {
      notesList: [...notes, { id: noteId(), text, done: false }],
    });
    setDraft('');
    Keyboard.dismiss();
  };

  const toggleNote = (id: string) => {
    updateCharacter(activeChar.id, {
      notesList: notes.map((n) => (n.id === id ? { ...n, done: !n.done } : n)),
    });
  };

  const deleteNote = (id: string) => {
    updateCharacter(activeChar.id, {
      notesList: notes.filter((n) => n.id !== id),
    });
  };

  const doneCount = notes.filter((n) => n.done).length;

  return (
    <View style={[s.flex, { backgroundColor: t.colors.background }]}>
      {/* Header fisso con safe-area — stessa struttura delle altre pagine pushed */}
      <View
        style={{
          paddingTop: insets.top + t.spacing[3],
          paddingHorizontal: t.spacing[4],
          paddingBottom: t.spacing[2],
        }}
      >
        <BackButton onPress={() => navigation.goBack()} label="Scheda Personaggio" />
        <ScreenHeader title="Note" icon="document-text-outline" />
      </View>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: t.spacing[4], paddingBottom: insets.bottom + 90 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <CharacterBar activeChar={activeChar} spellInformation={false} />

        {/* ── Aggiungi appunto ── */}
        <SectionBlock title="Nuovo appunto" marginBottom={t.spacing[5]}>
          <Input
            size="lg"
            value={draft}
            onChangeText={setDraft}
            placeholder="Scrivi un appunto… (es. nemico Goblin capo ha 3 tesori)"
            multiline
            textAlignVertical="top"
            onSubmitEditing={addNote}
          />
          <Button variant="solid" size="md" fullWidth style={{ marginTop: t.spacing[3] }} onPress={addNote}>
            + Aggiungi
          </Button>
        </SectionBlock>

        {/* ── Todo-list ── */}
        <SectionBlock
          title={`Appunti (${notes.length})`}
          right={notes.length > 0 ? `${doneCount}/${notes.length} completati` : undefined}
        >

        {notes.length === 0 ? (
          <View style={{ paddingVertical: t.spacing[8], alignItems: 'center', gap: t.spacing[2] }}>
            <DndIcon name="notebook" size={32} color={t.colors.accent} />
            <Text style={{ fontSize: t.typography.base, color: t.colors.foregroundSecondary, textAlign: 'center' }}>
              Nessun appunto ancora.
              {'\n'}Aggiungi il primo mentre giochi!
            </Text>
          </View>
        ) : (
          <ListCard>
            {notes.map((note, idx) => (
              <View
                key={note.id}
                style={[
                  s.row,
                  { gap: t.spacing[2], paddingHorizontal: t.spacing[3], paddingVertical: t.spacing[2.5] },
                  idx > 0 && { borderTopWidth: 1, borderTopColor: t.colors.border },
                ]}
              >
                {/* Toggle completato */}
                <CircleCheck checked={note.done} onPress={() => toggleNote(note.id)} />

                {/* Testo */}
                <Pressable onPress={() => toggleNote(note.id)} style={s.flex}>
                  <Text
                    style={{
                      fontSize: t.typography.base,
                      color: note.done ? t.colors.foregroundTertiary : t.colors.foreground,
                      textDecorationLine: note.done ? 'line-through' : 'none',
                      lineHeight: 21,
                    }}
                  >
                    {note.text}
                  </Text>
                </Pressable>

                {/* Elimina */}
                <Pressable
                  onPress={() => deleteNote(note.id)}
                  hitSlop={8}
                  style={({ pressed }) => ({
                    width: 26,
                    height: 26,
                    borderRadius: 13,
                    borderWidth: 2,
                    borderColor: t.colors.danger,
                    backgroundColor: 'transparent',
                    ...s.center,
                    opacity: pressed ? 0.5 : 0.85,
                  })}
                >
                  <Text style={{ color: t.colors.danger, fontSize: t.typography.sm, fontWeight: '700' }}>✕</Text>
                </Pressable>
              </View>
            ))}
          </ListCard>
        )}
        </SectionBlock>
      </ScrollView>
    </View>
  );
}
