import { useState } from 'react';
import { View, Text, Pressable, TouchableOpacity, Modal, Alert } from 'react-native';
import { useTokens } from '../../ui/prism-provider';
import { Button } from '../../ui/button';
import { spacing, fontSizes, radius } from '../../../utils/styles';
import { Character } from '../../../store/useCharacterStore';
import { ClassName, CLASS_LABELS } from './types';
import CharacterCreateForm from '../CharacterCreateForm';

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

  const handleClose = () => {
    setMode('pick');
    onClose();
  };

  const handleCreate = (name: string, className: ClassName) => {
    onCreate(name, className);
    setMode('pick');
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
            <CharacterCreateForm onCreate={handleCreate} onCancel={() => setMode('pick')} />
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
}
