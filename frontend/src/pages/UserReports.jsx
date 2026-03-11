import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FileText,
  Plus,
  Clock,
  MapPin,
  Droplets,
  CheckCircle,
  XCircle,
  AlertCircle,
  Upload,
  Camera,
  Send,
  ArrowLeft,
  Filter,
  Eye,
  X,
  AlertTriangle,
} from "lucide-react";

const UserReports = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("my-reports");
  const [reports, setReports] = useState([]);
  const [allReports, setAllReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    location: "",
    description: "",
    water_source: "river",
  });
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  useEffect(() => {
    const role = localStorage.getItem("userRole") || "citizen";
    setUserRole(role);
    fetchReports();
    if (role === "admin" || role === "ngo" || role === "authority") {
      fetchAllReports();
    }
  }, []);

  const fetchReports = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://127.0.0.1:5000/api/reports", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setReports(data);
      }
    } catch (error) {
      console.error("Error fetching reports:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllReports = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://127.0.0.1:5000/api/reports/all", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setAllReports(data);
      }
    } catch (error) {
      console.error("Error fetching all reports:", error);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhoto(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const token = localStorage.getItem("token");

      // First create the report
      const response = await fetch("http://127.0.0.1:5000/api/reports", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const newReport = await response.json();

        // Upload photo if present
        if (photo) {
          const formDataPhoto = new FormData();
          formDataPhoto.append("file", photo);

          await fetch(
            `http://127.0.0.1:5000/api/reports/${newReport.id}/upload-photo`,
            {
              method: "POST",
              headers: { Authorization: `Bearer ${token}` },
              body: formDataPhoto,
            }
          );
        }

        setSubmitSuccess(true);
        setFormData({ location: "", description: "", water_source: "river" });
        setPhoto(null);
        setPhotoPreview(null);
        fetchReports();

        setTimeout(() => {
          setSubmitSuccess(false);
          setActiveTab("my-reports");
        }, 2000);
      }
    } catch (error) {
      console.error("Error submitting report:", error);
      alert("Failed to submit report. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusUpdate = async (reportId, newStatus) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://127.0.0.1:5000/api/reports/${reportId}/status?status=${newStatus}`,
        {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.ok) {
        fetchAllReports();
        fetchReports();
      }
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "pending":
        return (
          <span className="flex items-center gap-1 px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-medium">
            <Clock className="w-3 h-3" />
            Pending
          </span>
        );
      case "verified":
        return (
          <span className="flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
            <CheckCircle className="w-3 h-3" />
            Verified
          </span>
        );
      case "rejected":
        return (
          <span className="flex items-center gap-1 px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">
            <XCircle className="w-3 h-3" />
            Rejected
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
            {status}
          </span>
        );
    }
  };

  const getWaterSourceIcon = (source) => {
    switch (source?.toLowerCase()) {
      case "river":
      case "lake":
        return <Droplets className="w-4 h-4" />;
      case "well":
      case "borewell":
        return <MapPin className="w-4 h-4" />;
      default:
        return <Droplets className="w-4 h-4" />;
    }
  };

  const openReportModal = (report) => {
    setSelectedReport(report);
    setShowModal(true);
  };

  const displayedReports =
    userRole === "admin" || userRole === "ngo" || userRole === "authority"
      ? activeTab === "all-reports"
        ? allReports
        : reports
      : reports;

  return (
    <div className="min-h-screen flex bg-sky-50">
      {/* Sidebar */}
      <div className="w-64 bg-sky-600 text-white flex flex-col p-6 shadow-xl">
        <h2 className="text-2xl font-bold mb-8 italic flex items-center gap-2">
          <Droplets className="w-6 h-6" />
          WQM
        </h2>
        <ul className="space-y-2 flex-1">
          <li
            onClick={() => navigate("/dashboard")}
            className="hover:bg-sky-500 p-3 rounded-lg cursor-pointer transition-colors flex items-center gap-2"
          >
            <FileText className="w-4 h-4" />
            Dashboard
          </li>
          <li
            onClick={() => navigate("/map")}
            className="hover:bg-sky-500 p-3 rounded-lg cursor-pointer transition-colors flex items-center gap-2"
          >
            <MapPin className="w-4 h-4" />
            Live Map View
          </li>
          <li
            onClick={() => navigate("/alerts")}
            className="hover:bg-sky-500 p-3 rounded-lg cursor-pointer transition-colors flex items-center gap-2"
          >
            <AlertTriangle className="w-4 h-4" />
            System Alerts
          </li>
          <li
            onClick={() => navigate("/search")}
            className="hover:bg-sky-500 p-3 rounded-lg cursor-pointer transition-colors flex items-center gap-2"
          >
            <Clock className="w-4 h-4" />
            Search
          </li>
          <li className="bg-white text-sky-600 p-3 rounded-lg cursor-pointer font-bold shadow-md flex items-center gap-2">
            <FileText className="w-4 h-4" />
            My Reports
          </li>
          <li
            onClick={() => navigate("/profile")}
            className="hover:bg-sky-500 p-3 rounded-lg cursor-pointer transition-colors flex items-center gap-2"
          >
            <CheckCircle className="w-4 h-4" />
            Profile
          </li>
        </ul>
        <button
          onClick={() => {
            localStorage.clear();
            navigate("/");
          }}
          className="mt-auto bg-white text-sky-600 hover:bg-sky-50 py-2.5 rounded-lg font-bold transition-all shadow-lg"
        >
          Logout
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8 overflow-y-auto">
        <header className="mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/dashboard")}
              className="p-2 hover:bg-white rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-sky-900">Water Quality Reports</h1>
              <p className="text-sky-600 mt-1">
                Submit and track water quality reports
              </p>
            </div>
          </div>
        </header>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab("my-reports")}
            className={`px-6 py-2.5 rounded-lg font-medium transition-colors flex items-center gap-2 ${
              activeTab === "my-reports"
                ? "bg-sky-600 text-white"
                : "bg-white text-gray-600 hover:bg-gray-50"
            }`}
          >
            <FileText className="w-4 h-4" />
            My Reports ({reports.length})
          </button>
          <button
            onClick={() => setActiveTab("submit-report")}
            className={`px-6 py-2.5 rounded-lg font-medium transition-colors flex items-center gap-2 ${
              activeTab === "submit-report"
                ? "bg-sky-600 text-white"
                : "bg-white text-gray-600 hover:bg-gray-50"
            }`}
          >
            <Plus className="w-4 h-4" />
            Submit Report
          </button>
          {(userRole === "admin" || userRole === "ngo" || userRole === "authority") && (
            <button
              onClick={() => setActiveTab("all-reports")}
              className={`px-6 py-2.5 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                activeTab === "all-reports"
                  ? "bg-sky-600 text-white"
                  : "bg-white text-gray-600 hover:bg-gray-50"
              }`}
            >
              <Filter className="w-4 h-4" />
              All Reports ({allReports.length})
            </button>
          )}
        </div>

        {/* My Reports / All Reports Tab */}
        {(activeTab === "my-reports" || activeTab === "all-reports") && (
          <div className="bg-white rounded-2xl shadow-sm border border-sky-100 overflow-hidden">
            {loading ? (
              <div className="p-12 text-center text-gray-400">
                Loading reports...
              </div>
            ) : displayedReports.length === 0 ? (
              <div className="p-12 text-center">
                <AlertCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-800">No reports yet</h3>
                <p className="text-gray-500 mt-1">
                  {activeTab === "my-reports"
                    ? "You haven't submitted any reports yet."
                    : "No reports in the system yet."}
                </p>
                <button
                  onClick={() => setActiveTab("submit-report")}
                  className="mt-4 bg-sky-600 text-white px-6 py-2 rounded-lg hover:bg-sky-700 transition-colors"
                >
                  Submit Your First Report
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-sky-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold text-sky-700 uppercase tracking-wider">
                        ID
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-sky-700 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-sky-700 uppercase tracking-wider">
                        Location
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-sky-700 uppercase tracking-wider">
                        Water Source
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-sky-700 uppercase tracking-wider">
                        Status
                      </th>
                      {activeTab === "all-reports" && (
                        <th className="px-6 py-4 text-left text-xs font-bold text-sky-700 uppercase tracking-wider">
                          Submitted By
                        </th>
                      )}
                      <th className="px-6 py-4 text-left text-xs font-bold text-sky-700 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {displayedReports.map((report) => (
                      <tr key={report.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm text-gray-500">
                          #{report.id}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {new Date(report.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-800">
                          {report.location}
                        </td>
                        <td className="px-6 py-4">
                          <span className="flex items-center gap-1 text-sm text-gray-600">
                            {getWaterSourceIcon(report.water_source)}
                            {report.water_source}
                          </span>
                        </td>
                        <td className="px-6 py-4">{getStatusBadge(report.status)}</td>
                        {activeTab === "all-reports" && (
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {report.user?.name || "Unknown"}
                          </td>
                        )}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => openReportModal(report)}
                              className="p-2 text-sky-600 hover:bg-sky-50 rounded-lg transition-colors"
                              title="View Details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            {(userRole === "admin" ||
                              userRole === "ngo" ||
                              userRole === "authority") &&
                              report.status === "pending" && (
                                <>
                                  <button
                                    onClick={() =>
                                      handleStatusUpdate(report.id, "verified")
                                    }
                                    className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                    title="Verify"
                                  >
                                    <CheckCircle className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() =>
                                      handleStatusUpdate(report.id, "rejected")
                                    }
                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                    title="Reject"
                                  >
                                    <XCircle className="w-4 h-4" />
                                  </button>
                                </>
                              )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Submit Report Tab */}
        {activeTab === "submit-report" && (
          <div className="max-w-2xl">
            <div className="bg-white rounded-2xl shadow-sm border border-sky-100 p-8">
              <h2 className="text-xl font-bold text-gray-800 mb-6">
                Submit New Report
              </h2>

              {submitSuccess && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-green-700">
                    Report submitted successfully!
                  </span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Location */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location *
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      name="location"
                      required
                      value={formData.location}
                      onChange={handleInputChange}
                      placeholder="Enter the location of water source"
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-sky-400 outline-none"
                    />
                  </div>
                </div>

                {/* Water Source Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Water Source Type *
                  </label>
                  <div className="relative">
                    <Droplets className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <select
                      name="water_source"
                      required
                      value={formData.water_source}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-sky-400 outline-none bg-white"
                    >
                      <option value="river">River</option>
                      <option value="lake">Lake</option>
                      <option value="well">Well</option>
                      <option value="borewell">Borewell</option>
                      <option value="tap">Tap Water</option>
                      <option value="pond">Pond</option>
                      <option value="stream">Stream</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description *
                  </label>
                  <textarea
                    name="description"
                    required
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Describe the water quality issue or observation..."
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-sky-400 outline-none resize-none"
                  />
                </div>

                {/* Photo Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Photo (Optional)
                  </label>
                  <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center hover:border-sky-400 transition-colors">
                    {photoPreview ? (
                      <div className="relative inline-block">
                        <img
                          src={photoPreview}
                          alt="Preview"
                          className="max-h-48 rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setPhoto(null);
                            setPhotoPreview(null);
                          }}
                          className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <label className="cursor-pointer block">
                        <Camera className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <span className="text-gray-500">
                          Click to upload a photo
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handlePhotoChange}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-sky-600 text-white py-3 rounded-lg font-semibold hover:bg-sky-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {submitting ? (
                    "Submitting..."
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Submit Report
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>

      {/* Report Detail Modal */}
      {showModal && selectedReport && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-800">
                  Report #{selectedReport.id}
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Status</span>
                  {getStatusBadge(selectedReport.status)}
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Submitted On</span>
                  <span className="font-medium">
                    {new Date(selectedReport.created_at).toLocaleString()}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Location</span>
                  <span className="font-medium">{selectedReport.location}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Water Source</span>
                  <span className="flex items-center gap-1 font-medium capitalize">
                    {getWaterSourceIcon(selectedReport.water_source)}
                    {selectedReport.water_source}
                  </span>
                </div>

                {selectedReport.user && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Submitted By</span>
                    <span className="font-medium">{selectedReport.user.name}</span>
                  </div>
                )}

                <div>
                  <span className="text-gray-500 block mb-2">Description</span>
                  <p className="text-gray-800 bg-gray-50 p-4 rounded-lg">
                    {selectedReport.description}
                  </p>
                </div>

                {selectedReport.photo_url && (
                  <div>
                    <span className="text-gray-500 block mb-2">Photo</span>
                    <img
                      src={selectedReport.photo_url}
                      alt="Report"
                      className="w-full rounded-lg"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserReports;




// import { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import {
//   FileText,
//   Plus,
//   Clock,
//   MapPin,
//   Droplets,
//   CheckCircle,
//   XCircle,
//   AlertCircle,
//   Camera,
//   Send,
//   ArrowLeft,
//   Filter,
//   Eye,
//   X,
//   Navigation,
//   ChevronDown,
// } from "lucide-react";

// const UserReports = () => {
//   const navigate = useNavigate();
//   const [activeTab, setActiveTab] = useState("my-reports");
//   const [reports, setReports] = useState([]);
//   const [allReports, setAllReports] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [userRole, setUserRole] = useState("");
//   const [showModal, setShowModal] = useState(false);
//   const [selectedReport, setSelectedReport] = useState(null);
//   const [showMapPicker, setShowMapPicker] = useState(false);

//   // Role-based permissions according to UI Behavior matrix
//   const canViewAllReports = ["ngo", "authority", "admin"].includes(userRole);
//   const canUpdateReportStatus = ["authority", "admin"].includes(userRole);

//   // Form state - updated to match reference image
//   const [formData, setFormData] = useState({
//     subject: "",
//     location: "",
//     latitude: "",
//     longitude: "",
//     description: "",
//     water_source: "",
//   });
//   const [photo, setPhoto] = useState(null);
//   const [photoPreview, setPhotoPreview] = useState(null);
//   const [submitting, setSubmitting] = useState(false);
//   const [submitSuccess, setSubmitSuccess] = useState(false);
//   const [detectingLocation, setDetectingLocation] = useState(false);

//   useEffect(() => {
//     const role = localStorage.getItem("userRole") || "citizen";
//     setUserRole(role);
//     fetchReports();
//     if (role === "admin" || role === "ngo" || role === "authority") {
//       fetchAllReports();
//     }
//   }, []);

//   const fetchReports = async () => {
//     try {
//       const token = localStorage.getItem("token");
//       const response = await fetch("http://127.0.0.1:5000/api/reports", {
//         headers: { Authorization: `Bearer ${token}` },
//       });

//       if (response.ok) {
//         const data = await response.json();
//         setReports(data);
//       }
//     } catch (error) {
//       console.error("Error fetching reports:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const fetchAllReports = async () => {
//     try {
//       const token = localStorage.getItem("token");
//       const response = await fetch("http://127.0.0.1:5000/api/reports/all", {
//         headers: { Authorization: `Bearer ${token}` },
//       });

//       if (response.ok) {
//         const data = await response.json();
//         setAllReports(data);
//       }
//     } catch (error) {
//       console.error("Error fetching all reports:", error);
//     }
//   };

//   const detectCurrentLocation = () => {
//     setDetectingLocation(true);
//     if (navigator.geolocation) {
//       navigator.geolocation.getCurrentPosition(
//         (position) => {
//           setFormData({
//             ...formData,
//             latitude: position.coords.latitude.toFixed(6),
//             longitude: position.coords.longitude.toFixed(6),
//           });
//           setDetectingLocation(false);
//         },
//         (error) => {
//           console.error("Error getting location:", error);
//           setDetectingLocation(false);
//           alert("Could not detect location. Please enter manually.");
//         }
//       );
//     } else {
//       setDetectingLocation(false);
//       alert("Geolocation is not supported by this browser.");
//     }
//   };

//   const handleInputChange = (e) => {
//     setFormData({ ...formData, [e.target.name]: e.target.value });
//   };

//   const handlePhotoChange = (e) => {
//     const file = e.target.files[0];
//     if (file) {
//       setPhoto(file);
//       setPhotoPreview(URL.createObjectURL(file));
//     }
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setSubmitting(true);

//     try {
//       const token = localStorage.getItem("token");

//       const response = await fetch("http://127.0.0.1:5000/api/reports", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${token}`,
//         },
//         body: JSON.stringify(formData),
//       });

//       if (response.ok) {
//         const newReport = await response.json();

//         if (photo) {
//           const formDataPhoto = new FormData();
//           formDataPhoto.append("file", photo);

//           await fetch(
//             `http://127.0.0.1:5000/api/reports/${newReport.id}/upload-photo`,
//             {
//               method: "POST",
//               headers: { Authorization: `Bearer ${token}` },
//               body: formDataPhoto,
//             }
//           );
//         }

//         setSubmitSuccess(true);
//         setFormData({
//           subject: "",
//           location: "",
//           latitude: "",
//           longitude: "",
//           description: "",
//           water_source: "",
//         });
//         setPhoto(null);
//         setPhotoPreview(null);
//         fetchReports();

//         setTimeout(() => {
//           setSubmitSuccess(false);
//           setActiveTab("my-reports");
//         }, 2000);
//       }
//     } catch (error) {
//       console.error("Error submitting report:", error);
//       alert("Failed to submit report. Please try again.");
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   const handleStatusUpdate = async (reportId, newStatus) => {
//     try {
//       const token = localStorage.getItem("token");
//       const response = await fetch(
//         `http://127.0.0.1:5000/api/reports/${reportId}/status?status=${newStatus}`,
//         {
//           method: "PUT",
//           headers: { Authorization: `Bearer ${token}` },
//         }
//       );

//       if (response.ok) {
//         fetchAllReports();
//         fetchReports();
//       }
//     } catch (error) {
//       console.error("Error updating status:", error);
//     }
//   };

//   const getStatusBadge = (status) => {
//     switch (status) {
//       case "pending":
//         return (
//           <span className="flex items-center gap-1 px-3 py-1 bg-amber-500/20 text-amber-400 rounded-full text-xs font-medium">
//             <Clock className="w-3 h-3" />
//             Pending
//           </span>
//         );
//       case "verified":
//         return (
//           <span className="flex items-center gap-1 px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-xs font-medium">
//             <CheckCircle className="w-3 h-3" />
//             Verified
//           </span>
//         );
//       case "rejected":
//         return (
//           <span className="flex items-center gap-1 px-3 py-1 bg-red-500/20 text-red-400 rounded-full text-xs font-medium">
//             <XCircle className="w-3 h-3" />
//             Rejected
//           </span>
//         );
//       default:
//         return (
//           <span className="px-3 py-1 bg-gray-700 text-gray-300 rounded-full text-xs font-medium">
//             {status}
//           </span>
//         );
//     }
//   };

//   const getWaterSourceIcon = (source) => {
//     switch (source?.toLowerCase()) {
//       case "river":
//       case "lake":
//         return <Droplets className="w-4 h-4" />;
//       case "well":
//       case "borewell":
//         return <MapPin className="w-4 h-4" />;
//       default:
//         return <Droplets className="w-4 h-4" />;
//     }
//   };

//   const openReportModal = (report) => {
//     setSelectedReport(report);
//     setShowModal(true);
//   };

//   const displayedReports = canViewAllReports && activeTab === "all-reports" 
//     ? allReports 
//     : reports;

//   return (
//     <div className="min-h-screen flex bg-gray-900">
//       {/* Sidebar */}
//       <div className="w-64 bg-gray-800 text-white flex flex-col p-6 shadow-xl border-r border-gray-700">
//         <h2 className="text-2xl font-bold mb-8 italic flex items-center gap-2">
//           <Droplets className="w-6 h-6 text-yellow-400" />
//           WQM
//         </h2>
//         <ul className="space-y-2 flex-1">
//           <li
//             onClick={() => navigate("/dashboard")}
//             className="hover:bg-gray-700 p-3 rounded-lg cursor-pointer transition-colors flex items-center gap-2"
//           >
//             <FileText className="w-4 h-4" />
//             Dashboard
//           </li>
//           <li
//             onClick={() => navigate("/map")}
//             className="hover:bg-gray-700 p-3 rounded-lg cursor-pointer transition-colors flex items-center gap-2"
//           >
//             <MapPin className="w-4 h-4" />
//             Live Map View
//           </li>
//           <li
//             onClick={() => navigate("/search")}
//             className="hover:bg-gray-700 p-3 rounded-lg cursor-pointer transition-colors flex items-center gap-2"
//           >
//             <Clock className="w-4 h-4" />
//             Search
//           </li>
//           <li className="bg-yellow-400 text-gray-900 p-3 rounded-lg cursor-pointer font-bold shadow-md flex items-center gap-2">
//             <FileText className="w-4 h-4" />
//             My Reports
//           </li>
//           <li
//             onClick={() => navigate("/profile")}
//             className="hover:bg-gray-700 p-3 rounded-lg cursor-pointer transition-colors flex items-center gap-2"
//           >
//             <CheckCircle className="w-4 h-4" />
//             Profile
//           </li>
//         </ul>
//         <button
//           onClick={() => {
//             localStorage.clear();
//             navigate("/");
//           }}
//           className="mt-auto bg-gray-700 text-white hover:bg-gray-600 py-2.5 rounded-lg font-bold transition-all shadow-lg"
//         >
//           Logout
//         </button>
//       </div>

//       {/* Main Content */}
//       <div className="flex-1 p-8 overflow-y-auto">
//         <header className="mb-8">
//           <div className="flex items-center gap-4">
//             <button
//               onClick={() => navigate("/dashboard")}
//               className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
//             >
//               <ArrowLeft className="w-5 h-5 text-gray-400" />
//             </button>
//             <div>
//               <h1 className="text-3xl font-bold text-white">Water Quality Reports</h1>
//               <p className="text-gray-400 mt-1">
//                 Submit and track water quality reports
//               </p>
//             </div>
//           </div>
//         </header>

//         {/* Tabs */}
//         <div className="flex gap-2 mb-6">
//           <button
//             onClick={() => setActiveTab("my-reports")}
//             className={`px-6 py-2.5 rounded-lg font-medium transition-colors flex items-center gap-2 ${
//               activeTab === "my-reports"
//                 ? "bg-yellow-400 text-gray-900"
//                 : "bg-gray-800 text-gray-300 hover:bg-gray-700"
//             }`}
//           >
//             <FileText className="w-4 h-4" />
//             My Reports ({reports.length})
//           </button>
//           <button
//             onClick={() => setActiveTab("submit-report")}
//             className={`px-6 py-2.5 rounded-lg font-medium transition-colors flex items-center gap-2 ${
//               activeTab === "submit-report"
//                 ? "bg-yellow-400 text-gray-900"
//                 : "bg-gray-800 text-gray-300 hover:bg-gray-700"
//             }`}
//           >
//             <Plus className="w-4 h-4" />
//             Submit Report
//           </button>
//           {canViewAllReports && (
//             <button
//               onClick={() => setActiveTab("all-reports")}
//               className={`px-6 py-2.5 rounded-lg font-medium transition-colors flex items-center gap-2 ${
//                 activeTab === "all-reports"
//                   ? "bg-yellow-400 text-gray-900"
//                   : "bg-gray-800 text-gray-300 hover:bg-gray-700"
//               }`}
//             >
//               <Filter className="w-4 h-4" />
//               All Reports ({allReports.length})
//             </button>
//           )}
//         </div>

//         {/* My Reports / All Reports Tab */}
//         {(activeTab === "my-reports" || activeTab === "all-reports") && (
//           <div className="bg-gray-800 rounded-2xl shadow-lg border border-gray-700 overflow-hidden">
//             {loading ? (
//               <div className="p-12 text-center text-gray-400">
//                 Loading reports...
//               </div>
//             ) : displayedReports.length === 0 ? (
//               <div className="p-12 text-center">
//                 <AlertCircle className="w-16 h-16 text-gray-600 mx-auto mb-4" />
//                 <h3 className="text-lg font-medium text-white">No reports yet</h3>
//                 <p className="text-gray-400 mt-1">
//                   {activeTab === "my-reports"
//                     ? "You haven't submitted any reports yet."
//                     : "No reports in the system yet."}
//                 </p>
//                 <button
//                   onClick={() => setActiveTab("submit-report")}
//                   className="mt-4 bg-yellow-400 text-gray-900 px-6 py-2 rounded-lg hover:bg-yellow-500 transition-colors font-semibold"
//                 >
//                   Submit Your First Report
//                 </button>
//               </div>
//             ) : (
//               <div className="overflow-x-auto">
//                 <table className="w-full">
//                   <thead className="bg-gray-900">
//                     <tr>
//                       <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">
//                         ID
//                       </th>
//                       <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">
//                         Subject
//                       </th>
//                       <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">
//                         Date
//                       </th>
//                       <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">
//                         Location
//                       </th>
//                       <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">
//                         Water Source
//                       </th>
//                       <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">
//                         Status
//                       </th>
//                       {activeTab === "all-reports" && (
//                         <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">
//                           Submitted By
//                         </th>
//                       )}
//                       <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">
//                         Actions
//                       </th>
//                     </tr>
//                   </thead>
//                   <tbody className="divide-y divide-gray-700">
//                     {displayedReports.map((report) => (
//                       <tr key={report.id} className="hover:bg-gray-700/50">
//                         <td className="px-6 py-4 text-sm text-gray-400">
//                           #{report.id}
//                         </td>
//                         <td className="px-6 py-4 text-sm text-white font-medium">
//                           {report.subject || "No Subject"}
//                         </td>
//                         <td className="px-6 py-4 text-sm text-gray-400">
//                           {new Date(report.created_at).toLocaleDateString()}
//                         </td>
//                         <td className="px-6 py-4 text-sm text-gray-300">
//                           {report.location}
//                         </td>
//                         <td className="px-6 py-4">
//                           <span className="flex items-center gap-1 text-sm text-gray-400">
//                             {getWaterSourceIcon(report.water_source)}
//                             {report.water_source}
//                           </span>
//                         </td>
//                         <td className="px-6 py-4">{getStatusBadge(report.status)}</td>
//                         {activeTab === "all-reports" && (
//                           <td className="px-6 py-4 text-sm text-gray-400">
//                             {report.user?.name || "Unknown"}
//                           </td>
//                         )}
//                         <td className="px-6 py-4">
//                           <div className="flex items-center gap-2">
//                             <button
//                               onClick={() => openReportModal(report)}
//                               className="p-2 text-yellow-400 hover:bg-yellow-400/10 rounded-lg transition-colors"
//                               title="View Details"
//                             >
//                               <Eye className="w-4 h-4" />
//                             </button>
//                             {canUpdateReportStatus &&
//                               report.status === "pending" && (
//                                 <>
//                                   <button
//                                     onClick={() =>
//                                       handleStatusUpdate(report.id, "verified")
//                                     }
//                                     className="p-2 text-green-400 hover:bg-green-400/10 rounded-lg transition-colors"
//                                     title="Verify"
//                                   >
//                                     <CheckCircle className="w-4 h-4" />
//                                   </button>
//                                   <button
//                                     onClick={() =>
//                                       handleStatusUpdate(report.id, "rejected")
//                                     }
//                                     className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
//                                     title="Reject"
//                                   >
//                                     <XCircle className="w-4 h-4" />
//                                   </button>
//                                 </>
//                               )}
//                           </div>
//                         </td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//               </div>
//             )}
//           </div>
//         )}

//         {/* Submit Report Tab - Dark Theme Matching Reference */}
//         {activeTab === "submit-report" && (
//           <div className="max-w-lg mx-auto">
//             <div className="bg-gray-800 rounded-2xl shadow-lg border border-gray-700 p-6">
//               <h2 className="text-xl font-bold text-white mb-6">
//                 Report Issue
//               </h2>

//               {submitSuccess && (
//                 <div className="mb-6 p-4 bg-green-500/20 border border-green-500/30 rounded-lg flex items-center gap-3">
//                   <CheckCircle className="w-5 h-5 text-green-400" />
//                   <span className="text-green-400">
//                     Report submitted successfully!
//                   </span>
//                 </div>
//               )}

//               <form onSubmit={handleSubmit} className="space-y-6">
//                 {/* Subject/Title - New field */}
//                 <div>
//                   <label className="block text-sm font-medium text-gray-300 mb-2">
//                     Subject/Title *
//                   </label>
//                   <input
//                     type="text"
//                     name="subject"
//                     required
//                     value={formData.subject}
//                     onChange={handleInputChange}
//                     placeholder="Enter report subject"
//                     className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-yellow-400 outline-none"
//                   />
//                 </div>

//                 {/* Photo Evidence - Matching reference */}
//                 <div>
//                   <label className="block text-sm font-medium text-gray-300 mb-2">
//                     Photo Evidence
//                   </label>
//                   <div className="border-2 border-dashed border-gray-600 rounded-xl p-8 text-center hover:border-yellow-400 transition-colors bg-gray-900">
//                     {photoPreview ? (
//                       <div className="relative inline-block">
//                         <img
//                           src={photoPreview}
//                           alt="Preview"
//                           className="max-h-48 rounded-lg"
//                         />
//                         <button
//                           type="button"
//                           onClick={() => {
//                             setPhoto(null);
//                             setPhotoPreview(null);
//                           }}
//                           className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
//                         >
//                           <X className="w-4 h-4" />
//                         </button>
//                       </div>
//                     ) : (
//                       <label className="cursor-pointer block">
//                         <Camera className="w-12 h-12 text-gray-500 mx-auto mb-3" />
//                         <span className="text-gray-400">
//                           Tap to select photo
//                         </span>
//                         <input
//                           type="file"
//                           accept="image/*"
//                           onChange={handlePhotoChange}
//                           className="hidden"
//                         />
//                       </label>
//                     )}
//                   </div>
//                 </div>

//                 {/* Location - Matching reference */}
//                 <div>
//                   <label className="block text-sm font-medium text-gray-300 mb-2">
//                     Location
//                   </label>
//                   <div className="relative mb-3">
//                     <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
//                     <input
//                       type="text"
//                       name="location"
//                       value={formData.location}
//                       onChange={handleInputChange}
//                       placeholder={detectingLocation ? "Detecting location..." : "Enter location"}
//                       className="w-full pl-10 pr-4 py-3 bg-gray-900 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-yellow-400 outline-none"
//                     />
//                   </div>
                  
//                   {/* Lat/Long inputs */}
//                   <div className="grid grid-cols-2 gap-3 mb-3">
//                     <input
//                       type="text"
//                       name="latitude"
//                       value={formData.latitude}
//                       onChange={handleInputChange}
//                       placeholder="Latitude"
//                       className="w-full px-4 py-2 bg-gray-900 border border-gray-600 rounded-lg text-white text-sm focus:ring-2 focus:ring-yellow-400 outline-none"
//                     />
//                     <input
//                       type="text"
//                       name="longitude"
//                       value={formData.longitude}
//                       onChange={handleInputChange}
//                       placeholder="Longitude"
//                       className="w-full px-4 py-2 bg-gray-900 border border-gray-600 rounded-lg text-white text-sm focus:ring-2 focus:ring-yellow-400 outline-none"
//                     />
//                   </div>

//                   <div className="grid grid-cols-2 gap-3">
//                     <button
//                       type="button"
//                       onClick={detectCurrentLocation}
//                       disabled={detectingLocation}
//                       className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm"
//                     >
//                       <Navigation className="w-4 h-4" />
//                       {detectingLocation ? "Detecting..." : "Current Location"}
//                     </button>
//                     <button
//                       type="button"
//                       onClick={() => setShowMapPicker(true)}
//                       className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm"
//                     >
//                       <MapPin className="w-4 h-4" />
//                       Pick on Map
//                     </button>
//                   </div>
//                 </div>

//                 {/* Description - Matching reference */}
//                 <div>
//                   <label className="block text-sm font-medium text-gray-300 mb-2">
//                     Description
//                   </label>
//                   <textarea
//                     name="description"
//                     required
//                     value={formData.description}
//                     onChange={handleInputChange}
//                     placeholder="Describe the water quality issue in detail..."
//                     rows={4}
//                     className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-yellow-400 outline-none resize-none"
//                   />
//                 </div>

//                 {/* Water Source Type - Matching reference */}
//                 <div>
//                   <label className="block text-sm font-medium text-gray-300 mb-2">
//                     Water Source Type
//                   </label>
//                   <div className="relative">
//                     <select
//                       name="water_source"
//                       value={formData.water_source}
//                       onChange={handleInputChange}
//                       className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-yellow-400 outline-none appearance-none"
//                     >
//                       <option value="">Select a source</option>
//                       <option value="river">River</option>
//                       <option value="lake">Lake</option>
//                       <option value="well">Well</option>
//                       <option value="borewell">Borewell</option>
//                       <option value="tap">Tap Water</option>
//                       <option value="pond">Pond</option>
//                       <option value="stream">Stream</option>
//                       <option value="other">Other</option>
//                     </select>
//                     <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5 pointer-events-none" />
//                   </div>
//                 </div>

//                 {/* Submit Button - Yellow like reference */}
//                 <button
//                   type="submit"
//                   disabled={submitting}
//                   className="w-full bg-yellow-400 text-gray-900 py-3 rounded-lg font-semibold hover:bg-yellow-500 transition-colors disabled:opacity-50"
//                 >
//                   {submitting ? "Submitting..." : "Submit Report"}
//                 </button>
//               </form>
//             </div>
//           </div>
//         )}
//       </div>

//       {/* Report Detail Modal */}
//       {showModal && selectedReport && (
//         <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
//           <div className="bg-gray-800 rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto border border-gray-700">
//             <div className="p-6">
//               <div className="flex items-center justify-between mb-4">
//                 <h3 className="text-xl font-bold text-white">
//                   Report #{selectedReport.id}
//                 </h3>
//                 <button
//                   onClick={() => setShowModal(false)}
//                   className="p-2 hover:bg-gray-700 rounded-lg"
//                 >
//                   <X className="w-5 h-5 text-gray-400" />
//                 </button>
//               </div>

//               <div className="space-y-4">
//                 <div className="flex items-center justify-between">
//                   <span className="text-gray-400">Status</span>
//                   {getStatusBadge(selectedReport.status)}
//                 </div>

//                 <div className="flex items-center justify-between">
//                   <span className="text-gray-400">Submitted On</span>
//                   <span className="font-medium text-white">
//                     {new Date(selectedReport.created_at).toLocaleString()}
//                   </span>
//                 </div>

//                 <div className="flex items-center justify-between">
//                   <span className="text-gray-400">Location</span>
//                   <span className="font-medium text-white">{selectedReport.location}</span>
//                 </div>

//                 <div className="flex items-center justify-between">
//                   <span className="text-gray-400">Water Source</span>
//                   <span className="flex items-center gap-1 font-medium text-white capitalize">
//                     {getWaterSourceIcon(selectedReport.water_source)}
//                     {selectedReport.water_source}
//                   </span>
//                 </div>

//                 {selectedReport.user && (
//                   <div className="flex items-center justify-between">
//                     <span className="text-gray-400">Submitted By</span>
//                     <span className="font-medium text-white">{selectedReport.user.name}</span>
//                   </div>
//                 )}

//                 <div>
//                   <span className="text-gray-400 block mb-2">Description</span>
//                   <p className="text-white bg-gray-900 p-4 rounded-lg border border-gray-700">
//                     {selectedReport.description}
//                   </p>
//                 </div>

//                 {selectedReport.photo_url && (
//                   <div>
//                     <span className="text-gray-400 block mb-2">Photo</span>
//                     <img
//                       src={selectedReport.photo_url}
//                       alt="Report"
//                       className="w-full rounded-lg"
//                     />
//                   </div>
//                 )}
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Map Picker Modal */}
//       {showMapPicker && (
//         <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
//           <div className="bg-gray-800 rounded-2xl max-w-2xl w-full border border-gray-700">
//             <div className="p-4 border-b border-gray-700 flex items-center justify-between">
//               <h3 className="text-lg font-bold text-white">Pick Location on Map</h3>
//               <button
//                 onClick={() => setShowMapPicker(false)}
//                 className="p-2 hover:bg-gray-700 rounded-lg"
//               >
//                 <X className="w-5 h-5 text-gray-400" />
//               </button>
//             </div>
//             <div className="p-4">
//               <div className="h-64 bg-gray-900 rounded-lg flex items-center justify-center">
//                 <p className="text-gray-500">Map integration coming soon...</p>
//               </div>
//               <div className="mt-4 flex justify-end gap-3">
//                 <button
//                   onClick={() => setShowMapPicker(false)}
//                   className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   onClick={() => setShowMapPicker(false)}
//                   className="px-4 py-2 bg-yellow-400 text-gray-900 rounded-lg font-semibold hover:bg-yellow-500"
//                 >
//                   Confirm Location
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default UserReports;
