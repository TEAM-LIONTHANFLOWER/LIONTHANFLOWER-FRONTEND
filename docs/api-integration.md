# API 연동 현황

`https://mcmorbit.p-e.kr` 의 스펙 스냅숏은 [`openapi.yaml`](./openapi.yaml) 에 있습니다.
이 문서는 **그중 무엇이 화면에 붙었고 무엇이 안 붙었는지, 안 붙은 것은 왜인지** 를 적어 둡니다.

기준일: 2026-08-19 (스펙 갱신 반영) · 스펙 출처: `https://mcmorbit.p-e.kr/v3/api-docs`

---

## 이번 갱신에서 달라진 것

스펙에서 바뀐 것은 셋뿐이고, 셋 다 막혀 있던 화면을 풀어 주는 변경입니다.

| 변경                                                | 결과                                                                               |
| --------------------------------------------------- | ---------------------------------------------------------------------------------- |
| `GET /api/stores` 추가                              | 직원 로그인이 풀렸습니다. `EXPO_PUBLIC_DEFAULT_STORE_ID` 임시 조치를 걷어냈습니다. |
| `GET /api/customers/visits/{visitId}/matching` 추가 | `/matching` 의 3 초 데모 타이머를 지우고 실제 배정을 기다립니다.                   |
| `serviceLanguage` enum 에 `KO` 추가                 | 한국어를 고른 고객을 `EN` 으로 보내던 문제가 없어졌습니다.                         |

스펙 밖에서 서버 상태도 함께 확인했습니다.

- **`POST /api/customers/visits` 가 고쳐졌습니다.** 지난번 500 이던 것이 이제 201 로 쿠키를 심어 줍니다.
  고객 쪽 흐름 전체가 여기서 시작하므로 이게 제일 큽니다.
- **CORS 허용 목록이 생겼고 본 배포 주소가 들어가 있습니다.** `https://mcm-orbit-n34.pages.dev` 는
  웹에서 정상 동작합니다. `develop` 미리보기와 로컬만 아직 막혀 있습니다.
- **`GET /api/staff/visits` 가 500 을 냅니다.** 지난번엔 되던 것이라 새로 생긴 문제입니다. 아래 "막힌 것" 참고.

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

| 화면                         | 엔드포인트                                                                        | 훅                          |
| ---------------------------- | --------------------------------------------------------------------------------- | --------------------------- |
| `/login` 고객 로그인         | `POST /api/customers/visits` → `PATCH /api/customers/visits/{visitId}/onboarding` | `useStartVisit()`           |
| `/matching` 매칭 대기        | `GET /api/customers/visits/{visitId}/matching`                                    | `useVisitMatching()`        |
| `/arc` 고객 Arc              | `GET /api/customers/arcs` + `GET /api/customers/arcs/{arcId}`                     | `useCustomerArcEntries()`   |
| `/staff/login` 매장 검색     | `GET /api/stores`                                                                 | `useStoreSearch()`          |
| `/staff/login` 직원 로그인   | `POST /api/staff/me/profile` → `GET /api/staff/me/profile`                        | `useRegisterStaffProfile()` |
| `/staff/dashboard` 직원 홈   | `GET /api/staff/visits`                                                           | `useStaffVisits()`          |
| `/staff/dashboard` 응대 시작 | `POST /api/staff/visits/{visitId}/assignment`                                     | `useAssignVisit()`          |

로그인 두 개가 각각 두 번 호출인 이유는 서버가 그렇게 나눠 두었기 때문입니다.
고객은 `진입(쿠키 발급 + visitId)` → `온보딩 저장`, 직원은 `프로필 등록(쿠키 발급)` → `프로필 조회(staffId 획득)`.
화면에서는 `Start to Journey` 한 번에 일어나는 일이라 훅 하나로 묶었습니다.

> 등록 요청(`POST /api/staff/me/profile`)이 요즘은 프로필 본문까지 함께 돌려줍니다. 다만 스펙에는
> 아직 응답이 `Object` 로만 적혀 있고 `createdAt` 도 비어 오므로, 조회를 한 번 더 하는 지금 형태를
> 유지합니다. 스펙에 응답 모양이 명시되면 그때 한 번으로 줄입니다.

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

- `@stores/visit-store` — 고객의 `visitId`·이름·상태
- `@stores/staff-store` — 직원 프로필

