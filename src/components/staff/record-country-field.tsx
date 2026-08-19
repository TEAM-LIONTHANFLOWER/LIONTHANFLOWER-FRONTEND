import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';

import { FieldLabel } from '@components/common/field-label';
import { FixedColors, Spacing } from '@constants/theme';
import { useStoreSearch } from '@hooks/use-stores';
import chevronDown from '@assets/images/login/chevron-down.svg';

/** 필드 높이가 42 라 최소 터치 영역 44 를 채우려면 위아래로 1 씩 더 필요합니다. */
const HIT_SLOP = { top: 1, bottom: 1 } as const;

const VALUE_FONT_SIZE = 14;

/** 직원 화면은 번역 대상이 아니라 문구를 한국어로 직접 적습니다. */
const LOAD_FAILED = '국가 목록을 불러오지 못했습니다.';
const EMPTY = '고를 수 있는 국가가 없습니다.';

interface RecordCountryFieldProps {
  label: string;
  /** 지금 고른 국가 코드(`KR`). 아직 고르지 않았으면 빈 문자열입니다. */
  value: string;
  onChange: (countryCode: string) => void;
  placeholder: string;
  /** 라벨에 빨간 별표를 붙입니다. */
  required?: boolean;
}

/**
 * 구매 국가를 고르는 필드.
 *
 * 서버에 국가 목록 API 가 없고 `purchaseCountry` 는 아무 문자열이나 받습니다 —
 * `KR` `Korea` `대한민국` 이 다 통과합니다. 그래서 손으로 적게 두면 같은 나라가 여러
 * 표기로 쌓입니다. 대신 **매장 목록에 실제로 있는 국가만** 고르게 합니다
 * (`StoreSummary.countryCode`). 매장이 없는 나라에서 산 물건일 수는 없으니 이 목록이
 * 곧 고를 수 있는 전부이고, 표기도 `KR` 하나로 모입니다.
 *
 * 매장을 먼저 고르면 이 칸은 그 매장의 국가로 저절로 채워집니다.
 */
export function RecordCountryField({
  label,
  value,
  onChange,
  placeholder,
  required = false,
}: RecordCountryFieldProps) {
  const [isOpen, setIsOpen] = useState(false);
  // 빈 검색어면 서버가 전체 매장을 돌려줍니다. 매장 칸과 같은 요청이라 캐시를 함께 씁니다.
  const { data: stores, isPending, isError } = useStoreSearch('');

  const countries = [...new Set((stores ?? []).map((store) => store.countryCode))];

  const handleSelect = (countryCode: string) => {
    onChange(countryCode);
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
        onPress={() => setIsOpen((previous) => !previous)}
        style={styles.box}
      >
        <Text style={value.length === 0 ? styles.placeholder : styles.value}>
          {value.length === 0 ? placeholder : value}
        </Text>
        <Image
          source={chevronDown}
          style={[styles.chevron, isOpen && styles.chevronOpen]}
          contentFit="contain"
          accessible={false}
        />
      </Pressable>

      {isOpen ? (
        // 닫힌 필드 바로 아래에 붙도록 위 테두리를 지우고 이어 붙입니다.
        // (`outlined-select-field` 의 펼친 목록과 같은 모양입니다.)
        <View style={styles.options}>
          {isPending ? (
            <View style={styles.notice}>
              <ActivityIndicator color={FixedColors.onDark} />
            </View>
          ) : null}

          {isError ? (
            <View style={styles.notice}>
              <Text style={styles.noticeText} accessibilityRole="alert">
                {LOAD_FAILED}
              </Text>
            </View>
          ) : null}

          {!isPending && !isError && countries.length === 0 ? (
            <View style={styles.notice}>
              <Text style={styles.noticeText}>{EMPTY}</Text>
            </View>
          ) : null}

          {countries.map((countryCode) => (
            <Pressable
              key={countryCode}
              accessibilityRole="button"
              accessibilityLabel={countryCode}
              accessibilityState={{ selected: countryCode === value }}
              onPress={() => handleSelect(countryCode)}
              style={styles.option}
            >
              <Text style={styles.value}>{countryCode}</Text>
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
  chevron: {
    width: 12,
    height: 8,
  },
  chevronOpen: {
    transform: [{ rotate: '180deg' }],
  },
  options: {
    marginTop: -Spacing.two,
    borderWidth: 1,
    borderTopWidth: 0,
    borderColor: FixedColors.onDark,
    backgroundColor: FixedColors.splashBackground,
  },
  option: {
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  notice: {
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  noticeText: {
    fontSize: 12,
    color: FixedColors.placeholderOnDark,
  },
});
