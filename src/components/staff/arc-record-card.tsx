import { RecordCard } from '@components/staff/record-card';
import type { ArcRecord } from '@/types/visit';

interface ArcRecordCardProps {
  arc: ArcRecord;
  /** 카드를 눌러 기록 상세로 들어갑니다. */
  onOpen: () => void;
}

/** 이미 마무리된 Arc 한 건을 보여주는 카드. 매장과 날짜만 짧게 남습니다. */
export function ArcRecordCard({ arc, onOpen }: ArcRecordCardProps) {
  return <RecordCard title={arc.title} lines={[arc.store, arc.date]} onPress={onOpen} />;
}
