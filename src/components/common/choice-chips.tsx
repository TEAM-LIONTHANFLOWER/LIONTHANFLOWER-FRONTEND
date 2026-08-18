import type { ReactElement } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { FieldLabel } from '@components/common/field-label';
import { FixedColors, Radius, Spacing } from '@constants/theme';

/** 칩 높이가 32 라 최소 터치 영역 44 를 채우려면 위아래로 6 씩 더 필요합니다. */
const HIT_SLOP = { top: 6, bottom: 6 } as const;

interface ChoiceChipOption<T extends string> {
  value: T;
  label: string;
}

interface ChoiceChipsBaseProps<T extends string> {
  label: string;
  options: readonly ChoiceChipOption<T>[];
  /** 라벨에 빨간 별표를 붙입니다. */
  required?: boolean;
}

interface SingleChoiceChipsProps<T extends string> extends ChoiceChipsBaseProps<T> {
  multiple?: false;
  value: T;
  onChange: (value: T) => void;
}

interface MultipleChoiceChipsProps<T extends string> extends ChoiceChipsBaseProps<T> {
  multiple: true;
  value: readonly T[];
  onChange: (value: readonly T[]) => void;
}

type ChoiceChipsProps<T extends string> = SingleChoiceChipsProps<T> | MultipleChoiceChipsProps<T>;

/**
 * 알약 모양 칩 묶음. 시안의 Language 선택에 씁니다.
 *
 * 기본은 하나만 고르는 라디오이고, `multiple` 을 켜면 여러 개를 켜고 끄는
 * 체크박스가 됩니다. 고객은 화면을 그릴 언어 하나를, 직원은 응대할 수 있는
 * 언어 여러 개를 고르기 때문에 두 가지 모드가 필요합니다.
 *
 * 아래 두 줄은 오버로드 선언입니다. 합집합 타입 하나로 두면 TypeScript 가
 * `T` 를 `string` 으로 넓혀 버려서, 쓰는 쪽에서 매번 타입을 적어 줘야 합니다.
 */
export function ChoiceChips<T extends string>(props: SingleChoiceChipsProps<T>): ReactElement;
export function ChoiceChips<T extends string>(props: MultipleChoiceChipsProps<T>): ReactElement;
export function ChoiceChips<T extends string>(props: ChoiceChipsProps<T>): ReactElement {
  const { label, options, required = false } = props;

  const selectedValues = props.multiple ? props.value : [props.value];

  const handlePress = (optionValue: T) => {
    if (!props.multiple) {
      props.onChange(optionValue);
      return;
    }

    // 이미 켜져 있으면 끕니다. 마지막 하나까지 끌 수 있고, 필수 여부는 화면이 판단합니다.
    const next = props.value.includes(optionValue)
      ? props.value.filter((item) => item !== optionValue)
      : [...props.value, optionValue];

    props.onChange(next);
  };

  return (
    <View style={styles.field}>
      <FieldLabel label={label} required={required} />

      {/*
        여러 개를 고르는 묶음에는 역할을 주지 않습니다. React Native 의
        `accessibilityRole` 에 체크박스 묶음을 뜻하는 값(`group`)이 없어,
        `radiogroup` 이나 `list` 를 빌려 쓰면 오히려 잘못된 안내가 나갑니다.
      */}
      <View
        accessibilityRole={props.multiple ? undefined : 'radiogroup'}
        accessibilityLabel={props.multiple ? undefined : label}
        style={styles.chips}
      >
        {options.map((option) => {
          const isSelected = selectedValues.includes(option.value);

          return (
            <Pressable
              key={option.value}
              accessibilityRole={props.multiple ? 'checkbox' : 'radio'}
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
