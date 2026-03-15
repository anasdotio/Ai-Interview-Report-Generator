const pdfParse = require("pdf-parse");
const generateInterviewReport = require("../services/ai.service");
const InterviewReportModel = require("../models/interviewReport.model");

/**
 * @description Controller to handle fetching a specific interview report by its ID, expects the interview ID as a URL parameter, returns the interview report if found and belongs to the user
 * @access Private
 * @param {string} interviewId - The ID of the interview report to fetch.
 * @returns {Object} The interview report associated with the given ID if found and belongs to the user, otherwise an error message.
 */
async function getInterviewReportByIdController(req, res) {
  const { interviewId } = req.params;

  if (!interviewId) {
    return res.status(400).json({
      success: false,
      message: "Interview ID is required",
    });
  }

  const interviewReport = await InterviewReportModel.findOne({
    _id: interviewId,
    user: req.user.id,
  });

  if (!interviewReport) {
    return res.status(404).json({
      success: false,
      message: "Interview report not found",
    });
  }

  res.status(200).json({
    success: true,
    message: "Interview report fetched successfully",
    data: interviewReport,
  });
}
/**
 * @description Controller to handle interview report generation, expects resume file , self description and job description in the request body, returns the generated interview report
 * @access Private
 * @param {file} resume - The candidate's resume file in PDF format.
 * @param {string} selfDescription - The candidate's self-description.
 * @param {string} jobDescription - The job description.
 * @returns {Object} The generated interview report.
 */
async function generateInterviewReportController(req, res) {
  const resumeContext = await new pdfParse.PDFParse(
    Uint8Array.from(req.file.buffer),
  ).getText();

  const { selfDescription, jobDescription } = req.body;

  const interviewReportByAi = await generateInterviewReport({
    resume: resumeContext.text,
    selfDescription,
    jobDescription,
  });

  const interviewReport = await InterviewReportModel.create({
    user: req.user.id,
    resume: resumeContext.text,
    selfDescription,
    jobDescription,
    ...interviewReportByAi,
  });

  res.status(201).json({
    success: true,
    message: "Interview report generated successfully",
    data: interviewReport,
  });
}
/**
 * @description Controller to handle fetching all interview reports associated with the logged-in user, returns an array of interview reports if found, otherwise an error message.
 * @access Private
 * @returns {Array} An array of interview reports associated with the logged-in user if found, otherwise an error message.
 */
async function getInterviewReportsController(req, res) {
  const interviewReports = await InterviewReportModel.find({
    user: req.user.id,
  })
    .sort({ createdAt: -1 })
    .select(
      "-resume -selfDescription -jobDescription -__v -technicalQuestions -behavioralQuestions -skillGaps -preparationPlan -user -matchScore",
    );

  if (!interviewReports) {
    return res.status(404).json({
      success: false,
      message: "No interview reports found for this user",
    });
  }
  res.status(200).json({
    success: true,
    message: "Interview reports fetched successfully",
    data: interviewReports,
  });
}

module.exports = {
  generateInterviewReportController,
  getInterviewReportByIdController,
  getInterviewReportsController,
};
