import { useEffect, useRef, useState, type ComponentRef } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';

import { BrandBackdrop } from '@components/common/brand-backdrop';
import { WORDMARK_TOP } from '@components/common/brand-intro-header';
import { BrandWordmark, WORDMARK_HEIGHT, WORDMARK_WIDTH } from '@components/common/brand-wordmark';
import { OrbitLogo } from '@components/common/orbit-logo';
import { ScreenContainer } from '@components/common/screen-container';
import { FixedColors, Spacing } from '@constants/theme';
import { useTranslation } from '@hooks/use-translation';
import storeFront from '@assets/images/matching/store-front.jpg';
import mcmSymbol from '@assets/images/splash/mcm-symbol.png';

// 시안(393×852) 의 세로 배분입니다. 화면 크기가 달라도 비율이 유지되도록 flex 로 옮겼습니다.
/** 화면 위 ~ 로고 아래 */
const LOGO_SLOT_FLEX = 163;
/** 로고 아래 ~ 안내 문구 아래 */
const MESSAGE_SLOT_FLEX = 281;
/** 안내 문구 아래 ~ 화면 끝 */
const SYMBOL_SLOT_FLEX = 408;
/** 시안에서 심벌 아래 남는 여백 */
const SYMBOL_BOTTOM = 50;

/**
 * 시안이 정한 화면 아래 MCM 마크 크기.
 * 이 마크가 홈의 워드마크 자리로 옮겨 가므로 크기 계산에 쓰입니다.
 */
const SYMBOL_WIDTH = 45;
const SYMBOL_HEIGHT = 41;

/**
 * 데모용 매칭 대기 시간.
 * 배정 API 가 붙으면 이 타이머를 지우고 실제 배정 결과를 기다립니다.
 */
const DEMO_MATCHING_DELAY_MS = 3000;

/** 매칭이 끝난 뒤 MCM 마크가 홈의 워드마크 자리까지 옮겨 가는 시간. */
const MARK_MOVE_DURATION_MS = 1000;

/**
 * 홈에 없는 것들 — Orbit 로고와 안내 문구 — 은 마크가 움직이기 시작할 때 먼저 빠집니다.
 */
const LEAVING_FADE_OUT_AT = 0.35;
/** 홈 배경은 화면이 실제로 바뀌기 전에 미리 다 덮여 있어야 합니다. */
const BACKDROP_FADE_IN_AT = 0.7;

/**
 * 옮겨 다니는 마크는 해상도가 높은 홈 워드마크 그림을 씁니다.
 * 출발할 때는 화면 아래 심벌과 같은 크기로 줄여 두었다가 제 크기로 자랍니다.
 */
const MARK_START_SCALE = SYMBOL_WIDTH / WORDMARK_WIDTH;

interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

/** 옮겨 다니는 마크의 출발 지점(화면 기준)과 거기서 이동할 거리. */
interface MarkFlight {
  startX: number;
  startY: number;
  moveX: number;
  moveY: number;
}

type MeasurableView = ComponentRef<typeof View>;

/** `measureInWindow` 는 콜백으로만 값을 주므로 `await` 할 수 있게 감쌉니다. */
function measureInWindow(node: MeasurableView) {
  return new Promise<Rect>((resolve) => {
    node.measureInWindow((x, y, width, height) => resolve({ x, y, width, height }));
  });
}

/**
 * 화면 아래 MCM 마크가 지금 어디에 있고, 홈의 워드마크 자리까지 얼마나 가야 하는지 잽니다.
 * 잴 수 없으면 `null` 을 돌려주고, 그때는 애니메이션 없이 화면만 넘깁니다.
 */
async function measureMarkFlight(
  root: MeasurableView | null,
  mark: MeasurableView | null,
  landingX: number,
  landingY: number
): Promise<MarkFlight | null> {
  if (!root || !mark) {
    return null;
  }

  const [rootRect, markRect] = await Promise.all([measureInWindow(root), measureInWindow(mark)]);
  if (markRect.width === 0 || markRect.height === 0) {
    return null;
  }

  // 화면 전체를 채우는 `root` 를 기준으로 옮겨 담습니다. 매칭과 홈이 같은 자리를 차지하므로
  // 이 좌표계에서 잰 값이 홈 화면에서도 그대로 통합니다.
  const startX = markRect.x - rootRect.x + markRect.width / 2;
  const startY = markRect.y - rootRect.y + markRect.height / 2;

  return { startX, startY, moveX: landingX - startX, moveY: landingY - startY };
}

