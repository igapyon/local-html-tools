(() => {
  type ProjectInfo = {
    name: string;
    startDate: string;
    finishDate: string;
    scheduleFromStart: boolean;
    currentDate?: string;
    defaultStartTime?: string;
    defaultFinishTime?: string;
    minutesPerDay?: number;
    minutesPerWeek?: number;
    daysPerMonth?: number;
    calendarUID?: string;
  };

  type PredecessorModel = {
    predecessorUid: string;
    type?: number;
    linkLag?: string;
  };

  type TaskModel = {
    uid: string;
    id: string;
    name: string;
    outlineLevel: number;
    outlineNumber: string;
    start: string;
    finish: string;
    duration: string;
    actualStart?: string;
    actualFinish?: string;
    milestone: boolean;
    summary: boolean;
    percentComplete: number;
    notes?: string;
    constraintType?: number;
    constraintDate?: string;
    predecessors: PredecessorModel[];
  };

  type ResourceModel = {
    uid: string;
    id: string;
    name: string;
    type?: number;
    initials?: string;
    group?: string;
    maxUnits?: number;
  };

  type AssignmentModel = {
    uid: string;
    taskUid: string;
    resourceUid: string;
    start?: string;
    finish?: string;
    units?: number;
    work?: string;
  };

  type CalendarModel = {
    uid: string;
    name: string;
    isBaseCalendar: boolean;
  };

  type ProjectModel = {
    project: ProjectInfo;
    tasks: TaskModel[];
    resources: ResourceModel[];
    assignments: AssignmentModel[];
    calendars: CalendarModel[];
  };

  type ValidationIssue = {
    level: "error" | "warning";
    scope: "project" | "tasks" | "resources" | "assignments" | "calendars";
    message: string;
  };

  (globalThis as typeof globalThis & {
    __mikuprojectTypes?: {
      __ready: true;
    };
  }).__mikuprojectTypes = {
    __ready: true
  };
})();
