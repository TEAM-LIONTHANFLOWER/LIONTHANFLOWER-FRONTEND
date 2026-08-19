import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { FixedColors, Radius, Spacing, Typography } from '@constants/theme';

/** 탭 높이가 32 라 최소 터치 영역 44 를 채우려면 위아래로 6 씩 더 필요합니다. */
const HIT_SLOP = { top: 6, bottom: 6 } as const;
const TAB_HEIGHT = 32;

export interface PillTabOption<T extends string> {
  value: T;
  label: string;
  /** 아직 만들지 않은 화면을 가리키는 탭은 눌리지 않게 둡니다. */
  disabled?: boolean;
}

interface PillTabsProps<T extends string> {
  /** 스크린 리더가 읽을 묶음 이름 */
  label: string;
  options: readonly PillTabOption<T>[];
  value: T;
  onChange: (value: T) => void;
  style?: StyleProp<ViewStyle>;
}

/**
 * 화면 안 내용을 갈라 보여주는 알약 모양 탭.
 * 고객 홈의 `Home / Arc`, 직원 홈의 `With / Solo` 가 이 컴포넌트입니다.
 *
 * 같은 알약 모양인 `choice-chips` 와는 역할이 다릅니다 — 저쪽은 라벨과 필수 표시가 붙는
 * 입력 폼 필드이고, 이쪽은 이미 그려진 화면을 갈아 끼우는 탭입니다.
 *
 * 어두운 브랜드 배경 위에만 올라가므로 색이 `FixedColors` 로 고정입니다.
 */
export function PillTabs<T extends string>({
  label,
  options,
  value,
  onChange,
  style,
}: PillTabsProps<T>) {
  return (
    <View accessibilityRole="tablist" accessibilityLabel={label} style={[styles.tabs, style]}>
      {options.map((option) => {
        const isSelected = option.value === value;
        const isDisabled = option.disabled ?? false;

        return (
          <Pressable
            key={option.value}
            accessibilityRole="tab"
            accessibilityLabel={option.label}
            accessibilityState={{ selected: isSelected, disabled: isDisabled }}
            disabled={isDisabled}
            hitSlop={HIT_SLOP}
            onPress={() => onChange(option.value)}
            style={[styles.tab, isSelected && styles.tabSelected, isDisabled && styles.tabDisabled]}
          >
            <Text style={[styles.label, isSelected && styles.labelSelected]}>{option.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  tabs: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  // 선택되면 명암이 뒤집힙니다. 테두리는 배경과 같은 색이라 보이지 않지만,
  // 남겨 두어야 선택 여부와 상관없이 탭 크기가 같습니다.
  tab: {
    height: TAB_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.three,
    borderRadius: Radius.pill,
    borderWidth: 1,
    borderColor: FixedColors.highlight,
  },
  tabSelected: {
    backgroundColor: FixedColors.highlight,
  },
  tabDisabled: {
    opacity: 0.4,
  },
  label: {
    ...Typography.bodyKo13,
    color: FixedColors.highlight,
  },
  labelSelected: {
    color: FixedColors.onLight,
  },
});
