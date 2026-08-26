# 📓 Appunti — Campaign Chronicle

> **Documento INTERNO** — guida operativa di sviluppo ("gestire senza l'AI").
> Il documento pubblico (per GitHub) è `README.md`.

## ⚠️ REGOLA PRINCIPALE

> **Expo è cambiato!** Leggere sempre le docs ufficiali prima di scrivere codice:
> https://docs.expo.dev/versions/v54.0.0/

## 🏗️ Struttura del progetto

```
📁 components/
   ├── ui/                  ← Prism UI library (CUSTOM, non usa prism-rn)
   │   ├── prism-provider.js← Provider temi (useTokens/useTheme, haptic, transizioni)
   │   ├── themes/          ← default · obsidian · neon · stone · dark_fantasy · light_fantasy
   │   └── avatar/ badge/ button/ card/ input/ modal/ skeleton/ tabs/ toast/
   └── custom/              ← COMPONENTI MIEI → **RIUSARE, non rifare!**
       ├── navigation/
       │   ├── RootStack.tsx    ← Stack radice (Main + schermate di dettaglio)
       │   ├── tab-config.ts    ← Config tab (route, icone, visibilità)
       │   ├── CentralDiceButton.tsx · DicePanel.tsx
       ├── AppNavigator.tsx     ← Tab navigator (Scheda, Talenti, Equip., Magie, Abilità, Altro, Dadi)
       ├── TabHeader.tsx        ← Header fisso tab con safe-area (Abilità, Magie)
       ├── ScreenHeader.tsx     ← Titolo schermata (icon Ionicons oppure iconNode DndIcon)
       ├── EmptyState.tsx       ← Stato vuoto centrato (emoji + titolo + messaggio)
       ├── StatsGrid.tsx        ← Griglia 6 statistiche (3×2): icona DndIcon + rombo + bonus
       ├── DndIcon.tsx          ← ICONE SVG custom (dadi, scuole, oggetti, classi, statistiche)
       ├── CardCarousel.tsx     ← Carousel infinito GENERICO riutilizzabile
       ├── ClassCarousel.tsx    ← Carousel classi (wrapper di CardCarousel + token PNG)
       ├── ClassAvatar.tsx      ← Avatar circolare classe (token PNG)
       ├── DiceOverlay.tsx      ← Overlay globale dado (sopra tutto)
       ├── HomeQuickActions.tsx ← Pulsanti rapidi Home (Impostazioni, Compendio)
       ├── ListItem.tsx · DetailChip.tsx · FilterChip.tsx · BottomModal.tsx · BackButton.tsx · Screen.tsx
       ├── creation/            ← WIZARD creazione PG
       │   ├── useCharacterWizard.ts ← TUTTA la logica/stato/validazione del wizard (hook)
       │   ├── NameStep · ClassStep · LevelStep · SubclassStep · SkillsStep · RaceStep
       │   ├── BackgroundStep · FeatChoice · AbilitiesStep · HpStep · SummaryStep (Riepilogo finale)
       │   ├── ClassSwitcher.tsx (multiclasse: quale classe configuri) · CardDetailModal.tsx (info card)
       │   ├── Chip.tsx (pill) · StepIndicator · StepLabel · ValuePickerModal · wizardSteps.ts
       ├── Compendium/          ← CompendiumList.tsx (export: CompendiumDetailHeader) · DetailBlock.tsx
       ├── DiceRoller/          ← DiceTypeGrid · RollButton · ResultBreakdown · StepperControl
       ├── Items/               ← ItemCard · ItemDetailModal · ItemFilters · EquipmentRow · equipmentStats · useItemFilters
       └── Spells/              ← SpellCard · SpellCastRow · SpellDetailModal · SpellFilters · SpellSlotsBar · spellSourceBadges · CharacterBar · useSpellFilters

📁 screens/
   ├── home/        → HomeScreen (lista PG + pulsanti rapidi)
   ├── characters/  → CharacterCreateScreen (wizard) · CharacterDetailScreen (Scheda PG) · FeatsScreen (tab Talenti)
   │                  · EquipmentScreen (tab Equip.) · SkillsScreen (tab Abilità) · NotesScreen (Note del PG)
   ├── compendium/  → CompendioScreen · Classi · Razze · Background · Talenti · Equipaggiamento · Oggetti · Magie (standalone)
   │                  · CharacterSpellAssignScreen (Gestisci magie) · CharacterItemAssignScreen (Gestisci oggetti)
   └── more/        → AltroStack · MoreScreen (menu) · CharacterEditorScreen (Modifica PG: nome/statistiche/CA/PF/modificatori)
                      · SettingsScreen (su RootStack) · altro-routes

📁 lib/
   ├── data/        → JSON (fonte unica: classi, razze, magie, oggetti, ecc.)
   └── rules/       → Helper TypeScript per leggere i dati
📁 store/           → zustand: useCharacterStore · useDiceStore · useActiveCharacter · file-system-storage
📁 types/           → Tipi TypeScript (fonte canonica)
📁 utils/           → class-tokens · color · dice · style-helpers · styles
📁 assets/
   ├── logo.png · classes/ (token_*.png per ClassAvatar)
   └── icon/
       ├── classes/      ← 13 SVG classi (esposte in DndIcon)
       ├── dice/         ← d4 · d6 · d8 · d10 · d12 · d20
       ├── items/        ← ammunition · armor · consumable · currency · gear · tool · weapon
       ├── schoolspells/ ← 8 scuole di magia
       ├── stats/        ← 6 abilità (esposte in DndIcon: strength, dexterity, constitution, intelligence, wisdom, charisma)
       └── utility/      ← spell-book.svg (NON esposto)

📄 App.tsx           → GestureHandlerRootView + SafeAreaProvider + PrismProvider + RootStack + DiceOverlay
📄 ICONE_DA_SOSTITUIRE.md ← Checklist icone NON DndIcon da sostituire
```

