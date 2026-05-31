import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:4000/api", // Tu puerto de backend
  timeout: 10000,
  withCredentials: true, // 👈 ¡CRUCIAL! Esto le dice a Axios que guarde y envíe las cookies automáticamente
});

export default API;
