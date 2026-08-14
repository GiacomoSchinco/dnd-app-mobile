# 🐉 DungeonCraft — Resoconto Progetto (dnd-app-mobile)

> **Scopo di questo file**: dare un resoconto immediato e aggiornato di *cosa fa* il
> progetto, dell'architettura e dello stato attuale. Aggiornare questo file quando
> cambiano funzionalità o struttura. Guida operativa dettagliata: vedi `APPUNTI.md`.

## 📌 Cos'è

App **mobile (React Native / Expo) + Web** per gestire schede personaggio di
**D&D 5.5e (ed. 2024, in italiano)**. Include:

- **Creazione guidata personaggi** (wizard multi-step) con regole reali 5.5e.
- **Scheda del personaggio** completa: PF, caratteristiche, risorse, talenti, note.
- **Tabelle magie** del PG (preparate/assegnate) con consumo slot incantesimi.
- **Tab Abilità** del PG (18 skill con competenze/maestrie).
- **Compendio**: classi, razze, background, talenti, equipaggiamento, oggetti, magie.
- **Lanciatore di dadi** globale (overlay sopra tutto) con breakdown dei risultati.
- **Temi fantasy** commutabili (chiaro/scuro) dalle Impostazioni.

## 🧱 Stack tecnico

| Area | Scelta |
|---|---|
| Framework | **Expo SDK 54** + React Native 0.81.5 |
| Linguaggio | **TypeScript ~5.9** |
| Navigazione | React Navigation 6 (native-stack + bottom-tabs) |
| Stato | **Zustand 5** + persistenza (`store/file-system-storage.ts`; web → `localStorage`) |
| Animazioni | Reanimated 4 + react-native-worklets + gesture-handler + reanimated-carousel v5 |
| Icone | `DndIcon` con SVG custom (`assets/icon/**`, react-native-svg + svg-transformer) + Ionicons |
| Tema/UI | **Prism UI custom** (`components/ui/`): `useTokens()`, 6 temi, Button/Card/Badge/Input/Modal |
| Storage | `expo-file-system` (nativo) / `localStorage` (web) |

## 🗂️ Architettura (struttura)

```
App.tsx                → GestureHandlerRootView + SafeArea + PrismProvider + RootStack + DiceOverlay
components/
  ├── ui/              → Prism UI (prism-provider, themes, button, card, badge, input, modal…)
  └── custom/          → componenti RIUTILIZZABILI (riusare, non rifare)
      ├── navigation/  → RootStack.tsx · tab-config.ts
      ├── creation/    → wizard: useCharacterWizard.ts (logica) + step presentational + wizardSteps.ts
      ├── Compendium/  → CompendiumList.tsx · DetailBlock.tsx
      ├── DiceRoller/  → griglia dadi, roll, breakdown, stepper
      ├── Items/       → ItemCard · ItemDetailModal · ItemFilters
      ├── Spells/      → SpellCard · SpellDetailModal · SpellFilters · SpellSlotsBar · CharacterBar
      └── AppNavigator.tsx · Screen · ScreenHeader · TabHeader · BottomModal · CardCarousel
          ClassAvatar · DndIcon · StatsGrid · FilterChip · ListItem · EmptyState · DiceOverlay…
lib/
  ├── data/            → JSON = FONTE UNICA dei dati (13 file)
  └── rules/           → helper TS che leggono i JSON (es. subclasses.ts, feats.ts, character-builder.ts)
screens/
  ├── home/            → lista PG + quick actions (Impostazioni, Compendio)
  ├── characters/      → wizard creazione · Scheda PG · SkillsScreen (tab Abilità)
  ├── compendium/      → menu + Classi/Razze/Background/Talenti/Equipaggiamento/Oggetti/Magie(standalone)
  └── more/            → AltroStack (menu Altro + elimina PG) · SettingsScreen (su RootStack)
store/                 → useCharacterStore · useDiceStore · useActiveCharacter (hook)
types/                 → tipi canonici per argomento (character, class, subclass, spell…) + barrel index.ts
utils/                 → class-tokens · color · dice · style-helpers · styles
assets/                → logo, token classi (PNG), icone SVG (dadi/scuole/oggetti/classi/stats/utility)
android/               → progetto nativo generato da prebuild (build APK locale con gradlew)
```

