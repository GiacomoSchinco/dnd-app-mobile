import { useCharacterStore } from './useCharacterStore';
import type { ActiveCharacterActions } from '../types';

export function useActiveCharacter(): ActiveCharacterActions {
  const characters = useCharacterStore((s) => s.characters);
  const activeCharacterId = useCharacterStore((s) => s.activeCharacterId);
  const setActiveCharacterId = useCharacterStore((s) => s.setActiveCharacterId);
  const togglePreparedSpell = useCharacterStore((s) => s.togglePreparedSpell);
  const toggleFavoriteSpell = useCharacterStore((s) => s.toggleFavoriteSpell);
  const useSpellSlot = useCharacterStore((s) => s.useSpellSlot);
  const restoreSpellSlots = useCharacterStore((s) => s.restoreSpellSlots);
  const createCharacter = useCharacterStore((s) => s.createCharacter);
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
    useSpellSlot,
    restoreSpellSlots,
    createCharacter,
    deleteCharacter,
    updateCharacter,
  };
}
