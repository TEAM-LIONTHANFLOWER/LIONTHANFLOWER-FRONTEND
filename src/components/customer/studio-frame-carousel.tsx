import { ScrollView, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';

import { StudioFrameCard } from '@components/customer/studio-frame-card';
import { Spacing } from '@constants/theme';
import { STUDIO_FRAME_IDS } from '@constants/studio';
import type { StudioFrameId } from '@/types/studio';

interface StudioFrameCarouselProps {
  selectedFrameId: StudioFrameId | null;
  onSelect: (frameId: StudioFrameId) => void;
  style?: StyleProp<ViewStyle>;
}

/**
 * 옆으로 넘겨 고르는 프레임 캐러셀.
 *
 * 시안에서 카드 줄이 화면 오른쪽 끝을 넘어 이어집니다. 그래서 화면 좌우 여백 바깥에 놓고,
 * 대신 좌우 여백을 이 컴포넌트가 스크롤 콘텐츠에 직접 넣습니다.
 * 여백 안에 갇히면 세로 스크롤 영역에서 오른쪽이 잘려 마지막 카드가 끊겨 보입니다.
 */
export function StudioFrameCarousel({
  selectedFrameId,
  onSelect,
  style,
}: StudioFrameCarouselProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      accessibilityRole="radiogroup"
      style={style}
      contentContainerStyle={styles.content}
    >
      {STUDIO_FRAME_IDS.map((frameId) => (
        <StudioFrameCard
          key={frameId}
          frameId={frameId}
          selected={frameId === selectedFrameId}
          onSelect={() => onSelect(frameId)}
        />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: Spacing.three,
    paddingHorizontal: Spacing.four,
  },
});
