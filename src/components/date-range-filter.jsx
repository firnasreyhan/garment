import { addDays, format, startOfYear, endOfYear } from "date-fns";
import { id } from "date-fns/locale";
import { Calendar } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { DateRange } from "react-date-range";

const DateRangeFilter = ({ onDateChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [state, setState] = useState([
    {
      startDate: format(startOfYear(new Date()), "yyyy-MM-dd"),
      endDate: format(endOfYear(new Date()), "yyyy-MM-dd"),
      key: "selection",
    },
  ]);

  const filterRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [filterRef]);

  useEffect(() => {
    if (onDateChange) {
      onDateChange(state[0]);
    }
  }, [state, onDateChange]);

  const formatDate = (date) => format(date, "dd MMM yyyy", { locale: id });

  return (
    <div className="relative font-poppins" ref={filterRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="ml-auto flex items-center justify-between w-72 px-4 py-2 text-left bg-white border rounded-md shadow-sm text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        <div className="flex items-center">
          <Calendar className="w-5 h-5 mr-3 text-gray-500" />
          <span className="whitespace-nowrap overflow-hidden text-ellipsis">{`${formatDate(state[0].startDate)} - ${formatDate(state[0].endDate)}`}</span>
        </div>
      </button>

      {isOpen && (
        <div className="absolute top-full mt-2 right-0 z-20">
          <DateRange
            editableDateInputs={true}
            onChange={(item) => setState([item.selection])}
            moveRangeOnFirstSelection={false}
            ranges={state}
            direction="horizontal"
            className="rounded-lg shadow-lg"
          />
        </div>
      )}
    </div>
  );
};

export default DateRangeFilter;
