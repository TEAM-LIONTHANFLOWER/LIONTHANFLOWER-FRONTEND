import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';

import { FieldLabel } from '@components/common/field-label';
import { FixedColors, Spacing } from '@constants/theme';
import calendarIcon from '@assets/images/staff/calendar.svg';

/** 필드 높이가 42 라 최소 터치 영역 44 를 채우려면 위아래로 1 씩 더 필요합니다. */
const HIT_SLOP = { top: 1, bottom: 1 } as const;

/** 일요일부터 시작하는 요일 머리글. */
const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'] as const;

/** 한 줄에 이레가 들어가도록 나눈 칸 너비 — 100 / 7. */
const CELL_WIDTH = '14.2857%';
/** 날짜 한 칸의 높이. 최소 터치 영역 44 를 채웁니다. */
const CELL_HEIGHT = 44;

const VALUE_FONT_SIZE = 14;
const CELL_FONT_SIZE = 13;
const WEEKDAY_FONT_SIZE = 11;

/** `2026`, `8`, `19` → `2026-08-19`. 서버가 이 모양만 받습니다. */
function toIsoDate(year: number, month: number, day: number): string {
  const paddedMonth = `${month + 1}`.padStart(2, '0');
  const paddedDay = `${day}`.padStart(2, '0');

  return `${year}-${paddedMonth}-${paddedDay}`;
}

/**
 * `2026-08-19` → 달력이 펼쳐 보일 자리.
 * 비어 있거나 읽을 수 없으면 오늘을 보여줍니다.
 *
 * `new Date('2026-08-19')` 로 읽지 않습니다 — 그렇게 하면 UTC 자정으로 잡혀서
 * UTC 서쪽 시간대에서는 하루 앞의 달이 열립니다. 글자를 직접 끊어 읽습니다.
 */
function toViewedMonth(value: string): { year: number; month: number } {
  const matched = /^(\d{4})-(\d{2})-\d{2}$/.exec(value);

  if (matched === null) {
    const today = new Date();
    return { year: today.getFullYear(), month: today.getMonth() };
  }

  return { year: Number(matched[1]), month: Number(matched[2]) - 1 };
}

/** 그 달의 날짜 칸. 1 일이 오는 요일만큼 앞을 비워 둡니다. */
function toMonthCells(year: number, month: number): readonly (number | null)[] {
  const leading = new Date(year, month, 1).getDay();
  // 다음 달 0 일은 이번 달 마지막 날입니다.
  const dayCount = new Date(year, month + 1, 0).getDate();

  const blanks: (number | null)[] = Array.from({ length: leading }, () => null);
  const days = Array.from({ length: dayCount }, (_, index) => index + 1);

  return [...blanks, ...days];
}

interface DateFieldProps {
  label: string;
  /** `YYYY-MM-DD`. 아직 고르지 않았으면 빈 문자열입니다. */
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  /** 라벨에 빨간 별표를 붙입니다. */
  required?: boolean;
}

/**
 * 달력에서 하루를 골라 넣는 필드.
 *
 * 서버가 `YYYY-MM-DD` 만 받는데 손으로 적게 두면 `200601` 처럼 보낼 수 없는 값이 그대로
 * 남습니다. 그래서 아예 타이핑을 받지 않고 고르게만 합니다 — 고른 순간 서버가 받는 모양이 됩니다.
 *
 * 네이티브 피커를 쓰지 않는 이유는 `outlined-select-field` 와 같습니다.
 * iOS / Android / 웹에서 모양이 제각각이고, 새 의존성 없이 세 곳을 같게 그려야 합니다.
 * 펼친 달력도 같은 테두리를 아래로 이어 붙인 모양입니다.
 */
