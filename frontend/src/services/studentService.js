import apiClient from './api';

class StudentService {
  static getStudents(params = {}) {
    return apiClient.get('/students', { params });
  }

  static getStudent(studentId) {
    return apiClient.get(`/students/${studentId}`);
  }

  static createStudent(studentData) {
    return apiClient.post('/students', studentData);
  }

  static importStudentsBulk(studentsData) {
    return apiClient.post('/students/import', studentsData);
  }

  static updateStudent(studentId, studentData) {
    return apiClient.put(`/students/${studentId}`, studentData);
  }

  static deleteStudent(studentId) {
    return apiClient.delete(`/students/${studentId}`);
  }

  static deleteStudentsBulk(studentIds) {
    return apiClient.post('/students/bulk-delete', {
      student_ids: studentIds
    });
  }

  static getStudentsByClass(classId, params = {}) {
    return apiClient.get('/students', {
      params: { ...params, class_id: classId }
    });
  }
}

class ClassService {
  static getClasses(params = {}) {
    return apiClient.get('/classes', { params });
  }

  static getClass(classId) {
    return apiClient.get(`/classes/${classId}`);
  }

  static createClass(classData) {
    return apiClient.post('/classes', classData);
  }

  static updateClass(classId, classData) {
    return apiClient.put(`/classes/${classId}`, classData);
  }

  static deleteClass(classId) {
    return apiClient.delete(`/classes/${classId}`);
  }
}

class SubjectService {
  static getSubjects(params = {}) {
    return apiClient.get('/subjects', { params });
  }

  static getSubject(subjectId) {
    return apiClient.get(`/subjects/${subjectId}`);
  }

  static createSubject(subjectData) {
    return apiClient.post('/subjects', subjectData);
  }

  static updateSubject(subjectId, subjectData) {
    return apiClient.put(`/subjects/${subjectId}`, subjectData);
  }

  static deleteSubject(subjectId) {
    return apiClient.delete(`/subjects/${subjectId}`);
  }
}

class ClassSubjectService {
  static getClassSubjects(params = {}) {
    return apiClient.get('/class-subjects', { params });
  }

  static getClassSubject(classSubjectId) {
    return apiClient.get(`/class-subjects/${classSubjectId}`);
  }

  static createClassSubject(classSubjectData) {
    return apiClient.post('/class-subjects', classSubjectData);
  }

  static updateClassSubject(classSubjectId, classSubjectData) {
    return apiClient.put(`/class-subjects/${classSubjectId}`, classSubjectData);
  }

  static deleteClassSubject(classSubjectId) {
    return apiClient.delete(`/class-subjects/${classSubjectId}`);
  }
}

class EnrollmentService {
  static getEnrollments(params = {}) {
    return apiClient.get('/enrollments', { params });
  }

  static getEnrollment(enrollmentId) {
    return apiClient.get(`/enrollments/${enrollmentId}`);
  }

  static createEnrollment(enrollmentData) {
    return apiClient.post('/enrollments', enrollmentData);
  }

  static updateEnrollment(enrollmentId, enrollmentData) {
    return apiClient.put(`/enrollments/${enrollmentId}`, enrollmentData);
  }

  static deleteEnrollment(enrollmentId) {
    return apiClient.delete(`/enrollments/${enrollmentId}`);
  }
}

class ScheduleService {
  static getSchedules(params = {}) {
    return apiClient.get('/schedule', { params });
  }

  static getSchedule(scheduleId) {
    return apiClient.get(`/schedule/${scheduleId}`);
  }

  static createSchedule(scheduleData) {
    return apiClient.post('/schedule', scheduleData);
  }

  static updateSchedule(scheduleId, scheduleData) {
    return apiClient.put(`/schedule/${scheduleId}`, scheduleData);
  }

  static deleteSchedule(scheduleId) {
    return apiClient.delete(`/schedule/${scheduleId}`);
  }
}

class AttendanceService {
  static getAttendance(params = {}) {
    return apiClient.get('/attendance', { params });
  }

  static getAttendanceRecord(attendanceId) {
    return apiClient.get(`/attendance/${attendanceId}`);
  }

  static createAttendance(attendanceData) {
    return apiClient.post('/attendance', attendanceData);
  }

  static updateAttendance(attendanceId, attendanceData) {
    return apiClient.put(`/attendance/${attendanceId}`, attendanceData);
  }

  static deleteAttendance(attendanceId) {
    return apiClient.delete(`/attendance/${attendanceId}`);
  }
}

class AcademicTermService {
  static getTerms(params = {}) {
    return apiClient.get('/terms', { params });
  }

  static getTerm(termId) {
    return apiClient.get(`/terms/${termId}`);
  }

  static createTerm(termData) {
    return apiClient.post('/terms', termData);
  }

  static updateTerm(termId, termData) {
    return apiClient.put(`/terms/${termId}`, termData);
  }

  static deleteTerm(termId) {
    return apiClient.delete(`/terms/${termId}`);
  }
}

class RoomService {
  static getRooms(params = {}) {
    return apiClient.get('/rooms', { params });
  }

  static getRoom(roomId) {
    return apiClient.get(`/rooms/${roomId}`);
  }

  static createRoom(roomData) {
    return apiClient.post('/rooms', roomData);
  }

  static updateRoom(roomId, roomData) {
    return apiClient.put(`/rooms/${roomId}`, roomData);
  }

  static deleteRoom(roomId) {
    return apiClient.delete(`/rooms/${roomId}`);
  }
}

class ScoreService {
  static getScores(params = {}) {
    return apiClient.get('/scores', { params });
  }

  static getStudentScores(studentId, params = {}) {
    return apiClient.get(`/scores/student/${studentId}`, { params });
  }

  static getSubjectScores(subjectId, params = {}) {
    return apiClient.get(`/scores/subject/${subjectId}`, { params });
  }

  static getScore(scoreId) {
    return apiClient.get(`/scores/${scoreId}`);
  }

  static createScore(scoreData) {
    return apiClient.post('/scores', scoreData);
  }

  static updateScore(scoreId, scoreData) {
    return apiClient.put(`/scores/${scoreId}`, scoreData);
  }

  static deleteScore(scoreId) {
    return apiClient.delete(`/scores/${scoreId}`);
  }
}

class AuthService {
  static login(credentials) {
    return apiClient.post('/auth/login', credentials);
  }

  static logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
  }

  static getCurrentUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }

  static isAuthenticated() {
    return !!localStorage.getItem('access_token');
  }
}

export {
  AcademicTermService,
  AttendanceService,
  AuthService,
  ClassService,
  ClassSubjectService,
  EnrollmentService,
  RoomService,
  ScheduleService,
  ScoreService,
  StudentService,
  SubjectService
};