## 🧭 Navigazione (com'è oggi)

- **RootStack** (native-stack): schermata `Main` (tab navigator) + schermate di dettaglio
  pushate (`CharacterCreate`, `CharacterDetail`… non è più così, vedi sotto) e le sezioni
  del Compendio + Impostazioni.
- **Tab navigator** (`AppNavigator`, `backBehavior="history"`): **Scheda**, **Magie**,
  **Abilità**, **Altro**, **Dadi**. La Home è la route iniziale ma nascosta dalla tab bar.
- La **Home** è l'ingresso unico: apre il contesto di un PG (Scheda/Magie/Abilità legate
  al PG attivo) o le sezioni radice (Compendio, Impostazioni).
- Route centralizzate in `lib/routes.ts` (`ROUTES` + `RouteName`), tipizzate in
  `types/navigation.ts` (`RootStackParamList`, `TabParamList`, `AltroStackParamList`).
- **DiceOverlay** globale renderizzato in `App.tsx` dopo il RootStack (sopra tutto);
  visibile ovunque tranne Home/Creazione.

## ✨ Funzionalità attuali (dettaglio)

### Personaggi
- **Wizard di creazione** (`useCharacterWizard` hook + step in `creation/`):
  Nome → Classe (carousel) → Competenze → Livello → Sottoclasse (se sbloccata) →
  Razza (+lineage) → Background (+ scelte talento) → Punteggi (standard array +
  boost) → **Talenti** → Punti Ferita. Regole reali in `lib/rules/character-builder.ts`
  (`buildCharacter` → `buildCharacterSheet` → `Character` persistito).
- **Consistenza selezioni (2026-08-13)**: feedback del motivo del blocco per ogni
  step (`stepInvalidReason`, niente pulsanti muti), reset coerenti (cambio classe =
  reset totale; cambio livello = preserva ASI/talenti per i livelli ancora validi),
  salto tra step guardato (`setStep`/`isStepReachable`) e `StepIndicator` con stato
  di validità dei passi raggiunti.
- **Step Talenti (2026-08-13)**: a ogni livello ASI (4/8/12/16) si sceglie **O l'ASI
  (con assegnazione +2/+1+1 fatta qui) O un talento generale** (mai entrambi); per
  Fighter/Paladino/Ranger si sceglie lo **stile di combattimento** (1° / 2°); al 19+
  il **dono epico**. Gli ASI NON si assegnano più nello step Punteggi (solo nota).
  I talenti applicano via `applyFeat`: ASI (asi_config, cap 20/30, auto se 1 sola
  caratteristica), modificatori, risorse, competenze, magie. Anteprima punteggi
  finali con ASI dei talenti (`finalScoresWithFeats`).
- **Scheda PG** (`CharacterDetailScreen`): header (nome/classe/avatar/PF/CA/PB/Velocità/Iniz),
  Punti Ferita (stepper danno/cura/temporanei, dadi vita), `StatsGrid` (6 caratteristiche),
  Risorse (es. Ispirazione Bardica d6, Rage, Ki), sezioni Talenti (feat + feature di
  classe + feature di sottoclasse) e Note, Elimina personaggio (conferma).
- **Backfill automatico** (`backfillDerivedStats` nello store): ripara i PG vecchi
  (PF/PB/CA, feature, magie automatiche da background/talento/razza).

### Magie (tab)
- Scheda magie del PG attivo: lista delle `preparedSpells` risolte, barra **slot
  incantesimi** (`SpellSlotsBar` — consuma/recupera slot), riga magia con chip "Lancia",
  "+ Aggiungi" → schermata dedicata `CharacterSpellAssignScreen` (assegna/preferita).
- Modale dettaglio magia (`SpellDetailModal`) con pulsante "Lancia" per consumare slot.
- Modalità **standalone** nel Compendio (senza legame col PG): ricerca + filtri.

### Abilità (tab)
- 18 skill del PG raggruppate per caratteristica, ✓ competenza / ⭐ maestria,
  modificatore = abilità + PB (×2 per expertise), modale dettaglio con "Come si calcola".

