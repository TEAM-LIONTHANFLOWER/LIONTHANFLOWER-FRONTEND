import { Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { Image } from 'expo-image';

import { ScreenContainer } from '@components/common/screen-container';
import { VerticalScrim } from '@components/common/vertical-scrim';
import { BrandColors, FontFamily, Radius, Spacing } from '@constants/theme';
import arrowNext from '@assets/images/onboarding/arrow-next.svg';
import arrowPrevious from '@assets/images/onboarding/arrow-prev.svg';
import type { OnboardingSlide } from '@/types/onboarding';

/** 시안 기준 화면 너비. 타이틀이 이 너비를 거의 꽉 채우도록 그려져 있습니다. */
const DESIGN_WIDTH = 393;
const TITLE_FONT_SIZE = 64;
const TITLE_LINE_HEIGHT_RATIO = 1.3;

interface OnboardingSlideViewProps {
  slide: OnboardingSlide;
  /** Explore 를 눌렀을 때. 남은 슬라이드를 건너뛰고 온보딩을 끝냅니다. */
  onExplore: () => void;
  /** 다음 슬라이드로. 마지막 슬라이드에서는 온보딩을 끝냅니다. */
  onNext: () => void;
  /** 이전 슬라이드로. 첫 슬라이드에는 이전 버튼이 없습니다. */
  onPrevious?: () => void;
}

/** 온보딩 슬라이드 한 장. 배경 사진 + 스크림 위에 타이틀·설명·버튼을 올립니다. */
export function OnboardingSlideView({
  slide,
  onExplore,
  onNext,
  onPrevious,
}: OnboardingSlideViewProps) {
  const { width } = useWindowDimensions();

  // 좁은 화면에서 타이틀이 잘리지 않도록 시안 너비 기준으로 줄입니다. 넓어져도 커지지는 않습니다.
  const scale = Math.min(width, DESIGN_WIDTH) / DESIGN_WIDTH;
  const titleStyle = {
    fontSize: TITLE_FONT_SIZE * scale,
    lineHeight: TITLE_FONT_SIZE * TITLE_LINE_HEIGHT_RATIO * scale,
    letterSpacing: (slide.titleLetterSpacing ?? 0) * scale,
  };

  return (
    <View style={styles.root}>
      <Image
        source={slide.background}
        style={StyleSheet.absoluteFill}
        contentFit="cover"
        accessible={false}
      />
      <VerticalScrim style={styles.scrim} />

      <ScreenContainer backgroundColor="transparent" style={styles.stage}>
        <View style={styles.content}>
          <Text style={[styles.title, titleStyle]}>{slide.title.join('\n')}</Text>
          <Text style={styles.description}>{slide.description.join('\n')}</Text>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="둘러보기"
            onPress={onExplore}
            style={styles.exploreButton}
          >
            <Text style={styles.exploreLabel}>Explore</Text>
          </Pressable>

          <View style={styles.footer}>
            {onPrevious ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="이전 화면"
                onPress={onPrevious}
                style={styles.previousButton}
              >
                <Image source={arrowPrevious} style={styles.previousArrow} contentFit="contain" />
              </Pressable>
            ) : (
              // 이전 버튼이 없어도 다음 버튼 위치가 흔들리지 않도록 자리만 채웁니다.
              <View style={styles.previousButton} />
            )}

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="다음 화면"
              onPress={onNext}
              style={styles.nextButton}
            >
              <Text style={styles.nextLabel}>Next</Text>
              <Image source={arrowNext} style={styles.nextArrow} contentFit="contain" />
            </Pressable>
          </View>
        </View>
      </ScreenContainer>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: BrandColors.splashBackground,
  },
  // 시안의 스크림은 852 높이 중 240 지점에서 시작합니다.
  scrim: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: '28%',
    bottom: 0,
  },
  stage: {
    paddingVertical: 0,
    gap: 0,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: Spacing.four,
  },
  title: {
    fontFamily: FontFamily.displaySemiBold,
    color: BrandColors.onDark,
    textAlign: 'center',
  },
  description: {
    fontFamily: FontFamily.displayRegular,
    fontSize: 14,
    lineHeight: 21,
    color: BrandColors.onDark,
    textAlign: 'center',
    maxWidth: 280,
    marginTop: Spacing.two,
  },
  exploreButton: {
    width: 126,
    height: 58,
    borderRadius: Radius.pill,
    borderWidth: 1,
    borderColor: BrandColors.outlineOnDark,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.five,
  },
  exploreLabel: {
    fontFamily: FontFamily.displaySemiBold,
    fontSize: 20,
    lineHeight: 26,
    color: BrandColors.onDark,
  },
  footer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.six,
  },
  previousButton: {
    width: 62,
    height: 46,
    alignItems: 'center',
    justifyContent: 'center',
  },
  previousArrow: {
    width: 62,
    height: 46,
  },
  nextButton: {
    height: 46,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  nextLabel: {
    fontFamily: FontFamily.labelRegular,
    fontSize: 16,
    lineHeight: 24,
    color: BrandColors.onDark,
  },
  nextArrow: {
    width: 51,
    height: 10.5,
  },
});
