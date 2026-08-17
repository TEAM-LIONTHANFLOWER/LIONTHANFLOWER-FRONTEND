import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

import { BrandBackdrop } from '@components/common/brand-backdrop';
import { BrandIntroHeader } from '@components/common/brand-intro-header';
import { PillTabs, type PillTabOption } from '@components/common/pill-tabs';
import { ScreenContainer } from '@components/common/screen-container';
import { BottomNavBar } from '@components/customer/bottom-nav-bar';
import { BrandStoryBlock } from '@components/customer/brand-story-block';
import { MyselfGallery } from '@components/customer/myself-gallery';
import { NowOnCard } from '@components/customer/now-on-card';
import { BRAND_STORIES, MYSELF_PHOTOS, NOW_ON_FEATURE } from '@constants/home';
import { FixedColors, Spacing, Typography } from '@constants/theme';
import type { CustomerSectionKey } from '@/types/home';
import type { NavTabId } from '@/types/navigation';

/** 시안(393 폭)의 세로 리듬. Spacing 스케일에 없는 값이라 이름을 붙여 둡니다. */
const TABS_TO_FEATURE = 20;
const FEATURE_TO_STORIES = 29;
const STORIES_TO_GALLERY = 45;

/** 떠 있는 내비게이션이 화면 아래에서 차지하는 높이. 스크롤 끝에 이만큼 여백을 둡니다. */
const NAV_AREA_HEIGHT = 118;
/** 스크림 위쪽 끝에서 유리 막대까지의 거리. */
const NAV_BAR_TOP = 16;

/** 위는 투명하고 아래로 갈수록 짙어지는 갈색 스크림. */
const TOP = { x: 0.5, y: 0 } as const;
const BOTTOM = { x: 0.5, y: 1 } as const;

const DESCRIPTION = '오늘의 취향과 여정을 담은 브랜드 경험을 만나보세요.';

const SECTION_TABS: readonly PillTabOption<CustomerSectionKey>[] = [
  { value: 'home', label: 'Home' },
  // Arc 화면은 아직 없습니다. 화면이 생기면 `disabled` 를 지웁니다.
  { value: 'arc', label: 'Arc', disabled: true },
];

/** 고객 홈 화면 — `/home` */
export default function CustomerHomeScreen() {
  const insets = useSafeAreaInsets();
  const [section, setSection] = useState<CustomerSectionKey>('home');
  // /arc, /studio 라우트가 아직 없어 지금은 화면 안에서만 선택 상태를 들고 있습니다.
  const [activeTab, setActiveTab] = useState<NavTabId>('home');

  return (
    // 배경은 `ScreenContainer` 바깥에 둡니다. 안에 넣으면 안전 영역 안쪽에 갇혀
    // 노치와 홈 인디케이터 자리에 색이 끊깁니다. 자세한 이유는 `screen-container.tsx` 참고.
    // 탭 바도 같은 이유로 바깥에 두고 화면 맨 아래에 붙입니다.
    <View style={styles.root}>
      <BrandBackdrop />

      <ScreenContainer backgroundColor="transparent" edgeToEdge style={styles.stage}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {/* 화보 줄만 화면 끝까지 이어져야 해서 좌우 여백 바깥에 둡니다. */}
          <View style={styles.gutter}>
            <BrandIntroHeader description={DESCRIPTION} />

            <PillTabs
              label="홈에서 볼 내용"
              options={SECTION_TABS}
              value={section}
              onChange={setSection}
              style={styles.tabs}
            />

            <NowOnCard feature={NOW_ON_FEATURE} style={styles.feature} />

            <View style={styles.stories}>
              {BRAND_STORIES.map((story) => (
                <BrandStoryBlock key={story.id} story={story} />
              ))}
            </View>

            <Text style={styles.galleryTitle}>MCM Myself</Text>
          </View>

          <MyselfGallery photos={MYSELF_PHOTOS} />
        </ScrollView>
      </ScreenContainer>

      {/* 유리 막대 자체는 홈 인디케이터를 피하도록 아래 안전 영역만큼 띄웁니다. */}
      <LinearGradient
        colors={[FixedColors.tabBarScrimStart, FixedColors.tabBarScrimEnd]}
        start={TOP}
        end={BOTTOM}
        style={[styles.navScrim, { paddingBottom: insets.bottom }]}
      >
        <BottomNavBar activeTab={activeTab} onTabChange={setActiveTab} style={styles.navBar} />
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
    // 떠 있는 내비게이션에 마지막 사진이 가리지 않도록 그만큼 비워 둡니다.
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
  tabs: {
    marginTop: Spacing.four,
  },
  feature: {
    marginTop: TABS_TO_FEATURE,
  },
  stories: {
    marginTop: FEATURE_TO_STORIES,
    gap: Spacing.four,
  },
  galleryTitle: {
    ...Typography.titleEn20,
    color: FixedColors.onDark,
    marginTop: STORIES_TO_GALLERY,
    marginBottom: Spacing.two,
  },
});
