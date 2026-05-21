import apiClient from "./api";

const BASE = "/teachers";

export const getTeachers = (params = {}) => apiClient.get(BASE, { params });

export const getTeacherById = (id) => apiClient.get(`${BASE}/${id}`);

export const createTeacher = (data) => apiClient.post(BASE, data);

export const updateTeacher = (id, data) => apiClient.put(`${BASE}/${id}`, data);

export const deleteTeacher = (id) => apiClient.delete(`${BASE}/${id}`);
