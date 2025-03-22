export interface TaskCreateDto {
  title: string;
  description: string | undefined;
  task_status_id: number;
}
