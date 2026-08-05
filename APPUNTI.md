# 📓 Appunti — DungeonCraft

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
   └── custom/              ← COMPONENTI MIEI
       ├── navigation/
       │   ├── RootStack.tsx    ← Stack radice (Main + schermate di dettaglio)
       │   ├── tab-config.ts    ← Config tab (route, icone, visibilità)
       │   ├── CentralDiceButton.tsx · DicePanel.tsx
       ├── AppNavigator.tsx     ← Tab navigator (Scheda, Magie, Oggetti, Altro, Dadi)
       ├── ScreenHeader.tsx     ← Titolo schermata (icon Ionicons oppure iconNode DndIcon)
       ├── DndIcon.tsx          ← ICONE SVG custom (dadi, scuole, oggetti, classi)
       ├── ClassCarousel.tsx    ← Carousel infinito scelta classe (reanimated-carousel)
       ├── ClassAvatar.tsx      ← Avatar circolare classe (token PNG)
       ├── DiceOverlay.tsx      ← Overlay globale dado (sopra tutto)
       ├── ListItem.tsx · DetailChip.tsx · BottomModal.tsx · BackButton.tsx · Screen.tsx
       ├── Compendium/          ← CompendiumList.tsx · DetailBlock.tsx
       ├── DiceRoller/          ← DiceTypeGrid · RollButton · ResultBreakdown · StepperControl
       ├── Items/               ← ItemCard · ItemDetailModal · ItemFilters
       └── Spells/              ← SpellCard · SpellDetailModal · SpellFilters · SpellSlotManager · CharacterBar · CharacterPickerModal

📁 screens/
   ├── home/        → HomeScreen (lista PG)
   ├── characters/  → CharacterCreateScreen (carousel classi) · CharacterDetailScreen (Scheda PG)
   ├── compendium/  → CompendioScreen · Classi · Razze · Background · Talenti · Equipaggiamento · Oggetti
   └── more/        → AltroStack · MoreScreen · SettingsScreen · altro-routes

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
       ├── stats/        ← 6 abilità (NON esposte in DndIcon)
       └── utility/      ← spell-book.svg (NON esposto)

📄 App.tsx           → GestureHandlerRootView + SafeAreaProvider + PrismProvider + RootStack + DiceOverlay
📄 ICONE_DA_SOSTITUIRE.md ← Checklist icone NON DndIcon da sostituire
```

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

## 📦 Dipendenze principali (aggiornato 2026-08-03)

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

- I colori vanno sempre presi dal tema con `useTokens()` — mai hardcodati
- I componenti nuovi vanno in `components/custom/`
- Le pagine/viste vanno in `screens/`
- `APPUNTI.md` sono appunti personali — tenerlo aggiornato
- Prism UI supporta cambio tema runtime (tramite ThemePicker o `setTheme()`)
- Per il TypeScript: quando usi `useTheme()`, serve un cast perché il context è js puro
- **Icone**: usare sempre `DndIcon` (`components/custom/DndIcon.tsx`) per le icone custom
  (dadi, scuole, oggetti, classi). Aggiungere un'icona = mettere l'SVG in `assets/icon/` e
  esporlo in `DndIcon` (agganciato anche a `IconName`). NIENTE emoji come icone.
  Checklist delle icone "non DndIcon" da sostituire in `ICONE_DA_SOSTITUIRE.md`.
- **Header**: se passi `icon="d8"` (nome DndIcon) a `ScreenHeader` ottieni un warning
  "not a valid icon name for family ionicons" → usare `iconNode={<DndIcon name="..." />}`.
- **Carousel**: `ClassCarousel` usa `react-native-reanimated-carousel` v5. NIENTE `width`/`height`
  come prop (rimossi in v5): si dimensiona con `style={{ width, height }}`. `loop` per l'infinito,
  `Pagination` con `progress` (SharedValue via `useSharedValue` + `onProgressChange`).
- **Web (Expo 54)**: zustand usa `import.meta` → fix in `babel.config.js`
  (plugin `inline-transform-import-meta`). Dopo modifiche a babel: riavviare con `--clear`.
- **Storage**: PG salvati con `expo-file-system` (`store/file-system-storage.ts`).
