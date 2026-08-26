# Icone NON DndIcon — checklist per la sostituzione

> **Scopo**: inventario completo di tutte le icone che **non** usano il sistema `DndIcon`
> (SVG da `assets/icon/`), incluse le emoji usate come icone. Serve come checklist per
> caricare icone personalizzate e poi sostituirle una a una.
>
> **📝 COME USARE QUESTO FILE**: ogni voce delle tabelle emoji ha una colonna **«Mia scelta»**
> VUOTA in fondo. Scrivi lì l'emoji (o il nome dell'icona) che vuoi usare per quel contesto —
> poi si sostituisce nel codice al posto di quella attuale. Le voci già risolte o eliminate
> (es. emoji classi nel wizard, sezioni della Scheda, file morti) sono state rimosse/segnalate.

**Come sostituire**: le icone DndIcon vivono in `assets/icon/` (file SVG) e vengono esposte
in `components/custom/DndIcon.tsx`. Per usarne una basta passare `iconNode={<DndIcon .../>}`
a `ScreenHeader`/`ListItem` o `<DndIcon name="..." />`. Le emoji invece si cambiano
direttamente nel file indicato (sono stringhe letterali nel JSX/TSX).

---

## A. EMOJI usate come icone — elenco completo con stato

> **STATO (aggiornato 2026-08-26)**: A1 ✅ · A2 ✅ · A3 ✅ · A4 ✅ · A5 ✅ · A6 ✅ · A7 ✅
> (✅ = sostituite con DndIcon · ⏳ = ancora emoji da sostituire)

> Le voci risolte mostrano l'icona DndIcon usata; le altre hanno la colonna **«Mia scelta»**
> da compilare con l'emoji/icona che vuoi. Suggerimento: usa emoji coerenti col tema oppure
> le icone SVG della sezione E.

### A1. Stati vuoti (`EmptyState` / `MissingActiveCharacter`) — ✅ RISOLTO

> ✅ **RISOLTO (2026-08-26)**: tutti gli stati vuoti usano ora le icone **DndIcon** da
> `assets/icon/utility/` (game-icons esposte in `DndIcon` come `UtilityName`).
> `EmptyState` ora accetta la prop `dndIcon?: IconName` (niente più emoji).

| Contesto | Icona DndIcon (`utility/`) |
|----------|---------------------------|
| Nessuna magia assegnata al PG | `spell-book` |
| Nessun risultato — ricerca magie | `cauldron` |
| Nessun risultato — ricerca oggetti | `knapsack` |
| Equipaggiamento vuoto / senza PG | `backpack` |
| Tab Abilità senza PG | `bullseye` |
| Tab Talenti senza PG | `medal` |
| Note senza PG | `notebook` |
| Default "nessun personaggio selezionato" | `invisible` |

### A2. Icone di sezione / menu — ✅ RISOLTO

> ✅ **RISOLTO (2026-08-26)**: `SectionButton` ora accetta `dndIcon?: IconName`; il menu Altro
> usa una mappa dichiarativa con `dndIcon` (niente più emoji).

| Contesto | Icona DndIcon (`utility/`) |
|----------|---------------------------|
| Bottone "Salì di livello" (Scheda PG) | `upgrade` |
| Voce menu "Modifica personaggio" | `pencil-ruler` |
| Voce menu "Note" | `notebook` |
| Voce menu "Elimina personaggio" (danger) | `trash-can` |

### A3. Tab Talenti — icone delle card (`screens/characters/FeatsScreen.tsx`) — ✅ RISOLTO

> ✅ **RISOLTO (2026-08-26)**: `FeatureCard`/`FeatCard` ora usano `dndIcon?: IconName`
> (DndIcon in box 40px accentSubtle). Niente più emoji.

| Emoji prima | Card | Icona DndIcon (`utility/`) |
|------------|------|---------------------------|
| 🎖️ | Talento | `medal` |
| 🏆 | Dono epico | `laurel-crown` |
| 🔮 | Iniziato alla Magia (talento di origine) | `magic-swirl` |
| ⚔️ | Caratteristiche di classe | `sword-wound` |
| 🛡️ | Sottoclasse | `rosa-shield` |

