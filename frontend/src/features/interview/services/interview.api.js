import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3000/api/interview",
  withCredentials: true,
});

export const generateInterviewReport = async ({
  jobDescription,
  selfDescription,
  resumeFile,
}) => {
  const formData = new FormData();
  formData.append("jobDescription", jobDescription);
  formData.append("selfDescription", selfDescription);
  formData.append("resume", resumeFile);

  const response = await api.post("/", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
};

export const getInterviewReportById = async (interviewId) => {
  const response = await api.get(`/report/${interviewId}`);
  return response.data.data;
};

export const getInterviewReports = async () => {
  const response = await api.get("/reports");
  return response.data.data;
};
