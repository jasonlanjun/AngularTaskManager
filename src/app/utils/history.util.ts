import { TaskHistoryVM } from '../vm';
import { User } from '../domain';
import * as DateFns from 'date-fns';
import * as History from '../domain/history';

const getDayName = (day: number): string => {
  const dayNames: string[] = ['一', '二', '三', '四', '五', '六', '日'];
  return dayNames[day - 1];
};

const joinUserNames = (users: User[]): string => {
  const names = users.map((user: User) => user.name);
  return names.join(', ');
};

const getDateDesc = (date: Date): string => {
  const nowDate: Date = new Date();
  const historyDate: Date = new Date(date);
  const todayDate: Date = new Date(nowDate.getFullYear(), nowDate.getMonth(), nowDate.getDate());
  const yesterdayDate: Date = new Date(todayDate.getTime() - 24 * 60 * 60 * 1000);
  const thisWeekDate: Date = new Date(todayDate.getTime() - (nowDate.getDay() - 1) * 24 * 60 * 60 * 1000);
  const lastWeekDate: Date = new Date(thisWeekDate.getTime() - 7 * 24 * 60 * 60 * 1000);

  const nowTimestamp: number = nowDate.getTime();
  const historyTimestamp: number = historyDate.getTime();
  const deltaTimestamp: number = nowTimestamp - historyTimestamp;

  if (deltaTimestamp < 60 * 1000) {
    return 'second';
  } else if (deltaTimestamp < 60 * 60 * 1000) {
    return `${(deltaTimestamp / 1000 / 60).toFixed(0)}分钟前`;
  }

  if (DateFns.format(nowDate, 'YYYY-MM-DD') === DateFns.format(historyDate, 'YYYY-MM-DD')) {
    return `Today ${DateFns.format(historyDate, 'HH:mm')}`;
  }

  if (DateFns.format(yesterdayDate, 'YYYY-MM-DD') === DateFns.format(historyDate, 'YYYY-MM-DD')) {
    return `yesterday ${DateFns.format(historyDate, 'HH:mm')}`;
  }

  if (DateFns.format(thisWeekDate, 'YYYY-MM W') === DateFns.format(historyDate, 'YYYY-MM W')) {
    return `This week${getDayName(historyDate.getDay())} ${DateFns.format(historyDate, 'HH:mm')}`;
  }

  if (DateFns.format(lastWeekDate, 'YYYY-MM W') === DateFns.format(historyDate, 'YYYY-MM W')) {
    return `Last week${getDayName(historyDate.getDay())} ${DateFns.format(historyDate, 'HH:mm')}`;
  }

  return DateFns.format(date, 'MMDD H:mm');
};

export const getTaskHistoryVMs = (histories: History.TaskHistory[]): TaskHistoryVM[] => {
  return histories.map((history: History.TaskHistory) => {
    switch (history.operation.type) {
      case History.CREATE_TASK:
        return {
          ...history,
          icon: 'add',
          title: `${history.operator.name} created the task`,
          dateDesc: getDateDesc(history.date),
        };
      case History.COMPLETE_TASK:
        return {
          ...history,
          icon: 'done',
          title: `${history.operator.name} finished the task`,
          dateDesc: getDateDesc(history.date),
        };
      case History.RECREATE_TASK:
        return {
          ...history,
          icon: 'redo',
          title: `${history.operator.name} redo the task`,
          dateDesc: getDateDesc(history.date),
        };
      case History.UPDATE_TASK_CONTENT: {
        const content: string = (<History.UpdateTaskContentOperation>history.operation).payload;
        return {
          ...history,
          icon: 'create',
          title: `${history.operator.name} updated the content`,
          content: content,
          dateDesc: getDateDesc(history.date),
        };
      }
      case History.UPDATE_TASK_PRIORITY: {
        let priority: string;
        switch ((<History.UpdateTaskPriorityOperation>history.operation).payload) {
          case 1:
            priority = 'urgent';
            break;
          case 2:
            priority = 'import';
            break;
          default:
            priority = 'regular';
            break;
        }
        return {
          ...history,
          icon: 'priority_high',
          title: `${history.operator.name} Update priority ${priority}`,
          dateDesc: getDateDesc(history.date),
        };
      }
      case History.UPDATE_TASK_REMARK: {
        const content: string = (<History.UpdateTaskRemarkOperation>history.operation).payload;
        return {
          ...history,
          icon: 'create',
          title: `${history.operator.name} update the note`,
          content: content,
          dateDesc: getDateDesc(history.date),
        };
      }
      case History.CLEAR_TASK_REMARK: {
        return {
          ...history,
          icon: 'clear',
          title: `${history.operator.name} clear the note`,
          dateDesc: getDateDesc(history.date),
        };
      }
      case History.UPDATE_TASK_DUEDATE: {
        const dueDate: Date = (<History.UpdateTaskDueDateOperation>history.operation).payload;
        return {
          ...history,
          icon: 'date_range',
          title: `${history.operator.name} update due day ${DateFns.format(dueDate, 'MMDD')}`,
          dateDesc: getDateDesc(history.date),
        };
      }
      case History.CLEAR_TASK_DUEDATE: {
        return {
          ...history,
          icon: 'date_range',
          title: `${history.operator.name} clear due day`,
          dateDesc: getDateDesc(history.date),
        };
      }
      case History.CLAIM_TASK: {
        return {
          ...history,
          icon: 'person',
          title: `${history.operator.name} assigned the task`,
          dateDesc: getDateDesc(history.date),
        };
      }
      case History.ASSIGN_TASK: {
        const name = (<History.AssignTaskOperation>history.operation).payload.name;
        return {
          ...history,
          icon: 'person',
          title: `${history.operator.name} was assigned ${name}`,
          dateDesc: getDateDesc(history.date),
        };
      }
      case History.REMOVE_TASK_EXECUTOR: {
        return {
          ...history,
          icon: 'person',
          title: `${history.operator.name} remove the owner`,
          dateDesc: getDateDesc(history.date),
        };
      }
      case History.ADD_PARTICIPANT: {
        const users: User[] = (<History.AddParticipantOperation>history.operation).payload;
        return {
          ...history,
          icon: 'person',
          title: `${history.operator.name} add member ${joinUserNames(users)}`,
          dateDesc: getDateDesc(history.date),
        };
      }
      case History.REMOVE_PARTICIPANT: {
        const users: User[] = (<History.RemoveParticipantOperation>history.operation).payload;
        return {
          ...history,
          icon: 'person',
          title: `${history.operator.name} remove the member ${joinUserNames(users)}`,
          dateDesc: getDateDesc(history.date),
        };
      }
      default:
        return {
          ...history,
          title: 'unknow',
          dateDesc: getDateDesc(history.date),
        };
    }
  });
};
