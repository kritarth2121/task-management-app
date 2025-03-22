export interface TaskCreateDto {
  title: string;
  description: string | undefined;
  status_id: number;
  board_id: number;
}
