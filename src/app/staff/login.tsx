import { StyleSheet, Text } from 'react-native';

import { ScreenContainer } from '@components/common/screen-container';
import { useThemeColors } from '@hooks/use-theme-colors';

/** 직원 로그인 화면 — `/staff/login` */
export default function StaffLoginScreen() {
  const colors = useThemeColors();

  return (
    <ScreenContainer>
      <Text style={[styles.title, { color: colors.text }]}>Hello World</Text>
      <Text style={[styles.route, { color: colors.textSecondary }]}>/staff/login</Text>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 28,
    fontWeight: '700',
  },
  route: {
    fontSize: 14,
  },
});
