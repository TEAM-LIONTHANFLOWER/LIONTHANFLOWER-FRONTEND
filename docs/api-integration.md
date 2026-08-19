# API 연동 현황

`https://mcmorbit.p-e.kr` 의 스펙 스냅숏은 [`openapi.yaml`](./openapi.yaml) 에 있습니다.
이 문서는 **그중 무엇이 화면에 붙었고 무엇이 안 붙었는지, 안 붙은 것은 왜인지** 를 적어 둡니다.

기준일: 2026-08-19 (스펙 재확인) · 스펙 출처: `https://mcmorbit.p-e.kr/v3/api-docs`

---

## 스펙을 다시 받아 보니 — 막혀 있던 둘이 서버 쪽에서 풀렸습니다

같은 날 `https://mcmorbit.p-e.kr/v3/api-docs` 를 다시 받아 `openapi.yaml` 과 대조했습니다.
아래 두 가지가 새로 왔고, 스냅숏에도 반영해 두었습니다. **앱에는 아직 붙이지 않았습니다.**

| 스펙 변경                                              | 풀리는 것                                                                                                                     |
| ------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------- |
| `GET /api/staff/products` 신설                         | 제품과 그 variant 의 UUID 를 받을 수 있습니다 → **Arc 생성이 가능해집니다** ("막힌 것" 2).                                    |
| `VisitSummaryResponse` 에 `arcId` `visitMemoryId` 추가 | 방문 하나에 딸린 기록을 되찾을 수 있습니다 → `/staff/customer-detail` 기록면과 완료 화면 복귀가 가능해집니다 ("막힌 것" 2-2). |

`GET /api/staff/products` 는 **파라미터가 없습니다.** `GET /api/stores` 같은 `query` 검색이 아니라
목록 전체를 주는 모양이라, 폼의 제품 검색은 받아 온 목록을 앱에서 거르는 쪽이 됩니다.

```
StaffProductResponse  productId · externalProductCode · name · category(BAG|CLOTHING|ACCESSORY)
  └ VariantResponse   productVariantId · externalVariantCode · color(13종) · option(XS|S|M|L|ONE_SIZE)
```

> **색 enum 이 두 벌입니다.** variant 의 `color` 는 `BEIGE` `BROWN` `ORANGE` `BLUE` `PURPLE` 를 갖고,
> Arc 입력의 `preferredColors` 는 `BROWN_BEIGE` `NAVY_BLUE` `METALLIC` `OTHER` 를 갖습니다.
> 서로 다른 목록이니 제품 옵션 색과 선호 색을 같은 값으로 다루면 안 됩니다.

**나머지는 그대로입니다.** `ArcInputSnapshot` 에는 여전히 `required` 표시가 없고("막힌 것" 1),
편지 언어("막힌 것" 3)와 스튜디오 프레임 이미지 403 도 스펙상 변화가 없습니다.
서버 응답은 직원 토큰이 있어야 볼 수 있어 **실제 값은 아직 확인하지 못했습니다** — 스펙만 대조한 결과입니다.

---

## 이번 갱신에서 달라진 것

엔드포인트는 하나도 늘거나 줄지 않았습니다. 바뀐 것은 필드 셋뿐인데, 셋 다 지난 문서에서
`막힌 것` 으로 적어 둔 항목을 겨냥한 변경입니다.

| 스펙 변경                                                    | 결과                                                                                                    |
| ------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------- |
| `VisitSummaryResponse` 에 `matchedAt` `visitedAt` 추가       | 직원 홈 카드에 `응대중・08:24` 의 시각이 붙고, 날짜 머리글이 실제 방문 날짜가 됐습니다. **붙였습니다.** |
| `ArcListItemResponse` 에 `storeName` `momentToRemember` 추가 | 봉투 겉면에 필요한 값이 목록에 다 왔습니다. 편지 본문은 아직 상세에만 있어 상세 호출은 남습니다.        |
| `FrameResponse.frameType` 에 `FRAME_3` `FRAME_4` 추가        | 서버 프레임이 앱의 네 종과 개수가 맞았습니다. 다만 이미지가 열리지 않아 아직 못 붙입니다.               |

스펙 밖에서 서버 상태도 함께 확인했습니다. **지난 문서의 치명 이슈 두 개가 풀렸습니다.**

- **`GET /api/staff/visits` 가 고쳐졌습니다.** 500 이던 것이 200 으로 목록을 돌려줍니다.
  직원 홈이 다시 살아나면서 고객·직원을 오가는 매칭 확인도 끝까지 할 수 있게 됐습니다.
- **CORS 허용 목록에 `develop` 미리보기와 로컬이 들어갔습니다.** 세 출처 모두 프리플라이트가
  200 이고 `Allow-Credentials: true` 가 옵니다. 이제 `npm run web` 으로 로컬에서 개발할 수 있습니다.
- **Visit Memory 는 전 구간이 됩니다.** 생성 → 미리보기 → 전송 → 고객 알림 → 고객 조회까지
  실제로 돌려 확인하고 **앱에도 다 붙였습니다.**
- **Arc 생성은 막혀 있습니다.** 스펙에 필수 표시가 없는데 서버는 `inputSnapshot` 의 열한 개를
  요구하고, 그중 `purchasedProductVariantIds` 는 **실재하는 제품 UUID** 여야 합니다.
  제품 목록을 주는 API 가 없어 그 값을 구할 데가 없습니다. 아래 "막힌 것" 1·2 참고.
- **생성된 글이 늘 한국어입니다.** 고객이 `EN` `JA` 를 골라도 한국어로 옵니다 — "막힌 것" 3 참고.

그리고 **고정값으로 남아 있던 화면 네 곳을 다시 조사해 전부 붙였습니다.** "엔드포인트가 없다"
고 적어 둔 것 중 절반은 사실이 아니었습니다 — `/arc` 의 `Visit Memory` 팝업과
`/staff/customer-detail` 의 프로필 면은 지금 있는 응답으로 채울 수 있었고, `Initial setup` 은
앱이 값을 쥐고 있다가 버리는 쪽이 문제였습니다. `/staff/record-form` 은 보기 값을 서버 enum 으로
바꾸고 Visit Memory 제출까지 이었습니다. "화면별 정밀 대조" 절에 하나씩 적었습니다.

---

## 서버와 주고받는 규칙

스펙에 안 적혀 있지만 클라이언트가 기대고 있는 세 가지입니다. 셋 다 `@services/api` 가 흡수하므로
화면과 쿼리 훅은 몰라도 됩니다.

