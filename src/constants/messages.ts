/**
 * 고객 화면 문구 사전.
 *
 * 고객이 Language 칩에서 고른 언어로 화면 문구를 보여줍니다. 꺼내 쓸 때는
 * `useTranslation()` 을 거치고, 화면 파일에 문구를 직접 적지 않습니다.
 *
 * `Language` / `Name` 같은 입력 라벨과 `Start to Journey` 버튼 글자는 시안에서
 * 언어와 상관없이 영문으로 고정돼 있어 사전에 넣지 않았습니다. 온보딩 문구도
 * 언어를 고르기 전에 지나가는 화면이라 그대로 둡니다.
 *
 * 직원 화면은 번역 대상이 아닙니다. 직원이 고르는 언어는 표시 언어가 아니라
 * `응대 가능한 언어` 라는 데이터입니다.
 */

import type { LocaleCode, Messages } from '@/types/i18n';

export const MESSAGES: Record<LocaleCode, Messages> = {
  ko: {
    'login.storeNotice': '현재 고객님이 방문하신 매장은\n[{store}] 입니다.',
    'login.namePlaceholder': '성함을 입력해주세요.',
    'login.requestPlaceholder': '특별히 요청하실 사항이 있으면 적어 주세요.',
    'serviceStyle.recommendation': '직원의 추천을 받고 싶어요',
    'serviceStyle.selfGuided': '혼자 보고 싶어요',
    'matching.waiting': '직원을 매칭중입니다...\n잠시만 직원을 기다려주세요',
    'a11y.startJourney': '여정 시작',
  },
  en: {
    'login.storeNotice': 'The store you are visiting is\n[{store}].',
    'login.namePlaceholder': 'Please enter your name.',
    'login.requestPlaceholder': 'Let us know if you have any special requests.',
    'serviceStyle.recommendation': "I'd like a staff recommendation",
    'serviceStyle.selfGuided': "I'd like to browse on my own",
    'matching.waiting': 'Matching you with a staff member...\nPlease wait a moment.',
    'a11y.startJourney': 'Start to journey',
  },
  zh: {
    'login.storeNotice': '您当前到访的门店是\n[{store}]。',
    'login.namePlaceholder': '请输入您的姓名。',
    'login.requestPlaceholder': '如有特别需求，请在此填写。',
    'serviceStyle.recommendation': '希望店员为我推荐',
    'serviceStyle.selfGuided': '想自己逛逛',
    'matching.waiting': '正在为您匹配店员…\n请稍候片刻。',
    'a11y.startJourney': '开始旅程',
  },
  ja: {
    'login.storeNotice': 'お客様がご来店中の店舗は\n[{store}] です。',
    'login.namePlaceholder': 'お名前をご入力ください。',
    'login.requestPlaceholder': 'ご要望がございましたらご記入ください。',
    'serviceStyle.recommendation': 'スタッフのおすすめを受けたい',
    'serviceStyle.selfGuided': 'ひとりで見て回りたい',
    'matching.waiting': 'スタッフをおつなぎしています…\n少々お待ちください。',
    'a11y.startJourney': '旅を始める',
  },
  ru: {
    'login.storeNotice': 'Вы находитесь в бутике\n[{store}].',
    'login.namePlaceholder': 'Пожалуйста, введите ваше имя.',
    'login.requestPlaceholder': 'Напишите, если у вас есть особые пожелания.',
    'serviceStyle.recommendation': 'Хочу получить совет консультанта',
    'serviceStyle.selfGuided': 'Хочу посмотреть самостоятельно',
    'matching.waiting': 'Подбираем консультанта…\nПожалуйста, подождите.',
    'a11y.startJourney': 'Начать путешествие',
  },
};
