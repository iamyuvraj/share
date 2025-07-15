// import { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import { List, Archive, Home, FileText, Bell, User, Check, AlertCircle, Clock, Award, Trash2 } from "lucide-react";
// import { motion, AnimatePresence } from "framer-motion";
// import CallListComponent from "../../components/UserDashboard/CallListComponent";
// import StatsAndUpdatesComponent from "../../components/UserDashboard/StatsAndUpdatesComponent";
// import ApplicantDashboardService from "../../api/ApplicantDashboardService";

// const ApplicantDashboard = () => {
//   const navigate = useNavigate();
//   const [activeTab, setActiveTab] = useState("current");
//   const [dashboardData, setDashboardData] = useState(null);
//   const [callsData, setCallsData] = useState({ current: [], previous: [] });
//   const [draftApplications, setDraftApplications] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     loadDashboardData();
//     loadCallsData();
//     loadDraftApplications();
//   }, []);

//   const loadDashboardData = async () => {
//     try {
//       setLoading(true);
//       setError(null);

//       const response = await ApplicantDashboardService.getDashboardOverview();

//       if (response.status === 'success') {
//         const transformedData = ApplicantDashboardService.transformDashboardData(response);
//         setDashboardData(transformedData);
//       } else {
//         setError(response.message || 'Failed to load dashboard data');
//         setDashboardData(null);
//       }
//     } catch (err) {
//       setError('Unable to connect to server');
//       setDashboardData(null);
//       console.error('Dashboard error:', err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const loadCallsData = async () => {
//     try {
//       const response = await ApplicantDashboardService.getCalls();

//       if (response.status === 'success') {
//         setCallsData(response.data);
//       } else {
//         setCallsData({ current: [], previous: [] });
//       }
//     } catch (err) {
//       setCallsData({ current: [], previous: [] });
//     }
//   };

//   const loadDraftApplications = async () => {
//     try {
//       const response = await ApplicantDashboardService.getDynamicFormSubmissions();

//       if (response.success) {
//         // Filter only draft submissions
//         const drafts = response.data.filter(submission => submission.status === "draft");
//         console.log('Drafts loaded:', drafts);
//         setDraftApplications(drafts);
//       } else {
//         setDraftApplications([]);
//       }
//     } catch (err) {
//       setDraftApplications([]);
//       console.error('Error loading draft applications:', err);
//     }
//   };

//   const handleMarkAsRead = async (activityId) => {
//     try {
//       const response = await ApplicantDashboardService.markActivityAsRead(activityId);

//       if (response.status === 'success') {
//         setDashboardData(prevData => ({
//           ...prevData,
//           recent_activities: prevData.recent_activities.map(activity =>
//             activity.id === activityId ? { ...activity, is_read: true } : activity
//           )
//         }));
//       }
//     } catch (err) {
//       console.error('Error marking activity as read:', err);
//     }
//   };

//   const handleRefreshStats = async () => {
//     try {
//       await ApplicantDashboardService.refreshDashboardStats();
//       await loadDashboardData();
//       await loadDraftApplications();
//     } catch (err) {
//       console.error('Error refreshing stats:', err);
//     }
//   };

//   const handleDeleteDraft = async (formId) => {
//     try {
//       const response = await ApplicantDashboardService.deleteDraftForm(formId);

//       if (response.status === 'success') {
//         setDraftApplications(prev => prev.filter(draft => draft.form_id !== formId));
//       }
//     } catch (err) {
//       console.error('Error deleting draft:', err);
//     }
//   };

//   const handleCompleteForm = (draft) => {
//     console.log("Completing draft:::::", draft);
//     navigate('/application-form', {
//       state: {
//         callData: {
//           id: draft.call_id,
//           template_id: draft.id || draft.templateId,
//           title: draft.service_name || draft.call_title || 'Untitled Call',
//           description: draft.description || '',
//           start_date: draft.create_date || '',
//           end_date: draft.call_end_date || '',
//           status: draft.call_status || 'Active',
//           ...draft.call_data // Spread any additional call data if available
//         },
//         submissionData: {
//           formData: draft.form_data || {},
//           completedSteps: draft.completed_steps || [],
//           status: draft.status,
//           lastSaved: draft.updated_at,
//           formId: draft.form_id
//         },
//         isEditing: true
//       }
//     });
//   };

