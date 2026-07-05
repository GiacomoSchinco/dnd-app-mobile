const fs = require('fs');
const path = require('path');
const dataDir = path.join(__dirname, '..', 'assets', 'data');
let errors = [];
let warnings = [];
let ok = 0;

function check(cond, msg) {
  if (!cond) errors.push('❌ ' + msg);
}
function warn(cond, msg) {
  if (!cond) warnings.push('⚠️ ' + msg);
}

// ── 1. ABILITIES ──
const ab = JSON.parse(fs.readFileSync(path.join(dataDir, 'abilities.json'), 'utf8'));
ok++;
check(Array.isArray(ab), 'abilities non è un array');
check(ab.length === 6, 'abilities: dovrebbero essere 6, trovati ' + ab.length);
const abIds = ab.map(a => { check(a.id && a.name && a.name_it && a.abbreviation && a.description, 'abilities: campo mancante in id=' + a.id); return a.id; });
check(new Set(abIds).size === abIds.length, 'abilities: id duplicati');
console.log('1/11 abilities.json ✅ (' + ab.length + ' abilità)');

// ── 2. SKILLS ──
const sk = JSON.parse(fs.readFileSync(path.join(dataDir, 'skills.json'), 'utf8'));
ok++;
check(Array.isArray(sk), 'skills non è un array');
check(sk.length === 18, 'skills: dovrebbero essere 18, trovati ' + sk.length);
sk.forEach(s => {
  check(s.id && s.name && s.name_it && s.ability && s.description, 'skills: campo mancante in id=' + s.id);
  check(['strength','dexterity','constitution','intelligence','wisdom','charisma'].includes(s.ability), 'skills: ability "' + s.ability + '" non valida in ' + s.name);
});
console.log('2/11 skills.json ✅ (' + sk.length + ' skill)');

// ── 3. RACES ──
const rc = JSON.parse(fs.readFileSync(path.join(dataDir, 'races.json'), 'utf8'));
ok++;
check(Array.isArray(rc), 'races non è un array');
rc.forEach(r => {
  check(r.id && r.name && r.speed && r.size && r.traits && r.languages, 'races: campo mancante in id=' + r.id);
  check(['Small','Medium'].includes(r.size), 'races: size "' + r.size + '" non valida in ' + r.name);
});
console.log('3/11 races.json ✅ (' + rc.length + ' razze)');

// ── 4. CLASSES ──
const cl = JSON.parse(fs.readFileSync(path.join(dataDir, 'classes.json'), 'utf8'));
ok++;
check(Array.isArray(cl), 'classes non è un array');
const clIds = [];
const clNames = [];
cl.forEach(c => {
  check(c.id && c.name && c.hit_die && c.primary_ability && c.saving_throws && c.proficiencies && c.features && c.hit_points, 'classes: campo mancante in id=' + c.id);
  clIds.push(c.id);
  clNames.push(c.name.toLowerCase());
  check(['d6','d8','d10','d12'].includes(c.hit_die), 'classes: hit_die "' + c.hit_die + '" non valido in ' + c.name);
  c.features.forEach(f => check(f.name && f.level, 'classes: feature senza nome/livello in ' + c.name));
});
console.log('4/11 classes.json ✅ (' + cl.length + ' classi)');

// ── 5. SUBCLASSES ──
const sc = JSON.parse(fs.readFileSync(path.join(dataDir, 'subclasses.json'), 'utf8'));
ok++;
check(Array.isArray(sc), 'subclasses non è un array');
sc.forEach(s => {
  check(s.id && s.class_id && s.name && s.features, 'subclasses: campo mancante in id=' + s.id);
  check(clIds.includes(s.class_id), 'subclasses: class_id=' + s.class_id + ' inesistente in classes.json (' + s.name + ')');
  s.features.forEach(f => check(f.name && f.level, 'subclasses: feature senza nome/livello in ' + s.name));
});
console.log('5/11 subclasses.json ✅ (' + sc.length + ' sottoclassi)');

// ── 6. BACKGROUNDS ──
const bg = JSON.parse(fs.readFileSync(path.join(dataDir, 'backgrounds.json'), 'utf8'));
ok++;
check(Array.isArray(bg), 'backgrounds non è un array');
const bgIds = [];
bg.forEach(b => {
  check(b.id && b.name && b.description && b.ability_score_boosts && b.skills, 'backgrounds: campo mancante in id=' + b.id);
  bgIds.push(b.id);
});
console.log('6/11 backgrounds.json ✅ (' + bg.length + ' background)');

// ── 7. FEATS ──
const ft = JSON.parse(fs.readFileSync(path.join(dataDir, 'feats.json'), 'utf8'));
ok++;
check(Array.isArray(ft), 'feats non è un array');
ft.forEach(f => {
  check(f.id && f.name && f.category && f.level_requirement !== undefined, 'feats: campo mancante in id=' + f.id);
  check(['origin','general','epic_boon'].includes(f.category), 'feats: categoria "' + f.category + '" non valida in ' + f.name);
});
console.log('7/11 feats.json ✅ (' + ft.length + ' talenti)');

