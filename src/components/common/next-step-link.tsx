import { Pressable, StyleSheet, Text, type StyleProp, type ViewStyle } from 'react-native';
import { Image } from 'expo-image';

import { FixedColors, FontFamily } from '@constants/theme';
import arrowNext from '@assets/images/onboarding/arrow-next.svg';

/** 글자 높이가 24 라 최소 터치 영역 44 를 채우려면 위아래로 10 씩 더 필요합니다. */
const HIT_SLOP = { top: 10, bottom: 10 } as const;

/** 시안의 치수. Spacing 스케일에 없는 값이라 이름을 붙여 둡니다. */
const LABEL_FONT_SIZE = 16;
const LABEL_LINE_HEIGHT = 24;
const LABEL_TO_ARROW = 22;
const ARROW_WIDTH = 51;
const ARROW_HEIGHT = 10;

/** 눌리지 않을 때의 흐리기. 다른 비활성 버튼과 같은 값입니다. */
const DISABLED_OPACITY = 0.4;

const LABEL = 'NEXT';

interface NextStepLinkProps {
  onPress: () => void;
  /** 스크린 리더가 읽을 이름. `NEXT` 만으로는 어디로 가는지 알 수 없어 따로 받습니다. */
  accessibilityLabel: string;
  /** 보내는 중처럼 더 누르면 안 될 때. 흐려지고 눌리지 않습니다. */
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}

/**
 * 화면 오른쪽 아래에 걸리는 `NEXT →`. 여러 단계로 나뉜 화면을 앞으로 넘깁니다.
 *
 * 어두운 브랜드 배경 위에만 올라가므로 글자와 화살표가 흰색으로 고정입니다.
 */
export function NextStepLink({
  onPress,
  accessibilityLabel,
  disabled = false,
  style,
}: NextStepLinkProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled }}
      disabled={disabled}
      hitSlop={HIT_SLOP}
      onPress={onPress}
      style={[styles.link, disabled && styles.linkDisabled, style]}
    >
      <Text style={styles.label}>{LABEL}</Text>
      <Image source={arrowNext} style={styles.arrow} contentFit="contain" accessible={false} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  link: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
    gap: LABEL_TO_ARROW,
  },
  linkDisabled: {
    opacity: DISABLED_OPACITY,
  },
  label: {
    fontFamily: FontFamily.label,
    fontSize: LABEL_FONT_SIZE,
    lineHeight: LABEL_LINE_HEIGHT,
    color: FixedColors.onDark,
  },
  arrow: {
    width: ARROW_WIDTH,
    height: ARROW_HEIGHT,
  },
});
