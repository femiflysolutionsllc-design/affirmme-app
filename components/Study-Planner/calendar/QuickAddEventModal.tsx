"use client";

import type {
  EventType,
} from "./calendarTypes";

type QuickAddForm = {
  title: string;
  type: EventType;
  time: string;
  durationMinutes: number;
  prepMinutes: number;
};

type QuickAddEventModalProps = {
  isOpen: boolean;
  selectedDate: string;
  form: QuickAddForm;

  onChange: (
    patch: Partial<QuickAddForm>
  ) => void;

  onSave: () => void;
  onClose: () => void;
};

const QUICK_EVENT_TYPES: EventType[] = [
  "Gym",
  "Study",
  "Work",
  "Appointment",
  "Self-care",
  "Other",
];

function formatTime(
  time: string
) {
  if (!time) {
    return "";
  }

  const date = new Date(
    `2000-01-01T${time}:00`
  );

  if (Number.isNaN(date.getTime())) {
    return time;
  }

  return new Intl.DateTimeFormat(
    "en-US",
    {
      hour: "numeric",
      minute: "2-digit",
    }
  ).format(date);
}

export default function QuickAddEventModal({
  isOpen,
  selectedDate,
  form,
  onChange,
  onSave,
  onClose,
}: QuickAddEventModalProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        className="w-full max-w-md rounded-[24px] border-[3px] border-black bg-[#111933] p-5 shadow-[8px_8px_0px_black]"
        onClick={(event) =>
          event.stopPropagation()
        }
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#60A5FA]">
              + Quick Add
            </p>

            <h3 className="mt-1 text-lg font-black text-white">
              {selectedDate}
            </h3>

            <p className="mt-1 text-xs font-semibold text-slate-400">
              {formatTime(
                form.time
              )}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border-[2px] border-black bg-[#F43F7A] px-3 py-2 text-xs font-black text-white"
          >
            ✕
          </button>
        </div>

        <div className="mt-5 space-y-3">
          <div>
            <label className="text-[10px] font-black uppercase text-slate-400">
              Event title
            </label>

            <input
              autoFocus
              value={form.title}
              onChange={(event) =>
                onChange({
                  title:
                    event.target.value,
                })
              }
              placeholder="Gym, study, appointment..."
              className="mt-1 w-full rounded-xl border border-slate-700 bg-[#0A1024] p-3 text-sm text-white"
            />
          </div>

          <div>
            <label className="text-[10px] font-black uppercase text-slate-400">
              Event type
            </label>

            <select
              value={form.type}
              onChange={(event) =>
                onChange({
                  type:
                    event.target
                      .value as EventType,
                })
              }
              className="mt-1 w-full rounded-xl border border-slate-700 bg-[#0A1024] p-3 text-sm text-white"
            >
              {QUICK_EVENT_TYPES.map(
                (eventType) => (
                  <option
                    key={eventType}
                    value={eventType}
                  >
                    {eventType}
                  </option>
                )
              )}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-black uppercase text-slate-400">
                Start time
              </label>

              <div className="mt-1 flex w-full min-w-0 rounded-xl border border-slate-700 bg-[#0A1024] px-3 py-2">
                <input
                  type="time"
                  value={form.time}
                  onChange={(event) =>
                    onChange({
                      time:
                        event.target.value,
                    })
                  }
                  className="block w-full min-w-0 border-0 bg-transparent p-0 text-sm text-white"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-black uppercase text-slate-400">
                Duration
              </label>

              <select
                value={
                  form.durationMinutes
                }
                onChange={(event) =>
                  onChange({
                    durationMinutes:
                      Number(
                        event.target.value
                      ),
                  })
                }
                className="mt-1 w-full rounded-xl border border-slate-700 bg-[#0A1024] p-3 text-sm text-white"
              >
                <option value={15}>
                  15 min
                </option>

                <option value={30}>
                  30 min
                </option>

                <option value={45}>
                  45 min
                </option>

                <option value={60}>
                  1 hour
                </option>

                <option value={90}>
                  1 hr 30 min
                </option>

                <option value={120}>
                  2 hours
                </option>

                <option value={180}>
  3 hours
</option>

<option value={240}>
  4 hours
</option>

<option value={360}>
  6 hours
</option>

<option value={480}>
  8 hours
</option>

<option value={720}>
  12 hours
</option>
                
              </select>
            </div>
          </div>

          <div>
  <label className="text-[10px] font-black uppercase text-slate-400">
    Prep / Travel Time
  </label>

  <select
    value={form.prepMinutes}
    onChange={(event) =>
      onChange({
        prepMinutes: Number(
          event.target.value
        ),
      })
    }
    className="mt-1 w-full rounded-xl border border-slate-700 bg-[#0A1024] p-3 text-sm text-white"
  >
    <option value={0}>
      None
    </option>

    <option value={15}>
      15 minutes before
    </option>

    <option value={30}>
      30 minutes before
    </option>

    <option value={45}>
      45 minutes before
    </option>

    <option value={60}>
      1 hour before
    </option>

    <option value={90}>
      1 hour 30 minutes before
    </option>

    <option value={120}>
      2 hours before
    </option>
  </select>
</div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onSave}
              className="flex-1 rounded-xl border-[3px] border-black bg-[#22C55E] px-4 py-3 text-xs font-black uppercase text-black shadow-[3px_3px_0px_black]"
            >
              + Add Event
            </button>

            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border-[3px] border-black bg-slate-200 px-4 py-3 text-xs font-black uppercase text-black shadow-[3px_3px_0px_black]"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}