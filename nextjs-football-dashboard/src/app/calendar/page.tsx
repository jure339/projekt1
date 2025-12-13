"use client";

import { useEffect, useMemo, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";

type Trening = {
  id: string;
  ekipa_id: string;
  trener_id: string | null;
  zacetek: string;
  konec: string;
  povrsina: string;
  opis: string | null;
};

export default function KoledarPage() {
  // TODO: tole veži na prijavljenega trenerja / izbrane ekipe
  const ekipaId = useMemo(() => {
    return "TUKAJ-VSTAVI-ekipa_id"; // npr. prebereš iz sessiona ali iz URL parametra
  }, []);

  const [events, setEvents] = useState<any[]>([]);

  async function load(from?: string, to?: string) {
    const url = new URL("/api/treningi", window.location.origin);
    url.searchParams.set("ekipa_id", ekipaId);
    if (from && to) {
      url.searchParams.set("from", from);
      url.searchParams.set("to", to);
    }

    const res = await fetch(url.toString());
    const data: Trening[] = await res.json();

    setEvents(
      data.map((t) => ({
        id: t.id,
        title: `Trening (${t.povrsina})`,
        start: t.zacetek,
        end: t.konec,
        extendedProps: { povrsina: t.povrsina, opis: t.opis },
      }))
    );
  }

  useEffect(() => {
    load();
  }, [ekipaId]);

  async function createTrening(start: Date, end: Date) {
    const povrsina = prompt("Površina (npr. umetna, trava)?", "trava");
    if (!povrsina) return;

    const opis = prompt("Opis (opcijsko):", "") ?? "";

    await fetch("/api/treningi", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ekipa_id: ekipaId,
        trener_id: null, // TODO: iz sessiona
        zacetek: start.toISOString(),
        konec: end.toISOString(),
        povrsina,
        opis,
      }),
    });

    await load();
  }

  async function updateTrening(id: string, start: Date, end: Date) {
    await fetch(`/api/treningi/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        zacetek: start.toISOString(),
        konec: end.toISOString(),
      }),
    });
    await load();
  }

  async function deleteTrening(id: string) {
    const ok = confirm("Želiš izbrisati ta trening?");
    if (!ok) return;

    await fetch(`/api/treningi/${id}`, { method: "DELETE" });
    await load();
  }

  return (
    <div style={{ padding: 16 }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 12 }}>
        Koledar treningov
      </h1>

      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="timeGridWeek"
        selectable
        editable
        nowIndicator
        height="auto"
        events={events}
        select={(info) => createTrening(info.start, info.end)}
        eventDrop={(info) => updateTrening(info.event.id, info.event.start!, info.event.end!)}
        eventResize={(info) => updateTrening(info.event.id, info.event.start!, info.event.end!)}
        eventClick={(info) => deleteTrening(info.event.id)}
        datesSet={(arg) => load(arg.startStr, arg.endStr)}
      />
    </div>
  );
}