| 규칙      | 내용                                                                                                                              |
| --------- | --------------------------------------------------------------------------------------------------------------------------------- |
| 응답 봉투 | 성공·실패 모두 `{ "success": …, "data": … }` 로 한 겹 감싸져 옵니다. `api.get<T>()` 는 `data` 만 돌려줍니다.                      |
| 에러 바디 | `{"success":false,"error":{"code","message","fieldErrors"}}`. `ApiError` 의 `message` `code` `fieldErrors` 가 여기서 옵니다.      |
| 인증      | Bearer 헤더가 아니라 **쿠키** 입니다 — 고객은 `customer_token`, 직원은 `staffToken`. 요청에 `credentials: 'include'` 가 붙습니다. |

`error.message` 는 한국어 한 가지뿐이라 **고객 화면에는 그대로 띄우지 않습니다.** 고객이 고른 언어의
안내(`login.startFailed`, `matching.failed`, `arc.loadFailed`)를 대신 보여줍니다.
직원 화면은 번역 대상이 아니라 한국어로 적습니다.

### 환경 변수

```bash
EXPO_PUBLIC_API_BASE_URL=https://mcmorbit.p-e.kr   # 경로에 /api 가 들어 있어 호스트까지만
```

`EXPO_PUBLIC_DEFAULT_STORE_ID` 는 없어졌습니다. 매장 검색 API 가 생겨 화면에서 직접 고릅니다.
`.env` 에 남아 있어도 아무 데서도 읽지 않습니다.

---

## 붙은 것

| 화면                                   | 엔드포인트                                                                        | 훅                           |
| -------------------------------------- | --------------------------------------------------------------------------------- | ---------------------------- |
| `/login` 고객 로그인                   | `POST /api/customers/visits` → `PATCH /api/customers/visits/{visitId}/onboarding` | `useStartVisit()`            |
| `/matching` 매칭 대기                  | `GET /api/customers/visits/{visitId}/matching`                                    | `useVisitMatching()`         |
| `/arc` 고객 Arc                        | `GET /api/customers/arcs` + `GET /api/customers/arcs/{arcId}`                     | `useCustomerArcEntries()`    |
| `/staff` 진입 세션 확인                | `GET /api/staff/me/profile`                                                       | `useStaffProfile()`          |
| `/staff/login` 매장 검색               | `GET /api/stores`                                                                 | `useStoreSearch()`           |
| `/staff/login` 직원 로그인             | `POST /api/staff/me/profile` → `GET /api/staff/me/profile`                        | `useRegisterStaffProfile()`  |
| `/staff/dashboard` 직원 홈             | `GET /api/staff/visits`                                                           | `useStaffVisits()`           |
| `/staff/dashboard` 응대 시작           | `POST /api/staff/visits/{visitId}/assignment`                                     | `useAssignVisit()`           |
| `/staff/customer-detail` 프로필 면     | `GET /api/staff/visits` + `GET /api/stores`                                       | `useStaffVisits()`           |
| `/staff/record-form` Visit Memory 작성 | `POST /api/staff/visits/{visitId}/visit-memories`                                 | `useCreateVisitMemory()`     |
| `/staff/record-complete` 미리보기      | `GET /api/staff/visit-memories/{id}`                                              | `useStaffVisitMemory()`      |
| `/staff/record-complete` 다시 생성     | `POST /api/staff/visit-memories/{id}/regenerations`                               | `useRegenerateVisitMemory()` |
| `/staff/record-complete` 전송          | `POST /api/staff/visit-memories/{id}/share`                                       | `useShareVisitMemory()`      |

로그인 두 개가 각각 두 번 호출인 이유는 서버가 그렇게 나눠 두었기 때문입니다.
고객은 `진입(쿠키 발급 + visitId)` → `온보딩 저장`, 직원은 `프로필 등록(쿠키 발급)` → `프로필 조회(staffId 획득)`.
화면에서는 `Start to Journey` 한 번에 일어나는 일이라 훅 하나로 묶었습니다.

> 등록 요청(`POST /api/staff/me/profile`)이 프로필 본문까지 함께 돌려줍니다. 다만 스펙에는
> 아직 응답이 `Object` 로만 적혀 있고 `createdAt` 도 `null` 로 오므로, 조회를 한 번 더 하는 지금 형태를
> 유지합니다. 스펙에 응답 모양이 명시되면 그때 한 번으로 줄입니다.

### `/staff` 진입에서 로그인을 건너뛰는 조건

진입 화면은 스플래시가 도는 동안 `GET /api/staff/me/profile` 을 한 번 부릅니다.
통하면 `staffToken` 쿠키가 아직 살아 있다는 뜻이라 로그인을 건너뛰고 `/staff/dashboard` 로 갑니다.
쿠키 값은 앱이 읽을 수 없어서, 이 조회가 토큰이 있는지 확인하는 유일한 방법입니다.

받아 온 프로필은 그 자리에서 `staff-store` 에 넣습니다 — 로그인 화면이 하던 일이고,
`/staff/customer-detail` 같은 뒤 화면이 `storeId` 를 여기서 읽기 때문입니다.

401 이면 로그인으로 보냅니다. 온보딩을 봤는지는 메모리에만 있어 앱을 껐다 켜면 지워지므로,
쿠키를 먼저 확인해 이미 일하던 직원에게 온보딩이 다시 뜨지 않게 합니다.

### 직원 홈의 시각과 날짜

이번에 늘어난 `matchedAt` `visitedAt` 이 카드의 빈자리 두 곳을 채웁니다.

- **`matchedAt` → 배지의 시각.** 담당자가 배정된 방문은 `응대중・08:24` 로 그립니다.
  아직 배정 전이면 시각 없이 `응대대기중` 입니다. 옮기는 곳은 `use-staff-visits.ts` 의 `toBadgeTime()`.
- **`visitedAt` → 날짜 머리글.** 전에는 오늘 날짜를 그려 넣었는데, 이제 방문이 실제로 들어온
  날짜로 묶습니다(`toVisitDays()`). 서버가 날짜순으로 세워 주지 않아 — 응대 중인 방문이 먼저 옵니다 —
  날짜 사이 순서만 다시 세우고 같은 날 안에서는 서버 차례를 그대로 둡니다.
  서버가 `visitedAt` 을 비워 보내면 지금 매장에 있는 고객이므로 오늘로 묶습니다.

