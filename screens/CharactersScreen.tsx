import { useState } from 'react';
import { ScrollView, View, Text, Pressable, TouchableOpacity, Alert } from 'react-native';
import { useTokens } from '../components/ui/prism-provider';
import ScreenHeader from '../components/custom/ScreenHeader';
import { Button } from '../components/ui/button';
import { spacing, fontSizes, radius } from '../utils/styles';
import { useActiveCharacter } from '../store/useActiveCharacter';
import { ClassName, CLASS_LABELS } from '../components/custom/Spells/types';
import CharacterCreateForm from '../components/custom/CharacterCreateForm';

export default function CharactersScreen() {
  const t = useTokens();
  const { characters, activeCharacterId, setActiveCharacterId, createCharacter, deleteCharacter } = useActiveCharacter();

  const [showCreate, setShowCreate] = useState(false);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: t.colors.background }} showsVerticalScrollIndicator={false}>
      <View style={{ padding: spacing[6], gap: spacing[4] }}>
        <ScreenHeader title="👥 Personaggi" />

        {!showCreate ? (
          <Button onPress={() => setShowCreate(true)} fullWidth>
            + Nuovo personaggio
          </Button>
        ) : (
          <CharacterCreateForm
            onCreate={(name, cls) => { createCharacter(name, cls); setShowCreate(false); }}
            onCancel={() => setShowCreate(false)}
          />
        )}

        {characters.length === 0 ? (
          <View style={{ alignItems: 'center', paddingVertical: spacing[10] }}>
            <Text style={{ fontSize: fontSizes.base, color: t.colors.foregroundSecondary, textAlign: 'center' }}>
              Nessun personaggio ancora.{'\n'}Creane uno per iniziare!
            </Text>
          </View>
        ) : (
          characters.map((char) => {
            const isActive = char.id === activeCharacterId;
            return (
              <Pressable
                key={char.id}
                onPress={() => setActiveCharacterId(char.id)}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  backgroundColor: isActive ? t.colors.accentSubtle : t.colors.card,
                  borderRadius: radius.lg,
                  borderWidth: 1,
                  borderColor: isActive ? t.colors.accent : t.colors.cardBorder,
                  padding: spacing[4],
                }}
              >
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing[2] }}>
                    <Text style={{ fontSize: fontSizes.base, fontWeight: '600', color: t.colors.foreground }}>
                      {char.name}
                    </Text>
                    {isActive && (
                      <View style={{
                        backgroundColor: t.colors.accent,
                        paddingHorizontal: spacing[1.5],
                        paddingVertical: 2,
                        borderRadius: radius.sm,
                      }}>
                        <Text style={{ fontSize: 10, color: t.colors.accentForeground, fontWeight: '600' }}>
                          ATTIVO
                        </Text>
                      </View>
                    )}
                  </View>
                  <Text style={{ fontSize: fontSizes.sm, color: t.colors.foregroundSecondary, marginTop: 2 }}>
                    {CLASS_LABELS[char.class as ClassName] || char.class} · Livello {char.level}
                  </Text>
                  <Text style={{ fontSize: fontSizes.xs, color: t.colors.foregroundTertiary, marginTop: 2 }}>
                    {char.preparedSpells.length} incantesimi preparati · {char.favoriteSpells.length} preferiti
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => {
                    Alert.alert('Elimina personaggio', `Eliminare definitivamente "${char.name}"?`, [
                      { text: 'Annulla', style: 'cancel' },
                      { text: 'Elimina', style: 'destructive', onPress: () => deleteCharacter(char.id) },
                    ]);
                  }}
                  style={{ padding: spacing[2] }}
                >
                  <Text style={{ fontSize: fontSizes.sm, color: t.colors.danger }}>Elimina</Text>
                </TouchableOpacity>
              </Pressable>
            );
          })
        )}
      </View>
    </ScrollView>
  );
}
