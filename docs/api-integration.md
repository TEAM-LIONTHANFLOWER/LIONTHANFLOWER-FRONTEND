# API 연동 현황

`https://mcmorbit.p-e.kr` 의 스펙 스냅숏은 [`openapi.yaml`](./openapi.yaml) 에 있습니다.
이 문서는 **그중 무엇이 화면에 붙었고 무엇이 안 붙었는지, 안 붙은 것은 왜인지** 를 적어 둡니다.

기준일: 2026-08-19 · 스펙 출처: `https://mcmorbit.p-e.kr/v3/api-docs`

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
안내(`login.startFailed`, `arc.loadFailed`)를 대신 보여줍니다. 직원 화면은 번역 대상이 아니라 한국어로 적습니다.

### 환경 변수

```bash
EXPO_PUBLIC_API_BASE_URL=https://mcmorbit.p-e.kr   # 경로에 /api 가 들어 있어 호스트까지만
EXPO_PUBLIC_DEFAULT_STORE_ID=                       # 직원 로그인용 매장 UUID. 아래 "막힌 것" 참고
```

---

## 붙은 것

| 화면                         | 엔드포인트                                                                        | 훅                          |
| ---------------------------- | --------------------------------------------------------------------------------- | --------------------------- |
| `/login` 고객 로그인         | `POST /api/customers/visits` → `PATCH /api/customers/visits/{visitId}/onboarding` | `useStartVisit()`           |
| `/arc` 고객 Arc              | `GET /api/customers/arcs` + `GET /api/customers/arcs/{arcId}`                     | `useCustomerArcEntries()`   |
| `/staff/login` 직원 로그인   | `POST /api/staff/me/profile` → `GET /api/staff/me/profile`                        | `useRegisterStaffProfile()` |
| `/staff/dashboard` 직원 홈   | `GET /api/staff/visits`                                                           | `useStaffVisits()`          |
| `/staff/dashboard` 응대 시작 | `POST /api/staff/visits/{visitId}/assignment`                                     | `useAssignVisit()`          |

로그인 두 개가 각각 두 번 호출인 이유는 서버가 그렇게 나눠 두었기 때문입니다.
고객은 `진입(쿠키 발급 + visitId)` → `온보딩 저장`, 직원은 `프로필 등록(쿠키 발급)` → `프로필 조회(staffId 획득)`.
화면에서는 `Start to Journey` 한 번에 일어나는 일이라 훅 하나로 묶었습니다.

### 세션은 어디에 있나

React Query 가 서버 데이터를 들고, Zustand 에는 **내가 누구인지** 만 둡니다.

- `@stores/visit-store` — 고객의 `visitId`·이름·상태
- `@stores/staff-store` — 직원 프로필

둘 다 메모리에만 있어 **앱을 껐다 켜면 로그아웃됩니다.** (`AGENTS.md` 의 "아직 정하지 않은 것" 참고)
쿠키는 네이티브에서 OS 쿠키 저장소에 남지만, 앱 쪽 세션 상태가 비어 있어 로그인 화면부터 다시 시작합니다.

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

