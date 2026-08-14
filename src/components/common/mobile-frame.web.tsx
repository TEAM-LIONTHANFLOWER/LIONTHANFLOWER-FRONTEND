import type { PropsWithChildren } from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import {
  SafeAreaInsetsContext,
  useSafeAreaInsets,
  type EdgeInsets,
} from 'react-native-safe-area-context';

import { BrandColors, MobileFrameWidth } from '@constants/theme';

/**
 * 데스크톱 브라우저에는 노치도 홈 인디케이터도 없어 안전 영역이 0 으로 잡힙니다.
 * 그대로 두면 상단 인디케이터가 화면 맨 위에 붙고 하단 버튼도 끝에 닿아, 시안보다 훨씬
 * 답답해 보입니다. 시안이 그려진 iPhone 14 Pro 의 여백을 넣어 같은 가장자리 간격을 만듭니다.
 */
const DEVICE_INSETS: EdgeInsets = { top: 59, bottom: 34, left: 0, right: 0 };

/**
 * 웹에서 앱을 모바일 너비 안에 가둡니다.
 *
 * 높이는 제한하지 않고 브라우저를 꽉 채웁니다. 폭만 시안 기준(393)으로 묶어
 * 화면 가운데 세우고, 나머지 공간은 배경색으로 둡니다.
 *
 * 창이 프레임보다 넓을 때만 가두고, 모바일 브라우저처럼 화면이 이미 좁으면
 * 프레임이 화면을 그대로 꽉 채웁니다. 이때 안전 영역도 브라우저가 알려주는 실제 값을 씁니다.
 *
 * 감쌀지 말지를 분기하지 않고 스타일만 바꾸는 이유는, 정적 렌더(SSG) 시점에는 창 크기를
 * 알 수 없어 트리 모양이 서버와 클라이언트에서 달라지면 하이드레이션이 어긋나기 때문입니다.
 */
export function MobileFrame({ children }: PropsWithChildren) {
  const { width } = useWindowDimensions();
  const browserInsets = useSafeAreaInsets();

  const isFramed = width > MobileFrameWidth;

  return (
    <View style={styles.page}>
      <View style={[styles.frame, isFramed && styles.framed]}>
        <SafeAreaInsetsContext.Provider value={isFramed ? DEVICE_INSETS : browserInsets}>
          {children}
        </SafeAreaInsetsContext.Provider>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: BrandColors.frameBackdrop,
  },
  frame: {
    width: '100%',
    height: '100%',
  },
  // 위아래가 뷰포트 끝에 닿으므로 모서리는 둥글리지 않습니다.
  // 그림자는 좌우로만 보이며 컬럼을 배경에서 떼어놓는 역할을 합니다.
  framed: {
    maxWidth: MobileFrameWidth,
    overflow: 'hidden',
    boxShadow: '0 0 64px rgba(0, 0, 0, 0.45)',
  },
});