둘 다 메모리에만 있어 **앱을 껐다 켜면 로그아웃됩니다.** (`AGENTS.md` 의 "아직 정하지 않은 것" 참고)
쿠키는 네이티브에서 OS 쿠키 저장소에 남지만, 앱 쪽 세션 상태가 비어 있어 로그인 화면부터 다시 시작합니다.
`/matching` 은 이 때문에 `visitId` 가 없으면 물어볼 방문이 없어 `/login` 으로 되돌립니다.

### 만들어 뒀지만 아직 부를 자리가 없는 훅

| 훅                  | 엔드포인트                                  | 왜 안 부르나                                                                                 |
| ------------------- | ------------------------------------------- | -------------------------------------------------------------------------------------------- |
| `useFinalizeArc()`  | `POST /api/customers/arcs/{arcId}/finalize` | 편지에 `저장` 버튼이 시안에 없습니다. 버튼이 생기면 그대로 부르면 됩니다.                    |
| `useStaffProfile()` | `GET /api/staff/me/profile`                 | 로그인 때 이미 읽어 캐시에 심어 둡니다. 다른 직원 화면이 프로필을 쓰게 되면 여기서 읽습니다. |

---

## 안 붙은 것 — 엔드포인트는 있는데 받을 화면이 없음

| 엔드포인트                                                                                                                                                                                      | 왜                                                                                                                                                                                              |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `GET /api/customers/notifications`<br>`PATCH /api/customers/notifications/{id}/read`                                                                                                            | 알림 UI 가 아예 없습니다. 종 아이콘도 목록 화면도 시안에 없습니다.                                                                                                                              |
| `GET /api/customers/visit-memories/{visitMemoryId}`                                                                                                                                             | `visitMemoryId` 는 알림의 `resourceId` 로만 옵니다. 알림을 안 받으니 열 방법이 없습니다. `/arc` 의 `Visit Memory` 팝업은 `@constants/arc` 고정값 그대로입니다.                                  |
| `GET /api/customers/studio/frames`                                                                                                                                                              | 서버는 `FRAME_1`/`FRAME_2` 두 종에 `overlayImageUrl` 을 내려주는데, `/studio` 의 프레임은 앱 안에서 직접 그리는 디자인 네 종(`frame-01`~`04`)입니다. 대응이 안 맞고, 지금 응답도 빈 배열입니다. |
| `POST /api/staff/visits/{visitId}/arcs`<br>`POST /api/staff/arcs/{arcId}/revisions`<br>`POST /api/staff/arcs/{arcId}/revisions/{revisionId}/share`<br>`GET /api/staff/arcs/{arcId}`             | `/staff/record-form` 이 아직 로컬 폼입니다. Arc 생성·재생성·전송·미리보기를 붙이려면 폼 제출 흐름부터 서버 기준으로 다시 짜야 합니다.                                                           |
| `POST /api/staff/visits/{visitId}/visit-memories`<br>`POST /api/staff/visit-memories/{id}/regenerations`<br>`POST /api/staff/visit-memories/{id}/share`<br>`GET /api/staff/visit-memories/{id}` | 위와 같은 이유. Visit Memory 쪽도 `/staff/record-form` 에서 시작합니다.                                                                                                                         |

---

## 안 붙은 것 — 화면은 있는데 엔드포인트가 없음

| 화면                             | 지금 상태                 | 없는 것                                                                                                                                                                  |
| -------------------------------- | ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `/home` 고객 홈                  | `@constants/home` 고정값  | 브랜드 콘텐츠(`Now On`, `About MCM`, `MCM Myself`)를 내려주는 엔드포인트가 스펙에 하나도 없습니다.                                                                       |
| `/staff/dashboard` 지난 Arc 기록 | **줄이 사라졌습니다**     | `GET /api/staff/visits` 는 _현재 방문 중인_ 고객만 줍니다. 지난 날짜의 Arc 기록을 받을 엔드포인트가 없어 `ArcRecordCard` 섹션을 뺐습니다. 날짜 묶음도 오늘 하루뿐입니다. |
| `/staff/customer-detail`         | `@constants/visit` 고정값 | 고객 한 명의 프로필·그날 기록을 조회하는 엔드포인트가 없습니다.                                                                                                          |
| `/arc` Initial setup 팝업        | `@constants/arc` 고정값   | 고객이 온보딩에서 넣은 값을 되읽는 엔드포인트가 없습니다. 보낸 적은 있어도 받아올 곳이 없습니다.                                                                         |
| `/studio`                        | 로컬 데모                 | 매거진 생성 API 가 없습니다.                                                                                                                                             |

