import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type LayoutChangeEvent,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';

import { BrandBackdrop } from '@components/common/brand-backdrop';
import { BrandIntroHeader } from '@components/common/brand-intro-header';
import { InitialSetupButton } from '@components/common/initial-setup-button';
import { PageIndicator } from '@components/common/page-indicator';
import { ScreenContainer } from '@components/common/screen-container';
import { VisitMemoryLink } from '@components/common/visit-memory-link';
import { ArcEnvelope, ENVELOPE_HEIGHT } from '@components/customer/arc-envelope';
import { ArcLetterReveal } from '@components/customer/arc-letter-reveal';
import { ARC_ENTRIES } from '@constants/arc';
import { FixedColors, FontFamily, LineHeightRatio, Spacing } from '@constants/theme';
import { useReportActiveTab } from '@hooks/use-report-active-tab';
import { useTranslation } from '@hooks/use-translation';

/** 머리말과 봉투 사이. 시안(393 폭)의 세로 리듬이라 Spacing 스케일에 없는 값입니다. */
const HEADER_TO_CARD = 34;
/** 봉투와 페이지 표시 사이. 표시가 위아래로 들고 있는 터치 여백만큼 뺀 값입니다. */
const CARD_TO_INDICATOR = Spacing.four;

/** 떠 있는 내비게이션이 화면 아래에서 차지하는 높이. `(customer)/_layout.tsx` 의
 * `NAV_AREA_HEIGHT` 와 같은 값이어야 합니다 — 내비게이션은 거기서 그립니다. */
const NAV_AREA_HEIGHT = 118;

/**
 * 더미에 누워 있는 봉투가 가운데 봉투에서 밀려난 거리와 각도.
 *
 * 넘기면 오른쪽 더미의 봉투가 이 자리에서 일어나 가운데로 오고,
 * 보고 있던 봉투는 좌우를 뒤집은 왼쪽 자리로 누우며 물러납니다.
 */
const STACK_OFFSET_X = 148;
const STACK_OFFSET_Y = 149;
const STACK_ROTATION = '14.54deg';
const STACK_ROTATION_REVERSED = '-14.54deg';

/**
 * 더미의 맨 앞 봉투보다 한 장 더 뒤에 놓이는 자리.
 * 여기까지 물러나면 완전히 투명해져서, 더미에는 늘 맨 앞의 한 장만 보입니다.
 * 넘기는 동안 그 뒤의 봉투가 이 자리에서 서서히 나타나 더미를 채웁니다.
 */
const STACK_FAR_OFFSET_X = STACK_OFFSET_X + 26;
const STACK_FAR_OFFSET_Y = STACK_OFFSET_Y + 18;

/** 봉투의 자리를 재는 구간. 0 이 가운데, ±1 이 더미, ±2 가 더미 뒤입니다. */
const POSE_STOPS = [-2, -1, 0, 1, 2] as const;
const POSE_X: number[] = [
  STACK_FAR_OFFSET_X,
  STACK_OFFSET_X,
  0,
  -STACK_OFFSET_X,
  -STACK_FAR_OFFSET_X,
];
const POSE_Y: number[] = [
  STACK_FAR_OFFSET_Y,
  STACK_OFFSET_Y,
  0,
  STACK_OFFSET_Y,
  STACK_FAR_OFFSET_Y,
];
const POSE_ROTATION: string[] = [
  STACK_ROTATION,
  STACK_ROTATION,
  '0deg',
  STACK_ROTATION_REVERSED,
  STACK_ROTATION_REVERSED,
];

/**
 * 겉면이 밝은 면에서 그늘진 면으로 넘어가는 구간.
 *
 * 가운데를 벗어나면 그늘이 먼저 덮이고(±0.5), 더미에 닿을 즈음 밝은 면이 빠집니다(±1).
 * 두 면을 같은 속도로 교차시키면 그 사이에 배경이 비쳐 봉투가 반투명해 보입니다.
 */
const FACE_STOPS = [-2, -1, -0.5, 0, 0.5, 1, 2] as const;
const LIT_FACE_OPACITY: number[] = [0, 0, 1, 1, 1, 0, 0];
const SHADED_FACE_OPACITY: number[] = [0, 1, 1, 0, 1, 1, 0];

