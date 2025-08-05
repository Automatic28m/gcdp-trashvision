// src/app/page.jsx
'use client';

import React, { useEffect, useState } from 'react';

export default function Page() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(null);

  // [START MODIFICATION]
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const logsPerPage = 10; // Number of logs to display per page
  // [END MODIFICATION]

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await fetch('/api/logs');
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        const data = await res.json();
        // Since the API returns all data, we will handle pagination on the client side.
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

    return () => clearInterval(intervalId);
  }, []);

  // [START MODIFICATION]
  // Pagination logic to determine which logs to display
  const indexOfLastLog = currentPage * logsPerPage;
  const indexOfFirstLog = indexOfLastLog - logsPerPage;
  const currentLogs = logs.slice(indexOfFirstLog, indexOfLastLog);

  // Total number of pages
  const totalPages = Math.ceil(logs.length / logsPerPage);

  // Function to handle page change
  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  // [END MODIFICATION]

  return (
    <div className="p-8 font-sans">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">TrashVision Dashboard</h1>
        {lastRefresh && (
          <div className="text-sm text-white">
            Last Updated: {lastRefresh.toLocaleTimeString()}
          </div>
        )}
      </div>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          <table className="min-w-full border">
            <thead>
              <tr className="bg-gray-200 text-black">
                <th className="p-2 border">No.</th>
                <th className="p-2 border">Trash Type</th>
                <th className="p-2 border">Timestamp</th>
                <th className="p-2 border">Correct</th>
              </tr>
            </thead>
            <tbody>
              {currentLogs.map((log, i) => (
                <tr key={i} className="text-center border-t">
                  {/* [MODIFICATION] Calculating line number in descending order based on page */}
                  <td className="p-2 border">{logs.length - (indexOfFirstLog + i)}</td>
                  <td className="p-2 border">{log.trash_name}</td>
                  <td className="p-2 border">{new Date(log.time_stamp).toLocaleString()}</td>
                  <td className="p-2 border">{log.correct ? 'YES' : 'NO'}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* [START MODIFICATION] */}
          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-6">
              <button
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-4 py-2 mx-1 border text-black rounded-md bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
              >
                Previous
              </button>
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i + 1}
                  onClick={() => paginate(i + 1)}
                  className={`px-4 py-2 mx-1 border rounded-md ${
                    currentPage === i + 1 ? 'bg-blue-500 text-white' : 'text-black bg-gray-200 hover:bg-gray-300'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                onClick={() => paginate(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-4 py-2 mx-1 border rounded-md bg-gray-200 text-black hover:bg-gray-300 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
          {/* [END MODIFICATION] */}
        </>
      )}
    </div>
  );
}
