import { useState } from "react";
import CsvUpload from "./CsvUpload";
import Dashboard from "./Dashboard";

const SAMPLE_DATA = [
  { id: 1,  name: "Marcus T.",  role: "A&P Mechanic",     campus: "Dallas",  offeredSalary: 58000, expectedSalary: 68000, declineReason: "Compensation", date: "2026-01-08" },
  { id: 2,  name: "Sandra R.",  role: "Avionics Tech",     campus: "Phoenix", offeredSalary: 62000, expectedSalary: 70000, declineReason: "Compensation", date: "2026-01-15" },
  { id: 3,  name: "Devon K.",   role: "Line Instructor",   campus: "Atlanta", offeredSalary: 55000, expectedSalary: 55000, declineReason: "Location",     date: "2026-01-22" },
  { id: 4,  name: "Priya M.",   role: "Admissions Rep",    campus: "Dallas",  offeredSalary: 48000, expectedSalary: 54000, declineReason: "Compensation", date: "2026-02-03" },
  { id: 5,  name: "Jorge L.",   role: "A&P Mechanic",      campus: "Miami",   offeredSalary: 60000, expectedSalary: 75000, declineReason: "Compensation", date: "2026-02-10" },
  { id: 6,  name: "Tamara W.",  role: "Avionics Tech",     campus: "Dallas",  offeredSalary: 63000, expectedSalary: 65000, declineReason: "Benefits",     date: "2026-02-18" },
  { id: 7,  name: "Kris P.",    role: "Program Director",  campus: "Phoenix", offeredSalary: 80000, expectedSalary: 95000, declineReason: "Compensation", date: "2026-02-25" },
  { id: 8,  name: "Leila N.",   role: "Line Instructor",   campus: "Miami",   offeredSalary: 54000, expectedSalary: 60000, declineReason: "Compensation", date: "2026-03-04" },
  { id: 9,  name: "Andre B.",   role: "Admissions Rep",    campus: "Atlanta", offeredSalary: 46000, expectedSalary: 50000, declineReason: "Compensation", date: "2026-03-11" },
  { id: 10, name: "Natasha F.", role: "A&P Mechanic",      campus: "Phoenix", offeredSalary: 59000, expectedSalary: 72000, declineReason: "Compensation", date: "2026-03-18" },
  { id: 11, name: "Eli G.",     role: "Program Director",  campus: "Dallas",  offeredSalary: 82000, expectedSalary: 90000, declineReason: "Other Offer",  date: "2026-03-25" },
  { id: 12, name: "Carmen H.",  role: "Avionics Tech",     campus: "Atlanta", offeredSalary: 61000, expectedSalary: 68000, declineReason: "Compensation", date: "2026-04-01" },
  { id: 13, name: "Darius C.",  role: "Line Instructor",   campus: "Dallas",  offeredSalary: 53000, expectedSalary: 58000, declineReason: "Benefits",     date: "2026-04-07" },
  { id: 14, name: "Yuki S.",    role: "Admissions Rep",    campus: "Miami",   offeredSalary: 47000, expectedSalary: 55000, declineReason: "Compensation", date: "2026-04-14" },
  { id: 15, name: "Rowan D.",   role: "A&P Mechanic",      campus: "Atlanta", offeredSalary: 57000, expectedSalary: 65000, declineReason: "Other Offer",  date: "2026-04-20" },
];

export default function App() {
  const [data, setData] = useState(null);

  if (!data) {
    return (
      <CsvUpload
        onData={(parsed) => setData(parsed)}
        onUseSample={() => setData(SAMPLE_DATA)}
      />
    );
  }

  return <Dashboard data={data} onReset={() => setData(null)} />;
}
