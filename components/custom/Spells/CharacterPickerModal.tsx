import { useState } from 'react';
import { View, Text, Pressable, TouchableOpacity, Modal, Alert } from 'react-native';
import { useTokens } from '../../ui/prism-provider';
import { Button } from '../../ui/button';
import { s } from '../../../utils/style-helpers';
import type { Character, ClassName } from '../../../types';
import { CLASS_LABELS } from './types';
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
      <Pressable style={[s.flex, { backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', padding: t.spacing[4] }]} onPress={handleClose}>
        <Pressable onPress={() => {}} style={{ backgroundColor: t.colors.card, borderRadius: t.radius.xl, padding: t.spacing[6] }}>
          {mode === 'pick' ? (
            <>
              <View style={[s.row, { justifyContent: 'space-between' }, s.mb(t.spacing[4])]}>
                <Text style={{ fontSize: t.typography.lg, fontWeight: '700', color: t.colors.foreground }}>
                  👥 Personaggi
                </Text>
                <TouchableOpacity onPress={() => setMode('create')}>
                  <Text style={{ fontSize: t.typography.base, color: t.colors.accent, fontWeight: '600' }}>+ Nuovo</Text>
                </TouchableOpacity>
              </View>

              {characters.length === 0 ? (
                <View style={[s.center, s.py(t.spacing[8])]}>
                  <Text style={{ fontSize: t.typography.base, color: t.colors.foregroundSecondary, marginBottom: t.spacing[4], textAlign: 'center' }}>
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
                      style={[s.row, { justifyContent: 'space-between', paddingVertical: t.spacing[3], paddingHorizontal: t.spacing[3], backgroundColor: isActive ? t.colors.accentSubtle : 'transparent', borderRadius: t.radius.md, marginBottom: t.spacing[1] }]}
                    >
                      <View>
                        <Text style={{ fontSize: t.typography.base, fontWeight: '600', color: t.colors.foreground }}>
                          {char.name} {isActive ? '✓' : ''}
                        </Text>
                        <Text style={{ fontSize: t.typography.sm, color: t.colors.foregroundSecondary }}>
                          {CLASS_LABELS[char.classes?.[0]?.className] || char.classes?.[0]?.className} · Livello {char.level}
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
                        <Text style={{ fontSize: t.typography.sm, color: t.colors.danger }}>Elimina</Text>
                      </TouchableOpacity>
                    </Pressable>
                  );
                })
              )}

              <Button variant="ghost" onPress={handleClose} fullWidth style={s.mt(t.spacing[2])}>Chiudi</Button>
            </>
          ) : (
            <CharacterCreateForm onCreate={handleCreate} onCancel={() => setMode('pick')} />
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
}
