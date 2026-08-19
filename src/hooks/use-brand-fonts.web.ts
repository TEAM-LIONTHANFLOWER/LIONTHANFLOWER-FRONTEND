/**
 * 웹은 `global.css` 의 `@font-face` 가 `public/fonts/` 의 woff2 를 불러옵니다.
 * (네이티브용 otf/ttf 보다 3배 가볍고, 브라우저가 알아서 캐시합니다.)
 *
 * 따라서 여기서는 기다릴 것이 없습니다. 네이티브 구현은 `use-brand-fonts.ts` 를 보세요.
 */
export function useBrandFonts(): boolean {
  return true;
}
