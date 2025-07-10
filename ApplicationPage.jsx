import React, { useState, useEffect } from "react";
import { IoMdCheckmark, IoMdClose } from "react-icons/io";
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
import ConfigDashService from "../../api/ConfigDashService";
import SuccessModal from "../../components/SuccessModal";
import { UserProfileService } from "../../api/UserProfileService";
import ApplicantDashboardService from "../../api/ApplicantDashboardService";

const Step = ({
  number,
  label,
  active = false,
  completed = false,
  onClick,
  disabled = false,
}) => (
  <div
    className={`flex items-center w-full p-3 ${
      disabled ? "cursor-not-allowed" : "cursor-pointer"
    }`}
    onClick={!disabled ? onClick : undefined}
  >
    <div
      className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all duration-300
        ${
          completed
            ? "bg-green-500 text-white shadow-lg"
            : active
            ? "bg-yellow-400 text-gray-800 shadow-md"
            : disabled
            ? "bg-gray-100 text-gray-400"
            : "bg-gray-200 text-gray-600 hover:bg-yellow-300 hover:text-gray-800"
        }`}
    >
      {completed ? <IoMdCheckmark className="text-lg" /> : number}
    </div>
    <span
      className={`text-sm font-medium transition-all duration-300 flex-1
        ${
          completed
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
      <span className="text-xs text-gray-400 ml-2">
        (Complete previous steps)
      </span>
    )}
  </div>
);

const sidebarVariants = {
  hidden: { opacity: 0, x: -50 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.6, ease: "easeOut" },
  },
};

const contentVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};
// NEW helper function: Map API response to form data structure
const mapApiResponseToFormData = (apiData) => {
  return {
    basicForm: {
      applicantPhoto: null,
      applicantPhotoPreview: null,
      applicantName: apiData.contact_name || "",
      gender: apiData.gender || "",
      qualification: apiData.qualification || "",
      resume: null,
      resumePreview: null,
      mobile: apiData.mobile || "",
      email: apiData.contact_email || "",
      officialEmail: apiData.applicant_official_email || "",
      applicantType: apiData.applicant_type || "",
      individualPAN: apiData.individual_pan || "",
      organization: apiData.organization || "",
      proposalDuration: apiData.proposal_duration_months || "",
      landline: apiData.landline_number || "",
      companyMobile: apiData.company_mobile_no || "",
      website: apiData.website_link || "",
      proposalBy: apiData.proposal_submitted_by || "",
      panFile: null,
      panFilePreview: null,
      registrationCertificate: null,
      registrationCertificatePreview: null,
      ttdfCompany: apiData.ttdf_company || "",
      shareHoldingPattern: null,
      shareHoldingPatternPreview: null,
      dsirCertificate: null,
      dsirCertificatePreview: null,
      addressLine1: apiData.address_line_1 || "",
      addressLine2: apiData.address_line_2 || "",
      streetVillage: apiData.street_village || "",
      city: apiData.city || "",
      country: apiData.country || "",
      state: apiData.state || "",
      pincode: apiData.pincode || "",
    },
    collaborator: {
      collaborators: apiData.collaborators || [],
      shareHolders: apiData.shareholders || [],
      subShareHolders: apiData.sub_shareholders || [],
      rdStaff: apiData.rdstaff || [],
      equipments: apiData.equipments || [],
      mouFile: null,
      rdStaffResume: null,
    },
    // ✅ FIX: Fund Details mapping - convert lowercase back to title case
    fundDetails: {
      hasLoan: apiData.has_loan === "yes" ? "Yes" : 
               apiData.has_loan === "no" ? "No" : 
               apiData.has_loan || "",
      loanDescription: apiData.fund_loan_description || "",
      loanAmount: apiData.fund_loan_amount || "",
      loanDocuments: apiData.fund_loan_documents || [],
    },
    financeDetails: {
      contributionRows: [],
      fundRows: [],
      grant_from_ttdf: apiData.grant_from_ttdf || 0,
      contribution_applicant: apiData.contribution_applicant || 0,
      expected_other_contribution: apiData.expected_other_contribution || 0,
      other_source_funding: apiData.other_source_funding || 0,
      actual_grant_from_ttdf: apiData.actual_grant_from_ttdf || 0,
      actual_contribution_applicant: apiData.actual_contribution_applicant || 0,
    },
    objectiveTimelines: {
      milestones: apiData.milestones || [],
    },
    budgetEstimate: {
      // Parse JSON fields
      tables: safeJsonParse(apiData.budget_estimate, []),
      equipmentOverhead: { tables: [] },
      incomeEstimate: safeJsonParse(apiData.income_estimate, { rows: [] }),
      grantTotals: {},
      networkCore: safeJsonParse(apiData.network_core, []),
      radioAccessNetwork: safeJsonParse(apiData.radio_access_network, []),
      fixedWirelessAccess: safeJsonParse(apiData.fixed_wireless_access, []),
      civilElectricalInfrastructure: safeJsonParse(apiData.civil_electrical_infrastructure, []),
      centralizedServers: safeJsonParse(apiData.centralised_servers_and_edge_analytics, []),
      passiveComponents: safeJsonParse(apiData.passive_components, []),
      softwareComponents: safeJsonParse(apiData.software_components, []),
      sensorNetworkCosts: safeJsonParse(apiData.sensor_network_costs, {}),
      installationInfrastructure: safeJsonParse(apiData.installation_infrastructure_and_commissioning, []),
      operationMaintenance: safeJsonParse(apiData.operation_maintenance_and_warranty, []),
      manpowerDetails: safeJsonParse(apiData.manpower_details, []),
      otherRequirements: safeJsonParse(apiData.other_requirements, []),
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
      teamMembers: apiData.team ? [{ id: 1, name: apiData.team, resumeFile: null, resumeText: "", otherDetails: "" }] : [],
    },
    iprDetails: apiData.iprdetails && apiData.iprdetails.length > 0 ? apiData.iprdetails.map((ipr, index) => ({
      id: index + 1,
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
      },
      telecomServiceProvider: {
        name: ipr.t_name || "",
        designation: ipr.t_designation || "",
        mobileNumber: ipr.t_mobile_number || "",
        email: ipr.t_email || "",
        address: ipr.t_address || "",
        supportLetter: null,
      },
    })) : [
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
        },
        telecomServiceProvider: {
          name: "",
          designation: "",
          mobileNumber: "",
          email: "",
          address: "",
          supportLetter: null,
        },
      },
    ],
    projectDetails: {
      ganttChart: null,
      dpr: null,
      presentation: null,
    },
    status: apiData.status || "draft",
  };
};

