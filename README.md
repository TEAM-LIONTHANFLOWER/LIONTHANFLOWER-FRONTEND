<div align="center">

<img src="./assets/images/mcm-orbit.png" alt="MCM Orbit — 순간을 넘어 과정을 기록하는 럭셔리 매장 경험 서비스" width="100%" />

### 순간을 넘어 과정을 기록하는 럭셔리 매장 경험 서비스

14기 멋사대학 중앙해커톤 · 수원대학교 **꽃보다사자팀** 출품작

<br />

<img src="https://img.shields.io/badge/Expo_SDK-54-000000?style=flat-square&logo=expo&logoColor=white" alt="Expo SDK 54" />
<img src="https://img.shields.io/badge/React_Native-0.81-000000?style=flat-square&logo=react&logoColor=white" alt="React Native 0.81" />
<img src="https://img.shields.io/badge/React-19.1-000000?style=flat-square&logo=react&logoColor=white" alt="React 19.1" />
<img src="https://img.shields.io/badge/TypeScript-5.9_strict-000000?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript 5.9 strict" />
<img src="https://img.shields.io/badge/expo--router-6-000000?style=flat-square&logo=expo&logoColor=white" alt="expo-router 6" />
<img src="https://img.shields.io/badge/Cloudflare_Pages-000000?style=flat-square&logo=cloudflare&logoColor=white" alt="Cloudflare Pages" />

<br />
<br />

**[본 배포 열기](https://mcm-orbit.site/)** · [develop 미리보기](https://develop.mcm-orbit-n34.pages.dev/) · [작업 규칙](./AGENTS.md) · [API 연동](./docs/api-integration.md)

</div>

---

## 서비스 소개

매장에서 오간 순간을 **직원이 기록으로 남기고**, **고객이 그 기록을 다시 펼쳐 보는** 앱입니다.

한 코드베이스에 고객용과 직원용 화면이 함께 들어 있고, **iOS · Android · 웹**을 같은 코드로 빌드합니다.
웹은 Cloudflare 에 정적 배포하므로 설치 없이 링크만으로 바로 볼 수 있습니다.

## 화면

고객 화면이 앱의 기본 진입점이라 URL 접두사가 없고, 직원 화면만 `/staff` 아래에 있습니다.

<table>
<tr><td valign="top" width="50%">

**고객**

| 경로          | 화면                                  |
| ------------- | ------------------------------------- |
| `/`           | 진입 — 스플래시 뒤 온보딩 또는 로그인 |
| `/onboarding` | 온보딩 (고객·직원 공통)               |
| `/login`      | 고객 정보 입력                        |
| `/matching`   | 매칭 대기                             |
| `/home`       | 홈                                    |
| `/arc`        | Arc                                   |
| `/studio`     | Studio                                |
| `/product`    | 상품                                  |

</td><td valign="top" width="50%">

**직원**

| 경로                     | 화면                                   |
| ------------------------ | -------------------------------------- |
| `/staff`                 | 진입 — 로그인이 살아 있으면 대시보드로 |
| `/staff/login`           | 직원 정보 입력                         |
| `/staff/dashboard`       | 홈                                     |
| `/staff/customer-detail` | 고객 상세                              |
| `/staff/record-form`     | 기록 작성                              |
| `/staff/record-complete` | 기록 작성 완료                         |

</td></tr>
</table>

## 시작하기

```bash
npm install
cp .env.example .env   # Windows: copy .env.example .env
npm start
```

터미널에 뜨는 QR 코드를 **Expo Go** 앱으로 찍으면 실기기에서 바로 확인할 수 있습니다.
플랫폼을 지정해 실행하려면:

```bash
npm run android
npm run ios       # macOS 필요
npm run web
```

## 스크립트

| 명령                 | 설명                                         |
| -------------------- | -------------------------------------------- |
| `npm start`          | 개발 서버 실행                               |
| `npm run typecheck`  | 타입 검사 (`tsc --noEmit`)                   |
| `npm run lint`       | ESLint 검사                                  |
| `npm run lint:fix`   | ESLint 자동 수정                             |
| `npm run format`     | Prettier 포매팅                              |
| `npm run build:web`  | 웹 정적 빌드 → `dist/`                       |
| `npm run deploy:web` | Cloudflare Pages 배포 (wrangler 로그인 필요) |

> PR 을 올리기 전에 `typecheck` · `lint` · `format` 세 개를 돌립니다. CI 에서 그대로 돌아갑니다.

## 기술 스택

| 무엇       | 쓰는 것                                                    |
| ---------- | ---------------------------------------------------------- |
| 앱         | React Native 0.81 · Expo SDK 54 · React 19.1               |
| 라우팅     | expo-router (파일 기반, 타입 안전 라우트)                  |
| 언어       | TypeScript (`strict: true`)                                |
| 서버 상태  | TanStack Query v5                                          |
| 전역 상태  | Zustand v5                                                 |
| 스타일     | React Native `StyleSheet` + `@constants/theme` 디자인 토큰 |
| 애니메이션 | Reanimated · `Animated`                                    |
| 배포       | Cloudflare Pages                                           |

## 환경 변수

`.env.example` 을 `.env` 로 복사해서 사용합니다. `EXPO_PUBLIC_` 접두사가 붙은 값만 앱 번들에 주입되며,
빌드 시점에 그대로 인라인되므로 **비밀키는 넣지 않습니다.**

## 프로젝트 구조와 컨벤션

브랜치 전략, 커밋 메시지, 폴더 구조, import alias 규칙은 [AGENTS.md](./AGENTS.md) 를 참고하세요.

## 웹 배포 (Cloudflare)

| 주소                                                                        | 무엇                      |
| --------------------------------------------------------------------------- | ------------------------- |
| [mcm-orbit-n34.pages.dev](https://mcm-orbit-n34.pages.dev/)                 | 본 배포                   |
| [develop.mcm-orbit-n34.pages.dev](https://develop.mcm-orbit-n34.pages.dev/) | `develop` 브랜치 미리보기 |

```bash
npm run build:web              # dist/ 생성
npx wrangler pages deploy dist # 최초 실행 시 wrangler login 필요
```

> 백엔드가 쿠키 인증이라 **웹은 서버의 CORS 허용 목록에 출처가 등록돼야** 동작합니다.
> 본 배포·`develop` 미리보기·로컬(`http://localhost:8081`) 셋 다 등록돼 있어 어디서 띄워도 API 가 붙습니다.
> 자세한 것은 [docs/api-integration.md](./docs/api-integration.md) 참고.

Cloudflare 대시보드에서 Git 연동으로 자동 배포할 경우:

- Build command: `npm run build:web`
- Build output directory: `dist`

## 문서

| 문서                                                         | 내용                    |
| ------------------------------------------------------------ | ----------------------- |
| [AGENTS.md](./AGENTS.md)                                     | 작업 규칙 · 코드 컨벤션 |
| [docs/api-integration.md](./docs/api-integration.md)         | 백엔드 연동 · 쿠키 인증 |
| [docs/openapi.yaml](./docs/openapi.yaml)                     | API 명세                |
| [docs/secure-store-impact.md](./docs/secure-store-impact.md) | 토큰 영구 저장 검토     |
| [docs/testing-adoption.md](./docs/testing-adoption.md)       | 테스트 도입 검토        |

## 팀

**꽃보다사자** · 수원대학교

| 역할     | 이름           |
| -------- | -------------- |
| Leader   | 김회윤         |
| PM       | 주호연         |
| Design   | 남주연         |
| Frontend | 김민영, 최재령 |
| Backend  | 김회윤, 김형진 |
