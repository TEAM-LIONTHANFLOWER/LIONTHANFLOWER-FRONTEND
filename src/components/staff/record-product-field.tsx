import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';

import { OptionList } from '@components/common/option-list';
import { OutlinedTextField } from '@components/common/outlined-text-field';
import { FixedColors, Spacing, Typography } from '@constants/theme';
import { filterProductVariants, useStaffProducts } from '@hooks/use-staff-products';
import plusIcon from '@assets/images/staff/plus.svg';
import searchIcon from '@assets/images/login/search.svg';
import type { ProductVariantEntry } from '@hooks/use-staff-products';
import type {
  RecordProduct,
  RecordProductSelection,
  RecordProductsSection,
} from '@/types/record-form';

/** `+` 아이콘이 24 라 최소 터치 영역 44 를 채우려면 사방으로 10 씩 더 필요합니다. */
const HIT_SLOP = { top: 10, bottom: 10, left: 10, right: 10 } as const;

const ICON_SIZE = 24;
/** 제품 줄과 줄 사이. 묶음 사이 간격과 같게 벌립니다. */
const ENTRY_GAP = Spacing.four;

/** 직원 화면은 번역 대상이 아니라 문구를 한국어로 직접 적습니다. */
const LOAD_FAILED = '제품을 불러오지 못했습니다.';
const NO_RESULT = '검색 결과가 없습니다.';

interface RecordProductFieldProps {
  section: RecordProductsSection;
  products: readonly RecordProduct[];
  onChangeName: (productId: string, name: string) => void;
  onSelect: (productId: string, selection: RecordProductSelection) => void;
  onChangeReactions: (productId: string, reactions: readonly string[]) => void;
  onAdd: () => void;
}

/** 여러 줄일 때만 `관심 제품 01` 처럼 번호를 붙입니다. */
function describeEntry(section: RecordProductsSection, index: number): string {
  if (section.numbered !== true) {
    return section.label;
  }

  return `${section.label} ${String(index + 1).padStart(2, '0')}`;
}

/** 고른 제품 아래에 적히는 옵션 줄. 색도 사이즈도 없는 제품이면 줄을 만들지 않습니다. */
function toOptionLines(entry: ProductVariantEntry): readonly string[] {
  return entry.spec.length === 0 ? [] : [`Option : ${entry.spec}`];
}

interface ProductEntryFieldProps {
  label: string;
  placeholder: string;
  required?: boolean;
  product: RecordProduct;
  entries: readonly ProductVariantEntry[];
  isPending: boolean;
  isError: boolean;
  onChangeName: (name: string) => void;
  onSelect: (selection: RecordProductSelection) => void;
}

/**
 * 제품 한 줄. 적은 글자로 매장 제품을 좁혀 그중 하나를 고릅니다.
 *
 * 서버는 제품을 `productVariantId` 로만 받기 때문에 직원이 적은 이름을 그대로 보낼 수
 * 없습니다. 그래서 목록에서 고르게 하고, 고른 줄의 식별자를 스토어에 담습니다.
 * 고르는 단위는 제품이 아니라 색·사이즈까지 정해진 조합이라 목록 한 줄이 곧 그 조합입니다.
 */
