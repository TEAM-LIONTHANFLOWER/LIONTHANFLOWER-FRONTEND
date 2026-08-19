import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import type { StudioCapture, StudioFrame } from '@/types/studio';
import { FixedColors, Spacing, Typography } from '@constants/theme';
import { useTranslation } from '@hooks/use-translation';

interface StudioCameraProps {
  frame: StudioFrame;
  onCaptureStart: () => void;
  onCapture: (capture: StudioCapture) => void;
  onCaptureError: () => void;
  style?: StyleProp<ViewStyle>;
}

/**
 * 네이티브에는 아직 카메라 촬영을 붙이지 않았습니다 — getUserMedia·Canvas 기반이라 웹 전용입니다.
 * 실제 구현은 `studio-camera.web.tsx` 참고.
 */
export function StudioCamera({ style }: StudioCameraProps) {
  const { t } = useTranslation();

  return (
    <View style={[styles.stage, style]}>
      <Text style={styles.message}>{t('studio.webOnly')}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  stage: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: FixedColors.frameWindowFill,
    paddingHorizontal: Spacing.four,
  },
  message: {
    ...Typography.bodyKo14,
    color: FixedColors.onDark,
    textAlign: 'center',
  },
});
