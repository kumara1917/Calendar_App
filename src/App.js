import React, { useState, useEffect } from "react";
import "./index.css";

const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState(() => JSON.parse(localStorage.getItem("events")) || {});
  const [selectedDate, setSelectedDate] = useState(null);
  const [editingIndex, setEditingIndex] = useState(null);
  const [newEvent, setNewEvent] = useState({ title: "", time: "", color: "#3b82f6", repeat: "none" });

  useEffect(() => {
    localStorage.setItem("events", JSON.stringify(events));
  }, [events]);

  const handleMonthChange = (e) => {
    const month = parseInt(e.target.value);
    setCurrentDate(new Date(currentDate.getFullYear(), month, 1));
  };

  const handleYearChange = (e) => {
    const year = parseInt(e.target.value);
    setCurrentDate(new Date(year, currentDate.getMonth(), 1));
  };

  const renderCalendar = () => {
    const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    const days = [];

    for (let i = 0; i < firstDay.getDay(); i++) {
      days.push(<div key={`empty-${i}`} className="h-20"></div>);
    }

    for (let day = 1; day <= lastDay.getDate(); day++) {
      const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      const isToday = new Date().toDateString() === new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toDateString();
      const dayEvents = events[dateStr] || [];

      days.push(
        <div
          key={day}
          className={`border rounded-lg p-2 h-20 flex flex-col items-center justify-center cursor-pointer transition-all hover:bg-gray-200 ${
            isToday ? "bg-blue-500 text-white" : "bg-white"
          }`}
          onClick={() => setSelectedDate(dateStr)}
        >
          <div className="text-sm font-semibold">{day}</div>
          {dayEvents.map((event, index) => (
            <div
              key={index}
              className="text-[10px] mt-1 px-1 py-0.5 rounded-md text-white text-center"
              style={{ backgroundColor: event.color }}
              onClick={(e) => {
                e.stopPropagation();
                setEditingIndex(index);
                setSelectedDate(dateStr);
                setNewEvent(event);
              }}
            >
              {event.title} ({event.time})
            </div>
          ))}
        </div>
      );
    }

    return days;
  };

  const handleSaveEvent = () => {
    if (!newEvent.title || !newEvent.time) {
      alert("Please enter all fields!");
      return;
    }

    setEvents((prev) => {
      let updated = { ...prev };
      if (editingIndex !== null) {
        updated[selectedDate][editingIndex] = newEvent;
      } else {
        updated[selectedDate] = [...(prev[selectedDate] || []), newEvent];
      }

      if (newEvent.repeat !== "none") {
        generateRecurringDates(selectedDate, newEvent.repeat).forEach((date) => {
          updated[date] = [...(updated[date] || []), newEvent];
        });
      }

      return updated;
    });

    setNewEvent({ title: "", time: "", color: "#3b82f6", repeat: "none" });
    setSelectedDate(null);
    setEditingIndex(null);
  };

  const handleDeleteEvent = () => {
    if (editingIndex !== null) {
      setEvents((prev) => {
        let updated = { ...prev };
        updated[selectedDate].splice(editingIndex, 1);
        if (updated[selectedDate].length === 0) delete updated[selectedDate];
        return updated;
      });
    }

    setNewEvent({ title: "", time: "", color: "#3b82f6", repeat: "none" });
    setSelectedDate(null);
    setEditingIndex(null);
  };

  const generateRecurringDates = (startDate, repeat) => {
    let dates = [];
    let start = new Date(startDate);
    for (let i = 1; i <= 12; i++) {
      let newDate = new Date(start);
      if (repeat === "daily") newDate.setDate(newDate.getDate() + i);
      if (repeat === "weekly") newDate.setDate(newDate.getDate() + i * 7);
      if (repeat === "monthly") newDate.setMonth(newDate.getMonth() + i);
      dates.push(newDate.toISOString().split("T")[0]);
    }
    return dates;
  };

  const yearOptions = Array.from({ length: 2049 - 2000 + 1 }, (_, i) => 2000 + i);
  const monthOptions = Array.from({ length: 12 }, (_, i) => i);

  return (
    <div className="max-w-4xl mx-auto mt-6 p-4">
      <h1 className="text-3xl font-bold text-center mb-4">📅 Calendar App</h1>

      {}
      <div className="flex flex-col sm:flex-row justify-center sm:justify-between gap-4 items-center mb-6">
        <select value={currentDate.getMonth()} onChange={handleMonthChange} className="p-2 border rounded-md">
          {monthOptions.map((m) => (
            <option key={m} value={m}>
              {new Date(0, m).toLocaleString("default", { month: "long" })}
            </option>
          ))}
        </select>
        <select value={currentDate.getFullYear()} onChange={handleYearChange} className="p-2 border rounded-md">
          {yearOptions.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
      </div>

      {}
      <div className="grid grid-cols-7 text-center font-semibold text-sm sm:text-base mb-2">
        <div>Sun</div>
        <div>Mon</div>
        <div>Tue</div>
        <div>Wed</div>
        <div>Thu</div>
        <div>Fri</div>
        <div>Sat</div>
      </div>

      {}
      <div className="grid grid-cols-7 gap-2 sm:gap-3">{renderCalendar()}</div>

      {}
      {selectedDate && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 px-4 z-10">
          <div className="bg-white p-6 rounded-lg w-full max-w-sm max-h-[90vh] overflow-y-auto shadow-lg">
            <h2 className="text-lg font-bold mb-4">{editingIndex !== null ? "Edit Event" : "Add Event"}</h2>
            <input
              type="text"
              value={newEvent.title}
              onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
              className="w-full p-2 border rounded mb-2"
              placeholder="Event Title"
            />
            <input
              type="time"
              value={newEvent.time}
              onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
              className="w-full p-2 border rounded mb-2"
            />
            <input
              type="color"
              value={newEvent.color}
              onChange={(e) => setNewEvent({ ...newEvent, color: e.target.value })}
              className="w-full p-2 border rounded mb-2"
            />
            <select
              value={newEvent.repeat}
              onChange={(e) => setNewEvent({ ...newEvent, repeat: e.target.value })}
              className="w-full p-2 border rounded mb-2"
            >
              <option value="none">No Repeat</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
            <div className="flex justify-end gap-2">
              <button onClick={() => setSelectedDate(null)} className="px-4 py-2 bg-gray-300 rounded-lg">
                Cancel
              </button>
              {editingIndex !== null && (
                <button onClick={handleDeleteEvent} className="px-4 py-2 bg-red-500 text-white rounded-lg">
                  Delete
                </button>
              )}
              <button onClick={handleSaveEvent} className="px-4 py-2 bg-blue-500 text-white rounded-lg">
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Calendar;