// ── 8. ITEMS ──
const it = JSON.parse(fs.readFileSync(path.join(dataDir, 'items.json'), 'utf8'));
ok++;
check(Array.isArray(it), 'items non è un array');
const itIds = [];
let stringProps = 0, objProps = 0;
it.forEach(i => {
  check(i.id && i.name && i.type && i.weight !== undefined && i.value !== undefined && i.rarity, 'items: campo mancante in id=' + i.id);
  itIds.push(i.id);
  if (typeof i.properties === 'string') stringProps++;
  else if (typeof i.properties === 'object' && i.properties !== null) objProps++;
});
warn(stringProps === 0 || objProps === 0, 'items: properties in formato misto (' + stringProps + ' string, ' + objProps + ' oggetti)');
console.log('8/11 items.json ✅ (' + it.length + ' oggetti)');

// ── 9. SPELLS ──
const sp = JSON.parse(fs.readFileSync(path.join(dataDir, 'spells.json'), 'utf8'));
ok++;
check(Array.isArray(sp), 'spells non è un array');
sp.forEach(s => {
  check(s.id && s.name && s.level !== undefined && s.school && s.classes && s.casting, 'spells: campo mancante in id=' + s.id);
});
console.log('9/11 spells.json ✅ (' + sp.length + ' incantesimi)');

// ── 10. EQUIPMENT_PRESET ──
const eq = JSON.parse(fs.readFileSync(path.join(dataDir, 'equipment_preset.json'), 'utf8'));
ok++;
check(Array.isArray(eq), 'equipment_preset non è un array');
eq.forEach(e => {
  check(e.id && e.type && e.target_id && e.items, 'equipment_preset: campo mancante in id=' + e.id);
  check(['class','background'].includes(e.type), 'equipment_preset: type "' + e.type + '" non valido in id=' + e.id);
  e.items.forEach(item => {
    check(itIds.includes(item.item_id), 'equipment_preset: item_id=' + item.item_id + ' non trovato in items.json');
  });
  if (e.type === 'class') check(clIds.includes(e.target_id), 'equipment_preset: target_id=' + e.target_id + ' (class) non trovato in classes.json');
  if (e.type === 'background') check(bgIds.includes(e.target_id), 'equipment_preset: target_id=' + e.target_id + ' (background) non trovato in backgrounds.json');
});
console.log('10/11 equipment_preset.json ✅ (' + eq.length + ' preset)');

// ── 11. PROGRESSION ──
const pr = JSON.parse(fs.readFileSync(path.join(dataDir, 'progression.json'), 'utf8'));
ok++;
check(pr.shared && pr.classes, 'progression: mancano shared o classes');
check(pr.shared.proficiency_bonus && pr.shared.asi_levels, 'progression: shared incompleto');
check(Object.keys(pr.shared.proficiency_bonus).length === 20, 'progression: proficiency_bonus dovrebbe avere 20 livelli');
const prClasses = Object.keys(pr.classes);
check(prClasses.length === 12, 'progression: dovrebbero esserci 12 classi, trovate ' + prClasses.length);
prClasses.forEach(k => {
  const c = pr.classes[k];
  check(c.label && c.subclass_levels && c.features_by_level, 'progression: campo mancante in ' + k);
  check(Object.keys(c.features_by_level).length === 20, 'progression: ' + k + ' dovrebbe avere 20 livelli, trovati ' + Object.keys(c.features_by_level).length);
  check(clNames.includes(k), 'progression: chiave "' + k + '" non corrisponde a nessuna classe in classes.json');
});
console.log('11/11 progression.json ✅ (' + prClasses.length + ' classi x 20 livelli)');

// ── 12. SPELLCASTING ──
const spc = JSON.parse(fs.readFileSync(path.join(dataDir, 'spellcasting.json'), 'utf8'));
ok++;
check(spc.cantrips && spc.spells_known && spc.spell_slots && spc.pact_magic && spc.caster_types, 'spellcasting: sezioni mancanti');
const spcClasses = Object.keys(spc.caster_types);
check(spcClasses.length === 8, 'spellcasting: dovrebbero esserci 8 classi, trovate ' + spcClasses.length);
check(['full','half','pact'].every(t => spcClasses.some(c => spc.caster_types[c] === t)), 'spellcasting: mancano tipi caster (full/half/pact)');
console.log('12/12 spellcasting.json ✅ (' + spcClasses.length + ' classi, ' + Object.keys(spc.cantrips).length + ' tabelle trucchetti)');

// ── RIEPILOGO ──
console.log('');
console.log('═══════════════════════════════════');
console.log('FILE VALIDI: ' + ok + '/11');
if (errors.length) {
  console.log('ERRORI (' + errors.length + '):');
  errors.forEach(e => console.log('  ' + e));
} else {
  console.log('✅ NESSUN ERRORE');
}
if (warnings.length) {
  console.log('AVVISI (' + warnings.length + '):');
  warnings.forEach(w => console.log('  ' + w));
}
console.log('═══════════════════════════════════');
process.exit(errors.length > 0 ? 1 : 0);
