import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { BrandBackdrop } from '@components/common/brand-backdrop';
import { BrandIntroHeader } from '@components/common/brand-intro-header';
import { PillTabs, type PillTabOption } from '@components/common/pill-tabs';
import { ScreenContainer } from '@components/common/screen-container';
import { BrandStoryBlock } from '@components/customer/brand-story-block';
import { CustomerTabBar, TAB_BAR_HEIGHT } from '@components/customer/customer-tab-bar';
import { MyselfGallery } from '@components/customer/myself-gallery';
import { NowOnCard } from '@components/customer/now-on-card';
import { BRAND_STORIES, MYSELF_PHOTOS, NOW_ON_FEATURE } from '@constants/home';
import { FixedColors, Spacing, Typography } from '@constants/theme';
import tabArcIcon from '@assets/images/home/tab-arc.svg';
import tabHomeIcon from '@assets/images/home/tab-home.svg';
import tabStudioIcon from '@assets/images/home/tab-studio.svg';
import type { CustomerSectionKey, CustomerTabItem } from '@/types/home';

/** 시안(393 폭)의 세로 리듬. Spacing 스케일에 없는 값이라 이름을 붙여 둡니다. */
const TABS_TO_FEATURE = 20;
const FEATURE_TO_STORIES = 29;
const STORIES_TO_GALLERY = 45;

const DESCRIPTION = '오늘의 취향과 여정을 담은 브랜드 경험을 만나보세요.';

const SECTION_TABS: readonly PillTabOption<CustomerSectionKey>[] = [
  { value: 'home', label: 'Home' },
  // Arc 화면은 아직 없습니다. 화면이 생기면 `disabled` 를 지웁니다.
  { value: 'arc', label: 'Arc', disabled: true },
];

const TAB_BAR_ITEMS: readonly CustomerTabItem[] = [
  { key: 'home', label: 'Home', icon: tabHomeIcon, href: '/home' },
  // Arc / Studio 화면은 아직 없습니다. 화면이 생기면 `href` 만 채우면 됩니다.
  { key: 'arc', label: 'Arc', icon: tabArcIcon },
  { key: 'studio', label: 'Studio', icon: tabStudioIcon },
];

/** 고객 홈 화면 — `/home` */
export default function CustomerHomeScreen() {
  const [section, setSection] = useState<CustomerSectionKey>('home');

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

      <CustomerTabBar items={TAB_BAR_ITEMS} activeKey="home" />
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
    // 떠 있는 탭 바에 마지막 사진이 가리지 않도록 그만큼 비워 둡니다.
    paddingBottom: TAB_BAR_HEIGHT,
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
