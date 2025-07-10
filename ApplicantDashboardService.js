const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8000/api";
// const API_BASE_URL =
// import.meta.env.VITE_API_URL || "https://ttdf.usof.gov.in:8001/api";

class ApplicantDashboardService {
  // Get authentication headers
  getAuthHeaders() {
    // Check both possible token keys for backward compatibility
    const token =
      localStorage.getItem("access_token") ||
      localStorage.getItem("accessToken");
    return {
      "Content-Type": "application/json",
      Authorization: token ? `Bearer ${token}` : "",
    };
  }

  // Handle API responses
  async handleResponse(response) {
    // console.log("API Response:", response);
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `HTTP error! status: ${response.status}`
      );
    }
    return await response.json();
  }

  // Get complete dashboard overview
  async getDashboardOverview() {
    try {
      const response = await fetch(
        `${API_BASE_URL}/applicant-dashboard/overview/`,
        {
          method: "GET",
          headers: this.getAuthHeaders(),
        }
      );

      return await this.handleResponse(response);
    } catch (error) {
      console.error("Dashboard overview error:", error);
      return {
        status: "error",
        message: error.message,
        data: this.getFallbackDashboardData(),
      };
    }
  }

  // Get proposal statistics by status
  async getProposalStats() {
    try {
      const response = await fetch(
        `${API_BASE_URL}/applicant-dashboard/proposal-stats/`,
        {
          method: "GET",
          headers: this.getAuthHeaders(),
        }
      );

      return await this.handleResponse(response);
    } catch (error) {
      console.error("Proposal stats error:", error);
      return {
        status: "error",
        message: error.message,
        data: this.getFallbackProposalStats(),
      };
    }
  }

  async getProposalDetails(proposalId) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/applicant-dashboard/proposal-details/${proposalId}/`,
        {
          method: "GET",
          headers: this.getAuthHeaders(),
        }
      );

      const result = await this.handleResponse(response);
      return {
        status: "success",
        data: this.transformProposalDetails(result.data || result),
      };
    } catch (error) {
      console.error("Proposal details error:", error);
      return {
        status: "error",
        message: error.message,
        data: this.getFallbackProposalDetails(proposalId),
      };
    }
  }

  async getProposalStatus(proposalId) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/applicant-dashboard/proposal-status/${proposalId}/`,
        {
          method: "GET",
          headers: this.getAuthHeaders(),
        }
      );

      return await this.handleResponse(response);
    } catch (error) {
      console.error("Proposal status error:", error);
      return {
        status: "error",
        message: error.message,
        data: null,
      };
    }
  }

  // Mark activity as read
  async markActivityAsRead(activityId) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/applicant-dashboard/activities/${activityId}/mark_as_read/`,
        {
          method: "POST",
          headers: this.getAuthHeaders(),
        }
      );

      return await this.handleResponse(response);
    } catch (error) {
      console.error("Mark as read error:", error);
      return { status: "error", message: error.message };
    }
  }

  // Get calls data (current and previous)
  async getCalls() {
    try {
      const response = await fetch(
        `${API_BASE_URL}/applicant-dashboard/calls/`,
        {
          method: "GET",
          headers: this.getAuthHeaders(),
        }
      );

      const result = await this.handleResponse(response);
      return {
        status: "success",
        data: {
          current: result.data?.current_calls || [],
          previous: result.data?.previous_calls || [],
        },
      };
    } catch (error) {
      console.error("Calls data error:", error);
      return {
        status: "error",
        message: error.message,
        data: { current: [], previous: [] },
      };
    }
  }

  // Refresh dashboard statistics
  async refreshDashboardStats() {
    try {
      const response = await fetch(
        `${API_BASE_URL}/applicant-dashboard/refresh-stats/`,
        {
          method: "POST",
          headers: this.getAuthHeaders(),
        }
      );

      return await this.handleResponse(response);
    } catch (error) {
      console.error("Refresh stats error:", error);
      return { status: "error", message: error.message };
    }
  }

  // Get user activities with pagination
  async getUserActivities(page = 1, limit = 10) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/applicant-dashboard/activities/?page=${page}&limit=${limit}`,
        {
          method: "GET",
          headers: this.getAuthHeaders(),
        }
      );

      return await this.handleResponse(response);
    } catch (error) {
      console.error("User activities error:", error);
      return {
        status: "error",
        message: error.message,
        data: { results: [], count: 0 },
      };
    }
  }

  // Get milestones for project tracker
  async getProjectMilestones(proposalId) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/applicant-dashboard/milestones/${proposalId}/`,
        {
          method: "GET",
          headers: this.getAuthHeaders(),
        }
      );

      return await this.handleResponse(response);
    } catch (error) {
      console.error("Project milestones error:", error);
      return { status: "error", message: error.message, data: [] };
    }
  }

  // Get finance data for reports
  async getFinanceData(proposalId) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/applicant-dashboard/finance/${proposalId}/`,
        {
          method: "GET",
          headers: this.getAuthHeaders(),
        }
      );

      return await this.handleResponse(response);
    } catch (error) {
      console.error("Finance data error:", error);
      return { status: "error", message: error.message, data: [] };
    }
  }

  // Upload milestone documents
  async uploadMilestoneDocument(
    milestoneId,
    documentType,
    file,
    additionalData = {}
  ) {
    try {
      const formData = new FormData();
      formData.append("milestone", milestoneId);
      formData.append("document_type", documentType);
      formData.append(documentType, file);

      // Add any additional data
      Object.keys(additionalData).forEach((key) => {
        formData.append(key, additionalData[key]);
      });

      const token =
        localStorage.getItem("access_token") ||
        localStorage.getItem("accessToken");
      const response = await fetch(
        `${API_BASE_URL}/applicant-dashboard/upload-document/`,
        {
          method: "POST",
          headers: {
            Authorization: token ? `Bearer ${token}` : "",
          },
          body: formData,
        }
      );

      return await this.handleResponse(response);
    } catch (error) {
      console.error("Document upload error:", error);
      return { status: "error", message: error.message };
    }
  }

  async uploadProposalDocument(
    proposalId,
    documentType,
    file,
    additionalData = {}
  ) {
    try {
      const formData = new FormData();
      formData.append("proposal_id", proposalId);
      formData.append("document_type", documentType);
      formData.append("document", file);

      Object.keys(additionalData).forEach((key) => {
        formData.append(key, additionalData[key]);
      });

      const token =
        localStorage.getItem("access_token") ||
        localStorage.getItem("accessToken");
      const response = await fetch(
        `${API_BASE_URL}/applicant-dashboard/upload-proposal-document/`,
        {
          method: "POST",
          headers: {
            Authorization: token ? `Bearer ${token}` : "",
          },
          body: formData,
        }
      );

      return await this.handleResponse(response);
    } catch (error) {
      console.error("Proposal document upload error:", error);
      return { status: "error", message: error.message };
    }
  }

  async getProposalWorkflow(proposalId) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/applicant-dashboard/proposal-workflow/${proposalId}/`,
        {
          method: "GET",
          headers: this.getAuthHeaders(),
        }
      );

      return await this.handleResponse(response);
    } catch (error) {
      console.error("Proposal workflow error:", error);
      return {
        status: "error",
        message: error.message,
        data: [],
      };
    }
  }

  async getUserProfile() {
    try {
      const response = await fetch(
        `${API_BASE_URL}/applicant-dashboard/profile/`,
        {
          method: "GET",
          headers: this.getAuthHeaders(),
        }
      );

      return await this.handleResponse(response);
    } catch (error) {
      console.error("User profile error:", error);
      return {
        status: "error",
        message: error.message,
        data: null,
      };
    }
  }

  async getNotifications(page = 1, limit = 10) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/applicant-dashboard/notifications/?page=${page}&limit=${limit}`,
        {
          method: "GET",
          headers: this.getAuthHeaders(),
        }
      );

      return await this.handleResponse(response);
    } catch (error) {
      console.error("Notifications error:", error);
      return {
        status: "error",
        message: error.message,
        data: { results: [], count: 0 },
      };
    }
  }

  async markNotificationAsRead(notificationId) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/applicant-dashboard/notifications/${notificationId}/mark_as_read/`,
        {
          method: "POST",
          headers: this.getAuthHeaders(),
        }
      );

      return await this.handleResponse(response);
    } catch (error) {
      console.error("Mark notification as read error:", error);
      return { status: "error", message: error.message };
    }
  }

  // NEW METHOD: Get dynamic form submissions
  async getDynamicFormSubmissions() {
    try {
      const response = await fetch(
        `${API_BASE_URL}/dynamic-forms/submissions/`,
        {
          method: "GET",
          headers: this.getAuthHeaders(),
        }
      );
      // console.log("Dynamic form submissions response:", response.json());
      return await this.handleResponse(response);
      // return response;
    } catch (error) {
      console.error("Dynamic form submissions error:", error);
      return {
        status: "error",
        message: error.message,
        data: [],
      };
    }
  }

  //get submission by call id
  async getSubmissionByCallId(id) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/dynamic-forms/submissions/${id}/`,
        {
          method: "GET",
          headers: this.getAuthHeaders(),
        }
      );

      return await this.handleResponse(response);
      // If you want to return the raw response instead, uncomment below and comment above
      // return response;
    } catch (error) {
      console.error("Dynamic form submissions error:", error);
      return {
        status: "error",
        message: error.message,
        data: [],
      };
    }
  }

  //form submission of application form Submit dynamic form data
  async submitDynamicForm(formData) {
    console.log("Submitting dynamic form data:", formData);
    try {
      const response = await fetch(
        `${API_BASE_URL}/dynamic-forms/submissions/`,
        {
          method: "POST",
          headers: this.getAuthHeaders(),
          body: JSON.stringify(formData),
        }
      );

      return await this.handleResponse(response);
    } catch (error) {
      console.error("Dynamic form submission error:", error);
      return {
        status: "error",
        message: error.message,
        data: null,
      };
    }
  }

  // Submit dynamic form with all fields and file attachments
  async submitDynamicFormWithAttachments(formData) {
    console.log("Submitting dynamic form with attachments:", formData);
    try {
      const token =
        localStorage.getItem("access_token") ||
        localStorage.getItem("accessToken");
      const headers = {
        Authorization: token ? `Bearer ${token}` : "",
      };

      // Create FormData object to handle file uploads
      const multipartFormData = new FormData();

      // Append all fields from the formData object
      for (const key in formData) {
        if (formData.hasOwnProperty(key)) {
          // Handle nested objects by stringifying them
          if (
            typeof formData[key] === "object" &&
            !(formData[key] instanceof File)
          ) {
            multipartFormData.append(key, JSON.stringify(formData[key]));
          } else {
            multipartFormData.append(key, formData[key]);
          }
        }
      }

      const response = await fetch(
        `${API_BASE_URL}/dynamic-forms/submissions/`,
        {
          method: "POST",
          headers: headers,
          body: formData,
        }
      );

      return await this.handleResponse(response);
    } catch (error) {
      console.error("Dynamic form submission with attachments error:", error);
      return {
        status: "error",
        message: error.message,
        data: null,
      };
    }
  }

  getFallbackDashboardData() {
    return {
      stats: {
        total_proposals: 0,
        approved_proposals: 0,
        under_evaluation: 0,
        not_shortlisted: 0,
        last_updated: new Date().toISOString(),
      },
      recent_activities: [],
      draft_applications: [],
      current_calls: [],
      recent_proposals: [],
    };
  }

  getFallbackProposalStats() {
    return {
      Submitted: [],
      Screening: [],
      Evaluation: [],
      Interview: [],
      Approved: [],
      "Not Shortlisted": [],
      History: [],
    };
  }

  getFallbackProposalDetails(proposalId) {
    return {
      proposalId: proposalId,
      title: "Proposal Details Not Available",
      status: "Unknown",
      workflow: [
        {
          stage: "submitted",
          title: "Proposal Submitted",
          status: "completed",
          date: "Unknown",
          evaluator: null,
          remarks: "Data not available - please check back later",
        },
      ],
      screening: null,
      technicalEvaluation: null,
      presentation: null,
    };
  }

  transformProposalData(apiData) {
    if (!apiData || !apiData.data) return this.getFallbackProposalStats();

    return {
      Submitted: apiData.data.Submitted || [],
      Screening: apiData.data.Screening || [],
      Evaluation: apiData.data.Evaluation || [],
      Interview: apiData.data.Interview || [],
      Approved: apiData.data.Approved || [],
      "Not Shortlisted": apiData.data["Not Shortlisted"] || [],
      History: apiData.data.History || [],
    };
  }

  // Transform dashboard data for compatibility
  transformDashboardData(apiData) {
    if (!apiData || !apiData.data) return this.getFallbackDashboardData();

    const data = apiData.data;
    return {
      stats: {
        total_proposals: data.stats?.total_proposals || 0,
        approved_proposals: data.stats?.approved_proposals || 0,
        under_evaluation: data.stats?.under_evaluation || 0,
        not_shortlisted: data.stats?.not_shortlisted || 0,
        last_updated: data.stats?.last_updated || new Date().toISOString(),
      },
      recent_activities: data.recent_activities || [],
      draft_applications: data.draft_applications || [],
      current_calls: data.current_calls || [],
      recent_proposals: data.recent_proposals || [],
    };
  }

  transformProposalDetails(apiData) {
    if (!apiData) return this.getFallbackProposalDetails("unknown");

    return {
      proposalId: apiData.proposal_id || apiData.proposalId,
      title: apiData.title || "Untitled Proposal",
      status: apiData.status || "Unknown",
      submissionDate: apiData.submission_date || apiData.submissionDate,

      // Workflow/tracking information
      workflow: this.transformWorkflowData(
        apiData.workflow || apiData.tracking || []
      ),

      // Screening details
      screening: apiData.screening
        ? {
            adminDecision:
              apiData.screening.admin_decision ||
              apiData.screening.adminDecision,
            technicalDecision:
              apiData.screening.technical_decision ||
              apiData.screening.technicalDecision,
            adminRemarks:
              apiData.screening.admin_remarks || apiData.screening.adminRemarks,
            technicalRemarks:
              apiData.screening.technical_remarks ||
              apiData.screening.technicalRemarks,
            adminEvaluator:
              apiData.screening.admin_evaluator ||
              apiData.screening.adminEvaluator,
            technicalEvaluator:
              apiData.screening.technical_evaluator ||
              apiData.screening.technicalEvaluator,
          }
        : null,

      // Technical evaluation details
      technicalEvaluation:
        apiData.technical_evaluation || apiData.technicalEvaluation
          ? {
              overallDecision:
                apiData.technical_evaluation?.overall_decision ||
                apiData.technicalEvaluation?.overallDecision,
              assignmentStatus:
                apiData.technical_evaluation?.assignment_status ||
                apiData.technicalEvaluation?.assignmentStatus,
              evaluators: this.transformEvaluators(
                apiData.technical_evaluation?.evaluators ||
                  apiData.technicalEvaluation?.evaluators ||
                  []
              ),
            }
          : null,

      // Presentation/Interview details
      presentation:
        apiData.presentation || apiData.interview
          ? {
              finalDecision:
                apiData.presentation?.final_decision ||
                apiData.interview?.final_decision,
              presentationDate:
                apiData.presentation?.presentation_date ||
                apiData.interview?.interview_date,
              evaluatorRemarks:
                apiData.presentation?.evaluator_remarks ||
                apiData.interview?.evaluator_remarks,
              adminRemarks:
                apiData.presentation?.admin_remarks ||
                apiData.interview?.admin_remarks,
            }
          : null,

      // Additional details
      applicant: apiData.applicant || null,
      service: apiData.service || apiData.call || null,
      documents: apiData.documents || [],
      milestones: apiData.milestones || [],
    };
  }

  // NEW METHOD: Transform workflow data
  transformWorkflowData(workflowArray) {
    if (!Array.isArray(workflowArray)) return [];

    return workflowArray.map((stage) => ({
      stage: stage.stage || stage.name?.toLowerCase(),
      title: stage.title || stage.name || "Unknown Stage",
      status: stage.status || "pending",
      date: stage.date || stage.timestamp || stage.created_at,
      evaluator: stage.evaluator || stage.assigned_to,
      remarks: stage.remarks || stage.comments || stage.notes,
    }));
  }

  transformEvaluators(evaluatorsArray) {
    if (!Array.isArray(evaluatorsArray)) return [];

    return evaluatorsArray.map((evaluator) => ({
      name: evaluator.name || evaluator.evaluator_name,
      email: evaluator.email,
      overallComments: evaluator.overall_comments || evaluator.comments,
      overallScore: evaluator.overall_score || evaluator.total_score,
      criteriaEvaluations:
        evaluator.criteria_evaluations?.map((criteria) => ({
          name: criteria.criteria_name || criteria.name,
          marks: criteria.marks || criteria.score,
          maxMarks: criteria.max_marks || criteria.max_score,
          remarks: criteria.remarks || criteria.comments,
        })) || [],
    }));
  }

  // Error handling utility
  handleApiError(error, fallbackData = null) {
    console.error("API Error:", error);

    // Network errors
    if (error.name === "TypeError" && error.message.includes("fetch")) {
      return {
        status: "error",
        message:
          "Network connection error. Please check your internet connection.",
        data: fallbackData,
      };
    }

    // Authentication errors
    if (
      error.message.includes("401") ||
      error.message.includes("Unauthorized")
    ) {
      return {
        status: "error",
        message: "Authentication required. Please log in again.",
        data: fallbackData,
      };
    }

    // Server errors
    if (error.message.includes("500")) {
      return {
        status: "error",
        message: "Server error. Please try again later.",
        data: fallbackData,
      };
    }

    return {
      status: "error",
      message: error.message || "An unexpected error occurred.",
      data: fallbackData,
    };
  }

  // NEW METHOD: Utility to check if user is authenticated
  isAuthenticated() {
    const token =
      localStorage.getItem("access_token") ||
      localStorage.getItem("accessToken");
    return !!token;
  }

  clearAuth() {
    localStorage.removeItem("access_token");
    localStorage.removeItem("accessToken");
  }

  getApiBaseUrl() {
    return API_BASE_URL;
  }
  // NEW METHOD: Get specific draft by submission ID
  async getDraftBySubmissionId(submissionId) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/dynamic-forms/submissions/${submissionId}/`,
        {
          method: "GET",
          headers: this.getAuthHeaders(),
        }
      );

      return await this.handleResponse(response);
    } catch (error) {
      console.error("Get draft by submission ID error:", error);
      return {
        success: false,
        message: error.message,
        data: null,
      };
    }
  }

  // NEW METHOD: Delete draft form
  async deleteDraftForm(submissionId) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/dynamic-forms/submissions/${submissionId}/`,
        {
          method: "DELETE",
          headers: this.getAuthHeaders(),
        }
      );

      if (response.ok) {
        return { success: true, message: "Draft deleted successfully" };
      }
      return await this.handleResponse(response);
    } catch (error) {
      console.error("Delete draft error:", error);
      return {
        success: false,
        message: error.message,
      };
    }
  }
}



export default new ApplicantDashboardService();
