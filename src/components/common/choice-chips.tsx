import { Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { FieldLabel, MULTI_SELECT_HINT } from '@components/common/field-label';
import { FixedColors, Radius, Spacing } from '@constants/theme';

/** 칩 높이가 32 라 최소 터치 영역 44 를 채우려면 위아래로 6 씩 더 필요합니다. */
const HIT_SLOP = { top: 6, bottom: 6 } as const;

/** 시안(2-1-2)의 색 동그라미 지름. */
const SWATCH_SIZE = 20;

/**
 * 그러데이션 색 동그라미가 흐르는 방향.
 * 시안이 20×20 안에서 (4, 2.5) 에서 (16, 18) 로 비스듬히 흘려 둔 것을 비율로 옮긴 값입니다.
 */
const SWATCH_GRADIENT_START = { x: 0.2, y: 0.125 } as const;
const SWATCH_GRADIENT_END = { x: 0.8, y: 0.9 } as const;

/**
 * 칩 라벨 왼쪽에 놓는 색 동그라미.
 * 한 가지 색이면 문자열, 그러데이션이면 색을 흐르는 순서대로 담은 배열입니다.
 */
type ChipSwatch = string | readonly [string, string, ...string[]];

interface ChoiceChipOption<T extends string> {
  value: T;
  label: string;
  /** 색 자체가 보기인 묶음(선호 컬러)만 씁니다. 없으면 글자만 있는 칩이 됩니다. */
  swatch?: ChipSwatch;
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

interface ChipSwatchDotProps {
  swatch: ChipSwatch;
}

/** 칩 왼쪽의 색 동그라미. 흰 테두리를 둘러 흰 칩과 검은 배경 어느 쪽에서도 경계가 보입니다. */
function ChipSwatchDot({ swatch }: ChipSwatchDotProps) {
  if (typeof swatch === 'string') {
    return <View style={[styles.swatch, { backgroundColor: swatch }]} />;
  }

  return (
    <LinearGradient
      colors={swatch}
      start={SWATCH_GRADIENT_START}
      end={SWATCH_GRADIENT_END}
      style={styles.swatch}
    />
  );
}

/**
 * 알약 모양 칩 묶음. 시안의 Language 선택과 직원용 기록 작성 폼의 취향 항목이 씁니다.
 *
 * 기본은 하나만 고르고, `multiple` 을 켜면 여러 개를 고릅니다.
 * 두 경우에 값의 모양이 달라 props 를 한 쌍으로 묶어 두었습니다 —
 * 하나만 고를 때는 값 하나, 여러 개일 때는 값의 배열이 오갑니다.
 *
 * 여러 개를 고를 수 있는 묶음에는 라벨 아래에 `복수 응답 가능` 안내가 자동으로 붙습니다.
 */
export function ChoiceChips<T extends string>(props: ChoiceChipsProps<T>) {
  const { label, options, required = false } = props;
  const isMultiple = props.multiple === true;
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
      <FieldLabel
        label={label}
        required={required}
        hint={isMultiple ? MULTI_SELECT_HINT : undefined}
      />

      <View
        accessibilityRole={isMultiple ? 'list' : 'radiogroup'}
        accessibilityLabel={label}
        style={styles.chips}
      >
        {options.map((option) => {
          const isSelected = selected.includes(option.value);

          return (
            <Pressable
              key={option.value}
              accessibilityRole={isMultiple ? 'checkbox' : 'radio'}
              accessibilityLabel={option.label}
              accessibilityState={{ selected: isSelected, checked: isSelected }}
              hitSlop={HIT_SLOP}
              onPress={() => handlePress(option.value)}
              style={[
                styles.chip,
                option.swatch === undefined ? null : styles.chipWithSwatch,
                isSelected && styles.chipSelected,
              ]}
            >
              {option.swatch === undefined ? null : <ChipSwatchDot swatch={option.swatch} />}

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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.three,
    borderRadius: Radius.pill,
    borderWidth: 1,
    borderColor: FixedColors.onDark,
  },
  // 색 동그라미가 붙으면 왼쪽 여백을 좁혀 그 자리를 동그라미에게 내줍니다.
  chipWithSwatch: {
    paddingLeft: Spacing.one,
    gap: Spacing.one,
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
  swatch: {
    width: SWATCH_SIZE,
    height: SWATCH_SIZE,
    borderRadius: Radius.pill,
    borderWidth: 1,
    borderColor: FixedColors.onDark,
  },
});
