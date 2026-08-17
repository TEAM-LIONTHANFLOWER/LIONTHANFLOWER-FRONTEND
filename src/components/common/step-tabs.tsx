import { useEffect, useRef } from 'react';
import {
  Animated,
  Easing,
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { FixedColors, Typography } from '@constants/theme';

/** 탭 높이가 32 라 최소 터치 영역 44 를 채우려면 위아래로 6 씩 더 필요합니다. */
const HIT_SLOP = { top: 6, bottom: 6 } as const;
const TAB_HEIGHT = 32;
const BORDER_WIDTH = 1;

/** 시안의 자간 −2.5%. Figma 텍스트 스타일에는 없는 값이라 여기서 직접 잡습니다. */
const LABEL_TRACKING = -0.325;

/** 고른 칸에 색이 차오르는 시간. */
const FILL_DURATION_MS = 220;

export interface StepTabOption<T extends string> {
  value: T;
  label: string;
}

interface StepTabsProps<T extends string> {
  /** 스크린 리더가 읽을 묶음 이름 */
  label: string;
  options: readonly StepTabOption<T>[];
  value: T;
  onChange: (value: T) => void;
  style?: StyleProp<ViewStyle>;
}

interface StepTabProps {
  label: string;
  isSelected: boolean;
  /** 첫 칸을 뺀 나머지는 왼쪽 테두리를 앞 칸과 겹쳐 한 줄로 만듭니다. */
  isFirst: boolean;
  onPress: () => void;
}

/**
 * 칸 하나. 고르면 노란 면이 차오르고 글자색이 뒤집힙니다.
 *
 * 색을 바로 바꾸지 않고 면과 글자를 겹쳐 두고 투명도만 교차시킵니다.
 * 색 보간과 달리 네이티브 드라이버로 돌릴 수 있고, 글자 가장자리에 먼저 칠한 색이 비치지 않습니다.
 */
function StepTab({ label, isSelected, isFirst, onPress }: StepTabProps) {
  // 지연 초기화로 한 번만 만들고, 이후에는 애니메이션으로만 값을 바꿉니다.
  const fill = useRef(new Animated.Value(isSelected ? 1 : 0)).current;

  useEffect(() => {
    const animation = Animated.timing(fill, {
      toValue: isSelected ? 1 : 0,
      duration: FILL_DURATION_MS,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    });

    animation.start();
    return () => animation.stop();
  }, [fill, isSelected]);

  const fade = fill.interpolate({ inputRange: [0, 1], outputRange: [1, 0] });

  return (
    <Pressable
      accessibilityRole="tab"
      accessibilityLabel={label}
      accessibilityState={{ selected: isSelected }}
      hitSlop={HIT_SLOP}
      onPress={onPress}
      style={[styles.tab, !isFirst && styles.tabJoined]}
    >
      <Animated.View style={[styles.fill, { opacity: fill }]} />

      {/* 고르지 않은 상태의 글자가 칸 크기를 정하고, 고른 상태의 글자는 그 위에 겹칩니다. */}
      <Animated.Text numberOfLines={1} style={[styles.label, { opacity: fade }]}>
        {label}
      </Animated.Text>
      <Animated.View style={[styles.labelOverlay, { opacity: fill }]}>
        <Text numberOfLines={1} style={[styles.label, styles.labelSelected]}>
          {label}
        </Text>
      </Animated.View>
    </Pressable>
  );
}

/**
 * 여러 단계로 나뉜 폼의 위쪽에 놓이는 단계 표시. 눌러서 단계를 오갈 수 있습니다.
 * 직원용 기록 작성 폼의 `구매정보 / 고객선호 / 응대특성 / 직원관찰` 이 이 컴포넌트입니다.
 *
 * 칸 사이에 여백이 없습니다. 맞닿은 테두리를 1 만큼 겹쳐 한 줄로 만들어,
 * 네 칸이 끊긴 데 없이 이어진 한 덩어리로 보입니다.
 *
 * 같은 탭이지만 `pill-tabs` 와는 모양과 배치가 다릅니다 — 저쪽은 낱말 길이만큼만 차지하는
 * 알약이 사이를 띄우고 늘어서고, 이쪽은 각진 칸이 한 줄을 똑같이 나눠 갖습니다.
 * 단계 수가 정해져 있고 진행 정도를 함께 보여줘야 해서입니다.
 *
 * 어두운 브랜드 배경 위에만 올라가므로 색이 `FixedColors` 로 고정입니다.
 */
export function StepTabs<T extends string>({
  label,
  options,
  value,
  onChange,
  style,
}: StepTabsProps<T>) {
  return (
    <View accessibilityRole="tablist" accessibilityLabel={label} style={[styles.tabs, style]}>
      {options.map((option, index) => (
        <StepTab
          key={option.value}
          label={option.label}
          isSelected={option.value === value}
          isFirst={index === 0}
          onPress={() => onChange(option.value)}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  tabs: {
    flexDirection: 'row',
  },
  // 테두리는 고르든 말든 남겨 두어야 칸 크기가 같습니다.
  // 노란 면이 그 위를 덮어서 고른 칸에서는 테두리가 따로 보이지 않습니다.
  tab: {
    flex: 1,
    height: TAB_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: BORDER_WIDTH,
    borderColor: FixedColors.highlight,
  },
  // 앞 칸의 오른쪽 테두리와 겹쳐 두 줄이 한 줄이 됩니다.
  tabJoined: {
    marginLeft: -BORDER_WIDTH,
  },
  fill: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: FixedColors.highlight,
  },
  // 글자를 칸에 꽉 채운 겹으로 감싸 둡니다. 글꼴 높이와 상관없이 가운데에 맞습니다.
  labelOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    ...Typography.bodyKo13,
    letterSpacing: LABEL_TRACKING,
    color: FixedColors.highlight,
  },
  labelSelected: {
    color: FixedColors.onLight,
  },
});
