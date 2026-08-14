import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';

import { FieldLabel } from '@components/common/field-label';
import { BrandColors, Spacing } from '@constants/theme';
import chevronDown from '@assets/images/login/chevron-down.svg';

/** 필드 높이가 42 라 최소 터치 영역 44 를 채우려면 위아래로 1 씩 더 필요합니다. */
const HIT_SLOP = { top: 1, bottom: 1 } as const;

interface SelectOption<T extends string> {
  value: T;
  label: string;
}

interface OutlinedSelectFieldProps<T extends string> {
  label: string;
  options: readonly SelectOption<T>[];
  value: T;
  onChange: (value: T) => void;
  /** 라벨에 빨간 별표를 붙입니다. */
  required?: boolean;
}

/**
 * 어두운 배경 위 테두리만 있는 선택 필드.
 *
 * 시안에는 닫힌 상태만 그려져 있어, 펼친 목록은 같은 테두리를 아래로 이어 붙였습니다.
 * 네이티브 피커나 모달을 쓰지 않는 이유는 iOS / Android / 웹에서 모양이 제각각이기 때문입니다.
 */
export function OutlinedSelectField<T extends string>({
  label,
  options,
  value,
  onChange,
  required = false,
}: OutlinedSelectFieldProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const selectedLabel = options.find((option) => option.value === value)?.label ?? '';

  const handleToggle = () => {
    setIsOpen((previous) => !previous);
  };

  const handleSelect = (next: T) => {
    onChange(next);
    setIsOpen(false);
  };

  return (
    <View style={styles.field}>
      <FieldLabel label={label} required={required} />

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityValue={{ text: selectedLabel }}
        accessibilityState={{ expanded: isOpen }}
        hitSlop={HIT_SLOP}
        onPress={handleToggle}
        style={styles.box}
      >
        <Text style={styles.value}>{selectedLabel}</Text>
        <Image
          source={chevronDown}
          style={[styles.chevron, isOpen && styles.chevronOpen]}
          contentFit="contain"
          accessible={false}
        />
      </Pressable>

      {isOpen ? (
        <View style={styles.options}>
          {options.map((option) => (
            <Pressable
              key={option.value}
              accessibilityRole="button"
              accessibilityLabel={option.label}
              accessibilityState={{ selected: option.value === value }}
              onPress={() => handleSelect(option.value)}
              style={styles.option}
            >
              <Text style={styles.value}>{option.label}</Text>
            </Pressable>
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    width: '100%',
    gap: Spacing.two,
  },
  box: {
    height: 42,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
    paddingHorizontal: Spacing.three,
    borderWidth: 1,
    borderColor: BrandColors.onDark,
  },
  value: {
    fontSize: 14,
    color: BrandColors.onDark,
  },
  chevron: {
    width: 12,
    height: 8,
  },
  chevronOpen: {
    transform: [{ rotate: '180deg' }],
  },
  // 닫힌 필드 바로 아래에 붙도록 위 테두리를 지우고 이어 붙입니다.
  options: {
    marginTop: -Spacing.two,
    borderWidth: 1,
    borderTopWidth: 0,
    borderColor: BrandColors.onDark,
    backgroundColor: BrandColors.splashBackground,
  },
  option: {
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
});
