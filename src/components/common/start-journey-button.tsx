import { Pressable, StyleSheet, Text, type StyleProp, type ViewStyle } from 'react-native';
import { Image } from 'expo-image';

import { FixedColors, FontFamily } from '@constants/theme';
import { useTranslation } from '@hooks/use-translation';
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
  // 버튼에 보이는 글자는 시안대로 영문 고정이라, 보조 기술이 읽을 이름만 번역합니다.
  const { t } = useTranslation();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={t('a11y.startJourney')}
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
    fontFamily: FontFamily.label,
    fontSize: 16,
    lineHeight: 24,
    color: FixedColors.onDark,
  },
  arrow: {
    width: 51,
    height: 10.5,
  },
});
