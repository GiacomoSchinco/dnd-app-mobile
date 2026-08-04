# Icone NON DndIcon — elenco per la sostituzione

> **Scopo**: inventario completo di tutte le icone che **non** usano il sistema `DndIcon`
> (SVG da `assets/icon/`), incluse le emoji usate come icone. Serve come checklist per
> caricare icone personalizzate e poi sostituirle una a una.

**Come sostituire**: le icone DndIcon vivono in `assets/icon/` (file SVG) e vengono esposte
in `components/custom/DndIcon.tsx`. Per usarne una basta passare `iconNode={<DndIcon .../>}`
a `ScreenHeader`/`ListItem` o `<DndIcon name="..." />`.

---

## 1. Ionicons (`@expo/vector-icons`) — 13 punti

Le icone Ionicons sono usate in **3 posti**: tab bar, header schermate e chevron delle card.

### 1a. Tab bar (bassa priorità estetica, ma non-DndIcon)
Definite in `components/custom/navigation/tab-config.ts` e renderizzate in `components/custom/AppNavigator.tsx` (riga 90).

| Tab | Icona attiva | Icona inattiva |
|-----|-------------|----------------|
| Home | `home` | `home-outline` |
| Scheda | `person` | `person-outline` |
| Magie | `flash` | `flash-outline` |
| Oggetti | `cube` | `cube-outline` |
| Altro | `ellipsis-horizontal` | `ellipsis-horizontal-outline` |

Nota: fallback `help-outline` in `AppNavigator.tsx` (riga 87-89) se una tab non viene trovata.

### 1b. Icone header `ScreenHeader` (Ionicons)
`ScreenHeader` (`components/custom/ScreenHeader.tsx`, riga 31) renderizza Ionicons se non gli passi `iconNode` con un `DndIcon`.

| File | Riga | Icona | Contesto |
|------|------|-------|----------|
| `screens/characters/CharacterCreateScreen.tsx` | 48 | `person-add-outline` | Header "Nuovo Personaggio" |
| `screens/characters/CharacterDetailScreen.tsx` | 67 | `person-outline` | Header "Scheda Personaggio" |
| `screens/compendium/ItemsScreen.tsx` | 84 | `cube-outline` | Header "Oggetti" |
| `screens/compendium/SpellsScreen.tsx` | 84 | `flash-outline` | Header "Magie" |
| `screens/compendium/CompendioScreen.tsx` | 78 | `book-outline` | Header "Compendio" |
| `screens/more/MoreScreen.tsx` | 32 | `ellipsis-horizontal-outline` | Header "Altro" |
| `screens/more/SettingsScreen.tsx` | 19 | `settings-outline` | Header "Impostazioni" |

> Le schermate del Compendio (`ClassiListScreen`, `RazzeListScreen`, `BackgroundListScreen`,
> `TalentiListScreen`, `EquipaggiamentoListScreen`) usano **già** `iconNode={<DndIcon/>}` via
> `CompendiumList` → non sono in elenco.

### 1c. Ionicons altrove
| File | Riga | Icona | Contesto |
|------|------|-------|----------|
| `components/custom/Items/ItemCard.tsx` | 49 | `chevron-forward` | Freccia destra della card oggetto |
| `components/custom/Items/ItemDetailModal.tsx` | 5 | *(import non usato)* | Import Ionicons **morto** → da rimuovere |

---

## 2. SVG inline (`SvgXml`) — 2 punti

Pulsante flottante "Torna su" con chevron-up SVG inline (duplicato identico in 2 file).

| File | Riga | Icona | Contesto |
|------|------|-------|----------|
| `screens/compendium/ItemsScreen.tsx` | 125 | chevron-up (SVG inline) | Pulsante "torna su" flottante |
| `screens/compendium/SpellsScreen.tsx` | 131 | chevron-up (SVG inline) | Pulsante "torna su" flottante |

---

## 3. Emoji usate come icone (⚠️ le "più terribili") — 40+ punti

### 3a. Creazione personaggio — icone classe (`screens/characters/CharacterCreateScreen.tsx`, righe 16–27)

> ✅ **RISOLTO (2026-08-03)**: la lista è stata sostituita da `ClassCarousel`
> (`components/custom/ClassCarousel.tsx`, carousel infinito con le icone classe SVG
> ora esposte in `DndIcon`). Le 12 emoji classe sono state rimosse.

