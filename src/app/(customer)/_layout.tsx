import { Stack } from 'expo-router';

/**
 * 고객용 화면 스택.
 * 폴더명이 괄호로 감싸여 있어 URL 에는 `(customer)` 가 나타나지 않습니다.
 * 즉 이 그룹의 index.tsx 가 `/` 입니다.
 */
export default function CustomerLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