### Compendio
- Menu con Classi / Razze / Background / Talenti / Equipaggiamento / Oggetti / Magie.
- Liste tramite `CompendiumList` (search + card/detail), dettagli con `DetailBlock`.
- Pattern: `getAllX()` in `lib/rules/*.ts` → JSON.

### Dadi
- Overlay globale con selezione dado (d4–d20), quantità, modificatore, tiri, breakdown.

### Impostazioni / Altro
- `SettingsScreen` su RootStack: cambio tema (`ThemePicker` → `setTheme`).
- Tab Altro: menu con **Elimina personaggio** (danger + conferma).

## 🗄️ Dati e regole

- **JSON in `lib/data/`** (fonte unica): `abilities, backgrounds, classes, effects,
  equipment_preset, feats, items, progression, races, skills, spellcasting, spells,
  subclasses` + helper in `lib/rules/`.
- **Tipi canonici in `types/`** per argomento; i rules importano i JSON e i tipi.
  Niente duplicati: i campi nuovi nei JSON vanno aggiunti ai tipi (es. `name_en`
  di `subclasses.json` → `SubclassRaw.name_en` + `SubclassDefinition.nameEn`).
- **Character** (`types/character.ts`): modello completo (HP, PB, CA, initiative,
  speed, size, senses, defenses, effects, spellcasting, resources, equipment, money,
  choices, notes, classFeatures, subclassFeatures…).
- **Progressione** (`progression.json`): tabelle 1–20, feature per livello, risorse,
  livelli di sblocco sottoclasse.

## 🎨 Convezioni importanti

- **Tema**: colori solo da `useTokens()` (`t.colors.*`), spazi/raggi/font dai token,
  safe-area da `insets`. Eccezioni ammesse: colori categoria (scuole/rarità/tipi),
  `shadowColor:'#000'`, fallback `#fff` su icone/accent. Mai testo bianco su
  `backgroundSecondary`.
- **Riuso**: prima di scrivere a mano Pressable/card/chip/modal/header/vuoto, usare i
  componenti custom esistenti (vedi tabella in `APPUNTI.md`).
- **Navigazione tipizzata**: route come letterali (`keyof …ParamList`), mai `string`.
- **Icone**: usare `DndIcon` per icone custom (dadi/scuole/oggetti/classi/stats),
  mai emoji come icone. Le classi usano token PNG (`getClassToken`).

## ✅ Comandi di verifica qualità

```bash
npx tsc --noEmit                 # type-check: deve uscire con exit 0, ZERO errori
npx expo export --platform web   # build bundle web (verifica import/compilazione)
npx expo start --clear           # riavvio Metro pulendo cache (dopo babel/metro/moduli nativi)
cd android; .\gradlew.bat assembleRelease   # APK release locale (debug keystore, sideload)
```

## 🩺 Stato attuale (2026-08-13)

- ✅ `npx tsc --noEmit` → **exit 0, nessun errore**.
- ✅ `get_errors` su tutto il workspace → **0 errori**.
- ✅ Recente: aggiunto `name_en` alle sottoclassi (tipi allineati: `SubclassRaw` +
  `SubclassDefinition.nameEn`).
- ⚠️ Git: ultimo comando `git status` annullato dall'utente (stato working tree da
  verificare prima di un commit).

## 🔲 Gap / note noti

- Scelte extra dei talenti generali/epici (`choice_config` es. `spell_selection`,
  `skill_proficiency_or_expertise`) NON ancora collegate al wizard: il talento applica
  ASI/modificatori/risorse ma la scelta aggiuntiva non è richiesta.
- `knownSpells` di classe non auto-popolati (solo talento Iniziato alla Magia e fonti
  automatiche razza/background).
- Risorsa `bardic_inspiration` visibile solo per i PG creati dopo il fix (i PG salvati
  prima vanno ricreati o backfillati).
- Temi `obsidian`, `neon`, `stone`: file presenti ma disattivati (solo default,
  dark_fantasy, light_fantasy attivi).
- `utils/styles.ts` duplica valori del tema (refactor noto, non fatto).
- Umano: effetto 103 "Versatile" (scelta talento origine) non ancora gestito.
