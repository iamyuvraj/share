// api/FormSectionService.js -

import axios from 'axios';


const getApiBaseUrl = () => {
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return 'http://localhost:8000'; 
  }
  return window.location.origin; 
};

const API_BASE_URL = getApiBaseUrl();
const FORM_API_BASE = `${API_BASE_URL}/api/form-sections`;

class FormSectionService {
  
  static createFormData(data, files = {}) {
    const formData = new FormData();
    
   
    Object.keys(data).forEach(key => {
      if (data[key] !== null && data[key] !== undefined) {
        if (typeof data[key] === 'object' && !(data[key] instanceof File)) {
          formData.append(key, JSON.stringify(data[key]));
        } else {
          formData.append(key, data[key]);
        }
      }
    });
    
    // Add files
    Object.keys(files).forEach(key => {
      if (files[key] instanceof File) {
        formData.append(key, files[key]);
      }
    });
    
    return formData;
  }

  
  static getAuthHeaders() {
    
    const possibleKeys = ['access_token', 'authToken', 'token', 'accessToken', 'jwt_token'];
    let token = null;
    
   
    for (const key of possibleKeys) {
      token = localStorage.getItem(key);
      if (token) {
        console.log(`Found token in localStorage with key: ${key}`);
        break;
      }
    }
    

    if (!token) {
      for (const key of possibleKeys) {
        token = sessionStorage.getItem(key);
        if (token) {
          console.log(`Found token in sessionStorage with key: ${key}`);
          break;
        }
      }
    }
    
    if (!token) {
      
      return {
        'Content-Type': 'application/json',
      };
    }


    let authToken = token;
    
   
    if (token.toLowerCase().startsWith('bearer ')) {
      authToken = token;
    } else {
      authToken = `Bearer ${token}`;
    }

    console.log('Using auth token:', authToken.substring(0, 50) + '...');
    
    return {
      'Authorization': authToken,
      'Content-Type': 'application/json',
    };
  }


  static getMultipartAuthHeaders() {
    const possibleKeys = ['access_token', 'authToken', 'token', 'accessToken', 'jwt_token'];
    let token = null;
    

    for (const key of possibleKeys) {
      token = localStorage.getItem(key);
      if (token) break;
    }
   
    if (!token) {
      for (const key of possibleKeys) {
        token = sessionStorage.getItem(key);
        if (token) break;
      }
    }
    
    if (!token) {
      console.warn('No authentication token found for multipart request');
     
      return {};
    }

    let authToken = token;
    if (!token.toLowerCase().startsWith('bearer ')) {
      authToken = `Bearer ${token}`;
    }

    
    return {
      'Authorization': authToken,
    };
  }

  
  static checkAuth() {
    const headers = this.getAuthHeaders();
    console.log('Auth check:', {
      hasAuth: !!headers.Authorization,
      tokenPrefix: headers.Authorization ? headers.Authorization.substring(0, 20) + '...' : 'None'
    });
    return !!headers.Authorization;
  }

  // Section 1: Basic Details
  static async getBasicDetails(submissionId) {
    try {
      if (!this.checkAuth()) {
        throw new Error('No authentication token available');
      }

      const response = await axios.get(`${FORM_API_BASE}/basic-details/retrieve/`, {
        params: { submission_id: submissionId },
        headers: this.getAuthHeaders()
      });
      return response.data;
    } catch (error) {
      console.error('Error in getBasicDetails:', error.response?.data || error.message);
      throw error.response?.data || error;
    }
  }

  static async updateBasicDetails(data, files = {}) {
    try {
      if (!this.checkAuth()) {
        throw new Error('No authentication token available');
      }

      const formData = this.createFormData(data, files);
      const response = await axios.patch(`${FORM_API_BASE}/basic-details/update/`, formData, {
        headers: this.getMultipartAuthHeaders()
      });
      return response.data;
    } catch (error) {
      console.error('Error in updateBasicDetails:', error.response?.data || error.message);
      throw error.response?.data || error;
    }
  }

