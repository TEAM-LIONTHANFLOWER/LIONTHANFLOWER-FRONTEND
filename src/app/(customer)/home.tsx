import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';

import { BrandBackdrop } from '@components/common/brand-backdrop';
import { BrandIntroHeader } from '@components/common/brand-intro-header';
import { PillTabs } from '@components/common/pill-tabs';
import { ScreenContainer } from '@components/common/screen-container';
import { BottomNavBar } from '@components/customer/bottom-nav-bar';
import { BrandStoryBlock } from '@components/customer/brand-story-block';
import { MyselfGallery } from '@components/customer/myself-gallery';
import { NowOnCard } from '@components/customer/now-on-card';
import { BRAND_STORIES, MYSELF_PHOTOS, NOW_ON_FEATURE } from '@constants/home';
import { CUSTOMER_SECTION_TABS } from '@constants/navigation';
import { FixedColors, Spacing, Typography } from '@constants/theme';
import { useTranslation } from '@hooks/use-translation';
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

/** 고객 홈 화면 — `/home` */
export default function CustomerHomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<NavTabId>('home');

  const handleSectionChange = useCallback(
    (section: CustomerSectionKey) => {
      if (section === 'arc') {
        router.navigate('/arc');
      }
    },
    [router]
  );

  const handleTabChange = useCallback(
    (tab: NavTabId) => {
      if (tab === 'arc') {
        router.navigate('/arc');
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
          {/* 화보 줄만 화면 끝까지 이어져야 해서 좌우 여백 바깥에 둡니다. */}
          <View style={styles.gutter}>
            <BrandIntroHeader description={t('home.description')} />

            <PillTabs
              label={t('home.sectionTabsLabel')}
              options={CUSTOMER_SECTION_TABS}
              value="home"
              onChange={handleSectionChange}
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
