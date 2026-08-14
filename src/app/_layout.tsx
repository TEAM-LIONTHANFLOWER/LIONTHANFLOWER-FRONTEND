import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AppProviders } from '@components/common/app-providers';
import { useBrandFonts } from '@hooks/use-brand-fonts';
import { useColorScheme } from '@hooks/use-color-scheme';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const fontsReady = useBrandFonts();

  // 글꼴을 등록하기 전에 그리면 시스템 글꼴로 한 번 깜빡입니다.
  // 네이티브는 이 동안 스플래시 화면이 떠 있고, 웹은 곧바로 true 라 지연이 없습니다.
  if (!fontsReady) {
    return null;
  }

  return (
    <AppProviders>
      <SafeAreaProvider>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <Stack screenOptions={{ headerShown: false }} />
          <StatusBar style="auto" />
        </ThemeProvider>
      </SafeAreaProvider>
    </AppProviders>
  );
}
