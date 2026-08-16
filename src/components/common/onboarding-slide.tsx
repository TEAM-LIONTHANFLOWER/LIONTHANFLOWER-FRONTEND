import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';

import { ExploreButton } from '@components/common/explore-button';
import { ScreenContainer } from '@components/common/screen-container';
import { VerticalScrim } from '@components/common/vertical-scrim';
import { FixedColors, FontFamily, Spacing } from '@constants/theme';
import arrowNext from '@assets/images/onboarding/arrow-next.svg';
import arrowPrevious from '@assets/images/onboarding/arrow-prev.svg';
import type { OnboardingSlide } from '@/types/onboarding';

/** 시안 기준 화면 너비. 타이틀이 이 너비를 꽉 채우다 못해 살짝 넘치도록 그려져 있습니다. */
const DESIGN_WIDTH = 393;
const TITLE_FONT_SIZE = 64;
const TITLE_LINE_HEIGHT_RATIO = 1.3;

/**
 * 타이틀을 담는 상자를 화면 폭의 몇 배로 잡을지.
 *
 * 시안의 타이틀은 한 줄로 두고 좌우로 흘러넘칩니다 — 64px 로 재보면 `MAGAZINE` 415px,
 * `NEW ONES` 413px, `MCM Orbit` 407px 라 393px 폭을 모두 넘깁니다. 글자를 화면 폭과 같은
 * 상자에 넣으면 공백이 있는 줄은 거기서 접히고(`NEW ONES`), 공백이 없는 줄은 웹에서
 * `word-wrap: break-word` 때문에 단어 중간이 쪼개집니다(`MAGAZINE`).
 *
 * 그래서 글자가 필요로 하는 것보다 넉넉한 상자를 줘서 줄바꿈 판단 자체가 일어나지 않게 하고,
 * 넘친 부분은 슬라이드 경계에서 잘리게 둡니다. 시안과 같은 모양입니다.
 */
const TITLE_BOX_WIDTH_RATIO = 1.5;

interface OnboardingSlideViewProps {
  slide: OnboardingSlide;
  /** 슬라이드가 실제로 차지하는 폭. 웹 모바일 프레임 안에서는 창 너비와 다릅니다. */
  width: number;
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
  width,
  onExplore,
  onNext,
  onPrevious,
}: OnboardingSlideViewProps) {
  // 좁은 화면에서도 시안과 같은 비율로 넘치도록 화면 폭에 맞춰 줄입니다. 넓어져도 커지지는 않습니다.
  const baseWidth = width > 0 ? Math.min(width, DESIGN_WIDTH) : DESIGN_WIDTH;
  const scale = baseWidth / DESIGN_WIDTH;
  const titleBoxStyle = { width: baseWidth * TITLE_BOX_WIDTH_RATIO };
  const titleStyle = {
    fontSize: TITLE_FONT_SIZE * scale,
    lineHeight: TITLE_FONT_SIZE * TITLE_LINE_HEIGHT_RATIO * scale,
    letterSpacing: (slide.titleLetterSpacing ?? 0) * scale,
  };

  return (
    // 배경 사진과 스크림은 `ScreenContainer` 바깥에 둡니다. 안에 넣으면 안전 영역 안쪽에
    // 갇혀 사진 위아래에 배경색 띠가 생깁니다. 자세한 이유는 `screen-container.tsx` 참고.
    //
    // 안전 영역을 라우트가 아니라 슬라이드에서 처리하는 것도 같은 이유입니다 — 슬라이드마다
    // 배경이 다르고 각자가 전체 화면이라, 라우트로 올리면 배경이 안전 영역에 갇힙니다.
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
          <View style={titleBoxStyle}>
            <Text style={[styles.title, titleStyle]}>{slide.title.join('\n')}</Text>
          </View>
          <Text style={styles.description}>{slide.description.join('\n')}</Text>

          <ExploreButton onPress={onExplore} style={styles.exploreButton} />

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
    backgroundColor: FixedColors.splashBackground,
    // 화면 밖으로 넘긴 타이틀을 슬라이드 경계에서 자릅니다.
    // 이게 없으면 웹에서 가로 스크롤이 생깁니다.
    overflow: 'hidden',
  },
  // 시안의 스크림은 852 높이 중 240 지점에서 시작합니다.
  scrim: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: '28%',
    bottom: 0,
  },
  // 타이틀이 화면 폭을 꽉 쓰고 좌우로 넘쳐야 해서 가로 여백을 없앱니다.
  // 여백이 필요한 요소(설명·버튼)는 각자 폭이나 패딩을 들고 있습니다.
  stage: {
    paddingHorizontal: 0,
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
    fontFamily: FontFamily.serifSemiBold,
    color: FixedColors.onDark,
    textAlign: 'center',
  },
  description: {
    fontFamily: FontFamily.serif,
    fontSize: 14,
    lineHeight: 21,
    color: FixedColors.onDark,
    textAlign: 'center',
    maxWidth: 280,
    marginTop: Spacing.two,
  },
  // 크기와 모양은 버튼이 직접 들고 있습니다. 여기서는 배치만 정합니다.
  exploreButton: {
    marginTop: Spacing.five,
  },
  footer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.six,
    paddingLeft: Spacing.three,
    paddingRight: Spacing.five,
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
    fontFamily: FontFamily.label,
    fontSize: 16,
    lineHeight: 24,
    color: FixedColors.onDark,
  },
  nextArrow: {
    width: 51,
    height: 10.5,
  },
});
