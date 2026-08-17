import {
  Pressable,
  StyleSheet,
  Text,
  type ImageRequireSource,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { Image } from 'expo-image';

import { FixedColors, FontFamily, LineHeightRatio, Radius, Spacing } from '@constants/theme';

/** 버튼 높이가 28 이라 최소 터치 영역 44 를 채우려면 위아래로 8 씩 더 필요합니다. */
const HIT_SLOP = { top: 8, bottom: 8 } as const;

/** 시안의 버튼 치수. Spacing 스케일에 없는 값이라 이름을 붙여 둡니다. */
const PADDING_X = 15;
const PADDING_Y = 5;
const LABEL_FONT_SIZE = 12;
const ICON_SIZE = 24;

interface ActionPillProps {
  label: string;
  /**
   * 버튼을 눌렀을 때.
   * 아직 갈 곳이 정해지지 않은 버튼은 비워 둡니다. 그러면 흐려지고 눌리지 않습니다.
   */
  onPress?: () => void;
  /** 라벨 왼쪽에 붙는 아이콘 */
  icon?: ImageRequireSource;
  /** 나란히 놓인 버튼끼리 남는 가로 공간을 똑같이 나눠 갖게 합니다. */
  fill?: boolean;
  style?: StyleProp<ViewStyle>;
}

/**
 * 검은 알약 버튼. 직원 화면의 모든 액션과 홈 계열 화면의 `Initial setup` 이 이 모양입니다.
 * 고객·직원이 함께 쓰기 때문에 `common` 에 둡니다.
 */
export function ActionPill({ label, onPress, icon, fill = false, style }: ActionPillProps) {
  const disabled = onPress === undefined;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      disabled={disabled}
      hitSlop={HIT_SLOP}
      onPress={onPress}
      style={[styles.pill, fill && styles.pillFill, disabled && styles.pillDisabled, style]}
    >
      {icon === undefined ? null : (
        <Image source={icon} style={styles.icon} contentFit="contain" accessible={false} />
      )}
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
    paddingHorizontal: PADDING_X,
    paddingVertical: PADDING_Y,
    borderRadius: Radius.pill,
    backgroundColor: FixedColors.solidButton,
  },
  pillFill: {
    flex: 1,
  },
  pillDisabled: {
    opacity: 0.4,
  },
  icon: {
    width: ICON_SIZE,
    height: ICON_SIZE,
  },
  label: {
    fontFamily: FontFamily.sans,
    fontSize: LABEL_FONT_SIZE,
    lineHeight: LABEL_FONT_SIZE * LineHeightRatio.base,
    color: FixedColors.onDark,
  },
});
