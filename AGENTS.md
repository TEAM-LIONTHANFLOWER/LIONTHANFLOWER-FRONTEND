# MCM Orbit — 작업 규칙

> **Expo 는 자주 바뀝니다.** 코드를 쓰기 전에 반드시 이 프로젝트가 쓰는 버전의 문서를 확인하세요:
> https://docs.expo.dev/versions/v57.0.0/

## 프로젝트 개요

고객용(`customer`)과 직원용(`staff`) 화면을 한 앱에 담는 React Native 앱입니다.
iOS / Android / 웹을 같은 코드베이스로 빌드하며, 웹은 Cloudflare 에 정적 배포합니다.

## 기술 스택

- **React Native 0.86 / Expo SDK 57 / React 19.2**
- **expo-router** — 파일 기반 라우팅 (`src/app/`), 타입 안전 라우트(`typedRoutes`) 켜짐
- **TypeScript** (`strict: true`)
- **서버 상태** — TanStack Query v5 (`@tanstack/react-query`)
- **전역 상태** — Zustand v5
- **스타일** — React Native `StyleSheet` + `@constants/theme` 디자인 토큰
- **웹 배포** — Cloudflare Pages/Workers (`npm run build:web` → `dist/`)

패키지 매니저는 **npm** 입니다. `yarn` / `pnpm` 을 섞어 쓰지 않습니다.

## 주요 명령어

```bash
# 개발
npm start                # 개발 서버 (Metro). QR 을 Expo Go 로 스캔
npm run android          # Android 로 실행
npm run ios              # iOS 로 실행 (macOS 필요)
npm run web              # 웹으로 실행

# 코드 품질 — PR 올리기 전 필수
npm run typecheck        # tsc --noEmit
npm run lint             # ESLint
npm run lint:fix         # ESLint 자동 수정
npm run format           # Prettier 포매팅
npm run format:check     # 포매팅 검사 (CI 와 동일)

# 빌드 / 배포
npm run build:web        # 웹 정적 빌드 → dist/
npm run deploy:web       # Cloudflare Pages 배포
```

## 디렉터리 구조

```
src/
├── app/                  # 화면과 레이아웃만. 그 외 코드는 넣지 않습니다.
│   ├── _layout.tsx       # 루트 레이아웃 (SafeArea + 테마 + Stack)
│   ├── (customer)/       # 고객용 화면 → URL 은 `/` 부터
│   └── staff/            # 직원용 화면 → URL 은 `/staff` 부터
├── components/
│   ├── common/           # 양쪽에서 함께 쓰는 컴포넌트
│   ├── customer/         # 고객용 전용
│   └── staff/            # 직원용 전용
├── constants/            # 디자인 토큰(theme), 설정값(config)
├── hooks/                # 재사용 훅 + 쿼리 훅
├── services/             # api.ts, query-client.ts 등 서버 통신
├── stores/               # Zustand 전역 스토어
└── types/                # 모든 타입 정의
assets/                   # 이미지, 폰트
```

**URL 매핑**

`(customer)` 처럼 괄호로 감싼 폴더는 **라우트 그룹**입니다. 폴더 구조는 유지되지만 URL 에는 나타나지 않습니다.

| 파일                            | URL                      |
| ------------------------------- | ------------------------ |
| `app/(customer)/index.tsx`      | `/`                      |
| `app/(customer)/login.tsx`      | `/login`                 |
| `app/(customer)/home.tsx`       | `/home`                  |
| `app/(customer)/product.tsx`    | `/product`               |
| `app/staff/index.tsx`           | `/staff`                 |
| `app/staff/login.tsx`           | `/staff/login`           |
| `app/staff/dashboard.tsx`       | `/staff/dashboard`       |
| `app/staff/customer-detail.tsx` | `/staff/customer-detail` |

고객 화면이 앱의 기본 진입점이라 URL 접두사가 없습니다. 직원 화면만 `/staff` 아래에 둡니다.

**폴더 선택 기준**

- 화면 하나에서만 쓰는 컴포넌트 → `components/customer/` 또는 `components/staff/`
- 두 역할이 함께 쓰면 → `components/common/`
- 화면이 아닌 코드를 `src/app/` 에 두지 않습니다. expo-router 가 라우트로 인식합니다.

