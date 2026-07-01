import { useCharacterStore } from './useCharacterStore';
import type { Character, ActiveCharacterActions } from '../types';

/**
 * Custom hook that centralizes all character store subscriptions.
 * Returns the active character + all relevant actions in a single call.
 */
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