지금 서버가 주는 것이 현재 방문뿐이라 날짜 묶음은 대개 하루입니다. 지난 날짜가 섞여 오기 시작하면
화면은 그대로 두고 머리글만 늘어납니다.

> **목록에는 다른 직원이 맡은 고객도 함께 옵니다.** `staffId` 로 누가 담당인지 알 수 있는데
> 카드는 그 구분을 그리지 않아, 남이 응대 중인 고객의 `Arc 생성하기` 도 눌립니다.
> 서버가 막는 것인지 화면에서 가려야 하는 것인지는 팀에서 정해야 합니다.

### `/matching` 이 배정을 알아채는 방법

서버가 배정 사실을 밀어 주지 않습니다 — 웹소켓도 푸시도 없습니다. 그래서 고객 쪽에서 되묻습니다.

1. `/matching` 이 `GET /api/customers/visits/{visitId}/matching` 을 **2 초 간격으로** 부릅니다.
2. 직원이 `/staff/dashboard` 에서 `응대 시작` 을 누르면 서버 상태가 `ACTIVE` 로 바뀌고
   `staffId` `staffName` `matchedAt` 이 채워집니다.
3. `staffId` 가 채워진 것을 보면 폴링을 멈추고, 로고가 홈의 워드마크 자리로 옮겨 가는 전환을 시작합니다.

간격은 `use-customer-visit.ts` 의 `MATCHING_POLL_INTERVAL_MS` 한 곳에 있습니다.
서버가 나중에 알림을 밀어 주게 되면 이 폴링을 걷어냅니다.

### 세션은 어디에 있나

React Query 가 서버 데이터를 들고, Zustand 에는 **내가 누구인지** 만 둡니다.

- `@stores/visit-store` — 고객의 `visitId`·이름·상태, 그리고 로그인 때 고른 응대 언어·응대 방식
  (서버가 되읽어 주지 않아 보낸 값을 여기 남겨 둡니다 — `Initial setup` 팝업이 읽습니다)
- `@stores/staff-store` — 직원 프로필

둘 다 메모리에만 있어 **앱을 껐다 켜면 로그아웃됩니다.** (`AGENTS.md` 의 "아직 정하지 않은 것" 참고)
쿠키는 네이티브에서 OS 쿠키 저장소에 남지만, 앱 쪽 세션 상태가 비어 있어 로그인 화면부터 다시 시작합니다.
`/matching` 은 이 때문에 `visitId` 가 없으면 물어볼 방문이 없어 `/login` 으로 되돌립니다.

### 만들어 뒀지만 아직 부를 자리가 없는 훅

| 훅                 | 엔드포인트                                  | 왜 안 부르나                                                                                                                                                                                           |
| ------------------ | ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `useFinalizeArc()` | `POST /api/customers/arcs/{arcId}/finalize` | 직원 완료 화면의 마지막 버튼이 `저장` 으로 바뀌어 이 호출이 놓일 자리는 정해졌습니다. 다만 이 API 는 `customer_token` 을 요구해 **직원 화면에서 그대로 부를 수 없습니다** — 고객 쪽에서 눌러야 합니다. |

---

## 안 붙은 것 — 엔드포인트는 있는데 받을 화면이 없음

| 엔드포인트                                                                                                                                                                          | 왜                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `PATCH /api/customers/notifications/{id}/read`                                                                                                                                      | 알림을 목록으로 보여주는 화면이 시안에 없습니다. 종 아이콘도 없어 **읽음으로 표시할 자리가 없습니다.** (목록 조회 자체는 `Visit Memory` 팝업이 씁니다.)                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| `GET /api/customers/studio/frames`                                                                                                                                                  | 프레임 수는 네 종으로 맞았지만 `overlayImageUrl`(`/mcm-studio/Frame_1.png`)이 **403 으로 막혀 있습니다.** 이미지를 못 받으니 지금 붙이면 앱이 직접 그리는 네 종(`frame-01`~`04`)을 그대로 쓰면서 요청만 한 번 더 하는 꼴입니다.                                                                                                                                                                                                                                                                                                                                                                                |
| `POST /api/staff/visits/{visitId}/arcs`<br>`POST /api/staff/arcs/{arcId}/revisions`<br>`POST /api/staff/arcs/{arcId}/revisions/{revisionId}/share`<br>`GET /api/staff/arcs/{arcId}` | 폼과 완료 화면은 Visit Memory 와 같은 구조로 이미 서 있습니다. 그런데 **제품 variant UUID 를 구할 방법이 없어 생성 자체가 불가능합니다** — 아래 "막힌 것" 1·2 참고. Arc 흐름만 아직 로컬로 둡니다.<br><br>**붙일 때의 순서는 정해졌습니다** — 작성 폼 마지막 단계의 `NEXT` 한 번이 생성과 전송까지 이어 부르고(그래서 완료 화면은 이미 고객에게 간 Arc 를 보여줍니다), 완료 화면의 `다시 생성하기` 는 새 리비전을 만들어 다시 전송하고, `Arc 수정` 은 폼으로 돌아가 처음부터 다시 탑니다. 마지막 버튼은 전송이 아니라 `저장` 이고, 고객 최종 저장(`POST /api/customers/arcs/{arcId}/finalize`)으로 이어집니다. |

---

## 안 붙은 것 — 화면은 있는데 엔드포인트가 없음

| 화면                             | 지금 상태                 | 없는 것                                                                                                                                   |
| -------------------------------- | ------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `/home` 고객 홈                  | `@constants/home` 고정값  | 브랜드 콘텐츠(`Now On`, `About MCM`, `MCM Myself`)를 내려주는 엔드포인트가 스펙에 하나도 없습니다.                                        |
| `/staff/dashboard` 지난 Arc 기록 | **줄이 사라졌습니다**     | `GET /api/staff/visits` 는 _현재 방문 중인_ 고객만 줍니다. 지난 날짜의 Arc 기록을 받을 엔드포인트가 없어 `ArcRecordCard` 섹션을 뺐습니다. |
| `/staff/customer-detail` 기록면  | `@constants/visit` 고정값 | 방문에 딸린 Arc / Visit Memory 의 **id 를 알아낼 엔드포인트가 없습니다.** 생성 응답에만 있고 되찾을 길이 없습니다 — "막힌 것" 2-2 참고.   |
| `/studio`                        | 로컬 데모                 | 매거진 생성 API 가 없습니다. 프레임 목록만 있고, 셔터를 누른 뒤 무엇을 만드는지에 해당하는 엔드포인트가 없습니다.                         |