// Helper function for safe JSON parsing
const safeJsonParse = (jsonString, defaultValue) => {
  try {
    return jsonString ? JSON.parse(jsonString) : defaultValue;
  } catch (error) {
    console.warn("JSON parse error:", error);
    return defaultValue;
  }
};

const ApplicationPage = () => {
  const location = useLocation();
  const callDetail = location.state.callData || {};
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState(new Set());
  const [isDraftSaved, setIsDraftSaved] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionId, setSubmissionId] = useState(null);
  const [grantTotals, setGrantTotals] = useState({
    grandTotal: {
      capexYear0: 0,
      opexYear1: 0,
      opexYear2: 0,
    },
    isValid: false,
  });

  // Load submissionId from localStorage on component mount
  useEffect(() => {
    const storedId = localStorage.getItem("submissionId");
    if (storedId) {
      setSubmissionId(storedId);
      console.log("Loaded submissionId from storage:", storedId);
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
      officialEmail: "",
      applicantType: "",
      individualPAN: "",
      organization: "",
      proposalDuration: "",
      landline: "",
      companyMobile: "",
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
      mouFile: null,
      rdStaffResume: null,
    },
    fundDetails: {
      hasLoan: "",
      loanDescription: "",
      loanAmount: "",
      loanDocuments: [],
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
    },
    budgetEstimate: {
      tables: [
        {
          id: "table-1",
          title: "Budget Estimate of Service",
          serviceOfferings: [
            {
              id: "offering-1",
              name: "Enter Service Name...",
              items: [
                {
                  id: "item-1",
                  description: "",
                  financials: {
                    capex: {
                      year0: {
                        description: "",
                        cost: 0,
                        qty: 0,
                        total: 0,
                        grant: 0,
                        remarks: "",
                      },
                    },
                    opex: {
                      year1: {
                        description: "",
                        cost: 0,
                        qty: 0,
                        total: 0,
                        grant: 0,
                        remarks: "",
                      },
                      year2: {
                        description: "",
                        cost: 0,
                        qty: 0,
                        total: 0,
                        grant: 0,
                        remarks: "",
                      },
                    },
                  },
                },
              ],
            },
          ],
        },
      ],
      equipmentOverhead: {
        tables: [
          {
            id: "table-2",
            title: "Equipment Overhead",
            serviceOfferings: [
              {
                id: "offering-1",
                name: "Enter Service Name...",
                items: [
                  {
                    id: "item-1",
                    description: "",
                    financials: {
                      capex: {
                        year0: {
                          description: "",
                          cost: 0,
                          qty: 0,
                          total: 0,
                          grant: 0,
                          remarks: "",
                        },
                      },
                      opex: {
                        year1: {
                          description: "",
                          cost: 0,
                          qty: 0,
                          total: 0,
                          grant: 0,
                          remarks: "",
                        },
                        year2: {
                          description: "",
                          cost: 0,
                          qty: 0,
                          total: 0,
                          grant: 0,
                          remarks: "",
                        },
                      },
                    },
                  },
                ],
              },
            ],
          },
        ],
      },
      incomeEstimate: {
        rows: [],
      },
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
      keyInformation: {
        proposalBrief: "",
        // contributionPercentage: "",
        grantToTurnoverRatio: "",
      },
      proposalSummary: {
        proposedVillage: "",
        useCase: "",
        // proposalAbstract: "",
        potentialImpact: "",
        endToEndSolution: "",
        dataSecurityMeasures: "",
        // requiredSupportDetails: "",
        modelVillage: "",
      },
      teamMembers: [
        {
          id: 1,
          name: "",
          resumeFile: null,
          resumeText: "",
          otherDetails: "",
        },
      ],
    },
    iprDetails: [
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
        },
        telecomServiceProvider: {
          name: "",
          designation: "",
          mobileNumber: "",
          email: "",
          address: "",
          supportLetter: null,
        },
      },
    ],
    projectDetails: {
      ganttChart: null,
      dpr: null,
      presentation: null,
    },
    status: "draft",
  });

  // Fetch user profile data and map to form
  // Fetch user profile data and map to form (only if NOT loading a draft)
