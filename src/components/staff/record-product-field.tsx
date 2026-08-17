import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';

import { OptionList } from '@components/common/option-list';
import { OutlinedTextField } from '@components/common/outlined-text-field';
import { FixedColors, Spacing, Typography } from '@constants/theme';
import plusIcon from '@assets/images/staff/plus.svg';
import searchIcon from '@assets/images/login/search.svg';
import type { RecordProduct, RecordProductsSection } from '@/types/record-form';

/** `+` 아이콘이 24 라 최소 터치 영역 44 를 채우려면 사방으로 10 씩 더 필요합니다. */
const HIT_SLOP = { top: 10, bottom: 10, left: 10, right: 10 } as const;

const ICON_SIZE = 24;
/** 제품 줄과 줄 사이. 묶음 사이 간격과 같게 벌립니다. */
const ENTRY_GAP = Spacing.four;

interface RecordProductFieldProps {
  section: RecordProductsSection;
  products: readonly RecordProduct[];
  onChangeName: (productId: string, name: string) => void;
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

/**
 * 제품을 검색해 여러 개 담는 입력 묶음. 직원용 기록 작성 폼의 `구매 제품` 과 `관심 제품` 입니다.
 *
 * 제품마다 고를 반응이 있으면 이름 아래에 줄 목록으로 함께 답니다.
 * 아래 `+` 를 누르면 같은 모양의 줄이 하나 더 생깁니다.
 *
 * `Option : Black` 줄은 고른 제품에 딸린 옵션입니다. 제품 검색 API 가 아직 없어
 * 지금은 채워지지 않고, 검색이 붙으면 고른 제품의 옵션이 여기 들어옵니다.
 */
export function RecordProductField({
  section,
  products,
  onChangeName,
  onChangeReactions,
  onAdd,
}: RecordProductFieldProps) {
  return (
    <View style={styles.field}>
      {products.map((product, index) => {
        const entryLabel = describeEntry(section, index);

        return (
          <View key={product.id} style={styles.entry}>
            <OutlinedTextField
              label={entryLabel}
              required={section.required}
              value={product.name}
              placeholder={section.placeholder}
              icon={searchIcon}
              onChangeText={(name) => onChangeName(product.id, name)}
            />

            {product.options.map((option) => (
              // 옵션 줄은 서버에서 오는 값이라 내용이 겹칠 수 있습니다.
              // 순서가 바뀌지 않는 목록이라 자리를 키로 씁니다.
              <Text key={option} style={styles.option}>
                {option}
              </Text>
            ))}

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
