import { StyleSheet, Text } from 'react-native';

import { ScreenContainer } from '@components/common/screen-container';
import { useThemeColors } from '@hooks/use-theme-colors';

/** 고객 상품 화면 — `/product` */
export default function CustomerProductScreen() {
  const colors = useThemeColors();

  return (
    <ScreenContainer>
      <Text style={[styles.title, { color: colors.text }]}>Hello World</Text>
      <Text style={[styles.route, { color: colors.textSecondary }]}>/product</Text>
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
