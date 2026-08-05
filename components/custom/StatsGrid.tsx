import { View, Text } from 'react-native';
import { useTokens } from '../ui/prism-provider';
import DndIcon from './DndIcon';
import { getAllAbilities, getAbilityModifier, formatModifier } from '../../lib/rules/abilities';
import type { Ability } from '../../types';

type Props = {
  /** Punteggi delle 6 abilità (i valori mancanti contano come 10) */
  scores?: Partial<Record<Ability, number>>;
};

/**
 * Griglia delle 6 statistiche (FOR → CAR), disposta 3 per riga.
 * Ogni tile: acronimo sopra, rombo con l'icona DndIcon dentro,
 * punteggio e modificatore (+3, −1…). Usata nella Scheda Personaggio.
 * Colori 100% dal tema → sicura al cambio tema.
 */
export default function StatsGrid({ scores }: Props) {
  const t = useTokens();
  const abilities = getAllAbilities();

  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: t.spacing[3] }}>
      {abilities.map((ab) => {
        const score = scores?.[ab.name] ?? 10;
        const mod = getAbilityModifier(score);
        return (
          <View
            key={ab.name}
            style={{
              width: '30%',
              borderRadius: t.radius.lg,
              backgroundColor: t.colors.backgroundSecondary,
              borderWidth: 1,
              borderColor: t.colors.border,
              alignItems: 'center',
              paddingVertical: t.spacing[2],
              paddingHorizontal: t.spacing[1],
              gap: t.spacing[1],
              overflow: 'hidden',
            }}
          >
            {/* Acronimo sopra (FOR, DES…) */}
            <Text
              style={{
                fontSize: t.typography.xs,
                fontWeight: '700',
                color: t.colors.foregroundTertiary,
                textTransform: 'uppercase',
                letterSpacing: 0.5,
              }}
            >
              {ab.abbreviation}
            </Text>

            {/* Rombo con icona DndIcon dentro (marginVertical = spazio per le punte) */}
            <View
              style={{
                width: 34,
                height: 34,
                backgroundColor: t.colors.accent + '20',
                borderWidth: 1,
                borderColor: t.colors.accent,
                transform: [{ rotate: '45deg' }],
                alignItems: 'center',
                justifyContent: 'center',
                marginVertical: t.spacing[1.5],
              }}
            >
              <View style={{ transform: [{ rotate: '-45deg' }] }}>
                <DndIcon name={ab.name} size={20} color={t.colors.accent} />
              </View>
            </View>

            {/* Punteggio */}
            <Text style={{ fontSize: t.typography.md, fontWeight: '800', color: t.colors.foreground }}>
              {score}
            </Text>

            {/* Bonus (+3…): positivo = accent, negativo = danger */}
            <View
              style={{
                minWidth: 34,
                paddingHorizontal: t.spacing[1.5],
                paddingVertical: 2,
                borderRadius: t.radius.full,
                backgroundColor: mod >= 0 ? t.colors.accent : t.colors.danger + '22',
                alignItems: 'center',
              }}
            >
              <Text
                style={{
                  fontSize: t.typography.xs,
                  fontWeight: '700',
                  color: mod >= 0 ? t.colors.accentForeground : t.colors.danger,
                }}
              >
                {formatModifier(mod)}
              </Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}
