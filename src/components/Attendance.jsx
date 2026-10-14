import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { useParams, useLocation, useNavigate } from 'react-router-dom';

export default function Attendance() {
  const { courseId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  
  const course = location.state?.course;
  
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({});
  
  const [showAddStudent, setShowAddStudent] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [newStudent, setNewStudent] = useState({ rollNo: '', name: '' });

  const today = new Date().toISOString().split('T')[0];
  const [date, setDate] = useState(today);

  const fetchStudents = useCallback(async () => {
    try {
      const res = await axios.get(`https://attendance-system-api-6bbm.onrender.com/api/students/${courseId}`);
      setStudents(res.data);
      
      const initialAttendance = {};
      res.data.forEach(student => {
        initialAttendance[student._id] = 'Present';
      });
      setAttendance(initialAttendance);
    } catch (err) {
      console.error('Error fetching students:', err);
    }
  }, [courseId]);

  useEffect(() => {
    if (courseId) {
      fetchStudents();
    }
  }, [courseId, fetchStudents]);

  const handleStatusChange = (studentId, status) => {
    setAttendance({ ...attendance, [studentId]: status });
  };

  const resetForm = () => {
    setShowAddStudent(false);
    setIsEditing(false);
    setEditId(null);
    setNewStudent({ rollNo: '', name: '' });
  };

  const openEditForm = (student) => {
    setNewStudent({ rollNo: student.rollNo, name: student.name });
    setEditId(student._id);
    setIsEditing(true);
    setShowAddStudent(true);
  };

  const handleSubmitStudent = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        const res = await axios.put(`https://attendance-system-api-6bbm.onrender.com/api/students/edit/${editId}`, newStudent);
        if (res.data.success) {
          alert('✅ ' + res.data.message);
          resetForm();
          fetchStudents();
        }
      } else {
        const studentData = { ...newStudent, studentId: `S-${Date.now().toString().slice(-4)}`, courseId: courseId };
        const res = await axios.post('https://attendance-system-api-6bbm.onrender.com/api/students/add', studentData);
        if (res.data.success) {
          alert('✅ ' + res.data.message);
          resetForm();
          fetchStudents();
        }
      }
    } catch (err) {
      alert('❌ Error saving student');
    }
  };

  const handleSaveAttendance = async (e) => {
    e.preventDefault();
    if (students.length === 0) return alert('⚠️ No students available!');

    const records = students.map(student => ({
      date: date, courseId: courseId, studentId: student._id, status: attendance[student._id]
    }));

    try {
      const res = await axios.post('https://attendance-system-api-6bbm.onrender.com/api/attendance', records);
      if (res.data.success) {
        alert('✅ ' + res.data.message);
        navigate('/dashboard'); 
      }
    } catch (err) {
      alert('❌ Error saving attendance');
    }
  };

  if (!course) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-3xl mx-auto">
        
        {/* Header Section */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-6 flex justify-between items-center border-l-4 border-blue-600">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 mb-1">{course.courseName}</h1>
            <p className="text-gray-600 font-medium">Course ID: {course.courseId}</p>
            <p className="text-gray-500 mt-1 text-sm">Year: {course.year || 'N/A'} | Semester: {course.semester || 'N/A'} | Session: {course.session || 'N/A'}</p>
            <p className="text-gray-800 font-bold mt-2">Total Students: {students.length}</p>
          </div>
          <button onClick={() => navigate('/dashboard')} className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded">
            Back to Dashboard
          </button>
        </div>

        <div className="mb-6 flex justify-end">
          <button onClick={() => showAddStudent ? resetForm() : setShowAddStudent(true)} className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
            {showAddStudent ? 'Cancel' : '+ Add New Student'}
          </button>
        </div>

        {/* Add Student Form */}
        {showAddStudent && (
          <div className="bg-white p-6 rounded-lg shadow-md mb-6 border-l-4 border-green-500">
            <h3 className="font-bold text-lg mb-4 text-green-700">{isEditing ? 'Edit Student Details' : 'Add a Student to this Course'}</h3>
            <form onSubmit={handleSubmitStudent} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input type="text" placeholder="Roll No (e.g. 1001)" required className="border border-gray-300 p-2 rounded w-full" value={newStudent.rollNo} onChange={(e) => setNewStudent({...newStudent, rollNo: e.target.value})} />
              <input type="text" placeholder="Student Name" required className="border border-gray-300 p-2 rounded w-full" value={newStudent.name} onChange={(e) => setNewStudent({...newStudent, name: e.target.value})} />
              <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded md:col-span-2">
                {isEditing ? 'Update Student' : 'Save Student'}
              </button>
            </form>
          </div>
        )}

        <div className="bg-white p-6 rounded-lg shadow-md">
          <form onSubmit={handleSaveAttendance}>
            
            <div className="mb-6 flex items-center justify-between bg-blue-50 p-4 rounded-lg border border-blue-100">
              <span className="font-bold text-blue-800 text-lg">Class Date:</span>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="border border-gray-300 p-2 rounded font-medium focus:outline-none focus:ring-2 focus:ring-blue-500" required />
            </div>

            {students.length === 0 ? (
              <p className="text-center text-red-500 py-8 bg-red-50 rounded-lg font-medium">No students found! Please add students first.</p>
            ) : (
              <div className="overflow-x-auto mb-6">
                <table className="w-full text-left border-collapse border border-gray-200">
                  <thead>
                    <tr className="bg-gray-100 text-gray-700 border-b border-gray-300">
                      <th className="p-3 border-r border-gray-200 w-1/4">Roll No</th>
                      <th className="p-3 border-r border-gray-200 w-1/3">Student Name</th>
                      <th className="p-3 border-r border-gray-200 text-center w-1/3">Status</th>
                      <th className="p-3 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map(student => (
                      <tr key={student._id} className="hover:bg-blue-50 border-b border-gray-200">
                        <td className="p-3 font-medium text-gray-800 border-r border-gray-200">{student.rollNo}</td>
                        <td className="p-3 font-bold text-gray-900 border-r border-gray-200">{student.name}</td>
                        
                        {/* Radio Buttons with explicit colors and styling */}
                        <td className="p-3 border-r border-gray-200 text-center">
                          <div className="flex justify-center space-x-6">
                            <label className="flex items-center space-x-2 cursor-pointer p-2 bg-white rounded border border-gray-200 hover:bg-green-50">
                              <input 
                                type="radio" 
                                name={`status-${student._id}`} 
                                value="Present" 
                                checked={attendance[student._id] === 'Present'} 
                                onChange={() => handleStatusChange(student._id, 'Present')} 
                                className="w-5 h-5 text-green-600 focus:ring-green-500" 
                              />
                              <span className="text-green-700 font-bold">Present</span>
                            </label>
                            
                            <label className="flex items-center space-x-2 cursor-pointer p-2 bg-white rounded border border-gray-200 hover:bg-red-50">
                              <input 
                                type="radio" 
                                name={`status-${student._id}`} 
                                value="Absent" 
                                checked={attendance[student._id] === 'Absent'} 
                                onChange={() => handleStatusChange(student._id, 'Absent')} 
                                className="w-5 h-5 text-red-600 focus:ring-red-500" 
                              />
                              <span className="text-red-700 font-bold">Absent</span>
                            </label>
                          </div>
                        </td>
                        
                        <td className="p-3 text-center">
                          <button type="button" onClick={() => openEditForm(student)} className="text-blue-600 hover:text-blue-800 font-bold bg-blue-100 hover:bg-blue-200 px-3 py-1 rounded">
                            Edit
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            
            <button type="submit" className={`w-full font-bold py-4 px-4 rounded text-lg ${students.length === 0 ? 'bg-gray-400 text-white cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 text-white shadow-lg'}`} disabled={students.length === 0}>
              Submit Attendance
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}