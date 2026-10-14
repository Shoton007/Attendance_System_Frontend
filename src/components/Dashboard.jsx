import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const [courses, setCourses] = useState([]);
  
  const [showAddForm, setShowAddForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  
  const [newCourse, setNewCourse] = useState({ courseId: '', courseName: '', classTime: '', year: '', semester: '', session: '' });

  const navigate = useNavigate();
  const teacherData = JSON.parse(localStorage.getItem('teacherInfo'));

  const fetchCourses = useCallback(async () => {
    try {
      const res = await axios.get(`https://attendance-system-api-6bbm.onrender.com/api/courses/${teacherData._id}`);
      setCourses(res.data);
    } catch (err) {
      console.error('Error fetching courses:', err);
    }
  }, [teacherData?._id]);

  useEffect(() => {
    if (!teacherData) {
      navigate('/');
      return;
    }
    fetchCourses();
  }, [teacherData, navigate, fetchCourses]);

  const handleLogout = () => {
    localStorage.removeItem('teacherInfo');
    navigate('/');
  };

  const resetForm = () => {
    setShowAddForm(false);
    setIsEditing(false);
    setEditId(null);
    setNewCourse({ courseId: '', courseName: '', classTime: '', year: '', semester: '', session: '' });
  };

  const openEditForm = (course) => {
    setNewCourse({ 
      courseId: course.courseId, 
      courseName: course.courseName, 
      classTime: course.classTime,
      year: course.year || '',
      semester: course.semester || '',
      session: course.session || ''
    });
    setEditId(course._id);
    setIsEditing(true);
    setShowAddForm(true);
  };

  const handleSubmitCourse = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        const res = await axios.put(`https://attendance-system-api-6bbm.onrender.com/api/courses/edit/${editId}`, newCourse);
        if (res.data.success) {
          alert('✅ ' + res.data.message);
          resetForm();
          fetchCourses();
        }
      } else {
        const courseData = { ...newCourse, teacherId: teacherData._id };
        const res = await axios.post('https://attendance-system-api-6bbm.onrender.com/api/courses/add', courseData);
        if (res.data.success) {
          alert('✅ ' + res.data.message);
          teacherData.numberOfCourses += 1;
          localStorage.setItem('teacherInfo', JSON.stringify(teacherData));
          resetForm();
          fetchCourses();
        }
      }
    } catch (err) {
      alert('❌ Error saving course');
    }
  };

  if (!teacherData) return null;

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-md mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Welcome, {teacherData.name}</h1>
          <p className="text-gray-600 mt-1">ID: {teacherData.teacherId} | Dept: {teacherData.departmentName} | Total Courses: {teacherData.numberOfCourses}</p>
        </div>
        <button onClick={handleLogout} className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded">
          Logout
        </button>
      </div>

      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-700">Assigned Courses</h2>
          <button 
            onClick={() => showAddForm ? resetForm() : setShowAddForm(true)}
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
          >
            {showAddForm ? 'Cancel' : '+ Add Course'}
          </button>
        </div>

        {showAddForm && (
          <div className="bg-white p-6 rounded-lg shadow-md mb-8 border-l-4 border-green-500">
            <h3 className="font-bold text-lg mb-4 text-green-700">{isEditing ? 'Edit Course Details' : 'Create a New Course'}</h3>
            <form onSubmit={handleSubmitCourse} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <input type="text" placeholder="Course ID (e.g. CSE-101)" required className="border border-gray-300 p-2 rounded w-full" value={newCourse.courseId} onChange={(e) => setNewCourse({...newCourse, courseId: e.target.value})} />
              <input type="text" placeholder="Course Name (e.g. Programming)" required className="border border-gray-300 p-2 rounded w-full" value={newCourse.courseName} onChange={(e) => setNewCourse({...newCourse, courseName: e.target.value})} />
              <input type="text" placeholder="Class Time (e.g. 10:00 AM)" required className="border border-gray-300 p-2 rounded w-full" value={newCourse.classTime} onChange={(e) => setNewCourse({...newCourse, classTime: e.target.value})} />
              
              <input type="text" placeholder="Year (e.g. 3rd)" required className="border border-gray-300 p-2 rounded w-full" value={newCourse.year} onChange={(e) => setNewCourse({...newCourse, year: e.target.value})} />
              <input type="text" placeholder="Semester (e.g. 5th)" required className="border border-gray-300 p-2 rounded w-full" value={newCourse.semester} onChange={(e) => setNewCourse({...newCourse, semester: e.target.value})} />
              <input type="text" placeholder="Session (e.g. 2025-2026)" required className="border border-gray-300 p-2 rounded w-full" value={newCourse.session} onChange={(e) => setNewCourse({...newCourse, session: e.target.value})} />
              
              <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded md:col-span-3">
                {isEditing ? 'Update Course' : 'Save Course'}
              </button>
            </form>
          </div>
        )}

        {courses.length === 0 ? (
          <p className="text-gray-500 bg-white p-4 rounded-lg shadow text-center">No courses assigned yet. Click "Add Course" to start.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {courses.map((course) => (
              <div key={course._id} className="bg-white p-6 rounded-lg shadow-md border border-gray-200 hover:shadow-lg flex flex-col justify-between">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-bold text-blue-700">{course.courseName}</h3>
                    <p className="text-gray-700 mt-2 font-medium">Course ID: {course.courseId}</p>
                    <p className="text-gray-600 mt-1">Year: {course.year || 'N/A'} | Semester: {course.semester || 'N/A'}</p>
                    <p className="text-gray-600">Session: {course.session || 'N/A'}</p>
                    <p className="text-gray-600">Time: {course.classTime}</p>
                  </div>
                  <button onClick={() => openEditForm(course)} className="text-blue-500 hover:text-blue-700 text-sm font-bold bg-blue-50 px-3 py-1 rounded">
                    Edit
                  </button>
                </div>
                
                <div className="mt-6 flex gap-3">
                  <button onClick={() => navigate(`/attendance/${course._id}`, { state: { course } })} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                    Attendance
                  </button>
                  <button onClick={() => navigate(`/report/${course._id}`, { state: { course } })} className="w-full bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded">
                    Report
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}