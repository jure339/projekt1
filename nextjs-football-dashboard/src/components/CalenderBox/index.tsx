"use client";

import { useEffect, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";

export default function CalendarBox() {
  const [events, setEvents] = useState<any[]>([]);

  // NALOŽI DOGODKE
  useEffect(() => {
    fetch("../api/calendar", { cache: "no-store" })

      .then((res) => res.json())
      .then((data) => setEvents(data));
  }, []);

  // KLIK NA DATUM → USTVARJA NOV DOGODEK
  const handleDateClick = async (info: any) => {
    const type = prompt("Tip: trening ali tekma? (trening/tekma)");

    if (!type) return;

    const description = prompt("Opis / kraj?");
    const nasprotnik_id =
      type === "tekma" ? prompt("ID nasprotnika?") : null;

    const res = await fetch("/api/calendar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type,
        date: info.dateStr,
        description,
        nasprotnik_id,
      }),
    });

    const newEvent = await res.json();

    setEvents((prev) => [...prev, newEvent]);
  };

  return (
    <FullCalendar
      plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
      initialView="dayGridMonth"
      events={events}
      dateClick={handleDateClick}
    />
  );
}
