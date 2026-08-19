import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { ChoiceChips } from '@components/common/choice-chips';
import { DateField } from '@components/common/date-field';
import { OptionList } from '@components/common/option-list';
import { OutlinedTextField } from '@components/common/outlined-text-field';
import { RecordCountryField } from '@components/staff/record-country-field';
import { RecordProductField } from '@components/staff/record-product-field';
import { StoreSearchField } from '@components/staff/store-search-field';
import { toOtherFieldId } from '@constants/record-form';
import { Spacing } from '@constants/theme';
import { readChoices, readProducts, useRecordFormStore } from '@stores/record-form-store';
import calendarIcon from '@assets/images/staff/calendar.svg';
import searchIcon from '@assets/images/login/search.svg';
import type {
  RecordChipsSection,
  RecordFlow,
  RecordOptionsSection,
  RecordSection,
  RecordStoreSection,
  RecordTextSection,
} from '@/types/record-form';
import type { StoreSummary } from '@/types/store';

/** `기타` 입력의 안내 문구를 묶음이 따로 정하지 않았을 때. */
const DEFAULT_OTHER_PLACEHOLDER = '직접 입력해주세요';

/** 한 줄 입력 오른쪽에 붙는 장식 아이콘. */
const FIELD_ICONS = {
  calendar: calendarIcon,
  search: searchIcon,
} as const;

interface RecordSectionFieldProps {
  flow: RecordFlow;
  section: RecordSection;
}

function readIcon(section: RecordTextSection) {
  return section.icon === undefined ? undefined : FIELD_ICONS[section.icon];
}

/**
 * 기록 작성 폼의 입력 묶음 하나를 종류에 맞는 컴포넌트로 그립니다.
 *
 * 값은 화면을 거치지 않고 이 컴포넌트가 스토어에서 바로 읽고 씁니다.
 * 묶음마다 자기 값만 구독하기 때문에, 한 곳을 고쳐도 나머지 묶음은 다시 그리지 않습니다.
 */
export function RecordSectionField({ flow, section }: RecordSectionFieldProps) {
  const otherId = toOtherFieldId(section.id);
  // 고른 매장은 서버로 이름만 나가지만, 목록에서 어느 줄을 골랐는지 표시하려면 통째로 들고 있어야 합니다.
  const [selectedStore, setSelectedStore] = useState<StoreSummary | null>(null);

  const text = useRecordFormStore((state) => state.values[flow].texts[section.id] ?? '');
  const otherText = useRecordFormStore((state) => state.values[flow].texts[otherId] ?? '');
  const choices = useRecordFormStore((state) => readChoices(state.values[flow], section.id));
  const products = useRecordFormStore((state) => readProducts(state.values[flow], section.id));

  const setText = useRecordFormStore((state) => state.setText);
  const setChoices = useRecordFormStore((state) => state.setChoices);
  const addProduct = useRecordFormStore((state) => state.addProduct);
  const setProductName = useRecordFormStore((state) => state.setProductName);
  const setProductReactions = useRecordFormStore((state) => state.setProductReactions);

  /**
   * `기타` 를 고른 뒤 무엇인지 적는 줄.
   *
   * 서버가 묶음마다 짝이 되는 필드를 따로 받습니다(`preferredColorOther` 등).
   * 고르지 않았으면 그리지 않습니다 — 적어 둔 값은 스토어에 남아 있다가 다시 고르면 돌아옵니다.
   */
  const renderOtherInput = (group: RecordChipsSection | RecordOptionsSection) => {
    if (group.otherValue === undefined || !choices.includes(group.otherValue)) {
      return null;
    }

    return (
      <OutlinedTextField
        label={`${group.label} 기타`}
        hideLabel
        value={otherText}
        placeholder={group.otherPlaceholder ?? DEFAULT_OTHER_PLACEHOLDER}
        onChangeText={(next) => setText(flow, otherId, next)}
      />
    );
  };

  /**
   * 매장을 고르면 이름을 이 칸에, 국가 코드를 짝이 되는 칸에 함께 넣습니다.
   *
   * 서버는 `purchaseStore` 를 문자열로 받아서 이름을 그대로 보냅니다. 국가까지 같이 채우는
   * 것은, 매장이 곧 그 나라에 있는 것이라 직원이 두 번 고를 이유가 없어서입니다.
   */
  const handleStoreChange = (group: RecordStoreSection, store: StoreSummary | null) => {
    setSelectedStore(store);
    setText(flow, group.id, store === null ? '' : store.name);

    if (store !== null && group.countryFieldId !== undefined) {
      setText(flow, group.countryFieldId, store.countryCode);
    }
  };

  switch (section.kind) {
    case 'text':
      return (
        <OutlinedTextField
          label={section.label}
          required={section.required}
          value={text}
          placeholder={section.placeholder}
          icon={readIcon(section)}
          onChangeText={(next) => setText(flow, section.id, next)}
        />
      );

    case 'date':
      return (
        <DateField
          label={section.label}
          required={section.required}
          value={text}
          placeholder={section.placeholder}
          onChange={(next) => setText(flow, section.id, next)}
        />
      );

    case 'country':
      return (
        <RecordCountryField
          label={section.label}
          required={section.required}
          value={text}
          placeholder={section.placeholder}
          onChange={(next) => setText(flow, section.id, next)}
        />
      );

    case 'store':
      return (
        <StoreSearchField
          label={section.label}
          required={section.required}
          value={selectedStore}
          placeholder={section.placeholder}
          initialQuery={text}
          onChange={(store) => handleStoreChange(section, store)}
        />
      );

    case 'note':
      return (
        <OutlinedTextField
          label={section.label}
          description={section.description}
          value={text}
          placeholder={section.placeholder}
          maxLength={section.maxLength}
          multiline
          onChangeText={(next) => setText(flow, section.id, next)}
        />
      );

    case 'chips':
      // 하나만 고르는 칩은 값 하나를 주고받습니다. 스토어는 두 경우를 배열로 통일해 담습니다.
      return (
        <View style={styles.group}>
          {section.multiple === true ? (
            <ChoiceChips
              multiple
              label={section.label}
              options={section.options}
              value={choices}
              onChange={(next) => setChoices(flow, section.id, next)}
            />
          ) : (
            <ChoiceChips
              label={section.label}
              options={section.options}
              value={choices[0] ?? ''}
              onChange={(next) => setChoices(flow, section.id, [next])}
            />
          )}

          {renderOtherInput(section)}
        </View>
      );

    case 'options':
      // 줄 목록은 늘 하나만 고릅니다. 자세한 이유는 `RecordOptionsSection` 주석 참고.
      return (
        <View style={styles.group}>
          <OptionList
            label={section.label}
            options={section.options}
            value={choices}
            onChange={(next) => setChoices(flow, section.id, next)}
          />

          {renderOtherInput(section)}
        </View>
      );

    case 'products':
      return (
        <RecordProductField
          section={section}
          products={products}
          onChangeName={(productId, name) => setProductName(flow, section.id, productId, name)}
          onChangeReactions={(productId, reactions) =>
            setProductReactions(flow, section.id, productId, reactions)
          }
          onAdd={() => addProduct(flow, section.id)}
        />
      );
  }
}

const styles = StyleSheet.create({
  // 보기 목록과 그 아래 열리는 `기타` 입력 사이.
  group: {
    width: '100%',
    gap: Spacing.two,
  },
});
