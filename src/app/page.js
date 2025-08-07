// src/app/page.jsx
'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { PieChart, Pie, Cell, Tooltip } from 'recharts';

// The main dashboard component.
export default function Page() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(null);

  // State for "Whole Time" statistics
  const [totalTrashAllTime, setTotalTrashAllTime] = useState(0);
  const [trashTypeAllTime, setTrashTypeAllTime] = useState({
    PET: 0,
    CAN: 0,
    'GLASS BOTTLE': 0,
  });

  // State for "This Month" statistics
  const [totalTrashThisMonth, setTotalTrashThisMonth] = useState(0);
  const [trashTypeThisMonth, setTrashTypeThisMonth] = useState({
    PET: 0,
    CAN: 0,
    'GLASS BOTTLE': 0,
  });

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const logsPerPage = 10; // Number of logs to display per page

  // Effect to fetch log data from the API and refresh it every 5 seconds.
  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await fetch('/api/logs');
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        const data = await res.json();
        setLogs(data);
        setLastRefresh(new Date());
      } catch (error) {
        console.error('Error fetching logs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
    const intervalId = setInterval(fetchLogs, 5000);

    // Cleanup function to clear the interval when the component unmounts.
    return () => clearInterval(intervalId);
  }, []);

  // Effect to process the logs data whenever it changes.
  useEffect(() => {
    if (logs.length > 0) {
      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();

      const newTrashTypeAllTime = { PET: 0, CAN: 0, 'GLASS BOTTLE': 0 };
      const newTrashTypeThisMonth = { PET: 0, CAN: 0, 'GLASS BOTTLE': 0 };
      let newTotalTrashThisMonth = 0;

      logs.forEach(log => {
        const logDate = new Date(log.time_stamp);
        const trashName = log.trash_name.toUpperCase();

        if (newTrashTypeAllTime[trashName] !== undefined) {
          newTrashTypeAllTime[trashName] += 1;
        }

        if (logDate.getMonth() === currentMonth && logDate.getFullYear() === currentYear) {
          newTotalTrashThisMonth += 1;
          if (newTrashTypeThisMonth[trashName] !== undefined) {
            newTrashTypeThisMonth[trashName] += 1;
          }
        }
      });

      setTotalTrashAllTime(logs.length);
      setTrashTypeAllTime(newTrashTypeAllTime);
      setTotalTrashThisMonth(newTotalTrashThisMonth);
      setTrashTypeThisMonth(newTrashTypeThisMonth);
    }
  }, [logs]);

  // Data for the "Whole Time" pie chart (memoized).
  const pieDataAllTime = useMemo(() => {
    return [
      { name: 'PET', value: trashTypeAllTime.PET },
      { name: 'CAN', value: trashTypeAllTime.CAN },
      { name: 'GLASS BOTTLE', value: trashTypeAllTime['GLASS BOTTLE'] },
    ].filter(data => data.value > 0);
  }, [trashTypeAllTime]);

  // Data for the "This Month" pie chart (memoized).
  const pieDataThisMonth = useMemo(() => {
    return [
      { name: 'PET', value: trashTypeThisMonth.PET },
      { name: 'CAN', value: trashTypeThisMonth.CAN },
      { name: 'GLASS BOTTLE', value: trashTypeThisMonth['GLASS BOTTLE'] },
    ].filter(data => data.value > 0);
  }, [trashTypeThisMonth]);

  const PIE_COLORS = ['#0088FE', '#00C49F', '#FFBB28'];

  // Pagination logic
  const indexOfLastLog = currentPage * logsPerPage;
  const indexOfFirstLog = indexOfLastLog - logsPerPage;
  const currentLogs = logs.slice(indexOfFirstLog, indexOfLastLog);
  const totalPages = Math.ceil(logs.length / logsPerPage);
  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const currentMonthName = new Date().toLocaleString(undefined, { month: 'long' });

  return (
    <div className="p-8 font-sans bg-gray-900 text-white min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">TrashVision Dashboard</h1>
        {lastRefresh && (
          <div className="text-sm text-gray-400">
            Last Updated: {lastRefresh.toLocaleTimeString()}
          </div>
        )}
      </div>
      {loading ? (
        <p className="text-center text-xl mt-10">Loading...</p>
      ) : (
        <>
          {/* Statistics Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Whole Time Statistics Card */}
            <div className="bg-gray-800 rounded-lg p-6 shadow-xl">
              <h2 className="text-2xl font-semibold mb-4">Whole Time</h2>
              <p className="text-4xl font-bold text-blue-400 mb-4">Total Trash: {totalTrashAllTime}</p>

              <div className="flex flex-col md:flex-row items-center justify-center">
                {/* Pie Chart for Whole Time */}
                <div className="my-4">
                  {pieDataAllTime.length > 0 ? (
                    <PieChart width={250} height={250}>
                      <Pie
                        data={pieDataAllTime}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        label
                      >
                        {pieDataAllTime.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  ) : (
                    <p>No trash data available for the pie chart.</p>
                  )}
                </div>

                {/* List of trash types and amounts */}
                <ul className="space-y-2 md:ml-8">
                  <li className="flex gap-3 items-center text-lg">
                    <span className="font-medium text-white">{trashTypeAllTime.PET}</span>
                    <span>PET</span>
                  </li>
                  <li className="flex gap-3 items-center text-lg">
                    <span className="font-medium text-white">{trashTypeAllTime.CAN}</span>
                    <span>CAN</span>
                  </li>
                  <li className="flex gap-3 items-center text-lg">
                    <span className="font-medium text-white">{trashTypeAllTime['GLASS BOTTLE']}</span>
                    <span>GLASS BOTTLE</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* This Month Statistics Card */}
            <div className="bg-gray-800 rounded-lg p-6 shadow-xl">
              <h2 className="text-2xl font-semibold mb-4">This Month ({currentMonthName})</h2>
              <p className="text-4xl font-bold text-green-400 mb-4">Total Trash: {totalTrashThisMonth}</p>

              <div className="flex flex-col md:flex-row items-center justify-center">
                {/* Pie Chart for This Month */}
                <div className="my-4">
                  {pieDataThisMonth.length > 0 ? (
                    <PieChart width={250} height={250}>
                      <Pie
                        data={pieDataThisMonth}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        label
                      >
                        {pieDataThisMonth.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  ) : (
                    <p>No trash data available for the pie chart.</p>
                  )}
                </div>

                {/* List of trash types and amounts */}
                <ul className="space-y-2 md:ml-8">
                  <li className="flex gap-3 items-center text-lg">
                    <span className="font-medium text-white">{trashTypeThisMonth.PET}</span>
                    <span>PET</span>
                  </li>
                  <li className="flex gap-3 items-center text-lg">
                    <span className="font-medium text-white">{trashTypeThisMonth.CAN}</span>
                    <span>CAN</span>
                  </li>
                  <li className="flex gap-3 items-center text-lg">
                    <span className="font-medium text-white">{trashTypeThisMonth['GLASS BOTTLE']}</span>
                    <span>GLASS BOTTLE</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Log Table */}
          <table className="min-w-full rounded-lg overflow-hidden border border-gray-700">
            <thead className="bg-gray-700">
              <tr className="text-white">
                <th className="p-4 text-left">No.</th>
                <th className="p-4 text-left">Trash Type</th>
                <th className="p-4 text-left">Timestamp</th>
                {/* <th className="p-4 text-left">Correct</th> */}
              </tr>
            </thead>
            <tbody className="bg-gray-800 text-gray-300">
              {currentLogs.map((log, i) => (
                <tr key={i} className="border-t border-gray-700 hover:bg-gray-700 transition-colors">
                  <td className="p-4">{logs.length - (indexOfFirstLog + i)}</td>
                  <td className="p-4">{log.trash_name}</td>
                  <td className="p-4">{new Date(log.time_stamp).toLocaleString()}</td>
                  {/* <td className="p-4">{log.correct ? 'YES' : 'NO'}</td> */}
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-6">
              <button
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-4 py-2 mx-1 border border-gray-600 text-white rounded-md bg-gray-700 hover:bg-gray-600 disabled:opacity-50 h-fit items-center"
              >
                Previous
              </button>
              <div className="grid grid-cols-4 md:grid-cols-8 gap-2">
                {Array.from({ length: totalPages }, (_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => paginate(i + 1)}
                    className={`px-4 py-2 mx-1 border border-gray-600 rounded-md ${currentPage === i + 1 ? 'bg-blue-600 text-white' : 'text-gray-300 bg-gray-700 hover:bg-gray-600'
                      }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
              <button
                onClick={() => paginate(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-4 py-2 mx-1 border border-gray-600 rounded-md bg-gray-700 text-white hover:bg-gray-600 disabled:opacity-50 h-fit"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}