## 🧩 Componenti custom riutilizzabili (RIUSARE, non rifare!)

> **Regola**: prima di scrivere a mano un Pressable/card/chip/modal/header/stato vuoto,
> controlla questa tabella. Se esiste già → usalo.

| Componente | Cosa fa | Quando usarlo |
|---|---|---|
| `Screen` | Wrapper schermata: bg tema + safe-area + ScrollView/View | Tutte le schermate pushate (non tab) |
| `ScreenHeader` | Titolo + icona/iconNode + back opzionale | Intestazione di qualsiasi schermata |
| `TabHeader` | Header fisso tab con safe-area (notch) + ScreenHeader + contenuto sotto | Tab con lista scrollabile sotto (Abilità, Magie) |
| `EmptyState` | Stato vuoto centrato (emoji + titolo + messaggio) | "Nessun personaggio", liste vuote |
| `StatsGrid` | Griglia 6 statistiche 3×2: icona DndIcon di sfondo + rombo con abbreviazione + punteggio + bonus (+3…). Props: `scores` (valori mancanti → 10) | Scheda PG → sezione Caratteristiche |
| `ListItem` | Riga `[icona][titolo/badge/desc][›]` — variant `card`/`menu`, `iconBoxed={false}` per icona nuda (es. `ClassAvatar`) | Liste Compendio, menu, card personaggio Home |
| `FilterChip` | Chip filtro selezionabile (size `xs`/`sm`, activeBg/Fg) | Filtri (SpellFilters, ItemFilters) |
| `Chip` (in `creation/`) | Pill selezionabile wizard (`selected`, `compact`, `selectedSuffix`) | Step wizard: skill, boost, ASI, sottorazze, modalità |
| `DetailChip` | Chip etichetta→valore | Dettagli nei modali (Item/Spell) |
| `ClassAvatar` | Avatar circolare classe (token PNG) | Home, Scheda PG, lista Classi |
| `CardCarousel` | Carousel infinito generico (items + dot custom) | Scelte a carousel |
| `ClassCarousel` | Wrapper di `CardCarousel` per le classi (token PNG) | Step Classe |
| `Button` (`ui/button`) | Pulsante animato (solid/outline/ghost/danger/subtle, sm/md/lg, fullWidth, loading) | **TUTTI i pulsanti** — mai Pressable raw per bottoni |
| `Card` (`ui/card`) | Card con varianti (default/elevated/outlined/ghost) | Contenitori elevati |
| `Badge` (`ui/badge`) | Etichetta (solid/outline/subtle, color) | Badge classe/livello/rarità/scuola |
| `Input` (`ui/input`) | Campo testo con label/error | Nome PG, ricerca |
| `BottomModal` | Modal dal basso | Conferme, sezioni scheda, picker |
| `DndIcon` | Icone SVG custom (dadi/scuole/oggetti/classi) | Icone custom — mai emoji come icone |
| `StepperControl` | Stepper ± circolare (theme-safe) | Quantità/modificatore dadi |
| `CharacterBar` | Barra PG attivo (nome + classe + livello) | Tab legate al PG (Magie, Abilità) |
| `useActiveCharacter()` | Hook store: centralizza le sottoscrizioni al PG attivo | Ogni schermata che legge il PG attivo |
| `MissingActiveCharacter` | Stato "Nessun personaggio selezionato" (titolo fisso, emoji/messaggio variabili) | Early-return di ogni schermata legata al PG |
| `ConfirmDeleteCharacterModal` | Modale conferma elimina personaggio (Annulla/Elimina) | Scheda PG, tab Altro |
| `ScrollToTopFab` + `useScrollToTop()` | FAB "Torna su" flottante + stato `showScrollTop`/`handleScroll` | Liste lunghe (Oggetti, Magie) |
| `LabelValueRow` | Riga `[etichetta → valore]` (space-between, dividerTop, colori custom) | Riepiloghi, risorse, dettagli |
| `StepperRow` | Riga `[etichetta] [− valore +]` con `StepperButton` | PF (Attuali/Temporanei), denaro (mo/ma/mr) |
| `CardBox` | Card contenitore `backgroundSecondary` + bordo + raggio (padding/gap/marginBottom/radius) | Qualsiasi box con bordo (Scheda PG, slot, riepiloghi) |
| `SectionBlock` | `View(marginBottom) + SectionTitle + contenuto` | Sezioni "titolo + lista" (Talenti, Abilità, Note, Equipaggiamento) |
| `CircleCheck` | Checkbox circolare (cerchio bordo 2, riempito se attivo, ✓ dentro) | Equipaggia oggetti, completa note |
| `ChipPickerPanel` | Pannello inline per picker di chip (bordo + label uppercase + rowWrap di FilterChip) | Filtri classe/scuola delle magie |
| `StatTile` | Quadrato statistico (etichetta + valore, aspectRatio 1) | Header Scheda PG (CA/PB/Velocità/Iniz) |
| `DetailModalHeader` | Header modali di dettaglio: box icona 56×56 + titolo + ✕ + badge (props `icon`/`iconBg`/`title`/`badges`/`onClose`) | Dettaglio Incantesimo, dettaglio Oggetto |
| `AddModifierModal` | Modale "Aggiungi modificatore" (chip target una/più/tutte + etichetta + stepper valore) | Editor personaggio (abilità e skill) |
| `useSpellFilters` / `useItemFilters` | Hook filtro condivisi (search/livello/classe/tipo/rarità) + `applySpellFilters`/`applyItemFilters` puri | SpellsScreen · CharacterSpellAssign · ItemsScreen · CharacterItemAssign |
| `EquipmentRow` | Riga equipaggiamento con statistiche INLINE (danno/CA/gittata/proprietà) | Tab Equip. (`EquipmentScreen`) |
| `CompendiumDetailHeader` | Header unificato dettagli compendio (icona box 56 accentSubtle + titolo xl/700 + badge) | Liste/dettagli Compendio (Classi/Razze/Background/Talenti/Equip.) |
| `ClassSwitcher` | Chips delle classi configurate per scegliere QUALE classe configurare (multiclasse) | Wizard multiclasse (Level/Subclass/Skills step) |

