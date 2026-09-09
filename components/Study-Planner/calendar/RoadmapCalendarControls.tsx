"use client";

import type {
  StudyTimePreference,
} from "./calendarTypes";

type RoadmapCalendarControlsProps = {
  roadmapStartDate: string;
  studyTimePref: StudyTimePreference;

  onStartDateChange: (
    value: string
  ) => void;

  onStudyTimeChange: (
    value: StudyTimePreference
  ) => void;

  onSync: () => void;
};

export default function RoadmapCalendarControls({
  roadmapStartDate,
  studyTimePref,
  onStartDateChange,
  onStudyTimeChange,
  onSync,
}: RoadmapCalendarControlsProps) {
  return (
    <div className="space-y-2 rounded-xl border border-emerald-500/40 bg-slate-950/80 p-3 text-xs">
      <p className="text-[11px] font-semibold text-emerald-200">
        12-Week LPN Roadmap → Calendar
      </p>

      <p className="text-[11px] text-slate-400">
        Choose when Week 1 begins
        and your preferred study
        time.
      </p>

      <div className="flex flex-wrap gap-2">
        <div className="flex flex-col gap-1">
          <label className="text-[10px] text-slate-400">
            Week 1 start date
          </label>

          <input
            type="date"
            className="rounded-md border border-slate-700 bg-slate-900/80 p-1.5 text-[11px]"
            value={roadmapStartDate}
            onChange={(event) =>
              onStartDateChange(
                event.target.value
              )
            }
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-[10px] text-slate-400">
            Preferred study time
          </label>

          <select
            className="rounded-md border border-slate-700 bg-slate-900/80 p-1.5 text-[11px]"
            value={studyTimePref}
            onChange={(event) =>
              onStudyTimeChange(
                event.target
                  .value as StudyTimePreference
              )
            }
          >
            <option value="morning">
              Morning (9:00)
            </option>

            <option value="afternoon">
              Afternoon (2:00)
            </option>

            <option value="evening">
              Evening (8:00)
            </option>
          </select>
        </div>

        <div className="flex items-end">
          <button
            type="button"
            onClick={onSync}
            className="rounded-md bg-emerald-500 px-3 py-1.5 text-[11px] font-semibold text-slate-950 hover:bg-emerald-400"
          >
            Add roadmap to calendar
          </button>
        </div>
      </div>
    </div>
  );
}