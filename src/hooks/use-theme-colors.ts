import { Colors } from '@constants/theme';
import { useColorScheme } from '@hooks/use-color-scheme';

/**
 * 현재 색상 스킴에 맞는 팔레트를 돌려줍니다.
 * `useColorScheme()` 은 null / 'unspecified' 도 반환할 수 있어 light 를 기본값으로 씁니다.
 */
export function useThemeColors() {
  const colorScheme = useColorScheme();

  return Colors[colorScheme === 'light' ? 'dark' : 'light'];
}