**Wizard creazione**: la schermata (`CharacterCreateScreen`) è un renderer sottile →
tutta la logica vive in `useCharacterWizard` (hook) e ogni passo è un componente
presentational in `components/custom/creation/`. L'ultimo passo è `summary`
(Riepilogo, `SummaryStep.tsx`): il footer diventa "Crea Personaggio"
(`isLastStep = step === 'summary'`). Per aggiungere/modificare un passo:
1. tocca il componente step (es. `RaceStep.tsx`) o lo stato in `useCharacterWizard.ts`,
2. se serve un nuovo passo, aggiorna `wizardSteps.ts` (`STEPS`/`StepKey`) e `stepValid`.

## 🎨 Temi disponibili

| Tema | Descrizione | Stato |
|------|-------------|-------|
| `default` | ☀️ Chiaro · stile Apple | ✅ attivo (default in App.tsx) |
| `dark_fantasy` | 🐉 Antracite · oro araldico | ✅ attivo (ThemePicker) |
| `light_fantasy` | 📜 Pergamena · rosso cremisi | ✅ attivo (ThemePicker) |
| `obsidian` | 🌑 Scuro · viola epico | ⚠️ file presente, disattivato |
| `neon` | 💚 Cyberpunk · verde glow | ⚠️ file presente, disattivato |
| `stone` | 🪨 Caldo · marrone naturale | ⚠️ file presente, disattivato |

Cambio tema: runtime dalle Impostazioni (`ThemePicker` → `setTheme()`) oppure
cambiando l'import in `App.tsx`. I temi supportano transizioni animate, haptic e ombre.

## 📦 Dipendenze principali (aggiornato 2026-08-26)

