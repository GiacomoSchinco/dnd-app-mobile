# 📓 Appunti — DungeonCraft

## 🏗️ Struttura del progetto

```
📁 components/
   ├── ui/              ← Prism UI library (temi, button, card, badge, tabs, ...)
   └── custom/          ← COMPONENTI MIEI
       ├── AppNavigator.tsx   ← Tab navigator (Home, Dadi, Impostazioni)
       ├── ScreenHeader.tsx   ← Titolo schermata con tema
       ├── DiceButton.tsx     ← Pulsante dado singolo
       └── ThemePicker.tsx    ← Selettore temi

📁 screens/
   ├── HomeScreen.tsx    → Logo + nome app
   ├── DicesScreen.tsx   → Lancio dadi (d4–d20)
   └── SettingsScreen.tsx → Impostazioni + cambio tema

📁 assets/
   └── logo.png

📄 App.tsx               → Solo providers + AppNavigator
```

## 🎨 Temi disponibili

| Tema | Descrizione |
|------|-------------|
| `default` | ☀️ Chiaro · stile Apple |
| `obsidian` | 🌑 Scuro · viola epico |
| `neon` | 💚 Cyberpunk · verde glow |
| `stone` | 🪨 Caldo · marrone naturale |

Si cambiano dal file `App.tsx` (import) o dalle Impostazioni dell'app.

## 🧩 Componenti Prism UI usabili

| Componente | Esempi |
|---|---|
| `Button` | variant: solid, outline, ghost, danger, subtle — size: sm, md, lg |
| `Card` | variant: default, elevated, outlined, ghost — ha .Header, .Title, .Body, .Footer |
| `Badge` | variant: solid, outline, subtle — size: sm, md, lg — prop color per colore custom |
| `Input` | variant: default, error, success — label, leftIcon, rightIcon, helperText |
| `Avatar` | size: xs, sm, md, lg, xl — fallback per le iniziali — Avatar.Group per stack |
| `Tabs` | tabs array con { label, content } |
| `Modal` | visible, onClose, title — Modal.Sheet per bottom sheet |

## 💡 Comandi

```bash
npm start          # Avvia Expo
npm run ios        # Avvia su iOS
npm run android    # Avvia su Android
```

## 📝 Regole (per me)

- I colori vanno sempre presi dal tema con `useTokens()` — mai hardcodati
- I componenti nuovi vanno in `components/custom/`
- Le pagine vanno in `screens/`
