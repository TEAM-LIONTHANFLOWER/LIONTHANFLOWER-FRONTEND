import type { ReactNode } from 'react';

import { ActionPill } from '@components/common/action-pill';
import { RecordCard } from '@components/staff/record-card';
import type { StoreVisit } from '@/types/visit';

/** 시안이 언어 목록을 이 문자로 이어 붙입니다. */
const LANGUAGE_SEPARATOR = ' · ';

interface VisitCardProps {
  visit: StoreVisit;
  /** 카드를 눌러 고객 상세로 들어갑니다. */
  onOpen: () => void;
  /** 이 고객의 Arc 를 새로 만듭니다. */
  onCreateArc: () => void;
  /** 오늘 방문을 Visit Memory 로 저장합니다. */
  onSaveMemory: () => void;
  /** 기다리고 있는 고객의 응대를 시작합니다. */
  onStartService: () => void;
}

/**
 * 카드 왼쪽 위 상태 배지 문구.
 *
 * Solo 고객은 직원이 곁에 붙지 않아 응대 단계를 보여주지 않고,
 * 이미 끝난 응대도 배지 없이 기록만 남깁니다.
 */
function describeStatus(visit: StoreVisit): string | undefined {
  if (visit.mode === 'solo') {
    return undefined;
  }

  switch (visit.status) {
    case 'in-progress':
      return visit.startedAt === undefined ? '응대중' : `응대중・${visit.startedAt}`;
    case 'waiting':
      return '응대대기중';
    case 'done':
      return undefined;
  }
}

/** 매장에 들어온 고객 한 명을 보여주는 카드. 응대 단계에 따라 아래 버튼이 달라집니다. */
export function VisitCard({
  visit,
  onOpen,
  onCreateArc,
  onSaveMemory,
  onStartService,
}: VisitCardProps) {
  const lines = [visit.languages.join(LANGUAGE_SEPARATOR), visit.arcLabel];
  if (visit.request !== undefined) {
    lines.push(`추가 요구사항 : ${visit.request}`);
  }

  let actions: ReactNode;
  if (visit.status === 'in-progress') {
    actions = (
      <>
        <ActionPill label="Arc 생성하기" onPress={onCreateArc} fill />
        <ActionPill label="Visit Memory 저장" onPress={onSaveMemory} fill />
      </>
    );
  } else if (visit.status === 'waiting') {
    actions = <ActionPill label="응대 시작하기" onPress={onStartService} fill />;
  }

  return (
    <RecordCard
      badge={describeStatus(visit)}
      title={visit.name}
      lines={lines}
      actions={actions}
      onPress={onOpen}
    />
  );
}
