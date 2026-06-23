import { useCharacterStore, Character } from './useCharacterStore';
import { ClassName } from '../components/custom/Spells/types';

export interface ActiveCharacterActions {
  activeChar: Character | null;
  characters: Character[];
  activeCharacterId: string | null;
  setActiveCharacterId: (id: string | null) => void;
  togglePreparedSpell: (slug: string) => void;
  toggleFavoriteSpell: (slug: string) => void;
  useSpellSlot: (level: number) => void;
  restoreSpellSlots: (level?: number) => void;
  createCharacter: (name: string, className: string, level?: number) => void;
  deleteCharacter: (id: string) => void;
}

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
  };
}