/**
 * 고객 매칭 대기 화면 — `/matching`
 *
 * 정보 입력을 끝낸 고객이 직원이 배정되기를 기다리는 화면입니다.
 * 배정 결과를 받아올 API 가 아직 없어, 데모에서는 3 초 뒤 홈으로 넘어갑니다.
 *
 * 넘어갈 때는 화면을 그냥 바꾸지 않고, 화면 아래 MCM 마크가 홈의 워드마크 자리까지 옮겨 간
 * 뒤에 바꿉니다. 홈 머리말의 워드마크와 이 마크는 같은 그림이라, 자리를 옮기며 커지기만 하면
 * 두 화면의 로고가 그대로 이어집니다. (위쪽 Orbit 로고는 홈에 없으므로 안내 문구와 함께 빠집니다.)
 *
 * 마크가 움직이는 동안 홈의 배경이 대신 깔려서, 실제로 라우트가 바뀌는 순간에는 두 화면이
 * 이미 같은 그림입니다. 그래서 전환이 한 덩어리로 이어져 보입니다.
 * (Figma 의 Smart Animate 를 손으로 옮긴 것입니다. 홈 쪽 전환 효과는 `_layout.tsx` 에서 끕니다.)
 */
export default function CustomerMatchingScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const rootRef = useRef<MeasurableView>(null);
  const markRef = useRef<MeasurableView>(null);
  // 렌더 중 ref 를 읽을 수 없어(react-hooks/refs) 지연 초기화 state 로 값을 한 번만 만듭니다.
  const [progress] = useState(() => new Animated.Value(0));
  const [flight, setFlight] = useState<MarkFlight | null>(null);

  // 매칭이 끝나면 마크가 갈 길을 재 둡니다. 이 값이 생기면 아래 효과가 이어서 움직입니다.
  useEffect(() => {
    let cancelled = false;

    const timer = setTimeout(async () => {
      // 홈은 안전 영역 안쪽에서 좌우로 `Spacing.four` 띄운 자리에 머리말을 놓습니다.
      // (`app/(customer)/home.tsx` 의 `gutter` + `brand-intro-header.tsx` 의 `WORDMARK_TOP`)
      const landing = await measureMarkFlight(
        rootRef.current,
        markRef.current,
        insets.left + Spacing.four + WORDMARK_WIDTH / 2,
        insets.top + WORDMARK_TOP + WORDMARK_HEIGHT / 2
      );

      if (cancelled) {
        return;
      }

      // 잴 수 없으면 화면이 멈춘 것처럼 보이지 않도록 그냥 넘깁니다.
      if (!landing) {
        router.replace('/home');
        return;
      }

      setFlight(landing);
    }, DEMO_MATCHING_DELAY_MS);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [insets.left, insets.top, router]);

  // 사본이 출발 자리에 놓인 다음에 움직입니다. 다 옮기고 나서야 홈으로 넘어갑니다.
  useEffect(() => {
    if (!flight) {
      return;
    }

    const animation = Animated.timing(progress, {
      toValue: 1,
      duration: MARK_MOVE_DURATION_MS,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    });

    animation.start(({ finished }) => {
      if (finished) {
        router.replace('/home');
      }
    });

    return () => animation.stop();
  }, [flight, progress, router]);

  const leavingOpacity = progress.interpolate({
    inputRange: [0, LEAVING_FADE_OUT_AT],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });
  const backdropOpacity = progress.interpolate({
    inputRange: [0, BACKDROP_FADE_IN_AT],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  return (
    // 배경 사진과 스크림은 `ScreenContainer` 바깥에 둡니다. 안에 넣으면 안전 영역 안쪽에
    // 갇혀 노치·홈 인디케이터 자리에 배경색 띠가 생깁니다. 자세한 이유는 `screen-container.tsx` 참고.
    <View ref={rootRef} style={styles.root}>
      <Image
        source={storeFront}
        style={StyleSheet.absoluteFill}
        contentFit="cover"
        accessible={false}
      />
      <View style={[StyleSheet.absoluteFill, styles.scrim]} />

      {/* 넘어가는 동안 홈의 배경을 미리 덮어씌웁니다. */}
      <Animated.View
        style={[StyleSheet.absoluteFill, styles.overlay, { opacity: backdropOpacity }]}
      >
        <BrandBackdrop />
      </Animated.View>

      <ScreenContainer backgroundColor="transparent" style={styles.stage}>
        {/* Orbit 로고는 홈에 없습니다. 안내 문구와 함께 빠집니다. */}
        <Animated.View style={[styles.logoSlot, { opacity: leavingOpacity }]}>
          <OrbitLogo />
        </Animated.View>

        <Animated.View style={[styles.messageSlot, { opacity: leavingOpacity }]}>
          <Text style={styles.message} accessibilityLiveRegion="polite">
            {t('matching.waiting')}
          </Text>
        </Animated.View>

        <View style={styles.symbolSlot}>
          {/* 홈으로 옮겨 갈 마크. 사본이 뜨면 원본은 자리만 지키고 숨습니다. */}
          <View ref={markRef} style={flight ? styles.movedAway : undefined}>
            <Image
              source={mcmSymbol}
              style={styles.symbol}
              contentFit="contain"
              accessible={false}
            />
          </View>
        </View>
      </ScreenContainer>

      {flight ? <FlyingMark flight={flight} progress={progress} /> : null}
    </View>
  );
}

interface FlyingMarkProps {
  flight: MarkFlight;
  progress: Animated.Value;
}

/**
 * 화면 아래에서 홈의 워드마크 자리로 옮겨 가는 MCM 마크.
 *
 * 매칭의 심벌과 홈의 워드마크는 해상도만 다른 같은 그림이라, 흐려지며 바뀌는 구간 없이
 * 자리만 옮기고 크기만 키웁니다. 두 화면에 걸쳐 마크 하나가 이어져 보이는 게 이 전환의 핵심입니다.
 * 원본 심벌은 이 사본이 뜨는 동안 숨어 있습니다.
 */
function FlyingMark({ flight, progress }: FlyingMarkProps) {
  const translateX = progress.interpolate({ inputRange: [0, 1], outputRange: [0, flight.moveX] });
  const translateY = progress.interpolate({ inputRange: [0, 1], outputRange: [0, flight.moveY] });
  const scale = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [MARK_START_SCALE, 1],
  });

  return (
    <Animated.View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={[
        styles.flight,
        { left: flight.startX, top: flight.startY, transform: [{ translateX }, { translateY }] },
      ]}
    >
      <Animated.View style={[styles.flightWordmark, { transform: [{ scale }] }]}>
        <BrandWordmark />
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: FixedColors.splashBackground,
  },
  // 시안의 오버레이는 그라데이션이 아니라 화면 전체에 고르게 깔린 검정 50% 입니다.
  // 화면 전체를 덮는 층이라, 누르기가 그대로 아래로 내려가게 둡니다.
  scrim: {
    backgroundColor: FixedColors.scrim,
    pointerEvents: 'none',
  },
  overlay: {
    pointerEvents: 'none',
  },
  stage: {
    paddingVertical: 0,
    gap: 0,
  },
  logoSlot: {
    flex: LOGO_SLOT_FLEX,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  movedAway: {
    opacity: 0,
  },
  messageSlot: {
    flex: MESSAGE_SLOT_FLEX,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  message: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '500',
    color: FixedColors.onDark,
    textAlign: 'center',
  },
  symbolSlot: {
    flex: SYMBOL_SLOT_FLEX,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: SYMBOL_BOTTOM,
  },
  symbol: {
    width: SYMBOL_WIDTH,
    height: SYMBOL_HEIGHT,
  },
  // 크기 없는 점 하나를 마크의 한가운데에 두고, 그 점을 옮깁니다.
  // 마크는 자기 크기의 절반만큼 당겨서 그 점에 중심을 맞춥니다.
  flight: {
    position: 'absolute',
    width: 0,
    height: 0,
    pointerEvents: 'none',
  },
  flightWordmark: {
    position: 'absolute',
    left: -WORDMARK_WIDTH / 2,
    top: -WORDMARK_HEIGHT / 2,
  },
});