//   const getActivityIcon = (activityType) => {
//     const iconMap = {
//       'proposal_submitted': <FileText size={16} />,
//       'proposal_approved': <Check size={16} />,
//       'proposal_rejected': <AlertCircle size={16} />,
//       'evaluation_started': <Clock size={16} />,
//       'technical_review': <User size={16} />,
//       'call_published': <Bell size={16} />,
//       'interview_scheduled': <Award size={16} />,
//       'documents_requested': <FileText size={16} />,
//       'system_update': <Bell size={16} />,
//       'default': <Bell size={16} />
//     };
//     return iconMap[activityType] || iconMap.default;
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-gray-50 flex items-center justify-center">
//         <motion.div
//           animate={{ rotate: 360 }}
//           transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
//           className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"
//         />
//       </div>
//     );
//   }

//   if (error && !dashboardData) {
//     return (
//       <div className="min-h-screen bg-gray-50 flex items-center justify-center">
//         <div className="text-center">
//           <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
//           <h2 className="text-xl font-semibold text-gray-800 mb-2">Error Loading Dashboard</h2>
//           <p className="text-gray-600 mb-4">{error}</p>
//           <button
//             onClick={loadDashboardData}
//             className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
//           >
//             Retry
//           </button>
//         </div>
//       </div>
//     );
//   }

//   if (!dashboardData) {
//     return (
//       <div className="min-h-screen bg-gray-50 flex items-center justify-center">
//         <div className="text-center">
//           <h2 className="text-xl font-semibold text-gray-800 mb-2">No Data Available</h2>
//           <p className="text-gray-600 mb-4">Unable to load dashboard data</p>
//           <button
//             onClick={loadDashboardData}
//             className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
//           >
//             Retry
//           </button>
//         </div>
//       </div>
//     );
//   }

//   const {
//     stats = {},
//     recent_activities = [],
//     current_calls = [],
//     recent_proposals = []
//   } = dashboardData;

//   const statsData = {
//     total: stats.total_proposals || 0,
//     approved: stats.approved_proposals || 0,
//     underEvaluation: stats.under_evaluation || 0,
//     notShortlisted: stats.not_shortlisted || 0
//   };

//   const draftData = draftApplications.map(draft => ({
//     callTitle: draft.call_title || 'Untitled Call',
//     formId: draft.form_id || '',
//     progress: draft.progress || 0,
//     lastSaved: draft.updated_at || '',
//     callId: draft.call_id || '',
//     formData: draft.form_data || {}
//   }));

//   const updatesData = recent_activities.map(activity => ({
//     type: activity.activity_type || 'system_update',
//     icon: getActivityIcon(activity.activity_type),
//     title: activity.title || '',
//     description: activity.description || '',
//     date: activity.time_ago || '',
//     isRead: activity.is_read || false,
//     id: activity.id
//   }));

//   const currentCalls = callsData.current.length > 0
//     ? callsData.current
//     : current_calls.filter(call => call.status === "Active");

//   const previousCalls = callsData.previous.length > 0
//     ? callsData.previous
//     : current_calls.filter(call => call.status !== "Active");

//   return (
//     <div className="min-h-screen bg-gray-50">
//       <main className="container mx-auto max-w-7xl p-4 md:p-6">
//         <motion.div
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0 }}
//           className="mb-8"
//         >
//           <h2 className="text-2xl font-bold text-navy-800">Welcome Back!</h2>
//           <p className="text-gray-600">Track your applications and explore new opportunities</p>

//           {error && (
//             <div className="mt-2 p-2 bg-yellow-100 border border-yellow-400 rounded text-sm text-yellow-800">
//               {error}
//             </div>
//           )}
//         </motion.div>