useEffect(() => {
  const fetchUserProfile = async () => {
    // Don't load profile data if we're editing a draft
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
            officialEmail: profileData.applicant_official_email || "",
            organization: profileData.organization || "",
            proposalBy: profileData.proposal_submitted_by || "",
            landline: profileData.landline_number || "",
            companyMobile: profileData.company_mobile_no || "",
            website: profileData.website_link || "",
            addressLine1: profileData.address_line_1 || "",
            addressLine2: profileData.address_line_2 || "",
            streetVillage: profileData.street_village || "",
            city: profileData.city || "",
            country: profileData.country || "",
            state: profileData.state || "",
            pincode: profileData.pincode || "",
          },
        }));
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
    }
  };

  fetchUserProfile();
}, [location.state?.isEditing, location.state?.submissionData?.submissionId]);

  // NEW useEffect: Arjun
  useEffect(() => {
  const loadDraftData = async () => {
    const submissionData = location.state?.submissionData;
    
    if (submissionData && submissionData.submissionId && location.state?.isEditing) {
      try {
        setSubmissionId(submissionData.submissionId);
        localStorage.setItem("submissionId", submissionData.submissionId);
        
        const response = await ApplicantDashboardService.getDraftBySubmissionId(submissionData.submissionId);
        
        if (response.success && response.data) {
          const draftData = response.data;
          const restoredFormData = mapApiResponseToFormData(draftData);
          setFormData(restoredFormData);
          
          // ✅ ADD THIS LINE - Auto-validate all sections on load
          const newCompletedSteps = new Set();
steps.forEach((step, index) => {
  const sectionKey = step.name === "Basic Details" ? "basicForm" :
                    step.name === "Fund Details" ? "fundDetails" :
                    step.name === "Consortium Partner Details" ? "collaborator" :
                    step.name === "Budget Estimate" ? "budgetEstimate" :
                    step.name === "Finance Details" ? "financeDetails" :
                    step.name === "Objective-wise Timelines" ? "objectiveTimelines" :
                    step.name === "Proposal Details" ? "proposalDetails" :
                    step.name === "IPR Details (if applicable)" ? "iprDetails" :
                    step.name === "Project Details" ? "projectDetails" : null;
  
  if (sectionKey) {
    // ✅ Only auto-validate non-optional sections
    if (!step.isFullyOptional && step.validate(restoredFormData[sectionKey])) {
      newCompletedSteps.add(index);
    }
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

    // Update financeDetails with calculated values when budget changes
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

  const validateFinanceDetails = (financeData) => {
    const tenPercentOfCapex = grantTotals.grandTotal.capexYear0 * 0.1;
    const totalGrantFromTtdf =
      grantTotals.grandTotal.capexYear0 +
      grantTotals.grandTotal.opexYear1 +
      grantTotals.grandTotal.opexYear2;

    // Validation 1: Check if any required field is missing or zero
    const requiredFields = [
      "grant_from_ttdf",
      "contribution_applicant",
      "expected_other_contribution",
      "other_source_funding",
      "actual_grant_from_ttdf",
      "actual_contribution_applicant",
    ];

    const isAnyFieldMissing = requiredFields.some(
      (field) => !financeData[field] && financeData[field] !== 0
    );

    if (isAnyFieldMissing) {
      toast.error("Please complete all fields in Finance Details section");
      return false;
    }

    // Validation 2: Check if grant_from_ttdf matches calculated value
    if (financeData.grant_from_ttdf !== totalGrantFromTtdf) {
      toast.error(
        `Grant from TTDF must be ₹${totalGrantFromTtdf.toLocaleString()} as calculated from budget`
      );
      return false;
    }

    // Validation 3: Check if contribution_applicant meets minimum requirement
    if (financeData.contribution_applicant < tenPercentOfCapex) {
      toast.error(
        `Contribution by applicant must be at least ₹${tenPercentOfCapex.toLocaleString()} (10% of CAPEX)`
      );
      return false;
    }

    return true;
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
    isFullyOptional: false, // Has mandatory fields
    validate: (data) => {
      const requiredFields = [
        'applicantName', 'gender', 'qualification', 'mobile', 
        'email', 'officialEmail', 'individualPAN', 'organization',
        'proposalDuration', 'landline', 'companyMobile', 'website',
        'proposalBy', 'ttdfCompany', 'addressLine1', 'addressLine2',
        'streetVillage', 'city', 'country', 'state', 'pincode'
      ];
      
      return requiredFields.every(field => 
        data[field] && data[field].toString().trim() !== ""
      ) && data.applicantPhoto && data.resume && data.panFile && 
      data.registrationCertificate && data.shareHoldingPattern;
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
    isFullyOptional: true, // ✅ This section has no mandatory fields
    validate: (data) => {
      // For fully optional sections, always return true in validation
      return true;
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
    isFullyOptional: false, // Has mandatory field (hasLoan selection)
    validate: (data) => {
      if (!data.hasLoan || (data.hasLoan !== "Yes" && data.hasLoan !== "No")) {
        return false;
      }
      
      if (data.hasLoan === "Yes") {
        return data.loanDescription && data.loanDescription.trim() !== "" &&
               data.loanAmount && parseFloat(data.loanAmount) > 0;
      }
      
      return true;
    },
  },
  {
    name: "Budget Estimate",
    component: (
      <BudgetEstimate
        onGrantTotalsChange={handleGrantTotalsChange}
        formData={formData.budgetEstimate}
        onFormDataChange={(data) => handleFormDataChange("budgetEstimate", data)}
      />
    ),
    canAccess: true,
    isFullyOptional: false, // Has mandatory budget data
    validate: (data) => {
      if (!data.tables || data.tables.length === 0) return false;
      
      return data.tables.some(table => 
        table.serviceOfferings && table.serviceOfferings.some(offering =>
          offering.items && offering.items.some(item =>
            item.financials && (
              (item.financials.capex && item.financials.capex.year0 && item.financials.capex.year0.total > 0) ||
              (item.financials.opex && (
                (item.financials.opex.year1 && item.financials.opex.year1.total > 0) ||
                (item.financials.opex.year2 && item.financials.opex.year2.total > 0)
              ))
            )
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
        grantTotals={formData.budgetEstimate.grantTotals}
      />
    ),
    canAccess: true,
    isFullyOptional: false, // Has mandatory fields
    validate: (data) => {
      const requiredFields = [
        'grant_from_ttdf', 'contribution_applicant', 'expected_other_contribution',
        'other_source_funding', 'actual_grant_from_ttdf', 'actual_contribution_applicant'
      ];
      
      return requiredFields.every(field => 
        data[field] !== undefined && data[field] !== null && data[field] !== ""
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
      />
    ),
    canAccess: true,
    isFullyOptional: false, // Has mandatory milestone data
    validate: (data) => {
      return data.milestones && data.milestones.length > 0 &&
             data.milestones.every(milestone => 
               milestone.milestone_name && milestone.milestone_name.trim() !== "" &&
               milestone.start_date && milestone.end_date
             );
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
    isFullyOptional: false, // Has mandatory fields
    validate: (data) => {
      return data.keyInformation && data.keyInformation.proposalBrief &&
             data.keyInformation.proposalBrief.trim() !== "" &&
             data.proposalSummary && data.proposalSummary.proposedVillage &&
             data.proposalSummary.proposedVillage.trim() !== "" &&
             data.proposalSummary.useCase && data.proposalSummary.useCase.trim() !== "";
    },
  },
  {
    name: "IPR Details (if applicable)",
    component: (
      <IPRDetails
        initialFormData={formData.iprDetails}
        onFormDataChange={(data) => handleFormDataChange("iprDetails", data)}
      />
    ),
    canAccess: true,
    isFullyOptional: true, // ✅ This section is fully optional
    validate: (data) => {
      // For fully optional sections, always return true in validation
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
      return data.ganttChart && data.dpr && data.presentation;
    },
  },
];

  const prepareFormDataForApi = (status) => {
  const apiFormData = {
    template: callDetail.template_id,
    service: callDetail.id,
    status: status,
    contact_name: formData.basicForm.applicantName,
    contact_email: formData.basicForm.email,
    applicant_official_email: formData.basicForm.officialEmail,
    individual_pan: formData.basicForm.individualPAN,
    applicant_type: formData.basicForm.applicantType,
    qualification: formData.basicForm.qualification,
    mobile: formData.basicForm.mobile,
    landline_number: formData.basicForm.landline,
    company_mobile_no: formData.basicForm.companyMobile,
    website_link: formData.basicForm.website,
    proposal_submitted_by: formData.basicForm.proposalBy,
    address_line_1: formData.basicForm.addressLine1,
    address_line_2: formData.basicForm.addressLine2,
    street_village: formData.basicForm.streetVillage,
    city: formData.basicForm.city,
    country: formData.basicForm.country,
    state: formData.basicForm.state,
    pincode: formData.basicForm.pincode,
    gender: formData.basicForm.gender,
    dob: formData.basicForm.dob,
    applicant_aadhar: formData.basicForm.aadharNumber,
    applicant_passport: formData.basicForm.passportNumber,
    is_organization_domestic: formData.basicForm.isDomestic,
    tan_pan_cin: formData.basicForm.tanPanCin,
    proposal_duration_months: formData.basicForm.proposalDuration,
    company_as_per_guidelines: formData.basicForm.companyAsPerGuidelines,
    is_applied_before: formData.basicForm.ttdfAppliedBefore,
    application_submission_date: new Date().toISOString().split("T")[0],

    // Finance Details
    ...formData.financeDetails,
    total_project_cost:
      formData.financeDetails.actual_grant_from_ttdf +
      formData.financeDetails.actual_contribution_applicant +
      formData.financeDetails.expected_other_contribution,

    // ✅ FIX: Fund Details - Convert to lowercase for Django model
    has_loan: formData.fundDetails.hasLoan ? formData.fundDetails.hasLoan.toLowerCase() : "",
    fund_loan_description: formData.fundDetails.loanDescription,
    fund_loan_amount: parseFloat(formData.fundDetails.loanAmount) || 0,

    // Proposal Details
    proposal_brief: formData.proposalDetails.keyInformation?.proposalBrief || "",
    grant_to_turnover_ratio: formData.proposalDetails.keyInformation?.grantToTurnoverRatio || "",
    proposed_village: formData.proposalDetails.proposalSummary?.proposedVillage || "",
    use_case: formData.proposalDetails.proposalSummary?.useCase || "",
    potential_impact: formData.proposalDetails.proposalSummary?.potentialImpact || "",
    end_to_end_solution: formData.proposalDetails.proposalSummary?.endToEndSolution || "",
    data_security_measures: formData.proposalDetails.proposalSummary?.dataSecurityMeasures || "",
    model_village: formData.proposalDetails.proposalSummary?.modelVillage || "",
    team: formData.proposalDetails.teamMembers?.map((m) => m.name).join(", ") || "",

    // IPR Details
    ...(formData.iprDetails[0]?.essenceOfProposal || {}),
    ...(formData.iprDetails[0]?.ipRegulatoryDetails || {}),
    tsp_name: formData.iprDetails[0]?.telecomServiceProvider?.name || "",
    tsp_designation: formData.iprDetails[0]?.telecomServiceProvider?.designation || "",
    tsp_mobile_number: formData.iprDetails[0]?.telecomServiceProvider?.mobileNumber || "",
    tsp_email: formData.iprDetails[0]?.telecomServiceProvider?.email || "",
    tsp_address: formData.iprDetails[0]?.telecomServiceProvider?.address || "",

    // Budget and Financials
    income_estimate: JSON.stringify(formData.budgetEstimate.incomeEstimate),
    budget_estimate: JSON.stringify(formData.budgetEstimate.tables),
    network_core: JSON.stringify(formData.budgetEstimate.networkCore),
    radio_access_network: JSON.stringify(formData.budgetEstimate.radioAccessNetwork),
    fixed_wireless_access: JSON.stringify(formData.budgetEstimate.fixedWirelessAccess),
    civil_electrical_infrastructure: JSON.stringify(formData.budgetEstimate.civilElectricalInfrastructure),
    centralised_servers_and_edge_analytics: JSON.stringify(formData.budgetEstimate.centralizedServers),
    passive_components: JSON.stringify(formData.budgetEstimate.passiveComponents),
    software_components: JSON.stringify(formData.budgetEstimate.softwareComponents),
    sensor_network_costs: JSON.stringify(formData.budgetEstimate.sensorNetworkCosts),
    installation_infrastructure_and_commissioning: JSON.stringify(formData.budgetEstimate.installationInfrastructure),
    operation_maintenance_and_warranty: JSON.stringify(formData.budgetEstimate.operationMaintenance),
    manpower_details: JSON.stringify(formData.budgetEstimate.manpowerDetails),
    other_requirements: JSON.stringify(formData.budgetEstimate.otherRequirements),

    // Collaborators and Shareholders
    collaborators: JSON.stringify(formData.collaborator.collaborators),
    shareholders: JSON.stringify(formData.collaborator.shareHolders),
    sub_shareholders: JSON.stringify(formData.collaborator.subShareHolders),
    rdstaff: JSON.stringify(formData.collaborator.rdStaff),
    equipments: JSON.stringify(formData.collaborator.equipments),
    milestones: JSON.stringify(formData.objectiveTimelines.milestones),
  };

  // ✅ COMPLETE FILES DATA SECTION
  const filesData = {
    // Basic Form Files
    profile_image: formData.basicForm.applicantPhoto,
    pan_file: formData.basicForm.panFile,
    passport_file: formData.basicForm.passportFile,
    resume: formData.basicForm.resume,
    organization_registration_certificate: formData.basicForm.registrationCertificate,
    share_holding_pattern: formData.basicForm.shareHoldingPattern,
    dsir_certificate: formData.basicForm.dsirCertificate,
    
    // ✅ FIX: Fund Details Files - handle loan documents properly
    fund_loan_documents: formData.fundDetails.loanDocuments.length > 0 
      ? formData.fundDetails.loanDocuments[0].file  
      : null,
    
    // IPR Details Files
    tsp_support_letter: formData.iprDetails[0]?.telecomServiceProvider?.supportLetter,
    
    // Project Details Files
    gantt_chart: formData.projectDetails.ganttChart,
    technical_proposal: formData.projectDetails.dpr,
    proposal_presentation: formData.projectDetails.presentation,
    
    // Collaborator Files
    collaborator_mou: formData.collaborator.mouFile,
    rd_staff_resume: formData.collaborator.rdStaffResume,
  };

  return { apiFormData, filesData };
};

  const handleStepClick = (index) => {
    if (steps[index].canAccess) {
      setActiveStep(index);
    } else {
      toast.error(
        "Please complete the Budget Estimate section with valid values before proceeding"
      );
    }
  };

  const handleSaveDraft = async () => {
    const currentStep = steps[activeStep];
    const sectionData = currentStep.name === "Basic Details" ? formData.basicForm :
                    currentStep.name === "Consortium Partner Details" ? formData.collaborator :
                    currentStep.name === "Fund Details" ? formData.fundDetails :
                    currentStep.name === "Budget Estimate" ? formData.budgetEstimate :
                    currentStep.name === "Finance Details" ? formData.financeDetails :
                    currentStep.name === "Objective-wise Timelines" ? formData.objectiveTimelines :
                    currentStep.name === "Proposal Details" ? formData.proposalDetails :
                    currentStep.name === "IPR Details (if applicable)" ? formData.iprDetails :
                    currentStep.name === "Project Details" ? formData.projectDetails : {};
    console.log("Saving draft for section:", sectionData);
    // // Special validation for Finance Details
    // if (activeStep === 5) { // Finance Details is step 4
    //   const isValid = validateFinanceDetails(sectionData);
    //   if (!isValid) {
    //     return; // Don't proceed if validation fails
    //   }
    // }

    const isSectionValid = currentStep.validate(sectionData);

    if (isSectionValid) {
      setCompletedSteps((prev) => {
        const newSet = new Set(prev);
        newSet.add(activeStep);
        return newSet;
      });
      toast.success(`Section "${currentStep.name}" marked as complete!`);
    }

    try {
      setIsSubmitting(true);
      const { apiFormData, filesData } = prepareFormDataForApi("draft");

      let response;
      if (submissionId) {
        // If we have a submissionId, use PATCH to update
        response = await ConfigDashService.updateApplicationFormSubmission(
          submissionId,
          apiFormData,
          filesData
        );
      } else {
        // No submissionId, use POST to create new
        response = await ConfigDashService.ApplicationFormSubmission(
          apiFormData,
          filesData
        );
        console.log("Response from API:", response);
        // Store the new submissionId if successful
        if (response.success && response.id) {
          localStorage.setItem("submissionId", response.id);
          setSubmissionId(response.id);
        }
      }

      if (response.success) {
        toast.success(
          submissionId
            ? "Draft updated successfully!"
            : "Draft saved successfully!"
        );
        setIsDraftSaved(true);
        setTimeout(() => setIsDraftSaved(false), 2000);
      } else {
        toast.error(response.message || "Failed to save draft");
      }
    } catch (error) {
      console.error("Error saving draft:", error);
      toast.error("Failed to save draft. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNext = () => {
  if (activeStep < steps.length - 1) {
    const currentStep = steps[activeStep];
    
    // ✅ For fully optional sections, mark as complete when Next is clicked
    if (currentStep.isFullyOptional) {
      setCompletedSteps((prev) => {
        const newSet = new Set(prev);
        newSet.add(activeStep);
        return newSet;
      });
      toast.success(`Section "${currentStep.name}" marked as complete!`);
    }
    
    const nextStep = activeStep + 1;
    if (steps[nextStep].canAccess) {
      setActiveStep(nextStep);
    } else {
      toast.error(
        "Please complete the Budget Estimate section with valid values before proceeding"
      );
    }
  }
};

  const handlePrevious = () => {
    if (activeStep > 0) {
      setActiveStep(activeStep - 1);
    }
  };

  const handleFinalSubmit = () => {
    const currentStep = steps[activeStep];
    const sectionKey = currentStep.name.toLowerCase().replace(" ", "");
    const sectionData = formData[sectionKey];

    if (currentStep.validate(sectionData)) {
      setCompletedSteps((prev) => new Set([...prev, activeStep]));
      setFormData((prev) => ({ ...prev, status: "submitted" }));
      toast.success(`Section "${currentStep.name}" marked as complete!`);
    } else {
      toast.error(`Please complete all required fields in ${currentStep.name}`);
    }
  };

  const handleSubmitAll = async () => {
    setIsSubmitting(true);
    try {
      const allValid = steps.every((step, index) => {
        const sectionKey = step.name.toLowerCase().replace(" ", "");
        return step.validate(formData[sectionKey]);
      });

      if (!allValid) {
        toast.error(
          "Please complete all sections with valid data before submitting"
        );
        setIsSubmitting(false);
        return;
      }

      setCompletedSteps(
        new Set(Array.from({ length: steps.length }, (_, i) => i))
      );

      const { apiFormData, filesData } = prepareFormDataForApi("submitted");

      let response;
      if (submissionId) {
        // Update existing submission
        response = await ConfigDashService.updateApplicationFormSubmission(
          submissionId,
          apiFormData,
          filesData
        );
      } else {
        // Create new submission
        response = await ConfigDashService.ApplicationFormSubmission(
          apiFormData,
          filesData
        );

        if (response.success && response.id) {
          localStorage.setItem("submissionId", response.id);
          setSubmissionId(response.id);
        }
      }

      if (response.success) {
        // Clear the submissionId from localStorage after successful final submission
        localStorage.removeItem("submissionId");
        setShowSuccessModal(true);
        setTimeout(() => {
          navigate("/my-application");
        }, 3000);
      } else {
        toast.error(response.message || "Failed to submit application");
      }
    } catch (error) {
      console.error("Submission error:", error);
      toast.error("Failed to submit application. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
    // Remove submissionId before navigating
    localStorage.removeItem("submissionId");
  };

  const completionPercentage = Math.round(
    (completedSteps.size / steps.length) * 100
  );

  const isLastStep = activeStep === steps.length - 1;
  const allStepsCompleted = completedSteps.size === steps.length;

  return (
    <div className="flex h-full bg-gray-50">
      <Toaster position="top-right" reverseOrder={false} />
      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title="Application Submitted Successfully!"
        message="Your application has been submitted successfully. Go To My Application Tab to track the status of your application."
        icon={<FaCheckCircle className="text-green-500 text-5xl" />}
      />

      <motion.div
        className="min-w-70 bg-white shadow-lg flex flex-col border-r border-gray-200"
        variants={sidebarVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="bg-gray-50 p-4 border-b border-gray-200 flex-shrink-0">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">Progress</span>
            <span className="text-sm font-bold text-yellow-600">
              {completionPercentage}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <motion.div
              className="bg-yellow-500 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${completionPercentage}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">
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
        <div className="bg-white shadow-sm border-b border-gray-200 p-4 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-800">
                {steps[activeStep].name}
              </h2>
              <p className="text-sm text-gray-600">
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
              <span className="text-sm text-gray-500">
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
        <div className="bg-white border-t border-gray-200 p-4 flex-shrink-0">
          <div className="flex justify-between items-center">
            <button
              onClick={handlePrevious}
              disabled={activeStep === 0}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            <div className="flex space-x-3">
              <button
                onClick={handleSaveDraft}
                disabled={isDraftSaved || isSubmitting}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-400 rounded-md hover:bg-gray-500 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                {isDraftSaved ? "Draft Saved" : "Save Draft"}
              </button>
              <button
                onClick={handleNext}
                disabled={
                  isLastStep || !steps[activeStep + 1].canAccess || isSubmitting
                }
                className="px-4 py-2 text-sm font-medium text-white bg-yellow-500 rounded-md hover:bg-yellow-600 disabled:bg-yellow-300 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
              {isLastStep && (
                <div className="relative group">
                  <button
                    onClick={handleSubmitAll}
                    disabled={!allStepsCompleted || isSubmitting}
                    className="px-4 py-2 text-sm font-medium text-white bg-green-500 rounded-md hover:bg-green-600 disabled:bg-green-300 disabled:cursor-not-allowed transition-colors"
                  >
                    {isSubmitting ? "Submitting..." : "Submit All"}
                  </button>
                  {!allStepsCompleted && (
                    <div className="absolute hidden group-hover:block bottom-full mb-2 w-64 px-3 py-2 bg-gray-800 text-white text-sm rounded-md shadow-lg">
                      Please complete all sections before submitting the
                      application
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