## 핵심 파일

| 파일                                         | 역할                                           |
| -------------------------------------------- | ---------------------------------------------- |
| `src/services/api.ts`                        | 중앙 API 클라이언트 (타임아웃·토큰·`ApiError`) |
| `src/services/query-client.ts`               | React Query 기본 설정 (재시도·staleTime)       |
| `src/components/common/app-providers.tsx`    | 전역 Provider 모음                             |
| `src/stores/auth-store.ts`                   | 로그인 사용자·토큰 전역 상태                   |
| `src/constants/theme.ts`                     | 색상·간격·폰트 토큰                            |
| `src/constants/config.ts`                    | `API_BASE_URL` 등 환경 설정                    |
| `src/hooks/use-theme-colors.ts`              | 현재 색상 스킴에 맞는 팔레트                   |
| `src/components/common/screen-container.tsx` | 모든 화면의 최상위 래퍼                        |
| `src/app/_layout.tsx`                        | 루트 레이아웃                                  |

---

# 코드 컨벤션

## 언어

**코드는 영어, UI 라벨과 주석은 한국어.**

```tsx
// 로그인 실패 시 3회까지 재시도합니다.
const handleSubmit = async () => { ... };

<Text>로그인에 실패했습니다. 다시 시도해주세요.</Text>;
```

## 네이밍

- 파일명은 **kebab-case** — `customer-detail.tsx`, `use-theme-colors.ts`
- 컴포넌트·타입은 **PascalCase**, 함수·변수는 **camelCase**, 상수는 **UPPER_SNAKE_CASE**
- 훅은 `use` 로 시작 — `useThemeColors`

## Import 와 alias

**상대경로 `../` 금지.** 절대경로 alias 를 씁니다 (ESLint 가 막습니다).

| alias           | 경로               |
| --------------- | ------------------ |
| `@/*`           | `src/*`            |
| `@app/*`        | `src/app/*`        |
| `@components/*` | `src/components/*` |
| `@constants/*`  | `src/constants/*`  |
| `@hooks/*`      | `src/hooks/*`      |
| `@services/*`   | `src/services/*`   |
| `@stores/*`     | `src/stores/*`     |
| `@assets/*`     | `assets/*`         |

> 타입만 예외적으로 **`@/types/...`** 로 가져옵니다.
> `@types/*` alias 는 만들 수 없습니다 — TypeScript 가 `@types/` 로 시작하는 import 를
> 타입 선언 패키지(`@types/react` 등)로 간주해 거부합니다 (TS6137).

import 순서는 **외부 패키지 → 내부 alias** 이고, 그 사이에 빈 줄을 둡니다.

```tsx
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';

import { ScreenContainer } from '@components/common/screen-container';
import { useThemeColors } from '@hooks/use-theme-colors';
import { api } from '@services/api';
import type { Customer } from '@/types/user';
```

## Export 규칙

- **`src/app/**` 라우트 파일은 `export default` 필수** — expo-router 요구사항입니다.
- **그 외 컴포넌트·훅·유틸은 named export** 를 씁니다. 자동 완성과 리네임에 유리합니다.

```tsx
// src/app/(customer)/login.tsx — 라우트
export default function CustomerLoginScreen() { ... }

// src/components/common/screen-container.tsx — 컴포넌트
export function ScreenContainer({ children }: ScreenContainerProps) { ... }
```

## 타입

**도메인 타입은 반드시 `src/types/` 에 정의**하고 import 해서 씁니다. 화면 파일 안에 흩뿌리지 않습니다.
컴포넌트 Props 타입은 예외로, 쓰는 파일 안에 둡니다.

```tsx
// src/types/user.ts — 도메인 타입
export interface Customer extends BaseUser { ... }

// src/components/customer/customer-card.tsx — Props 는 파일 안에
interface CustomerCardProps {
  customer: Customer;
  onPress?: () => void;
}
```

`any` 를 쓰지 않습니다. 모르는 값은 `unknown` 으로 받고 좁혀서 씁니다.

## 컴포넌트 구조

파일 안에서 이 순서를 지킵니다.

