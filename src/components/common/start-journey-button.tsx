import { Pressable, StyleSheet, Text, type StyleProp, type ViewStyle } from 'react-native';
import { Image } from 'expo-image';

import { BrandColors, FontFamily } from '@constants/theme';
import arrowNext from '@assets/images/onboarding/arrow-next.svg';

interface StartJourneyButtonProps {
  onPress: () => void;
  /** 필수 입력이 비어 있으면 눌리지 않게 합니다. */
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}

/**
 * 정보 입력을 끝내고 다음 화면으로 넘어가는 버튼.
 * 시안에서 라벨은 왼쪽, 화살표는 188 폭의 오른쪽 끝에 붙습니다.
 */
export function StartJourneyButton({ onPress, disabled = false, style }: StartJourneyButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="여정 시작"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={[styles.button, disabled && styles.buttonDisabled, style]}
    >
      <Text style={styles.label}>Start to Journey</Text>
      <Image source={arrowNext} style={styles.arrow} contentFit="contain" accessible={false} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 188,
    height: 46,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  buttonDisabled: {
    opacity: 0.4,
  },
  label: {
    fontFamily: FontFamily.labelRegular,
    fontSize: 16,
    lineHeight: 24,
    color: BrandColors.onDark,
  },
  arrow: {
    width: 51,
    height: 10.5,
  },
});
