import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AppProviders } from '@components/common/app-providers';
import { MobileFrame } from '@components/common/mobile-frame';
import { useBrandFonts } from '@hooks/use-brand-fonts';
import { useColorScheme } from '@hooks/use-color-scheme';

// 글꼴을 기다리는 동안 스플래시 화면을 붙잡아 둡니다. 그냥 두면 자동으로 사라져
// 아래 `return null` 구간이 빈 화면으로 보입니다.
// 훅 안에서 부르면 이미 사라진 뒤라 늦습니다. 모듈 최상단에서 await 없이 부릅니다.
// 웹에서는 이 API 들이 아무 일도 하지 않습니다.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const fontsReady = useBrandFonts();

  // 글꼴이 준비된 화면을 한 번 그린 뒤에 스플래시를 내립니다.
  useEffect(() => {
    if (fontsReady) {
      SplashScreen.hideAsync();
    }
  }, [fontsReady]);

  // 글꼴을 등록하기 전에 그리면 시스템 글꼴로 한 번 깜빡입니다.
  // 네이티브는 이 동안 스플래시 화면이 떠 있고, 웹은 곧바로 true 라 지연이 없습니다.
  if (!fontsReady) {
    return null;
  }

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
