/// <reference types="expo/types" />

// Expo 가 제공하는 전역 타입(CSS 에셋 import, 환경 변수)을 불러옵니다.
// 같은 참조가 담긴 `expo-env.d.ts` 는 dev 서버를 띄워야 생성되고 gitignore 대상이라,
// CI 에서 `tsc --noEmit` 이 바로 돌 수 있도록 이 파일을 커밋해 둡니다.

// Metro 는 이미지·폰트를 에셋 모듈로 번들하지만 TypeScript 는 그 사실을 모릅니다.
// `expo/types` 도 CSS 만 선언하고 있어, 에셋 import 타입을 여기서 직접 채웁니다.
// 네이티브에서는 에셋 레지스트리의 숫자 ID 로, 웹에서는 URL 로 해석되며
// 두 경우 모두 React Native 의 `ImageRequireSource` 가 받아줍니다.
declare module '*.png' {
  const asset: import('react-native').ImageRequireSource;
  export default asset;
}

declare module '*.jpg' {
  const asset: import('react-native').ImageRequireSource;
  export default asset;
}

declare module '*.svg' {
  const asset: import('react-native').ImageRequireSource;
  export default asset;
}

declare module '*.ttf' {
  const asset: import('react-native').ImageRequireSource;
  export default asset;
}