---

## 막힌 것 — 서버 쪽에 필요한 일

붙일 코드는 다 있는데 서버 때문에 끝까지 안 가는 것들입니다.

### 1. `GET /api/staff/visits` 가 500 을 냅니다 <sup>(치명 · 새로 생김)</sup>

```
$ curl -b staffToken=… https://mcmorbit.p-e.kr/api/staff/visits
{"success":false,"error":{"code":"COMMON-500","message":"서버 내부 오류가 발생했습니다.","fieldErrors":[]}}
```

쿠키 없이 부르면 `STAFF-401` 이 제대로 오므로 인증 문제는 아닙니다. 방금 등록한 직원이든
이미 고객을 배정받은 직원이든 똑같이 500 입니다.

**직원 홈의 전부**가 이 목록이라 대시보드가 빈 화면이 됩니다. 응대 시작(`assignment`) 자체는
직접 부르면 정상 동작하므로, 목록만 고쳐지면 직원 쪽 흐름이 바로 이어집니다.

### 2. CORS — 본 배포는 뚫렸고, 미리보기와 로컬이 남았습니다

서버에 CORS 허용 목록이 생겼습니다. **본 배포 주소는 등록돼 있어 웹이 정상 동작합니다.**
목록에 없는 출처는 403 `Invalid CORS request` 로 끊깁니다.

| 출처                                      | 무엇                         | 결과             |
| ----------------------------------------- | ---------------------------- | ---------------- |
| `https://mcm-orbit-n34.pages.dev`         | 본 배포                      | **200** — 등록됨 |
| `https://develop.mcm-orbit-n34.pages.dev` | `develop` 브랜치 미리보기    | 403 — 등록 필요  |
| `http://localhost:8081`                   | 로컬 웹 개발 (`npm run web`) | 403 — 등록 필요  |

등록된 출처에는 필요한 헤더가 모두 옵니다.

```
Access-Control-Allow-Origin: https://mcm-orbit-n34.pages.dev
Access-Control-Allow-Credentials: true
Access-Control-Allow-Methods: GET,POST,PUT,PATCH,DELETE,OPTIONS
```

쿠키도 `Secure; HttpOnly; SameSite=None` 으로 잘 내려옵니다. **지난번 CORS 문제는 사실상 해결됐습니다.**

**남은 요청** — 백엔드 허용 목록에 두 줄만 더 넣어 주세요.

- `https://develop.mcm-orbit-n34.pages.dev` — `develop` 에 올린 것을 웹에서 확인할 수 없습니다.
- `http://localhost:8081` — 로컬에서 `npm run web` 으로 띄운 화면이 API 를 못 부릅니다.
  (지금은 웹으로 개발하려면 매번 배포해야 합니다.)

쿠키를 쓰므로 `Access-Control-Allow-Origin` 에 `*` 는 쓸 수 없고 출처를 하나씩 명시해야 합니다.
iOS/Android 는 CORS 대상이 아니라 영향 없습니다.

### 3. 방문 목록에 없는 값 두 가지

`GET /api/staff/visits` 로는 시안의 카드를 다 채우지 못합니다. (목록이 500 인 것과는 별개 문제입니다.)

- **응대 시작 시각** — 시안은 `응대중・08:24` 인데 시각 필드가 없어 `응대중` 만 나옵니다.
  (`POST .../assignment` 응답에는 `matchedAt` 이 있는데 목록에는 없습니다.)
- **방문 날짜** — 날짜 필드가 없어 날짜 머리글에 오늘 날짜를 그립니다.

### 4. 편지를 고객 언어로 써서 내려주세요

`GET /api/customers/arcs/{arcId}` 의 `momentSummary` `preferences` `momentToRemember` 는 문자열 하나입니다.
**이 모양이 맞습니다.** 필요한 것은 언어별 묶음이 아니라 **그 한 문장이 고객이 고른 언어로 오는 것** 입니다.

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
있습니다) 한 방문 안에서는 절대 어긋나지 않습니다. 옛 Arc 까지 지금 언어로 보여 주고 싶다면
조회할 때 언어를 받는 방식(`?lang=` 같은)이 필요한데, 그건 서버가 요청마다 번역해야 해서 더 비쌉니다.
**지금은 방문 언어로 한 번 써서 굳히는 쪽을 권합니다.**

