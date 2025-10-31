// src/AdminApi/AdminHolidayApi.js
import axiosInstance from "../Utils/Axios";

const AdminHolidayApi = {
  getAllHolidays: async () => {
    try {
      const res = await axiosInstance.get("/Holidays");
      return res.data;
    } catch (err) {
      console.error("Error fetching holidays:", err);
      throw new Error(err.response?.data?.message || "Failed to fetch holidays");
    }
  },

  addHoliday: async (holidayData) => {
    try {
      const res = await axiosInstance.post("/Holidays", holidayData);
      return res.data;
    } catch (err) {
      console.error("Error adding holiday:", err);
      throw new Error(err.response?.data?.message || "Failed to add holiday");
    }
  },

  deleteHoliday: async (id) => {
    try {
      const res = await axiosInstance.delete(`/Holidays/${id}`);
      return res.data;
    } catch (err) {
      console.error("Error deleting holiday:", err);
      throw new Error(err.response?.data?.message || "Failed to delete holiday");
    }
  },

  updateHoliday: async (id, holidayData) => {
    try {
      const res = await axiosInstance.put(`/Holidays/${id}`, holidayData);
      return res.data;
    } catch (err) {
      console.error("Error updating holiday:", err);
      throw new Error(err.response?.data?.message || "Failed to update holiday");
    }
  }
};

export default AdminHolidayApi;