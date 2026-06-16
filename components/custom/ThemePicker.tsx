import { View, Text, Pressable } from 'react-native';
import { useTokens, useTheme } from '../ui/prism-provider';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import defaultTheme from '../ui/themes/default';
import obsidianTheme from '../ui/themes/obsidian';
import neonTheme from '../ui/themes/neon';
import stoneTheme from '../ui/themes/stone';

const themes = [
  { key: 'default', theme: defaultTheme, label: 'Default', desc: 'Chiaro · stile Apple', emoji: '☀️' },
  { key: 'obsidian', theme: obsidianTheme, label: 'Obsidian', desc: 'Scuro · viola epico', emoji: '🌑' },
  { key: 'neon', theme: neonTheme, label: 'Neon', desc: 'Cyberpunk · verde glow', emoji: '💚' },
  { key: 'stone', theme: stoneTheme, label: 'Stone', desc: 'Caldo · marrone naturale', emoji: '🪨' },
];

export default function ThemePicker() {
  const t = useTokens();
  const { theme: activeTheme, setTheme } = useTheme() as unknown as {
    theme: { name: string; colors: Record<string, string>; [key: string]: any };
    setTheme: (theme: any, options?: any) => void;
  };

  return (
    <View>
      <Text style={{ color: t.colors.foreground, fontSize: t.typography.md, fontWeight: t.typography.semibold, marginBottom: 12 }}>
        🎨 Scegli il tema
      </Text>
      <View style={{ gap: 10 }}>
        {themes.map((item) => {
          const isActive = activeTheme.name === item.theme.name;
          return (
            <Pressable key={item.key} onPress={() => setTheme(item.theme)}>
              <Card variant={isActive ? 'elevated' : 'outlined'}>
                <Card.Body>
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 }}>
                      <Text style={{ fontSize: 28 }}>{item.emoji}</Text>
                      <View style={{ flex: 1 }}>
                        <Text style={{ color: t.colors.foreground, fontSize: t.typography.base, fontWeight: t.typography.semibold }}>
                          {item.label}
                        </Text>
                        <Text style={{ color: t.colors.foregroundSecondary, fontSize: t.typography.sm }}>
                          {item.desc}
                        </Text>
                      </View>
                    </View>
                    {isActive && (
                      <Badge variant="solid" size="sm" color={t.colors.success}>Attivo</Badge>
                    )}
                  </View>
                  {/* Palette preview */}
                  <View style={{ flexDirection: 'row', gap: 4, marginTop: 10 }}>
                    <View style={{ width: 20, height: 20, borderRadius: 6, backgroundColor: item.theme.colors.background, borderWidth: 1, borderColor: item.theme.colors.border }} />
                    <View style={{ width: 20, height: 20, borderRadius: 6, backgroundColor: item.theme.colors.accent }} />
                    <View style={{ width: 20, height: 20, borderRadius: 6, backgroundColor: item.theme.colors.success }} />
                    <View style={{ width: 20, height: 20, borderRadius: 6, backgroundColor: item.theme.colors.warning }} />
                    <View style={{ width: 20, height: 20, borderRadius: 6, backgroundColor: item.theme.colors.danger }} />
                    <View style={{ width: 20, height: 20, borderRadius: 6, backgroundColor: item.theme.colors.card, borderWidth: 1, borderColor: item.theme.colors.cardBorder }} />
                  </View>
                </Card.Body>
              </Card>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
