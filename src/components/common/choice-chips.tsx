import { Pressable, StyleSheet, Text, View } from 'react-native';

import { FieldLabel } from '@components/common/field-label';
import { FixedColors, Radius, Spacing } from '@constants/theme';

/** 칩 높이가 32 라 최소 터치 영역 44 를 채우려면 위아래로 6 씩 더 필요합니다. */
const HIT_SLOP = { top: 6, bottom: 6 } as const;

interface ChoiceChipOption<T extends string> {
  value: T;
  label: string;
}

interface ChoiceChipsProps<T extends string> {
  label: string;
  options: readonly ChoiceChipOption<T>[];
  value: T;
  onChange: (value: T) => void;
  /** 라벨에 빨간 별표를 붙입니다. */
  required?: boolean;
}

/** 하나만 고르는 알약 모양 칩 묶음. 시안의 Language 선택에 씁니다. */
export function ChoiceChips<T extends string>({
  label,
  options,
  value,
  onChange,
  required = false,
}: ChoiceChipsProps<T>) {
  return (
    <View style={styles.field}>
      <FieldLabel label={label} required={required} />

      <View accessibilityRole="radiogroup" accessibilityLabel={label} style={styles.chips}>
        {options.map((option) => {
          const isSelected = option.value === value;

          return (
            <Pressable
              key={option.value}
              accessibilityRole="radio"
              accessibilityLabel={option.label}
              accessibilityState={{ selected: isSelected, checked: isSelected }}
              hitSlop={HIT_SLOP}
              onPress={() => onChange(option.value)}
              style={[styles.chip, isSelected && styles.chipSelected]}
            >
              <Text style={[styles.chipLabel, isSelected && styles.chipLabelSelected]}>
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    width: '100%',
    gap: Spacing.two,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  chip: {
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.three,
    borderRadius: Radius.pill,
    borderWidth: 1,
    borderColor: FixedColors.onDark,
  },
  // 선택되면 명암이 뒤집힙니다. 테두리는 배경과 같은 색이라 보이지 않지만,
  // 남겨 두어야 선택 여부와 상관없이 칩 크기가 같습니다.
  chipSelected: {
    backgroundColor: FixedColors.onDark,
  },
  chipLabel: {
    fontSize: 14,
    color: FixedColors.onDark,
  },
  chipLabelSelected: {
    color: FixedColors.onLight,
  },
});
