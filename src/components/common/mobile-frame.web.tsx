import type { PropsWithChildren } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaInsetsContext, type EdgeInsets } from 'react-native-safe-area-context';

import { FixedColors, MobileFrameWidth } from '@constants/theme';

/**
 * 브라우저에는 노치도 홈 인디케이터도 없어 안전 영역이 0 으로 잡힙니다.
 * 그대로 두면 상단 페이지 인디케이터가 화면 맨 위에 붙고 하단 버튼도 끝에 닿아,
 * 시안보다 훨씬 답답해 보입니다. 시안이 그려진 iPhone 14 Pro 의 여백을 넣어 맞춥니다.
 *
 * 창 크기와 상관없이 항상 같은 값을 씁니다. 폭에 따라 달라지면 창을 좁혔을 때
 * 인디케이터가 위로 튀어 올라, 같은 화면인데 배치가 바뀌어 보입니다.
 */
const DEVICE_INSETS: EdgeInsets = { top: 59, bottom: 34, left: 0, right: 0 };

/**
 * 웹에서 앱을 모바일 너비 안에 가둡니다.
 *
 * 높이는 제한하지 않고 브라우저를 꽉 채웁니다. 폭만 시안 기준(393)으로 묶어
 * 화면 가운데 세우고, 나머지 공간은 배경색으로 둡니다.
 *
 * **폭은 CSS 로만 잡습니다. 창 크기를 JS 로 재서 분기하면 안 됩니다.**
 * `width: 100%` 에 `max-width` 를 함께 걸면 브라우저가 알아서 처리합니다 —
 * 창이 넓으면 393 에서 멈추고, 창이 이미 좁으면 `width: 100%` 가 이겨
 * 프레임이 화면을 그대로 채웁니다. 분기가 필요 없습니다.
 *
 * 예전에는 `useWindowDimensions()` 로 창이 프레임보다 넓을 때만 `max-width` 를
 * 붙였는데, 이러면 정적 렌더(SSG)한 프로덕션 빌드에서 프레임이 통째로 사라집니다.
 * SSG 시점에는 창이 없어 폭이 0 으로 잡히고, 그 상태로 `max-width` 가 빠진 HTML 이
 * 만들어집니다. 브라우저에서 다시 계산하면 될 것 같지만, React 는 하이드레이션에서
 * 어긋난 className 을 고쳐 주지 않습니다 — 서버가 보낸 마크업을 그대로 믿습니다.
 * 그래서 한 번 빠진 프레임은 창 크기를 바꿔 다시 그려지기 전까지 돌아오지 않고,
 * 개발 서버에서는 멀쩡한데 배포본만 웹 비율로 보였습니다. (이슈 #26)
 */
export function MobileFrame({ children }: PropsWithChildren) {
  return (
    <View style={styles.page}>
      <View style={styles.frame}>
        <SafeAreaInsetsContext.Provider value={DEVICE_INSETS}>
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
    backgroundColor: FixedColors.frameBackdrop,
  },
  // 위아래가 뷰포트 끝에 닿으므로 모서리는 둥글리지 않습니다.
  // 그림자는 좌우로만 보이며 컬럼을 배경에서 떼어놓는 역할을 합니다.
  // 창이 프레임보다 좁을 때는 그림자가 뷰포트 밖으로 밀려나 보이지 않습니다.
  frame: {
    width: '100%',
    height: '100%',
    maxWidth: MobileFrameWidth,
    overflow: 'hidden',
    boxShadow: '0 0 64px rgba(0, 0, 0, 0.45)',
  },
});
