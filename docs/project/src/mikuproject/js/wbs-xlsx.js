(() => {
    const HEADER_FILL = "#D9EAF7";
    const HEADER_ID_FILL = "#D7E7F6";
    const HEADER_STRUCTURE_FILL = "#E6F0DF";
    const HEADER_SCHEDULE_FILL = "#FDE7D3";
    const HEADER_STATUS_FILL = "#FBE4EC";
    const HEADER_ASSIGNMENT_FILL = "#E2F1EF";
    const PHASE_FILL = "#EEF7E8";
    const TASK_KIND_FILL = "#EEF2F6";
    const MILESTONE_FILL = "#FFF4E0";
    const PLACEHOLDER_FILL = "#F5F7FA";
    const BAND_FILL = "#F4F7FB";
    const ACTIVE_BAND_FILL = "#9FD5C9";
    const PROGRESS_BAND_FILL = "#5BAE9C";
    const WEEKEND_BAND_FILL = "#F1F1F1";
    const WEEK_START_BAND_FILL = "#E3EEF9";
    const MONTH_BOUNDARY_WEEK_FILL = "#D6E7F8";
    const MONTH_START_HEADER_FILL = "#DCEAF7";
    const TODAY_BAND_FILL = "#FFE6A7";
    const TODAY_ACTIVE_BAND_FILL = "#F3C96B";
    const TODAY_PROGRESS_BAND_FILL = "#D89A2B";
    const HOLIDAY_BAND_FILL = "#FCE4EC";
    const DIVIDER_FILL = "#C5D1DB";
    function collectWbsHolidayDates(model) {
        const holidaySet = new Set();
        for (const calendar of model.calendars) {
            for (const exception of calendar.exceptions || []) {
                if (exception.dayWorking !== false && (exception.workingTimes || []).length > 0) {
                    continue;
                }
                for (const day of expandExceptionDays(exception)) {
                    holidaySet.add(day);
                }
            }
        }
        return Array.from(holidaySet).sort();
    }
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
        const dividerColumnIndex = fixedHeaders.length + 1;
        const dateBandStartColumnIndex = dividerColumnIndex + 1;
        const totalColumns = fixedHeaders.length + 1 + dateBand.length;
        const lastColumnRef = columnName(totalColumns);
        const weekBandRanges = buildWeekBandRanges(dateBand, dateBandStartColumnIndex, 8);
        return {
            sheets: [
                {
                    name: "WBS",
                    columns: [
                        { width: 8 }, { width: 8 }, { width: 14 }, { width: 12 }, { width: 12 }, { width: 34 },
                        { width: 20 }, { width: 20 }, { width: 14 }, { width: 14 },
                        { width: 18 }, { width: 12 }, { width: 12 }, { width: 12 },
                        { width: 20 }, { width: 14 }, { width: 24 }, { width: 22 }, { width: 3 },
                        ...dateBand.map(() => ({ width: 6 }))
                    ],
                    mergedRanges: [
                        `A1:${lastColumnRef}1`,
                        `A2:${lastColumnRef}2`,
                        `A3:${lastColumnRef}3`,
                        `A4:${lastColumnRef}4`,
                        ...weekBandRanges.map((item) => item.range)
                    ],
                    rows: [
                        sectionTitleRow("WBS", totalColumns),
                        sectionTitleRow(model.project.name || "Project", totalColumns),
                        infoRow(`Title=${model.project.title || "-"} / Calendar=${model.project.calendarUID || "-"} / ScheduleFromStart=${model.project.scheduleFromStart ? "true" : "false"}`, totalColumns),
                        infoRow(`Start=${model.project.startDate || "-"} / Finish=${model.project.finishDate || "-"} / CurrentDate=${model.project.currentDate || "-"} / Holidays=${holidaySet.size}`, totalColumns),
                        displaySummaryRow(dateBand.length, model.project.currentDate, model.tasks.length, model.resources.length, model.assignments.length, model.calendars.length, totalColumns),
                        legendRow(totalColumns),
                        sectionTitleRow(`Task View / BaseDate=${(model.project.currentDate || "-").slice(0, 10) || "-"}`, totalColumns),
                        weekBandRow(fixedHeaders.length + 1, weekBandRanges, dateBand.length),
                        todayGuideRow(fixedHeaders.length + 1, dateBand, model.project.currentDate, holidaySet),
                        headerRow([
                            ...fixedHeaders,
                            dividerCell(),
                            ...dateBand.map((day) => dateHeaderCell(day, model.project.currentDate, holidaySet))
                        ]),
                        ...model.tasks.map((task) => ({
                            cells: [
                                taskCell(task, task.uid, "center"),
                                taskCell(task, task.id, "center"),
                                taskCell(task, task.wbs || task.outlineNumber, "center"),
                                kindCell(task),
                                taskCell(task, task.outlineLevel, "center"),
                                taskCell(task, formatTaskLabel(task)),
                                taskCell(task, task.start),
                                taskCell(task, task.finish),
                                taskCell(task, task.duration, "center"),
                                taskCell(task, task.percentComplete, "center"),
                                taskCell(task, task.percentWorkComplete, "center"),
                                flagCell(task, task.milestone, "M"),
                                flagCell(task, task.summary, "S"),
                                flagCell(task, task.critical, "!"),
                                referenceCell(task, firstResourceName(resourceNamesByTaskUid.get(task.uid)), "center"),
                                referenceCell(task, formatCalendarLabel(task.calendarUID || model.project.calendarUID, calendarNameByUid), "center"),
                                referenceCell(task, (resourceNamesByTaskUid.get(task.uid) || []).join(", ")),
                                referenceCell(task, task.predecessors.map((item) => predecessorNameByUid.get(item.predecessorUid) || item.predecessorUid).join(", ")),
                                dividerCell(),
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
    function displayReferenceValue(value) {
        return value && value.trim() ? value : "-";
    }
    function referenceCell(task, value, horizontalAlign = "left") {
        const displayValue = displayReferenceValue(value);
        const placeholder = displayValue === "-";
        return {
            value: displayValue,
            border: "thin",
            horizontalAlign,
            bold: task.summary || task.milestone || false,
            fillColor: placeholder ? PLACEHOLDER_FILL : (task.summary ? PHASE_FILL : (task.milestone ? MILESTONE_FILL : undefined))
        };
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
    function legendRow(columnCount) {
        const items = [
            {
                value: "Legend",
                bold: true,
                border: "thin",
                horizontalAlign: "center"
            },
            {
                value: "進捗済み",
                fillColor: PROGRESS_BAND_FILL,
                border: "thin",
                horizontalAlign: "center"
            },
            {
                value: "予定帯",
                fillColor: ACTIVE_BAND_FILL,
                border: "thin",
                horizontalAlign: "center"
            },
            {
                value: "Today",
                fillColor: TODAY_BAND_FILL,
                border: "thin",
                horizontalAlign: "center"
            },
            {
                value: "週頭",
                fillColor: WEEK_START_BAND_FILL,
                border: "thin",
                horizontalAlign: "center"
            },
            {
                value: "週末",
                fillColor: WEEKEND_BAND_FILL,
                border: "thin",
                horizontalAlign: "center"
            },
            {
                value: "祝日",
                fillColor: HOLIDAY_BAND_FILL,
                border: "thin",
                horizontalAlign: "center"
            },
            {
                value: "━:phase",
                fillColor: PHASE_FILL,
                border: "thin",
                horizontalAlign: "center"
            },
            {
                value: "■:task",
                fillColor: ACTIVE_BAND_FILL,
                border: "thin",
                horizontalAlign: "center"
            },
            {
                value: "◆:milestone",
                fillColor: MILESTONE_FILL,
                border: "thin",
                horizontalAlign: "center"
            },
            {
                value: "M:Milestone",
                fillColor: HEADER_STATUS_FILL,
                border: "thin",
                horizontalAlign: "center"
            },
            {
                value: "S:Summary",
                fillColor: HEADER_STATUS_FILL,
                border: "thin",
                horizontalAlign: "center"
            },
            {
                value: "!:Critical",
                fillColor: HEADER_STATUS_FILL,
                border: "thin",
                horizontalAlign: "center"
            },
            {
                value: "-:未設定",
                fillColor: PLACEHOLDER_FILL,
                border: "thin",
                horizontalAlign: "center"
            }
        ];
        return {
            height: 22,
            cells: [
                ...items,
                ...Array.from({ length: Math.max(0, columnCount - items.length) }, () => ({}))
            ]
        };
    }
    function weekBandRow(fixedColumnCount, weekBandRanges, dateBandLength) {
        const bandCells = Array.from({ length: dateBandLength }, () => ({}));
        weekBandRanges.forEach((item, index) => {
            bandCells[item.startIndex] = {
                value: item.label,
                bold: true,
                border: "thin",
                horizontalAlign: "center",
                fillColor: item.hasMonthBoundary ? MONTH_BOUNDARY_WEEK_FILL : (index % 2 === 0 ? "#EDF4FB" : "#E4EEF8")
            };
        });
        return {
            height: 22,
            cells: [
                ...Array.from({ length: fixedColumnCount }, () => ({})),
                ...bandCells
            ]
        };
    }
    function displaySummaryRow(displayDays, baseDate, taskCount, resourceCount, assignmentCount, calendarCount, columnCount) {
        const displayWeeks = displayDays > 0 ? Math.ceil(displayDays / 7) : 0;
        const items = [
            summaryStatCell("DisplayDays", HEADER_SCHEDULE_FILL),
            summaryStatCell(displayDays, HEADER_SCHEDULE_FILL),
            summaryStatCell("DisplayWeeks", HEADER_SCHEDULE_FILL),
            summaryStatCell(displayWeeks, HEADER_SCHEDULE_FILL),
            summaryStatCell("Tasks", HEADER_ASSIGNMENT_FILL),
            summaryStatCell(taskCount, HEADER_ASSIGNMENT_FILL),
            summaryStatCell("Resources", HEADER_ASSIGNMENT_FILL),
            summaryStatCell(resourceCount, HEADER_ASSIGNMENT_FILL),
            summaryStatCell("Assignments", HEADER_ASSIGNMENT_FILL),
            summaryStatCell(assignmentCount, HEADER_ASSIGNMENT_FILL),
            summaryStatCell("Calendars", HEADER_ASSIGNMENT_FILL),
            summaryStatCell(calendarCount, HEADER_ASSIGNMENT_FILL),
            summaryStatCell("BaseDate", HEADER_SCHEDULE_FILL),
            summaryStatCell((baseDate || "-").slice(0, 10), HEADER_SCHEDULE_FILL)
        ];
        return {
            height: 22,
            cells: [
                ...items,
                ...Array.from({ length: Math.max(0, columnCount - items.length) }, () => ({}))
            ]
        };
    }
    function summaryStatCell(value, fillColor) {
        return {
            value,
            border: "thin",
            horizontalAlign: "center",
            bold: true,
            fillColor
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
                        fillColor: headerFillForLabel(label),
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
    function dividerCell() {
        return {
            value: "",
            fillColor: DIVIDER_FILL,
            border: "thin",
            horizontalAlign: "center"
        };
    }
    function headerFillForLabel(label) {
        if (label === "UID" || label === "ID") {
            return HEADER_ID_FILL;
        }
        if (label === "WBS" || label === "Kind" || label === "OutlineLevel" || label === "Name") {
            return HEADER_STRUCTURE_FILL;
        }
        if (label === "Start" || label === "Finish" || label === "Duration") {
            return HEADER_SCHEDULE_FILL;
        }
        if (label === "PercentComplete" || label === "PercentWorkComplete" || label === "Milestone" || label === "Summary" || label === "Critical") {
            return HEADER_STATUS_FILL;
        }
        if (label === "Owner" || label === "Calendar" || label === "Resources" || label === "Predecessors") {
            return HEADER_ASSIGNMENT_FILL;
        }
        return HEADER_FILL;
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
                    value: isSameDay(day, currentDate) ? "TODAY" : "",
                    bold: true,
                    border: "thin",
                    horizontalAlign: "center",
                    fillColor: isSameDay(day, currentDate) ? TODAY_BAND_FILL : (holidaySet.has(day) ? HOLIDAY_BAND_FILL : (isWeekStart(day) ? WEEK_START_BAND_FILL : BAND_FILL))
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
    function kindCell(task) {
        return {
            value: classifyTaskKind(task),
            border: "thin",
            horizontalAlign: "center",
            bold: true,
            fillColor: task.summary ? PHASE_FILL : (task.milestone ? MILESTONE_FILL : TASK_KIND_FILL)
        };
    }
    function flagCell(task, enabled, marker) {
        return {
            value: enabled ? marker : "",
            border: "thin",
            horizontalAlign: "center",
            bold: !!enabled,
            fillColor: task.summary ? PHASE_FILL : (task.milestone ? MILESTONE_FILL : undefined)
        };
    }
    function dateHeaderCell(day, currentDate, holidaySet) {
        const isToday = isSameDay(day, currentDate);
        const isWeekendDay = isWeekend(day);
        const isHoliday = holidaySet.has(day);
        const weekStart = isWeekStart(day);
        const monthStart = isMonthStart(day);
        return {
            value: isToday ? `${formatDateLabel(day)} *` : formatDateLabel(day),
            bold: true,
            border: "thin",
            horizontalAlign: "center",
            fillColor: isToday ? TODAY_BAND_FILL : (isHoliday ? HOLIDAY_BAND_FILL : (isWeekendDay ? WEEKEND_BAND_FILL : (monthStart ? MONTH_START_HEADER_FILL : (weekStart ? WEEK_START_BAND_FILL : HEADER_FILL))))
        };
    }
    function dateBandCell(task, day, currentDate, holidaySet) {
        const active = includesDay(task.start, task.finish, day);
        const isToday = isSameDay(day, currentDate);
        const isWeekendDay = isWeekend(day);
        const isHoliday = holidaySet.has(day);
        const weekStart = isWeekStart(day);
        const complete = active && isCompletedDay(task, day);
        return {
            value: active ? activeBandMarker(task) : "",
            border: "thin",
            horizontalAlign: "center",
            fillColor: active
                ? (complete
                    ? (isToday ? TODAY_PROGRESS_BAND_FILL : PROGRESS_BAND_FILL)
                    : (isToday ? TODAY_ACTIVE_BAND_FILL : ACTIVE_BAND_FILL))
                : (isToday ? TODAY_BAND_FILL : (isHoliday ? HOLIDAY_BAND_FILL : (isWeekendDay ? WEEKEND_BAND_FILL : (weekStart ? WEEK_START_BAND_FILL : BAND_FILL))))
        };
    }
    function activeBandMarker(task) {
        if (task.summary) {
            return "━";
        }
        if (task.milestone) {
            return "◆";
        }
        return "■";
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
    function buildWeekBandRanges(dateBand, startColumnIndex, rowNumber) {
        const ranges = [];
        if (dateBand.length === 0) {
            return ranges;
        }
        let chunkStart = 0;
        while (chunkStart < dateBand.length) {
            const weekStart = formatWeekKey(dateBand[chunkStart]);
            let chunkEnd = chunkStart;
            while (chunkEnd + 1 < dateBand.length && formatWeekKey(dateBand[chunkEnd + 1]) === weekStart) {
                chunkEnd += 1;
            }
            const startColumn = columnName(startColumnIndex + chunkStart);
            const endColumn = columnName(startColumnIndex + chunkEnd);
            const chunkDays = dateBand.slice(chunkStart, chunkEnd + 1);
            ranges.push({
                range: `${startColumn}${rowNumber}:${endColumn}${rowNumber}`,
                startIndex: chunkStart,
                label: formatWeekLabel(chunkDays),
                hasMonthBoundary: chunkDays.some((day) => isMonthStart(day))
            });
            chunkStart = chunkEnd + 1;
        }
        return ranges;
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
    function isWeekStart(day) {
        const target = parseDateOnly(day);
        if (!target) {
            return false;
        }
        return target.getDay() === 1;
    }
    function isMonthStart(day) {
        const target = parseDateOnly(day);
        if (!target) {
            return false;
        }
        return target.getDate() === 1;
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
    function expandExceptionDays(exception) {
        const from = (exception.fromDate || "").slice(0, 10);
        const to = (exception.toDate || "").slice(0, 10);
        if (!from) {
            return [];
        }
        if (!to || to === from) {
            return [from];
        }
        const start = parseDateOnly(from);
        const finish = parseDateOnly(to);
        if (!start || !finish || start.getTime() > finish.getTime()) {
            return [from];
        }
        const days = [];
        const cursor = new Date(start.getTime());
        while (cursor.getTime() <= finish.getTime()) {
            days.push(formatDateOnly(cursor));
            cursor.setDate(cursor.getDate() + 1);
        }
        return days;
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
    function formatWeekKey(day) {
        const target = parseDateOnly(day);
        if (!target) {
            return day;
        }
        const monday = new Date(target.getTime());
        const offset = (monday.getDay() + 6) % 7;
        monday.setDate(monday.getDate() - offset);
        return formatDateOnly(monday);
    }
    function formatWeekLabel(days) {
        if (days.length === 0) {
            return "Week";
        }
        const start = parseDateOnly(days[0]);
        if (!start) {
            return days[0];
        }
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const monthSet = new Set(days.map((day) => {
            const target = parseDateOnly(day);
            return target ? target.getMonth() : -1;
        }));
        const startLabel = `${monthNames[start.getMonth()]} ${String(start.getDate()).padStart(2, "0")}`;
        if (monthSet.size <= 1) {
            return `Week of ${startLabel}`;
        }
        const tailMonths = Array.from(monthSet)
            .filter((monthIndex) => monthIndex >= 0 && monthIndex !== start.getMonth())
            .map((monthIndex) => monthNames[monthIndex]);
        return `Week of ${startLabel} / ${tailMonths.join(" / ")}`;
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
        collectWbsHolidayDates,
        exportWbsWorkbook
    };
})();
