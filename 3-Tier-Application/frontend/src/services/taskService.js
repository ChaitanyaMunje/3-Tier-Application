import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://127.0.0.1:59586"; 
// later → ingress / service URL

export const getTasks = () => {
  return axios.get(`${API_BASE_URL}/tasks`);
};

export const addTask = (task) => {
  return axios.post(`${API_BASE_URL}/tasks`, { task });
};