---

## 화면별 정밀 대조 — 넷 다 붙였습니다

"엔드포인트가 없다" 고 뭉뚱그려 적어 두었던 곳들을 하나씩 다시 보고 **전부 서버에 붙였습니다.**
남은 것은 서버가 정말로 막고 있는 두 가지뿐입니다 — Arc 생성(제품 식별자)과 방문에 딸린
기록의 식별자 조회입니다.

### 1. `/staff/record-form` — 보기 값을 서버 enum 으로 바꿨습니다 <sup>(붙임)</sup>

폼의 칩·옵션 목록 아홉 개를 서버 enum 과 하나씩 맞춰 봤더니 **일곱 개가 개수는 물론 순서까지
정확히 맞았습니다.**

| 폼 묶음                 | 서버 필드                | 결과                                             |
| ----------------------- | ------------------------ | ------------------------------------------------ |
| 선호 스타일 (10)        | `preferredStyles`        | 10 개 순서까지 일치                              |
| 구매 기준 (12)          | `purchaseCriteria`       | 12 개 순서까지 일치                              |
| 실제 선호 응대 방식 (4) | `interactionPreferences` | 4 개 일치 (서버는 배열, 폼은 단일 → 한 칸으로)   |
| 제품 설명 선호 (3)      | `explanationPreferences` | 3 개 일치                                        |
| 구매 결정 방식 (4)      | `purchaseDecisionStyle`  | 4 개 일치 (서버도 단일 값)                       |
| 고객 반응 (6)           | `productEngagements` 값  | 6 개 일치                                        |
| 관심 포인트 (12)        | `interestPoints`         | 12 개 일치                                       |
| 미구매 사유 (5+6+2)     | `noPurchaseReasons`      | 폼의 세 묶음을 이어 붙이면 13 개가 순서까지 일치 |
| 선호 컬러 (11)          | `preferredColors`        | **서버에 `OTHER` 가 하나 더 있습니다**           |

그래서 **대응표를 따로 두지 않고 보기의 `value` 자체를 서버 enum 으로 바꿨습니다**
(`{ value: 'CLASSIC_TIMELESS', label: '클래식' }`). 화면에는 `label` 이 보이고, 스토어에 담겨
요청으로 나가는 것은 `value` 입니다. 서버 enum 이 `@/types/staff` 에 타입으로도 적혀 있어
**둘이 어긋나면 컴파일이 막힙니다.**

어긋나 있던 다섯 곳도 함께 고쳤습니다.

| 자리                       | 지금                        | 서버가 원하는 것                                                                                                                    |
| -------------------------- | --------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| **선호 제품군**            | 자유 텍스트였습니다         | `BAG` `CLOTHING` `ACCESSORY` 셋을 고르는 **칩으로 바꿨습니다.** 필수 필드인데 자유 입력으로는 보낼 수 있는 값이 아예 안 나왔습니다. |
| **구매 날짜**              | 손으로 적었습니다           | **달력에서 고릅니다.** 타이핑을 아예 받지 않습니다 — 고른 순간 서버가 받는 `YYYY-MM-DD` 가 됩니다.                                  |
| **관심 제품**              | 자유 텍스트 한 줄이었습니다 | `구매 제품` 과 같은 **제품 묶음으로 바꿨습니다.** 서버가 UUID 배열로 받습니다.                                                      |
| **선호 컬러의 `기타`**     | 칩이 없었습니다             | `Other` 칩을 **더했습니다.** enum 에 `OTHER` 가 있는데 컬러만 빠져 있었습니다.                                                      |
| **`기타` 를 고른 뒤의 칸** | 없었습니다                  | `기타` 를 고르면 그 아래에 자유 입력 한 줄이 **열리도록 했습니다.** 서버의 `preferredColorOther` 등 다섯 필드로 나갑니다.           |

> 컬러의 `Other` 칩과 `기타` 뒤에 열리는 입력 한 줄은 **시안에 없던 것** 입니다.
> 서버가 받는 값을 폼이 만들 수 없어 더했습니다 — 디자인 확인이 필요합니다.

**Visit Memory 는 여기서 서버로 나갑니다.** 마지막 단계의 `NEXT` 가
`POST /api/staff/visits/{visitId}/visit-memories` 를 부르고, 서버가 글까지 써서 돌려주면
완료 화면으로 넘어갑니다. 미구매 사유는 시안이 세 묶음으로 나눠 묻는데 서버는 배열 하나라
보낼 때 이어 붙입니다(`toVisitMemorySnapshot()`).

#### 구매정보 네 칸 — 셋은 고르게 바꿨고 하나가 남았습니다

시안이 넷 다 자유 입력이라 `200601` 이나 `mcm` 처럼 **서버가 받지 않는 값이 그대로 나갈 수
있었습니다.** 손으로 적는 대신 고르게 바꿨습니다.

| 칸            | 지금                                                                                                 |
| ------------- | ---------------------------------------------------------------------------------------------------- |
| **구매 날짜** | 달력에서 하루를 고릅니다(`DateField`). 타이핑을 받지 않아 서버가 받는 모양만 나옵니다.               |
| **구매 국가** | 매장 목록에 실제로 있는 국가만 고릅니다(`RecordCountryField`). 매장을 먼저 고르면 저절로 채워집니다. |
| **구매 매장** | `GET /api/stores` 로 검색해 고릅니다. `/staff/login` 의 `StoreSearchField` 를 그대로 씁니다.         |
| **구매 제품** | **아직 자유 입력입니다.** 서버에 제품 목록 API 가 없습니다 — "막힌 것" 2 번 참고.                    |

국가를 따로 고르게 둔 이유는 서버가 `purchaseCountry` 를 검증하지 않기 때문입니다 —
`KR` `Korea` `대한민국` `REPUBLIC OF KOREA` 가 다 통과해서, 손으로 적게 두면 같은 나라가 여러
표기로 쌓입니다. 매장의 `countryCode` 를 모아 쓰면 표기가 `KR` 하나로 모입니다.
**매장이 없는 나라에서 산 물건일 수는 없으니 이 목록이 곧 고를 수 있는 전부입니다.**

> 달력은 새 의존성 없이 직접 그렸습니다. `@react-native-community/datetimepicker` 를 넣는 편이
> 손은 덜 가지만 `AGENTS.md` 가 의존성 추가를 팀 논의 사항으로 두고 있고, 네이티브 피커는
> iOS / Android / 웹 모양이 제각각이라 어차피 세 곳을 맞춰야 합니다. 도입하고 싶다면 팀에서
> 정하고 `DateField` 를 갈아 끼우면 됩니다.