| Pacchetto | Versione | Cosa fa |
|---|---|---|
| `expo` | ~54.0.34 | Framework |
| `react-native` | 0.81.5 | UI nativa |
| `react-native-reanimated` | ~4.1.1 | Animazioni (DiceOverlay, ClassCarousel) |
| `react-native-worklets` | 0.5.1 | Worklets (peer Reanimated 4) |
| `react-native-gesture-handler` | ~2.28.0 | Gesti (richiesto dal carousel) |
| `react-native-reanimated-carousel` | ^5.0.0 | Carousel infinito (ClassCarousel) |
| `react-native-svg` | 15.12.1 | Render SVG (DndIcon, SvgXml) |
| `react-native-safe-area-context` | ~5.6.0 | Safe area (notch) |
| `react-native-screens` | ~4.16.0 | Schermate native (stack) |
| `@react-navigation/native` + `bottom-tabs` + `native-stack` | 6.x | Navigazione (tab + stack) |
| `zustand` | ^5.0.14 | State management (`store/`) |
| `@expo/vector-icons` | ^15.1.1 | Icone Ionicons (tab bar, header) |
| `expo-file-system` | ~19.0.23 | Storage PG (`file-system-storage.ts`) |
| `expo-font` | ~14.0.12 | Font (plugin in app.json) |
| `react-native-web` + `react-dom` | — | Supporto target web |

**Rimossi (2026-08-03)**: `react-native-deck-swiper`, `react-native-paper`,
`@tanstack/react-query`, `papaparse`, `expo-document-picker`, `expo-print`,
`react-native-share`, `lodash`, `date-fns`, `uuid`, `prism-rn`.

**Nota storage**: `react-native-mmkv` era previsto ma è stato sostituito da
`expo-file-system` (vedi `store/file-system-storage.ts`).

## 🧩 Componenti Prism UI usabili

| Componente | Varianti / Props principali |
|---|---|
| `Button` | variant: solid, outline, ghost, danger, subtle — size: sm, md, lg — loading, disabled, fullWidth |
| `Card` | variant: default, elevated, outlined, ghost — .Header, .Title, .Body, .Footer |
| `Badge` | variant: solid, outline, subtle — size: sm, md, lg — prop color, dot |
| `Input` | variant: default, error, success — label, leftIcon, rightIcon, helperText, errorMessage |
| `Avatar` | size: xs, sm, md, lg, xl — fallback per iniziali — Avatar.Group con max |
| `Tabs` | tabs array con { label, content } — variant: underline |
| `Modal` | visible, onClose, title — Modal.Sheet per bottom sheet |
| `Skeleton` | width, height, borderRadius — per caricamenti |
| `Toast` | type: info, success, warning, danger — position: top, bottom — duration |

## 💡 Comandi

```bash
# ── Dev server ──────────────────────────────────────────────
npm start                # Avvia Expo dev server
npm run ios              # Avvia su iOS simulator
npm run android          # Avvia su Android emulator
npm run web              # Avvia su browser
npx expo start --clear   # Riavvia Metro pulendo la cache (dopo modifiche a babel/metro/nuovi moduli nativi)

# ── Verifica qualità (PRIMA di ogni commit) ─────────────────
npx tsc --noEmit                  # Type-check: deve uscire con exit 0, ZERO errori
npx expo export --platform web    # Build bundle web: verifica import/compilazione (es. file cancellati)

# ── Build Android APK locale (senza EAS, senza Android Studio) ──
cd android
.\gradlew.bat assembleRelease        # APK di release (firmato con debug keystore)
.\gradlew.bat assembleDebug          # APK di debug
cd ..

# APK generato →  android\app\build\outputs\apk\release\app-release.apk
# (si installa direttamente su dispositivo via sideload; NON per il Play Store)
```

### 🛠️ Setup build locale (già configurato, solo se ri-fai `prebuild --clean`)

Due prerequisiti necessari per `gradlew` (mancavano entrambi → build in errore):

1. **JDK 17** (Gradle 8.14.3 non supporta il JDK 25 installato → errore
   *"Unsupported class file major version 69"*).
   Portable in `C:\Users\giaco\.jdks\jdk-17.0.20+8`, puntato da
   `org.gradle.java.home=` in `android\gradle.properties`.
   > Se il JDK 17 non c'è più: scaricarlo da
   > `https://api.adoptium.net/v3/binary/latest/17/ga/windows/x64/jdk/hotspot/normal/eclipse`
   > (zip) ed estrarlo in `%USERPROFILE%\.jdks`.

