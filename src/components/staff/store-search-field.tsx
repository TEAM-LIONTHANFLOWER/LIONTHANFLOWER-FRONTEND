import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { OutlinedTextField } from '@components/common/outlined-text-field';
import { FixedColors, Spacing } from '@constants/theme';
import { useDebouncedValue } from '@hooks/use-debounced-value';
import { useStoreSearch } from '@hooks/use-stores';
import searchIcon from '@assets/images/login/search.svg';
import type { StoreSummary } from '@/types/store';

/** 글자를 치다 멈춘 뒤 검색을 보내기까지 기다리는 시간. */
const SEARCH_DEBOUNCE_MS = 300;

/** 직원 화면은 번역 대상이 아니라 문구를 한국어로 직접 적습니다. */
const SEARCH_FAILED = '매장을 불러오지 못했습니다.';
const NO_RESULT = '검색 결과가 없습니다.';

interface StoreSearchFieldProps {
  label: string;
  /** 지금 고른 매장. 아직 고르지 않았으면 `null` 입니다. */
  value: StoreSummary | null;
  onChange: (store: StoreSummary | null) => void;
  /** 라벨에 빨간 별표를 붙입니다. */
  required?: boolean;
}

/**
 * 이름이나 코드로 매장을 찾아 하나 고르는 필드 — `/staff/login` 의 `Working At`.
 *
 * 서버가 근무 매장을 UUID 로만 받기 때문에, 직원이 적은 이름을 그대로 보낼 수 없습니다.
 * 그래서 적은 글자로 `GET /api/stores` 를 검색해 받은 매장 중 하나를 고르게 하고,
 * 화면 밖으로는 고른 매장(`storeId` 포함)을 통째로 넘깁니다.
 *
 * 목록은 칸을 누르거나 글자를 칠 때 펼쳐지고, 하나를 고르면 접힙니다.
 * 아무것도 치지 않은 상태에서는 서버가 전체 매장을 돌려주므로 그대로 보여 줍니다.
 */
export function StoreSearchField({
  label,
  value,
  onChange,
  required = false,
}: StoreSearchFieldProps) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  // 글자를 칠 때마다 요청이 나가지 않도록 잠잠해질 때까지 기다립니다.
  const debouncedQuery = useDebouncedValue(query, SEARCH_DEBOUNCE_MS);
  const { data: stores, isPending, isError } = useStoreSearch(debouncedQuery);

  const handleChangeText = (text: string) => {
    setQuery(text);
    setIsOpen(true);
    // 고른 뒤에 다시 고쳐 쓰기 시작하면 방금 고른 매장은 무효입니다.
    if (value !== null) {
      onChange(null);
    }
  };

  const handleSelect = (store: StoreSummary) => {
    onChange(store);
    setQuery(store.name);
    setIsOpen(false);
  };

  return (
    <View style={styles.field}>
      <OutlinedTextField
        label={label}
        required={required}
        value={query}
        onChangeText={handleChangeText}
        onFocus={() => setIsOpen(true)}
        placeholder="Search your store."
        icon={searchIcon}
      />

      {isOpen ? (
        <View style={styles.results}>
          {isPending ? (
            <View style={styles.notice}>
              <ActivityIndicator color={FixedColors.onDark} />
            </View>
          ) : null}

          {isError ? (
            <View style={styles.notice}>
              <Text style={styles.noticeText} accessibilityRole="alert">
                {SEARCH_FAILED}
              </Text>
            </View>
          ) : null}

          {!isPending && !isError && (stores ?? []).length === 0 ? (
            <View style={styles.notice}>
              <Text style={styles.noticeText}>{NO_RESULT}</Text>
            </View>
          ) : null}

          {(stores ?? []).map((store) => (
            <Pressable
              key={store.storeId}
              accessibilityRole="button"
              accessibilityLabel={`${store.name} ${store.code}`}
              accessibilityState={{ selected: store.storeId === value?.storeId }}
              onPress={() => handleSelect(store)}
              style={styles.result}
            >
              <Text style={styles.name}>{store.name}</Text>
              {/* 이름이 비슷한 매장을 가려낼 수 있도록 코드와 국가를 함께 적습니다. */}
              <Text style={styles.code}>{`${store.code} · ${store.countryCode}`}</Text>
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
  },
  // 입력 칸 바로 아래에 붙도록 위 테두리를 지우고 이어 붙입니다.
  // (`outlined-select-field` 의 펼친 목록과 같은 모양입니다.)
  results: {
    borderWidth: 1,
    borderTopWidth: 0,
    borderColor: FixedColors.onDark,
    backgroundColor: FixedColors.splashBackground,
  },
  result: {
    minHeight: 44,
    justifyContent: 'center',
    gap: Spacing.one,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  name: {
    fontSize: 14,
    color: FixedColors.onDark,
  },
  code: {
    fontSize: 11,
    color: FixedColors.placeholderOnDark,
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
