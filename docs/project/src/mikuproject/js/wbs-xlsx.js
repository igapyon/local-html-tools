(() => {
    const HEADER_FILL = "#D9EAF7";
    const PHASE_FILL = "#EEF7E8";
    const MILESTONE_FILL = "#FFF4E0";
    const BAND_FILL = "#F4F7FB";
    const ACTIVE_BAND_FILL = "#9FD5C9";
    const PROGRESS_BAND_FILL = "#5BAE9C";
    const WEEKEND_BAND_FILL = "#F1F1F1";
    const TODAY_BAND_FILL = "#FFE6A7";
    const TODAY_ACTIVE_BAND_FILL = "#F3C96B";
    const TODAY_PROGRESS_BAND_FILL = "#D89A2B";
    const HOLIDAY_BAND_FILL = "#FCE4EC";
    function exportWbsWorkbook(model, options = {}) {
        const resourceNameByUid = new Map(model.resources.map((resource) => [resource.uid, resource.name]));
        const predecessorNameByUid = new Map(model.tasks.map((task) => [task.uid, task.name]));
        const calendarNameByUid = new Map(model.calendars.map((calendar) => [calendar.uid, calendar.name]));
        const resourceNamesByTaskUid = new Map();
        const holidaySet = new Set((options.holidayDates || []).map((day) => day.slice(0, 10)));
        for (const assignment of model.assignments) {
            const resourceName = resourceNameByUid.get(assignment.resourceUid);
            if (!resourceName) {
                continue;
            }
            const resourceNames = resourceNamesByTaskUid.get(assignment.taskUid) || [];
            if (!resourceNames.includes(resourceName)) {
                resourceNames.push(resourceName);
            }
            resourceNamesByTaskUid.set(assignment.taskUid, resourceNames);
        }
        const dateBand = buildDateBand(model.project.startDate, model.project.finishDate);
        const fixedHeaders = [
            "UID",
            "ID",
            "WBS",
            "Kind",
            "OutlineLevel",
            "Name",
            "Start",
            "Finish",
            "Duration",
            "PercentComplete",
            "PercentWorkComplete",
            "Milestone",
            "Summary",
            "Critical",
            "Owner",
            "Calendar",
            "Resources",
            "Predecessors"
        ];
        const totalColumns = fixedHeaders.length + dateBand.length;
        const lastColumnRef = columnName(totalColumns);
        return {
            sheets: [
                {
                    name: "WBS",
                    columns: [
                        { width: 8 }, { width: 8 }, { width: 14 }, { width: 12 }, { width: 12 }, { width: 34 },
                        { width: 20 }, { width: 20 }, { width: 14 }, { width: 14 },
                        { width: 18 }, { width: 12 }, { width: 12 }, { width: 12 },
                        { width: 20 }, { width: 14 }, { width: 24 }, { width: 22 },
                        ...dateBand.map(() => ({ width: 6 }))
                    ],
                    mergedRanges: [`A1:${lastColumnRef}1`, `A2:${lastColumnRef}2`, `A3:${lastColumnRef}3`, `A4:${lastColumnRef}4`],
                    rows: [
                        sectionTitleRow("WBS", totalColumns),
                        sectionTitleRow(model.project.name || "Project", totalColumns),
                        infoRow(`Title=${model.project.title || "-"} / Calendar=${model.project.calendarUID || "-"} / ScheduleFromStart=${model.project.scheduleFromStart ? "true" : "false"}`, totalColumns),
                        infoRow(`Start=${model.project.startDate || "-"} / Finish=${model.project.finishDate || "-"} / CurrentDate=${model.project.currentDate || "-"} / Holidays=${holidaySet.size}`, totalColumns),
                        sectionTitleRow("Task View", totalColumns),
                        todayGuideRow(fixedHeaders.length, dateBand, model.project.currentDate, holidaySet),
                        headerRow([
                            ...fixedHeaders,
                            ...dateBand.map((day) => dateHeaderCell(day, model.project.currentDate, holidaySet))
                        ]),
                        ...model.tasks.map((task) => ({
                            cells: [
                                taskCell(task, task.uid, "center"),
                                taskCell(task, task.id, "center"),
                                taskCell(task, task.wbs || task.outlineNumber, "center"),
                                taskCell(task, classifyTaskKind(task), "center"),
                                taskCell(task, task.outlineLevel, "center"),
                                taskCell(task, formatTaskLabel(task)),
                                taskCell(task, task.start),
                                taskCell(task, task.finish),
                                taskCell(task, task.duration, "center"),
                                taskCell(task, task.percentComplete, "center"),
                                taskCell(task, task.percentWorkComplete, "center"),
                                taskCell(task, task.milestone, "center"),
                                taskCell(task, task.summary, "center"),
                                taskCell(task, task.critical, "center"),
                                taskCell(task, firstResourceName(resourceNamesByTaskUid.get(task.uid)), "center"),
                                taskCell(task, formatCalendarLabel(task.calendarUID || model.project.calendarUID, calendarNameByUid), "center"),
                                taskCell(task, (resourceNamesByTaskUid.get(task.uid) || []).join(", ")),
                                taskCell(task, task.predecessors.map((item) => predecessorNameByUid.get(item.predecessorUid) || item.predecessorUid).join(", ")),
                                ...dateBand.map((day) => dateBandCell(task, day, model.project.currentDate, holidaySet))
                            ]
                        }))
                    ]
                }
            ]
        };
    }
    function formatTaskLabel(task) {
        return `${"  ".repeat(Math.max(0, task.outlineLevel - 1))}${task.name}`;
    }
    function classifyTaskKind(task) {
        if (task.summary) {
            return "phase";
        }
        if (task.milestone) {
            return "milestone";
        }
        return "task";
    }
    function firstResourceName(resourceNames) {
        if (!resourceNames || resourceNames.length === 0) {
            return "";
        }
        return resourceNames[0];
    }
    function formatCalendarLabel(calendarUID, calendarNameByUid) {
        if (!calendarUID) {
            return "-";
        }
        const calendarName = calendarNameByUid.get(calendarUID);
        return calendarName ? `${calendarUID} ${calendarName}` : calendarUID;
    }
    function sectionTitleRow(title, columnCount) {
        return {
            height: 28,
            cells: [
                {
                    value: title,
                    bold: true,
                    fillColor: HEADER_FILL,
                    border: "thin",
                    horizontalAlign: "center"
                },
                ...Array.from({ length: Math.max(0, columnCount - 1) }, () => ({}))
            ]
        };
    }
    function infoRow(text, columnCount) {
        return {
            height: 24,
            cells: [
                {
                    value: text,
                    border: "thin",
                    horizontalAlign: "left"
                },
                ...Array.from({ length: Math.max(0, columnCount - 1) }, () => ({}))
            ]
        };
    }
    function headerRow(labels) {
        return {
            height: 24,
            cells: labels.map((label) => {
                if (typeof label === "string") {
                    return {
                        value: label,
                        bold: true,
                        fillColor: HEADER_FILL,
                        border: "thin",
                        horizontalAlign: "center"
                    };
                }
                return {
                    border: "thin",
                    horizontalAlign: "center",
                    ...label
                };
            })
        };
    }
    function todayGuideRow(fixedColumnCount, dateBand, currentDate, holidaySet) {
        return {
            height: 22,
            cells: [
                ...Array.from({ length: fixedColumnCount }, (_, index) => (index === 5
                    ? {
                        value: "Today",
                        bold: true,
                        border: "thin",
                        horizontalAlign: "right"
                    }
                    : {})),
                ...dateBand.map((day) => ({
                    value: isSameDay(day, currentDate) ? "▼" : "",
                    bold: true,
                    border: "thin",
                    horizontalAlign: "center",
                    fillColor: isSameDay(day, currentDate) ? TODAY_BAND_FILL : (holidaySet.has(day) ? HOLIDAY_BAND_FILL : BAND_FILL)
                }))
            ]
        };
    }
    function cell(value) {
        if (value === undefined || value === "") {
            return {};
        }
        return {
            value,
            border: "thin"
        };
    }
    function taskCell(task, value, horizontalAlign = "left") {
        if (value === undefined || value === "") {
            return {};
        }
        return {
            value,
            border: "thin",
            horizontalAlign,
            bold: task.summary || task.milestone || false,
            fillColor: task.summary ? PHASE_FILL : (task.milestone ? MILESTONE_FILL : undefined)
        };
    }
    function dateHeaderCell(day, currentDate, holidaySet) {
        const isToday = isSameDay(day, currentDate);
        const isWeekendDay = isWeekend(day);
        const isHoliday = holidaySet.has(day);
        return {
            value: formatDateLabel(day),
            bold: true,
            border: "thin",
            horizontalAlign: "center",
            fillColor: isToday ? TODAY_BAND_FILL : (isHoliday ? HOLIDAY_BAND_FILL : (isWeekendDay ? WEEKEND_BAND_FILL : HEADER_FILL))
        };
    }
    function dateBandCell(task, day, currentDate, holidaySet) {
        const active = includesDay(task.start, task.finish, day);
        const isToday = isSameDay(day, currentDate);
        const isWeekendDay = isWeekend(day);
        const isHoliday = holidaySet.has(day);
        const complete = active && isCompletedDay(task, day);
        return {
            value: active ? "■" : "",
            border: "thin",
            horizontalAlign: "center",
            fillColor: active
                ? (complete
                    ? (isToday ? TODAY_PROGRESS_BAND_FILL : PROGRESS_BAND_FILL)
                    : (isToday ? TODAY_ACTIVE_BAND_FILL : ACTIVE_BAND_FILL))
                : (isToday ? TODAY_BAND_FILL : (isHoliday ? HOLIDAY_BAND_FILL : (isWeekendDay ? WEEKEND_BAND_FILL : BAND_FILL)))
        };
    }
    function buildDateBand(startDate, finishDate) {
        const start = parseDateOnly(startDate);
        const finish = parseDateOnly(finishDate);
        if (!start || !finish || start.getTime() > finish.getTime()) {
            return [];
        }
        const days = [];
        const cursor = new Date(start.getTime());
        while (cursor.getTime() <= finish.getTime()) {
            days.push(formatDateOnly(cursor));
            cursor.setDate(cursor.getDate() + 1);
        }
        return days;
    }
    function includesDay(startDate, finishDate, day) {
        const start = parseDateOnly(startDate);
        const finish = parseDateOnly(finishDate);
        const target = parseDateOnly(day);
        if (!start || !finish || !target) {
            return false;
        }
        return start.getTime() <= target.getTime() && target.getTime() <= finish.getTime();
    }
    function isCompletedDay(task, day) {
        const start = parseDateOnly(task.start);
        const finish = parseDateOnly(task.finish);
        const target = parseDateOnly(day);
        if (!start || !finish || !target) {
            return false;
        }
        const totalDays = Math.floor((finish.getTime() - start.getTime()) / 86400000) + 1;
        if (totalDays <= 0) {
            return false;
        }
        const percent = Math.max(0, Math.min(100, task.percentComplete || 0));
        const completedDays = Math.floor(totalDays * (percent / 100));
        const dayIndex = Math.floor((target.getTime() - start.getTime()) / 86400000);
        return dayIndex >= 0 && dayIndex < completedDays;
    }
    function isSameDay(day, other) {
        return day === (other || "").slice(0, 10);
    }
    function isWeekend(day) {
        const target = parseDateOnly(day);
        if (!target) {
            return false;
        }
        const weekday = target.getDay();
        return weekday === 0 || weekday === 6;
    }
    function parseDateOnly(value) {
        if (!value || value.length < 10) {
            return null;
        }
        const dateOnly = value.slice(0, 10);
        const [yearText, monthText, dayText] = dateOnly.split("-");
        const year = Number(yearText);
        const month = Number(monthText);
        const day = Number(dayText);
        if (!Number.isFinite(year) || !Number.isFinite(month) || !Number.isFinite(day)) {
            return null;
        }
        return new Date(year, month - 1, day);
    }
    function formatDateOnly(value) {
        return [
            value.getFullYear(),
            String(value.getMonth() + 1).padStart(2, "0"),
            String(value.getDate()).padStart(2, "0")
        ].join("-");
    }
    function formatDateLabel(day) {
        const target = parseDateOnly(day);
        if (!target) {
            return day;
        }
        const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        return `${String(target.getMonth() + 1).padStart(2, "0")}/${String(target.getDate()).padStart(2, "0")} ${weekdays[target.getDay()]}`;
    }
    function columnName(index) {
        let current = index;
        let name = "";
        while (current > 0) {
            const remainder = (current - 1) % 26;
            name = String.fromCharCode(65 + remainder) + name;
            current = Math.floor((current - 1) / 26);
        }
        return name;
    }
    globalThis.__mikuprojectWbsXlsx = {
        exportWbsWorkbook
    };
})();