```tsx
// 1. import (외부 → 내부)
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useThemeColors } from '@hooks/use-theme-colors';
import { Spacing } from '@constants/theme';
import type { Customer } from '@/types/user';

// 2. Props 타입
interface CustomerCardProps {
  customer: Customer;
  onPress?: () => void;
}

// 3. 컴포넌트
export function CustomerCard({ customer, onPress }: CustomerCardProps) {
  // 3-1. 훅을 가장 먼저
  const colors = useThemeColors();
  const [isExpanded, setIsExpanded] = useState(false);

  // 3-2. 이벤트 핸들러
  const handlePress = () => {
    setIsExpanded((prev) => !prev);
    onPress?.();
  };

  // 3-3. 렌더
  return (
    <Pressable style={styles.card} onPress={handlePress}>
      <Text style={[styles.name, { color: colors.text }]}>{customer.name}</Text>
    </Pressable>
  );
}

// 4. 스타일은 파일 맨 아래
const styles = StyleSheet.create({
  card: { padding: Spacing.three },
  name: { fontSize: 16, fontWeight: '600' },
});
```

## 스타일

**정적 스타일은 인라인으로 쓰지 않습니다.** `StyleSheet.create` 로 파일 맨 아래에 모읍니다.

```tsx
// ❌ 정적 값을 인라인으로
<View style={{ gap: 12, padding: 16 }} />

// ✅ StyleSheet 로
<View style={styles.actions} />

// ✅ 테마 색상처럼 런타임에 정해지는 값만 배열로 합성
<View style={[styles.card, { backgroundColor: colors.background }]} />
```

- **간격·색상은 `@constants/theme` 토큰을 씁니다.** 매직 넘버(`padding: 13`) 금지.
- 색상은 `useThemeColors()` 로 가져옵니다. 다크 모드가 자동으로 따라옵니다.
- 화면 최상위는 `ScreenContainer` 로 감쌉니다. SafeArea·배경색·최대 너비를 처리합니다.
- 반응형이 필요하면 `useWindowDimensions()` 를 씁니다.
- 플랫폼 분기는 `Platform.select()` 또는 파일 분리(`*.web.tsx`, `*.ios.tsx`)로 합니다.

## 라우팅

expo-router 의 파일 기반 라우팅을 씁니다. 별도 라우트 상수 파일을 두지 않습니다 —
`typedRoutes` 가 켜져 있어 경로 문자열이 타입 체크됩니다.

```tsx
import { Link, useRouter } from 'expo-router';

// 선언적 이동
<Link href="/login">로그인</Link>;

// 명령형 이동
const router = useRouter();
router.push('/staff/dashboard');
router.back();
```

- **경로에 `(customer)` 를 넣지 않습니다.** 라우트 그룹은 URL 에 나타나지 않습니다.
  고객 화면은 `/login`, 직원 화면은 `/staff/login` 입니다.
- 그룹 레이아웃이 필요하면 해당 폴더에 `_layout.tsx` 를 추가합니다.

## API 연동

**모든 네트워크 요청은 `@services/api` 를 거칩니다.** 화면에서 `fetch` 를 직접 부르지 않습니다.

```tsx
import { ApiError, api } from '@services/api';
import type { Customer } from '@/types/user';

const profile = await api.get<Customer>('/customers/me');
const created = await api.post<Customer>('/customers', { body: { name } });
```

- **`async` / `await` 를 씁니다.** `.then()` 체이닝을 쓰지 않습니다.
- 실패는 `ApiError` 로 던져집니다. `status` 와 `code` 로 분기합니다.

```tsx
try {
  await api.post('/auth/login', { body: { email, password } });
} catch (error) {
  if (error instanceof ApiError && error.status === 401) {
    setErrorMessage('이메일 또는 비밀번호가 올바르지 않습니다.');
    return;
  }
  throw error;
}
```

- 응답 타입은 `@/types/` 에 정의하고 제네릭으로 넘깁니다.
- 인증 토큰은 `setAuthToken()` 으로 등록합니다. 요청마다 헤더를 직접 붙이지 않습니다.
- 환경 변수는 `EXPO_PUBLIC_` 접두사가 붙은 것만 앱에서 읽힙니다.
  값이 빌드에 그대로 인라인되므로 **비밀키는 넣지 않습니다.**

## 서버 상태 — React Query