### 2. `/staff/customer-detail` — 프로필 면을 서버 값으로 그립니다 <sup>(붙임)</sup>

두 면 중 앞면이 보여주는 여섯 줄은 이미 받고 있는 응답으로 다 나옵니다(`toCustomerProfileCard()`).

| 카드의 줄        | 어디서                                              |
| ---------------- | --------------------------------------------------- |
| 이름             | `VisitSummaryResponse.customerName`                 |
| `기존 고객`      | `arcCount > 0`                                      |
| `Arc 4`          | `arcCount`                                          |
| 응대 언어        | `serviceLanguage`                                   |
| `직원 추천 선호` | `interactionStyle`                                  |
| `현재 방문: …`   | 직원 프로필의 `storeId` → `GET /api/stores` 의 이름 |

막고 있던 것은 서버가 아니라 화면 이동이었습니다 — `/staff/dashboard` 가 `params: { page }` 만
넘겨서 어느 고객인지가 전달되지 않았습니다. **`visitId` 를 함께 넘기도록 고쳤고**, 상세 화면은
그 값으로 직원 홈이 이미 받아 둔 방문 목록에서 자기 고객을 찾습니다. 고객 한 명을 따로 조회하는
엔드포인트는 없지만 목록에 필요한 값이 다 있어 아쉬울 것이 없습니다.
매장 이름만 방문에 실려 오지 않아 로그인한 직원의 근무 매장에서 가져옵니다.

뒷면(`VISIT_RECORD_CARD`)은 그날 쓴 Arc / Visit Memory 본문인데, **여기는 아직 고정값입니다.**
`GET /api/staff/arcs/{arcId}` 도 `GET /api/staff/visit-memories/{id}` 도 id 를 요구하는데,
그 id 는 **생성 응답에만 담겨 옵니다.** 방문 하나에 딸린 Arc / Visit Memory 를 되찾는 길이
없어서, 직원이 화면을 한 번 벗어나면 자기가 방금 쓴 기록도 다시 열 수 없습니다.

### 3. `/arc` 의 `Visit Memory` 팝업 — 알림에서 찾아 엽니다 <sup>(붙임)</sup>

두 번 부릅니다.

```
GET /api/customers/notifications          → type: VISIT_MEMORY 인 항목의 resourceId
GET /api/customers/visit-memories/{그 id} → storeName · countryCode · summary
```

지난 문서에서 "알림 UI 가 없어 열 방법이 없다" 고 적었지만, **이 팝업 자체가 그 소비자** 라
따로 알림 화면을 만들 필요가 없었습니다. 알림이 여럿이면 `createdAt` 이 가장 늦은 것을 엽니다.
아직 받은 기록이 없는 것은 오류가 아니라 흔한 상태라, 다시 시도 버튼 없이 안내만 보여줍니다.

**모양은 아직 안 맞습니다.** 팝업은 세 단락(`Your MCM Moment` / `You seemed drawn to` /
`Worth remembering`)을 그리도록 되어 있는데 서버는 `summary` **문자열 하나** 만 줍니다.
나눌 근거가 응답에 없어 **소제목 없이 글만 한 덩이로** 얹었습니다. 서버가 토막 내어 보내기
시작하면 그때 소제목을 답니다. (Arc 편지는 세 필드로 나뉘어 오니 여기만 다릅니다.)

버튼은 고객·직원 화면이 함께 쓰는 공용 컴포넌트라 **편지를 어디서 가져올지는 부르는 쪽이
정하도록** 갈랐습니다. 고객은 `CustomerVisitMemoryLink` 가 위 두 호출로 읽고, 직원 완료 화면은
방금 만든 글을 그대로 넘깁니다. 직원 고객 상세는 넘겨줄 식별자가 없어 아직 자리 채우기입니다.

### 4. `Initial setup` 팝업 — 세션에 담아 두고 읽습니다 <sup>(붙임)</sup>

팝업이 보여주는 것은 `Service`(응대 방식)와 `Language` 둘입니다. **둘 다 고객이 `/login` 에서
직접 고른 값** 인데, 보내고 나면 앱 어디에도 남지 않았습니다 — `login.tsx` 가 `useState` 로만
들고 있었고 세션에는 `visitId`·이름·상태만 담겼습니다.

**보낸 값을 방문 세션에 함께 담도록 고쳤습니다.** 서버가 되읽어 주지 않으니 여기서 잃으면
다시 알 길이 없습니다 — 고객용 응답 중 `serviceLanguage` `interactionStyle` `additionalRequest`
를 주는 것이 하나도 없습니다(`MatchingResponse` 에도 없습니다).
앱을 껐다 켜면 사라지는 것은 다른 세션 값과 같은 한계입니다.

**직원 화면의 같은 팝업은 서버 값으로 채웁니다** — `VisitSummaryResponse` 에 셋 다 있어서,
고객 상세가 자기 고객의 값을 넘겨 줍니다. 값을 넘겨받으면 직원 화면이라, 팝업 글도 한국어로 적습니다.

> `Language` 는 이제 고객이 고른 한 가지만 보여줍니다. 시안은 `한국어 · English` 처럼 두 개를
> 그려 두었는데 고객은 언어를 하나만 고릅니다 — **시안이 데이터와 어긋난 자리** 입니다.

---

## 막힌 것 — 서버 쪽에 필요한 일

붙일 코드는 다 있는데 서버 때문에 끝까지 안 가는 것들입니다.

### 1. 스펙에 필수 표시가 없는데 서버는 요구합니다

`StaffArcGenerationRequest` 와 `StaffVisitMemoryGenerationRequest` 는 스펙상 **필수 필드가 하나도
없습니다.** 그런데 실제로는 `inputSnapshot` 의 특정 키가 없으면 `COMMON-400` 이고, `fieldErrors` 는
빈 배열이라 **무엇이 빠졌는지 응답만 보고는 알 수 없습니다.** 하나씩 빼 보며 알아낸 규칙입니다.

**Arc (`POST /api/staff/visits/{visitId}/arcs`)** — 열한 개 키가 모두 있어야 합니다.

