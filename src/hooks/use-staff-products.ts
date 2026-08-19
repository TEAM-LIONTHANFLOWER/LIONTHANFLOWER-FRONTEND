import { useQuery } from '@tanstack/react-query';

import { api } from '@services/api';
import type { StaffProduct, StaffProductVariant } from '@/types/staff';

export const staffProductKeys = {
  all: ['staff-products'] as const,
  list: () => [...staffProductKeys.all, 'list'] as const,
};

/**
 * 폼에서 고르는 단위 한 줄 — 제품 하나가 아니라 그 제품의 색·사이즈 조합 하나입니다.
 *
 * 서버는 제품 안에 variant 를 품은 모양으로 주는데, 직원이 고르는 것은 늘 variant 입니다.
 * 그래서 받자마자 평평하게 펴서 목록 한 줄과 고른 값이 일대일이 되게 합니다.
 */
export interface ProductVariantEntry {
  /** 요청에 실리는 값. `purchasedProductVariantIds` 가 이걸 받습니다. */
  variantId: string;
  productName: string;
  /** `BLACK · M` 처럼 색과 사이즈 한 줄. 둘 다 없으면 빈 문자열입니다. */
  spec: string;
  /** 이름이 비슷한 제품을 가려내는 데 쓰는 제품·variant 코드. */
  code: string;
}

/** 제품 하나 → 그 제품의 variant 줄들. */
function toEntries(product: StaffProduct): ProductVariantEntry[] {
  return (product.variants ?? []).map((variant: StaffProductVariant) => ({
    variantId: variant.productVariantId,
    productName: product.name,
    spec: [variant.color, variant.option].filter((value) => value !== undefined).join(' · '),
    code: variant.externalVariantCode ?? product.externalProductCode ?? '',
  }));
}

/**
 * 매장의 제품 목록. 고를 수 있는 variant 를 한 줄씩 편 채로 돌려줍니다.
 *
 * `GET /api/staff/products` 에는 **검색 파라미터가 없습니다** — `GET /api/stores` 와 달리
 * 목록 전체가 한 번에 옵니다. 그래서 서버를 다시 부르며 좁히지 않고, 받아 둔 목록을
 * `filterProductVariants()` 로 앱에서 거릅니다. 응답은 `staleTime` 동안 캐시에 남아
 * 폼의 두 제품 칸(`구매 제품` `관심 제품`)이 한 벌을 나눠 씁니다.
 */
export function useStaffProducts() {
  return useQuery({
    queryKey: staffProductKeys.list(),
    queryFn: () => api.get<StaffProduct[]>('/api/staff/products'),
    select: (products): readonly ProductVariantEntry[] =>
      (products ?? []).flatMap((product) => toEntries(product)),
  });
}

/**
 * 적은 글자로 제품 줄을 거릅니다. 제품 이름·옵션·코드 중 어디에 걸려도 남깁니다.
 * 아무것도 적지 않았으면 전체를 그대로 돌려줍니다.
 */
export function filterProductVariants(
  entries: readonly ProductVariantEntry[],
  query: string
): readonly ProductVariantEntry[] {
  const keyword = query.trim().toLowerCase();

  if (keyword.length === 0) {
    return entries;
  }

  return entries.filter((entry) =>
    `${entry.productName} ${entry.spec} ${entry.code}`.toLowerCase().includes(keyword)
  );
}
