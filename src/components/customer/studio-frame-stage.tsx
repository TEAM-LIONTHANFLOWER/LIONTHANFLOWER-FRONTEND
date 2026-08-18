/**
 * 프레임을 고른 뒤 이어지는 촬영 단계
 * `idle`(다음 화살표 + 셔터) → `generating`(로딩 아이콘) → `complete`(결과 이미지 +
 * 삭제·저장 버튼, 왼쪽으로 밀리는 애니메이션) 세 상태를 한 컴포넌트에서 그립니다.
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

import type { StudioFrameId, StudioGenerationStatus } from '@/types/studio';
import cameraIcon from '@assets/images/studio/camera.svg';
import deleteIcon from '@assets/images/studio/delete.svg';
import resultImage from '@assets/images/studio/image.svg';
import loadingIcon from '@assets/images/studio/loading.svg';
import nextIcon from '@assets/images/studio/next.svg';
import storageIcon from '@assets/images/studio/storage.svg';
import {
  STUDIO_FRAME_HEIGHT,
  STUDIO_FRAME_WIDTH,
  StudioFrameCard,
} from '@components/customer/studio-frame-card';
import { FixedColors } from '@constants/theme';
import { useTranslation } from '@hooks/use-translation';

/**
 * 다음 아이콘 원본 치수.
 * 화살표 표시가 이미 오른쪽에 26px 여백을 두고 그려져 있어, 박스를 화면 끝에 딱 붙이면
 * (`right: 0`) 그 여백만으로 정확히 26px 이 남습니다. 따로 오른쪽 거리를 더하지 않습니다.
 */
const NEXT_ICON_SIZE = 65;

/** 셔터 버튼 — 지름과 안쪽 카메라 아이콘 치수. */
const SHUTTER_SIZE = 70;
const SHUTTER_ICON_SIZE = 24;

/**
 * 완성 이미지 원본 치수.
 * 둘레에 그림자 여백이 포함돼 있어 프레임(211×458)보다 큽니다. 안쪽 사진 자리만큼
 * (왼쪽 30 / 위 26) 밀어 넣으면, 걷어낸 자리가 프레임이 있던 자리와 정확히 겹칩니다.
 */
const RESULT_IMAGE_WIDTH = 271;
const RESULT_IMAGE_HEIGHT = 518;
const RESULT_IMAGE_INSET_LEFT = 30;
const RESULT_IMAGE_INSET_TOP = 26;

/** 완성 이미지가 나타난 뒤 왼쪽으로 밀리는 거리와 그 애니메이션 시간. */
const RESULT_SHIFT_LEFT = 36;
const RESULT_SHIFT_DURATION_MS = 300;

/** 삭제·저장 버튼 — image.svg 오른쪽 옆 간격, 이미지 위에서부터의 세로 위치, 버튼 사이 간격. */
const RESULT_ACTIONS_GAP = 25;
const RESULT_ACTIONS_TOP = 169;
const RESULT_ACTIONS_BUTTON_GAP = 20;

/** 삭제·저장 버튼 원 — 지름과 안쪽 아이콘 치수. */
const RESULT_ACTION_BUTTON_SIZE = 50;
const RESULT_ACTION_ICON_SIZE = 24;

interface StudioFrameStageProps {
  frameId: StudioFrameId;
  status: StudioGenerationStatus;
  onPressNext: () => void;
  /** 완성 결과의 삭제·저장 버튼을 누르면 호출됩니다. 다시 프레임을 고르는 화면으로 돌아갑니다. */
  onReturnToFrames: () => void;
  style?: StyleProp<ViewStyle>;
}

/**
 * 프레임을 하나 고른 뒤의 미리보기 ~ 생성 결과 단계.
 *
 * `idle` — 고른 프레임 위에 다음 화살표와 셔터 버튼을 얹습니다.
 * `generating` — 다음 화살표는 사라지고, 셔터 아이콘만 로딩으로 바뀝니다.
 * `complete` — 프레임 자체를 완성 이미지로 갈아 끼우고, 왼쪽으로 밀며 옆에 삭제·저장 버튼을 냅니다.
 *   두 버튼 모두 누르면 프레임 선택 화면으로 돌아갑니다.
 */
