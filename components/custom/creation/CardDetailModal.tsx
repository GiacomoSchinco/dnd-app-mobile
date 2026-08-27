import { Image, Text, View } from 'react-native';
import { useTokens } from '../../ui/prism-provider';
import { s } from '../../../utils/style-helpers';
import BottomModal from '../BottomModal';
import type { CardCarouselItem } from '../CardCarousel';

type Props = {
  /** Card in dettaglio (null = modale chiuso) */
  item: CardCarouselItem | null;
  onClose: () => void;
};

/**
 * Modale col DETTAGLIO COMPLETO di una card del carousel (classe, razza,
 * background, sottoclasse). Le card troncano la descrizione a 4 righe: qui
 * si legge il testo integrale senza interrompere il flusso di scelta.
 */
export default function CardDetailModal({ item, onClose }: Props) {
  const t = useTokens();

  return (
    <BottomModal visible={item != null} onClose={onClose} showCloseButton>
      {item && (
        <View style={{ gap: t.spacing[3] }}>
          {item.image && (
            <View style={[s.center, { marginBottom: t.spacing[1] }]}>
              <View
                style={{
                  width: 88,
                  height: 88,
                  borderRadius: 44,
                  overflow: 'hidden',
                  borderWidth: 2,
                  borderColor: t.colors.accent,
                  backgroundColor: t.colors.backgroundSecondary,
                }}
              >
                <Image source={item.image} style={{ width: 88, height: 88 }} resizeMode="cover" />
              </View>
            </View>
          )}

          {item.badge && (
            <Text
              style={{
                fontSize: t.typography.xs,
                fontWeight: t.typography.semibold,
                color: t.colors.accent,
                textTransform: 'uppercase',
                letterSpacing: 0.5,
              }}
            >
              {item.badge}
            </Text>
          )}

          <Text style={{ fontSize: t.typography.xl, fontWeight: '800', color: t.colors.foreground }}>
            {item.label}
          </Text>

          {item.sublabel && (
            <Text style={{ fontSize: t.typography.sm, color: t.colors.foregroundSecondary }}>
              {item.sublabel}
            </Text>
          )}

          <Text style={{ fontSize: t.typography.sm, color: t.colors.foregroundSecondary, lineHeight: 20 }}>
            {item.desc}
          </Text>

          <Text style={{ fontSize: t.typography.xs, color: t.colors.foregroundTertiary, marginTop: t.spacing[2] }}>
            Tocca fuori per chiudere.
          </Text>
        </View>
      )}
    </BottomModal>
  );
}
