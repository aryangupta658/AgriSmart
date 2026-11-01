import axios from "axios";


const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://127.0.0.1:5000";


const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,

  headers: {
    "Content-Type": "application/json",
  },
});


export const getCrops = async () => {
  const response =
    await api.get("/api/crops");

  return response.data;
};


export const predictWater = async (
  formData
) => {
  const response =
    await api.post(
      "/api/predict",
      formData
    );

  return response.data;
};


export const recommendCrop = async (
  formData
) => {
  const response =
    await api.post(
      "/api/crop/recommend",
      formData
    );

  return response.data;
};


export default api;