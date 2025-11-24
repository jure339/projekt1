"use client";

import { useState } from "react";
import CalendarBox from "@/components/CalenderBox";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import DatePickerOne from "@/components/FormElements/DatePicker/DatePickerOne";
import InputGroup from "@/components/FormElements/InputGroup";
import { Select } from "@/components/FormElements/select";

// Pomembno: v Select.tsx dodaj prop `name` v tip PropsType:
// type PropsType = {
//   label: string;
//   items: { label: string; value: string }[];
//   defaultValue?: string;
//   prefixIcon?: React.ReactNode;
//   name?: string; // <- dodano
// };

export default function CalendarPage() {
  const [refreshKey, setRefreshKey] = useState(0); // za osvežitev CalendarBox po dodajanju

  // Client-side funkcija za dodajanje dogodka
  async function addEvent(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const type = formData.get("type") as string;
    const date = formData.get("date") as string;
    const description = formData.get("description") as string;
    const nasprotnik_id = formData.get("nasprotnik_id") as string | null;

    const res = await fetch("/api/calendar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, date, description, nasprotnik_id }),
    });

    if (!res.ok) return alert("Napaka pri dodajanju dogodka");

    alert("Dogodek dodan!");
    setRefreshKey((prev) => prev + 1); // osveži CalendarBox
    e.currentTarget.reset(); // počisti formo
  }

  return (
    <>
      <Breadcrumb pageName="Koledar treningov & tekem" />

      <div className="grid grid-cols-1 gap-9 mt-6 md:grid-cols-3">
        {/* ====== LEFT: FORMA ====== */}
        <form
          onSubmit={addEvent}
          className="bg-white dark:bg-gray-dark p-6 rounded-lg shadow"
        >
          <h2 className="text-xl font-bold mb-4">Dodaj dogodek</h2>

          <Select
            label="Tip dogodka"
            items={[
              { label: "Trening", value: "trening" },
              { label: "Tekma", value: "tekma" },
            ]}
            name="type"
          />

          <DatePickerOne name="date" label="Datum & ura" />

          <InputGroup
            label="Opis / kraj"
            name="description"
            placeholder="Opis dogodka"
          />

          <InputGroup
            label="ID nasprotnika (samo za tekme)"
            name="nasprotnik_id"
            placeholder="ID nasprotne ekipe"
          />

          <button
            type="submit"
            className="w-full mt-4 rounded bg-blue-600 text-white p-2"
          >
            Dodaj dogodek
          </button>
        </form>

        {/* ====== RIGHT: KOLEDAR ====== */}
        <div className="md:col-span-2 bg-white dark:bg-gray-dark p-4 rounded-lg shadow">
          <CalendarBox key={refreshKey} /> {/* osvežitev koledarja ob dodajanju */}
        </div>
      </div>
    </>
  );
}
