/**
 * class-tokens.ts — Immagini token delle classi (assets/classes/token_*.png).
 *
 * Nota: le `require` devono essere statiche per Metro, quindi usiamo una mappa esplicita
 * (niente stringhe dinamiche tipo `require('../assets/classes/token_' + name + '.png')`).
 */

const CLASS_TOKENS: Record<string, number> = {
  barbarian: require('../assets/classes/token_barbarian.png'),
  bard: require('../assets/classes/token_bard.png'),
  cleric: require('../assets/classes/token_cleric.png'),
  druid: require('../assets/classes/token_druid.png'),
  fighter: require('../assets/classes/token_fighter.png'),
  monk: require('../assets/classes/token_monk.png'),
  paladin: require('../assets/classes/token_paladin.png'),
  ranger: require('../assets/classes/token_ranger.png'),
  rogue: require('../assets/classes/token_rogue.png'),
  sorcerer: require('../assets/classes/token_sorcerer.png'),
  warlock: require('../assets/classes/token_warlock.png'),
  wizard: require('../assets/classes/token_wizard.png'),
};

/** Ritorna l'immagine token per una classe (o undefined se sconosciuta) */
export function getClassToken(className?: string): number | undefined {
  return className ? CLASS_TOKENS[className] : undefined;
}
