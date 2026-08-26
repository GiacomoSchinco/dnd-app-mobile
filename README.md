# 🐉 Campaign Chronicle

> App **mobile (React Native / Expo) + Web** per gestire schede personaggio di
> **Dungeons & Dragons 5.5e (edizione 2024, in italiano)**.

![Expo SDK](https://img.shields.io/badge/Expo%20SDK-54-000000?style=flat-square&logo=expo)
![React Native](https://img.shields.io/badge/React%20Native-0.81-61DAFB?style=flat-square&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=flat-square&logo=typescript)
![Zustand](https://img.shields.io/badge/Zustand-5-orange?style=flat-square)
![Status](https://img.shields.io/badge/Status-in%20sviluppo-yellow?style=flat-square)

---

## ✨ Funzionalità

- **Creazione guidata personaggi** — wizard multi-step con regole reali 5.5e
  (classe, razza, background, punteggi, talenti, punti ferita, riepilogo).
- **Multiclasse** — creazione e level-up con più classi (prerequisiti 13+, slot
  incantesimi combinati, ASI per classe).
- **Scheda personaggio** — PF (danno/cura/temporanei), caratteristiche, risorse,
  header con CA/PB/Velocità/Iniziativa.
- **Tab Talenti** — talenti, doni epici, caratteristiche di classe e sottoclasse.
- **Tab Equipaggiamento** — denaro e oggetti del PG con statistiche inline,
  gestione completa (aggiungi/rimuovi/equipaggia).
- **Tab Magie** — magie preparate/assegnate del PG, barra slot incantesimi
  (consuma/recupera), "Lancia" con consumo slot.
- **Tab Abilità** — 18 skill del PG con competenza/maestria e dettaglio calcolo.
- **Compendio** — classi, razze, background, talenti, equipaggiamento, oggetti, magie.
- **Lanciatore di dadi** globale — overlay sopra tutto (d4–d20) con breakdown dei tiri.
- **Temi fantasy** commutabili (chiaro/scuro) dalle Impostazioni.
- **Editor personaggio** — correzione di nome, statistiche, CA, PF e modificatori
  manuali (abilità/skill) con salvataggio a conferma.

<!--
## 📸 Schermate

Aggiungi qui i screenshot dell'app (basta trascinarli nel repo e referenziarli):

| Home | Scheda PG | Wizard |
|------|-----------|--------|
| ![Home](docs/screens/home.png) | ![Scheda](docs/screens/scheda.png) | ![Wizard](docs/screens/wizard.png) |
-->

---

## 🧱 Stack tecnico

| Area | Scelta |
|---|---|
| Framework | **Expo SDK 54** + React Native 0.81.5 |
| Linguaggio | **TypeScript ~5.9** |
| Navigazione | React Navigation 6 (native-stack + bottom-tabs) |
| Stato | **Zustand 5** + persistenza (`store/file-system-storage.ts`; web → `localStorage`) |
| Animazioni | Reanimated 4 + react-native-worklets + gesture-handler + reanimated-carousel v5 |
| Icone | `DndIcon` con SVG custom (`assets/icon/**`, react-native-svg) + Ionicons |
| Tema/UI | **Prism UI custom** (`components/ui/`): `useTokens()`, 6 temi, Button/Card/Badge/Input/Modal |
| Storage | `expo-file-system` (nativo) / `localStorage` (web) |

---

## 🗂️ Architettura

```
App.tsx                → GestureHandlerRootView + SafeArea + PrismProvider + RootStack + DiceOverlay
components/
  ├── ui/              → Prism UI custom (prism-provider, themes, button, card, badge, input, modal…)
  └── custom/          → componenti RIUTILIZZABILI (riusare, non rifare)
      ├── navigation/  → RootStack.tsx · tab-config.ts · CentralDiceButton · DicePanel
      ├── creation/    → wizard: useCharacterWizard.ts (logica) + step presentational + wizardSteps.ts
      ├── Compendium/  → CompendiumList.tsx · DetailBlock.tsx
      ├── DiceRoller/  → griglia dadi · roll · breakdown · stepper
      ├── Items/       → ItemCard · ItemDetailModal · ItemFilters · EquipmentRow · equipmentStats · useItemFilters
      ├── Spells/      → SpellCard · SpellCastRow · SpellDetailModal · SpellFilters · SpellSlotsBar · spellSourceBadges · CharacterBar · useSpellFilters
      └── …            → Screen · ScreenHeader · TabHeader · BottomModal · CardCarousel · ClassAvatar · DndIcon · StatsGrid · EmptyState…
lib/
  ├── data/            → JSON = FONTE UNICA dei dati (13 file)
  └── rules/           → helper TS che leggono i JSON (17 file)
screens/
  ├── home/            → lista PG + quick actions (Impostazioni, Compendio)
  ├── characters/      → wizard creazione · Scheda PG · Talenti · Equipaggiamento · Abilità · Note
  ├── compendium/      → menu + liste/dettagli di tutte le sezioni + Gestisci magie/oggetti
  └── more/            → AltroStack (menu, editor personaggio) · Impostazioni (su RootStack)
store/                 → useCharacterStore · useDiceStore · useActiveCharacter (hook)
types/                 → tipi canonici per argomento + barrel index.ts
utils/                 → class-tokens · color · dice · style-helpers · styles
assets/                → logo, token classi (PNG), icone SVG (dadi/scuole/oggetti/classi/stats/utility)
android/               → progetto nativo generato da prebuild (build APK locale con gradlew)
```

## 🧭 Navigazione

- **RootStack** (native-stack): schermata `Main` (tab navigator) + schermate di
  dettaglio pushate (wizard, sezioni del Compendio, Impostazioni, Note, editor…).
- **Tab navigator** (in `Main`, `backBehavior="history"`), barra flottante con
  **pulsante Dadi centrale**:

| Tab | Visibilità | Contenuto |
|---|---|---|
| **Home** | nascosta dalla tab bar | ingresso unico: apri un PG o le sezioni radice |
| **Scheda** | solo con PG attivo | scheda personaggio |
| **Talenti** | solo con PG attivo | talenti, doni epici, feature di classe/sottoclasse |
| **Equip.** | solo con PG attivo | equipaggiamento e denaro del PG |
| **Magie** | sempre | magie del PG (o compendio standalone) |
| **Abilità** | sempre | 18 skill del PG |
| **Altro** | sempre | menu (modifica PG, note, elimina) |
| **Dadi** | sempre | pulsante centrale → `DiceOverlay` globale |

- Route centralizzate in `lib/routes.ts` (`ROUTES` + `RouteName`), tipizzate in
  `types/navigation.ts` (`RootStackParamList`, `TabParamList`, `AltroStackParamList`).
- **DiceOverlay** globale renderizzato in `App.tsx` dopo il RootStack (sopra tutto);
  visibile ovunque tranne Home/Creazione.

---

## ✨ Funzionalità in dettaglio

### Personaggi
- **Wizard di creazione** (`useCharacterWizard` hook + step in `creation/`):
  Nome → Classe (carousel) → Competenze → Livello → Sottoclasse → Razza (+lineage)
  → Background (+scelte talento) → Punteggi (standard array / point buy 27) →
  Talenti/ASI → Punti Ferita → **Riepilogo** → Crea Personaggio.
  Regole reali in `lib/rules/character-builder.ts` (`buildCharacter` →
  `buildCharacterSheet` → `Character` persistito).
- **Multiclasse**: 2+ classi nel wizard (ClassSwitcher per scegliere la classe attiva),
  prerequisiti 13+ sulle caratteristiche, ASI per classe, slot combinati
  (`lib/rules/multiclass.ts`).
- **Level-up** (`LevelUpModal`): tiro PF, nuove feature, ASI/talento al livello,
  sottoclasse, aggiornamento slot e risorse preservando lo stato runtime.
- **Scheda PG** (`CharacterDetailScreen`): header (nome/classe/CA/PB/Velocità/Iniz),
  "Salì di livello", Punti Ferita (stepper), `StatsGrid` (6 caratteristiche), Risorse.
- **Backfill automatico** (`backfillDerivedStats` nello store): ripara i PG salvati
  prima di modifiche (PF/PB/CA, feature, magie automatiche).

### Talenti (tab)
- `FeatsScreen`: talenti, doni epici, caratteristiche di classe e sottoclasse
  raggruppati per livello con card unificate (`FeatureCard`), contatori per sezione
  e descrizioni/effetti risolti dai JSON.

### Equipaggiamento (tab)
- `EquipmentScreen`: denaro (Oro/Argento/Rame) + oggetti raggruppati per tipo con
  statistiche inline (danno/CA/gittata/proprietà), stepper quantità, toggle
  equipaggia, "+ Aggiungi oggetti" → `CharacterItemAssignScreen` (catalogo con filtri).

### Magie (tab)
- Scheda magie del PG attivo: lista delle `preparedSpells` risolte, barra **slot
  incantesimi** (`SpellSlotsBar` — consuma/recupera), riga magia con chip "Lancia",
  "+ Aggiungi" → `CharacterSpellAssignScreen` (assegna/preferita).
- Modale dettaglio (`SpellDetailModal`) con "Lancia" per consumare slot e badge
  delle fonti (talento/razza/manuale, es. "Gratis 1/gg").
- Modalità **standalone** nel Compendio (senza legame col PG): ricerca + filtri.

### Abilità (tab)
- 18 skill del PG raggruppate per caratteristica, ✓ competenza / ⭐ maestria,
  modificatore = abilità + PB (×2 per expertise), modale "Come si calcola".

### Compendio
- Menu con Classi / Razze / Background / Talenti / Equipaggiamento / Oggetti / Magie.
- Liste tramite `CompendiumList` (search + card/detail) e dettagli con `DetailBlock`
  e `CompendiumDetailHeader`. Pattern: `getAllX()` in `lib/rules/*.ts` → JSON.

### Dadi
- Overlay globale con selezione dado (d4–d20), quantità, modificatore, tiri, breakdown.

### Impostazioni / Altro
- `SettingsScreen` su RootStack: cambio tema (`ThemePicker` → `setTheme`).
- Tab Altro: menu con **Modifica personaggio** (editor), **Note** ed
  **Elimina personaggio** (danger + conferma).

---

## 🗄️ Dati e regole

- **JSON in `lib/data/`** (fonte unica, 13 file): `abilities`, `backgrounds`,
  `classes`, `effects`, `equipment_preset`, `feats`, `items`, `progression`,
  `races`, `skills`, `spellcasting`, `spells`, `subclasses`.
- **Tipi canonici in `types/`** per argomento; i rules importano i JSON e i tipi.
  Niente duplicati: i campi nuovi nei JSON vanno aggiunti ai tipi.
- **Character** (`types/character.ts`): modello completo (HP, PB, CA, initiative,
  speed, size, senses, defenses, effects, spellcasting, resources, equipment,
  money, choices, notes, classFeatures, subclassFeatures…).
- **Progressione** (`progression.json`): tabelle 1–20, feature per livello, risorse,
  livelli di sblocco sottoclasse.

---

## 🚀 Per iniziare

```bash
# Installa le dipendenze
npm install

# Avvia il dev server Expo
npm start              # oppure: npx expo start

# Su un target specifico
npm run ios            # iOS simulator
npm run android        # Android emulator
npm run web            # Browser (Expo web)
```

> Dopo modifiche a `babel.config.js`/`metro.config.cjs` o install di nuovi moduli
> nativi, riavviare Metro pulendo la cache:
> `npx expo start --clear`

## ✅ Verifica qualità

```bash
npx tsc --noEmit                 # type-check: deve uscire con exit 0, ZERO errori
npx expo export --platform web   # build bundle web (verifica import/compilazione)
node scripts/generate-icons.mjs  # rigenera TUTTE le icone da assets/logo.png
```

## 🤖 Build Android APK locale

Il progetto include la cartella `android/` (generata da `expo prebuild`). Per
compilare un APK locale senza EAS né Android Studio:

```bash
cd android
.\gradlew.bat assembleRelease    # APK di release (firmato con debug keystore)
# .\gradlew.bat assembleDebug    # APK di debug
cd ..
```

L'APK generato → `android\app\build\outputs\apk\release\app-release.apk`
(si installa direttamente su dispositivo via sideload; **NON** per il Play Store).

> Prerequisiti build locale: **JDK 17** (Gradle 8.x non supporta JDK recenti) e
> **Android SDK**. Vedi `APPUNTI.md` (sezione "Setup build locale") per i dettagli.

---

## 🩺 Stato attuale (2026-08-26)

- ✅ `npx tsc --noEmit` → **exit 0, nessun errore**.
- ✅ `get_errors` su tutto il workspace → **0 errori**.
- ✅ Icone: checklist `ICONE_DA_SOSTITUIRE.md` chiusa (nessun lavoro urgente).
- ⚠️ Git: verificare lo stato del working tree prima di un commit.

## 🔲 Gap / roadmap

- Scelte extra dei talenti generali/epici (`choice_config`, es. `spell_selection`,
  `skill_proficiency_or_expertise`) non ancora collegate al wizard.
- `knownSpells` di classe non auto-popolati (solo talenti e fonti automatiche
  razza/background).
- Alcuni PG salvati prima di fix specifici (es. risorse) vanno ricreati o backfillati.
- Temi `obsidian`, `neon`, `stone`: file presenti ma disattivati (attivi solo
  `default`, `dark_fantasy`, `light_fantasy`).
- `utils/styles.ts` duplica valori del tema (refactor noto, non fatto).
- Umano: effetto "Versatile" (scelta talento di origine) non ancora gestito.

---

## 📄 Licenza

Progetto privato — distribuzione non autorizzata.
