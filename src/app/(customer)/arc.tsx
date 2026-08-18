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
import { ArcEnvelope, ENVELOPE_HEIGHT } from '@components/customer/arc-envelope';
import { ArcLetterCard } from '@components/customer/arc-letter-card';
import { ARC_ENTRIES } from '@constants/arc';
import { FixedColors, FontFamily, LineHeightRatio, Spacing } from '@constants/theme';
import { useTranslation } from '@hooks/use-translation';

/** 머리말과 봉투 사이. 시안(393 폭)의 세로 리듬이라 Spacing 스케일에 없는 값입니다. */
const HEADER_TO_CARD = 34;
/** 봉투와 페이지 표시 사이. 표시가 위아래로 들고 있는 터치 여백만큼 뺀 값입니다. */
const CARD_TO_INDICATOR = Spacing.four;

/** 떠 있는 내비게이션이 화면 아래에서 차지하는 높이. `(customer)/_layout.tsx` 의
 * `NAV_AREA_HEIGHT` 와 같은 값이어야 합니다 — 내비게이션은 거기서 그립니다. */
const NAV_AREA_HEIGHT = 118;

/**
 * 뒤에 비스듬히 겹쳐 보이는 봉투가 앞의 봉투에서 밀려난 거리와 각도.
 * 시안은 오른쪽 아래로만 겹쳐 두지만, 마지막 장에서는 좌우를 뒤집어 이전 봉투를 보여줍니다.
 */
const STACK_OFFSET_X = 148;
const STACK_OFFSET_Y = 149;
const STACK_ROTATION = '14.54deg';
const STACK_ROTATION_REVERSED = '-14.54deg';

/** 옆으로 넘기는 동안 이웃한 봉투가 물러나 보이는 정도. */
const PEEK_SCALE = 0.92;
const PEEK_OPACITY = 0.45;

/** 넘기는 동안 봉투 크기가 부드럽게 따라오도록 매 프레임 스크롤 위치를 받습니다. */
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
  const nextEntry = ARC_ENTRIES[index + 1];
  const previousEntry = ARC_ENTRIES[index - 1];
  /** 뒤에 깔아 둘 봉투. 다음 것이 있으면 다음을, 없으면 이전 것을 보여줍니다. */
  const stackedEntry = nextEntry ?? previousEntry;

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
              accessory={<InitialSetupButton iconOnly />}
            />
          </Animated.View>

          {/* 겹쳐 둔 봉투가 화면 가장자리까지 밀려 나가야 해서 이 줄만 좌우 여백 바깥에 둡니다. */}
          <Animated.View style={[styles.cardStage, cardStyle]} onLayout={handleStageLayout}>
            {entry === undefined ? (
              <View style={styles.emptySlot}>
                <Text style={styles.empty}>{t('arc.empty')}</Text>
              </View>
            ) : (
              <>
                {stackedEntry === undefined ? null : (
                  <View
                    style={[
                      styles.gutter,
                      styles.stackedSlot,
                      nextEntry === undefined ? styles.stackedPrevious : styles.stackedNext,
                    ]}
                  >
                    <ArcEnvelope entry={stackedEntry} stacked />
                  </View>
                )}

                {/*
                  편지를 꺼내도 캐러셀은 그대로 두고 그 위에 편지를 덮습니다.
                  지웠다 다시 그리면 가로 스크롤이 첫 장으로 되감겨, 덮고 있던 봉투가 바뀝니다.
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
                  onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], {
                    useNativeDriver: true,
                    listener: handleCarouselScroll,
                  })}
                >
                  {pageWidth === 0
                    ? null
                    : ARC_ENTRIES.map((item, position) => {
                        // 이웃한 장은 뒤로 물러났다가 가운데로 오면서 제 크기를 찾습니다.
                        const inputRange = [
                          (position - 1) * pageWidth,
                          position * pageWidth,
                          (position + 1) * pageWidth,
                        ];

                        return (
                          <Animated.View
                            key={item.id}
                            style={[
                              styles.page,
                              styles.gutter,
                              { width: pageWidth },
                              {
                                opacity: scrollX.interpolate({
                                  inputRange,
                                  outputRange: [PEEK_OPACITY, 1, PEEK_OPACITY],
                                  extrapolate: 'clamp',
                                }),
                                transform: [
                                  {
                                    scale: scrollX.interpolate({
                                      inputRange,
                                      outputRange: [PEEK_SCALE, 1, PEEK_SCALE],
                                      extrapolate: 'clamp',
                                    }),
                                  },
                                ],
                              },
                            ]}
                          >
                            {/* 넘기는 도중 옆 봉투를 눌렀다면 그 장으로 옮겨 놓고 엽니다. */}
                            <Pressable
                              accessibilityRole="button"
                              accessibilityLabel={t('a11y.openEnvelope', {
                                title: item.envelopeTitle,
                              })}
                              onPress={() => {
                                goTo(position);
                                setIsLetterOpen(true);
                              }}
                            >
                              <ArcEnvelope entry={item} />
                            </Pressable>
                          </Animated.View>
                        );
                      })}
                </Animated.ScrollView>

                {isLetterOpen ? (
                  <View style={[styles.gutter, styles.letterOverlay]}>
                    <ArcLetterCard letter={entry.letter} onPress={() => setIsLetterOpen(false)} />
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
  cardStage: {
    height: ENVELOPE_HEIGHT,
    marginTop: HEADER_TO_CARD,
  },
  page: {
    justifyContent: 'center',
  },
  // 겹쳐 보이는 봉투는 앞의 봉투와 같은 자리에서 시작해 비스듬히 밀려납니다.
  stackedSlot: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
  },
  stackedNext: {
    transform: [
      { translateX: STACK_OFFSET_X },
      { translateY: STACK_OFFSET_Y },
      { rotate: STACK_ROTATION },
    ],
  },
  stackedPrevious: {
    transform: [
      { translateX: -STACK_OFFSET_X },
      { translateY: STACK_OFFSET_Y },
      { rotate: STACK_ROTATION_REVERSED },
    ],
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