| 필드                                                                                                                                                               | 키가 있어야 하나 | 빈 값이어도 되나        |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------- | ----------------------- |
| `purchaseDate`                                                                                                                                                     | 필수             | —                       |
| `purchaseCountry` `purchaseStore`                                                                                                                                  | 필수             | **빈 문자열 안 됩니다** |
| `purchasedProductVariantIds`                                                                                                                                       | 필수             | **`[]` 안 됩니다**      |
| `preferredCategories` `preferredColors` `preferredStyles`<br>`interestedProductVariantIds` `purchaseCriteria`<br>`interactionPreferences` `explanationPreferences` | 필수             | `[]` 이면 됩니다        |
| `preferredColorOther` `preferredStyleOther` `purchaseCriterionOther`<br>`purchaseDecisionStyle` `staffObservation`                                                 | 선택             | —                       |

**Visit Memory (`POST /api/staff/visits/{visitId}/visit-memories`)** — 세 개면 됩니다.

| 필드                                                         | 키가 있어야 하나 | 빈 값이어도 되나        |
| ------------------------------------------------------------ | ---------------- | ----------------------- |
| `productEngagements` `interestPoints` `noPurchaseReasons`    | 필수             | `{}` / `[]` 이면 됩니다 |
| `nextVisitMemo` `interestPointOther` `noPurchaseReasonOther` | 선택             | —                       |

**부탁** — 스펙에 `required` 를 표시해 주시거나, 400 일 때 `fieldErrors` 를 채워 주세요.
지금은 필드를 하나씩 빼 보는 것 말고는 알아낼 방법이 없습니다.

### 2. Arc 는 제품 UUID 없이는 만들 수 없는데, 제품을 구할 데가 없습니다 <sup>(스펙에서 풀렸습니다)</sup>

> **`GET /api/staff/products` 가 생겼습니다.** 아래는 그전 기록입니다 — 부탁한 두 가지 중
> 제품 목록 API 는 왔고, 없는 UUID 를 500 대신 400/404 로 돌려주는 쪽은 아직 확인 못 했습니다.

위 표의 `purchasedProductVariantIds` 가 **비면 안 되고, 그 안의 UUID 는 실재하는 제품이어야
합니다.** 없는 UUID 를 넣으면 400 도 404 도 아니고 **500** 입니다.

```
$ curl -b staffToken=... -X POST -H 'Content-Type: application/json' \
    -d '{"inputSnapshot":{ …필수 11개… ,"purchasedProductVariantIds":["3fa85f64-…"]}}' \
    https://mcmorbit.p-e.kr/api/staff/visits/{visitId}/arcs
{"success":false,"error":{"code":"COMMON-500","message":"서버 내부 오류가 발생했습니다.","fieldErrors":[]}}
```

그런데 **제품 목록을 주는 엔드포인트가 스펙에 없습니다.** 매장처럼 짐작 가는 UUID
(`00000000-0000-0000-0000-00000000000N`)도 전부 500 이라 씨앗 데이터로도 얻을 수 없고,
스펙에 안 실렸을까 싶어 짐작 가는 경로도 눌러 봤지만 전부 404 입니다.

```
/api/products                      404
/api/product-variants              404
/api/stores/{storeId}/products     404
/api/staff/products                404
/api/products/search?query=        404
```

**Arc 생성은 여기서 완전히 막힙니다.** 필요한 것 두 가지입니다.

- 매장의 제품 variant 를 검색·나열하는 API (`GET /api/stores` 와 같은 모양이면 됩니다).
  `/staff/record-form` 의 `구매 제품` `관심 제품` 칸이 이걸 씁니다. **구매정보의 다른 세 칸은
  이미 고르는 방식으로 바꿔 두어서, 이 API 만 생기면 제품 칸도 같은 모양으로 이으면 됩니다.**
- 없는 제품 UUID 를 500 이 아니라 400/404 로 돌려주기.

Visit Memory 는 `productEngagements` 를 `{}` 로 둘 수 있어 제품 없이도 만들어집니다.
그래서 **Visit Memory 쪽만 먼저 붙일 수 있습니다.**

### 2-1. Visit Memory 는 전 구간이 됩니다 <sup>(확인하고 붙였습니다)</sup>

생성 → 직원 미리보기 → 전송 → 고객 알림 → 고객 본문 조회까지 실제로 돌려 봤고 전부 200 입니다.

```
POST /api/staff/visits/{visitId}/visit-memories   → 200  status: READY, generatedContent.summary 채워짐
GET  /api/staff/visit-memories/{id}               → 200  미리보기
POST /api/staff/visit-memories/{id}/share         → 200  status: FINALIZED
GET  /api/customers/notifications                 → 200  type: VISIT_MEMORY, resourceId = 그 id
GET  /api/customers/visit-memories/{id}           → 200  storeName·countryCode·summary
```

전송하면 고객 알림이 자동으로 생기고, 그 `resourceId` 로 본문을 엽니다. 지난 문서에서
"알림을 안 받으니 Visit Memory 를 열 방법이 없다" 고 적은 것은 **틀렸습니다** — 알림은 옵니다.

`재생성` 도 됩니다. 본문 없이 불러도, 고친 입력을 실어 불러도 새 글이 나옵니다.

> 생성된 글에 **enum 코드가 그대로 새어 나올 때가 있습니다** — `DESIGN에 대해 깊은 관심을`
> 처럼요. 매번은 아니고 재생성하면 자연스러운 문장이 나오기도 합니다. 프롬프트에서 코드를
> 사람이 읽는 말로 바꿔 넣어 주세요.

### 2-2. 방문에 딸린 Arc / Visit Memory 를 되찾을 수 없습니다 <sup>(스펙에서 풀렸습니다)</sup>

> **`VisitSummaryResponse` 에 `arcId` `visitMemoryId` 가 실려 옵니다.** 아래 "필요한 것" 의
> 두 번째 안대로 왔습니다. 아래는 그전 기록입니다.

직원용 조회는 둘 다 id 를 요구합니다.

```
GET /api/staff/arcs/{arcId}
GET /api/staff/visit-memories/{visitMemoryId}
```

그런데 그 id 는 **생성 응답에만 담겨 옵니다.** `VisitSummaryResponse` 에도 없고, 방문 하나의
Arc / Visit Memory 를 나열하는 엔드포인트도 없습니다. 그래서 직원이 기록을 쓰고 화면을 한 번
벗어나면 **자기가 방금 쓴 것도 다시 열 수 없습니다.** `/staff/customer-detail` 의 방문 기록 면이
고정값으로 남아 있는 이유가 이것입니다.