  // Section 2: Consortium Partners
  static async getConsortiumPartners(submissionId) {
    try {
      if (!this.checkAuth()) {
        throw new Error('No authentication token available');
      }

      const response = await axios.get(`${FORM_API_BASE}/consortium-partners/retrieve/`, {
        params: { submission_id: submissionId },
        headers: this.getAuthHeaders()
      });
      return response.data;
    } catch (error) {
      console.error('Error in getConsortiumPartners:', error.response?.data || error.message);
      throw error.response?.data || error;
    }
  }

  static async addCollaborator(data, files = {}) {
    try {
      if (!this.checkAuth()) {
        throw new Error('No authentication token available');
      }

      const formData = this.createFormData(data, files);
      const response = await axios.post(`${FORM_API_BASE}/consortium-partners/add_collaborator/`, formData, {
        headers: this.getMultipartAuthHeaders()
      });
      return response.data;
    } catch (error) {
      console.error('Error in addCollaborator:', error.response?.data || error.message);
      throw error.response?.data || error;
    }
  }

  static async updateCollaborator(data, files = {}) {
    try {
      const formData = this.createFormData(data, files);
      const response = await axios.patch(`${FORM_API_BASE}/consortium-partners/update_collaborator/`, formData, {
        headers: this.getMultipartAuthHeaders()
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  static async deleteCollaborator(collaboratorId) {
    try {
      const response = await axios.delete(`${FORM_API_BASE}/consortium-partners/delete_collaborator/`, {
        params: { collaborator_id: collaboratorId },
        headers: this.getAuthHeaders()
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  static async addShareHolder(data, files = {}) {
    try {
      const formData = this.createFormData(data, files);
      const response = await axios.post(`${FORM_API_BASE}/consortium-partners/add_shareholder/`, formData, {
        headers: this.getMultipartAuthHeaders()
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  static async addRDStaff(data, files = {}) {
    try {
      const formData = this.createFormData(data, files);
      const response = await axios.post(`${FORM_API_BASE}/consortium-partners/add_rdstaff/`, formData, {
        headers: this.getMultipartAuthHeaders()
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  static async addEquipment(data) {
    try {
      const response = await axios.post(`${FORM_API_BASE}/consortium-partners/add_equipment/`, data, {
        headers: this.getAuthHeaders()
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  static async updateConsortiumGeneral(data) {
    try {
      const response = await axios.patch(`${FORM_API_BASE}/consortium-partners/update_general/`, data, {
        headers: this.getAuthHeaders()
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  // Section 3: Proposal Details
  static async getProposalDetails(submissionId) {
    try {
      const response = await axios.get(`${FORM_API_BASE}/proposal-details/retrieve/`, {
        params: { submission_id: submissionId },
        headers: this.getAuthHeaders()
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  static async updateProposalDetails(data) {
    try {
      const response = await axios.patch(`${FORM_API_BASE}/proposal-details/update/`, data, {
        headers: this.getAuthHeaders()
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  // Section 4: Fund Details
  static async getFundDetails(submissionId) {
    try {
      const response = await axios.get(`${FORM_API_BASE}/fund-details/retrieve/`, {
        params: { submission_id: submissionId },
        headers: this.getAuthHeaders()
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  static async updateFundDetails(data, files = {}) {
    try {
      const formData = this.createFormData(data, files);
      const response = await axios.patch(`${FORM_API_BASE}/fund-details/update/`, formData, {
        headers: this.getMultipartAuthHeaders()
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  // Section 5: Budget Estimate
  static async getBudgetEstimate(submissionId) {
    try {
      const response = await axios.get(`${FORM_API_BASE}/budget-estimate/retrieve/`, {
        params: { submission_id: submissionId },
        headers: this.getAuthHeaders()
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  static async updateBudgetEstimate(data) {
    try {
      const response = await axios.patch(`${FORM_API_BASE}/budget-estimate/update/`, data, {
        headers: this.getAuthHeaders()
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  // Section 6: Finance Details
  static async getFinanceDetails(submissionId) {
    try {
      const response = await axios.get(`${FORM_API_BASE}/finance-details/retrieve/`, {
        params: { submission_id: submissionId },
        headers: this.getAuthHeaders()
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  static async updateFinanceDetails(data) {
    try {
      const response = await axios.patch(`${FORM_API_BASE}/finance-details/update/`, data, {
        headers: this.getAuthHeaders()
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  // Section 7: Objective Timeline
  static async getObjectiveTimeline(submissionId) {
    try {
      const response = await axios.get(`${FORM_API_BASE}/objective-timeline/retrieve/`, {
        params: { submission_id: submissionId },
        headers: this.getAuthHeaders()
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  static async updateObjectiveTimeline(data, files = {}) {
    try {
      const formData = this.createFormData(data, files);
      

      if (data.milestones && Array.isArray(data.milestones)) {
       
        const milestonesData = data.milestones.map(milestone => ({
          title: milestone.milestoneName || milestone.title || 'Untitled Milestone',
          description: milestone.description || '',
          time_required: milestone.timeRequired || milestone.time_required,
          grant_from_ttdf: milestone.grantFromTtdf || milestone.grant_from_ttdf,
          initial_contri_applicant: milestone.initialContriApplicant || milestone.initial_contri_applicant,
          start_date: milestone.startDate || milestone.start_date,
          due_date: milestone.endDate || milestone.due_date || milestone.end_date,
          activities: milestone.activities || ''
        }));
        
        formData.append('milestones', JSON.stringify(milestonesData));
      }
      
      const response = await axios.patch(`${FORM_API_BASE}/objective-timeline/update/`, formData, {
        headers: this.getMultipartAuthHeaders()
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  // Section 8: IPR Details
  static async getIPRDetails(submissionId) {
    try {
      const response = await axios.get(`${FORM_API_BASE}/ipr-details/retrieve/`, {
        params: { submission_id: submissionId },
        headers: this.getAuthHeaders()
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  static async updateIPRDetails(formDataOrData, files = {}) {
  try {
    if (!this.checkAuth()) {
      throw new Error('No authentication token available');
    }


    let formData;
    
    if (formDataOrData instanceof FormData) {
    
      formData = formDataOrData;
      console.log('🔍 IPR: Using existing FormData from ApplicationPage');
    } else {
     
      formData = this.createFormData(formDataOrData, files);
      console.log('🔍 IPR: Created FormData from data + files');
    }

    
    console.log('🔍 IPR FormData contents:');
    for (let [key, value] of formData.entries()) {
      console.log(`  ${key}:`, value instanceof File ? `File(${value.name})` : value);
    }

    const response = await axios.patch(`${FORM_API_BASE}/ipr-details/update/`, formData, {
      headers: this.getMultipartAuthHeaders()
    });
    return response.data;
  } catch (error) {
    console.error('Error updating IPR details:', error.response?.data || error.message);
    throw error.response?.data || error;
  }
}
  // Section 9: Project Details
  static async getProjectDetails(submissionId) {
    try {
      const response = await axios.get(`${FORM_API_BASE}/project-details/retrieve/`, {
        params: { submission_id: submissionId },
        headers: this.getAuthHeaders()
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  static async updateProjectDetails(data, files = {}) {
    try {
      const formData = this.createFormData(data, files);
      const response = await axios.patch(`${FORM_API_BASE}/project-details/update/`, formData, {
        headers: this.getMultipartAuthHeaders()
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  // Declaration
  static async getDeclaration(submissionId) {
    try {
      const response = await axios.get(`${FORM_API_BASE}/declaration/retrieve/`, {
        params: { submission_id: submissionId },
        headers: this.getAuthHeaders()
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  static async updateDeclaration(data, files = {}) {
    try {
      const formData = this.createFormData(data, files);
      const response = await axios.patch(`${FORM_API_BASE}/declaration/update/`, formData, {
        headers: this.getMultipartAuthHeaders()
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }


  static async createNewSubmission(templateId, serviceId) {
    try {
     
      
 
      const headers = this.getAuthHeaders();
      console.log('Headers:', headers);
      
      if (!headers.Authorization) {
        throw new Error('Authentication required. Please log in.');
      }

      console.log('Making request to:', `${FORM_API_BASE}/submission-control/create-new/`);
      
      const requestData = {
        template_id: templateId,
        service_id: serviceId
      };
      
      console.log('Request data:', requestData);
      
      const response = await axios.post(`${FORM_API_BASE}/submission-control/create-new/`, requestData, {
        headers: headers
      });
      
      console.log('Submission created successfully:', response.data);
      return response.data;
    } catch (error) {
     
      
      if (error.response?.status === 401) {
  
        
        throw new Error('Authentication failed. Please log in again.');
      }
      
      throw error.response?.data || error;
    }
  }

  static async getSubmissionStatus(submissionId) {
    try {
      if (!this.checkAuth()) {
        throw new Error('Authentication required. Please log in.');
      }

      const response = await axios.get(`${FORM_API_BASE}/submission-control/status/`, {
        params: { submission_id: submissionId },
        headers: this.getAuthHeaders()
      });
      return response.data;
    } catch (error) {
      console.error('Error getting submission status:', error.response?.data || error.message);
      throw error.response?.data || error;
    }
  }

  static async submitForm(submissionId) {
    try {
      if (!this.checkAuth()) {
        throw new Error('Authentication required. Please log in.');
      }

      const response = await axios.post(`${FORM_API_BASE}/submission-control/submit/`, {
        submission_id: submissionId
      }, {
        headers: this.getAuthHeaders()
      });
      return response.data;
    } catch (error) {
      console.error('Error submitting form:', error.response?.data || error.message);
      throw error.response?.data || error;
    }
  }
  static async updateSectionCompletion(submissionId, sectionIndex, isCompleted) {
  try {
    if (!this.checkAuth()) {
      throw new Error('No authentication token available');
    }

    const response = await axios.post(`${FORM_API_BASE}/submission-control/update-completion/`, {
      submission_id: submissionId,
      section_index: sectionIndex,
      is_completed: isCompleted
    }, {
      headers: this.getAuthHeaders()
    });
    return response.data;
  } catch (error) {
    console.error('Error updating section completion:', error.response?.data || error.message);
    throw error.response?.data || error;
  }
}

static async getSectionCompletionStatus(submissionId) {
  try {
    if (!this.checkAuth()) {
      throw new Error('No authentication token available');
    }

    const response = await axios.get(`${FORM_API_BASE}/submission-control/completion-status/`, {
      params: { submission_id: submissionId },
      headers: this.getAuthHeaders()
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching section completion status:', error.response?.data || error.message);
    throw error.response?.data || error;
  }
}


static async addTeamMember(formData) {
  try {
    if (!this.checkAuth()) {
      throw new Error('No authentication token available');
    }

    const response = await axios.post(`${FORM_API_BASE}/proposal-details/add_team_member/`, formData, {
      headers: this.getMultipartAuthHeaders()
    });
    return response.data;
  } catch (error) {
    console.error('Error adding team member:', error.response?.data || error.message);
    throw error.response?.data || error;
  }
}

static async updateTeamMember(formData) {
  try {
    if (!this.checkAuth()) {
      throw new Error('No authentication token available');
    }

    const response = await axios.patch(`${FORM_API_BASE}/proposal-details/update_team_member/`, formData, {
      headers: this.getMultipartAuthHeaders()
    });
    return response.data;
  } catch (error) {
    console.error('Error updating team member:', error.response?.data || error.message);
    throw error.response?.data || error;
  }
}

static async deleteTeamMember(teamMemberId) {
  try {
    if (!this.checkAuth()) {
      throw new Error('No authentication token available');
    }

    const response = await axios.delete(`${FORM_API_BASE}/proposal-details/delete_team_member/`, {
      params: { team_member_id: teamMemberId },
      headers: this.getAuthHeaders()
    });
    return response.data;
  } catch (error) {
    console.error('Error deleting team member:', error.response?.data || error.message);
    throw error.response?.data || error;
  }
}

static async updateShareHolder(data, files = {}) {
  try {
    if (!this.checkAuth()) {
      throw new Error('No authentication token available');
    }

    const formData = this.createFormData(data, files);
    const response = await axios.patch(`${FORM_API_BASE}/consortium-partners/update_shareholder/`, formData, {
      headers: this.getMultipartAuthHeaders()
    });
    return response.data;
  } catch (error) {
    console.error('Error updating shareholder:', error.response?.data || error.message);
    throw error.response?.data || error;
  }
}

static async deleteShareHolder(shareholderId) {
  try {
    if (!this.checkAuth()) {
      throw new Error('No authentication token available');
    }

    const response = await axios.delete(`${FORM_API_BASE}/consortium-partners/delete_shareholder/`, {
      params: { shareholder_id: shareholderId },
      headers: this.getAuthHeaders()
    });
    return response.data;
  } catch (error) {
    console.error('Error deleting shareholder:', error.response?.data || error.message);
    throw error.response?.data || error;
  }
}

// R&D Staff methods
static async updateRDStaff(data, files = {}) {
  try {
    if (!this.checkAuth()) {
      throw new Error('No authentication token available');
    }

    const formData = this.createFormData(data, files);
    const response = await axios.patch(`${FORM_API_BASE}/consortium-partners/update_rdstaff/`, formData, {
      headers: this.getMultipartAuthHeaders()
    });
    return response.data;
  } catch (error) {
    console.error('Error updating R&D staff:', error.response?.data || error.message);
    throw error.response?.data || error;
  }
}

static async deleteRDStaff(staffId) {
  try {
    if (!this.checkAuth()) {
      throw new Error('No authentication token available');
    }

    const response = await axios.delete(`${FORM_API_BASE}/consortium-partners/delete_rdstaff/`, {
      params: { staff_id: staffId },
      headers: this.getAuthHeaders()
    });
    return response.data;
  } catch (error) {
    console.error('Error deleting R&D staff:', error.response?.data || error.message);
    throw error.response?.data || error;
  }
}

// Equipment methods
static async updateEquipment(data) {
  try {
    if (!this.checkAuth()) {
      throw new Error('No authentication token available');
    }

    const response = await axios.patch(`${FORM_API_BASE}/consortium-partners/update_equipment/`, data, {
      headers: this.getAuthHeaders()
    });
    return response.data;
  } catch (error) {
    console.error('Error updating equipment:', error.response?.data || error.message);
    throw error.response?.data || error;
  }
}

static async deleteEquipment(equipmentId) {
  try {
    if (!this.checkAuth()) {
      throw new Error('No authentication token available');
    }

    const response = await axios.delete(`${FORM_API_BASE}/consortium-partners/delete_equipment/`, {
      params: { equipment_id: equipmentId },
      headers: this.getAuthHeaders()
    });
    return response.data;
  } catch (error) {
    console.error('Error deleting equipment:', error.response?.data || error.message);
    throw error.response?.data || error;
  }
}

  

static async addSubShareHolder(data, files = {}) {
  try {
    if (!this.checkAuth()) {
      throw new Error('No authentication token available');
    }

    const formData = this.createFormData(data, files);
    const response = await axios.post(`${FORM_API_BASE}/consortium-partners/add_sub_shareholder/`, formData, {
      headers: this.getMultipartAuthHeaders()
    });
    return response.data;
  } catch (error) {
    console.error('Error adding sub-shareholder:', error.response?.data || error.message);
    throw error.response?.data || error;
  }
}

static async updateSubShareHolder(data, files = {}) {
  try {
    if (!this.checkAuth()) {
      throw new Error('No authentication token available');
    }

    const formData = this.createFormData(data, files);
    const response = await axios.patch(`${FORM_API_BASE}/consortium-partners/update_sub_shareholder/`, formData, {
      headers: this.getMultipartAuthHeaders()
    });
    return response.data;
  } catch (error) {
    console.error('Error updating sub-shareholder:', error.response?.data || error.message);
    throw error.response?.data || error;
  }
}

static async deleteSubShareHolder(subShareholderId) {
  try {
    if (!this.checkAuth()) {
      throw new Error('No authentication token available');
    }

    const response = await axios.delete(`${FORM_API_BASE}/consortium-partners/delete_sub_shareholder/`, {
      params: { sub_shareholder_id: subShareholderId },
      headers: this.getAuthHeaders()
    });
    return response.data;
  } catch (error) {
    console.error('Error deleting sub-shareholder:', error.response?.data || error.message);
    throw error.response?.data || error;
  }
}

  static async listSubmissions() {
    try {
      if (!this.checkAuth()) {
        throw new Error('Authentication required. Please log in.');
      }

      const response = await axios.get(`${FORM_API_BASE}/submission-control/list/`, {
        headers: this.getAuthHeaders()
      });
      return response.data;
    } catch (error) {
      console.error('Error listing submissions:', error.response?.data || error.message);
      throw error.response?.data || error;
    }
  }
  
}

export default FormSectionService;