import { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useLocation, useNavigate } from 'react-router-dom';

export default function Report() {
  const { courseId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const course = location.state?.course;

  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const res = await axios.get(`https://attendance-system-api-6bbm.onrender.com/api/report/${courseId}`);
        setRecords(res.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching report:', err);
        setLoading(false);
      }
    };
    if (courseId) fetchReport();
  }, [courseId]);

  const handleDownloadCSV = () => {
    if (records.length === 0) {
      alert("No attendance records to download!");
      return;
    }

    let csvContent = "data:text/csv;charset=utf-8,Date,Roll No,Student Name,Status\n";

    records.forEach(record => {
      const date = record.date;
      const roll = record.studentId?.rollNo || "N/A";
      const name = record.studentId?.name || "N/A";
      const status = record.status;
      
      csvContent += `${date},${roll},${name},${status}\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${course.courseName}_Attendance_Report.csv`);
    document.body.appendChild(link);
    link.click(); 
    document.body.removeChild(link);
  };

  if (!course) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        
        {/* Header Section */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-6 flex justify-between items-center border-l-4 border-gray-600">
          <div className="text-left">
            <h1 className="text-2xl font-bold text-gray-800 mb-1">{course.courseName} - Report</h1>
            <p className="text-gray-700 font-medium">Course ID: {course.courseId}</p>
            <p className="text-gray-600 mt-1">Year: {course.year || 'N/A'} | Semester: {course.semester || 'N/A'}</p>
            <p className="text-gray-600">Session: {course.session || 'N/A'}</p>
          </div>
          
          <div className="flex flex-col space-y-3">
            <button onClick={handleDownloadCSV} className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded w-full">
              Download Excel
            </button>
            <button onClick={() => navigate('/dashboard')} className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded w-full">
              Back to Dashboard
            </button>
          </div>
        </div>

        {/* Report Table Section */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold text-gray-800 mb-4 border-b-2 border-gray-200 pb-2 text-left">Attendance History</h2>
          
          {loading ? (
            <p className="text-center text-gray-600 font-bold py-4">Loading report data...</p>
          ) : records.length === 0 ? (
            <p className="text-center text-red-600 font-bold py-4 bg-red-50 rounded border border-red-200">No attendance records found yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-200 text-gray-800 border-b border-gray-400">
                    <th className="p-3 border-r border-gray-300">Date</th>
                    <th className="p-3 border-r border-gray-300">Roll No</th>
                    <th className="p-3 border-r border-gray-300">Student Name</th>
                    <th className="p-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {records.map((record, index) => (
                    <tr key={index} className="hover:bg-gray-50 border-b border-gray-300">
                      <td className="p-3 font-medium text-gray-800 border-r border-gray-300">{record.date}</td>
                      <td className="p-3 text-gray-700 font-medium border-r border-gray-300">{record.studentId?.rollNo}</td>
                      <td className="p-3 font-bold text-gray-900 border-r border-gray-300">{record.studentId?.name}</td>
                      <td className="p-3 text-center">
                        <span className={`px-4 py-1 rounded font-bold border ${
                          record.status === 'Present' ? 'bg-green-100 text-green-800 border-green-300' : 'bg-red-100 text-red-800 border-red-300'
                        }`}>
                          {record.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}