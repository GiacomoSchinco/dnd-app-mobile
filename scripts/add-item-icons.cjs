const fs = require('fs');
const path = require('path');

const dndIconPath = path.join(__dirname, '..', 'components/custom/DndIcon.tsx');
let content = fs.readFileSync(dndIconPath, 'utf-8');

const items = ['ammunition', 'armor', 'consumable', 'currency', 'gear', 'tool', 'weapon'];
const svgs = {};
items.forEach(d => {
  svgs[d] = fs.readFileSync(path.join(__dirname, '..', 'assets/icon/items', d+'.svg'), 'utf-8').trim();
});

let itemSvgsBlock = '\nconst ITEM_SVGS: Record<string, string> = {\n';
items.forEach(d => {
  itemSvgsBlock += '  ' + d + ': `' + svgs[d] + '`,\n';
});
itemSvgsBlock += '};\n\n';

const idx = content.indexOf('export type IconName');
content = content.slice(0, idx) + itemSvgsBlock + content.slice(idx);

content = content.replace(
  'export type IconName = DiceName | keyof typeof SCHOOL_SVGS;',
  "export type IconName = DiceName | keyof typeof SCHOOL_SVGS | keyof typeof ITEM_SVGS;"
);

content = content.replace(
  "const xml = DICE_SVGS[name] || SCHOOL_SVGS[name];",
  "const xml = DICE_SVGS[name] || SCHOOL_SVGS[name] || ITEM_SVGS[name];"
);

fs.writeFileSync(dndIconPath, content);
console.log('DndIcon.tsx aggiornato con le icone items!');
