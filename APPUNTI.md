# 📓 Appunti — DungeonCraft

## ⚠️ REGOLA PRINCIPALE

> **Expo è cambiato!** Leggere sempre le docs ufficiali prima di scrivere codice:
> https://docs.expo.dev/versions/v54.0.0/

## 🏗️ Struttura del progetto

```
📁 components/
   ├── ui/              ← Prism UI library (temi, button, card, badge, tabs, ...)
   └── custom/          ← COMPONENTI MIEI
       ├── AppNavigator.tsx   ← Tab navigator (Home, Dadi, Impostazioni)
       ├── ScreenHeader.tsx   ← Titolo schermata con tema
       ├── DiceRoller.tsx     ← Dado animato con Reanimated
       ├── DiceButton.tsx     ← Pulsante dado semplice (non usato)
       └── ThemePicker.tsx    ← Selettore temi

📁 screens/
   ├── HomeScreen.tsx    → Logo + nome app
   ├── DicesScreen.tsx   → Lancio dadi (d4–d20)
   └── SettingsScreen.tsx → Impostazioni + cambio tema

📁 assets/
   ├── logo.png
   └── icon/
       ├── dice/          ← d4.svg · d6.svg · d8.svg · d10.svg · d12.svg · d20.svg
       ├── class/         ← barbarian.svg · wizard.svg · etc. (13 classi)
       ├── schoolspell/   ← abjuration.svg · conjuration.svg · etc. (8 scuole)
       └── stats/         ← icon_strength.svg · icon_dexterity.svg · etc. (6 statistiche)

📄 App.tsx               → Solo providers + AppNavigator
📄 APPUNTI.md            ← Questo file (appunti personali)
📄 AGENTS.md             ← Istruzioni per AI assistant
📄 CLAUDE.md             ← Include AGENTS.md
```

## 🎨 Temi disponibili

| Tema | Descrizione |
|------|-------------|
| `default` | ☀️ Chiaro · stile Apple |
| `obsidian` | 🌑 Scuro · viola epico |
| `neon` | 💚 Cyberpunk · verde glow |
| `stone` | 🪨 Caldo · marrone naturale |

Si cambiano dal file `App.tsx` (import) o dalle Impostazioni dell'app.
I temi hanno supporto per: animazioni transizione, haptic feedback, ombre e gradienti.

## 📦 Dipendenze principali

| Pacchetto | Versione | Cosa fa |
|---|---|---|
| `expo` | ~54.0.34 | Framework |
| `react-native` | 0.81.5 | UI nativa |
| `react-native-reanimated` | ~4.1.1 | Animazioni |
| `react-native-safe-area-context` | ^4.12.0 | Safe area (notch) |
| `@react-navigation/native` | ^6.1.18 | Navigazione (futura) |
| `@tanstack/react-query` | ^5.101.0 | Fetch/gestione dati (futuro) |
| `react-native-mmkv` | ^3.3.3 | Storage veloce (futuro) |
| `react-native-paper` | ^5.15.3 | UI components (non usato, alternativa a Prism) |
| `nativewind` | ^4.1.23 | Tailwind per RN (non usato al momento) |

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
npm start          # Avvia Expo dev server
npm run ios        # Avvia su iOS simulator
npm run android    # Avvia su Android emulator
npm run web        # Avvia su browser
```

## 📝 Regole (per me)

- I colori vanno sempre presi dal tema con `useTokens()` — mai hardcodati
- I componenti nuovi vanno in `components/custom/`
- Le pagine/viste vanno in `screens/`
- `APPUNTI.md` sono appunti personali — tenerlo aggiornato
- Prism UI supporta cambio tema runtime (tramite ThemePicker o `setTheme()`)
- Per il TypeScript: quando usi `useTheme()`,serve un cast perché il context è js puro
