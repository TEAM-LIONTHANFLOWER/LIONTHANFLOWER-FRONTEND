import { Stack } from 'expo-router';

/**
 * 고객용 화면 스택.
 * 폴더명이 괄호로 감싸여 있어 URL 에는 `(customer)` 가 나타나지 않습니다.
 * 즉 이 그룹의 index.tsx 가 `/` 입니다.
 */
export default function CustomerLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/*
        매칭 화면이 로고를 홈의 워드마크 자리까지 옮겨 놓고 넘어옵니다.
        여기서 화면 전환 효과를 한 번 더 주면 방금 맞춰 놓은 로고가 같이 밀려서 어긋나 보입니다.
        자세한 내용은 `matching.tsx` 참고.
      */}
      <Stack.Screen name="home" options={{ animation: 'none' }} />
    </Stack>
  );
}