같은 이야기가 Visit Memory 에도 그대로 적용됩니다 — `VisitMemoryDetail.summary` 도 문자열 하나입니다.

### 5. Arc 목록에 매장 이름이 없습니다

봉투 겉면에 매장 이름이 적히는데 `GET /api/customers/arcs` 에는 `storeName` 이 없고 상세에만 있습니다.
그래서 목록을 받은 뒤 **각 Arc 의 상세를 모두 불러** 한 벌로 합칩니다(`useCustomerArcEntries()`).
봉투를 눌렀을 때 편지가 바로 나와야 하는 이유도 있어 지금은 이게 낫지만, Arc 가 많아지면 요청 수가 함께 늘어납니다.
목록에 `storeName` 이 들어가고 편지 본문까지 오면 상세 호출을 없앨 수 있습니다.

### 풀린 것 (지난 기록)

| 지난 문제                              | 지금                                                                 |
| -------------------------------------- | -------------------------------------------------------------------- |
| `POST /api/customers/visits` 가 500    | 201 로 쿠키를 심어 줍니다. 고객 로그인이 정상 동작합니다.            |
| 쿠키에 `SameSite=None; Secure` 가 없음 | 붙어서 옵니다.                                                       |
| 웹이 CORS 로 통째로 막힘               | 본 배포 주소가 허용됐습니다. 미리보기·로컬만 남았습니다.             |
| `serviceLanguage` 에 `KO` 가 없음      | 추가됐습니다. 다섯 언어가 하나씩 짝을 이룹니다.                      |
| 매장을 찾을 방법이 없음                | `GET /api/stores` 로 검색합니다. 임시 환경 변수는 지웠습니다.        |
| 고객이 배정을 확인할 방법이 없음       | `GET /api/customers/visits/{visitId}/matching` 을 되물어 확인합니다. |

---

## 사람이 확인해야 할 것

에이전트는 `typecheck` / `lint` / `format` 까지만 봅니다. 아래는 화면을 띄워 눈으로 봐야 합니다.

> **웹으로 확인한다면 본 배포([mcm-orbit-n34.pages.dev](https://mcm-orbit-n34.pages.dev/))에서 보세요.**
> `develop` 미리보기와 로컬 `npm run web` 은 아직 CORS 허용 목록에 없어 API 가 전부 막힙니다.
> 네이티브(Expo Go / 시뮬레이터)는 CORS 와 무관하니 어디서 띄우든 됩니다.

- **`/staff/login` 의 `Working At`** — 칸을 누르면 매장 목록이 아래로 펼쳐지고(지금 서버에는
  `MCM Seoul` 한 곳뿐입니다), 글자를 치면 걸러집니다. 하나를 고르면 목록이 접히고 칸에 이름이 남으며,
  그때부터 `Start to Journey` 가 눌립니다. 고른 뒤 다시 글자를 고치면 선택이 풀려 버튼이 잠깁니다.
- **`/matching`** — 고객이 `직원의 추천을 받고 싶어요` 로 로그인하면 대기 화면에 머뭅니다.
  다른 기기(또는 브라우저 창)에서 직원으로 로그인해 `응대 시작` 을 누르면, 2 초 안에 고객 화면이
  홈으로 넘어갑니다. **단, `GET /api/staff/visits` 가 500 이라 직원 홈에 카드가 뜨지 않아
  지금은 이 확인을 끝까지 할 수 없습니다.** 목록이 고쳐진 뒤 확인해 주세요.
- **`/matching` 실패 표시** — 기내 모드처럼 연결을 끊으면 대기 문구 자리에 `매칭 상태를 확인하지
못했습니다.` 와 `다시 시도` 버튼이 뜹니다.
- **직원 홈 카드의 언어** — 한국어로 로그인한 고객이 `English` 가 아니라 `한국어` 로 보여야 합니다.

---

## 스펙이 바뀌면

```bash
curl -s https://mcmorbit.p-e.kr/v3/api-docs -o /tmp/api-docs.json
```

받은 JSON 을 `openapi.yaml` 로 옮기고, 손으로 채운 네 가지(`info`, `servers`, `securitySchemes`,
`ApiErrorResponse`/`ApiFieldError`)를 다시 얹습니다. springdoc 이 자동 생성하는 원본에는 그것들이 없습니다.
