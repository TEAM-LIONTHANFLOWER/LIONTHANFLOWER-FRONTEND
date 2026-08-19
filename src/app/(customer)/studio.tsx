import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Easing,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import type { StudioCapture, StudioFrame } from '@/types/studio';
import { BrandBackdrop } from '@components/common/brand-backdrop';
import { BrandIntroHeader } from '@components/common/brand-intro-header';
import { InitialSetupButton } from '@components/common/initial-setup-button';
import { ScreenContainer } from '@components/common/screen-container';
import { StudioFrameCarousel } from '@components/customer/studio-frame-carousel';
import { StudioFrameStage } from '@components/customer/studio-frame-stage';
import { FixedColors, Spacing, Typography } from '@constants/theme';
import { useReportActiveTab } from '@hooks/use-report-active-tab';
import { useStudioFrames } from '@hooks/use-studio-frames';
import { useTranslation } from '@hooks/use-translation';
import { downloadStudioCapture } from '@services/studio-capture';

/** 떠 있는 내비게이션이 화면 아래에서 차지하는 높이. `(customer)/_layout.tsx` 의
 * `NAV_AREA_HEIGHT` 와 같은 값이어야 합니다 — 내비게이션은 거기서 그립니다. */
const NAV_AREA_HEIGHT = 118;

/** 안내 문구와 프레임 캐러셀 사이. 시안의 세로 리듬이라 Spacing 스케일에 없는 값입니다. */
const DESCRIPTION_TO_FRAMES = 23;

/** 화면이 열릴 때 프레임 캐러셀이 아래에서 떠오르는 시간과 거리. Arc 진입 애니메이션과 같은 값입니다. */
const FRAMES_ENTER_DURATION_MS = 720;
const FRAMES_RISE = 28;

const TITLE = 'MCM Studio';

/** 고객 Studio 화면 — `/studio` */
export default function CustomerStudioScreen() {
  const { t } = useTranslation();
  useReportActiveTab('studio');
  const { data: frames, isPending, isError, refetch } = useStudioFrames();

  const [selectedFrame, setSelectedFrame] = useState<StudioFrame | null>(null);
  const [capture, setCapture] = useState<StudioCapture | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);

  // 화면을 벗어날 때 아직 저장하지 않은 objectURL 이 남아 있으면 해제합니다.
  const captureRef = useRef<StudioCapture | null>(null);
  useEffect(() => {
    captureRef.current = capture;
  }, [capture]);
  useEffect(
    () => () => {
      if (captureRef.current) {
        URL.revokeObjectURL(captureRef.current.previewUrl);
      }
    },
    []
  );

  // 지연 초기화로 한 번만 만들고, 이후에는 애니메이션으로만 값을 바꿉니다.
  const [framesEnter] = useState(() => new Animated.Value(0));

  useEffect(() => {
    const animation = Animated.timing(framesEnter, {
      toValue: 1,
      duration: FRAMES_ENTER_DURATION_MS,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    });

    animation.start();
    return () => animation.stop();
  }, [framesEnter]);

  const framesStyle = {
    opacity: framesEnter,
    transform: [
      {
        translateY: framesEnter.interpolate({
          inputRange: [0, 1],
          outputRange: [FRAMES_RISE, 0],
        }),
      },
    ],
  };

  const handleReturnToFrames = useCallback(() => {
    setCapture((current) => {
      if (current) {
        URL.revokeObjectURL(current.previewUrl);
      }
      return null;
    });
    setSelectedFrame(null);
  }, []);

  const handleSave = useCallback(() => {
    if (capture) {
      downloadStudioCapture(capture);
    }
    handleReturnToFrames();
  }, [capture, handleReturnToFrames]);

  const handleCaptureStart = useCallback(() => setIsCapturing(true), []);
  const handleCaptureError = useCallback(() => setIsCapturing(false), []);
  const handleCapture = useCallback((next: StudioCapture) => {
    setIsCapturing(false);
    setCapture(next);
  }, []);

  return (
    // 배경은 `ScreenContainer` 바깥에 둡니다. 안에 넣으면 안전 영역 안쪽에 갇혀
    // 노치와 홈 인디케이터 자리에 색이 끊깁니다. 자세한 이유는 `screen-container.tsx` 참고.
    // 탭 바도 같은 이유로 바깥에 두고 화면 맨 아래에 붙입니다.
    <View style={styles.root}>
      <BrandBackdrop />

      <ScreenContainer backgroundColor="transparent" edgeToEdge style={styles.stage}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.gutter}>
            <BrandIntroHeader
              title={TITLE}
              description={
                selectedFrame
                  ? capture
                    ? t('studio.complete')
                    : isCapturing
                      ? t('studio.generating')
                      : t('studio.previewDescription')
                  : t('studio.description')
              }
              align="center"
              compact
              accessory={<InitialSetupButton iconOnly />}
            />
          </View>

          {selectedFrame ? (
            <StudioFrameStage
              frame={selectedFrame}
              capture={capture}
              onCaptureStart={handleCaptureStart}
              onCapture={handleCapture}
              onCaptureError={handleCaptureError}
              onSave={handleSave}
              onDelete={handleReturnToFrames}
              style={styles.frames}
            />
          ) : isPending ? (
            <View style={styles.statusBox}>
              <ActivityIndicator color={FixedColors.onDark} />
            </View>
          ) : isError ? (
            <View style={styles.statusBox}>
              <Text style={styles.statusText}>{t('studio.framesError')}</Text>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={t('studio.retry')}
                onPress={() => refetch()}
                style={styles.retryButton}
              >
                <Text style={styles.retryText}>{t('studio.retry')}</Text>
              </Pressable>
            </View>
          ) : (
            <Animated.View style={framesStyle}>
              <StudioFrameCarousel
                frames={frames}
                selectedFrameType={null}
                onSelect={setSelectedFrame}
                style={styles.frames}
              />
            </Animated.View>
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
    // 떠 있는 내비게이션에 콘텐츠가 가리지 않도록 그만큼 비워 둡니다.
    paddingBottom: NAV_AREA_HEIGHT,
  },
  gutter: {
    paddingHorizontal: Spacing.four,
  },
  frames: {
    marginTop: DESCRIPTION_TO_FRAMES,
  },
  statusBox: {
    marginTop: DESCRIPTION_TO_FRAMES,
    alignItems: 'center',
    gap: Spacing.three,
    paddingHorizontal: Spacing.four,
  },
  statusText: {
    ...Typography.bodyKo14,
    color: FixedColors.onDark,
    textAlign: 'center',
  },
  retryButton: {
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two,
    borderRadius: 999,
    backgroundColor: FixedColors.optionSurface,
  },
  retryText: {
    ...Typography.bodyKo14,
    color: FixedColors.onDark,
  },
});