/** 넘기는 동안 봉투가 부드럽게 따라오도록 매 프레임 스크롤 위치를 받습니다. */
const SCROLL_THROTTLE_MS = 16;

/** 화면이 열릴 때 머리말과 봉투가 차례로 떠오르는 시간. */
const ENTER_DURATION_MS = 720;
const HEADER_RISE = 16;
const CARD_RISE = 28;

/** 안내 문구. Figma 텍스트 스타일에 없는 크기라 여기서 직접 잡습니다. */
const EMPTY_FONT_SIZE = 16;

/** 고객 Arc 화면 — `/arc` */
export default function CustomerArcScreen() {
  const { t } = useTranslation();
  useReportActiveTab('arc');

  const [index, setIndex] = useState(0);
  /** 봉투를 열어 편지를 꺼냈는지. 편지를 다시 누르면 봉투로 돌아옵니다. */
  const [isLetterOpen, setIsLetterOpen] = useState(false);

  /** 봉투 한 장이 차지하는 폭. 재는 데 한 프레임이 걸려서 그 전에는 캐러셀을 그리지 않습니다. */
  const [pageWidth, setPageWidth] = useState(0);
  const carousel = useRef<ScrollView>(null);

  // 지연 초기화로 한 번만 만들고, 이후에는 애니메이션으로만 값을 바꿉니다.
  const [scrollX] = useState(() => new Animated.Value(0));
  const [enter] = useState(() => new Animated.Value(0));

  const entry = ARC_ENTRIES[index];

  useEffect(() => {
    const animation = Animated.timing(enter, {
      toValue: 1,
      duration: ENTER_DURATION_MS,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    });

    animation.start();
    return () => animation.stop();
  }, [enter]);

  const handleStageLayout = useCallback((event: LayoutChangeEvent) => {
    setPageWidth(event.nativeEvent.layout.width);
  }, []);

  const handleCarouselScroll = useCallback(
    ({ nativeEvent }: NativeSyntheticEvent<NativeScrollEvent>) => {
      if (pageWidth === 0) {
        return;
      }

      const next = Math.round(nativeEvent.contentOffset.x / pageWidth);

      if (next >= 0 && next < ARC_ENTRIES.length) {
        setIndex(next);
      }
    },
    [pageWidth]
  );

  const goTo = useCallback(
    (next: number) => {
      setIndex(next);
      carousel.current?.scrollTo({ x: next * pageWidth, animated: true });
    },
    [pageWidth]
  );

  const handleLetterClose = useCallback(() => {
    setIsLetterOpen(false);
  }, []);

  /** 스크롤 위치를 이 장에서 몇 장 떨어져 있는지로 읽는 구간. */
  const rangeAt = (position: number, stops: readonly number[]) =>
    stops.map((stop) => (position + stop) * pageWidth);

  /**
   * 그리는 차례. 가운데에서 먼 장부터 그려야 지금 보는 봉투가 맨 위에 옵니다.
   * 넘기는 도중 가운데가 바뀌는 순간 앞뒤가 한 번 뒤집힙니다 — 겹침 순서는
   * 애니메이션으로 이어 줄 수 없어서, 두 봉투가 가장 많이 겹쳐 있는 지점에서 바꿉니다.
   */
  const drawOrder = ARC_ENTRIES.map((_, position) => position).sort(
    (a, b) => Math.abs(b - index) - Math.abs(a - index)
  );

  const headerStyle = {
    opacity: enter.interpolate({ inputRange: [0, 0.6], outputRange: [0, 1], extrapolate: 'clamp' }),
    transform: [
      {
        translateY: enter.interpolate({
          inputRange: [0, 0.6],
          outputRange: [HEADER_RISE, 0],
          extrapolate: 'clamp',
        }),
      },
    ],
  };

  const cardStyle = {
    opacity: enter.interpolate({
      inputRange: [0.25, 1],
      outputRange: [0, 1],
      extrapolate: 'clamp',
    }),
    transform: [
      {
        translateY: enter.interpolate({
          inputRange: [0.25, 1],
          outputRange: [CARD_RISE, 0],
          extrapolate: 'clamp',
        }),
      },
    ],
  };

  return (
    // 배경은 `ScreenContainer` 바깥에 둡니다. 안에 넣으면 안전 영역 안쪽에 갇혀
    // 노치와 홈 인디케이터 자리에 색이 끊깁니다. 자세한 이유는 `screen-container.tsx` 참고.
    // 탭 바도 같은 이유로 바깥에 두고 화면 맨 아래에 붙입니다.
    <View style={styles.root}>
      <BrandBackdrop />

      <ScreenContainer backgroundColor="transparent" edgeToEdge style={styles.stage}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <Animated.View style={[styles.gutter, headerStyle]}>
            <BrandIntroHeader
              description={t('arc.description')}
              align="center"
              compact
              accessory={
                // 시안(2-1 Arc)은 워드마크 오른쪽에 `Visit Memory` 와 톱니를 나란히 겁니다.
                <View style={styles.headerActions}>
                  <VisitMemoryLink variant="pill" />
                  <InitialSetupButton iconOnly />
                </View>
              }
            />
          </Animated.View>

          {/* 더미에 누운 봉투가 화면 가장자리까지 밀려 나가야 해서 이 줄만 좌우 여백 바깥에 둡니다. */}
          <Animated.View style={[styles.cardStage, cardStyle]} onLayout={handleStageLayout}>
            {entry === undefined ? (
              <View style={styles.emptySlot}>
                <Text style={styles.empty}>{t('arc.empty')}</Text>
              </View>
            ) : (
              <>
                {/*
                  보이는 봉투. 스크롤 위치에 따라 더미와 가운데 사이를 오갑니다.

                  넘기기와 누르기는 이 위에 덮은 투명한 판이 받습니다. 봉투가 세로로 넘치는
                  더미 자리까지 움직여야 하는데, 가로 스크롤 안에 두면 넘친 만큼이 잘립니다.
                  스크린 리더에는 그 판의 버튼만 걸리므로 이 층은 통째로 감춥니다.
                */}
                <View
                  accessibilityElementsHidden
                  importantForAccessibility="no-hide-descendants"
                  style={styles.deck}
                >
                  {pageWidth === 0
                    ? null
                    : drawOrder.map((position) => {
                        const item = ARC_ENTRIES[position];

                        if (item === undefined) {
                          return null;
                        }

                        return (
                          <Animated.View
                            key={item.id}
                            style={[
                              styles.gutter,
                              styles.slot,
                              isLetterOpen && position === index ? styles.slotOpened : null,
                              {
                                transform: [
                                  {
                                    translateX: scrollX.interpolate({
                                      inputRange: rangeAt(position, POSE_STOPS),
                                      outputRange: POSE_X,
                                      extrapolate: 'clamp',
                                    }),
                                  },
                                  {
                                    translateY: scrollX.interpolate({
                                      inputRange: rangeAt(position, POSE_STOPS),
                                      outputRange: POSE_Y,
                                      extrapolate: 'clamp',
                                    }),
                                  },
                                  {
                                    rotate: scrollX.interpolate({
                                      inputRange: rangeAt(position, POSE_STOPS),
                                      outputRange: POSE_ROTATION,
                                      extrapolate: 'clamp',
                                    }),
                                  },
                                ],
                              },
                            ]}
                          >
                            {/* 밝은 겉면과 그늘진 겉면을 같은 자리에 겹쳐 두고 서로 바꿔 비춥니다. */}
                            <View style={styles.faces}>
                              <Animated.View
                                style={[
                                  styles.face,
                                  {
                                    opacity: scrollX.interpolate({
                                      inputRange: rangeAt(position, FACE_STOPS),
                                      outputRange: LIT_FACE_OPACITY,
                                      extrapolate: 'clamp',
                                    }),
                                  },
                                ]}
                              >
                                <ArcEnvelope entry={item} />
                              </Animated.View>

                              <Animated.View
                                style={[
                                  styles.face,
                                  {
                                    opacity: scrollX.interpolate({
                                      inputRange: rangeAt(position, FACE_STOPS),
                                      outputRange: SHADED_FACE_OPACITY,
                                      extrapolate: 'clamp',
                                    }),
                                  },
                                ]}
                              >
                                <ArcEnvelope entry={item} stacked />
                              </Animated.View>
                            </View>
                          </Animated.View>
                        );
                      })}
                </View>

                {/*
                  넘기기와 누르기를 받는 투명한 판. 봉투는 뒤의 층이 그립니다.
                  편지를 꺼내도 이 판은 그대로 둡니다 — 지웠다 다시 그리면 가로 스크롤이
                  첫 장으로 되감겨, 덮고 있던 봉투가 바뀝니다.
                */}
                <Animated.ScrollView
                  ref={carousel}
                  horizontal
                  pagingEnabled
                  showsHorizontalScrollIndicator={false}
                  scrollEnabled={!isLetterOpen}
                  accessibilityElementsHidden={isLetterOpen}
                  importantForAccessibility={isLetterOpen ? 'no-hide-descendants' : 'auto'}
                  scrollEventThrottle={SCROLL_THROTTLE_MS}
                  style={styles.track}
                  onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], {
                    useNativeDriver: true,
                    listener: handleCarouselScroll,
                  })}
                >
                  {pageWidth === 0
                    ? null
                    : ARC_ENTRIES.map((item, position) => (
                        // 넘기는 도중 옆 봉투를 눌렀다면 그 장으로 옮겨 놓고 엽니다.
                        <View key={item.id} style={[styles.gutter, { width: pageWidth }]}>
                          <Pressable
                            accessibilityRole="button"
                            accessibilityLabel={t('a11y.openEnvelope', {
                              title: item.envelopeTitle,
                            })}
                            onPress={() => {
                              goTo(position);
                              setIsLetterOpen(true);
                            }}
                            style={styles.touchTarget}
                          />
                        </View>
                      ))}
                </Animated.ScrollView>

                {isLetterOpen ? (
                  <View style={[styles.gutter, styles.letterOverlay]}>
                    <ArcLetterReveal entry={entry} onClose={handleLetterClose} />
                  </View>
                ) : null}
              </>
            )}
          </Animated.View>

          {ARC_ENTRIES.length < 2 ? null : (
            <PageIndicator
              count={ARC_ENTRIES.length}
              activeIndex={index}
              onSelect={goTo}
              style={styles.indicator}
            />
          )}
        </ScrollView>
      </ScreenContainer>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  // 세로 여백과 간격은 스크롤 콘텐츠가 직접 들고 있습니다.
  stage: {
    paddingVertical: 0,
    gap: 0,
  },
  content: {
    // 떠 있는 내비게이션에 카드 아래가 가리지 않도록 그만큼 비워 둡니다.
    paddingBottom: NAV_AREA_HEIGHT,
  },
  gutter: {
    paddingHorizontal: Spacing.four,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  cardStage: {
    height: ENVELOPE_HEIGHT,
    marginTop: HEADER_TO_CARD,
  },
  // 봉투를 그리는 층. 누르기는 위의 판이 받으므로 그대로 통과시킵니다.
  deck: {
    ...StyleSheet.absoluteFillObject,
    pointerEvents: 'none',
  },
  slot: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
  },
  // 편지를 꺼내는 동안 자리만 지키는 봉투. 편지를 덮은 무대가 제 봉투를 들고 있습니다.
  slotOpened: {
    opacity: 0,
  },
  faces: {
    height: ENVELOPE_HEIGHT,
  },
  face: {
    ...StyleSheet.absoluteFillObject,
  },
  track: {
    ...StyleSheet.absoluteFillObject,
  },
  touchTarget: {
    height: ENVELOPE_HEIGHT,
  },
  // 봉투와 같은 자리에 겹쳐 놓아, 편지를 꺼내도 카드가 제자리에서 뒤집힙니다.
  letterOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
  },
  indicator: {
    marginTop: CARD_TO_INDICATOR,
  },
  emptySlot: {
    flex: 1,
    justifyContent: 'center',
  },
  empty: {
    fontFamily: FontFamily.sans,
    fontSize: EMPTY_FONT_SIZE,
    lineHeight: EMPTY_FONT_SIZE * LineHeightRatio.base,
    color: FixedColors.onDark,
    textAlign: 'center',
  },
});
