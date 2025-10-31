import axiosInstance from "../Utils/Axios";

class AttendanceApi {
  // ✅ Get all attendance records
  async getAllAttendances() {
    try {
      const response = await axiosInstance.get("/Attendance");
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Failed to fetch attendances"
      );
    }
  }

  // ✅ Create attendance record
  async createAttendance(attendanceData) {
    try {
      const payload = {
        userId: parseInt(attendanceData.userId),
        date: new Date(attendanceData.date).toISOString(), // okay for POST
        checkInTime:
          this.formatTimeForBackend(attendanceData.checkIn) || "00:00:00",
        checkOutTime:
          this.formatTimeForBackend(attendanceData.checkOut) || "00:00:00",
        status: this.mapStatusToBackend(attendanceData.status),
      };

      console.log("🟢 Creating attendance:", payload);
      const response = await axiosInstance.post("/Attendance", payload);
      return response.data;
    } catch (error) {
      console.error("🔴 Create API Error:", error.response?.data);
      throw new Error(
        error.response?.data?.message || "Failed to create attendance"
      );
    }
  }

  // ✅ Get attendance by user & date
  async getAttendanceByUserAndDate(userId, date) {
    try {
      const response = await axiosInstance.get("/Attendance/user-date", {
        params: {
          userId: parseInt(userId),
          date: this.formatDateForBackend(date),
        },
      });
      return response.data;
    } catch (error) {
      if (error.response?.status === 404) return null;
      throw new Error(
        error.response?.data?.message || "Failed to fetch attendance"
      );
    }
  }

  // ✅ Update attendance record (CLEAN FIX)
  async updateAttendance(attendanceData) {
    try {
      const payload = {
        userId: parseInt(attendanceData.userId),
        date: this.formatDateForBackend(attendanceData.date),
        checkInTime:
          this.formatTimeForBackend(attendanceData.checkInTime) ||
          "00:00:00",
        checkOutTime:
          this.formatTimeForBackend(attendanceData.checkOutTime) ||
          "00:00:00",
        status: this.mapStatusToBackend(attendanceData.status),
      };

      console.log("🟡 Updating attendance:", payload);

      const res = await axiosInstance.put("/Attendance", payload);
      console.log("🟢 Update response:", res.data);
      return res.data;
    } catch (error) {
      console.error("🔴 Update API Error:", error);
      console.error("🔴 Response data:", error.response?.data);
      console.error("🔴 Status:", error.response?.status);
      throw new Error("Failed to update attendance");
    }
  }

  // ✅ Delete attendance record
  async deleteAttendance(userId, date) {
    try {
      const formattedDate = this.formatDateForBackend(date);
      const response = await axiosInstance.delete("/Attendance", {
        params: {
          userId: parseInt(userId),
          date: formattedDate,
        },
      });
      return response.data;
    } catch (error) {
      console.error("Delete API Error:", error.response?.data);
      throw new Error(
        error.response?.data?.message || "Failed to delete attendance"
      );
    }
  }

  // ✅ Get all attendances by user
  async getUserAttendances(userId) {
    try {
      const response = await axiosInstance.get(`/Attendance/user/${userId}`);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Failed to fetch user attendances"
      );
    }
  }

  // ✅ Get calendar data
  async getCalendarAttendances(year, month) {
    try {
      const response = await axiosInstance.get("/Attendance/calendar", {
        params: { year, month },
      });
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Failed to fetch calendar data"
      );
    }
  }

  // 🧩 Helper: format time for backend (TimeSpan)
  formatTimeForBackend(time) {
    if (!time) return null;
    return time.includes(":")
      ? `${time.length === 5 ? time + ":00" : time}`
      : `${time}:00`;
  }

  // 🧩 Helper: format date correctly (YYYY-MM-DD)
  formatDateForBackend(date) {
    if (!date) return null;
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  // ✅ Map frontend string → backend int
  mapStatusToBackend(status) {
    const statusMap = {
      Present: 0,
      Late: 1,
      "Half Day": 2,
      Excused: 3,
      Unexcused: 4,
    };
    return statusMap[status] ?? 0;
  }

  // ✅ Map backend int → frontend string
  mapStatusToFrontend(status) {
    const statusMap = {
      0: "Present",
      1: "Late",
      2: "Half Day",
      3: "Excused",
      4: "Unexcused",
    };
    return statusMap[status] || "Unexcused";
  }

  // ✅ Format backend time string for display (HH:mm)
  formatTimeForDisplay(timeString) {
    if (!timeString) return "";
    return timeString.substring(0, 5);
  }
}

export const attendanceApi = new AttendanceApi();
