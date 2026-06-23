import { useState } from 'react';
import { View, Text, Pressable, TouchableOpacity, Modal, Alert } from 'react-native';
import { useTokens } from '../../ui/prism-provider';
import { Input } from '../../ui/input';
import { Button } from '../../ui/button';
import { spacing, fontSizes, radius } from '../../../utils/styles';
import { Character } from '../../../store/useCharacterStore';
import { ClassName, CLASS_LABELS, ALL_CLASSES } from './types';

type Props = {
  visible: boolean;
  characters: Character[];
  activeCharacterId: string | null;
  onClose: () => void;
  onSelect: (id: string) => void;
  onCreate: (name: string, className: ClassName) => void;
  onDelete: (id: string) => void;
};

export default function CharacterPickerModal({
  visible,
  characters,
  activeCharacterId,
  onClose,
  onSelect,
  onCreate,
  onDelete,
}: Props) {
  const t = useTokens();
  const [mode, setMode] = useState<'pick' | 'create'>('pick');
  const [newCharName, setNewCharName] = useState('');
  const [newCharClass, setNewCharClass] = useState<ClassName>('wizard');

  const handleCreate = () => {
    if (!newCharName.trim()) return;
    onCreate(newCharName.trim(), newCharClass);
    setNewCharName('');
    setMode('pick');
  };

  const handleClose = () => {
    setMode('pick');
    setNewCharName('');
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <Pressable style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', padding: spacing[4] }} onPress={handleClose}>
        <Pressable onPress={() => {}} style={{ backgroundColor: t.colors.card, borderRadius: radius.xl, padding: spacing[6] }}>
          {mode === 'pick' ? (
            <>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing[4] }}>
                <Text style={{ fontSize: fontSizes.lg, fontWeight: '700', color: t.colors.foreground }}>
                  👥 Personaggi
                </Text>
                <TouchableOpacity onPress={() => setMode('create')}>
                  <Text style={{ fontSize: fontSizes.base, color: t.colors.accent, fontWeight: '600' }}>+ Nuovo</Text>
                </TouchableOpacity>
              </View>

              {characters.length === 0 ? (
                <View style={{ alignItems: 'center', paddingVertical: spacing[8] }}>
                  <Text style={{ fontSize: fontSizes.base, color: t.colors.foregroundSecondary, marginBottom: spacing[4], textAlign: 'center' }}>
                    Nessun personaggio ancora.{'\n'}Creane uno per iniziare!
                  </Text>
                  <Button onPress={() => setMode('create')}>+ Crea personaggio</Button>
                </View>
              ) : (
                characters.map((char) => {
                  const isActive = char.id === activeCharacterId;
                  return (
                    <Pressable
                      key={char.id}
                      onPress={() => { onSelect(char.id); handleClose(); }}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        paddingVertical: spacing[3],
                        paddingHorizontal: spacing[3],
                        backgroundColor: isActive ? t.colors.accentSubtle : 'transparent',
                        borderRadius: radius.md,
                        marginBottom: spacing[1],
                      }}
                    >
                      <View>
                        <Text style={{ fontSize: fontSizes.base, fontWeight: '600', color: t.colors.foreground }}>
                          {char.name} {isActive ? '✓' : ''}
                        </Text>
                        <Text style={{ fontSize: fontSizes.sm, color: t.colors.foregroundSecondary }}>
                          {CLASS_LABELS[char.class as ClassName] || char.class} · Livello {char.level}
                        </Text>
                      </View>
                      <TouchableOpacity
                        onPress={() => {
                          Alert.alert('Elimina personaggio', `Eliminare "${char.name}"?`, [
                            { text: 'Annulla', style: 'cancel' },
                            { text: 'Elimina', style: 'destructive', onPress: () => onDelete(char.id) },
                          ]);
                        }}
                      >
                        <Text style={{ fontSize: fontSizes.sm, color: t.colors.danger }}>Elimina</Text>
                      </TouchableOpacity>
                    </Pressable>
                  );
                })
              )}

              <Button variant="ghost" onPress={handleClose} fullWidth style={{ marginTop: spacing[2] }}>Chiudi</Button>
            </>
          ) : (
            <>
              <Text style={{ fontSize: fontSizes.lg, fontWeight: '700', color: t.colors.foreground, marginBottom: spacing[4] }}>
                ✨ Nuovo Personaggio
              </Text>
              <Input
                label="Nome"
                placeholder="Es. Gandalf il Viola"
                value={newCharName}
                onChangeText={setNewCharName}
                style={{ marginBottom: spacing[3] }}
              />
              <Text style={{ fontSize: fontSizes.sm, fontWeight: '600', color: t.colors.foregroundSecondary, marginBottom: spacing[2] }}>
                Classe
              </Text>
              <View style={{ flexDirection: 'row', gap: spacing[1.5], flexWrap: 'wrap', marginBottom: spacing[4] }}>
                {ALL_CLASSES.map((cls) => {
                  const active = newCharClass === cls;
                  return (
                    <TouchableOpacity
                      key={cls}
                      onPress={() => setNewCharClass(cls)}
                      style={{
                        paddingHorizontal: spacing[2.5], paddingVertical: spacing[1.5],
                        borderRadius: radius.full,
                        backgroundColor: active ? t.colors.accent : t.colors.backgroundSecondary,
                        borderWidth: 1, borderColor: active ? 'transparent' : t.colors.border,
                      }}
                    >
                      <Text style={{
                        fontSize: fontSizes.sm,
                        fontWeight: active ? '600' : '400',
                        color: active ? t.colors.accentForeground : t.colors.foreground,
                      }}>
                        {CLASS_LABELS[cls]}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
              <View style={{ flexDirection: 'row', gap: spacing[2] }}>
                <Button variant="ghost" onPress={() => { setMode('pick'); setNewCharName(''); }} style={{ flex: 1 }}>
                  Annulla
                </Button>
                <Button onPress={handleCreate} disabled={!newCharName.trim()} style={{ flex: 1 }}>
                  Crea
                </Button>
              </View>
            </>
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
}