export function StudioFrameStage({
  frameId,
  status,
  onPressNext,
  onReturnToFrames,
  style,
}: StudioFrameStageProps) {
  const { t } = useTranslation();
  const shiftLeft = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (status !== 'complete') {
      shiftLeft.setValue(0);
      return;
    }

    Animated.timing(shiftLeft, {
      toValue: -RESULT_SHIFT_LEFT,
      duration: RESULT_SHIFT_DURATION_MS,
      useNativeDriver: true,
    }).start();
  }, [status, shiftLeft]);

  if (status === 'complete') {
    return (
      <View style={[styles.stage, style]}>
        <Animated.View style={[styles.resultGroup, { transform: [{ translateX: shiftLeft }] }]}>
          <Image
            source={resultImage}
            style={styles.resultImage}
            contentFit="contain"
            accessibilityLabel={t('a11y.generatedMagazine')}
          />

          <View style={styles.resultActions}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('a11y.delete')}
              onPress={onReturnToFrames}
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
              onPress={onReturnToFrames}
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
      <StudioFrameCard frameId={frameId} selected onSelect={() => {}} />

      {status === 'idle' ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('a11y.next')}
          onPress={onPressNext}
          style={styles.nextButton}
        >
          <Image
            source={nextIcon}
            style={styles.nextIcon}
            contentFit="contain"
            accessible={false}
          />
        </Pressable>
      ) : null}

      <View style={styles.shutter}>
        <Image
          source={status === 'generating' ? loadingIcon : cameraIcon}
          style={styles.shutterIcon}
          contentFit="contain"
          accessible={false}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  stage: {
    width: '100%',
    height: STUDIO_FRAME_HEIGHT,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  nextButton: {
    position: 'absolute',
    top: '50%',
    right: 0,
    width: NEXT_ICON_SIZE,
    height: NEXT_ICON_SIZE,
    marginTop: -NEXT_ICON_SIZE / 2,
  },
  nextIcon: {
    width: NEXT_ICON_SIZE,
    height: NEXT_ICON_SIZE,
  },
  shutter: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: SHUTTER_SIZE,
    height: SHUTTER_SIZE,
    marginTop: -SHUTTER_SIZE / 2,
    marginLeft: -SHUTTER_SIZE / 2,
    borderRadius: SHUTTER_SIZE / 2,
    backgroundColor: FixedColors.scrim,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shutterIcon: {
    width: SHUTTER_ICON_SIZE,
    height: SHUTTER_ICON_SIZE,
  },
  // 프레임이 있던 자리에 그대로 겹치도록 잡은 자리. 애니메이션은 여기서부터 왼쪽으로 밀립니다.
  resultGroup: {
    position: 'absolute',
    top: -RESULT_IMAGE_INSET_TOP,
    left: '50%',
    width: RESULT_IMAGE_WIDTH,
    height: RESULT_IMAGE_HEIGHT,
    marginLeft: -(STUDIO_FRAME_WIDTH / 2 + RESULT_IMAGE_INSET_LEFT),
  },
  resultImage: {
    width: RESULT_IMAGE_WIDTH,
    height: RESULT_IMAGE_HEIGHT,
  },
  // image.svg 는 오른쪽에도 보이지 않는 그림자 여백(30px)이 있어, 원본 폭이 아니라
  // 안쪽 사진 자리의 오른쪽 끝(왼쪽 여백 + 프레임 폭)을 기준으로 25px 을 띄웁니다.
  // 그룹이 통째로 움직여도 간격은 그대로 유지됩니다.
  resultActions: {
    position: 'absolute',
    top: RESULT_ACTIONS_TOP,
    left: RESULT_IMAGE_INSET_LEFT + STUDIO_FRAME_WIDTH + RESULT_ACTIONS_GAP,
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