| 화면                             | 지금 상태                  | 없는 것                                                                                                                                                                                                     |
| -------------------------------- | -------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/home` 고객 홈                  | `@constants/home` 고정값   | 브랜드 콘텐츠(`Now On`, `About MCM`, `MCM Myself`)를 내려주는 엔드포인트가 스펙에 하나도 없습니다.                                                                                                          |
| `/matching` 매칭 대기            | **3초 데모 타이머 그대로** | 고객이 자기 방문 상태를 다시 읽을 엔드포인트가 없습니다. 직원이 배정되면 `POST /api/staff/visits/{id}/assignment` 로 서버 상태는 바뀌지만, 고객 쪽에서 그걸 확인할 방법이 없어 폴링할 대상 자체가 없습니다. |
| `/staff/dashboard` 지난 Arc 기록 | **줄이 사라졌습니다**      | `GET /api/staff/visits` 는 _현재 방문 중인_ 고객만 줍니다. 지난 날짜의 Arc 기록을 받을 엔드포인트가 없어 `ArcRecordCard` 섹션을 뺐습니다. 날짜 묶음도 오늘 하루뿐입니다.                                    |
| `/staff/customer-detail`         | `@constants/visit` 고정값  | 고객 한 명의 프로필·그날 기록을 조회하는 엔드포인트가 없습니다.                                                                                                                                             |
| `/arc` Initial setup 팝업        | `@constants/arc` 고정값    | 고객이 온보딩에서 넣은 값을 되읽는 엔드포인트가 없습니다. 보낸 적은 있어도 받아올 곳이 없습니다.                                                                                                            |
| `/studio`                        | 로컬 데모                  | 매거진 생성 API 가 없습니다.                                                                                                                                                                                |

---

## 막힌 것 — 서버 쪽에 필요한 일

붙일 코드는 다 있는데 서버 때문에 끝까지 안 가는 것들입니다.

### 1. `POST /api/customers/visits` 가 500 을 냅니다 <sup>(치명)</sup>

```
$ curl -X POST https://mcmorbit.p-e.kr/api/customers/visits
{"success":false,"error":{"code":"COMMON-500","message":"서버 내부 오류가 발생했습니다.","fieldErrors":[]}}
```

**고객 로그인의 첫 단계**라 이게 막히면 고객 쪽 흐름 전체가 시작되지 않습니다.
쿠키가 안 발급되므로 `/arc` 도 401 입니다.

### 2. 웹에서 CORS 로 막힙니다

preflight 는 200 이지만 `Access-Control-Allow-Origin` 과 `Access-Control-Allow-Credentials` 헤더가
오지 않습니다. 쿠키 인증이라 이 둘이 없으면 브라우저가 요청을 버립니다.
**웹 배포가 우리 배포 방식**(Cloudflare)이라 반드시 필요합니다. iOS/Android 는 CORS 대상이 아니라 영향 없습니다.

- `Access-Control-Allow-Origin` 에 앱 출처를 **명시** (쿠키를 쓰면 `*` 는 못 씁니다)
- `Access-Control-Allow-Credentials: true`
- 쿠키에 `SameSite=None; Secure`

### 3. `serviceLanguage` 에 `KO` 가 없습니다

서버 enum 은 `EN` `ZH` `JA` `RU` 뿐인데 앱은 한국어를 포함해 다섯 언어를 보여줍니다.
지금은 한국어를 고른 고객을 `EN` 으로 보냅니다 — 직원에게 "영어로 응대하라"고 잘못 알리는 셈입니다.
`KO` 가 추가되면 `@constants/languages` 의 `SERVICE_LANGUAGE_BY_LOCALE` 한 줄만 고치면 됩니다.

직원 쪽은 더 눈에 띕니다. 한국어와 영어를 모두 고른 직원은 둘 다 `EN` 이 되어 값이 겹치는데
서버가 `uniqueItems` 를 요구해서, `toServiceLanguages()` 가 중복을 걷어내고 보냅니다.

### 4. 매장을 찾을 방법이 없습니다 <sup>(직원 로그인 차단)</sup>

`POST /api/staff/me/profile` 은 `storeId` 를 UUID 로 받는데, 매장을 검색하거나 목록으로 받아 올
엔드포인트가 스펙에 없습니다. `/staff/login` 의 `Working At` 은 자유 입력이라 화면에서 UUID 를 만들 수 없습니다.

**임시 조치** — `EXPO_PUBLIC_DEFAULT_STORE_ID` 에서 읽습니다. 값이 비어 있으면 버튼이 잠기고
화면에 그 이유가 뜹니다. 화면에 입력한 매장 이름은 서버로 가지 않습니다.
매장 조회 API 가 생기면 `@constants/config` 의 `DEFAULT_STORE_ID` 와 그것을 읽는 코드를 함께 지웁니다.

### 5. 방문 목록에 없는 값 두 가지

`GET /api/staff/visits` 로는 시안의 카드를 다 채우지 못합니다.

- **응대 시작 시각** — 시안은 `응대중・08:24` 인데 시각 필드가 없어 `응대중` 만 나옵니다.
  (`POST .../assignment` 응답에는 `matchedAt` 이 있는데 목록에는 없습니다.)
- **방문 날짜** — 날짜 필드가 없어 날짜 머리글에 오늘 날짜를 그립니다.

### 6. 편지가 한 언어로만 옵니다

`GET /api/customers/arcs/{arcId}` 의 `momentSummary` `preferences` `momentToRemember` 는 문자열 하나입니다.
화면은 `LocalizedText`(5개 언어)를 기대해서, 지금은 같은 문장을 다섯 언어에 복사해 넣습니다
(`use-customer-arcs.ts` 의 `asIs()`). 편지는 직원이 쓴 글이라 서버가 번역해 내려주거나 언어별로 저장해야 합니다.

### 7. Arc 목록에 매장 이름이 없습니다

봉투 겉면에 매장 이름이 적히는데 `GET /api/customers/arcs` 에는 `storeName` 이 없고 상세에만 있습니다.
그래서 목록을 받은 뒤 **각 Arc 의 상세를 모두 불러** 한 벌로 합칩니다(`useCustomerArcEntries()`).
봉투를 눌렀을 때 편지가 바로 나와야 하는 이유도 있어 지금은 이게 낫지만, Arc 가 많아지면 요청 수가 함께 늘어납니다.
목록에 `storeName` 이 들어가고 편지 본문까지 오면 상세 호출을 없앨 수 있습니다.

---

## 스펙이 바뀌면

```bash
curl -s https://mcmorbit.p-e.kr/v3/api-docs -o /tmp/api-docs.json
```

받은 JSON 을 `openapi.yaml` 로 옮기고, 손으로 채운 세 가지(`servers`, `securitySchemes`,
`ApiErrorResponse`)를 다시 얹습니다. springdoc 이 자동 생성하는 원본에는 그 셋이 없습니다.