**필요한 것** — 둘 중 하나면 됩니다.

- `GET /api/staff/visits/{visitId}/arcs` · `.../visit-memories` (그 방문의 목록)
- 또는 `VisitSummaryResponse` 에 `arcId` `visitMemoryId` 를 실어 주기

### 3. 편지를 고객 언어로 써서 내려주세요 <sup>(재현했습니다)</sup>

`GET /api/customers/arcs/{arcId}` 의 `momentSummary` `preferences` `momentToRemember` 는 문자열 하나입니다.
**이 모양이 맞습니다.** 필요한 것은 언어별 묶음이 아니라 **그 한 문장이 고객이 고른 언어로 오는 것** 입니다.

이번에 Visit Memory 생성이 되는 것을 확인하면서 실제로 재 봤습니다. **서버는 `serviceLanguage` 와
무관하게 늘 한국어로 씁니다.**

| 방문의 `serviceLanguage` | 돌아온 `generatedContent.summary`                               |
| ------------------------ | --------------------------------------------------------------- |
| `KO`                     | 고객 'MemoryCheck'는 방문 중 디자인에 큰 관심을 보였으나…       |
| `EN`                     | 고객 LangCheck은 매장에서 디자인과 색상에 대해 많은 관심을…     |
| `JA`                     | 고객 LangCheck는 매장에서 디자인과 색상에 대한 관심을 보였으나… |

영어를 고른 고객도, 일본어를 고른 고객도 한국어 편지를 받습니다. 생성 프롬프트에 방문의
`serviceLanguage` 를 넣어 주기만 하면 됩니다.

서버는 이미 방문마다 `serviceLanguage` 를 들고 있고(온보딩에서 받아 `VisitSummaryResponse` 에도 실려 옵니다),
Arc 는 그 방문에 딸려 만들어집니다(`POST /api/staff/visits/{visitId}/arcs`). 그러니 생성 시점에
그 방문의 언어로 쓰면 됩니다. 다섯 언어를 다 만들어 둘 이유가 없습니다 — 읽히는 건 한 언어뿐이고,
생성이 AI 라 나머지 넷은 비용만 듭니다.

앱 쪽은 이미 오는 대로 그립니다. `use-customer-arcs.ts` 의 `asIs()` 가 받은 문장을 다섯 칸에 같이
넣어 두는데, 편지지가 지금 언어의 칸을 꺼내 쓰므로 결과는 **서버가 보낸 문장 그대로** 입니다.
`asIs()` 는 서버가 부족해서 둔 우회가 아니라, 화면 타입(`LocalizedText`)이 서버 데이터보다 넓어서
끼워 맞추는 어댑터일 뿐입니다. 서버가 언어를 맞춰 보내기 시작하면 그때부터 그대로 맞습니다.

**언어가 어긋날 수 있는 경우는 하나뿐입니다** — 지난 방문에서 다른 언어를 골랐던 고객의 옛 Arc.
그 편지는 그때 그 언어로 남습니다. 로그인 이후에는 언어를 바꿀 수 없어(`Language` 칩이 `/login` 에만
있습니다) 한 방문 안에서는 절대 어긋나지 않습니다.

같은 이야기가 Visit Memory 에도 그대로 적용됩니다 — `VisitMemoryDetail.summary` 도 문자열 하나입니다.

### 4. Arc 목록에 편지 본문이 아직 다 오지 않습니다 <sup>(절반 풀림)</sup>

이번에 `storeName` 과 `momentToRemember` 가 목록에 들어왔습니다. **봉투 겉면은 이제 목록만으로
그릴 수 있습니다.** 그런데 봉투를 열면 나오는 편지에는 아직 목록에 없는 값이 넷 필요합니다.

| 편지의 자리                 | 필요한 필드                 | 목록에 있나 |
| --------------------------- | --------------------------- | ----------- |
| `Ethan’s 2nd Arc` 제목      | `customerName`              | 없음        |
| `MCM Seoul · KR` 한 줄      | `storeName` / `countryCode` | 절반        |
| `Your MCM Moment` 단락      | `momentSummary`             | 있음        |
| 같은 단락의 제품 줄         | `purchasedProducts`         | 없음        |
| `Your Preference` 단락      | `preferences`               | 없음        |
| `A Moment to Remember` 단락 | `momentToRemember`          | 있음        |

그래서 지금도 목록을 받은 뒤 **각 Arc 의 상세를 모두 불러** 한 벌로 합칩니다(`useCustomerArcEntries()`).
봉투를 눌렀을 때 편지가 곧바로 나와야 해서 미리 받아 두는 편이 낫습니다.
`customerName` `countryCode` `preferences` `purchasedProducts` 까지 목록에 들어오면
상세 호출을 통째로 없앨 수 있습니다.

### 5. Studio 프레임 이미지가 403 입니다

`GET /api/customers/studio/frames` 는 네 종을 잘 내려줍니다.

```json
{
  "frameType": "FRAME_1",
  "displayName": "MCM Frame 1",
  "overlayImageUrl": "/mcm-studio/Frame_1.png"
}
```

그런데 그 `overlayImageUrl` 을 받으러 가면 네 개 모두 **403** 입니다. 본문도 CORS 안내도 없이
끊깁니다 — `/api` 밖의 경로가 통째로 막혀 있는 것으로 보입니다. 쿠키를 실어도 같습니다.
이미지가 열려야 `/studio` 를 서버 프레임으로 옮길 수 있습니다.

### 풀린 것 (지난 기록)

| 지난 문제                              | 지금                                                                        |
| -------------------------------------- | --------------------------------------------------------------------------- |
| `GET /api/staff/visits` 가 500         | **200 으로 목록을 돌려줍니다.** 직원 홈이 다시 삽니다.                      |
| CORS 에 미리보기·로컬이 빠져 있음      | **셋 다 허용됐습니다.** 로컬 `npm run web` 으로 개발할 수 있습니다.         |
| 방문 목록에 응대 시작 시각이 없음      | `matchedAt` 이 왔습니다. 카드에 `응대중・08:24` 로 붙였습니다.              |
| 방문 목록에 날짜가 없음                | `visitedAt` 이 왔습니다. 날짜 머리글을 실제 방문 날짜로 그립니다.           |
| Arc 목록에 매장 이름이 없음            | `storeName` 이 왔습니다. 편지 본문은 아직이라 상세 호출은 남습니다(위 4번). |
| `POST /api/customers/visits` 가 500    | 201 로 쿠키를 심어 줍니다. 고객 로그인이 정상 동작합니다.                   |
| 쿠키에 `SameSite=None; Secure` 가 없음 | 붙어서 옵니다.                                                              |
| `serviceLanguage` 에 `KO` 가 없음      | 추가됐습니다. 다섯 언어가 하나씩 짝을 이룹니다.                             |
| 매장을 찾을 방법이 없음                | `GET /api/stores` 로 검색합니다. 임시 환경 변수는 지웠습니다.               |
| 고객이 배정을 확인할 방법이 없음       | `GET /api/customers/visits/{visitId}/matching` 을 되물어 확인합니다.        |

