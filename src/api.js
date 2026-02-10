import axios from "axios";

const API = axios.create({
  baseURL: "https://sindhuja-colloction1.onrender.com",
  withCredentials: true
});

export default API;
