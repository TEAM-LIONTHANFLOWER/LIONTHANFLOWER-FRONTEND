import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import { ChoiceChips } from '@components/common/choice-chips';
import { OrbitLogo } from '@components/common/orbit-logo';
import { OutlinedSelectField } from '@components/common/outlined-select-field';
import { OutlinedTextField } from '@components/common/outlined-text-field';
import { ScreenContainer } from '@components/common/screen-container';
import { StartJourneyButton } from '@components/common/start-journey-button';
import { SUPPORTED_LANGUAGES } from '@constants/languages';
import { SERVICE_STYLES } from '@constants/onboarding';
import { FixedColors, Spacing } from '@constants/theme';
import { useTranslation } from '@hooks/use-translation';
import { useLocaleStore } from '@stores/locale-store';
import type { ServiceStyleCode } from '@/types/onboarding';

/**
 * 시안(393×852) 의 세로 배치입니다.
 * 시안 좌표에서 상태 표시줄(59)을 뺀 값이라 안전 영역 아래를 기준으로 그대로 씁니다.
 */
const LOGO_TOP = 40;
/** 로고 ~ 입력, 입력 ~ 버튼 사이 간격. Spacing 스케일에 32 와 64 사이 값이 없어 따로 둡니다. */
const SECTION_GAP = 48;

/**
 * 고객이 방문한 매장.
 * 지금은 고정값이고, 매장 식별(QR·비콘)이 붙으면 서버에서 받아옵니다.
 */
const VISITED_STORE = 'MCM HAUS';

/** 고객 정보 입력 화면 — `/login` */
export default function CustomerLoginScreen() {
  const router = useRouter();

  // 고른 언어는 이 화면 밖에서도 쓰이므로 전역 상태에 둡니다.
  // 칩을 누르는 순간 이 화면 문구부터 그 언어로 바뀝니다.
  const language = useLocaleStore((state) => state.locale);
  const setLanguage = useLocaleStore((state) => state.setLocale);
  const { t } = useTranslation();

  const [name, setName] = useState('');
  const [serviceStyle, setServiceStyle] = useState<ServiceStyleCode>('recommendation');
  const [request, setRequest] = useState('');

  const languageOptions = SUPPORTED_LANGUAGES.map((option) => ({
    value: option.code,
    label: option.nativeLabel,
  }));
  const serviceStyleOptions = SERVICE_STYLES.map((option) => ({
    value: option.code,
    label: t(option.labelKey),
  }));
  const canStart = name.trim().length > 0;

  const handleStart = useCallback(() => {
    router.replace('/matching');
  }, [router]);

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
          <Text style={styles.notice}>{t('login.storeNotice', { store: VISITED_STORE })}</Text>

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
            placeholder={t('login.namePlaceholder')}
          />
          <OutlinedSelectField
            label="Service Style"
            required
            options={serviceStyleOptions}
            value={serviceStyle}
            onChange={setServiceStyle}
          />
          <OutlinedTextField
            label="Additional Requests"
            value={request}
            onChangeText={setRequest}
            placeholder={t('login.requestPlaceholder')}
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
    marginTop: SECTION_GAP,
    gap: Spacing.four,
  },
  notice: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '500',
    color: FixedColors.onDark,
  },
  spacer: {
    flexGrow: 1,
    minHeight: SECTION_GAP,
  },
  action: {
    alignSelf: 'flex-end',
  },
});
