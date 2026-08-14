import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import { ChoiceChips } from '@components/common/choice-chips';
import { OrbitLogo } from '@components/common/orbit-logo';
import { OutlinedSelectField } from '@components/common/outlined-select-field';
import { OutlinedTextField } from '@components/common/outlined-text-field';
import { ScreenContainer } from '@components/common/screen-container';
import { StartJourneyButton } from '@components/common/start-journey-button';
import { SERVICE_LANGUAGES, SERVICE_STYLES } from '@constants/onboarding';
import { BrandColors, Spacing } from '@constants/theme';
import type { ServiceLanguageCode, ServiceStyleCode } from '@/types/onboarding';

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

  const [language, setLanguage] = useState<ServiceLanguageCode>('ko');
  const [name, setName] = useState('');
  const [serviceStyle, setServiceStyle] = useState<ServiceStyleCode>('recommendation');
  const [request, setRequest] = useState('');

  const languageOptions = SERVICE_LANGUAGES.map((option) => ({
    value: option.code,
    label: option.nativeLabel,
  }));
  const serviceStyleOptions = SERVICE_STYLES.map((option) => ({
    value: option.code,
    label: option.label,
  }));
  const canStart = name.trim().length > 0;

  const handleStart = useCallback(() => {
    router.replace('/matching');
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
          <Text style={styles.notice}>
            {`현재 고객님이 방문하신 매장은\n[${VISITED_STORE}] 입니다.`}
          </Text>

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
            placeholder="성함을 입력해주세요."
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
            placeholder="특별히 요청하실 사항이 있으면 적어 주세요."
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
    color: BrandColors.onDark,
  },
  spacer: {
    flexGrow: 1,
    minHeight: SECTION_GAP,
  },
  action: {
    alignSelf: 'flex-end',
  },
});