//         <motion.div
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ delay: 0.1 }}
//           className="mb-8"
//         >
//           <StatsAndUpdatesComponent
//             stats={statsData}
//             drafts={draftApplications}
//             updates={updatesData}
//             onMarkAsRead={handleMarkAsRead}
//             onRefreshStats={handleRefreshStats}
//             onCompleteForm={handleCompleteForm}
//             onDeleteDraft={handleDeleteDraft}
//           />
//         </motion.div>

//         <motion.div
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ delay: 0.2 }}
//           className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200"
//         >
//           <div className="p-6">
//             <div className="flex justify-between items-center mb-6">
//               <h2 className="text-xl font-bold text-navy-800">Available Calls</h2>
//               <div className="flex border border-gray-300 rounded-lg overflow-hidden">
//                 <button
//                   className={`px-4 py-2 font-medium transition-colors ${
//                     activeTab === "current"
//                       ? "bg-yellow-500 text-white"
//                       : "bg-white text-gray-700 hover:bg-gray-50"
//                   }`}
//                   onClick={() => setActiveTab("current")}
//                 >
//                   Current Calls
//                   {currentCalls.length > 0 && (
//                     <span className="ml-2 bg-white text-gray-800 text-xs px-2 py-1 rounded-full">
//                       {currentCalls.length}
//                     </span>
//                   )}
//                 </button>
//                 <button
//                   className={`px-4 py-2 font-medium transition-colors ${
//                     activeTab === "previous"
//                       ? "bg-yellow-500 text-white"
//                       : "bg-white text-gray-700 hover:bg-gray-50"
//                   }`}
//                   onClick={() => setActiveTab("previous")}
//                 >
//                   Previous Calls
//                   {previousCalls.length > 0 && (
//                     <span className="ml-2 bg-white text-gray-800 text-xs px-2 py-1 rounded-full">
//                       {previousCalls.length}
//                     </span>
//                   )}
//                 </button>
//               </div>
//             </div>

//             <AnimatePresence mode="wait">
//               <motion.div
//                 key={activeTab}
//                 initial={{ opacity: 0, x: 20 }}
//                 animate={{ opacity: 1, x: 0 }}
//                 exit={{ opacity: 0, x: -20 }}
//                 transition={{ duration: 0.3 }}
//               >
//                 {activeTab === "current" ? (
//                   <CallListComponent calls={currentCalls} isCurrent={true} />
//                 ) : (
//                   <CallListComponent calls={previousCalls} isCurrent={false} />
//                 )}

//                 {/* Show message if no calls available */}
//                 {((activeTab === "current" && currentCalls.length === 0) ||
//                   (activeTab === "previous" && previousCalls.length === 0)) && (
//                   <div className="text-center py-8">
//                     <p className="text-gray-500">
//                       {activeTab === "current" ? "No current calls available" : "No previous calls available"}
//                     </p>
//                   </div>
//                 )}
//               </motion.div>
//             </AnimatePresence>
//           </div>
//         </motion.div>
//       </main>
//     </div>
//   );
// };

// export default ApplicantDashboard;

// new code from Arjun Sir

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  List,
  Archive,
  Home,
  FileText,
  Bell,
  User,
  Check,
  AlertCircle,
  Clock,
  Award,
  Trash2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import CallListComponent from "../../components/UserDashboard/CallListComponent";
import StatsAndUpdatesComponent from "../../components/UserDashboard/StatsAndUpdatesComponent";
import ApplicantDashboardService from "../../api/ApplicantDashboardService";

const ApplicantDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("current");
  const [dashboardData, setDashboardData] = useState(null);
  const [callsData, setCallsData] = useState({ current: [], previous: [] });
  const [draftApplications, setDraftApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
  loadDashboardData();
  loadCallsData();
  loadDraftApplications();
  
  // Listen for new draft creation
  const handleDraftCreated = () => {
    loadDraftApplications();
  };
  
  window.addEventListener('draftCreated', handleDraftCreated);
  
  return () => {
    window.removeEventListener('draftCreated', handleDraftCreated);
  };
}, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await ApplicantDashboardService.getDashboardOverview();

      if (response.status === "success") {
        const transformedData =
          ApplicantDashboardService.transformDashboardData(response);
        setDashboardData(transformedData);
      } else {
        setError(response.message || "Failed to load dashboard data");
        setDashboardData(null);
      }
    } catch (err) {
      setError("Unable to connect to server");
      setDashboardData(null);
      console.error("Dashboard error:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadCallsData = async () => {
    try {
      const response = await ApplicantDashboardService.getCalls();

      if (response.status === "success") {
        setCallsData(response.data);
      } else {
        setCallsData({ current: [], previous: [] });
      }
    } catch (err) {
      setCallsData({ current: [], previous: [] });
    }
  };

  const loadDraftApplications = async () => {
    try {
      const response =
        await ApplicantDashboardService.getDynamicFormSubmissions();

      if (response.success) {
        // Filter only draft submissions
        const drafts = response.data.filter(
          (submission) => submission.status === "draft"
        );
        console.log("Drafts loaded:", drafts);
        setDraftApplications(drafts);
      } else {
        setDraftApplications([]);
      }
    } catch (err) {
      setDraftApplications([]);
      console.error("Error loading draft applications:", err);
    }
  };

  const handleMarkAsRead = async (activityId) => {
    try {
      const response = await ApplicantDashboardService.markActivityAsRead(
        activityId
      );

      if (response.status === "success") {
        setDashboardData((prevData) => ({
          ...prevData,
          recent_activities: prevData.recent_activities.map((activity) =>
            activity.id === activityId
              ? { ...activity, is_read: true }
              : activity
          ),
        }));
      }
    } catch (err) {
      console.error("Error marking activity as read:", err);
    }
  };

  const handleRefreshStats = async () => {
    try {
      await ApplicantDashboardService.refreshDashboardStats();
      await loadDashboardData();
      await loadDraftApplications();
    } catch (err) {
      console.error("Error refreshing stats:", err);
    }
  };

  // code by Arjun Singh
  const handleDeleteDraft = async (draftId) => {
    try {
      const response = await ApplicantDashboardService.deleteDraftForm(draftId);

      if (response.success) {
        setDraftApplications((prev) =>
          prev.filter((draft) => draft.id !== draftId)
        );
        toast.success("Draft deleted successfully");
      } else {
        toast.error("Failed to delete draft");
      }
    } catch (err) {
      console.error("Error deleting draft:", err);
      toast.error("Error deleting draft");
    }
  };

  //code added by Arjun Singh
  const handleCompleteForm = (draft) => {
    console.log("Completing draft:::::", draft);
    navigate("/application-form", {
      state: {
        callData: {
          id: draft.service || draft.call_id,
          template_id: draft.template || draft.templateId,
          title: draft.service_name || draft.call_title || "Untitled Call",
          description: draft.description || "",
          start_date: draft.create_date || "",
          end_date: draft.call_end_date || "",
          status: draft.call_status || "Active",
          ...draft.call_data,
        },
        submissionData: {
          submissionId: draft.id, // Pass the submission ID
          formData: draft, // Pass the entire draft data
          completedSteps: draft.completed_steps || [],
          status: draft.status,
          lastSaved: draft.updated_at,
          formId: draft.form_id,
        },
        isEditing: true,
      },
    });
  };

  const getActivityIcon = (activityType) => {
    const iconMap = {
      proposal_submitted: <FileText size={16} />,
      proposal_approved: <Check size={16} />,
      proposal_rejected: <AlertCircle size={16} />,
      evaluation_started: <Clock size={16} />,
      technical_review: <User size={16} />,
      call_published: <Bell size={16} />,
      interview_scheduled: <Award size={16} />,
      documents_requested: <FileText size={16} />,
      system_update: <Bell size={16} />,
      default: <Bell size={16} />,
    };
    return iconMap[activityType] || iconMap.default;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (error && !dashboardData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Error Loading Dashboard
          </h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={loadDashboardData}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            No Data Available
          </h2>
          <p className="text-gray-600 mb-4">Unable to load dashboard data</p>
          <button
            onClick={loadDashboardData}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const {
    stats = {},
    recent_activities = [],
    current_calls = [],
    recent_proposals = [],
  } = dashboardData;

  const statsData = {
    total: stats.total_proposals || 0,
    approved: stats.approved_proposals || 0,
    underEvaluation: stats.under_evaluation || 0,
    notShortlisted: stats.not_shortlisted || 0,
  };

  const draftData = draftApplications.map((draft) => ({
    callTitle: draft.call_title || "Untitled Call",
    formId: draft.form_id || "",
    progress: draft.progress || 0,
    lastSaved: draft.updated_at || "",
    callId: draft.call_id || "",
    formData: draft.form_data || {},
  }));

  const updatesData = recent_activities.map((activity) => ({
    type: activity.activity_type || "system_update",
    icon: getActivityIcon(activity.activity_type),
    title: activity.title || "",
    description: activity.description || "",
    date: activity.time_ago || "",
    isRead: activity.is_read || false,
    id: activity.id,
  }));

  const currentCalls =
    callsData.current.length > 0
      ? callsData.current
      : current_calls.filter((call) => call.status === "Active");

  const previousCalls =
    callsData.previous.length > 0
      ? callsData.previous
      : current_calls.filter((call) => call.status !== "Active");

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="container mx-auto max-w-7xl p-4 md:p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h2 className="text-2xl font-bold text-navy-800">Welcome Back!</h2>
          <p className="text-gray-600">
            Track your applications and explore new opportunities
          </p>

          {error && (
            <div className="mt-2 p-2 bg-yellow-100 border border-yellow-400 rounded text-sm text-yellow-800">
              {error}
            </div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <StatsAndUpdatesComponent
            stats={statsData}
            drafts={draftApplications}
            updates={updatesData}
            onMarkAsRead={handleMarkAsRead}
            onRefreshStats={handleRefreshStats}
            onCompleteForm={handleCompleteForm}
            onDeleteDraft={handleDeleteDraft}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200"
        >
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-navy-800">
                Available Calls
              </h2>
              <div className="flex border border-gray-300 rounded-lg overflow-hidden">
                <button
                  className={`px-4 py-2 font-medium transition-colors ${
                    activeTab === "current"
                      ? "bg-yellow-500 text-white"
                      : "bg-white text-gray-700 hover:bg-gray-50"
                  }`}
                  onClick={() => setActiveTab("current")}
                >
                  Current Calls
                  {currentCalls.length > 0 && (
                    <span className="ml-2 bg-white text-gray-800 text-xs px-2 py-1 rounded-full">
                      {currentCalls.length}
                    </span>
                  )}
                </button>
                <button
                  className={`px-4 py-2 font-medium transition-colors ${
                    activeTab === "previous"
                      ? "bg-yellow-500 text-white"
                      : "bg-white text-gray-700 hover:bg-gray-50"
                  }`}
                  onClick={() => setActiveTab("previous")}
                >
                  Previous Calls
                  {previousCalls.length > 0 && (
                    <span className="ml-2 bg-white text-gray-800 text-xs px-2 py-1 rounded-full">
                      {previousCalls.length}
                    </span>
                  )}
                </button>
              </div>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                {activeTab === "current" ? (
                  <CallListComponent calls={currentCalls} isCurrent={true} />
                ) : (
                  <CallListComponent calls={previousCalls} isCurrent={false} />
                )}

                {/* Show message if no calls available */}
                {((activeTab === "current" && currentCalls.length === 0) ||
                  (activeTab === "previous" && previousCalls.length === 0)) && (
                  <div className="text-center py-8">
                    <p className="text-gray-500">
                      {activeTab === "current"
                        ? "No current calls available"
                        : "No previous calls available"}
                    </p>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default ApplicantDashboard;
