import { useEffect } from 'react';
import { useFonts } from 'expo-font';
import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AppProviders } from '@components/common/app-providers';
import { MobileFrame } from '@components/common/mobile-frame';
import { FontFamily } from '@constants/theme';
import { useColorScheme } from '@hooks/use-color-scheme';
import DMSansRegular from '@assets/fonts/DMSans-Regular.ttf';
import LibreBaskervilleRegular from '@assets/fonts/LibreBaskerville-Regular.ttf';
import LibreBaskervilleSemiBold from '@assets/fonts/LibreBaskerville-SemiBold.ttf';

// 폰트가 준비되기 전의 빈 화면이 노출되지 않도록 네이티브 스플래시를 붙잡아 둡니다.
SplashScreen.preventAutoHideAsync().catch(() => {
  // 이미 숨겨졌거나 지원하지 않는 플랫폼이면 무시합니다.
});

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [fontsLoaded, fontError] = useFonts({
    [FontFamily.displayRegular]: LibreBaskervilleRegular,
    [FontFamily.displaySemiBold]: LibreBaskervilleSemiBold,
    [FontFamily.labelRegular]: DMSansRegular,
  });

  // 폰트 로딩이 끝나면(실패해도) 네이티브 스플래시를 내립니다.
  useEffect(() => {
    if (!fontsLoaded && !fontError) return;

    SplashScreen.hideAsync().catch(() => {
      // 이미 숨겨졌으면 무시합니다.
    });
  }, [fontsLoaded, fontError]);

  // 폰트를 못 불러와도 앱을 막지 않습니다. 시스템 서체로 대체되어 그려집니다.
  if (!fontsLoaded && !fontError) return null;

  return (
    <AppProviders>
      <SafeAreaProvider>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <MobileFrame>
            <Stack screenOptions={{ headerShown: false }} />
          </MobileFrame>
          <StatusBar style="auto" />
        </ThemeProvider>
      </SafeAreaProvider>
    </AppProviders>
  );
}
