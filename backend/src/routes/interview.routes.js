const express = require("express");
const authMiddleware = require("../middlewares/auth.middleware");
const interviewController = require("../controllers/interview.controller");
const upload = require("../middlewares/file.middleware");
const interviewRouter = express.Router();

/**
 * @route POST /api/interview
 * @description This route generates an interview report based on the candidate's resume, self-description, and job description. The report includes technical questions, behavioral questions, skills gaps, preparation plan, overall feedback, and a score.
 * @access Private
 * @param {string} resume - The candidate's resume text.
 * @param {string} selfDescription - The candidate's self-description.
 * @param {string} jobDescription - The job description.
 * @returns {Object} The generated interview report.
 */
interviewRouter.post(
  "/",
  authMiddleware.authUser,
  upload.single("resume"),
  interviewController.generateInterviewReportController,
);

/**
 * @route GET /api/interview/report/:interviewId
 * @description This route retrieves the interview report for a specific interview ID.
 * @access Private
 * @param {string} interviewId - The ID of the interview.
 * @returns {Object} The interview report associated with the given interview ID.
 */
interviewRouter.get(
  "/report/:interviewId",
  authMiddleware.authUser,
  interviewController.getInterviewReportByIdController,
);

/**
 * @route GET /api/interview/report
 * @description This route retrieves all interview reports associated with the logged-in user.
 * @access Private
 * @returns {Array} An array of interview reports associated with the logged-in user.
 */
interviewRouter.get(
  "/reports",
  authMiddleware.authUser,
  interviewController.getInterviewReportsController,
);

module.exports = interviewRouter;
