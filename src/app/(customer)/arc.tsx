import { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';

import { BrandBackdrop } from '@components/common/brand-backdrop';
import { BrandIntroHeader } from '@components/common/brand-intro-header';
import { InitialSetupButton } from '@components/common/initial-setup-button';
import { PillTabs } from '@components/common/pill-tabs';
import { ScreenContainer } from '@components/common/screen-container';
import { VisitMemoryLink } from '@components/common/visit-memory-link';
import { ArcEnvelope, ENVELOPE_HEIGHT } from '@components/customer/arc-envelope';
import { ArcLetterCard } from '@components/customer/arc-letter-card';
import { BottomNavBar } from '@components/customer/bottom-nav-bar';
import { ARC_EMPTY_MESSAGE, ARC_ENTRIES } from '@constants/arc';
import { CUSTOMER_SECTION_TABS } from '@constants/navigation';
import { FixedColors, FontFamily, LineHeightRatio, Spacing } from '@constants/theme';
import carouselArrow from '@assets/images/arc/carousel-arrow.svg';
import type { CustomerSectionKey } from '@/types/home';
import type { NavTabId } from '@/types/navigation';

/** 시안(393 폭)의 세로 리듬. Spacing 스케일에 없는 값이라 이름을 붙여 둡니다. */
const TOOLBAR_TO_CARD = 20;

/** 떠 있는 내비게이션이 화면 아래에서 차지하는 높이. 스크롤 끝에 이만큼 여백을 둡니다. */
const NAV_AREA_HEIGHT = 118;
/** 스크림 위쪽 끝에서 유리 막대까지의 거리. */
const NAV_BAR_TOP = 16;

/** 위는 투명하고 아래로 갈수록 짙어지는 갈색 스크림. */
const TOP = { x: 0.5, y: 0 } as const;
const BOTTOM = { x: 0.5, y: 1 } as const;

/** 좌우로 넘기는 화살표. 화면 가장자리에 붙고 봉투 위에 겹칩니다. */
const ARROW_SIZE = 65;
const ARROW_TOP = 180;

/**
 * 다음·이전 봉투가 뒤에 비스듬히 겹쳐 보이는 정도.
 * 시안은 왼쪽과 오른쪽 값이 조금 다른데, 좌우가 같아야 넘길 때 흔들리지 않아 한 벌로 맞췄습니다.
 */
const STACK_OFFSET_X = 259;
const STACK_OFFSET_Y = 61;
const STACK_ROTATION = '14.54deg';
const STACK_ROTATION_REVERSED = '-14.54deg';

/** 안내 문구. Figma 텍스트 스타일에 없는 크기라 여기서 직접 잡습니다. */
const EMPTY_FONT_SIZE = 16;

const DESCRIPTION = '오늘의 경험이 새로운 Arc로 기록됩니다.';

/** 고객 Arc 화면 — `/arc` */
export default function CustomerArcScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [index, setIndex] = useState(0);
  /** 봉투를 열어 편지를 꺼냈는지. 편지를 다시 누르면 목록으로 돌아옵니다. */
  const [isLetterOpen, setIsLetterOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<NavTabId>('arc');

  const entry = ARC_ENTRIES[index];
  const nextEntry = ARC_ENTRIES[index + 1];
  const previousEntry = ARC_ENTRIES[index - 1];

  const handleSectionChange = useCallback(
    (section: CustomerSectionKey) => {
      if (section === 'home') {
        router.navigate('/home');
      }
    },
    [router]
  );

  const handleTabChange = useCallback(
    (tab: NavTabId) => {
      if (tab === 'home') {
        router.navigate('/home');
        return;
      }

      // /studio 라우트가 아직 없어 지금은 화면 안에서만 선택 상태를 들고 있습니다.
      setActiveTab(tab);
    },
    [router]
  );

  return (
    // 배경은 `ScreenContainer` 바깥에 둡니다. 안에 넣으면 안전 영역 안쪽에 갇혀
    // 노치와 홈 인디케이터 자리에 색이 끊깁니다. 자세한 이유는 `screen-container.tsx` 참고.
    // 탭 바도 같은 이유로 바깥에 두고 화면 맨 아래에 붙입니다.
    <View style={styles.root}>
      <BrandBackdrop />

      <ScreenContainer backgroundColor="transparent" edgeToEdge style={styles.stage}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.gutter}>
            <BrandIntroHeader description={DESCRIPTION} accessory={<VisitMemoryLink />} />

            <View style={styles.toolbar}>
              <PillTabs
                label="홈에서 볼 내용"
                options={CUSTOMER_SECTION_TABS}
                value="arc"
                onChange={handleSectionChange}
              />
              <InitialSetupButton />
            </View>
          </View>

          {/* 넘기는 화살표가 화면 가장자리에 붙어야 해서 이 줄만 좌우 여백 바깥에 둡니다. */}
          <View style={styles.cardStage}>
            {entry === undefined ? (
              <Text style={styles.empty}>{ARC_EMPTY_MESSAGE}</Text>
            ) : isLetterOpen ? (
              <View style={styles.gutter}>
                <ArcLetterCard letter={entry.letter} onPress={() => setIsLetterOpen(false)} />
              </View>
            ) : (
              <>
                {/* 뒤에 겹쳐 보이는 봉투. 다음 것이 있으면 다음을, 없으면 이전 것을 보여줍니다. */}
                {nextEntry === undefined ? (
                  previousEntry === undefined ? null : (
                    <View style={[styles.gutter, styles.stackedSlot, styles.stackedPrevious]}>
                      <ArcEnvelope entry={previousEntry} stacked />
                    </View>
                  )
                ) : (
                  <View style={[styles.gutter, styles.stackedSlot, styles.stackedNext]}>
                    <ArcEnvelope entry={nextEntry} stacked />
                  </View>
                )}

                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`${entry.envelopeTitle} 열기`}
                  onPress={() => setIsLetterOpen(true)}
                  style={styles.gutter}
                >
                  <ArcEnvelope entry={entry} />
                </Pressable>

                {previousEntry === undefined ? null : (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="이전 Arc"
                    onPress={() => setIndex(index - 1)}
                    style={[styles.arrow, styles.arrowPrevious]}
                  >
                    <Image
                      source={carouselArrow}
                      style={styles.arrowIconReversed}
                      contentFit="contain"
                      accessible={false}
                    />
                  </Pressable>
                )}

                {nextEntry === undefined ? null : (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="다음 Arc"
                    onPress={() => setIndex(index + 1)}
                    style={[styles.arrow, styles.arrowNext]}
                  >
                    <Image
                      source={carouselArrow}
                      style={styles.arrowIcon}
                      contentFit="contain"
                      accessible={false}
                    />
                  </Pressable>
                )}
              </>
            )}
          </View>
        </ScrollView>
      </ScreenContainer>

      {/* 유리 막대 자체는 홈 인디케이터를 피하도록 아래 안전 영역만큼 띄웁니다. */}
      <LinearGradient
        colors={[FixedColors.tabBarScrimStart, FixedColors.tabBarScrimEnd]}
        start={TOP}
        end={BOTTOM}
        style={[styles.navScrim, { paddingBottom: insets.bottom }]}
      >
        <BottomNavBar activeTab={activeTab} onTabChange={handleTabChange} style={styles.navBar} />
      </LinearGradient>
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
  navScrim: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: NAV_AREA_HEIGHT,
  },
  navBar: {
    marginTop: NAV_BAR_TOP,
  },
  gutter: {
    paddingHorizontal: Spacing.four,
  },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
    marginTop: Spacing.four,
  },
  cardStage: {
    height: ENVELOPE_HEIGHT,
    justifyContent: 'center',
    marginTop: TOOLBAR_TO_CARD,
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
  arrow: {
    position: 'absolute',
    top: ARROW_TOP,
    width: ARROW_SIZE,
    height: ARROW_SIZE,
  },
  arrowPrevious: {
    left: 0,
  },
  arrowNext: {
    right: 0,
  },
  arrowIcon: {
    width: '100%',
    height: '100%',
  },
  // 화살표 그림은 오른쪽을 가리키는 한 벌뿐이라, 이전 버튼은 좌우로 뒤집어 씁니다.
  arrowIconReversed: {
    width: '100%',
    height: '100%',
    transform: [{ scaleX: -1 }],
  },
  empty: {
    fontFamily: FontFamily.sans,
    fontSize: EMPTY_FONT_SIZE,
    lineHeight: EMPTY_FONT_SIZE * LineHeightRatio.base,
    color: FixedColors.onDark,
    textAlign: 'center',
  },
});