**서버에서 온 데이터는 `useState` + `useEffect` 로 직접 관리하지 않습니다.** 전부 React Query 를 씁니다.
캐싱·재시도·중복 요청 제거·포그라운드 복귀 시 갱신이 이미 붙어 있습니다.

**쿼리 훅은 `src/hooks/` 에 화면이 아니라 리소스 단위로 만듭니다.**

```tsx
// src/hooks/use-customer-profile.ts
import { useQuery } from '@tanstack/react-query';

import { api } from '@services/api';
import type { Customer } from '@/types/user';

export const customerKeys = {
  all: ['customer'] as const,
  profile: () => [...customerKeys.all, 'profile'] as const,
  detail: (id: string) => [...customerKeys.all, 'detail', id] as const,
};

export function useCustomerProfile() {
  return useQuery({
    queryKey: customerKeys.profile(),
    queryFn: () => api.get<Customer>('/customers/me'),
  });
}
```

- **queryKey 는 문자열 배열을 직접 쓰지 말고 위처럼 key 팩토리로 만듭니다.** 오타와 무효화 누락을 막습니다.
- `queryFn` 안에서는 `@services/api` 만 부릅니다. 여기서 `fetch` 를 쓰지 않습니다.
- 재시도·`staleTime` 기본값은 `@services/query-client` 에 있습니다. 훅마다 다시 정하지 않습니다.
  (4xx 는 재시도하지 않고, 그 외는 2회까지 재시도합니다.)

**변경 요청은 `useMutation` 을 쓰고, 성공하면 관련 쿼리를 무효화합니다.**

```tsx
export function useUpdateCustomerProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: UpdateProfileRequest) => api.patch<Customer>('/customers/me', { body }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: customerKeys.profile() });
    },
  });
}
```

- 뮤테이션은 기본적으로 재시도하지 않습니다. 중복 결제·중복 생성을 막기 위해서입니다.
- 제출 버튼은 `isPending` 으로 비활성화합니다.

## 전역 상태 — Zustand

**서버 데이터는 React Query, 그 외 클라이언트 상태만 Zustand 입니다.** 둘을 섞지 않습니다.

- API 응답을 Zustand 에 복사해 두지 않습니다. 캐시가 두 벌이 되어 반드시 어긋납니다.
- Zustand 에 두는 것: 로그인 세션, 온보딩 진행 상태, 테마 설정처럼 **서버가 모르는 값.**
- 스토어는 `src/stores/` 에 도메인별 파일로 만듭니다.

```tsx
import { useAuthStore, useIsAuthenticated } from '@stores/auth-store';

// ✅ 셀렉터로 필요한 값만 구독 — 그 값이 바뀔 때만 리렌더링
const user = useAuthStore((state) => state.user);
const signOut = useAuthStore((state) => state.signOut);

// ❌ 스토어 전체를 구독 — 무엇이 바뀌든 리렌더링
const { user, signOut } = useAuthStore();
```

- **파생값은 상태로 저장하지 않고 셀렉터로 계산합니다.** (`useIsAuthenticated` 참고)
- 로그아웃 시 서버 캐시도 함께 비웁니다.

```tsx
signOut();
queryClient.clear();
```

## 로딩 · 에러 상태

**로딩과 에러 상태를 빼먹지 않습니다.** 데이터를 기다리는 화면에는 항상 셋 다 있어야 합니다.

```tsx
const { data, isPending, isError, refetch } = useCustomerProfile();

if (isPending) return <ActivityIndicator />;
if (isError) return <ErrorMessage onRetry={refetch} />;
return <CustomerList data={data} />;
```

expo-router 는 라우트/레이아웃 파일에서 `ErrorBoundary` 를 named export 하면
해당 서브트리의 렌더 에러를 잡아줍니다.

```tsx
import type { ErrorBoundaryProps } from 'expo-router';

export function ErrorBoundary({ error, retry }: ErrorBoundaryProps) {
  return <ErrorFallback message={error.message} onRetry={retry} />;
}
```

이미 있는 에러 처리와 fallback 을 **지우지 않습니다.**

## 접근성

- 누를 수 있는 요소에는 `accessibilityRole` 과 `accessibilityLabel` 을 답니다.
- 아이콘만 있는 버튼은 반드시 `accessibilityLabel` 로 뜻을 알려줍니다.
- 터치 영역은 최소 44×44 를 확보합니다. 작으면 `hitSlop` 을 씁니다.

