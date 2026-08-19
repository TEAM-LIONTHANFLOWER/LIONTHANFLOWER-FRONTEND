/**
 * 프레임을 하나 고른 뒤의 촬영 ~ 결과 단계.
 *
 * `capture` 가 없으면 — 실시간 카메라 위에 프레임을 얹고 셔터로 촬영을 기다립니다.
 * `capture` 가 있으면 — 합성된 결과 사진을 보여주고, 옆에 삭제·저장 버튼을 냅니다.
 */
import { Image } from 'expo-image';
import { useEffect, useRef } from 'react';
import {
  Animated,
  Pressable,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import type { StudioCapture, StudioFrame } from '@/types/studio';
import deleteIcon from '@assets/images/studio/delete.svg';
import storageIcon from '@assets/images/studio/storage.svg';
import { StudioCamera } from '@components/customer/studio-camera';
import { STUDIO_FRAME_HEIGHT, STUDIO_FRAME_WIDTH } from '@components/customer/studio-frame-card';
import { FixedColors } from '@constants/theme';
import { useTranslation } from '@hooks/use-translation';

/** 결과 사진이 나타난 뒤 왼쪽으로 밀리는 거리와 그 애니메이션 시간. */
const RESULT_SHIFT_LEFT = 36;
const RESULT_SHIFT_DURATION_MS = 300;

/** 삭제·저장 버튼 — 결과 사진 오른쪽 옆 간격, 세로 위치, 버튼 사이 간격. */
const RESULT_ACTIONS_GAP = 25;
const RESULT_ACTIONS_TOP = 169;
const RESULT_ACTIONS_BUTTON_GAP = 20;

/** 삭제·저장 버튼 원 — 지름과 안쪽 아이콘 치수. */
const RESULT_ACTION_BUTTON_SIZE = 50;
const RESULT_ACTION_ICON_SIZE = 24;

interface StudioFrameStageProps {
  frame: StudioFrame;
  /** 아직 촬영 전이면 `null`. */
  capture: StudioCapture | null;
  onCaptureStart: () => void;
  onCapture: (capture: StudioCapture) => void;
  onCaptureError: () => void;
  onSave: () => void;
  onDelete: () => void;
  style?: StyleProp<ViewStyle>;
}

export function StudioFrameStage({
  frame,
  capture,
  onCaptureStart,
  onCapture,
  onCaptureError,
  onSave,
  onDelete,
  style,
}: StudioFrameStageProps) {
  const { t } = useTranslation();
  const shiftLeft = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!capture) {
      shiftLeft.setValue(0);
      return;
    }

    Animated.timing(shiftLeft, {
      toValue: -RESULT_SHIFT_LEFT,
      duration: RESULT_SHIFT_DURATION_MS,
      useNativeDriver: true,
    }).start();
  }, [capture, shiftLeft]);

  if (capture) {
    return (
      <View style={[styles.stage, style]}>
        <Animated.View style={[styles.resultGroup, { transform: [{ translateX: shiftLeft }] }]}>
          <Image
            source={capture.previewUrl}
            style={styles.resultImage}
            contentFit="cover"
            accessibilityLabel={t('a11y.generatedMagazine')}
          />

          <View style={styles.resultActions}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('a11y.delete')}
              onPress={onDelete}
              style={styles.resultActionButton}
            >
              <Image
                source={deleteIcon}
                style={styles.resultActionIcon}
                contentFit="contain"
                accessible={false}
              />
            </Pressable>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('a11y.save')}
              onPress={onSave}
              style={styles.resultActionButton}
            >
              <Image
                source={storageIcon}
                style={styles.resultActionIcon}
                contentFit="contain"
                accessible={false}
              />
            </Pressable>
          </View>
        </Animated.View>
      </View>
    );
  }

  return (
    <View style={[styles.stage, style]}>
      <StudioCamera
        frame={frame}
        onCaptureStart={onCaptureStart}
        onCapture={onCapture}
        onCaptureError={onCaptureError}
        style={styles.camera}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  stage: {
    width: '100%',
    height: STUDIO_FRAME_HEIGHT,
    flexDirection: 'row',
    justifyContent: 'center',
    // resultGroup 의 translateX 애니메이션 중 브라우저가 트랜스폼된 레이어의 페인트
    // 경계를 놓쳐 이전 프레임 잔상을 남기는 경우가 있어, 클리핑 경계를 명시적으로 둡니다.
    overflow: 'hidden',
  },
  camera: {
    width: STUDIO_FRAME_WIDTH,
    height: STUDIO_FRAME_HEIGHT,
  },
  resultGroup: {
    width: STUDIO_FRAME_WIDTH,
    height: STUDIO_FRAME_HEIGHT,
    // translateX 애니메이션 중 GPU 레이어가 불안정해져 이전 프레임이 잔상으로 남는
    // 문제를 막기 위한 힌트입니다.
    backfaceVisibility: 'hidden',
  },
  resultImage: {
    width: STUDIO_FRAME_WIDTH,
    height: STUDIO_FRAME_HEIGHT,
  },
  // 결과 사진 오른쪽 옆에 삭제·저장 버튼을 세로로 늘어놓습니다.
  resultActions: {
    position: 'absolute',
    top: RESULT_ACTIONS_TOP,
    left: STUDIO_FRAME_WIDTH + RESULT_ACTIONS_GAP,
    gap: RESULT_ACTIONS_BUTTON_GAP,
  },
  resultActionButton: {
    width: RESULT_ACTION_BUTTON_SIZE,
    height: RESULT_ACTION_BUTTON_SIZE,
    borderRadius: RESULT_ACTION_BUTTON_SIZE / 2,
    backgroundColor: FixedColors.resultActionSurface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultActionIcon: {
    width: RESULT_ACTION_ICON_SIZE,
    height: RESULT_ACTION_ICON_SIZE,
  },
});
