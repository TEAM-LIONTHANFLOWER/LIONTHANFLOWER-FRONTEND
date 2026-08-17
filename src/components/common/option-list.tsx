import { Pressable, StyleSheet, Text, View } from 'react-native';

import { FieldLabel } from '@components/common/field-label';
import { FixedColors, Spacing } from '@constants/theme';

/** 줄 높이가 42 라 최소 터치 영역 44 를 채우려면 위아래로 1 씩 더 필요합니다. */
const HIT_SLOP = { top: 1, bottom: 1 } as const;

/** 시안의 줄 치수. Spacing 스케일에 없는 값이라 이름을 붙여 둡니다. */
const ROW_HEIGHT = 42;
const ROW_FONT_SIZE = 14;

interface OptionListItem<T extends string> {
  value: T;
  label: string;
}

interface OptionListProps<T extends string> {
  label: string;
  options: readonly OptionListItem<T>[];
  /** 고른 보기. 하나만 고르는 목록도 한 칸짜리 배열로 넘깁니다. */
  value: readonly T[];
  onChange: (value: readonly T[]) => void;
  /** 여러 개를 고를 수 있게 합니다. 비우면 하나만 고릅니다. */
  multiple?: boolean;
  /** 라벨에 빨간 별표를 붙입니다. */
  required?: boolean;
  /**
   * 라벨을 눈에 보이게 그리지 않습니다.
   * 제품에 딸린 반응 목록처럼 바로 앞에 이미 이름이 있을 때 씁니다.
   * 스크린 리더는 라벨을 그대로 읽습니다.
   */
  hideLabel?: boolean;
}

/**
 * 화면 폭을 꽉 채우는 줄로 고르는 목록. 직원용 기록 작성 폼이 씁니다.
 *
 * 같은 역할인 `choice-chips` 와는 모양만 다릅니다 — 저쪽은 짧은 낱말을 알약으로 늘어놓고,
 * 이쪽은 문장에 가까운 보기를 한 줄에 하나씩 쌓습니다.
 *
 * 어두운 브랜드 배경 위에만 올라가므로 색이 `FixedColors` 로 고정입니다.
 * 고른 줄은 흰색 90% 면으로 뒤집히고 글자는 검정이 됩니다.
 */
export function OptionList<T extends string>({
  label,
  options,
  value,
  onChange,
  multiple = false,
  required = false,
  hideLabel = false,
}: OptionListProps<T>) {
  const handlePress = (next: T) => {
    if (!multiple) {
      onChange([next]);
      return;
    }

    onChange(value.includes(next) ? value.filter((item) => item !== next) : [...value, next]);
  };

  return (
    <View style={styles.field}>
      {hideLabel ? null : <FieldLabel label={label} required={required} />}

      <View
        accessibilityRole={multiple ? 'list' : 'radiogroup'}
        accessibilityLabel={label}
        style={styles.rows}
      >
        {options.map((option) => {
          const isSelected = value.includes(option.value);

          return (
            <Pressable
              key={option.value}
              accessibilityRole={multiple ? 'checkbox' : 'radio'}
              accessibilityLabel={option.label}
              accessibilityState={{ selected: isSelected, checked: isSelected }}
              hitSlop={HIT_SLOP}
              onPress={() => handlePress(option.value)}
              style={[styles.row, isSelected && styles.rowSelected]}
            >
              <Text style={[styles.rowLabel, isSelected && styles.rowLabelSelected]}>
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
  rows: {
    width: '100%',
    gap: Spacing.two,
  },
  row: {
    height: ROW_HEIGHT,
    justifyContent: 'center',
    paddingHorizontal: Spacing.three,
    backgroundColor: FixedColors.optionSurface,
  },
  // 고르면 명암이 뒤집힙니다.
  rowSelected: {
    backgroundColor: FixedColors.selectedSurface,
  },
  rowLabel: {
    fontSize: ROW_FONT_SIZE,
    color: FixedColors.onDark,
  },
  rowLabelSelected: {
    color: FixedColors.onLight,
  },
});
