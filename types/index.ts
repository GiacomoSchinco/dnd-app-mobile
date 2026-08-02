/**
 * Barrel dei tipi — fonte canonica organizzata per argomento.
 * Ogni argomento ha il suo file (ability, skill, class, spell, item, ...).
 * Le regole in `lib/rules/*` importano da qui tramite `../../types`.
 */
export * from './ability';
export * from './skill';
export * from './class';
export * from './subclass';
export * from './background';
export * from './race';
export * from './effects';
export * from './feat';
export * from './progression';
export * from './equipment';
export * from './item';
export * from './spell';
export * from './spellcasting';
export * from './dice';
export * from './character';
