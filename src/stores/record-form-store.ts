import { create } from 'zustand';

import type { RecordFlow, RecordFormValues, RecordProduct } from '@/types/record-form';

/**
 * 직원이 작성 중인 기록의 값.
 *
 * 완료 화면에서 `수정` 을 누르면 쓰던 값 그대로 첫 단계로 돌아가야 해서, 화면이 아니라
 * 여기에 둡니다. 화면 상태(`useState`)로 두면 완료 화면으로 넘어가는 순간 사라집니다.
 *
 * 서버가 모르는 값이라 Zustand 가 맞습니다. 전송 API 가 붙어도 이 스토어는 그대로 두고,
 * 전송 성공 뒤 `reset(flow)` 을 부르는 자리만 뮤테이션의 `onSuccess` 로 옮깁니다.
 * 영구 저장소를 아직 도입하지 않아 앱을 껐다 켜면 작성 중이던 내용은 사라집니다.
 */

const EMPTY_VALUES: RecordFormValues = { texts: {}, choices: {}, products: {} };

/**
 * 제품 줄이 아직 하나도 없을 때 화면이 대신 보여 주는 빈 줄.
 *
 * 아래 두 기본값은 반드시 모듈 상수여야 합니다. 셀렉터가 부를 때마다 새 배열을 만들면
 * `useSyncExternalStore` 가 매번 다른 값을 받았다고 보고 렌더를 멈추지 않습니다.
 */
const BLANK_PRODUCT: RecordProduct = { id: 'product-1', name: '', options: [], reactions: [] };
const BLANK_PRODUCTS: readonly RecordProduct[] = [BLANK_PRODUCT];
const NO_CHOICES: readonly string[] = [];

interface RecordFormState {
  values: Record<RecordFlow, RecordFormValues>;
  setText: (flow: RecordFlow, sectionId: string, value: string) => void;
  /** 고른 보기를 통째로 갈아 끼웁니다. 하나만 고르는 묶음도 한 칸짜리 배열로 넘깁니다. */
  setChoices: (flow: RecordFlow, sectionId: string, values: readonly string[]) => void;
  /** 제품 줄을 하나 더 답니다. */
  addProduct: (flow: RecordFlow, sectionId: string) => void;
  setProductName: (flow: RecordFlow, sectionId: string, productId: string, name: string) => void;
  setProductReactions: (
    flow: RecordFlow,
    sectionId: string,
    productId: string,
    reactions: readonly string[]
  ) => void;
  /** 전송을 마쳤거나 작성을 접었을 때. 그 흐름의 값을 모두 비웁니다. */
  reset: (flow: RecordFlow) => void;
}

/** 한 흐름의 값만 바꾸고 나머지 흐름은 그대로 둡니다. */
function updateFlow(
  state: RecordFormState,
  flow: RecordFlow,
  change: (values: RecordFormValues) => RecordFormValues
): Pick<RecordFormState, 'values'> {
  return { values: { ...state.values, [flow]: change(state.values[flow]) } };
}

/** 제품 목록을 한 줄씩 훑어 고친 것으로 바꿉니다. */
function updateProduct(
  values: RecordFormValues,
  sectionId: string,
  productId: string,
  change: (product: RecordProduct) => RecordProduct
): RecordFormValues {
  const products = readProducts(values, sectionId).map((product) =>
    product.id === productId ? change(product) : product
  );

  return { ...values, products: { ...values.products, [sectionId]: products } };
}

/**
 * 담긴 제품 목록. 아직 하나도 없으면 빈 줄 하나를 돌려줍니다.
 * 화면과 스토어가 같은 첫 줄을 보도록 두 곳에서 함께 씁니다.
 */
export function readProducts(
  values: RecordFormValues,
  sectionId: string
): readonly RecordProduct[] {
  const products = values.products[sectionId];

  return products === undefined || products.length === 0 ? BLANK_PRODUCTS : products;
}

/** 묶음에서 고른 보기. 아직 고른 것이 없으면 빈 목록입니다. */
export function readChoices(values: RecordFormValues, sectionId: string): readonly string[] {
  return values.choices[sectionId] ?? NO_CHOICES;
}

export const useRecordFormStore = create<RecordFormState>((set) => ({
  values: { arc: EMPTY_VALUES, memory: EMPTY_VALUES },

  setText: (flow, sectionId, value) =>
    set((state) =>
      updateFlow(state, flow, (values) => ({
        ...values,
        texts: { ...values.texts, [sectionId]: value },
      }))
    ),

  setChoices: (flow, sectionId, choices) =>
    set((state) =>
      updateFlow(state, flow, (values) => ({
        ...values,
        choices: { ...values.choices, [sectionId]: choices },
      }))
    ),

  addProduct: (flow, sectionId) =>
    set((state) =>
      updateFlow(state, flow, (values) => {
        const products = readProducts(values, sectionId);
        // 번호는 지금까지 담긴 줄 수로 매깁니다. 중간 줄을 지우는 기능이 아직 없어
        // 이것만으로 열쇠가 겹치지 않습니다.
        const next: RecordProduct = {
          id: `product-${products.length + 1}`,
          name: '',
          options: [],
          reactions: [],
        };

        return { ...values, products: { ...values.products, [sectionId]: [...products, next] } };
      })
    ),

  setProductName: (flow, sectionId, productId, name) =>
    set((state) =>
      updateFlow(state, flow, (values) =>
        updateProduct(values, sectionId, productId, (product) => ({ ...product, name }))
      )
    ),

  setProductReactions: (flow, sectionId, productId, reactions) =>
    set((state) =>
      updateFlow(state, flow, (values) =>
        updateProduct(values, sectionId, productId, (product) => ({ ...product, reactions }))
      )
    ),

  reset: (flow) => set((state) => updateFlow(state, flow, () => EMPTY_VALUES)),
}));
