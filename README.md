# MCM Orbit

### 14기 멋사대학 중앙해커톤 수원대학교 꽃보다사자팀 출품작

React Native + Expo 기반 앱. 고객용(`customer`)과 직원용(`staff`) 화면을 함께 담습니다.

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

## 환경 변수

`.env.example` 을 `.env` 로 복사해서 사용합니다. `EXPO_PUBLIC_` 접두사가 붙은 값만 앱 번들에 주입되며,
빌드 시점에 그대로 인라인되므로 **비밀키는 넣지 않습니다.**

## 프로젝트 구조와 컨벤션

브랜치 전략, 커밋 메시지, 폴더 구조, import alias 규칙은 [AGENTS.md](./AGENTS.md) 를 참고하세요.

## 웹 배포 (Cloudflare)

```bash
npm run build:web              # dist/ 생성
npx wrangler pages deploy dist # 최초 실행 시 wrangler login 필요
```

Cloudflare 대시보드에서 Git 연동으로 자동 배포할 경우:

- Build command: `npm run build:web`
- Build output directory: `dist`