---

# 작업 흐름

```
ISSUE 생성 → feat/{ISSUE_NUMBER} 브랜치 생성 → 작업 → PR 생성(템플릿)
→ 코드리뷰(CodeRabbit + 팀원 1명) → develop 에 병합 → PR 종료
```

## 브랜치 규칙

**`develop` 과 `main` 에 직접 커밋하지 않습니다.** 병합은 PR 로만 합니다.

- base 브랜치는 항상 `develop`
- `main` 은 배포용. `develop` 에서만 올라갑니다.
- 브랜치명은 **타입 + 이슈 번호** — `feat/12`, `fix/34`, `refactor/56`
- feature 브랜치는 **squash and merge** 로 병합하고, 병합 후 삭제합니다.

## 커밋 메시지

```
{ISSUE_NUMBER} {Type}: 한국어로 최대한 설명

예) 12 feat: 고객 로그인 화면 폼 구현
    34 fix: 상품 목록 새로고침 시 중복 요청되는 문제 수정
```

타입: `feat` `fix` `refactor` `style` `chore` `docs`

## PR 올리기 전 체크

```bash
npm run typecheck
npm run lint
npm run format
```

세 개가 CI 에서 그대로 돌기 때문에, 통과하지 않으면 리뷰를 받을 수 없습니다.

## GitHub 라벨

`Feature` `Refactor` `API` `Bug` `Docs` `Style` — 정의는 `.github/labels.yml` 참고.

---

# 손대지 말 것

## 구조 · 설정

- **`src/services/api.ts` 의 요청·에러 처리 구조**를 팀 논의 없이 바꾸지 않습니다.
  엔드포인트 함수를 추가하는 것은 자유입니다.
- **`package.json` 의존성**을 상의 없이 추가·변경·삭제하지 않습니다.
- **`app.json`** 의 `plugins`, `experiments`, 아이콘·스플래시 경로를 임의로 바꾸지 않습니다.
- **`.github/`** 의 템플릿과 워크플로를 임의로 수정하지 않습니다.

## 코드 표준

- **TypeScript `strict` 모드를 끄지 않습니다.**
- **ESLint 규칙을 `eslint-disable` 로 끄지 않습니다.** 정말 필요하면 PR 본문에 이유를 적습니다.
- `npm run lint` 와 `npm run typecheck` 없이 커밋하지 않습니다.
- 에러 바운더리와 fallback 컴포넌트를 제거하지 않습니다.
- 접근성 속성을 빼지 않습니다.
- 명시적 합의 없이 AGENTS.md와 CLAUDE.md를 수정하지 않습니다.

## 디자인 시스템

- **`@constants/theme` 의 토큰 값을 덮어쓰지 않습니다.** 필요하면 새 토큰을 추가합니다.
- 새 컴포넌트를 만들기 전에 `components/common/` 에 이미 있는지 확인합니다.
- 다크 모드 대응을 건너뛰지 않습니다. 색상은 항상 `useThemeColors()` 로 가져옵니다.

---

# 아직 정하지 않은 것

아래는 **현재 설치되어 있지 않습니다.** 필요해지는 시점에 팀에서 결정하고, 도입하면 이 문서를 갱신합니다.

| 항목           | 후보                      | 현재 상태                                                                      |
| -------------- | ------------------------- | ------------------------------------------------------------------------------ |
| 토큰 영구 저장 | `expo-secure-store`       | 미설치. `signIn()` 한 토큰은 메모리에만 있어 **앱을 껐다 켜면 로그아웃됩니다** |
| 에러 추적      | Sentry                    | 미설치. 지금은 크래시가 남지 않습니다                                          |
| 테스트         | Jest + RN Testing Library | 미설치. CI 는 typecheck / lint / format 만 돌립니다                            |

> **토큰 영구 저장 주의** — `expo-secure-store` 는 **웹을 지원하지 않습니다** (Android / iOS / tvOS 전용).
> 우리는 웹도 배포하므로 도입할 때 `*.web.ts` 플랫폼 파일로 웹 전용 대체 저장소를 함께 만들어야 합니다.