2. **Android SDK** in `C:\Users\giaco\Android\Sdk` (mancava → errore
   *"SDK location not found"*), puntato da `sdk.dir=` in `android\local.properties`.
   > Se manca: installare command-line tools + pacchetti
   > (`platforms;android-36`, `build-tools;36.0.0`). NDK e CMake li installa Gradle da solo.

⚠️ **`npx expo prebuild --clean` rigenera `android/`**: va riapplicato
`org.gradle.java.home` (gradle.properties) e `sdk.dir` (local.properties).

## 📝 Regole (per me)

### 🎨 Tema (sicurezza al cambio tema)
- I colori vanno **sempre** dal tema con `useTokens()` → `t.colors.*` — mai hardcodati.
- **Eccezioni OK** (non cambiano col tema): colori di CATEGORIA (rarità oggetti, scuole di
  magia, tipi) e `shadowColor: '#000'`. `#FFF` va bene SOLO su sfondo accent
  (= `accentForeground`). MAI testo bianco su sfondo `backgroundSecondary` (invisibile su light!).
- Spacing/radius/font: dai token `t.spacing`/`t.radius`/`t.typography` oppure dalle costanti
  statiche `utils/styles.ts` (`spacing`, `radius`, `fontSizes`) — mai numeri magici.
- Safe area: sempre `useSafeAreaInsets()` o i wrapper (`Screen`, `TabHeader`).
  Mai hardcodare 44/20 per notch/tab bar.

### 🔁 Riuso (prima di scrivere codice)
- Prima di creare un Pressable/card/chip/modal/header/stato vuoto → controllare la tabella
  "Componenti custom riutilizzabili" qui sopra. Se esiste → usarlo.
- I pulsanti usano SEMPRE `Button` (mai Pressable raw).
- I componenti nuovi vanno in `components/custom/`; le pagine/viste in `screens/`.
- Lista abilità: usare `getAllAbilities()` da `lib/rules/abilities.ts` (NON ridefinirla).
- `APPUNTI.md` sono appunti personali — tenerlo aggiornato.
- `README.md` è il documento PUBBLICO (GitHub) — aggiornarlo quando cambiano
  funzionalità/stack/navigazione. `PROGETTO.md` è stato sostituito dal README.

### 📐 Altro
- Prism UI supporta cambio tema runtime (tramite ThemePicker o `setTheme()`)
- Per il TypeScript: quando usi `useTheme()`, serve un cast perché il context è js puro
- **Hooks (P0)**: in ogni schermata con `if (!activeChar) return <MissingActiveCharacter/>`,
  TUTTI gli `useMemo`/`useEffect` vanno PRIMA della guardia (fallback a module scope, es.
  `DEFAULT_ABILITIES`). Violazione → crash se il tab resta montato e activeChar cambia.
- **DndIcon è un `View`** → NON metterlo dentro `<Text>` (non renderizza). Per icone inline
  usare righe `s.row` con `<DndIcon>` + `<Text>`, o la prop `icon` di `Button`.
- **Web (Playwright)**: il click nativo DOM `el.click()` (via `page.evaluate`) innesca gli
  onPress dei TouchableOpacity/Pressable RN Web (dispatchEvent/force NON bastano).
- **Nested buttons (web)**: Pressable con bottoni ANNIDATI (es. SpellCard con toggle ★/✓)
  → NIENTE `accessibilityRole="button"` sull'outer (HTML invalido `<button>` in `<button>`).
- **Icone**: usare sempre `DndIcon` (`components/custom/DndIcon.tsx`) per le icone custom
  (dadi, scuole, oggetti, classi, statistiche). Aggiungere un'icona = mettere l'SVG in `assets/icon/` e
  esporlo in `DndIcon` (agganciato anche a `IconName`). NIENTE emoji come icone.
  Checklist delle icone "non DndIcon" da sostituire in `ICONE_DA_SOSTITUIRE.md`.
- **Header**: se passi `icon="d8"` (nome DndIcon) a `ScreenHeader` ottieni un warning
  "not a valid icon name for family ionicons" → usare `iconNode={<DndIcon name="..." />}`.
- **Carousel**: `ClassCarousel`/`CardCarousel` usano `react-native-reanimated-carousel` v5.
  NIENTE `width`/`height` come prop (rimossi in v5): si dimensiona con `style={{ width, height }}`.
- **Web (Expo 54)**: zustand usa `import.meta` → fix in `babel.config.js`
  (plugin `inline-transform-import-meta`). Dopo modifiche a babel: riavviare con `--clear`.
- **Storage**: PG salvati con `expo-file-system` (`store/file-system-storage.ts`).
