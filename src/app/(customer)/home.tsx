import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { BrandBackdrop } from '@components/common/brand-backdrop';
import { BrandIntroHeader } from '@components/common/brand-intro-header';
import { ScreenContainer } from '@components/common/screen-container';
import { BrandStoryBlock } from '@components/customer/brand-story-block';
import { MyselfGallery } from '@components/customer/myself-gallery';
import { NowOnCard } from '@components/customer/now-on-card';
import { ARC_INTRO_STORY, BRAND_STORIES, MYSELF_FRAMES, NOW_ON_FEATURE } from '@constants/home';
import { FixedColors, Spacing, Typography } from '@constants/theme';
import { useTranslation } from '@hooks/use-translation';

/** 시안(393 폭)의 세로 리듬. Spacing 스케일에 없는 값이라 이름을 붙여 둡니다. */
const INTRO_TO_ARC = 36;
const ARC_TO_FEATURE = 30;
const FEATURE_TO_STORIES = 29;
const STORIES_TO_GALLERY = 45;

/** 떠 있는 내비게이션이 화면 아래에서 차지하는 높이. `(customer)/_layout.tsx` 의
 * `NAV_AREA_HEIGHT` 와 같은 값이어야 합니다 — 내비게이션은 거기서 그립니다. */
const NAV_AREA_HEIGHT = 118;

/** 고객 홈 화면 — `/home` */
export default function CustomerHomeScreen() {
  const { t } = useTranslation();

  return (
    // 배경은 `ScreenContainer` 바깥에 둡니다. 안에 넣으면 안전 영역 안쪽에 갇혀
    // 노치와 홈 인디케이터 자리에 색이 끊깁니다. 자세한 이유는 `screen-container.tsx` 참고.
    // 탭 바도 같은 이유로 바깥에 두고 화면 맨 아래에 붙입니다.
    <View style={styles.root}>
      {/* 조명은 앱에서 처음 만나는 홈 화면에서만 켭니다. 직원 홈도 같습니다. */}
      <BrandBackdrop showLight />

      <ScreenContainer backgroundColor="transparent" edgeToEdge style={styles.stage}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {/* 화보 줄만 화면 끝까지 이어져야 해서 좌우 여백 바깥에 둡니다. */}
          <View style={styles.gutter}>
            <BrandIntroHeader description={t('home.description')} />

            {/* Arc 소개는 시안에서 머리말 바로 아래, `Now On` 카드 위에 옵니다. */}
            <BrandStoryBlock story={ARC_INTRO_STORY} style={styles.arcIntro} />

            <NowOnCard feature={NOW_ON_FEATURE} style={styles.feature} />

            <View style={styles.stories}>
              {BRAND_STORIES.map((story) => (
                <BrandStoryBlock key={story.id} story={story} />
              ))}
            </View>

            <Text style={styles.galleryTitle}>MCM Myself</Text>
          </View>

          <MyselfGallery frames={MYSELF_FRAMES} />
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
    // 떠 있는 내비게이션에 마지막 사진이 가리지 않도록 그만큼 비워 둡니다.
    paddingBottom: NAV_AREA_HEIGHT,
  },
  gutter: {
    paddingHorizontal: Spacing.four,
  },
  arcIntro: {
    marginTop: INTRO_TO_ARC,
  },
  feature: {
    marginTop: ARC_TO_FEATURE,
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
