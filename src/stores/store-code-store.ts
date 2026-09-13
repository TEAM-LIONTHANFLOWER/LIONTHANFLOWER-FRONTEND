import { create } from 'zustand';

interface StoreCodeState {
  /**
   * 이 기기(키오스크)가 속한 매장 코드(`MCM-PARIS` 처럼). 고객 진입 화면(`/`)이 URL 의
   * `storeCode` 쿼리로 받아 채웁니다. 없으면 `null` 이고, 그때는 방문 생성이 매장을
   * 지정하지 않아 서버 기본값(`MCM-SEOUL`)으로 갑니다.
   */
  storeCode: string | null;
  setStoreCode: (storeCode: string | null) => void;
}

/**
 * 키오스크가 속한 매장 코드.
 *
 * 한 웹 배포를 모든 매장이 함께 쓰므로, 이 기기가 어느 매장 것인지는 매장마다 다른 QR 코드가
 * 담고 있는 URL 쿼리(`?storeCode=MCM-PARIS`)로만 구분할 수 있습니다. 로그인 세션과 달리
 * 방문이 끝나도 그대로 남아야 합니다 — 키오스크는 손님이 바뀌어도 같은 매장에 있습니다.
 */
export const useStoreCodeStore = create<StoreCodeState>((set) => ({
  storeCode: null,

  setStoreCode: (storeCode) => set({ storeCode }),
}));
