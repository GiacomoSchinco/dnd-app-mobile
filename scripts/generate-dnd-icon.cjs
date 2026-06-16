const fs = require('fs');
const path = require('path');

const dices = ['d4','d6','d8','d10','d12','d20'];
const svgs = {};
dices.forEach(d => {
  svgs[d] = fs.readFileSync(path.join(__dirname, '..', 'assets/icon/dice', d+'.svg'), 'utf-8').trim();
});

let code = `import { View } from 'react-native';
import { SvgXml } from 'react-native-svg';

function svg(xml, color) {
  return xml.replace(/fill="#000"/g, 'fill="' + color + '"');
}

const DICE_SVGS: Record<string, string> = {
`;

dices.forEach(d => {
  code += `  ${d}: \`${svgs[d]}\`,\n`;
});

code += `};

export type DiceName = 'd4' | 'd6' | 'd8' | 'd10' | 'd12' | 'd20';

type Props = {
  name: DiceName;
  size?: number;
  color?: string;
};

export default function DndIcon({ name, size = 24, color = '#FFFFFF' }: Props) {
  const xml = DICE_SVGS[name];
  if (!xml) return null;

  return (
    <View style={{ width: size, height: size }}>
      <SvgXml xml={svg(xml, color)} width={size} height={size} />
    </View>
  );
}
`;

fs.writeFileSync(path.join(__dirname, '..', 'components/custom/DndIcon.tsx'), code);
console.log('DndIcon.tsx generated successfully!');
