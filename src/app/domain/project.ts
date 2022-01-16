export interface Project {
  id: string | undefined;
  name: string;
  desc?: string;
  coverImg?: string;
  enabled?: boolean;
  taskFilterId?: string;
  taskLists?: string[]|undefined; // 存储 TaskList ID
  members?: string[]|undefined; // 存储成员 key 为 ID， value 为角色
}
