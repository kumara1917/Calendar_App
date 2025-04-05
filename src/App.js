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

  const handlePrevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const handleNextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

  const renderCalendar = () => {
    const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    let calendarDays = [];

    for (let i = 0; i < firstDay.getDay(); i++) {
      calendarDays.push(<div key={`empty-${i}`} className="h-20"></div>);
    }

    for (let day = 1; day <= lastDay.getDate(); day++) {
      const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      const isToday = new Date().toDateString() === new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toDateString();
      const dayEvents = events[dateStr] || [];

      calendarDays.push(
        <div
          key={day}
          className={`border rounded-lg p-2 h-20 flex flex-col items-center justify-start cursor-pointer transition-all hover:bg-gray-200 ${
            isToday ? "bg-blue-500 text-white" : "bg-white"
          }`}
          onClick={() => setSelectedDate(dateStr)}
        >
          {day}
          {dayEvents.map((event, index) => (
            <div
              key={index}
              className="text-xs mt-1 px-1 py-0.5 rounded-md text-white flex justify-between gap-1"
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

    return calendarDays;
  };

  const handleSaveEvent = () => {
    if (!newEvent.title || !newEvent.time) {
      alert("Please enter all fields!");
      return;
    }

    setEvents((prev) => {
      let updatedEvents = { ...prev };
      if (editingIndex !== null) {
        updatedEvents[selectedDate][editingIndex] = newEvent;
      } else {
        updatedEvents[selectedDate] = [...(prev[selectedDate] || []), newEvent];
      }
      if (newEvent.repeat !== "none") {
        let repeatDates = generateRecurringDates(selectedDate, newEvent.repeat);
        repeatDates.forEach((date) => {
          updatedEvents[date] = [...(updatedEvents[date] || []), newEvent];
        });
      }

      return updatedEvents;
    });

    setNewEvent({ title: "", time: "", color: "#3b82f6", repeat: "none" });
    setSelectedDate(null);
    setEditingIndex(null);
  };

  const handleDeleteEvent = () => {
    if (editingIndex !== null) {
      setEvents((prev) => {
        let updatedEvents = { ...prev };
        updatedEvents[selectedDate].splice(editingIndex, 1);
        if (updatedEvents[selectedDate].length === 0) delete updatedEvents[selectedDate];
        return updatedEvents;
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

  return (
    <div className="max-w-4xl mx-auto mt-10 p-4">
      <h1 className="text-3xl font-bold text-center">Calendar App</h1>

      <div className="flex justify-between items-center mt-6">
        <button onClick={handlePrevMonth} className="px-4 py-2 bg-blue-500 text-white rounded-lg">Previous</button>
        <h2 className="text-xl font-semibold">{currentDate.toLocaleString("default", { month: "long", year: "numeric" })}</h2>
        <button onClick={handleNextMonth} className="px-4 py-2 bg-blue-500 text-white rounded-lg">Next</button>
      </div>

      <div className="grid grid-cols-7 gap-2 mt-6">{renderCalendar()}</div>

      {selectedDate && (
        <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg w-96 shadow-lg">
            <h3 className="text-xl font-semibold mb-4">{editingIndex !== null ? "Edit Event" : "Add Event"}</h3>
            <input type="text" value={newEvent.title} onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })} className="w-full p-2 border rounded mb-2" placeholder="Event Title" />
            <input type="time" value={newEvent.time} onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })} className="w-full p-2 border rounded mb-2" />
            <input type="color" value={newEvent.color} onChange={(e) => setNewEvent({ ...newEvent, color: e.target.value })} className="w-full p-2 border rounded mb-2" />
            <select value={newEvent.repeat} onChange={(e) => setNewEvent({ ...newEvent, repeat: e.target.value })} className="w-full p-2 border rounded mb-2">
              <option value="none">No Repeat</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
            <div className="flex justify-end gap-2">
              <button onClick={() => setSelectedDate(null)} className="px-4 py-2 bg-gray-300 rounded-lg">Cancel</button>
              {editingIndex !== null && <button onClick={handleDeleteEvent} className="px-4 py-2 bg-red-500 text-white rounded-lg">Delete</button>}
              <button onClick={handleSaveEvent} className="px-4 py-2 bg-blue-500 text-white rounded-lg">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Calendar;
