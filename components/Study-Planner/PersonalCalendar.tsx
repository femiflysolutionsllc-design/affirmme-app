"use client";

import React, {
  useMemo,
  useState,
} from "react";

import {
  usePersistentState,
} from "../hooks/usePersistentState";

import {
  useCalendarSources,
} from "./calendar/useCalendarSources";

import type {
  CalendarEvent,
  EventType,
} from "./calendar/calendarTypes";

import CalendarEventForm from "./calendar/CalendarEventForm";
import DayDetailsModal from "./calendar/DayDetailsModal";
import UpcomingEventsPanel from "./calendar/UpcomingEventsPanel";
import CalendarGrid from "./calendar/CalendarGrid";
import UpcomingBillReminderCard from "./calendar/UpcomingBillReminderCard";
import CalendarDayView from "./calendar/CalendarDayView";
import QuickAddEventModal from "./calendar/QuickAddEventModal";

import {
  TYPE_STYLES,
  EVENT_TYPES,
  getLocalDateKey,
  formatDate,
  isGeneratedEvent,
} from "./calendar/calendarUtils";

/* =========================
   Form Types
========================= */

type EventFormState = {
  title: string;
  type: EventType;
  time: string;
  durationMinutes: number;
  prepMinutes: number;

  endDate: string;
  endTime: string;
};

const DEFAULT_FORM: EventFormState = {
  title: "",
  type: "Other",
  time: "",
  durationMinutes: 60,
  prepMinutes: 0,

  endDate: "",
  endTime: "",
};

/* =========================
   Component
========================= */

