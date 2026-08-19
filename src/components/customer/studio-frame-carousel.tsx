import { Image } from 'expo-image';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import type { StudioFrame } from '@/types/studio';
import { STUDIO_FRAME_HEIGHT, STUDIO_FRAME_WIDTH } from '@components/customer/studio-frame-card';
import { resolveStudioFrameSource } from '@constants/studio-frame-assets';
import { FixedColors, Spacing, Typography } from '@constants/theme';
import { useTranslation } from '@hooks/use-translation';

interface StudioFrameCarouselProps {
  frames: StudioFrame[];
  selectedFrameType: string | null;
  onSelect: (frame: StudioFrame) => void;
  style?: StyleProp<ViewStyle>;
}

/**
 * 옆으로 넘겨 고르는 프레임 캐러셀. 서버가 내려준 투명 PNG 를 그대로 썸네일로 보여줍니다.
 *
 * 시안에서 카드 줄이 화면 오른쪽 끝을 넘어 이어집니다. 그래서 화면 좌우 여백 바깥에 놓고,
 * 대신 좌우 여백을 이 컴포넌트가 스크롤 콘텐츠에 직접 넣습니다.
 * 여백 안에 갇히면 세로 스크롤 영역에서 오른쪽이 잘려 마지막 카드가 끊겨 보입니다.
 */
export function StudioFrameCarousel({
  frames,
  selectedFrameType,
  onSelect,
  style,
}: StudioFrameCarouselProps) {
  const { t } = useTranslation();

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      accessibilityRole="radiogroup"
      style={style}
      contentContainerStyle={styles.content}
    >
      {frames.map((frame) => {
        const source = resolveStudioFrameSource(frame);

        return (
          <Pressable
            key={frame.frameType}
            accessibilityRole="radio"
            accessibilityLabel={frame.displayName}
            accessibilityState={{ selected: frame.frameType === selectedFrameType }}
            onPress={() => onSelect(frame)}
            style={styles.card}
          >
            {source ? (
              <Image
                source={source}
                style={styles.overlay}
                contentFit="contain"
                accessible={false}
              />
            ) : (
              <View style={styles.placeholder}>
                <Text style={styles.placeholderText}>{t('studio.framePreviewUnavailable')}</Text>
              </View>
            )}
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: Spacing.three,
    paddingHorizontal: Spacing.four,
  },
  card: {
    width: STUDIO_FRAME_WIDTH,
    height: STUDIO_FRAME_HEIGHT,
    backgroundColor: FixedColors.frameWindowFill,
    overflow: 'hidden',
  },
  overlay: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.two,
  },
  placeholderText: {
    ...Typography.bodyKo13,
    color: FixedColors.onDark,
    textAlign: 'center',
  },
});