export function DateField({
  label,
  value,
  onChange,
  placeholder,
  required = false,
}: DateFieldProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [viewed, setViewed] = useState(() => toViewedMonth(value));

  const cells = toMonthCells(viewed.year, viewed.month);

  const handleToggle = () => {
    // 열 때마다 고른 날이 있는 달부터 보여 줍니다.
    if (!isOpen) {
      setViewed(toViewedMonth(value));
    }

    setIsOpen((previous) => !previous);
  };

  const goToMonth = (step: number) => {
    const moved = new Date(viewed.year, viewed.month + step, 1);
    setViewed({ year: moved.getFullYear(), month: moved.getMonth() });
  };

  const handleSelect = (day: number) => {
    onChange(toIsoDate(viewed.year, viewed.month, day));
    setIsOpen(false);
  };

  return (
    <View style={styles.field}>
      <FieldLabel label={label} required={required} />

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityValue={{ text: value }}
        accessibilityState={{ expanded: isOpen }}
        hitSlop={HIT_SLOP}
        onPress={handleToggle}
        style={styles.box}
      >
        <Text style={value.length === 0 ? styles.placeholder : styles.value}>
          {value.length === 0 ? placeholder : value}
        </Text>
        <Image source={calendarIcon} style={styles.icon} contentFit="contain" accessible={false} />
      </Pressable>

      {isOpen ? (
        <View style={styles.calendar}>
          <View style={styles.header}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="이전 달"
              onPress={() => goToMonth(-1)}
              style={styles.monthStep}
            >
              <Text style={styles.monthStepLabel}>{'‹'}</Text>
            </Pressable>

            <Text style={styles.monthLabel}>{`${viewed.year}년 ${viewed.month + 1}월`}</Text>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="다음 달"
              onPress={() => goToMonth(1)}
              style={styles.monthStep}
            >
              <Text style={styles.monthStepLabel}>{'›'}</Text>
            </Pressable>
          </View>

          <View style={styles.week}>
            {WEEKDAYS.map((weekday) => (
              <Text key={weekday} style={styles.weekday}>
                {weekday}
              </Text>
            ))}
          </View>

          <View style={styles.grid}>
            {cells.map((day, index) =>
              day === null ? (
                // 1 일 앞을 비우는 칸. 누를 것이 없어 스크린 리더에서도 감춥니다.
                <View
                  key={`blank-${index}`}
                  accessibilityElementsHidden
                  importantForAccessibility="no-hide-descendants"
                  style={styles.cell}
                />
              ) : (
                <Pressable
                  key={day}
                  accessibilityRole="button"
                  accessibilityLabel={`${viewed.year}년 ${viewed.month + 1}월 ${day}일`}
                  accessibilityState={{
                    selected: toIsoDate(viewed.year, viewed.month, day) === value,
                  }}
                  onPress={() => handleSelect(day)}
                  style={styles.cell}
                >
                  <View
                    style={[
                      styles.dayMark,
                      toIsoDate(viewed.year, viewed.month, day) === value && styles.daySelected,
                    ]}
                  >
                    <Text
                      style={[
                        styles.day,
                        toIsoDate(viewed.year, viewed.month, day) === value &&
                          styles.daySelectedText,
                      ]}
                    >
                      {day}
                    </Text>
                  </View>
                </Pressable>
              )
            )}
          </View>
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
    borderColor: FixedColors.onDark,
  },
  value: {
    fontSize: VALUE_FONT_SIZE,
    color: FixedColors.onDark,
  },
  placeholder: {
    fontSize: VALUE_FONT_SIZE,
    color: FixedColors.placeholderOnDark,
  },
  icon: {
    width: 24,
    height: 24,
  },
  // 닫힌 필드 바로 아래에 붙도록 위 테두리를 지우고 이어 붙입니다.
  // (`outlined-select-field` 의 펼친 목록과 같은 모양입니다.)
  calendar: {
    marginTop: -Spacing.two,
    paddingBottom: Spacing.two,
    borderWidth: 1,
    borderTopWidth: 0,
    borderColor: FixedColors.onDark,
    backgroundColor: FixedColors.splashBackground,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.two,
  },
  monthStep: {
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthStepLabel: {
    fontSize: 20,
    color: FixedColors.onDark,
  },
  monthLabel: {
    fontSize: VALUE_FONT_SIZE,
    color: FixedColors.onDark,
  },
  week: {
    flexDirection: 'row',
  },
  weekday: {
    width: CELL_WIDTH,
    fontSize: WEEKDAY_FONT_SIZE,
    color: FixedColors.placeholderOnDark,
    textAlign: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  cell: {
    width: CELL_WIDTH,
    height: CELL_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // 고른 날만 동그란 면으로 뒤집힙니다. 칸 전체를 칠하면 격자가 답답해 보입니다.
  dayMark: {
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 15,
  },
  daySelected: {
    backgroundColor: FixedColors.selectedSurface,
  },
  day: {
    fontSize: CELL_FONT_SIZE,
    color: FixedColors.onDark,
  },
  daySelectedText: {
    color: FixedColors.onLight,
  },
});