| Riga | Emoji | Classe | DndIcon disponibile? |
|------|-------|--------|----------------------|
| 16 | 🪓 | Barbaro | **Sì** → `assets/icon/classes/barbarian.svg` (non esposto) |
| 17 | 🎵 | Bardo | **Sì** → `assets/icon/classes/bard.svg` (non esposto) |
| 18 | ⚜️ | Chierico | **Sì** → `assets/icon/classes/cleric.svg` (non esposto) |
| 19 | 🌿 | Druido | **Sì** → `assets/icon/classes/druid.svg` (non esposto) |
| 20 | ⚔️ | Guerriero | **Sì** → `assets/icon/classes/fighter.svg` (non esposto) |
| 21 | 🥋 | Monaco | **Sì** → `assets/icon/classes/monk.svg` (non esposto) |
| 22 | 🛡️ | Paladino | **Sì** → `assets/icon/classes/paladin.svg` (non esposto) |
| 23 | 🏹 | Ranger | **Sì** → `assets/icon/classes/ranger.svg` (non esposto) |
| 24 | 🗡️ | Ladro | **Sì** → `assets/icon/classes/rogue.svg` (non esposto) |
| 25 | 🔮 | Stregone | **Sì** → `assets/icon/classes/sorcerer.svg` (non esposto) |
| 26 | ☠️ | Warlock | **Sì** → `assets/icon/classes/warlock.svg` (non esposto) |
| 27 | 📜 | Mago | **Sì** → `assets/icon/classes/wizard.svg` (non esposto) |
| 105 | ✓ | Indicatore "selezionato" | — (glyph testo) |

> 💡 **Opportunità**: esistono già 13 SVG classe in `assets/icon/classes/` (incluso `artificer.svg`)
> che NON sono esposti in `DndIcon`. Basterebbe esporli nel file `DndIcon.tsx` per sostituire
> tutte queste emoji senza caricare nulla di nuovo.

### 3b. Scheda personaggio — sezioni (`screens/characters/CharacterDetailScreen.tsx`, righe 18–22)
| Riga | Emoji | Sezione |
|------|-------|---------|
| 18 | 💪 | Caratteristiche |
| 19 | 🔮 | Incantesimi |
| 20 | ⚔️ | Equipaggiamento |
| 21 | ⭐ | Talenti |
| 22 | 📝 | Note |

Altro in questo file:
| Riga | Glyph | Contesto |
|------|-------|----------|
| 53 | 🔮 (fontSize 60) | Stato vuoto "Nessun personaggio selezionato" |
| 129 | › | Freccia righe sezione |

### 3c. Liste Compendio — icone riga (emoji in `ListItem`)
| File | Riga | Emoji | Lista |
|------|------|-------|-------|
| `screens/compendium/BackgroundListScreen.tsx` | 35 | 📜 | Righe background |
| `screens/compendium/RazzeListScreen.tsx` | 35 | 🧝 | Righe razze |
| `screens/compendium/TalentiListScreen.tsx` | 49 | ⭐ | Righe talenti |
| `screens/compendium/EquipaggiamentoListScreen.tsx` | 45 | 🎒 | Righe equipaggiamento |

### 3d. Home
| File | Riga | Glyph | Contesto |
|------|------|-------|----------|
| `screens/home/HomeScreen.tsx` | 83 | 👥 (fontSize 60) | Stato vuoto "Nessun personaggio" |
| `screens/home/HomeScreen.tsx` | 40 | › | Freccia card personaggio |