### A4. Equipaggiamento — gruppi e righe — ✅ RISOLTO

> ✅ **RISOLTO (2026-08-26)**: i gruppi usano `dndIcon` (DndIcon + SectionTitle); le righe
> usano DndIcon inline (sintonia, colpire/danno); le stats inline perdono le emoji ridondanti
> (la riga mostra già l'icona del tipo).

| Contesto | Icona DndIcon (`utility/`) |
|----------|---------------------------|
| Gruppo "Armi" | `sword-wound` |
| Gruppo "Armature" | `dragon-shield` |
| Gruppo "Munizioni" | `bullseye` |
| Gruppo "Consumabili" | `cauldron` |
| Gruppo "Equipaggiamento" | `knapsack` |
| Fallback riga oggetto (item non trovato) | `knapsack` |
| "Sintonia" | `electric` |
| "Colpire" | `bullseye` |
| "Danno" | `spiky-explosion` |
| Oro / Argento / Rame (label denaro) | `crown-coin` |
| Gittata / CA / danno nelle stats | emoji rimosse (testo puro) |

### A5. Liste Compendio — icone riga + header dettaglio — ✅ RISOLTO

> ✅ **RISOLTO (2026-08-26)**: righe `ListItem` e `CompendiumDetailHeader` ora usano `<DndIcon>`
> (dimensione 20, colore accent; per Talenti il colore categoria).

| Lista | Icona DndIcon (`utility/`) |
|-------|---------------------------|
| Background (riga + header) | `notebook` |
| Razze (riga + header) | `person` |
| Talenti (riga + header) | `medal` |
| Equipaggiamento (riga + header) | `knapsack` |

### A6. Vari / fallback — ✅ RISOLTO

> ✅ **RISOLTO (2026-08-26)**: tutte le emoji vari/fallback sostituite con DndIcon.

| Contesto | Icona DndIcon (`utility/`) |
|----------|---------------------------|
| Barra "Nessun personaggio" (`CharacterBar`) | `person` |
| Fallback avatar classe (`ClassAvatar`) | `classical-knowledge` |
| Bottone "Info app" (`SettingsScreen`) | `info` |
| Titolo "Scegli il tema" (`ThemePicker`) | `palette` |

### A7. Emoji DENTRO i testi (non icone UI, ma visibili) — ✅ RISOLTO

> ✅ **RISOLTO (2026-08-26)**: `Button` ora supporta la prop `icon` (ReactNode prima del testo);
> le emoji decorative nei testi sostituite o rimosse.

| Dove | Emoji prima | Come risolto |
|------|-------------|--------------|
| `SettingsScreen` Alert "Creato con Prism UI 🎨" | 🎨 | emoji rimossa dal testo |
| `BackgroundStep` "Talento: {nome}" | 🎖 | DndIcon `medal` + testo (riga) |
| `HpStep` "Tira il dado" | 🎲 | DndIcon `d20` (prop `icon` di Button) |
| `LevelUpModal` "Tira (dX)" | 🎲 | emoji rimossa (testo) |
| `AbilitiesStep` "Suggerisci" | ✨ | DndIcon `magic-swirl` (prop `icon` di Button) |

> ✅ **RISOLTO / RIMOSSO** (non più in elenco): emoji classi nel wizard (sostituite dal
> `ClassCarousel` con token PNG, 2026-08-03); sezioni emoji della Scheda PG (💪 🔮 ⚔️ ⭐ 📝,
> oggi StatsGrid + tab dedicate); `CharacterPickerModal` e `SpellSlotManager` (file eliminati,
> codice morto); chip 🎯 filtro classe in `SpellFilters` (ora senza emoji); 👥 stato vuoto
> Home (icona tolta — `EmptyState` supporta l'assenza di icona); **tutte le sezioni A1–A7**
> (2026-08-26) ora usano icone `DndIcon` da `assets/icon/utility/`; **icone dadi del Compendio**
> (2026-08-26) sostituite con icone semantiche nel menu (`CompendioScreen`) e negli header
> delle liste (`CompendiumList`): Classi→`sword-wound`, Razze→`person`, Background→`notebook`,
> Talenti→`medal`, Oggetti→`backpack`, Magie→`spell-book`, Equipaggiamento→`knapsack`.

---

## B. Glyph di testo (› ‹ ✓ ✕ ★ ☆ + ⚡) — caratteri tipografici

Presenti ovunque come `<Text>` (nativi e leggibili, ma non in tema). Valutare se sostituirli
con icone vere o tenerli. Se vuoi, compila la colonna **Mia scelta** per contesto.

| Dove | Riga | Glyph | Contesto | **Mia scelta** |
|------|------|-------|----------|----------------|
| `components/custom/ListItem.tsx` | 76, 108 | › | Freccia destra (varianti card/menu) | |
| `components/custom/SectionButton.tsx` | 66 | › | Freccia destra bottone sezione | |
| `components/custom/Spells/CharacterBar.tsx` | 65 | › | Freccia destra barra PG | |
| `components/custom/BackButton.tsx` | 31 | ‹ | Freccia indietro | |
| `components/custom/DetailModalHeader.tsx` | 41 | ✕ | Pulsante chiudi modali (Magia/Oggetto) | |
| `components/custom/Spells/SpellDetailModal.tsx` | 139 | ✕ | Pulsante chiudi | |
| `components/custom/Spells/SpellDetailModal.tsx` | 191 | ★ / ☆ | Bottone "Preferita" | |
| `components/custom/Spells/SpellDetailModal.tsx` | 201 | ✓ / + | Bottone "Prepara" | |
| `components/custom/Spells/SpellCard.tsx` | 87 | ★ / ☆ | Toggle preferita | |
| `components/custom/Spells/SpellCard.tsx` | 97 | ✓ / + | Toggle preparata | |
| `components/custom/Spells/SpellFilters.tsx` | 85 | ☆ | Chip trucchetti (livello 0) | |
| `components/custom/Spells/SpellFilters.tsx` | 118 | ✓ | Toggle "Preparate" | |
| `components/custom/Spells/SpellFilters.tsx` | 123 | ★ | Toggle "Preferite" | |
| `components/custom/Items/ItemCard.tsx` | 89 | ✓ / + | Toggle posseduto | |
| `components/custom/Items/ItemDetailModal.tsx` | 170 | ✓ / + | Bottone "Aggiungi/Rimuovi dall'equipaggiamento" | |
| `components/custom/Items/EquipmentRow.tsx` | 139 | ✕ | Bottone "Rimuovi" | |
| `components/custom/creation/ClassStep.tsx` | 73 | ✕ | Rimozione classe | |
| `components/custom/creation/FeatStep.tsx` | 90 | ✓ / + | Chip selezionato | |
| `components/custom/creation/FeatChoice.tsx` | 158 | ✓ | Scelta selezionata | |
| `components/custom/CircleCheck.tsx` | 28 | ✓ | Icona interna checkbox (default) | |

---

## C. Ionicons (`@expo/vector-icons`) — 16+ punti

### C1. Tab bar
Definite in `components/custom/navigation/tab-config.ts`, renderizzate in
`components/custom/AppNavigator.tsx` (riga ~90). Fallback `help-outline` se la tab non viene
trovata (righe 87-89).

| Tab | Attiva | Inattiva | **Mia scelta** |
|-----|--------|----------|----------------|
| Home (bottone nascosto) | `home` | `home-outline` | |
| Scheda | `person` | `person-outline` | |
| Talenti | `star` | `star-outline` | |
| Equip. | `bag-handle` | `bag-handle-outline` | |
| Magie | `flash` | `flash-outline` | |
| Abilità | `bulb` | `bulb-outline` | |
| Altro | `ellipsis-horizontal` | `ellipsis-horizontal-outline` | |

### C2. Header `ScreenHeader` (Ionicons)
`ScreenHeader` (`components/custom/ScreenHeader.tsx`) renderizza Ionicons se non gli passi
`iconNode` con un `DndIcon`.

| File | Riga | Icona | Contesto | **Mia scelta** |
|------|------|-------|----------|----------------|
| `screens/characters/CharacterCreateScreen.tsx` | 47 | `person-add-outline` | "Nuovo Personaggio" | |
| `screens/characters/CharacterDetailScreen.tsx` | 59 | `person-outline` | "Scheda Personaggio" | |
| `screens/compendium/ItemsScreen.tsx` | 83 | `cube-outline` | "Oggetti" | |
| `screens/compendium/SpellsScreen.tsx` | 189 | `flash-outline` | "Magie" | |
| `screens/compendium/CompendioScreen.tsx` | 75 | `book-outline` | "Compendio" | |
| `screens/more/MoreScreen.tsx` | 70 | `ellipsis-horizontal-outline` | "Altro" | |
| `screens/more/SettingsScreen.tsx` | 19 | `settings-outline` | "Impostazioni" | |

### C3. Altrove
| File | Riga | Icona | Contesto | **Mia scelta** |
|------|------|-------|----------|----------------|
| `components/custom/Items/ItemCard.tsx` | 93 | `chevron-forward` | Freccia destra card oggetto | |
| `components/custom/HomeQuickActions.tsx` | 24, 33 | `settings` + `book` | Pulsanti rapidi Home (Impostazioni/Compendio) | |
| `components/custom/Items/ItemDetailModal.tsx` | 7 | *(import non usato)* | Import Ionicons **morto** → da rimuovere | |

---

## D. SVG inline (`SvgXml`) — 1 punto

FAB "Torna su" con chevron-up SVG inline (componente condiviso, non più duplicato).

| File | Riga | Icona | Contesto | **Mia scelta** |
|------|------|-------|----------|----------------|
| `components/custom/ScrollToTopFab.tsx` | 40 | chevron-up (SVG inline) | Pulsante "torna su" flottante | |

---

## E. Asset icon ESISTENTI ma NON esposti in `DndIcon` (potenziali sostituti gratuiti)

| Cartella | Contenuto | Stato |
|----------|-----------|-------|
| `assets/icon/classes/` | 13 SVG classi (artificer, barbarian, bard, cleric, druid, fighter, monk, paladin, ranger, rogue, sorcerer, warlock, wizard) | **Non esposti** — le classi usano token PNG (`assets/classes/token_*.png`) |
| `assets/icon/stats/` | 6 SVG abilità (strength, dexterity, constitution, intelligence, wisdom, charisma) | **Non esposti** — potrebbero sostituire le emoji sezioni/stats |
| `assets/icon/utility/` | 24 SVG game-icons (backpack, bullseye, cauldron, classical-knowledge, crown-coin, dragon-shield, electric, info, invisible, knapsack, laurel-crown, magic-swirl, medal, notebook, palette, pencil-ruler, person, rosa-shield, spiky-explosion, spell-book, sword-wound, trash-can, trophy-cup, upgrade) | **Esposti in `DndIcon`** (tipo `UtilityName`) — usati da tutte le sezioni A1–A7. ⚠️ `trophy-cup` presente ma non esposto (alternativa a `laurel-crown` per il Dono epico) |

Esporre questi in `DndIcon.tsx` = sostituzioni immediate senza caricare nuovi asset.

---

## F. Riepilogo per priorità

1. **Emoji come icone** (sez. A): il grosso del lavoro estetico — compila la colonna «Mia scelta».
2. **Glyph di testo** (sez. B): valutare se sostituirli con icone vere o tenerli (sono nativi e leggibili).
3. **Ionicons** (sez. C): tab bar, header e chevron — sostituibili passando `iconNode={<DndIcon/>}` o cambiando il nome in `tab-config.ts`.
4. **SVG inline "torna su"** (sez. D): 1 punto condiviso.
5. **Asset non esposti** (sez. E): esporre in `DndIcon` = sostituzioni immediate.
