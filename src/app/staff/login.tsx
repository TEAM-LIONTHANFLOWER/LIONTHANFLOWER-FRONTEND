import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import { ChoiceChips } from '@components/common/choice-chips';
import { OrbitLogo } from '@components/common/orbit-logo';
import { OutlinedTextField } from '@components/common/outlined-text-field';
import { ScreenContainer } from '@components/common/screen-container';
import { StartJourneyButton } from '@components/common/start-journey-button';
import { StoreSearchField } from '@components/staff/store-search-field';
import { SUPPORTED_LANGUAGES, toServiceLanguages } from '@constants/languages';
import { FixedColors, Spacing } from '@constants/theme';
import { useRegisterStaffProfile } from '@hooks/use-staff-profile';
import { useStaffStore } from '@stores/staff-store';
import type { LocaleCode } from '@/types/i18n';
import type { StoreSummary } from '@/types/store';

/**
 * 시안(393×852) 의 세로 배치입니다.
 * 시안 좌표에서 상태 표시줄(59)을 뺀 값이라 안전 영역 아래를 기준으로 그대로 씁니다.
 */
const LOGO_TOP = 117;
const LOGO_TO_FORM = 58;
/** 입력과 버튼 사이 최소 간격. 화면이 남으면 버튼이 아래로 더 밀립니다. */
const FORM_TO_ACTION = 88;

/** 직원 화면은 번역 대상이 아니라 문구를 한국어로 직접 적습니다. */
const SIGN_IN_FAILED = '로그인에 실패했습니다. 잠시 후 다시 시도해주세요.';

/** 직원 정보 입력 화면 — `/staff/login` */
export default function StaffLoginScreen() {
  const router = useRouter();

  const signIn = useStaffStore((state) => state.signIn);
  const { mutate: registerProfile, isPending, isError } = useRegisterStaffProfile();

  // 서버가 근무 매장을 UUID 로만 받아, 이름이 아니라 검색해서 고른 매장을 통째로 들고 있습니다.
  const [store, setStore] = useState<StoreSummary | null>(null);
  // 고객과 달리 직원은 `응대 가능한 언어` 를 고르는 것이라 여러 개를 켤 수 있습니다.
  const [languages, setLanguages] = useState<readonly LocaleCode[]>(['ko']);
  const [name, setName] = useState('');

  const languageOptions = SUPPORTED_LANGUAGES.map((option) => ({
    value: option.code,
    label: option.label,
  }));
  const canStart = store !== null && languages.length > 0 && name.trim().length > 0;

  const handleStart = useCallback(() => {
    // 버튼이 잠겨 있어 여기까지 오면 매장은 반드시 골라져 있습니다.
    if (store === null) {
      return;
    }

    registerProfile(
      {
        storeId: store.storeId,
        name: name.trim(),
        languages: toServiceLanguages(languages),
      },
      {
        onSuccess: (profile) => {
          signIn(profile);
          router.replace('/staff/dashboard');
        },
      }
    );
  }, [languages, name, registerProfile, router, signIn, store]);

  return (
    <ScreenContainer backgroundColor={FixedColors.splashBackground} style={styles.stage}>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        automaticallyAdjustKeyboardInsets
      >
        <OrbitLogo style={styles.logo} />

        <View style={styles.form}>
          {/* 적은 글자로 `GET /api/stores` 를 검색해, 고른 매장의 UUID 를 그대로 보냅니다. */}
          <StoreSearchField label="Working At" required value={store} onChange={setStore} />
          <ChoiceChips
            label="Language"
            required
            multiple
            options={languageOptions}
            value={languages}
            onChange={setLanguages}
          />
          <OutlinedTextField
            label="Name"
            required
            value={name}
            onChangeText={setName}
            placeholder="Please enter your name."
          />
        </View>

        {isError ? (
          <Text style={styles.error} accessibilityRole="alert" accessibilityLiveRegion="polite">
            {SIGN_IN_FAILED}
          </Text>
        ) : null}

        <View style={styles.spacer} />

        {/* 보내는 중에는 프로필이 두 번 만들어지지 않도록 버튼을 잠급니다. */}
        <StartJourneyButton
          onPress={handleStart}
          disabled={!canStart || isPending}
          style={styles.action}
        />
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
  error: {
    marginTop: Spacing.three,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
    color: FixedColors.errorOnDark,
  },
  spacer: {
    flexGrow: 1,
    minHeight: FORM_TO_ACTION,
  },
  action: {
    alignSelf: 'flex-end',
  },
});
