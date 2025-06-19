export interface Lap {
  id: number;
  record_id: number;
  lap_number: number;
  lap_time: string;
  created_at: string;
  updated_at: string;
}

export interface Record {
  id: number;
  user_id: number;
  style_id: number;
  distance_id: number;
  date: string;
  is_short_course: boolean;
  memo: string;
  laps: Lap[];
  created_at: string;
  updated_at: string;
}

export interface RecordDetail {
  record: Record;
  laps: Lap[];
} 