---

## 사람이 확인해야 할 것

에이전트는 `typecheck` / `lint` / `format` 까지만 봅니다. 아래는 화면을 띄워 눈으로 봐야 합니다.

> **이제 어디서 띄워도 API 가 붙습니다.** 본 배포·`develop` 미리보기·로컬 `npm run web`(8081) 셋 다
> CORS 허용 목록에 있습니다. 네이티브(Expo Go / 시뮬레이터)는 CORS 와 무관합니다.

- **`/staff/dashboard` 카드의 시각** — 응대를 시작한 고객의 배지가 `응대중・08:24` 처럼
  시각까지 나와야 합니다. 아직 아무도 맡지 않은 고객은 `응대대기중` 이고 시각이 없습니다.
  찍히는 시각은 **보는 기기의 시간대** 기준입니다 (서버는 UTC 로 보냅니다).
- **`/staff/dashboard` 날짜 머리글** — 오늘 들어온 고객이면 오늘 날짜가 나옵니다.
  날짜가 다른 방문이 섞여 있으면 머리글이 여러 줄로 나뉘고 **최근 날짜가 위** 에 옵니다.
  `With` / `Solo` 를 오갈 때 각 탭에 실제로 있는 날짜만 머리글로 남아야 합니다.
- **`/matching` 전체 흐름** — 고객이 `직원의 추천을 받고 싶어요` 로 로그인해 대기 화면에 머물고,
  다른 기기(또는 브라우저 창)에서 직원으로 로그인해 `응대 시작` 을 누르면 2 초 안에 고객 화면이
  홈으로 넘어갑니다. **직원 목록이 고쳐져서 이번엔 끝까지 확인할 수 있습니다.**
- **`/matching` 실패 표시** — 기내 모드처럼 연결을 끊으면 대기 문구 자리에 `매칭 상태를 확인하지
못했습니다.` 와 `다시 시도` 버튼이 뜹니다.
- **`/staff/login` 의 `Working At`** — 칸을 누르면 매장 목록이 아래로 펼쳐지고(지금 서버에는
  `MCM Seoul` 한 곳뿐입니다), 글자를 치면 걸러집니다. 하나를 고르면 목록이 접히고 칸에 이름이 남으며,
  그때부터 `Start to Journey` 가 눌립니다. 고른 뒤 다시 글자를 고치면 선택이 풀려 버튼이 잠깁니다.
- **직원 홈 카드의 언어** — 한국어로 로그인한 고객이 `English` 가 아니라 `한국어` 로 보여야 합니다.

이번에 붙인 것들은 아래를 봐 주세요.

- **Visit Memory 한 바퀴** — 직원으로 로그인해 고객 카드의 `Visit Memory 저장` → 네 단계를 채우고
  마지막 `NEXT`. 잠깐 기다리면 완료 화면에 **서버가 쓴 글**이 뜹니다. `다시 생성하기` 를 누르면
  같은 입력으로 글만 바뀌고, `방문기록 전송` 을 누르면 직원 홈으로 돌아갑니다.
  그다음 그 고객 화면(`/arc`)에서 `Visit Memory` 를 누르면 방금 보낸 글이 편지지에 뜹니다.
  아직 아무것도 안 보냈다면 `아직 도착한 방문 기록이 없습니다` 안내가 대신 나옵니다.
- **`기타` 입력** — `관심 포인트` 에서 `기타` 칩을 누르면 그 아래에 입력 한 줄이 열리고,
  다시 눌러 끄면 접힙니다. 적은 값은 다시 켜면 그대로 돌아옵니다.
  같은 동작이 선호 컬러·선호 스타일·구매 기준·미구매 사유에도 있습니다.
- **선호 제품군** — 자유 입력이 아니라 `가방` `의류` `액세서리` 칩 셋입니다.
- **구매정보 네 칸** — `Arc 생성하기` 로 들어가 첫 단계를 봅니다.
  `구매 날짜` 를 누르면 달력이 아래로 펼쳐지고, 화살표로 달을 옮겨 하루를 고르면 칸에
  `2026-08-19` 처럼 들어갑니다. 손으로는 못 칩니다.
  `구매 매장` 에 글자를 치면 매장이 걸러지고, 하나를 고르면 **`구매 국가` 가 저절로 `KR` 로
  채워집니다.** `구매 국가` 를 먼저 눌러도 매장이 있는 국가 목록이 펼쳐집니다.
  `구매 제품` 만 아직 손으로 적는 칸입니다 — 서버에 제품 목록 API 가 없습니다.
- **`/staff/customer-detail`** — 카드를 눌러 들어가면 **그 고객의** 이름·`Arc N`·언어·응대 방식과
  현재 방문 매장이 뜹니다. 예전처럼 `Ethan` 고정값이 아니어야 합니다. 톱니(`Initial setup`)를
  누르면 그 고객이 고른 응대 방식과 언어가 한국어로 뜹니다.
- **고객 쪽 `Initial setup`** — `/arc` 나 `/studio` 에서 톱니를 누르면 **내가 로그인 때 고른**
  응대 방식과 언어가 고객 언어로 뜹니다. `Language` 는 한 줄만 나와야 합니다.

---

## 스펙이 바뀌면

```bash
curl -s https://mcmorbit.p-e.kr/v3/api-docs -o api-docs.json
```

받은 JSON 을 `openapi.yaml` 로 옮기고, 손으로 채운 네 가지(`info`, `servers`, `securitySchemes`,
`ApiErrorResponse`/`ApiFieldError`)를 다시 얹습니다. springdoc 이 자동 생성하는 원본에는 그것들이 없습니다.

바뀐 곳만 찾으려면 이 파일의 `components.schemas` 와 `paths` 를 받은 JSON 과 견주면 됩니다.
이번처럼 엔드포인트는 그대로인데 필드만 느는 경우가 잦습니다.