function ProductEntryField({
  label,
  placeholder,
  required,
  product,
  entries,
  isPending,
  isError,
  onChangeName,
  onSelect,
}: ProductEntryFieldProps) {
  // 화면을 나갔다 돌아와도(`수정`) 적어 둔 이름이 남도록 스토어 값에서 시작합니다.
  const [query, setQuery] = useState(product.name);
  const [isOpen, setIsOpen] = useState(false);

  const matched = filterProductVariants(entries, query);

  const handleChangeText = (text: string) => {
    setQuery(text);
    setIsOpen(true);
    // 고른 뒤에 다시 고쳐 쓰기 시작하면 방금 고른 제품은 무효입니다.
    onChangeName(text);
  };

  const handleSelect = (entry: ProductVariantEntry) => {
    setQuery(entry.productName);
    setIsOpen(false);
    onSelect({
      name: entry.productName,
      variantId: entry.variantId,
      options: toOptionLines(entry),
    });
  };

  return (
    <View style={styles.entry}>
      <OutlinedTextField
        label={label}
        required={required}
        value={query}
        placeholder={placeholder}
        icon={searchIcon}
        onFocus={() => setIsOpen(true)}
        onChangeText={handleChangeText}
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
                {LOAD_FAILED}
              </Text>
            </View>
          ) : null}

          {!isPending && !isError && matched.length === 0 ? (
            <View style={styles.notice}>
              <Text style={styles.noticeText}>{NO_RESULT}</Text>
            </View>
          ) : null}

          {matched.map((entry) => (
            <Pressable
              key={entry.variantId}
              accessibilityRole="button"
              accessibilityLabel={`${entry.productName} ${entry.spec}`}
              accessibilityState={{ selected: entry.variantId === product.variantId }}
              onPress={() => handleSelect(entry)}
              style={styles.result}
            >
              <Text style={styles.name}>{entry.productName}</Text>
              {/* 같은 제품의 다른 색·사이즈를 가려낼 수 있도록 옵션을 함께 적습니다. */}
              {entry.spec.length === 0 ? null : <Text style={styles.spec}>{entry.spec}</Text>}
            </Pressable>
          ))}
        </View>
      ) : null}

      {product.options.map((option) => (
        // 옵션 줄은 고른 제품에서 온 값이라 다른 줄과 내용이 겹칠 수 있습니다.
        // 순서가 바뀌지 않는 목록이라 자리를 키로 씁니다.
        <Text key={option} style={styles.option}>
          {option}
        </Text>
      ))}
    </View>
  );
}

/**
 * 제품을 검색해 여러 개 담는 입력 묶음. 직원용 기록 작성 폼의 `구매 제품` 과 `관심 제품` 입니다.
 *
 * 제품 목록은 묶음마다 한 번만 받아 줄마다 나눠 씁니다 —
 * `GET /api/staff/products` 는 검색 파라미터가 없어 목록 전체가 한 번에 오고,
 * 글자를 좁히는 일은 받아 둔 목록에서 합니다.
 *
 * 제품마다 고를 반응이 있으면 이름 아래에 줄 목록으로 함께 답니다.
 * 아래 `+` 를 누르면 같은 모양의 줄이 하나 더 생깁니다.
 */
export function RecordProductField({
  section,
  products,
  onChangeName,
  onSelect,
  onChangeReactions,
  onAdd,
}: RecordProductFieldProps) {
  const { data: entries, isPending, isError } = useStaffProducts();

  return (
    <View style={styles.field}>
      {products.map((product, index) => {
        const entryLabel = describeEntry(section, index);

        return (
          <View key={product.id} style={styles.entry}>
            <ProductEntryField
              label={entryLabel}
              placeholder={section.placeholder}
              required={section.required}
              product={product}
              entries={entries ?? []}
              isPending={isPending}
              isError={isError}
              onChangeName={(name) => onChangeName(product.id, name)}
              onSelect={(selection) => onSelect(product.id, selection)}
            />

            {section.reactions === undefined ? null : (
              <OptionList
                label={`${entryLabel} 고객 반응`}
                hideLabel
                multiple
                options={section.reactions}
                value={product.reactions}
                onChange={(reactions) => onChangeReactions(product.id, reactions)}
              />
            )}
          </View>
        );
      })}

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${section.label} 추가`}
        hitSlop={HIT_SLOP}
        onPress={onAdd}
        style={styles.addButton}
      >
        <Image source={plusIcon} style={styles.addIcon} contentFit="contain" accessible={false} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    width: '100%',
    gap: ENTRY_GAP,
  },
  entry: {
    width: '100%',
    gap: Spacing.two,
  },
  // 입력 칸 바로 아래에 붙도록 위 테두리를 지우고 이어 붙입니다.
  // (`store-search-field` 의 펼친 목록과 같은 모양입니다.)
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
  spec: {
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
  option: {
    ...Typography.bodyKo13,
    color: FixedColors.onDark,
  },
  addButton: {
    alignSelf: 'center',
  },
  addIcon: {
    width: ICON_SIZE,
    height: ICON_SIZE,
  },
});
