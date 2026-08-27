import { useCharacterStore } from './useCharacterStore';
import type { ActiveCharacterActions } from '../types';

export function useActiveCharacter(): ActiveCharacterActions {
  const characters = useCharacterStore((s) => s.characters);
  const activeCharacterId = useCharacterStore((s) => s.activeCharacterId);
  const setActiveCharacterId = useCharacterStore((s) => s.setActiveCharacterId);
  const togglePreparedSpell = useCharacterStore((s) => s.togglePreparedSpell);
  const toggleFavoriteSpell = useCharacterStore((s) => s.toggleFavoriteSpell);
  const setSpellBadge = useCharacterStore((s) => s.setSpellBadge);
  const useSpellSlot = useCharacterStore((s) => s.useSpellSlot);
  const recoverSpellSlot = useCharacterStore((s) => s.recoverSpellSlot);
  const restoreSpellSlots = useCharacterStore((s) => s.restoreSpellSlots);
  const addEquipmentItem = useCharacterStore((s) => s.addEquipmentItem);
  const removeEquipmentItem = useCharacterStore((s) => s.removeEquipmentItem);
  const setEquipmentQuantity = useCharacterStore((s) => s.setEquipmentQuantity);
  const toggleEquippedItem = useCharacterStore((s) => s.toggleEquippedItem);
  const addFeatToCharacter = useCharacterStore((s) => s.addFeatToCharacter);
  const removeFeatFromCharacter = useCharacterStore((s) => s.removeFeatFromCharacter);
  const createCharacter = useCharacterStore((s) => s.createCharacter);
  const createCharacterFull = useCharacterStore((s) => s.createCharacterFull);
  const applyLevelUp = useCharacterStore((s) => s.applyLevelUp);
  const deleteCharacter = useCharacterStore((s) => s.deleteCharacter);
  const updateCharacter = useCharacterStore((s) => s.updateCharacter);

  const activeChar = characters.find((c) => c.id === activeCharacterId) ?? null;

  return {
    activeChar,
    characters,
    activeCharacterId,
    setActiveCharacterId,
    togglePreparedSpell,
    toggleFavoriteSpell,
    setSpellBadge,
    useSpellSlot,
    recoverSpellSlot,
    restoreSpellSlots,
    addEquipmentItem,
    removeEquipmentItem,
    setEquipmentQuantity,
    toggleEquippedItem,
    addFeatToCharacter,
    removeFeatFromCharacter,
    createCharacter,
    createCharacterFull,
    applyLevelUp,
    deleteCharacter,
    updateCharacter,
  };
}
