/**
 * 고객 알림 도메인 타입.
 *
 * 지금 서버가 보내는 알림은 Visit Memory 한 종류뿐입니다. 직원이 방문 기록을 전송하면
 * 알림이 하나 생기고, 고객은 그 `resourceId` 로 본문을 엽니다 — 알림 자체를 보여주는
 * 화면은 시안에 없고, `Visit Memory` 팝업이 이 값을 쓰려고 목록을 읽습니다.
 */

/** 알림이 무엇에 대한 것인지. */
export type NotificationType = 'VISIT_MEMORY';

/** `GET /api/customers/notifications` 의 한 건. */
export interface NotificationView {
  notificationId: string;
  type: NotificationType;
  /** 이 알림이 가리키는 것의 식별자. `VISIT_MEMORY` 면 `visitMemoryId` 입니다. */
  resourceId: string;
  /** 서버가 쓴 한국어 안내. 고객 화면은 언어가 갈려 이 문장을 그대로 쓰지 않습니다. */
  message: string;
  read: boolean;
  readAt?: string;
  createdAt: string;
}