### 3e. Componenti Magie (`components/custom/Spells/`)
| File | Riga | Glyph | Contesto |
|------|------|-------|----------|
| `CharacterBar.tsx` | 33 | 👤 | "Nessun personaggio — tocca per crearne uno" |
| `CharacterBar.tsx` | 36 | › | Freccia |
| `CharacterPickerModal.tsx` | 50 | 👥 | Titolo "Personaggi" |
| `CharacterPickerModal.tsx` | 75 | ✓ | Check personaggio attivo |
| `SpellFilters.tsx` | 82 | ☆ | Trucchetto (livello 0) |
| `SpellFilters.tsx` | 110 | 🎯 | Chip filtro classe |
| `SpellFilters.tsx` | 129 | ✓ | Toggle "Preparate" |
| `SpellFilters.tsx` | 145 | ★ | Toggle "Preferite" |
| `SpellFilters.tsx` | 194 | ✓ | Selezione "Tutte le classi" |
| `SpellSlotManager.tsx` | 41 | 🔮 (fontSize 2xl) | Stato vuoto "nessuno slot" |
| `SpellSlotManager.tsx` | 146 | ⚡ | Footer "Lungo riposo" |
| `SpellSlotManager.tsx` | 164 | ⚡ | Hint Warlock |
| `SpellCard.tsx` | 71 | ★ / ☆ | Toggle preferita |
| `SpellCard.tsx` | 78 | ✓ / + | Toggle preparata |
| `SpellDetailModal.tsx` | 44 | ✕ | Pulsante chiudi |
| `SpellDetailModal.tsx` | 95 | ★ / ☆ | Bottone "Preferita" |
| `SpellDetailModal.tsx` | 103 | ✓ / + | Bottone "Prepara" |

### 3f. Componenti vari / altre schermate
| File | Riga | Glyph | Contesto |
|------|------|-------|----------|
| `components/custom/ClassAvatar.tsx` | 19 | 🧙 | Fallback avatar classe |
| `components/custom/Items/ItemDetailModal.tsx` | 56 | ✕ | Pulsante chiudi |
| `components/custom/DiceRoller/ResultBreakdown.tsx` | 64 | ✕ | Bottone "Annulla" |
| `components/custom/DiceRoller/StepperControl.tsx` | 43 | + | Bottone incremento |
| `components/custom/BackButton.tsx` | ~31 | ‹ | Freccia indietro (glyph testo) |
| `components/custom/ListItem.tsx` | 75, 100 | › | Freccia destra (entrambe le varianti) |
| `screens/more/SettingsScreen.tsx` | 23 | ℹ️ | Bottone "Info app" |
| `components/custom/ThemePicker.tsx` | 32 | 🎨 | Titolo "Scegli il tema" |

> `screens/more/SettingsScreen.tsx` riga 22: emoji 🎨 solo nel testo dell'`Alert` ("Creato con Prism UI 🎨") — non è un'icona UI, ma se vuoi un'estetica uniforme sistemala anche lì.

### 3g. Emoji SOLO nei commenti (da ignorare, non visibili)
| File | Riga | Emoji |
|------|------|-------|
| `App.tsx` | 11–14 | ☀️ 🌑 💚 🪨 (commenti import temi) |
| `components/custom/ThemePicker.tsx` | 14–16 | 🌑 💚 🪨 (commenti temi disattivati) |

---

## 4. Asset icon ESISTENTI ma NON esposti in `DndIcon` (potenziali sostituti gratuiti)

| Cartella | Contenuto | Stato |
|----------|-----------|-------|
| `assets/icon/classes/` | 13 SVG classi (artificer, barbarian, bard, cleric, druid, fighter, monk, paladin, ranger, rogue, sorcerer, warlock, wizard) | **Non esposti** — le classi usano token PNG (`assets/classes/token_*.png`) |
| `assets/icon/stats/` | 6 SVG abilità (strength, dexterity, constitution, intelligence, wisdom, charisma) | **Non esposti** — potrebbero sostituire 💪 e le sezioni abilità |
| `assets/icon/utility/spell-book.svg` | 1 SVG (libro magie) | **Non esposto** — potrebbe sostituire 📜/📖/🔮 in vari punti |

Esporre questi in `DndIcon.tsx` = sostituzioni immediate senza caricare nuovi asset.

---

## 5. Riepilogo per priorità

1. **Emoji icone** (sez. 3): il grosso del lavoro estetico — 40+ punti.
2. **SVG inline "torna su"** (sez. 2): 2 punti, duplicato da estrarre in un'unica icona.
3. **Ionicons header** (sez. 1b): 7 schermate — sostituibili passando `iconNode={<DndIcon/>}`.
4. **Ionicons tab bar** (sez. 1a): 5 tab — sostituibili in `tab-config.ts` + `AppNavigator.tsx`.
5. **Glyph testo** (› ‹ ✓ ✕ ★ ☆ + ⚡): presenti ovunque come `<Text>` — valutare se sostituirli con icone vere o tenerli come caratteri tipografici (sono nativi e leggibili).
