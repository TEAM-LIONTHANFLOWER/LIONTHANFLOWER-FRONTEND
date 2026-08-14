import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';

import { ChoiceChips } from '@components/common/choice-chips';
import { OrbitLogo } from '@components/common/orbit-logo';
import { OutlinedTextField } from '@components/common/outlined-text-field';
import { ScreenContainer } from '@components/common/screen-container';
import { StartJourneyButton } from '@components/common/start-journey-button';
import { SERVICE_LANGUAGES } from '@constants/onboarding';
import { BrandColors, Spacing } from '@constants/theme';
import searchIcon from '@assets/images/login/search.svg';
import type { ServiceLanguageCode } from '@/types/onboarding';

/**
 * 시안(393×852) 의 세로 배치입니다.
 * 시안 좌표에서 상태 표시줄(59)을 뺀 값이라 안전 영역 아래를 기준으로 그대로 씁니다.
 */
const LOGO_TOP = 117;
const LOGO_TO_FORM = 58;
/** 입력과 버튼 사이 최소 간격. 화면이 남으면 버튼이 아래로 더 밀립니다. */
const FORM_TO_ACTION = 88;

/** 직원 정보 입력 화면 — `/staff/login` */
export default function StaffLoginScreen() {
  const router = useRouter();

  const [store, setStore] = useState('MCM HAUS');
  const [language, setLanguage] = useState<ServiceLanguageCode>('ko');
  const [name, setName] = useState('');

  const languageOptions = SERVICE_LANGUAGES.map((option) => ({
    value: option.code,
    label: option.label,
  }));
  const canStart = store.trim().length > 0 && name.trim().length > 0;

  const handleStart = useCallback(() => {
    router.replace('/staff/dashboard');
  }, [router]);

  return (
    <ScreenContainer backgroundColor={BrandColors.splashBackground} style={styles.stage}>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        automaticallyAdjustKeyboardInsets
      >
        <OrbitLogo style={styles.logo} />

        <View style={styles.form}>
          <OutlinedTextField
            label="Working At"
            required
            value={store}
            onChangeText={setStore}
            placeholder="Search your store."
            icon={searchIcon}
          />
          <ChoiceChips
            label="Language"
            required
            options={languageOptions}
            value={language}
            onChange={setLanguage}
          />
          <OutlinedTextField
            label="Name"
            required
            value={name}
            onChangeText={setName}
            placeholder="Please enter your name."
          />
        </View>

        <View style={styles.spacer} />

        <StartJourneyButton onPress={handleStart} disabled={!canStart} style={styles.action} />
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  // 세로 여백과 간격은 스크롤 콘텐츠가 직접 들고 있습니다.
  stage: {
    paddingVertical: 0,
    gap: 0,
  },
  content: {
    flexGrow: 1,
    paddingBottom: Spacing.four,
  },
  logo: {
    alignSelf: 'center',
    marginTop: LOGO_TOP,
  },
  form: {
    marginTop: LOGO_TO_FORM,
    gap: Spacing.five,
  },
  spacer: {
    flexGrow: 1,
    minHeight: FORM_TO_ACTION,
  },
  action: {
    alignSelf: 'flex-end',
  },
});
