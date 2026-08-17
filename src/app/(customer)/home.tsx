import { useState } from 'react';
import { StyleSheet, Text } from 'react-native';

import type { NavTabId } from '@/types/navigation';
import { ScreenContainer } from '@components/common/screen-container';
import { BottomNavBar } from '@components/customer/bottom-nav-bar';
import { useThemeColors } from '@hooks/use-theme-colors';

/** 고객 홈 화면 — `/home` */
export default function CustomerHomeScreen() {
  const colors = useThemeColors();
  // /arc, /studio 라우트가 아직 없어 지금은 화면 안에서만 선택 상태를 들고 있습니다.
  const [activeTab, setActiveTab] = useState<NavTabId>('home');

  return (
    <ScreenContainer style={styles.stage}>
      <Text style={[styles.title, { color: colors.text }]}>Hello World</Text>
      <Text style={[styles.route, { color: colors.textSecondary }]}>/home</Text>

      <BottomNavBar activeTab={activeTab} onTabChange={setActiveTab} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  stage: {
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
  },
  route: {
    fontSize: 14,
  },
});
