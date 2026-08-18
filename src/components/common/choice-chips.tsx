import { Pressable, StyleSheet, Text, View } from 'react-native';

import { FieldLabel } from '@components/common/field-label';
import { FixedColors, Radius, Spacing } from '@constants/theme';

/** 칩 높이가 32 라 최소 터치 영역 44 를 채우려면 위아래로 6 씩 더 필요합니다. */
const HIT_SLOP = { top: 6, bottom: 6 } as const;

interface ChoiceChipOption<T extends string> {
  value: T;
  label: string;
}

type ChoiceChipsProps<T extends string> = {
  label: string;
  options: readonly ChoiceChipOption<T>[];
  /** 라벨에 빨간 별표를 붙입니다. */
  required?: boolean;
} & (
  | { multiple?: false; value: T; onChange: (value: T) => void }
  | { multiple: true; value: readonly T[]; onChange: (value: readonly T[]) => void }
);

/**
 * 알약 모양 칩 묶음. 시안의 Language 선택과 직원용 기록 작성 폼의 취향 항목이 씁니다.
 *
 * 기본은 하나만 고르고, `multiple` 을 켜면 여러 개를 고릅니다.
 * 두 경우에 값의 모양이 달라 props 를 한 쌍으로 묶어 두었습니다 —
 * 하나만 고를 때는 값 하나, 여러 개일 때는 값의 배열이 오갑니다.
 */
export function ChoiceChips<T extends string>(props: ChoiceChipsProps<T>) {
  const { label, options, required = false } = props;
  const selected: readonly T[] = props.multiple === true ? props.value : [props.value];

  const handlePress = (next: T) => {
    if (props.multiple === true) {
      props.onChange(
        props.value.includes(next)
          ? props.value.filter((item) => item !== next)
          : [...props.value, next]
      );
      return;
    }

    props.onChange(next);
  };

  return (
    <View style={styles.field}>
      <FieldLabel label={label} required={required} />

      <View
        accessibilityRole={props.multiple === true ? 'list' : 'radiogroup'}
        accessibilityLabel={label}
        style={styles.chips}
      >
        {options.map((option) => {
          const isSelected = selected.includes(option.value);

          return (
            <Pressable
              key={option.value}
              accessibilityRole={props.multiple === true ? 'checkbox' : 'radio'}
              accessibilityLabel={option.label}
              accessibilityState={{ selected: isSelected, checked: isSelected }}
              hitSlop={HIT_SLOP}
              onPress={() => handlePress(option.value)}
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
  // 선택되면 명암이 뒤집힙니다. 테두리는 배경과 거의 같은 색이라 보이지 않지만,
  // 남겨 두어야 선택 여부와 상관없이 칩 크기가 같습니다.
  chipSelected: {
    backgroundColor: FixedColors.selectedSurface,
  },
  chipLabel: {
    fontSize: 14,
    color: FixedColors.onDark,
  },
  chipLabelSelected: {
    color: FixedColors.onLight,
  },
});
