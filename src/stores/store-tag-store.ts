import { create } from 'zustand';

interface StoreTagState {
  /**
   * NFC 태그가 알려 준 매장 코드(`MCM-SEOUL` 같은 값). 태그를 거치지 않고 들어오면 `null` 입니다.
   * 영구 저장소를 아직 도입하지 않아 앱을 껐다 켜면 비어 있습니다.
   */
  code: string | null;
  /** 진입 화면이 URL 에서 읽은 매장 코드를 넣습니다. 태그가 없으면 `null` 을 넘깁니다. */
  setCode: (code: string | null) => void;
}

/**
 * 매장에 붙은 NFC 태그가 알려 준 `내가 지금 어느 매장에 있는지`.
 *
 * 태그에는 `https://mcm-orbit.site/?store=MCM-SEOUL` 처럼 매장 코드를 붙인 주소가 적혀 있습니다.
 * 폰이 태그를 읽으면 OS 가 그 주소를 열고, 진입 화면(`/`)이 쿼리에서 코드를 꺼내 여기 넣습니다.
 * 굽는 방법은 `docs/nfc-tag.md` 를 참고하세요.
 *
 * 진입 화면은 스플래시를 보여준 뒤 곧바로 다른 화면으로 `replace` 하기 때문에 URL 에서 쿼리가
 * 사라집니다. 그래서 화면 사이를 건너 살아남을 곳이 필요하고, 서버가 모르는 값(진입 경로)이라
 * React Query 가 아니라 여기에 둡니다. 코드로 찾은 매장 정보 자체는 서버에서 오는 값이라
 * `useStoreByCode` 가 React Query 로 들고 있습니다.
 *
 * 매장 코드는 화면 표시용으로만 씁니다. 방문을 여는 `POST /api/customers/visits` 가 매장을
 * 받지 않아서, 지금은 서버에 `어느 매장에서 들어왔는지` 를 전달할 방법이 없습니다.
 */
export const useStoreTagStore = create<StoreTagState>((set) => ({
  code: null,

  setCode: (code) => set({ code }),
}));

/** 파생값은 상태로 저장하지 않고 셀렉터로 계산합니다. */
export const useStoreTagCode = () => useStoreTagStore((state) => state.code);
