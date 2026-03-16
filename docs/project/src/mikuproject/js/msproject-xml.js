(() => {
    const SAMPLE_XML = `<?xml version="1.0" encoding="UTF-8"?>
<Project xmlns="http://schemas.microsoft.com/project">
  <Name>Sample Project</Name>
  <CurrentDate>2026-03-16T09:00:00</CurrentDate>
  <StartDate>2026-03-16T09:00:00</StartDate>
  <FinishDate>2026-03-20T18:00:00</FinishDate>
  <ScheduleFromStart>1</ScheduleFromStart>
  <DefaultStartTime>09:00:00</DefaultStartTime>
  <DefaultFinishTime>18:00:00</DefaultFinishTime>
  <MinutesPerDay>480</MinutesPerDay>
  <MinutesPerWeek>2400</MinutesPerWeek>
  <DaysPerMonth>20</DaysPerMonth>
  <CalendarUID>1</CalendarUID>
  <Calendars>
    <Calendar>
      <UID>1</UID>
      <Name>Standard</Name>
      <IsBaseCalendar>1</IsBaseCalendar>
    </Calendar>
  </Calendars>
  <Tasks>
    <Task>
      <UID>1</UID>
      <ID>1</ID>
      <Name>Project Summary</Name>
      <OutlineLevel>1</OutlineLevel>
      <OutlineNumber>1</OutlineNumber>
      <Start>2026-03-16T09:00:00</Start>
      <Finish>2026-03-20T18:00:00</Finish>
      <Duration>PT40H0M0S</Duration>
      <Milestone>0</Milestone>
      <Summary>1</Summary>
      <PercentComplete>50</PercentComplete>
    </Task>
    <Task>
      <UID>2</UID>
      <ID>2</ID>
      <Name>Design</Name>
      <OutlineLevel>2</OutlineLevel>
      <OutlineNumber>1.1</OutlineNumber>
      <Start>2026-03-16T09:00:00</Start>
      <Finish>2026-03-17T18:00:00</Finish>
      <Duration>PT16H0M0S</Duration>
      <ActualStart>2026-03-16T09:00:00</ActualStart>
      <ActualFinish>2026-03-17T18:00:00</ActualFinish>
      <Milestone>0</Milestone>
      <Summary>0</Summary>
      <PercentComplete>100</PercentComplete>
      <Notes>Design completed</Notes>
    </Task>
    <Task>
      <UID>3</UID>
      <ID>3</ID>
      <Name>Implementation</Name>
      <OutlineLevel>2</OutlineLevel>
      <OutlineNumber>1.2</OutlineNumber>
      <Start>2026-03-18T09:00:00</Start>
      <Finish>2026-03-20T18:00:00</Finish>
      <Duration>PT24H0M0S</Duration>
      <ConstraintType>4</ConstraintType>
      <ConstraintDate>2026-03-18T09:00:00</ConstraintDate>
      <Milestone>0</Milestone>
      <Summary>0</Summary>
      <PercentComplete>0</PercentComplete>
      <Notes>Implementation starts after design</Notes>
      <PredecessorLink>
        <PredecessorUID>2</PredecessorUID>
        <Type>1</Type>
        <LinkLag>PT0H0M0S</LinkLag>
      </PredecessorLink>
    </Task>
  </Tasks>
  <Resources>
    <Resource>
      <UID>1</UID>
      <ID>1</ID>
      <Name>Miku</Name>
      <Type>1</Type>
      <Initials>MK</Initials>
      <Group>Engineering</Group>
      <MaxUnits>1</MaxUnits>
    </Resource>
  </Resources>
  <Assignments>
    <Assignment>
      <UID>1</UID>
      <TaskUID>2</TaskUID>
      <ResourceUID>1</ResourceUID>
      <Start>2026-03-16T09:00:00</Start>
      <Finish>2026-03-17T18:00:00</Finish>
      <Units>1</Units>
      <Work>PT16H0M0S</Work>
    </Assignment>
    <Assignment>
      <UID>2</UID>
      <TaskUID>3</TaskUID>
      <ResourceUID>1</ResourceUID>
      <Start>2026-03-18T09:00:00</Start>
      <Finish>2026-03-20T18:00:00</Finish>
      <Units>1</Units>
      <Work>PT24H0M0S</Work>
    </Assignment>
  </Assignments>
</Project>`;
    function textContent(parent, tagName) {
        const element = parent.getElementsByTagName(tagName)[0];
        return String((element === null || element === void 0 ? void 0 : element.textContent) || "").trim();
    }
    function parseBoolean(value) {
        return value === "1" || value.toLowerCase() === "true";
    }
    function parseNumber(value, defaultValue = 0) {
        const parsed = Number(value);
        return Number.isFinite(parsed) ? parsed : defaultValue;
    }
    function parseDateValue(value) {
        if (!value) {
            return null;
        }
        const timestamp = Date.parse(value);
        return Number.isFinite(timestamp) ? timestamp : null;
    }
    function parseXmlDocument(xmlText) {
        const parser = new DOMParser();
        const xml = parser.parseFromString(xmlText, "application/xml");
        const parserError = xml.getElementsByTagName("parsererror")[0];
        if (parserError) {
            throw new Error("XML の解析に失敗しました");
        }
        return xml;
    }
    function importMsProjectXml(xmlText) {
        var _a, _b, _c, _d;
        const xml = parseXmlDocument(xmlText);
        const projectElement = xml.documentElement;
        const calendars = Array.from(((_a = projectElement.getElementsByTagName("Calendars")[0]) === null || _a === void 0 ? void 0 : _a.getElementsByTagName("Calendar")) || []);
        const tasks = Array.from(((_b = projectElement.getElementsByTagName("Tasks")[0]) === null || _b === void 0 ? void 0 : _b.getElementsByTagName("Task")) || []);
        const resources = Array.from(((_c = projectElement.getElementsByTagName("Resources")[0]) === null || _c === void 0 ? void 0 : _c.getElementsByTagName("Resource")) || []);
        const assignments = Array.from(((_d = projectElement.getElementsByTagName("Assignments")[0]) === null || _d === void 0 ? void 0 : _d.getElementsByTagName("Assignment")) || []);
        return {
            project: {
                name: textContent(projectElement, "Name"),
                currentDate: textContent(projectElement, "CurrentDate") || undefined,
                startDate: textContent(projectElement, "StartDate"),
                finishDate: textContent(projectElement, "FinishDate"),
                scheduleFromStart: parseBoolean(textContent(projectElement, "ScheduleFromStart")),
                defaultStartTime: textContent(projectElement, "DefaultStartTime") || undefined,
                defaultFinishTime: textContent(projectElement, "DefaultFinishTime") || undefined,
                minutesPerDay: textContent(projectElement, "MinutesPerDay") ? parseNumber(textContent(projectElement, "MinutesPerDay"), 0) : undefined,
                minutesPerWeek: textContent(projectElement, "MinutesPerWeek") ? parseNumber(textContent(projectElement, "MinutesPerWeek"), 0) : undefined,
                daysPerMonth: textContent(projectElement, "DaysPerMonth") ? parseNumber(textContent(projectElement, "DaysPerMonth"), 0) : undefined,
                calendarUID: textContent(projectElement, "CalendarUID") || undefined
            },
            calendars: calendars.map((calendar) => ({
                uid: textContent(calendar, "UID"),
                name: textContent(calendar, "Name"),
                isBaseCalendar: parseBoolean(textContent(calendar, "IsBaseCalendar"))
            })),
            tasks: tasks.map((task) => ({
                uid: textContent(task, "UID"),
                id: textContent(task, "ID"),
                name: textContent(task, "Name"),
                outlineLevel: parseNumber(textContent(task, "OutlineLevel"), 1),
                outlineNumber: textContent(task, "OutlineNumber"),
                start: textContent(task, "Start"),
                finish: textContent(task, "Finish"),
                duration: textContent(task, "Duration"),
                actualStart: textContent(task, "ActualStart") || undefined,
                actualFinish: textContent(task, "ActualFinish") || undefined,
                milestone: parseBoolean(textContent(task, "Milestone")),
                summary: parseBoolean(textContent(task, "Summary")),
                percentComplete: parseNumber(textContent(task, "PercentComplete"), 0),
                notes: textContent(task, "Notes") || undefined,
                constraintType: textContent(task, "ConstraintType") ? parseNumber(textContent(task, "ConstraintType"), 0) : undefined,
                constraintDate: textContent(task, "ConstraintDate") || undefined,
                predecessors: Array.from(task.getElementsByTagName("PredecessorLink")).map((link) => ({
                    predecessorUid: textContent(link, "PredecessorUID"),
                    type: parseNumber(textContent(link, "Type"), 0),
                    linkLag: textContent(link, "LinkLag") || undefined
                }))
            })),
            resources: resources.map((resource) => ({
                uid: textContent(resource, "UID"),
                id: textContent(resource, "ID"),
                name: textContent(resource, "Name"),
                type: parseNumber(textContent(resource, "Type"), 0),
                initials: textContent(resource, "Initials") || undefined,
                group: textContent(resource, "Group") || undefined,
                maxUnits: textContent(resource, "MaxUnits") ? parseNumber(textContent(resource, "MaxUnits"), 0) : undefined
            })),
            assignments: assignments.map((assignment) => ({
                uid: textContent(assignment, "UID"),
                taskUid: textContent(assignment, "TaskUID"),
                resourceUid: textContent(assignment, "ResourceUID"),
                start: textContent(assignment, "Start") || undefined,
                finish: textContent(assignment, "Finish") || undefined,
                units: parseNumber(textContent(assignment, "Units"), 0),
                work: textContent(assignment, "Work") || undefined
            }))
        };
    }
    function appendTextElement(doc, parent, name, value) {
        if (value === undefined || value === "") {
            return;
        }
        const element = doc.createElement(name);
        if (typeof value === "boolean") {
            element.textContent = value ? "1" : "0";
        }
        else {
            element.textContent = String(value);
        }
        parent.appendChild(element);
    }
    function formatXml(xml) {
        const normalized = xml.replace(/>\s*</g, "><").trim();
        const tokens = normalized.replace(/></g, ">\n<").split("\n");
        let indentLevel = 0;
        const formatted = [];
        for (const rawToken of tokens) {
            const token = rawToken.trim();
            if (!token) {
                continue;
            }
            if (/^<\//.test(token)) {
                indentLevel = Math.max(indentLevel - 1, 0);
            }
            formatted.push(`${"  ".repeat(indentLevel)}${token}`);
            if (/^<[^!?/][^>]*[^/]>\s*$/.test(token) && !/<\/[^>]+>$/.test(token)) {
                indentLevel += 1;
            }
        }
        return formatted.join("\n");
    }
    function exportMsProjectXml(model) {
        const doc = document.implementation.createDocument("", "Project", null);
        const project = doc.documentElement;
        project.setAttribute("xmlns", "http://schemas.microsoft.com/project");
        appendTextElement(doc, project, "Name", model.project.name);
        appendTextElement(doc, project, "CurrentDate", model.project.currentDate);
        appendTextElement(doc, project, "StartDate", model.project.startDate);
        appendTextElement(doc, project, "FinishDate", model.project.finishDate);
        appendTextElement(doc, project, "ScheduleFromStart", model.project.scheduleFromStart);
        appendTextElement(doc, project, "DefaultStartTime", model.project.defaultStartTime);
        appendTextElement(doc, project, "DefaultFinishTime", model.project.defaultFinishTime);
        appendTextElement(doc, project, "MinutesPerDay", model.project.minutesPerDay);
        appendTextElement(doc, project, "MinutesPerWeek", model.project.minutesPerWeek);
        appendTextElement(doc, project, "DaysPerMonth", model.project.daysPerMonth);
        appendTextElement(doc, project, "CalendarUID", model.project.calendarUID);
        const calendarsElement = doc.createElement("Calendars");
        for (const calendar of model.calendars) {
            const calendarElement = doc.createElement("Calendar");
            appendTextElement(doc, calendarElement, "UID", calendar.uid);
            appendTextElement(doc, calendarElement, "Name", calendar.name);
            appendTextElement(doc, calendarElement, "IsBaseCalendar", calendar.isBaseCalendar);
            calendarsElement.appendChild(calendarElement);
        }
        project.appendChild(calendarsElement);
        const tasksElement = doc.createElement("Tasks");
        for (const task of model.tasks) {
            const taskElement = doc.createElement("Task");
            appendTextElement(doc, taskElement, "UID", task.uid);
            appendTextElement(doc, taskElement, "ID", task.id);
            appendTextElement(doc, taskElement, "Name", task.name);
            appendTextElement(doc, taskElement, "OutlineLevel", task.outlineLevel);
            appendTextElement(doc, taskElement, "OutlineNumber", task.outlineNumber);
            appendTextElement(doc, taskElement, "Start", task.start);
            appendTextElement(doc, taskElement, "Finish", task.finish);
            appendTextElement(doc, taskElement, "Duration", task.duration);
            appendTextElement(doc, taskElement, "ActualStart", task.actualStart);
            appendTextElement(doc, taskElement, "ActualFinish", task.actualFinish);
            appendTextElement(doc, taskElement, "ConstraintType", task.constraintType);
            appendTextElement(doc, taskElement, "ConstraintDate", task.constraintDate);
            appendTextElement(doc, taskElement, "Milestone", task.milestone);
            appendTextElement(doc, taskElement, "Summary", task.summary);
            appendTextElement(doc, taskElement, "PercentComplete", task.percentComplete);
            appendTextElement(doc, taskElement, "Notes", task.notes);
            for (const predecessor of task.predecessors) {
                const predecessorElement = doc.createElement("PredecessorLink");
                appendTextElement(doc, predecessorElement, "PredecessorUID", predecessor.predecessorUid);
                appendTextElement(doc, predecessorElement, "Type", predecessor.type);
                appendTextElement(doc, predecessorElement, "LinkLag", predecessor.linkLag);
                taskElement.appendChild(predecessorElement);
            }
            tasksElement.appendChild(taskElement);
        }
        project.appendChild(tasksElement);
        const resourcesElement = doc.createElement("Resources");
        for (const resource of model.resources) {
            const resourceElement = doc.createElement("Resource");
            appendTextElement(doc, resourceElement, "UID", resource.uid);
            appendTextElement(doc, resourceElement, "ID", resource.id);
            appendTextElement(doc, resourceElement, "Name", resource.name);
            appendTextElement(doc, resourceElement, "Type", resource.type);
            appendTextElement(doc, resourceElement, "Initials", resource.initials);
            appendTextElement(doc, resourceElement, "Group", resource.group);
            appendTextElement(doc, resourceElement, "MaxUnits", resource.maxUnits);
            resourcesElement.appendChild(resourceElement);
        }
        project.appendChild(resourcesElement);
        const assignmentsElement = doc.createElement("Assignments");
        for (const assignment of model.assignments) {
            const assignmentElement = doc.createElement("Assignment");
            appendTextElement(doc, assignmentElement, "UID", assignment.uid);
            appendTextElement(doc, assignmentElement, "TaskUID", assignment.taskUid);
            appendTextElement(doc, assignmentElement, "ResourceUID", assignment.resourceUid);
            appendTextElement(doc, assignmentElement, "Start", assignment.start);
            appendTextElement(doc, assignmentElement, "Finish", assignment.finish);
            appendTextElement(doc, assignmentElement, "Units", assignment.units);
            appendTextElement(doc, assignmentElement, "Work", assignment.work);
            assignmentsElement.appendChild(assignmentElement);
        }
        project.appendChild(assignmentsElement);
        const serializer = new XMLSerializer();
        const serialized = serializer.serializeToString(doc);
        return `<?xml version="1.0" encoding="UTF-8"?>\n${formatXml(serialized)}\n`;
    }
    function normalizeProjectModel(model) {
        return JSON.parse(JSON.stringify(model));
    }
    function validateProjectModel(model) {
        const issues = [];
        const taskUidSet = new Set();
        const taskIdSet = new Set();
        const resourceUidSet = new Set();
        const calendarUidSet = new Set();
        if (!model.project.name) {
            issues.push({ level: "warning", scope: "project", message: "Project Name が空です" });
        }
        if (!model.project.startDate) {
            issues.push({ level: "warning", scope: "project", message: "Project StartDate が空です" });
        }
        if (!model.project.finishDate) {
            issues.push({ level: "warning", scope: "project", message: "Project FinishDate が空です" });
        }
        if (model.project.minutesPerDay !== undefined && model.project.minutesPerDay <= 0) {
            issues.push({ level: "warning", scope: "project", message: "Project MinutesPerDay は正の値が望ましいです" });
        }
        if (model.project.minutesPerWeek !== undefined && model.project.minutesPerWeek <= 0) {
            issues.push({ level: "warning", scope: "project", message: "Project MinutesPerWeek は正の値が望ましいです" });
        }
        if (model.project.daysPerMonth !== undefined && model.project.daysPerMonth <= 0) {
            issues.push({ level: "warning", scope: "project", message: "Project DaysPerMonth は正の値が望ましいです" });
        }
        for (const calendar of model.calendars) {
            if (!calendar.uid) {
                issues.push({ level: "error", scope: "calendars", message: "Calendar UID が空です" });
            }
            if (calendarUidSet.has(calendar.uid)) {
                issues.push({ level: "error", scope: "calendars", message: `Calendar UID が重複しています: ${calendar.uid}` });
            }
            calendarUidSet.add(calendar.uid);
        }
        if (model.project.calendarUID && !calendarUidSet.has(model.project.calendarUID)) {
            issues.push({
                level: "error",
                scope: "project",
                message: `Project CalendarUID が既存 Calendar を指していません: ${model.project.calendarUID}`
            });
        }
        for (const task of model.tasks) {
            if (!task.uid) {
                issues.push({ level: "error", scope: "tasks", message: "Task UID が空です" });
            }
            if (!task.id) {
                issues.push({ level: "error", scope: "tasks", message: `Task ID が空です: ${task.name || "(無名)"}` });
            }
            if (!task.name) {
                issues.push({ level: "error", scope: "tasks", message: `Task Name が空です: UID=${task.uid || "(なし)"}` });
            }
            if (taskIdSet.has(task.id)) {
                issues.push({ level: "error", scope: "tasks", message: `Task ID が重複しています: ${task.id}` });
            }
            taskIdSet.add(task.id);
            if (!task.start) {
                issues.push({ level: "warning", scope: "tasks", message: `Task Start が空です: UID=${task.uid}` });
            }
            if (!task.finish) {
                issues.push({ level: "warning", scope: "tasks", message: `Task Finish が空です: UID=${task.uid}` });
            }
            if (task.outlineLevel < 1) {
                issues.push({ level: "error", scope: "tasks", message: `Task OutlineLevel が不正です: UID=${task.uid}` });
            }
            if (task.outlineNumber) {
                const outlineParts = task.outlineNumber.split(".").filter(Boolean);
                if (outlineParts.length !== task.outlineLevel) {
                    issues.push({
                        level: "warning",
                        scope: "tasks",
                        message: `Task OutlineNumber と OutlineLevel の整合が取れていません: UID=${task.uid}`
                    });
                }
            }
            if (task.percentComplete < 0 || task.percentComplete > 100) {
                issues.push({
                    level: "warning",
                    scope: "tasks",
                    message: `Task PercentComplete が 0..100 の範囲外です: UID=${task.uid}`
                });
            }
            const taskStart = parseDateValue(task.start);
            const taskFinish = parseDateValue(task.finish);
            const taskActualStart = parseDateValue(task.actualStart);
            const taskActualFinish = parseDateValue(task.actualFinish);
            if (taskStart !== null && taskFinish !== null && taskStart > taskFinish) {
                issues.push({
                    level: "warning",
                    scope: "tasks",
                    message: `Task Start が Finish より後です: UID=${task.uid}`
                });
            }
            if (taskActualStart !== null && taskActualFinish !== null && taskActualStart > taskActualFinish) {
                issues.push({
                    level: "warning",
                    scope: "tasks",
                    message: `Task ActualStart が ActualFinish より後です: UID=${task.uid}`
                });
            }
            if (taskUidSet.has(task.uid)) {
                issues.push({ level: "error", scope: "tasks", message: `Task UID が重複しています: ${task.uid}` });
            }
            taskUidSet.add(task.uid);
        }
        for (const resource of model.resources) {
            if (!resource.uid) {
                issues.push({ level: "error", scope: "resources", message: "Resource UID が空です" });
            }
            if (!resource.name) {
                issues.push({ level: "warning", scope: "resources", message: `Resource Name が空です: UID=${resource.uid || "(なし)"}` });
            }
            if (resourceUidSet.has(resource.uid)) {
                issues.push({ level: "error", scope: "resources", message: `Resource UID が重複しています: ${resource.uid}` });
            }
            resourceUidSet.add(resource.uid);
        }
        for (const task of model.tasks) {
            for (const predecessor of task.predecessors) {
                if (!taskUidSet.has(predecessor.predecessorUid)) {
                    issues.push({
                        level: "error",
                        scope: "tasks",
                        message: `PredecessorUID が既存 Task を指していません: task=${task.uid}, predecessor=${predecessor.predecessorUid}`
                    });
                }
            }
        }
        for (const assignment of model.assignments) {
            if (!assignment.uid) {
                issues.push({ level: "warning", scope: "assignments", message: "Assignment UID が空です" });
            }
            if (!taskUidSet.has(assignment.taskUid)) {
                issues.push({
                    level: "error",
                    scope: "assignments",
                    message: `Assignment TaskUID が既存 Task を指していません: ${assignment.taskUid}`
                });
            }
            if (!resourceUidSet.has(assignment.resourceUid)) {
                issues.push({
                    level: "error",
                    scope: "assignments",
                    message: `Assignment ResourceUID が既存 Resource を指していません: ${assignment.resourceUid}`
                });
            }
            if (!assignment.start) {
                issues.push({ level: "warning", scope: "assignments", message: `Assignment Start が空です: UID=${assignment.uid || "(なし)"}` });
            }
            if (!assignment.finish) {
                issues.push({ level: "warning", scope: "assignments", message: `Assignment Finish が空です: UID=${assignment.uid || "(なし)"}` });
            }
            const assignmentStart = parseDateValue(assignment.start);
            const assignmentFinish = parseDateValue(assignment.finish);
            if (assignmentStart !== null && assignmentFinish !== null && assignmentStart > assignmentFinish) {
                issues.push({
                    level: "warning",
                    scope: "assignments",
                    message: `Assignment Start が Finish より後です: UID=${assignment.uid || "(なし)"}`
                });
            }
            if (assignment.units !== undefined && assignment.units < 0) {
                issues.push({
                    level: "warning",
                    scope: "assignments",
                    message: `Assignment Units が負値です: UID=${assignment.uid || "(なし)"}`
                });
            }
        }
        return issues;
    }
    globalThis.__mikuprojectXml = {
        SAMPLE_XML,
        parseXmlDocument,
        importMsProjectXml,
        exportMsProjectXml,
        normalizeProjectModel,
        validateProjectModel
    };
})();
