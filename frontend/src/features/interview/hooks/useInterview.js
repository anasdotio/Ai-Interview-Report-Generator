import { useContext, useEffect } from "react";
import {
  getInterviewReportById,
  getInterviewReports,
  generateInterviewReport,
} from "../services/interview.api";
import { InterviewContext } from "../interview.context";
export const useInterview = () => {
  const context = useContext(InterviewContext);

  if (!context) {
    throw new Error("useInterview must be within an InterviewProvider");
  }

  const { loading, setLoading, report, setReport, reports, setReports } =
    context;

  const generateReport = async ({
    jobDescription,
    selfDescription,
    resumeFile,
  }) => {
    setLoading(true);

    try {
      const response = await generateInterviewReport({
        jobDescription,
        selfDescription,
        resumeFile,
      });

      setReport(response.interviewReport);
      return response.interviewReport;
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const getReportById = async (interviewId) => {
    try {
      setLoading(true);
      const response = await getInterviewReportById(interviewId);

      setReport(response);
      return response;
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const getReports = async () => {
    setLoading(true);

    try {
      const response = await getInterviewReports();
      setReports(response);
      return response;
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    report,
    reports,
    generateReport,
    getReportById,
    getReports,
  };
};
