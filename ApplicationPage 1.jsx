import React, { useState, useEffect, useRef } from "react";
import { IoMdCheckmark } from "react-icons/io";
import { FaCheckCircle } from "react-icons/fa";
import { motion } from "framer-motion";
import { useLocation, useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import BasicForm from "./Form/BasicForm";
import Collaborator from "./Form/Collaborator";
import FundDetails from "./Form/FundDetails";
import FinanceDetails from "./Form/FinanceDetails";
import ObjectiveTimelines from "./Form/ObjectiveTimelines";
import ProposalDetails from "./Form/ProposalDetails";
import IPRDetails from "./Form/IPRDetails";
import ProjectDetails from "./Form/ProjectDetails";
import BudgetEstimate from "./Form/BudgetEstimate";
import FormSectionService from "../../api/FormSectionService";
import SuccessModal from "../../components/SuccessModal";
import { UserProfileService } from "../../api/UserProfileService";

const Step = ({ number, label, active = false, completed = false, onClick, disabled = false }) => (
  <div
    className={`flex items-center w-full p-3 ${disabled ? "cursor-not-allowed" : "cursor-pointer"}`}
    onClick={!disabled ? onClick : undefined}
  >
    <div
      className={`w-8 h-8 rounded-full flex items-center justify-center font-bold transition-all duration-300
        ${completed
          ? "bg-green-500 text-white shadow-lg"
          : active
          ? "bg-yellow-400 text-gray-800 shadow-md"
          : disabled
          ? "bg-gray-100 text-gray-400"
          : "bg-gray-300 text-gray-600 hover:bg-yellow-300 hover:text-gray-800"
        }`}
    >
      {completed ? <IoMdCheckmark className="text-lg" /> : number}
    </div>
    <span
      className={`text-sm ml-3 font-medium transition-all duration-300 flex-1
        ${completed
          ? "text-green-700"
          : active
          ? "text-yellow-700"
          : disabled
          ? "text-gray-400"
          : "text-gray-700 hover:text-yellow-700"
        }`}
    >
      {label}
    </span>
    {disabled && (
      <span className="text-xs text-gray-400 ml-2">(Complete Previous Steps)</span>
    )}
  </div>
);

const sidebarVariants = {
  hidden: { opacity: 0, x: -50 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

const contentVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

const mapFrontendToBackendValues = (collaborator) => {
  const collaboratorTypeMapping = {
    'Principal Applicant': 'principalApplicant',
    'Consortium Partner': 'consortiumPartner',
  };
  
  const ttdfCompanyMapping = {
    'Domestic Company with focus on Telecom R&D, Use Case Development': 'domestic_company',
    'Start-ups/MSMEs': 'startup_msme',
    'Academic Institutions': 'academic',
    'R&D Institutions, Section 8 Companies/Societies, Central & State Government Entities/PSUs/Autonomous Bodies/SPVs/Limited Liability Partnerships': 'rnd_section8_govt',
  };
  
  return {
    ...collaborator,
    applicantType: collaboratorTypeMapping[collaborator.applicantType] || collaborator.applicantType || 'principalApplicant',
    ttdfCompany: ttdfCompanyMapping[collaborator.ttdfCompany] || collaborator.ttdfCompany || ''
 
};
};
const mapApiResponseToFormData = (apiData) => {
  const createFilePreview = (path) => {
    if (!path) return null;
    
    const getApiBaseUrl = () => {
      if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        return 'http://localhost:8000';
      }
      return window.location.origin;
    };
    
    const API_BASE_URL = getApiBaseUrl();
    
    if (path.startsWith('http://') || path.startsWith('https://')) {
      return { url: path };
    }
    
    const cleanPath = path.startsWith('/') ? path.substring(1) : path;
    const fullUrl = `${API_BASE_URL}/${cleanPath}`;
    
    return { url: fullUrl };
  };

  return {
    basicForm: {
      applicantPhoto: null,
      applicantPhotoPreview: createFilePreview(apiData.profile_image || apiData.applicantPhoto),
      applicantName: apiData.full_name || apiData.applicantName || "",
      gender: apiData.gender || "",
      qualification: apiData.qualification || "",
      resume: null,
      resumePreview: createFilePreview(apiData.resume),
      mobile: apiData.mobile || "",
      email: apiData.email || "",
      individualPanAttachment: null,
      individualPanAttachmentPreview: createFilePreview(apiData.tan_pan_cin || apiData.individualPanAttachment),
      individualPAN: apiData.individual_pan || "",
      organization: apiData.organization || "",
      landline: apiData.landline || apiData.landline_number || "",
      website: apiData.website || apiData.website_link || "",
      proposalBy: apiData.proposalBy || apiData.proposal_submitted_by || "",
      panFile: null,
      panFilePreview: createFilePreview(apiData.pan_file || apiData.panFile),
      registrationCertificate: null,
      registrationCertificatePreview: createFilePreview(apiData.organization_registration_certificate || apiData.registrationCertificate),
      ttdfCompany: apiData.ttdfCompany || apiData.company_as_per_guidelines || "",
      shareHoldingPattern: null,
      shareHoldingPatternPreview: createFilePreview(apiData.share_holding_pattern || apiData.shareHoldingPattern),
      dsirCertificate: null,
      dsirCertificatePreview: createFilePreview(apiData.dsir_certificate || apiData.dsirCertificate),
      addressLine1: apiData.addressLine1 || apiData.address_line_1 || "",
      addressLine2: apiData.addressLine2 || apiData.address_line_2 || "",
      streetVillage: apiData.streetVillage || apiData.street_village || "",
      city: apiData.city || "",
      country: apiData.country || "",
      state: apiData.state || "",
      pincode: apiData.pincode || "",
    },
    
    collaborator: {
      collaborators: (apiData.collaborators || []).map((collab) => ({
        id: collab.id,
        contactPersonName: collab.contact_person_name_collab || collab.contactPersonName || "",
        organizationName: collab.organization_name_collab || collab.organizationName || "",
        organizationType: collab.organization_type_collab || collab.organizationType || "",
        ttdfCompany: collab.ttdf_company || collab.ttdfCompany || "",
        pan: collab.pan_file_name_collab || collab.pan || "", 
        panFile: null,
        panFileName: collab.pan_file_name_collab || collab.panFileName || "",
        panFilePreview: createFilePreview(collab.pan_file_collab || collab.panFilePreview), 
        mouFile: null,
        mouFileName: collab.mou_file_name_collab || collab.mouFileName || "",
        mouFilePreview: createFilePreview(collab.mou_file_collab || collab.mouFilePreview),
        applicantType: collab.collaborator_type || collab.applicantType || "",
      })),
      shareHolders: (apiData.shareholders || []).map((holder) => ({
        id: holder.id,
        shareHolderName: holder.share_holder_name || "",
        sharePercentage: holder.share_percentage || "",
        identityDocument: null,
        identityDocumentName: holder.identity_document_name || "",
        identityDocumentPreview: createFilePreview(holder.identity_document),
      })),
      subShareHolders: (apiData.sub_shareholders || []).map((holder) => ({
        id: holder.id,
        shareHolderName: holder.share_holder_name || "",
        sharePercentage: holder.share_percentage || "",
        identityDocument: null,
        identityDocumentName: holder.identity_document_name || "",
        identityDocumentPreview: createFilePreview(holder.identity_document),
        organizationName: holder.organization_name_subholder || "",
      })),
      rdStaff: (apiData.rdstaff || []).map((staff) => ({
        id: staff.id,
        name: staff.name || "",
        designation: staff.designation || "",
        email: staff.email || "",
        highestQualification: staff.highest_qualification || "",
        mobile: staff.mobile || "",
        resume: null,
        resumePreview: createFilePreview(staff.rd_staf_resume),
        epfDetails: staff.epf_details || "",
      })),
      equipments: (apiData.equipments || []).map((equip) => ({
        id: equip.id,
        item: equip.item || "",
        unitPrice: equip.unit_price || 0,
        quantity: equip.quantity || 0,
        amount: equip.amount || 0,
        contributorType: equip.contributor_type || "",
      })),
      ttdfAppliedBefore: apiData.ttdf_applied_before || apiData.appliedBefore || "",
    },
    
    fundDetails: {
      hasLoan: apiData.has_loan === "yes" ? "Yes" : apiData.has_loan === "no" ? "No" : "",
      loanDescription: apiData.fund_loan_description || "",
      loanAmount: apiData.fund_loan_amount || "",
      loanDocuments: (apiData.fund_loan_documents || []).map((doc) => ({
        id: doc.id,
        file: null,
        name: doc.name || "Loan Document",
        preview: createFilePreview(doc.document),
      })),
      bankName: apiData.bank_name || "",
      bankBranch: apiData.bank_branch || "",
      bankAccountNumber: apiData.bank_account_number || "",
      ifscCode: apiData.ifsc_code || "",
      accountType: apiData.account_type || "",
    },
    
    financeDetails: {
  contributionRows: apiData.contribution_rows || [],  
  fundRows: apiData.fund_rows || [],                  
  grant_from_ttdf: parseFloat(apiData.grant_from_ttdf) || 0,
  contribution_applicant: parseFloat(apiData.contribution_applicant) || 0,
  expected_other_contribution: parseFloat(apiData.expected_other_contribution) || 0,
  other_source_funding: parseFloat(apiData.other_source_funding) || 0,
  actual_grant_from_ttdf: parseFloat(apiData.actual_grant_from_ttdf) || 0,
  actual_contribution_applicant: parseFloat(apiData.actual_contribution_applicant) || 0,
  total_project_cost: parseFloat(apiData.total_project_cost) || 0,
},

    objectiveTimelines: {
  milestones: (apiData.milestones || []).map((milestone) => ({
    id: milestone.id,
    milestoneName: milestone.title || milestone.milestone_name || "",
    startDate: milestone.start_date?.split("T")[0] || new Date().toISOString().split("T")[0],
    endDate: milestone.due_date?.split("T")[0] || milestone.end_date?.split("T")[0] || new Date(
      new Date(milestone.start_date || new Date()).getTime() +
      (milestone.time_required || 0) * 30 * 24 * 60 * 60 * 1000
    ).toISOString().split("T")[0],
    timeRequired: milestone.time_required || 0,
    grantFromTtdf: milestone.grant_from_ttdf || 0,
    initialContriApplicant: milestone.initial_contri_applicant || 0,
    description: milestone.description || "",
    activities: milestone.activities || "",
  })),
  
  // CLEAN: Map saved data to milestoneData, keep empty slots for new input
  milestoneData: Array(6).fill(null).map((_, index) => {
    const milestone = (apiData.milestones || [])[index];
    if (milestone) {
      // Use saved data
      return {
        id: milestone.id || index + 1,
        scopeOfWork: milestone.title || "",
        timeRequiredMonths: milestone.time_required || "",
        activities: milestone.activities || "",
        ttdfGrantINR: milestone.grant_from_ttdf || 0,
        applicantContributionINR: milestone.initial_contri_applicant || 0,
        description: milestone.description || "",
        startDate: milestone.start_date?.split("T")[0] || new Date().toISOString().split("T")[0],
        endDate: milestone.due_date?.split("T")[0] || milestone.end_date?.split("T")[0] || new Date(
          new Date(milestone.start_date || new Date()).getTime() +
          (milestone.time_required || 0) * 30 * 24 * 60 * 60 * 1000
        ).toISOString().split("T")[0],
      };
    } else {
      // Empty slot for user input
      return {
        id: index + 1,
        scopeOfWork: "",
        timeRequiredMonths: "",
        activities: "",
        ttdfGrantINR: 0,
        applicantContributionINR: 0,
        description: "",
        startDate: new Date().toISOString().split("T")[0],
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      };
    }
  }),
},
    
    budgetEstimate: {
  // FIXED: Handle both direct tables and nested structure for budget estimate
  tables: apiData.budget_estimate?.tables || apiData.tables || [],
  
  equipmentOverhead: {
    // 🔧 CRITICAL FIX: This was the missing piece!
    // The API now returns 'equipment_overhead' (with underscore) from your serializer fix
    tables: apiData.equipment_overhead?.tables || []
  },
  
  incomeEstimate: {
    // FIXED: Handle both underscore and camelCase versions
    rows: apiData.income_estimate?.rows || apiData.incomeEstimate?.rows || []
  },
  
  grantTotals: {
    capexYear0: parseFloat(apiData.capex_year_0) || 0,
    opexYear1: parseFloat(apiData.opex_year_1) || 0,
    opexYear2: parseFloat(apiData.opex_year_2) || 0,
  },
  
  // Other fields remain the same
  networkCore: apiData.network_core?.items || [],
  radioAccessNetwork: apiData.radio_access_network?.items || [],
  fixedWirelessAccess: apiData.fixed_wireless_access?.items || [],
  civilElectricalInfrastructure: apiData.civil_electrical_infrastructure?.items || [],
  centralizedServers: apiData.centralised_servers_and_edge_analytics?.items || [],
  passiveComponents: apiData.passive_components?.items || [],
  softwareComponents: apiData.software_components?.items || [],
  sensorNetworkCosts: apiData.sensor_network_costs || {},
  installationInfrastructure: apiData.installation_infrastructure_and_commissioning?.items || [],
  operationMaintenance: apiData.operation_maintenance_and_warranty?.items || [],
  manpowerDetails: apiData.manpower_details || [],
  otherRequirements: apiData.other_requirements || [],
},
    proposalDetails: {
      keyInformation: {
        proposalBrief: apiData.proposal_brief || "",
        grantToTurnoverRatio: apiData.grant_to_turnover_ratio || "",
      },
      proposalSummary: {
        proposedVillage: apiData.proposed_village || "",
        useCase: apiData.use_case || "",
        potentialImpact: apiData.potential_impact || "",
        endToEndSolution: apiData.end_to_end_solution || "",
        dataSecurityMeasures: apiData.data_security_measures || "",
        modelVillage: apiData.model_village || "",
      },
      teamMembers: Array.isArray(apiData.team_members) && apiData.team_members.length > 0
  ? apiData.team_members.map((member) => ({
      // FIXED: Use the actual database ID, not a prefixed string
      id: member.id,  // Use the raw database ID
      name: member.name || "",
      resumeFile: null,
      resumeFilePreview: createFilePreview(member.resumefile),
      resumeText: member.resumetext || "",
      otherDetails: member.otherdetails || "",
    }))
  : [
      {
        id: -1, 
        name: "",
        resumeFile: null,
        resumeFilePreview: null,
        resumeText: "",
        otherDetails: "",
      },
    
          ],
    },
    
    iprDetails: Array.isArray(apiData.ipr_details) && apiData.ipr_details.length > 0
      ? apiData.ipr_details.map((ipr) => ({
          id: ipr.id,
          essenceOfProposal: {
            nationalImportance: ipr.national_importance || "",
            commercializationPotential: ipr.commercialization_potential || "",
            riskFactors: ipr.risk_factors || "",
            preliminaryWorkDone: ipr.preliminary_work_done || "",
            technologyStatus: ipr.technology_status || "",
            businessStrategy: ipr.business_strategy || "",
          },
          ipRegulatoryDetails: {
            basedOnIPR: ipr.based_on_ipr || "",
            ipOwnershipDetails: ipr.ip_ownership_details || "",
            ipProposal: ipr.ip_proposal || "",
            regulatoryApprovals: ipr.regulatory_approvals || "",
            statusApprovals: ipr.status_approvals || "",
            proofOfStatus: null,
            proofOfStatusPreview: createFilePreview(ipr.proof_of_status),
          },
          telecomServiceProvider: {
            name: ipr.t_name || "",
            designation: ipr.t_designation || "",
            mobileNumber: ipr.t_mobile_number || "",
            email: ipr.t_email || "",
            address: ipr.t_address || "",
            supportLetter: null,
            supportLetterPreview: createFilePreview(ipr.t_support_letter),
          },
        }))
      : [
          {
            id: 1,
            essenceOfProposal: {
              nationalImportance: "",
              commercializationPotential: "",
              riskFactors: "",
              preliminaryWorkDone: "",
              technologyStatus: "",
              businessStrategy: "",
            },
            ipRegulatoryDetails: {
              basedOnIPR: "",
              ipOwnershipDetails: "",
              ipProposal: "",
              regulatoryApprovals: "",
              statusApprovals: "",
              proofOfStatus: null,
              proofOfStatusPreview: null,
            },
            telecomServiceProvider: {
              name: "",
              designation: "",
              mobileNumber: "",
              email: "",
              address: "",
              supportLetter: null,
              supportLetterPreview: null,
            },
          },
        ],
    
    projectDetails: {
      ganttChart: null,
      ganttChartPreview: createFilePreview(apiData.gantt_chart),
      dpr: null,
      dprPreview: createFilePreview(apiData.technical_proposal),
      presentation: null,
      presentationPreview: createFilePreview(apiData.proposal_presentation),
    },
    
    status: apiData.status || "draft",
  };
};

const ApplicationPage = () => {
  const location = useLocation();
  const callDetail = location.state?.callData || {};
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState(new Set());
  const [isDraftSaved, setIsDraftSaved] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionId, setSubmissionId] = useState(null);
  const [grantTotals, setGrantTotals] = useState({
    grandTotal: { capexYear0: 0, opexYear1: 0, opexYear2: 0 },
    isValid: false,
  });

  useEffect(() => {
    if (!callDetail || !callDetail.template_id) {
      toast.error('Missing application configuration. Please go back and select the service again.');
    }
  }, [callDetail]);

  useEffect(() => {
    const storedId = localStorage.getItem("submissionId");
    if (storedId) {
      setSubmissionId(storedId);
    }
  }, []);

  const [formData, setFormData] = useState({
    basicForm: {
      applicantPhoto: null,
      applicantPhotoPreview: null,
      applicantName: "",
      gender: "",
      qualification: "",
      resume: null,
      resumePreview: null,
      mobile: "",
      email: "",
      individualPanAttachment: "",
      individualPanAttachmentPreview: "",
      individualPAN: "",
      organization: "",
      landline: "",
      website: "",
      proposalBy: "",
      panFile: null,
      panFilePreview: null,
      registrationCertificate: null,
      registrationCertificatePreview: null,
      ttdfCompany: "",
      shareHoldingPattern: null,
      shareHoldingPatternPreview: null,
      dsirCertificate: null,
      dsirCertificatePreview: null,
      addressLine1: "",
      addressLine2: "",
      streetVillage: "",
      city: "",
      country: "",
      state: "",
      pincode: "",
    },
    collaborator: {
      collaborators: [],
      shareHolders: [],
      subShareHolders: [],
      rdStaff: [],
      equipments: [],
      ttdfAppliedBefore: "",
    },
    fundDetails: {
      hasLoan: "",
      loanDescription: "",
      loanAmount: "",
      loanDocuments: [],
      bankName: "",
      bankBranch: "",
      bankAccountNumber: "",
      ifscCode: "",
      accountType: "",
    },
    financeDetails: {
      contributionRows: [],
      fundRows: [],
      grant_from_ttdf: 0,
      contribution_applicant: 0,
      expected_other_contribution: 0,
      other_source_funding: 0,
      actual_grant_from_ttdf: 0,
      actual_contribution_applicant: 0,
    },
    objectiveTimelines: {
  milestones: [],
  // CLEAN: Initialize empty milestones for user input
  milestoneData: Array(6).fill(null).map((_, index) => ({
    id: index + 1,
    scopeOfWork: "", 
    timeRequiredMonths: "",
    activities: "",
    ttdfGrantINR: 0,
    applicantContributionINR: 0,
    description: "",
    startDate: new Date().toISOString().split("T")[0],
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
  })),
},
    budgetEstimate: {
      tables: [{
        id: "table-1",
        title: "Budget Estimate of Service",
        serviceOfferings: [{
          id: "offering-1",
          name: "Enter Service Name...",
          items: [{
            id: "item-1",
            description: "",
            financials: {
              capex: {
                year0: { description: "", cost: 0, qty: 0, total: 0, grant: 0, remarks: "" },
              },
              opex: {
                year1: { description: "", cost: 0, qty: 0, total: 0, grant: 0, remarks: "" },
                year2: { description: "", cost: 0, qty: 0, total: 0, grant: 0, remarks: "" },
              },
            },
          }],
        }],
      }],
      equipmentOverhead: {
        tables: [{
          id: "table-2",
          title: "Equipment Overhead",
          serviceOfferings: [{
            id: "offering-1",
            name: "Enter Service Name...",
            items: [{
              id: "item-1",
              description: "",
              financials: {
                capex: {
                  year0: { description: "", cost: 0, qty: 0, total: 0, grant: 0, remarks: "" },
                },
                opex: {
                  year1: { description: "", cost: 0, qty: 0, total: 0, grant: 0, remarks: "" },
                  year2: { description: "", cost: 0, qty: 0, total: 0, grant: 0, remarks: "" },
                },
              },
            }],
          }],
        }],
      },
      incomeEstimate: { rows: [] },
      grantTotals: {},
      networkCore: [],
      radioAccessNetwork: [],
      fixedWirelessAccess: [],
      civilElectricalInfrastructure: [],
      centralizedServers: [],
      passiveComponents: [],
      softwareComponents: [],
      sensorNetworkCosts: {},
      installationInfrastructure: [],
      operationMaintenance: [],
      manpowerDetails: [],
      otherRequirements: [],
    },
    proposalDetails: {
      keyInformation: { proposalBrief: "", grantToTurnoverRatio: "" },
      proposalSummary: {
        proposedVillage: "",
        useCase: "",
        potentialImpact: "",
        endToEndSolution: "",
        dataSecurityMeasures: "",
        modelVillage: "",
      },
      teamMembers: [{ id: -1, name: "", resumeFile: null, resumeFilePreview: null, resumeText: "", otherDetails: "" }],
    },
    iprDetails: [{
      id: 1,
      essenceOfProposal: {
        nationalImportance: "",
        commercializationPotential: "",
        riskFactors: "",
        preliminaryWorkDone: "",
        technologyStatus: "",
        businessStrategy: "",
      },
      ipRegulatoryDetails: {
        basedOnIPR: "",
        ipOwnershipDetails: "",
        ipProposal: "",
        regulatoryApprovals: "",
        statusApprovals: "",
        proofOfStatus: null,
      },
      telecomServiceProvider: {
        name: "",
        designation: "",
        mobileNumber: "",
        email: "",
        address: "",
        supportLetter: null,
      },
    }],
    projectDetails: {
      ganttChart: null,
      ganttChartPreview: null,
      dpr: null,
      dprPreview: null,
      presentation: null,
      presentationPreview: null,
    },
    status: "draft",
  });

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (location.state?.isEditing && location.state?.submissionData?.submissionId) {
        return;
      }

      try {
        const response = await UserProfileService.getProfile();
        if (response.status === "success" && response.data) {
          const profileData = response.data;

          setFormData((prev) => ({
            ...prev,
            basicForm: {
              ...prev.basicForm,
              applicantName: profileData.full_name || "",
              gender: profileData.gender || "",
              qualification: profileData.qualification || "",
              mobile: profileData.mobile || "",
              email: profileData.email || "",
              organization: profileData.organization || "",
              proposalBy: profileData.proposal_submitted_by || "",
              landline: profileData.landline_number || "",
              website: profileData.website_link || "",
              addressLine1: profileData.address_line_1 || "",
              addressLine2: profileData.address_line_2 || "",
              streetVillage: profileData.street_village || "",
              city: profileData.city || "",
              country: profileData.country || "",
              state: profileData.state || "",
              pincode: profileData.pincode || "",
              individualPAN: profileData.individualPAN || "",
            },
          }));
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
      }
    };

    fetchUserProfile();
  }, [location.state?.isEditing, location.state?.submissionData?.submissionId]);

  useEffect(() => {
    const loadDraftData = async () => {
      const submissionData = location.state?.submissionData;

      if (submissionData && submissionData.submissionId && location.state?.isEditing) {
        try {
          setSubmissionId(submissionData.submissionId);
          localStorage.setItem("submissionId", submissionData.submissionId);

          const response = await FormSectionService.getSubmissionStatus(submissionData.submissionId);

          if (response.success && response.data) {
            const basicData = await FormSectionService.getBasicDetails(submissionData.submissionId);
            const consortiumData = await FormSectionService.getConsortiumPartners(submissionData.submissionId);
            console.log("🔍 Raw consortium API response:", consortiumData.data);
            console.log("🔍 Collaborators array:", consortiumData.data?.collaborators);
            const proposalData = await FormSectionService.getProposalDetails(submissionData.submissionId);
            
            // DEBUG: Log proposal data
            console.log("🔍 PROPOSAL DATA DEBUG:");
            console.log("  Raw API response:", proposalData);
            console.log("  proposal_brief from API:", proposalData.data?.proposal_brief);
            console.log("  Full data object:", proposalData.data);
            
            const fundData = await FormSectionService.getFundDetails(submissionData.submissionId);
            const budgetData = await FormSectionService.getBudgetEstimate(submissionData.submissionId);
            const financeData = await FormSectionService.getFinanceDetails(submissionData.submissionId);
            const timelineData = await FormSectionService.getObjectiveTimeline(submissionData.submissionId);
            const iprData = await FormSectionService.getIPRDetails(submissionData.submissionId);
            const projectData = await FormSectionService.getProjectDetails(submissionData.submissionId);

            const combinedData = {
              ...basicData.data,
              ...consortiumData.data,
              ...proposalData.data,
              ...fundData.data,
              ...budgetData.data,
              ...financeData.data,
              ...timelineData.data,
              ...iprData.data,
              ...projectData.data,
            };

            // DEBUG: Log combined data and mapping
            console.log("🔍 COMBINED DATA DEBUG:");
            console.log("  Combined proposal_brief:", combinedData.proposal_brief);
            
            const restoredFormData = mapApiResponseToFormData(combinedData);
            
            // DEBUG: Log mapped form data
            console.log("🔍 MAPPED FORM DATA DEBUG:");
            console.log("  Mapped proposalBrief:", restoredFormData.proposalDetails.keyInformation.proposalBrief);
            console.log("  Full proposalDetails:", restoredFormData.proposalDetails);
            
            setFormData(restoredFormData);

            // RESTORE COMPLETION STATE INCLUDING OPTIONAL SECTIONS
            const newCompletedSteps = new Set();
            
            // Load saved completion state from backend
            try {
              const completionResponse = await FormSectionService.getSectionCompletionStatus(submissionData.submissionId);
              if (completionResponse.success && completionResponse.data.completed_sections) {
                completionResponse.data.completed_sections.forEach(stepIndex => {
                  newCompletedSteps.add(stepIndex);
                });
              }
            } catch (error) {
              console.error("Failed to load completion status:", error);
            }
            
            // Also check validation for non-optional sections
            steps.forEach((step, index) => {
              const sectionData = getSectionData(step.name, restoredFormData);
              if (!step.isFullyOptional && step.validate(sectionData)) {
                newCompletedSteps.add(index);
              }
            });
            
            setCompletedSteps(newCompletedSteps);
            toast.success("Draft loaded successfully!");
          }
        } catch (error) {
          console.error("Error loading draft:", error);
          toast.error("Failed to load draft data");
        }
      }
    };

    loadDraftData();
  }, [location.state]);

  const handleFormDataChange = (section, data) => {
    console.log("🔍 ApplicationPage handleFormDataChange called:", { section, data });
    setFormData((prev) => ({
      ...prev,
      [section]: data,
    }));
  };

  const handleGrantTotalsChange = (totals) => {
    const isValid = Object.values(totals.grandTotal).every(
      (value) => typeof value === "number" && value > 0
    );

    setGrantTotals({
      grandTotal: formData.budgetEstimate.grantTotals,
      isValid,
    });

    const tenPercentOfCapex = totals.grandTotal.capexYear0 * 0.1;
    const totalGrantFromTtdf =
      totals.grandTotal.capexYear0 +
      totals.grandTotal.opexYear1 +
      totals.grandTotal.opexYear2;

    setFormData((prev) => ({
      ...prev,
      financeDetails: {
        ...prev.financeDetails,
        grant_from_ttdf: totalGrantFromTtdf,
        contribution_applicant: tenPercentOfCapex,
        actual_grant_from_ttdf: totalGrantFromTtdf - tenPercentOfCapex,
        actual_contribution_applicant: tenPercentOfCapex * 2,
      },
    }));
  };

  const getSectionData = (stepName, formDataOverride = null) => {
    const data = formDataOverride || formData;
    switch (stepName) {
      case "Basic Details": return data.basicForm;
      case "Consortium Partner Details": return data.collaborator;
      case "Proposal Details": return data.proposalDetails;
      case "Fund Details": return data.fundDetails;
      case "Budget Estimate": return data.budgetEstimate;
      case "Finance Details": return data.financeDetails;
      case "Objective-wise Timelines": return data.objectiveTimelines;
      case "IPR Details (if applicable)": return data.iprDetails;
      case "Project Details": return data.projectDetails;
      default: return {};
    }
  };

  const steps = [
    {
      name: "Basic Details",
      component: (
        <BasicForm
          initialFormData={formData.basicForm}
          onFormDataChange={(data) => handleFormDataChange("basicForm", data)}
        />
      ),
      canAccess: true,
      isFullyOptional: false,
      validate: (data) => {
        const requiredFields = [
          "applicantName", "gender", "qualification", "mobile", "email", "individualPAN",
          "organization", "landline", "website", "proposalBy", "ttdfCompany",
          "addressLine1", "addressLine2", "streetVillage", "city", "country", "state", "pincode",
        ];

        const textFieldsValid = requiredFields.every(
          (field) => data[field] && data[field].toString().trim() !== ""
        );

        const hasApplicantPhoto = data.applicantPhoto || data.applicantPhotoPreview;
        const hasResume = data.resume || data.resumePreview;
        const hasPanFile = data.panFile || data.panFilePreview;
        const hasRegistrationCert = data.registrationCertificate || data.registrationCertificatePreview;
        const hasShareHolding = data.shareHoldingPattern || data.shareHoldingPatternPreview;
        const hasIndividualPanAttachment = data.individualPanAttachment || data.individualPanAttachmentPreview;

        return textFieldsValid && hasApplicantPhoto && hasResume && hasPanFile && 
               hasRegistrationCert && hasShareHolding && hasIndividualPanAttachment;
      },
    },
    {
      name: "Consortium Partner Details",
      component: (
        <Collaborator
          initialFormData={formData.collaborator}
          onFormDataChange={(data) => handleFormDataChange("collaborator", data)}
        />
      ),
      canAccess: true,
      isFullyOptional: true,
      validate: (data) => {
        return true;
      },
    },
    {
      name: "Proposal Details",
      component: (
        <ProposalDetails
          initialFormData={formData.proposalDetails}
          financeDetails={formData.financeDetails}
          onFormDataChange={(data) => handleFormDataChange("proposalDetails", data)}
        />
      ),
      canAccess: true,
      isFullyOptional: false,
      validate: (data) => {
        return (
          data.keyInformation &&
          data.keyInformation.proposalBrief &&
          data.keyInformation.proposalBrief.trim() !== "" &&
          data.proposalSummary &&
          data.proposalSummary.proposedVillage &&
          data.proposalSummary.proposedVillage.trim() !== "" &&
          data.proposalSummary.useCase &&
          data.proposalSummary.useCase.trim() !== ""
        );
      },
    },
    {
      name: "Fund Details",
      component: (
        <FundDetails
          initialFormData={formData.fundDetails}
          onFormDataChange={(data) => handleFormDataChange("fundDetails", data)}
        />
      ),
      canAccess: true,
      isFullyOptional: false,
      validate: (data) => {
        if (!data.hasLoan || (data.hasLoan !== "Yes" && data.hasLoan !== "No")) {
          return false;
        }

        if (data.hasLoan === "Yes") {
          return (
            data.loanDescription &&
            data.loanDescription.trim() !== "" &&
            data.loanAmount &&
            parseFloat(data.loanAmount) > 0
          );
        }

        return true;
      },
    },
    {
      name: "Budget Estimate",
      component: (
         <BudgetEstimate
      onGrantTotalsChange={handleGrantTotalsChange}
      // FIXED: Pass the correct data structure that BudgetEstimate expects
      formData={formData.budgetEstimate}
      onFormDataChange={(data) => {
        console.log("🔍 BudgetEstimate data change received:", data);
        handleFormDataChange("budgetEstimate", data);
      }}
    />
      ),
      canAccess: true,
      isFullyOptional: false,
      validate: (data) => {
        if (!data.tables || data.tables.length === 0) return false;

        return data.tables.some(
          (table) =>
            table.serviceOfferings &&
            table.serviceOfferings.some(
              (offering) =>
                offering.items &&
                offering.items.some(
                  (item) =>
                    item.financials &&
                    ((item.financials.capex &&
                      item.financials.capex.year0 &&
                      item.financials.capex.year0.total > 0) ||
                      (item.financials.opex &&
                        ((item.financials.opex.year1 &&
                          item.financials.opex.year1.total > 0) ||
                          (item.financials.opex.year2 &&
                            item.financials.opex.year2.total > 0))))
                )
            )
        );
      },
    },
    {
      name: "Finance Details",
      component: (
        <FinanceDetails
          initialFormData={formData.financeDetails}
          onFormDataChange={(data) => handleFormDataChange("financeDetails", data)}
          onGrantTotalsChange={handleGrantTotalsChange}
          budgetEstimate={formData.budgetEstimate}
          grantTotals={formData.budgetEstimate.grantTotals}
        />
      ),
      canAccess: true,
      isFullyOptional: false,
      validate: (data) => {
        // First check if Budget Estimate is completed
        const budgetData = getSectionData("Budget Estimate");
        const isBudgetValid = budgetData.tables && budgetData.tables.length > 0 && 
          budgetData.tables.some(
            (table) =>
              table.serviceOfferings &&
              table.serviceOfferings.some(
                (offering) =>
                  offering.items &&
                  offering.items.some(
                    (item) =>
                      item.financials &&
                      ((item.financials.capex &&
                        item.financials.capex.year0 &&
                        item.financials.capex.year0.total > 0) ||
                        (item.financials.opex &&
                          ((item.financials.opex.year1 &&
                            item.financials.opex.year1.total > 0) ||
                            (item.financials.opex.year2 &&
                              item.financials.opex.year2.total > 0))))
                  )
              )
          );

        // If budget is not valid, finance details cannot be valid
        if (!isBudgetValid) {
          return false;
        }

        // Check finance details fields
        const requiredFields = [
          "grant_from_ttdf",
          "contribution_applicant",
          "expected_other_contribution",
          "other_source_funding",
          "actual_grant_from_ttdf",
          "actual_contribution_applicant",
        ];

        return requiredFields.every(
          (field) =>
            data[field] !== undefined &&
            data[field] !== null &&
            data[field] !== "" &&
            typeof data[field] === 'number'
        );
      },
    },
    {
      name: "Objective-wise Timelines",
      component: (
        <ObjectiveTimelines
          financeDetails={formData.financeDetails}
          formData={formData.objectiveTimelines}
          onFormDataChange={(data) => handleFormDataChange("objectiveTimelines", data)}
          grantTotals={formData.budgetEstimate.grantTotals}
        />
      ),
      canAccess: true,
      isFullyOptional: false,
      validate: (data) => {
        // First check if Budget Estimate is completed
        const budgetData = getSectionData("Budget Estimate");
        const isBudgetValid = budgetData.tables && budgetData.tables.length > 0 && 
          budgetData.tables.some(
            (table) =>
              table.serviceOfferings &&
              table.serviceOfferings.some(
                (offering) =>
                  offering.items &&
                  offering.items.some(
                    (item) =>
                      item.financials &&
                      ((item.financials.capex &&
                        item.financials.capex.year0 &&
                        item.financials.capex.year0.total > 0) ||
                        (item.financials.opex &&
                          ((item.financials.opex.year1 &&
                            item.financials.opex.year1.total > 0) ||
                            (item.financials.opex.year2 &&
                              item.financials.opex.year2.total > 0))))
                  )
              )
          );

        // If budget is not valid, timelines cannot be valid
        if (!isBudgetValid) {
          return false;
        }

        return (
          data.milestones &&
          data.milestones.length > 0 &&
          data.milestones.every(
            (milestone) =>
              milestone.milestoneName &&
              milestone.milestoneName.trim() !== "" &&
              milestone.startDate &&
              milestone.endDate
          )
        );
      },
    },
    {
      name: "IPR Details (if applicable)",
      component: (
        <IPRDetails
  initialFormData={formData.iprDetails}
  onFormDataChange={(data) => handleFormDataChange("iprDetails", data)}
  submissionId={submissionId}
/>
      ),
      canAccess: true,
      isFullyOptional: true,
      validate: (data) => {
        return true;
      },
    },
    {
      name: "Project Details",
      component: (
        <ProjectDetails
          initialFormData={formData.projectDetails}
          onFormDataChange={(data) => handleFormDataChange("projectDetails", data)}
        />
      ),
      canAccess: true,
      isFullyOptional: false,
      validate: (data) => {
        const hasGanttChart = data.ganttChart || data.ganttChartPreview;
        const hasDpr = data.dpr || data.dprPreview;
        const hasPresentation = data.presentation || data.presentationPreview;
        
        return hasGanttChart && hasDpr && hasPresentation;
      },
    },
  ];

  useEffect(() => {
    const newCompletedSteps = new Set(completedSteps); // Keep existing completed steps
    steps.forEach((step, index) => {
      const sectionData = getSectionData(step.name);
      // Only auto-complete non-optional sections that pass validation
      if (!step.isFullyOptional && step.validate(sectionData)) {
        newCompletedSteps.add(index);
      }
      // Remove completion status for non-optional sections that no longer pass validation
      else if (!step.isFullyOptional && !step.validate(sectionData)) {
        newCompletedSteps.delete(index);
      }
      // For fully optional sections, keep their completion status unchanged
      // (they will only be marked complete manually via handleNext)
    });
    setCompletedSteps(newCompletedSteps);
  }, [formData]);

  const handleStepClick = (index) => {
    if (steps[index].canAccess) {
      setActiveStep(index);
    } else {
      toast.error("Please complete the Budget Estimate section with valid values before proceeding");
    }
  };

  const handleSaveDraft = async () => {
  const currentStep = steps[activeStep];
  const stepName = currentStep.name;
  
  try {
    setIsSubmitting(true);
    
    // ENHANCED DEBUG LOGGING
    console.log("=== SAVE DRAFT DEBUG ===");
    console.log("Current submissionId:", submissionId);
    console.log("CallDetail object:", callDetail);
    console.log("Step being saved:", stepName);
    
    let currentSubmissionId = submissionId;
    
    // FIXED: Better validation and error handling for new submission creation
    if (!currentSubmissionId) {
      console.log("No existing submission ID, creating new submission...");
      
      // VALIDATE REQUIRED DATA
      if (!callDetail || (!callDetail.template_id && !callDetail.id)) {
        console.error("Missing required callDetail data:", callDetail);
        toast.error('Missing application configuration. Please go back and select the service again.');
        return;
      }
      
      // DETERMINE CORRECT IDs - This is the key fix!
      let templateId = callDetail.template_id;
      let serviceId = callDetail.id;
      
      // FALLBACK: Sometimes template_id might be in callDetail.id
      if (!templateId && callDetail.id) {
        templateId = callDetail.id;
        serviceId = callDetail.service_id || callDetail.id;
      }
      
      console.log("Creating submission with:", {
        templateId,
        serviceId,
        originalCallDetail: callDetail
      });
      
      try {
        const newSubmission = await FormSectionService.createNewSubmission(
          templateId,
          serviceId
        );
        
        console.log("New submission API response:", newSubmission);
        
        if (newSubmission.success && newSubmission.data?.id) {
          currentSubmissionId = newSubmission.data.id;
          setSubmissionId(currentSubmissionId);
          localStorage.setItem("submissionId", currentSubmissionId);
          
          console.log("✅ New submission created successfully:", currentSubmissionId);
          toast.success("New application created successfully!");
        } else {
          console.error("❌ Submission creation failed - invalid response:", newSubmission);
          throw new Error(newSubmission.message || "Failed to create submission - no ID returned");
        }
      } catch (createError) {
        console.error("❌ Submission creation error:", createError);
        toast.error(`Failed to create new application: ${createError.message || 'Unknown error'}`);
        return; // STOP execution if creation fails
      }
    }
    
    // VALIDATE WE HAVE A SUBMISSION ID BEFORE PROCEEDING
    if (!currentSubmissionId) {
      console.error("❌ No valid submission ID available");
      toast.error("No valid application ID available. Cannot save draft.");
      return;
    }
    
    console.log("✅ Using submission ID for saving:", currentSubmissionId);

    let response;
    const baseData = { submission_id: currentSubmissionId };
      
      switch (stepName) {
        case "Basic Details":
          const basicFiles = {
            profile_image: formData.basicForm.applicantPhoto,
            resume: formData.basicForm.resume,
            pan_file: formData.basicForm.panFile,
            organization_registration_certificate: formData.basicForm.registrationCertificate,
            share_holding_pattern: formData.basicForm.shareHoldingPattern,
            dsir_certificate: formData.basicForm.dsirCertificate,
            tan_pan_cin: formData.basicForm.individualPanAttachment,
          };
          
          response = await FormSectionService.updateBasicDetails({
            ...baseData,
            individual_pan: formData.basicForm.individualPAN,
            subject: formData.basicForm.subject || "TTDF Application", 
            description: formData.basicForm.description || "Application Description",
            full_name: formData.basicForm.applicantName,
            gender: formData.basicForm.gender,
            mobile: formData.basicForm.mobile,
            email: formData.basicForm.email,
            organization: formData.basicForm.organization,
            qualification: formData.basicForm.qualification,
            proposal_submitted_by: formData.basicForm.proposalBy,
            address_line_1: formData.basicForm.addressLine1,
            address_line_2: formData.basicForm.addressLine2,
            street_village: formData.basicForm.streetVillage,
            city: formData.basicForm.city,
            country: formData.basicForm.country,
            state: formData.basicForm.state,
            pincode: formData.basicForm.pincode,
            landline_number: formData.basicForm.landline,
            website_link: formData.basicForm.website,
            company_as_per_guidelines: formData.basicForm.ttdfCompany,
          }, basicFiles);
          break;

        case "Consortium Partner Details":
  // First save the general field
  response = await FormSectionService.updateConsortiumGeneral({
    ...baseData,
    ttdf_applied_before: formData.collaborator.ttdfAppliedBefore?.toLowerCase() || "no"
  });

  // Then save each collaborator
  if (formData.collaborator.collaborators && formData.collaborator.collaborators.length > 0) {
    for (const collaborator of formData.collaborator.collaborators) {
      if (collaborator.contactPersonName && collaborator.contactPersonName.trim() !== "") {
        const mappedCollaborator = mapFrontendToBackendValues(collaborator);
        
        const collaboratorData = {
          submission_id: currentSubmissionId,
          contact_person_name_collab: mappedCollaborator.contactPersonName,
          organization_name_collab: mappedCollaborator.organizationName || "",
          organization_type_collab: mappedCollaborator.organizationType || "",
          ttdf_company: mappedCollaborator.ttdfCompany || "",
          pan_file_name_collab: mappedCollaborator.pan || "",
          mou_file_name_collab: mappedCollaborator.mouFileName || "",
          collaborator_type: mappedCollaborator.applicantType || "principalApplicant",
        };
        
        const collaboratorFiles = {
          pan_file_collab: collaborator.panFile, 
          mou_file_collab: collaborator.mouFile
        };

        try {
          if (collaborator.id && typeof collaborator.id === 'number') {
            await FormSectionService.updateCollaborator({
              ...collaboratorData,
              collaborator_id: collaborator.id
            }, collaboratorFiles);
          } else {
            await FormSectionService.addCollaborator(collaboratorData, collaboratorFiles);
          }
        } catch (error) {
          console.error("Error saving collaborator:", error);
        }
      }
    }
  }

  // Save shareholders (rest remains the same)
  if (formData.collaborator.shareHolders && formData.collaborator.shareHolders.length > 0) {
    for (const shareholder of formData.collaborator.shareHolders) {
      if (shareholder.shareHolderName && shareholder.shareHolderName.trim() !== "") {
        const shareholderData = {
          submission_id: currentSubmissionId,
          share_holder_name: shareholder.shareHolderName,
          share_percentage: shareholder.sharePercentage,
          identity_document_name: shareholder.identityDocumentName,
        };
        
        const shareholderFiles = {
          identity_document: shareholder.identityDocument
        };

        try {
          if (shareholder.id && typeof shareholder.id === 'number') {
            await FormSectionService.updateShareHolder({
              ...shareholderData,
              shareholder_id: shareholder.id
            }, shareholderFiles);
          } else {
            await FormSectionService.addShareHolder(shareholderData, shareholderFiles);
          }
        } catch (error) {
          console.error("Error saving shareholder:", error);
        }
      }
    }
  }

  // Save R&D staff (rest remains the same)
  if (formData.collaborator.rdStaff && formData.collaborator.rdStaff.length > 0) {
    for (const staff of formData.collaborator.rdStaff) {
      if (staff.name && staff.name.trim() !== "") {
        const staffData = {
          submission_id: currentSubmissionId,
          name: staff.name,
          designation: staff.designation,
          email: staff.email,
          highest_qualification: staff.highestQualification,
          mobile: staff.mobile,
          epf_details: staff.epfDetails,
        };
        
        const staffFiles = {
          rd_staf_resume: staff.resume
        };

        try {
          if (staff.id && typeof staff.id === 'number') {
            await FormSectionService.updateRDStaff({
              ...staffData,
              staff_id: staff.id
            }, staffFiles);
          } else {
            await FormSectionService.addRDStaff(staffData, staffFiles);
          }                } catch (error) {
                    console.error("Error saving R&D staff:", error);
                }
            }
        }
    }

    // Save sub-shareholders
    if (formData.collaborator.subShareHolders && formData.collaborator.subShareHolders.length > 0) {
        for (const subShareholder of formData.collaborator.subShareHolders) {
            if (subShareholder.shareHolderName && subShareholder.shareHolderName.trim() !== "") {
                const subShareholderData = {
                    submission_id: currentSubmissionId,
                    share_holder_name: subShareholder.shareHolderName,
                    share_percentage: subShareholder.sharePercentage,
                    identity_document_name: subShareholder.identityDocumentName,
                    organization_name_subholder: subShareholder.organizationName,
                };
                
                const subShareholderFiles = {
                    identity_document: subShareholder.identityDocument
                };

                try {
                    if (subShareholder.id && typeof subShareholder.id === 'number') {
                        await FormSectionService.updateSubShareHolder({
                            ...subShareholderData,
                            sub_shareholder_id: subShareholder.id
                        }, subShareholderFiles);
                    } else {
                        await FormSectionService.addSubShareHolder(subShareholderData, subShareholderFiles);
                    }
                } catch (error) {
                    console.error("Error saving sub-shareholder:", error);
                }
            }
        }
    }

    // Save equipment
    if (formData.collaborator.equipments && formData.collaborator.equipments.length > 0) {
        for (const equipment of formData.collaborator.equipments) {
            if (equipment.item && equipment.item.trim() !== "") {
                const equipmentData = {
                    submission_id: currentSubmissionId,
                    item: equipment.item,
                    unit_price: equipment.unitPrice,
                    quantity: equipment.quantity,
                    amount: equipment.amount,
                    contributor_type: equipment.contributorType,
                };

                try {
                    if (equipment.id && typeof equipment.id === 'number') {
                        await FormSectionService.updateEquipment({
                            ...equipmentData,
                            equipment_id: equipment.id
                        });
                    } else {
                        await FormSectionService.addEquipment(equipmentData);
                    }
                } catch (error) {
                    console.error("Error saving equipment:", error);
                }
            }
        }
    }
    break;

        // REPLACE the team member save section in handleSaveDraft() - ApplicationPage.js
case "Proposal Details":
  if (formData.proposalDetails.teamMembers && formData.proposalDetails.teamMembers.length > 0) {
    for (const member of formData.proposalDetails.teamMembers) {
      if (!member.name || member.name.trim() === "") {
        continue;
      }

      const formDataObj = new FormData();
      formDataObj.append('submission_id', currentSubmissionId);
      formDataObj.append('name', member.name);
      formDataObj.append('resumetext', member.resumeText || "");
      formDataObj.append('otherdetails', member.otherDetails || "");
      
      if (member.resumeFile instanceof File) {
        formDataObj.append('resumefile', member.resumeFile);
      }

      try {
        // Simple rule: Positive ID = existing member, Negative ID = new member
        if (member.id > 0) {
          formDataObj.append('team_member_id', member.id);
          await FormSectionService.updateTeamMember(formDataObj);
        } else {
          await FormSectionService.addTeamMember(formDataObj);
        }
        
      } catch (error) {
        console.error(`Error saving team member ${member.name}:`, error);
      }
    }
  }

  response = await FormSectionService.updateProposalDetails({
    ...baseData,
    proposal_brief: formData.proposalDetails.keyInformation?.proposalBrief || "",
    grant_to_turnover_ratio: formData.proposalDetails.keyInformation?.grantToTurnoverRatio || "",
    proposed_village: formData.proposalDetails.proposalSummary?.proposedVillage || "",
    use_case: formData.proposalDetails.proposalSummary?.useCase || "",
    potential_impact: formData.proposalDetails.proposalSummary?.potentialImpact || "",
    end_to_end_solution: formData.proposalDetails.proposalSummary?.endToEndSolution || "",
    data_security_measures: formData.proposalDetails.proposalSummary?.dataSecurityMeasures || "",
    model_village: formData.proposalDetails.proposalSummary?.modelVillage || "",
  });
  
  // DEBUG: Log the save operation
  console.log("🔍 PROPOSAL SAVE DEBUG:");
  console.log("  Data being sent:", {
    submission_id: currentSubmissionId,
    proposal_brief: formData.proposalDetails.keyInformation?.proposalBrief || "",
    grant_to_turnover_ratio: formData.proposalDetails.keyInformation?.grantToTurnoverRatio || "",
    proposed_village: formData.proposalDetails.proposalSummary?.proposedVillage || "",
    use_case: formData.proposalDetails.proposalSummary?.useCase || "",
    potential_impact: formData.proposalDetails.proposalSummary?.potentialImpact || "",
    end_to_end_solution: formData.proposalDetails.proposalSummary?.endToEndSolution || "",
    data_security_measures: formData.proposalDetails.proposalSummary?.dataSecurityMeasures || "",
    model_village: formData.proposalDetails.proposalSummary?.modelVillage || "",
  });
  console.log("  FormData values:", formData.proposalDetails);
  console.log("  API Response:", response);
  break;

        case "Fund Details":
          const fundFiles = {
            fund_loan_documents: formData.fundDetails.loanDocuments?.[0]?.file || null
          };
          response = await FormSectionService.updateFundDetails({
            ...baseData,
            has_loan: formData.fundDetails.hasLoan?.toLowerCase() || "no",
            fund_loan_description: formData.fundDetails.loanDescription || "",
            fund_loan_amount: parseFloat(formData.fundDetails.loanAmount) || 0,
            bank_name: formData.fundDetails.bankName || "",
            bank_branch: formData.fundDetails.bankBranch || "",
            bank_account_number: formData.fundDetails.bankAccountNumber || "",
            ifsc_code: formData.fundDetails.ifscCode || "",
            account_type: formData.fundDetails.accountType || "",
          }, fundFiles);
          break;

        case "Budget Estimate":
        // FIXED: Properly structure the budget estimate data
        console.log("🔍 Saving Budget Estimate with data:", {
          budgetEstimate: formData.budgetEstimate,
          tables: formData.budgetEstimate?.tables,
          equipmentOverhead: formData.budgetEstimate?.equipmentOverhead,
          incomeEstimate: formData.budgetEstimate?.incomeEstimate
        });
        
        // Ensure we have the proper structure for budget estimate
        const budgetEstimateData = {
          tables: formData.budgetEstimate?.tables || []
        };
        
        const equipmentOverheadData = {
          tables: formData.budgetEstimate?.equipmentOverhead?.tables || []
        };
        
        const incomeEstimateData = {
          rows: formData.budgetEstimate?.incomeEstimate?.rows || []
        };
        
        response = await FormSectionService.updateBudgetEstimate({
          ...baseData,
          budget_estimate: budgetEstimateData,
          equipment_overhead: equipmentOverheadData,
          income_estimate: incomeEstimateData,
          manpower_details: formData.budgetEstimate?.manpowerDetails || [],
          other_requirements: formData.budgetEstimate?.otherRequirements || [],
        });
        break;


        case "Finance Details":
  console.log("🔍 Saving Finance Details - Full Data:", formData.financeDetails);
  
  response = await FormSectionService.updateFinanceDetails({
    ...baseData,
    grant_from_ttdf: formData.financeDetails.grant_from_ttdf || 0,
    contribution_applicant: formData.financeDetails.contribution_applicant || 0,
    expected_other_contribution: formData.financeDetails.expected_other_contribution || 0,
    other_source_funding: formData.financeDetails.other_source_funding || 0,
    total_project_cost: formData.financeDetails.total_project_cost || 0,
    
    // ===== CRITICAL: Save the arrays =====
    contribution_rows: formData.financeDetails.contributionRows || [],
    fund_rows: formData.financeDetails.fundRows || [],
  });
  
  console.log("🔍 Finance Details Save Response:", response);
  break;


        case "Objective-wise Timelines":
  console.log("🔍 Current milestoneData:", formData.objectiveTimelines.milestoneData);
  
  // Only save milestones that have actual user input
  const milestonesToSave = formData.objectiveTimelines.milestoneData
    ?.filter(milestone => milestone.scopeOfWork && milestone.scopeOfWork.trim() !== "")
    ?.map((milestone, index) => ({
      id: milestone.id || index + 1,
      milestoneName: milestone.scopeOfWork,
      scopeOfWork: milestone.scopeOfWork,
      activities: milestone.activities || "",
      timeRequired: milestone.timeRequiredMonths || 0,
      timeRequiredMonths: milestone.timeRequiredMonths || 0,
      grantFromTtdf: milestone.ttdfGrantINR || 0,
      ttdfGrantINR: milestone.ttdfGrantINR || 0,
      initialContriApplicant: milestone.applicantContributionINR || 0,
      applicantContributionINR: milestone.applicantContributionINR || 0,
      description: milestone.description || "",
      startDate: milestone.startDate || new Date().toISOString().split("T")[0],
      endDate: milestone.endDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    })) || [];

  console.log("🔍 Saving milestones to backend:", milestonesToSave);

  response = await FormSectionService.updateObjectiveTimeline({
    ...baseData, 
    milestones: milestonesToSave,
  });
  break;

        case "IPR Details (if applicable)":
  // Process all IPR details data
  const iprDetailsData = formData.iprDetails.map(ipr => ({
    id: ipr.id > 0 ? ipr.id : undefined,
    national_importance: ipr.essenceOfProposal?.nationalImportance || "",
    commercialization_potential: ipr.essenceOfProposal?.commercializationPotential || "",
    risk_factors: ipr.essenceOfProposal?.riskFactors || "",
    preliminary_work_done: ipr.essenceOfProposal?.preliminaryWorkDone || "",
    technology_status: ipr.essenceOfProposal?.technologyStatus || "",
    business_strategy: ipr.essenceOfProposal?.businessStrategy || "",
    based_on_ipr: ipr.ipRegulatoryDetails?.basedOnIPR || "",
    ip_ownership_details: ipr.ipRegulatoryDetails?.ipOwnershipDetails || "",
    ip_proposal: ipr.ipRegulatoryDetails?.ipProposal || "",
    regulatory_approvals: ipr.ipRegulatoryDetails?.regulatoryApprovals || "",
    status_approvals: ipr.ipRegulatoryDetails?.statusApprovals || "",
    t_name: ipr.telecomServiceProvider?.name || "",
    t_designation: ipr.telecomServiceProvider?.designation || "",
    t_mobile_number: ipr.telecomServiceProvider?.mobileNumber || "",
    t_email: ipr.telecomServiceProvider?.email || "",
    t_address: ipr.telecomServiceProvider?.address || "",
  }));

  // 🔧 CRITICAL FIX: Create FormData with proper file index detection
  const iprFormData = new FormData();
  iprFormData.append('submission_id', currentSubmissionId);
  iprFormData.append('ipr_details', JSON.stringify(iprDetailsData));
  
  console.log("🔍 Starting IPR file processing...");
  
  // Handle files with proper indexing to prevent conflicts
  formData.iprDetails.forEach((ipr, iprIndex) => {
    console.log(`🔍 Processing IPR ${iprIndex + 1}:`);
    
    // Handle proof_of_status file
    const proofFile = ipr.ipRegulatoryDetails?.proofOfStatus;
    if (proofFile instanceof File) {
      // 🔧 CRITICAL: Check if file has index information
      const actualIndex = proofFile._iprIndex !== undefined ? proofFile._iprIndex : iprIndex;
      const fileKey = actualIndex === 0 ? 'proof_of_status' : `proof_of_status_${actualIndex}`;
      
      iprFormData.append(fileKey, proofFile);
      console.log(`📎 Added proof_of_status file: ${fileKey} (${proofFile.name})`);
    } else {
      console.log(`ℹ️ No proof_of_status file for IPR ${iprIndex + 1}`);
    }
    
    // Handle t_support_letter file
    const supportFile = ipr.telecomServiceProvider?.supportLetter;
    if (supportFile instanceof File) {
      // 🔧 CRITICAL: Check if file has index information
      const actualIndex = supportFile._iprIndex !== undefined ? supportFile._iprIndex : iprIndex;
      const fileKey = actualIndex === 0 ? 't_support_letter' : `t_support_letter_${actualIndex}`;
      
      iprFormData.append(fileKey, supportFile);
      console.log(`📎 Added t_support_letter file: ${fileKey} (${supportFile.name})`);
    } else {
      console.log(`ℹ️ No t_support_letter file for IPR ${iprIndex + 1}`);
    }
  });
  
  // Debug: Log all FormData contents
  console.log("🔍 Final IPR FormData contents:");
  for (let [key, value] of iprFormData.entries()) {
    if (value instanceof File) {
      console.log(`  ${key}: File(${value.name}, ${value.size} bytes)`);
    } else {
      console.log(`  ${key}: ${value}`);
    }
  }
  
  response = await FormSectionService.updateIPRDetails(iprFormData);
  break;
        case "Project Details":
  const projectFiles = {
    // FIX: Use correct backend field names
    gantt_chart: formData.projectDetails.ganttChart,
    technical_proposal: formData.projectDetails.dpr,  // Backend expects 'technical_proposal', not 'dpr'
    proposal_presentation: formData.projectDetails.presentation,
  };
  
  response = await FormSectionService.updateProjectDetails({
    ...baseData,
    network_core: formData.budgetEstimate.networkCore || [],
    radio_access_network: formData.budgetEstimate.radioAccessNetwork || [],
    fixed_wireless_access: formData.budgetEstimate.fixedWirelessAccess || [],
    civil_electrical_infrastructure: formData.budgetEstimate.civilElectricalInfrastructure || [],
    centralised_servers_and_edge_analytics: formData.budgetEstimate.centralizedServers || [],
    passive_components: formData.budgetEstimate.passiveComponents || [],
    software_components: formData.budgetEstimate.softwareComponents || [],
    sensor_network_costs: formData.budgetEstimate.sensorNetworkCosts || {},
    installation_infrastructure_and_commissioning: formData.budgetEstimate.installationInfrastructure || [],
    operation_maintenance_and_warranty: formData.budgetEstimate.operationMaintenance || [],
    total_proposal_cost: formData.financeDetails.total_project_cost || 0,
  }, projectFiles);
  break;

        default:
          throw new Error(`Unknown step: ${stepName}`);
      }

      if (response.success) {
        toast.success(`Section "${stepName}" saved successfully!`);
        setIsDraftSaved(true);
        setTimeout(() => setIsDraftSaved(false), 2000);
      } else {
        toast.error(response.message || "Failed to save section");
      }
    } catch (error) {
      if (error.message?.includes('Authentication')) {
        toast.error("Authentication error. Please log in again and try.");
      } else if (error.message?.includes('Template ID')) {
        toast.error("Configuration error. Please go back and select the service again.");
      } else {
        toast.error(`Failed to save section: ${error.message || 'Unknown error'}`);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNext = async () => {
    if (activeStep < steps.length - 1) {
      const currentStep = steps[activeStep];

      // For fully optional sections, mark as complete when Next is clicked
      if (currentStep.isFullyOptional) {
        const newCompletedSteps = new Set(completedSteps);
        newCompletedSteps.add(activeStep);
        setCompletedSteps(newCompletedSteps);
        
        // PERSIST THE COMPLETION STATE
        try {
          if (submissionId) {
            await FormSectionService.updateSectionCompletion(
              submissionId, 
              activeStep, 
              true
            );
            toast.success(`Section "${currentStep.name}" marked as complete!`);
          }
        } catch (error) {
          console.error("Failed to save completion state:", error);
          // Still allow progression even if saving completion fails
          toast.success(`Section "${currentStep.name}" marked as complete!`);
        }
      }

      const nextStep = activeStep + 1;
      if (steps[nextStep].canAccess) {
        setActiveStep(nextStep);
      } else {
        toast.error("Please complete the Budget Estimate section with valid values before proceeding");
      }
    }
  };

  const handlePrevious = () => {
    if (activeStep > 0) {
      setActiveStep(activeStep - 1);
    }
  };

  const handleSubmitAll = async () => {
    setIsSubmitting(true);
    try {
      const allValid = steps.every((step, index) => {
        const sectionData = getSectionData(step.name);
        return step.isFullyOptional || step.validate(sectionData);
      });

      if (!allValid) {
        toast.error("Please complete all required sections with valid data before submitting");
        setIsSubmitting(false);
        return;
      }

      const response = await FormSectionService.submitForm(submissionId);
      
      if (response.success) {
        setCompletedSteps(new Set(Array.from({ length: steps.length }, (_, i) => i)));
        localStorage.removeItem("submissionId");
        setShowSuccessModal(true);
        setTimeout(() => {
          navigate("/my-application");
        }, 3000);
      } else {
        toast.error(response.message || "Failed to submit application");
      }
    } catch (error) {
      toast.error("Failed to submit application. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const completionPercentage = Math.round((completedSteps.size / steps.length) * 100);
  const isLastStep = activeStep === steps.length - 1;
  const allStepsCompleted = completedSteps.size === steps.length;

  return (
    <div className="flex h-full bg-gray-50">
      <Toaster position="top-right" reverseOrder={false} />
      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title="Application Submitted Successfully!"
        message="Your application has been submitted successfully. Go To My Applications tab to track the status of your application."
        icon={<FaCheckCircle className="text-green-500 text-5xl" />}
      />

      <motion.div
        className="min-w-70 bg-white shadow-lg flex flex-col border-r border-gray-200"
        variants={sidebarVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="bg-gray-50 p-3 border-b border-gray-200 flex-shrink-0">
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-sm font-medium text-gray-700">Progress</span>
            <span className="text-sm font-bold text-yellow-600">
              {completionPercentage}%
            </span>
          </div>
          <div className="w-full bg-gray-300 rounded-full h-2">
            <motion.div
              className="bg-yellow-500 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${completionPercentage}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
          <p className="text-xs text-gray-600 mt-1">
            {completedSteps.size} of {steps.length} sections completed
          </p>
        </div>
        <div className="flex-1 overflow-y-auto py-4">
          {steps.map((step, index) => (
            <Step
              key={index}
              number={index + 1}
              label={step.name}
              active={activeStep === index}
              completed={completedSteps.has(index)}
              onClick={() => handleStepClick(index)}
              disabled={!step.canAccess}
            />
          ))}
        </div>
      </motion.div>

      <div className="flex-1 flex flex-col min-h-0">
        <div className="bg-white shadow-sm border-b border-gray-200 p-3 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-800">
                {steps[activeStep].name}
              </h2>
              <p className="text-sm text-gray-800">
                Step {activeStep + 1} of {steps.length}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              {completedSteps.has(activeStep) && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  <IoMdCheckmark className="mr-1" />
                  Completed
                </span>
              )}
              <span className="text-sm text-gray-700">
                {completionPercentage}% Complete
              </span>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto bg-white min-h-0">
          <motion.div
            key={activeStep}
            className="h-full"
            variants={contentVariants}
            initial="hidden"
            animate="visible"
          >
            {steps[activeStep].component}
          </motion.div>
        </div>

        <div className="bg-white border-t border-gray-300 p-3 flex-shrink-0">
          <div className="flex justify-between items-center">
            <button
              onClick={handlePrevious}
              disabled={activeStep === 0}
              className="px-3 py-2 text-sm font-medium cursor-pointer text-gray-800 bg-gray-300 disabled:bg-gray-300 hover:text-gray-900 rounded-md hover:bg-gray-400 disabled:opacity-70 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            <div className="flex space-x-3">
              <button
                onClick={handleSaveDraft}
                disabled={isDraftSaved || isSubmitting}
                className="px-3 py-2 text-sm font-medium cursor-pointer text-gray-800 bg-gray-300 rounded-md hover:text-gray-900 hover:bg-gray-400 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                {isDraftSaved ? "Draft Saved" : "Save Draft"}
              </button>
              <button
                onClick={handleNext}
                disabled={isLastStep || !steps[activeStep + 1].canAccess || isSubmitting}
                className="px-3 py-2 text-sm font-medium cursor-pointer text-white bg-yellow-500 rounded-md hover:bg-yellow-600 disabled:bg-yellow-300 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
              {isLastStep && (
                <div className="relative group inline-block">
                  <button
                    onClick={handleSubmitAll}
                    disabled={!allStepsCompleted || isSubmitting}
                    className="px-3 py-2 text-sm font-medium text-white bg-green-500 rounded-md hover:bg-green-600 disabled:bg-green-300 disabled:cursor-not-allowed transition-colors"
                  >
                    {isSubmitting ? "Submitting..." : "Submit All"}
                  </button>
                  {!allStepsCompleted && (
                    <div className="absolute bottom-full left-2/2 transform -translate-x-1/1 mb-1.5 w-52 px-3.5 py-2 bg-gray-800 text-white text-sm rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-50 pointer-events-none">
                      Please Complete all Sections
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplicationPage;