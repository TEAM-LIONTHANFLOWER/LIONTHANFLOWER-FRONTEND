import { useFonts } from 'expo-font';

/**
 * 브랜드 글꼴을 등록합니다. 루트 레이아웃에서 한 번만 부릅니다.
 *
 * 여기서 정한 키가 곧 `fontFamily` 이름이 됩니다.
 * `@constants/theme` 의 `FontFamily` 와 이름이 어긋나면 글꼴이 적용되지 않습니다.
 *
 * 네이티브는 굵기별로 다른 패밀리를 등록해야 합니다.
 * `fontWeight` 만으로 커스텀 글꼴의 Bold 를 고르지 못하기 때문입니다.
 *
 * 웹은 `global.css` 의 `@font-face` 가 대신 처리합니다 (`use-brand-fonts.web.ts` 참고).
 *
 * @returns 화면을 그려도 되는지 여부
 */
export function useBrandFonts(): boolean {
  const [loaded, error] = useFonts({
    Pretendard: require('@assets/fonts/Pretendard-Regular.otf'),
    'Pretendard-Bold': require('@assets/fonts/Pretendard-Bold.otf'),
    LibreBaskerville: require('@assets/fonts/LibreBaskerville-Regular.ttf'),
    'LibreBaskerville-SemiBold': require('@assets/fonts/LibreBaskerville-SemiBold.ttf'),
    'LibreBaskerville-Bold': require('@assets/fonts/LibreBaskerville-Bold.ttf'),
  });

  // 글꼴을 못 불러와도 화면은 띄웁니다. 시스템 대체 글꼴로 떨어질 뿐입니다.
  return loaded || error !== null;
}
