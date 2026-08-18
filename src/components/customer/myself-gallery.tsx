import { ScrollView, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import {
  STUDIO_FRAME_HEIGHT,
  STUDIO_FRAME_WIDTH,
  StudioFrameCard,
} from '@components/customer/studio-frame-card';
import { Spacing } from '@constants/theme';
import type { StudioFrameId } from '@/types/studio';

/**
 * 시안(1-1 Home)의 한 장 높이. Studio 프레임을 통째로 줄여 쓰기 때문에
 * 폭은 원본 비율에서 따라옵니다 — 프레임 안 글씨와 로고가 눌리지 않아야 해서입니다.
 */
const FRAME_HEIGHT = 314;
const FRAME_SCALE = FRAME_HEIGHT / STUDIO_FRAME_HEIGHT;
const FRAME_WIDTH = STUDIO_FRAME_WIDTH * FRAME_SCALE;

interface MyselfGalleryProps {
  frames: readonly StudioFrameId[];
  style?: StyleProp<ViewStyle>;
}

/**
 * 옆으로 넘겨 보는 `MCM Myself` 줄. Studio 에서 만든 프레임을 작게 줄여 늘어놓습니다.
 *
 * 시안에서 줄이 화면 오른쪽 끝을 넘어 이어집니다. 그래서 화면 좌우 여백 바깥에 놓고,
 * 대신 좌우 여백을 이 컴포넌트가 스크롤 콘텐츠에 직접 넣습니다.
 * 여백 안에 갇히면 세로 스크롤 영역에서 오른쪽이 잘려 마지막 장이 끊겨 보입니다.
 *
 * 프레임은 원본 크기(211×458)로 그린 다음 통째로 줄입니다. 안쪽 자리값이 전부 그 크기를
 * 기준으로 잡혀 있어, 크기만 바꿔 다시 그리면 글씨와 로고가 제자리를 잃습니다.
 */
export function MyselfGallery({ frames, style }: MyselfGalleryProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={style}
      contentContainerStyle={styles.content}
    >
      {frames.map((frameId) => (
        <View key={frameId} style={styles.slot}>
          <StudioFrameCard frameId={frameId} style={styles.frame} />
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: Spacing.two,
    paddingHorizontal: Spacing.four,
  },
  slot: {
    width: FRAME_WIDTH,
    height: FRAME_HEIGHT,
    overflow: 'hidden',
  },
  // 줄인 뒤에도 왼쪽 위 모서리가 자리에 남도록 기준점을 옮깁니다.
  frame: {
    transform: [{ scale: FRAME_SCALE }],
    transformOrigin: 'top left',
  },
});