export default function PersonalCalendar() {
  const todayStr =
    getLocalDateKey(
      new Date()
    );

  /*
   * Only manual events are edited here.
   *
   * Generated PaySplit/paycheck events
   * come through useCalendarSources().
   */
  const [
    manualEvents,
    setManualEvents,
  ] =
    usePersistentState<CalendarEvent[]>(
      "calendar_events_v2",
      []
    );

  const {
    allEvents,
    upcomingBillReminders,
  } =
    useCalendarSources({
      manualEvents,
    });

  /* =========================
     Main Calendar State
  ========================= */

  const [
    currentMonth,
    setCurrentMonth,
  ] = useState<Date>(
    new Date(
      `${todayStr}T00:00:00`
    )
  );

  const [
    selectedDate,
    setSelectedDate,
  ] =
    useState<string>(
      todayStr
    );

  const [
    isDayOpen,
    setIsDayOpen,
  ] =
    useState(false);

  const [
    isAddEventOpen,
    setIsAddEventOpen,
  ] =
    useState(false);

  const [
    isQuickAddOpen,
    setIsQuickAddOpen,
  ] =
    useState(false);

  const [
    editingId,
    setEditingId,
  ] =
    useState<string | null>(
      null
    );

  const [
    form,
    setForm,
  ] =
    useState<EventFormState>(
      DEFAULT_FORM
    );

  const [
    listening,
    setListening,
  ] =
    useState(false);

  /* =========================
     Bill Reminder State
  ========================= */

  const [
    acknowledgedBillReminders,
    setAcknowledgedBillReminders,
  ] =
    usePersistentState<string[]>(
      "calendar_acknowledged_bill_reminders_v1",
      []
    );

  const [
    pinnedBillReminders,
    setPinnedBillReminders,
  ] =
    usePersistentState<string[]>(
      "calendar_pinned_bill_reminders_v1",
      []
    );

  /* =========================
     Derived Calendar Data
  ========================= */

  const eventsByDate =
    useMemo(() => {
      const map: Record<
        string,
        CalendarEvent[]
      > = {};

      for (
        const event of allEvents
      ) {
        if (!map[event.date]) {
          map[event.date] = [];
        }

        map[event.date].push(
          event
        );
      }

      for (
        const date of Object.keys(
          map
        )
      ) {
        map[date].sort(
          (
            first,
            second
          ) =>
            (
              first.time || ""
            ).localeCompare(
              second.time || ""
            )
        );
      }

      return map;
    }, [allEvents]);

    const eventsForSelectedDate =
  useMemo(() => {
    return allEvents
      .filter((event) => {
        const startDate =
          event.startDate ??
          event.date;

        const endDate =
          event.endDate ??
          startDate;

        return (
          selectedDate >=
            startDate &&
          selectedDate <=
            endDate
        );
      })
      .sort(
        (
          first,
          second
        ) =>
          (
            first.time || ""
          ).localeCompare(
            second.time || ""
          )
      );
  }, [
    allEvents,
    selectedDate,
  ]);

  const upcomingEvents =
    useMemo(() => {
      const now =
        new Date();

      return [
        ...allEvents,
      ]
        .filter(
          (event) => {
            const eventDateTime =
              event.time
                ? new Date(
                    `${event.date}T${event.time}:00`
                  )
                : new Date(
                    `${event.date}T23:59:59`
                  );

            return (
              eventDateTime.getTime() >=
              now.getTime()
            );
          }
        )
        .sort(
          (
            first,
            second
          ) => {
            const firstKey =
              `${first.date}${
                first.time ||
                "23:59"
              }`;

            const secondKey =
              `${second.date}${
                second.time ||
                "23:59"
              }`;

            return firstKey.localeCompare(
              secondKey
            );
          }
        )
        .slice(
          0,
          30
        );
    }, [allEvents]);

  const visibleBillReminders =
    useMemo(() => {
      return (
        upcomingBillReminders ||
        []
      ).filter(
        (reminder) =>
          !acknowledgedBillReminders.includes(
            reminder.id
          )
      );
    }, [
      upcomingBillReminders,
      acknowledgedBillReminders,
    ]);

  /* =========================
     Month Navigation
  ========================= */

  function handlePreviousMonth() {
    setCurrentMonth(
      (
        currentValue
      ) =>
        new Date(
          currentValue.getFullYear(),
          currentValue.getMonth() -
            1,
          1
        )
    );
  }

  function handleNextMonth() {
    setCurrentMonth(
      (
        currentValue
      ) =>
        new Date(
          currentValue.getFullYear(),
          currentValue.getMonth() +
            1,
          1
        )
    );
  }

  const monthLabel =
    currentMonth.toLocaleDateString(
      "en-US",
      {
        month: "long",
        year: "numeric",
      }
    );

  const currentYear =
    currentMonth.getFullYear();

  const currentMonthIndex =
    currentMonth.getMonth();

  const firstOfMonth =
    new Date(
      currentYear,
      currentMonthIndex,
      1
    );

  const startingWeekday =
    firstOfMonth.getDay();

  const daysInMonth =
    new Date(
      currentYear,
      currentMonthIndex +
        1,
      0
    ).getDate();

  const calendarCells: {
    label: string;
    dateStr?: string;
  }[] = [];

  for (
    let index = 0;
    index <
    startingWeekday;
    index += 1
  ) {
    calendarCells.push({
      label: "",
    });
  }

  for (
    let day = 1;
    day <= daysInMonth;
    day += 1
  ) {
    calendarCells.push({
      label:
        String(day),

      dateStr:
        formatDate(
          currentYear,
          currentMonthIndex,
          day
        ),
    });
  }

  function handlePreviousDay() {
    const date =
      new Date(
        `${selectedDate}T00:00:00`
      );
  
    date.setDate(
      date.getDate() - 1
    );
  
    setSelectedDate(
      getLocalDateKey(
        date
      )
    );
  
    setIsDayOpen(
      false
    );
  }
  
  function handleNextDay() {
    const date =
      new Date(
        `${selectedDate}T00:00:00`
      );
  
    date.setDate(
      date.getDate() + 1
    );
  
    setSelectedDate(
      getLocalDateKey(
        date
      )
    );
  
    setIsDayOpen(
      false
    );
  }

  /* =========================
     Form Helpers
  ========================= */

  function resetForm() {
    setEditingId(
      null
    );

    setForm({
      ...DEFAULT_FORM,
      endDate: selectedDate,
    });
  }

  function openNewEvent() {
    setEditingId(
      null
    );

    setForm(
      DEFAULT_FORM
    );

    setIsQuickAddOpen(
      false
    );

    setIsAddEventOpen(
      true
    );
  }

  function openNewEventAtTime(
    time: string
  ) {
    setEditingId(
      null
    );

    setForm({
      ...DEFAULT_FORM,
      time,
      endDate: selectedDate,
    });

    setIsAddEventOpen(
      false
    );

    setIsQuickAddOpen(
      true
    );
  }

  function startEditEvent(
    event: CalendarEvent
  ) {
    if (
      isGeneratedEvent(
        event
      )
    ) {
      return;
    }

    setSelectedDate(
      event.date
    );

    setEditingId(
      event.id
    );

    setForm({
      title: event.title,
      type: event.type,
      time:
        event.startTime ??
        event.time ??
        "",
    
      durationMinutes:
        event.durationMinutes ?? 60,
    
      prepMinutes:
        event.prepMinutes ?? 0,
    
      endDate:
        event.endDate ??
        event.date,
    
      endTime:
        event.endTime ??
        "",
    });

    setIsQuickAddOpen(
      false
    );

    setIsAddEventOpen(
      true
    );
  }

  /* =========================
     Manual Event CRUD
  ========================= */

  function saveEvent() {
    const title =
      form.title.trim();

    if (!title) {
      return;
    }

    if (editingId) {
      setManualEvents(
        manualEvents.map(
          (event) =>
            event.id ===
            editingId
              ? {
                  ...event,

                  date:
  selectedDate,

startDate:
  selectedDate,

title,

type:
  form.type,

time:
  form.time ||
  undefined,

startTime:
  form.time ||
  undefined,

endDate:
  form.endDate ||
  undefined,

endTime:
  form.endTime ||
  undefined,

durationMinutes:
  form.durationMinutes ||
  undefined,

prepMinutes:
  form.prepMinutes ||
  undefined,

                }
              : event
        )
      );
    } else {
      const newEvent: CalendarEvent = {
        id:
          crypto.randomUUID(),
      
        // Legacy compatibility
        date:
          selectedDate,
      
        time:
          form.time ||
          undefined,
      
        durationMinutes:
          form.durationMinutes ||
          undefined,
      
        // New date-range architecture
        startDate:
          selectedDate,
      
        startTime:
          form.time ||
          undefined,
      
        endDate:
          form.endDate ||
          undefined,
      
        endTime:
          form.endTime ||
          undefined,
      
        title,
      
        type:
          form.type,
      
        prepMinutes:
          form.prepMinutes ||
          undefined,
      
        source:
          "manual",
      };

      setManualEvents([
        ...manualEvents,
        newEvent,
      ]);
    }

    resetForm();

    setIsAddEventOpen(
      false
    );

    setIsQuickAddOpen(
      false
    );
  }

  function removeEvent(
    event: CalendarEvent
  ) {
    if (
      isGeneratedEvent(
        event
      )
    ) {
      return;
    }

    setManualEvents(
      manualEvents.filter(
        (
          savedEvent
        ) =>
          savedEvent.id !==
          event.id
      )
    );

    if (
      editingId ===
      event.id
    ) {
      resetForm();
    }
  }

  /* =========================
     Calendar Event Navigation
  ========================= */

  function openCalendarEvent(
    event: CalendarEvent
  ) {
    if (
      event.type ===
      "Bill"
    ) {
      window.location.hash =
        event.billId
          ? `#bill-${event.billId}`
          : "#paysplit";

      return;
    }

    if (
      event.type ===
      "Paycheck"
    ) {
      window.location.hash =
        "#paycheck-planner";

      return;
    }

    /*
     * Any normal/manual event
     * opens in the editor.
     *
     * Study is now treated like
     * a generic event type.
     */
    startEditEvent(
      event
    );
  }

  /* =========================
     Voice Input
  ========================= */

  function handleVoiceInput() {
    if (
      typeof window ===
      "undefined"
    ) {
      return;
    }

    const voiceWindow =
      window as typeof window & {
        SpeechRecognition?:
          new () => any;

        webkitSpeechRecognition?:
          new () => any;
      };

    const SpeechRecognitionClass =
      voiceWindow.SpeechRecognition ||
      voiceWindow.webkitSpeechRecognition;

    if (
      !SpeechRecognitionClass
    ) {
      alert(
        "Voice input is not supported on this device or browser."
      );

      return;
    }

    const recognition =
      new SpeechRecognitionClass();

    recognition.lang =
      "en-US";

    recognition.interimResults =
      false;

    recognition.maxAlternatives =
      1;

    recognition.onstart =
      () =>
        setListening(
          true
        );

    recognition.onend =
      () =>
        setListening(
          false
        );

    recognition.onerror =
      () =>
        setListening(
          false
        );

    recognition.onresult =
      (
        event: any
      ) => {
        const transcript =
          event.results[0][0]
            .transcript as string;

        setForm(
          (
            currentForm
          ) => ({
            ...currentForm,

            title:
              transcript,
          })
        );
      };

    recognition.start();
  }

  /* =========================
     Render
  ========================= */

  return (
    <section className="space-y-4 text-slate-100">
      {/* Bill Reminder */}

      {visibleBillReminders.length >
        0 && (
        <UpcomingBillReminderCard
          reminder={
            visibleBillReminders[0]
          }
          isPinned={pinnedBillReminders.includes(
            visibleBillReminders[0]
              .id
          )}
          onAcknowledge={() => {
            const reminder =
              visibleBillReminders[0];

            setAcknowledgedBillReminders(
              [
                ...acknowledgedBillReminders,
                reminder.id,
              ]
            );
          }}
          onPin={() => {
            const reminder =
              visibleBillReminders[0];

            const isAlreadyPinned =
              pinnedBillReminders.includes(
                reminder.id
              );

            setPinnedBillReminders(
              isAlreadyPinned
                ? pinnedBillReminders.filter(
                    (
                      id
                    ) =>
                      id !==
                      reminder.id
                  )
                : [
                    ...pinnedBillReminders,
                    reminder.id,
                  ]
            );
          }}
        />
      )}

      {/* Header */}

      <header className="space-y-1">
        <h2 className="text-lg font-semibold text-emerald-300">
          Personal Calendar
        </h2>

        <p className="text-xs text-slate-400">
          Keep your work,
          appointments, study,
          family plans, bills,
          paydays and personal
          events in one place.
        </p>
      </header>

      {/* Legend */}

      <div className="flex flex-wrap gap-2 text-[11px]">
        {EVENT_TYPES.map(
          (
            eventType
          ) => (
            <div
              key={
                eventType
              }
              className={
                "inline-flex items-center gap-1 rounded-full border px-2 py-1 " +
                TYPE_STYLES[
                  eventType
                ]
              }
            >
              <span className="inline-block h-2 w-2 rounded-full bg-current" />

              <span>
                {
                  eventType
                }
              </span>
            </div>
          )
        )}
      </div>

      {/* Main Calendar */}

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1.1fr)]">
        <CalendarGrid
          monthLabel={
            monthLabel
          }
          calendarCells={
            calendarCells
          }
          todayStr={
            todayStr
          }
          selectedDate={
            selectedDate
          }
          eventsByDate={
            eventsByDate
          }
          onPreviousMonth={
            handlePreviousMonth
          }
          onNextMonth={
            handleNextMonth
          }
          onSelectDate={(
            dateStr
          ) => {
            setSelectedDate(
              dateStr
            );

            resetForm();

            setIsDayOpen(
              true
            );
          }}
        />

        {/* Right Column */}

        <div className="space-y-3">
          <CalendarDayView
            selectedDate={
              selectedDate
            }
            events={
              eventsForSelectedDate
            }
            onOpenEvent={
              openCalendarEvent
            }
            onSelectTime={
              openNewEventAtTime
            }
            onPreviousDay={
              handlePreviousDay
            }
            onNextDay={
              handleNextDay
            }
          />

          {/* Main Add Button */}

          <button
            type="button"
            onClick={() => {
              if (
                isAddEventOpen
              ) {
                setIsAddEventOpen(
                  false
                );

                resetForm();

                return;
              }

              openNewEvent();
            }}
            className="flex w-full items-center justify-center gap-3 rounded-[18px] border-[3px] border-black bg-[#22C55E] px-6 py-5 text-lg font-black uppercase tracking-[0.08em] text-black shadow-[5px_5px_0px_black] transition active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0px_black]"
          >
            <span className="text-2xl">
              {isAddEventOpen
                ? "−"
                : "+"}
            </span>

            {isAddEventOpen
              ? "CLOSE EVENT FORM"
              : "ADD EVENT"}
          </button>

          {/* Add / Edit Form */}

          {/* Add Event Form */}

{isAddEventOpen &&
  !editingId && (
    <CalendarEventForm
      selectedDate={selectedDate}
      editingId={editingId}
      form={form}
      listening={listening}
      onChange={(patch) =>
        setForm((currentForm) => ({
          ...currentForm,
          ...patch,
        }))
      }
      onStartDateChange={(
        nextDate
      ) => {
        setSelectedDate(
          nextDate
        );
      
        setForm(
          (
            currentForm
          ) => ({
            ...currentForm,
      
            endDate:
              currentForm.endDate &&
              currentForm.endDate <
                nextDate
                ? nextDate
                : currentForm.endDate,
          })
        );
      }}
      onSave={saveEvent}
      onVoiceInput={handleVoiceInput}
      onClear={() => {
        resetForm();
      }}
    />
  )}

{/* Edit Event Modal */}

{isAddEventOpen &&
  editingId && (
    <div
      className="fixed inset-0 z-[130] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
      onClick={() => {
        setIsAddEventOpen(false);
        resetForm();
      }}
    >
      <div
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-[24px] border-[3px] border-black bg-[#111933] p-4 shadow-[8px_8px_0px_black]"
        onClick={(event) =>
          event.stopPropagation()
        }
      >
        <div className="mb-3 flex justify-end">
          <button
            type="button"
            onClick={() => {
              setIsAddEventOpen(false);
              resetForm();
            }}
            className="rounded-xl border-[2px] border-black bg-[#F43F7A] px-3 py-2 text-xs font-black text-white"
          >
            ✕ Close
          </button>
        </div>

        <CalendarEventForm
          selectedDate={selectedDate}
          editingId={editingId}
          form={form}
          listening={listening}
          onChange={(patch) =>
            setForm((currentForm) => ({
              ...currentForm,
              ...patch,
            }))
          }
          onSave={saveEvent}
          onVoiceInput={handleVoiceInput}
          onClear={() => {
            resetForm();
          }}
        />

<div className="mt-3">
  <button
    type="button"
    onClick={() => {
      const eventToDelete =
        manualEvents.find(
          (event) =>
            event.id === editingId
        );

      if (!eventToDelete) {
        return;
      }

      removeEvent(
        eventToDelete
      );

      setIsAddEventOpen(
        false
      );

      resetForm();
    }}
    className="w-full rounded-xl border-[3px] border-black bg-[#F43F7A] px-4 py-3 text-xs font-black uppercase text-white shadow-[3px_3px_0px_black]"
  >
    🗑 Delete Event
  </button>
</div>

      </div>
    </div>
  )}

          {/* Upcoming */}

          <UpcomingEventsPanel
            events={
              upcomingEvents
            }
            onOpenEvent={
              openCalendarEvent
            }
          />
        </div>
      </div>

      {/* Day Details */}

      <DayDetailsModal
        isOpen={
          isDayOpen
        }
        selectedDate={
          selectedDate
        }
        events={
          eventsForSelectedDate
        }
        onClose={() =>
          setIsDayOpen(
            false
          )
        }
        onAddEvent={() => {
          setIsDayOpen(
            false
          );

          openNewEvent();
        }}
        onEdit={(
          event
        ) => {
          setIsDayOpen(
            false
          );

          startEditEvent(
            event
          );
        }}
        onDelete={
          removeEvent
        }
      />

      {/* Timeline Quick Add */}

      <QuickAddEventModal
        isOpen={
          isQuickAddOpen
        }
        selectedDate={
          selectedDate
        }
        form={form}
        onChange={(
          patch
        ) =>
          setForm(
            (
              currentForm
            ) => ({
              ...currentForm,
              ...patch,
            })
          )
        }
        onSave={
          saveEvent
        }
        onClose={() => {
          setIsQuickAddOpen(
            false
          );

          resetForm();
        }}
      />
    </section>
  );
}