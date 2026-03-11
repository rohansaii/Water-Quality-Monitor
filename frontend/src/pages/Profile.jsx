import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  User,
  Mail,
  Shield,
  Calendar,
  FileText,
  Search,
  MapPin,
  Edit2,
  Lock,
  Save,
  X,
  CheckCircle,
  AlertCircle,
  Droplets,
  Activity,
  Navigation,
  Clock,
  HelpCircle,
  LogOut,
  AlertTriangle,
} from "lucide-react";

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    reportsCount: 0,
    searchesCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  // Edit form state
  const [editForm, setEditForm] = useState({
    name: "",
  });

  // Password form state
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [message, setMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    fetchUserData();
    fetchStats();
  }, []);

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://127.0.0.1:5000/api/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data);
        setEditForm({ name: data.name });
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem("token");

      // Fetch reports count
      const reportsRes = await fetch("http://127.0.0.1:5000/api/reports", {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Fetch searches count
      const searchesRes = await fetch("http://127.0.0.1:5000/api/search/history", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (reportsRes.ok && searchesRes.ok) {
        const reports = await reportsRes.json();
        const searches = await searchesRes.json();
        setStats({
          reportsCount: reports.length,
          searchesCount: searches.length,
        });
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const handleUpdateProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://127.0.0.1:5000/api/auth/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(editForm),
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data);
        localStorage.setItem("userName", data.name);
        setEditing(false);
        setMessage({ type: "success", text: "Profile updated successfully!" });
        setTimeout(() => setMessage({ type: "", text: "" }), 3000);
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      setMessage({ type: "error", text: "Failed to update profile" });
    }
  };

  const handleChangePassword = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setMessage({ type: "error", text: "New passwords do not match" });
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://127.0.0.1:5000/api/auth/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          old_password: passwordForm.oldPassword,
          new_password: passwordForm.newPassword,
        }),
      });

      if (response.ok) {
        setChangingPassword(false);
        setPasswordForm({ oldPassword: "", newPassword: "", confirmPassword: "" });
        setMessage({ type: "success", text: "Password changed successfully!" });
        setTimeout(() => setMessage({ type: "", text: "" }), 3000);
      } else {
        setMessage({ type: "error", text: "Failed to change password. Check your old password." });
      }
    } catch (error) {
      console.error("Error changing password:", error);
      setMessage({ type: "error", text: "Failed to change password" });
    }
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case "admin":
        return "bg-red-100 text-red-700 border-red-200";
      case "authority":
        return "bg-purple-100 text-purple-700 border-purple-200";
      case "ngo":
        return "bg-blue-100 text-blue-700 border-blue-200";
      default:
        return "bg-green-100 text-green-700 border-green-200";
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case "admin":
        return <Shield className="w-4 h-4" />;
      case "authority":
        return <Shield className="w-4 h-4" />;
      case "ngo":
        return <User className="w-4 h-4" />;
      default:
        return <User className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-sky-50">
        <div className="text-sky-600 text-xl font-semibold">Loading profile...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-sky-50">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800">Error Loading Profile</h2>
          <button
            onClick={() => navigate("/")}
            className="mt-4 bg-sky-600 text-white px-6 py-2 rounded-lg"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

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
            <Activity className="w-4 h-4" />
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
            <Search className="w-4 h-4" />
            Search
          </li>
          <li
            onClick={() => navigate("/reports")}
            className="hover:bg-sky-500 p-3 rounded-lg cursor-pointer transition-colors flex items-center gap-2"
          >
            <FileText className="w-4 h-4" />
            My Reports
          </li>
          <li className="bg-white text-sky-600 p-3 rounded-lg cursor-pointer font-bold shadow-md flex items-center gap-2">
            <User className="w-4 h-4" />
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
          <h1 className="text-3xl font-bold text-sky-900">My Profile</h1>
          <p className="text-sky-600 mt-1">Manage your account settings and preferences</p>
        </header>

        {/* Alert Message */}
        {message.text && (
          <div
            className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
              message.type === "success"
                ? "bg-green-50 border border-green-200 text-green-700"
                : "bg-red-50 border border-red-200 text-red-700"
            }`}
          >
            {message.type === "success" ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <AlertCircle className="w-5 h-5" />
            )}
            {message.text}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border border-sky-100 p-6">
              <div className="text-center">
                {/* Avatar */}
                <div className="w-24 h-24 bg-sky-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <User className="w-12 h-12 text-sky-600" />
                </div>

                <h2 className="text-xl font-bold text-gray-800">{user.name}</h2>
                <p className="text-gray-500 text-sm">{user.email}</p>

                <div className="mt-3">
                  <span
                    className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border capitalize ${getRoleBadgeColor(
                      user.role
                    )}`}
                  >
                    {getRoleIcon(user.role)}
                    {user.role}
                  </span>
                </div>

                <p className="text-xs text-gray-400 mt-4">
                  Member since {new Date(user.created_at).toLocaleDateString()}
                </p>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-100">
                <h3 className="text-sm font-bold text-gray-700 mb-4">Activity Summary</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-sky-600" />
                      <span className="text-sm text-gray-600">Reports Submitted</span>
                    </div>
                    <span className="font-bold text-gray-800">{stats.reportsCount}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Search className="w-4 h-4 text-sky-600" />
                      <span className="text-sm text-gray-600">Searches Made</span>
                    </div>
                    <span className="font-bold text-gray-800">{stats.searchesCount}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-2xl shadow-sm border border-sky-100 p-6 mt-6">
              <h3 className="text-sm font-bold text-gray-700 mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <button
                  onClick={() => navigate("/reports")}
                  className="w-full p-3 text-left hover:bg-gray-50 rounded-lg transition-colors flex items-center gap-3"
                >
                  <FileText className="w-4 h-4 text-sky-600" />
                  <span className="text-sm text-gray-700">View My Reports</span>
                </button>
                <button
                  onClick={() => navigate("/search")}
                  className="w-full p-3 text-left hover:bg-gray-50 rounded-lg transition-colors flex items-center gap-3"
                >
                  <Search className="w-4 h-4 text-sky-600" />
                  <span className="text-sm text-gray-700">Search Stations</span>
                </button>
                <button
                  onClick={() => navigate("/map")}
                  className="w-full p-3 text-left hover:bg-gray-50 rounded-lg transition-colors flex items-center gap-3"
                >
                  <MapPin className="w-4 h-4 text-sky-600" />
                  <span className="text-sm text-gray-700">View Map</span>
                </button>
              </div>
            </div>
          </div>

          {/* Edit Profile Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Edit Profile */}
            <div className="bg-white rounded-2xl shadow-sm border border-sky-100 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                  <User className="w-5 h-5 text-sky-600" />
                  Profile Information
                </h2>
                {!editing && (
                  <button
                    onClick={() => setEditing(true)}
                    className="flex items-center gap-2 px-4 py-2 text-sky-600 hover:bg-sky-50 rounded-lg transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                    Edit
                  </button>
                )}
              </div>

              {editing ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="text"
                        value={editForm.name}
                        onChange={(e) =>
                          setEditForm({ ...editForm, name: e.target.value })
                        }
                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-sky-400 outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="email"
                        value={user.email}
                        disabled
                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-500"
                      />
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                      Email cannot be changed
                    </p>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={handleUpdateProfile}
                      className="flex-1 bg-sky-600 text-white py-3 rounded-lg font-semibold hover:bg-sky-700 transition-colors flex items-center justify-center gap-2"
                    >
                      <Save className="w-4 h-4" />
                      Save Changes
                    </button>
                    <button
                      onClick={() => {
                        setEditing(false);
                        setEditForm({ name: user.name });
                      }}
                      className="px-6 py-3 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
                    >
                      <X className="w-4 h-4" />
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-3 border-b border-gray-50">
                    <span className="text-gray-500">Full Name</span>
                    <span className="font-medium text-gray-800">{user.name}</span>
                  </div>
                  <div className="flex items-center justify-between py-3 border-b border-gray-50">
                    <span className="text-gray-500">Email Address</span>
                    <span className="font-medium text-gray-800">{user.email}</span>
                  </div>
                  <div className="flex items-center justify-between py-3 border-b border-gray-50">
                    <span className="text-gray-500">Role</span>
                    <span className="font-medium text-gray-800 capitalize">
                      {user.role}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-3">
                    <span className="text-gray-500">Member Since</span>
                    <span className="font-medium text-gray-800">
                      {new Date(user.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Change Password */}
            <div className="bg-white rounded-2xl shadow-sm border border-sky-100 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                  <Lock className="w-5 h-5 text-sky-600" />
                  Change Password
                </h2>
                {!changingPassword && (
                  <button
                    onClick={() => setChangingPassword(true)}
                    className="flex items-center gap-2 px-4 py-2 text-sky-600 hover:bg-sky-50 rounded-lg transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                    Change
                  </button>
                )}
              </div>

              {changingPassword ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Current Password
                    </label>
                    <input
                      type="password"
                      value={passwordForm.oldPassword}
                      onChange={(e) =>
                        setPasswordForm({
                          ...passwordForm,
                          oldPassword: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-sky-400 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      New Password
                    </label>
                    <input
                      type="password"
                      value={passwordForm.newPassword}
                      onChange={(e) =>
                        setPasswordForm({
                          ...passwordForm,
                          newPassword: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-sky-400 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      value={passwordForm.confirmPassword}
                      onChange={(e) =>
                        setPasswordForm({
                          ...passwordForm,
                          confirmPassword: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-sky-400 outline-none"
                    />
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={handleChangePassword}
                      className="flex-1 bg-sky-600 text-white py-3 rounded-lg font-semibold hover:bg-sky-700 transition-colors flex items-center justify-center gap-2"
                    >
                      <Save className="w-4 h-4" />
                      Update Password
                    </button>
                    <button
                      onClick={() => {
                        setChangingPassword(false);
                        setPasswordForm({
                          oldPassword: "",
                          newPassword: "",
                          confirmPassword: "",
                        });
                      }}
                      className="px-6 py-3 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
                    >
                      <X className="w-4 h-4" />
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500 text-sm">
                  Your password was last changed on{" "}
                  {new Date(user.created_at).toLocaleDateString()}. We recommend
                  changing your password regularly for security.
                </p>
              )}
            </div>

            {/* Account Info */}
            <div className="bg-gradient-to-r from-sky-500 to-sky-600 rounded-2xl shadow-sm p-6 text-white">
              <h3 className="text-lg font-bold mb-2">Need Help?</h3>
              <p className="text-sky-100 text-sm mb-4">
                If you need assistance with your account or have any questions,
                please contact our support team.
              </p>
              <button
                onClick={() => navigate("/reports")}
                className="bg-white text-sky-600 px-4 py-2 rounded-lg font-medium hover:bg-sky-50 transition-colors"
              >
                Submit a Report
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;




// import { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import {
//   User,
//   Mail,
//   Shield,
//   Edit2,
//   Lock,
//   CheckCircle,
//   AlertCircle,
//   Droplets,
//   FileText,
//   Clock,
//   LogOut,
//   AlertTriangle
// } from "lucide-react";

// const Profile = () => {
//   const navigate = useNavigate();
//   const [user, setUser] = useState(null);
//   const [stats, setStats] = useState({
//     reportsCount: 0,
//     searchesCount: 0,
//   });
//   const [loading, setLoading] = useState(true);
//   const [editing, setEditing] = useState(false);
//   const [changingPassword, setChangingPassword] = useState(false);

//   // Edit form state
//   const [editForm, setEditForm] = useState({
//     name: "",
//     phone: "",
//     location: "",
//   });

//   // Password form state
//   const [passwordForm, setPasswordForm] = useState({
//     oldPassword: "",
//     newPassword: "",
//     confirmPassword: "",
//   });

//   // Preferences state
//   const [preferences, setPreferences] = useState({
//     emailNotifications: true,
//     mapHeatmapOverlay: false,
//   });

//   // Linked organizations (mock data)
//   const [linkedOrgs] = useState([
//     { id: 1, name: "Green Earth NGO" },
//     { id: 2, name: "Water Guardians Foundation" },
//   ]);

//   const [message, setMessage] = useState({ type: "", text: "" });

//   useEffect(() => {
//     fetchUserData();
//     fetchStats();
//   }, []);

//   const fetchUserData = async () => {
//     try {
//       const token = localStorage.getItem("token");
//       const response = await fetch("http://127.0.0.1:5000/api/auth/me", {
//         headers: { Authorization: `Bearer ${token}` },
//       });

//       if (response.ok) {
//         const data = await response.json();
//         setUser(data);
//         setEditForm({
//           name: data.name,
//           phone: data.phone || "",
//           location: data.location || "",
//         });
//       }
//     } catch (error) {
//       console.error("Error fetching user data:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const fetchStats = async () => {
//     try {
//       const token = localStorage.getItem("token");
//       const [reportsRes, searchesRes] = await Promise.all([
//         fetch("http://127.0.0.1:5000/api/reports", {
//           headers: { Authorization: `Bearer ${token}` },
//         }),
//         fetch("http://127.0.0.1:5000/api/search/history", {
//           headers: { Authorization: `Bearer ${token}` },
//         }),
//       ]);

//       if (reportsRes.ok && searchesRes.ok) {
//         const reports = await reportsRes.json();
//         const searches = await searchesRes.json();
//         setStats({
//           reportsCount: reports.length,
//           searchesCount: searches.length,
//         });
//       }
//     } catch (error) {
//       console.error("Error fetching stats:", error);
//     }
//   };

//   const handleUpdateProfile = async () => {
//     try {
//       const token = localStorage.getItem("token");
//       const response = await fetch("http://127.0.0.1:5000/api/auth/profile", {
//         method: "PUT",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${token}`,
//         },
//         body: JSON.stringify(editForm),
//       });

//       if (response.ok) {
//         const data = await response.json();
//         setUser(data);
//         localStorage.setItem("userName", data.name);
//         setEditing(false);
//         setMessage({ type: "success", text: "Profile updated successfully!" });
//         setTimeout(() => setMessage({ type: "", text: "" }), 3000);
//       }
//     } catch (error) {
//       console.error("Error updating profile:", error);
//       setMessage({ type: "error", text: "Failed to update profile" });
//     }
//   };

//   const handleChangePassword = async () => {
//     if (passwordForm.newPassword !== passwordForm.confirmPassword) {
//       setMessage({ type: "error", text: "New passwords do not match" });
//       return;
//     }

//     try {
//       const token = localStorage.getItem("token");
//       const response = await fetch("http://127.0.0.1:5000/api/auth/change-password", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${token}`,
//         },
//         body: JSON.stringify({
//           old_password: passwordForm.oldPassword,
//           new_password: passwordForm.newPassword,
//         }),
//       });

//       if (response.ok) {
//         setChangingPassword(false);
//         setPasswordForm({ oldPassword: "", newPassword: "", confirmPassword: "" });
//         setMessage({ type: "success", text: "Password changed successfully!" });
//         setTimeout(() => setMessage({ type: "", text: "" }), 3000);
//       } else {
//         setMessage({ type: "error", text: "Failed to change password. Check your old password." });
//       }
//     } catch (error) {
//       console.error("Error changing password:", error);
//       setMessage({ type: "error", text: "Failed to change password" });
//     }
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-gray-900">
//         <div className="text-yellow-400 text-xl font-semibold">Loading profile...</div>
//       </div>
//     );
//   }

//   if (!user) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-gray-900">
//         <div className="text-center">
//           <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
//           <h2 className="text-2xl font-bold text-white">Error Loading Profile</h2>
//           <button
//             onClick={() => navigate("/")}
//             className="mt-4 bg-yellow-400 text-gray-900 px-6 py-2 rounded-lg font-semibold"
//           >
//             Go to Login
//           </button>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen flex bg-gray-900">
//       {/* Sidebar */}
//       <div className="w-64 bg-gray-800 text-white flex flex-col p-6 shadow-xl">
//         <h2 className="text-2xl font-bold mb-8 flex items-center gap-2">
//           <Droplets className="w-6 h-6 text-yellow-400" />
//           WaterWatch
//         </h2>
//         <ul className="space-y-2 flex-1">
//           <li
//             onClick={() => navigate("/dashboard")}
//             className="hover:bg-gray-700 p-3 rounded-lg cursor-pointer transition-colors flex items-center gap-2"
//           >
//             <MapPin className="w-4 h-4" />
//             Dashboard
//           </li>
//           <li
//             onClick={() => navigate("/map")}
//             className="hover:bg-gray-700 p-3 rounded-lg cursor-pointer transition-colors flex items-center gap-2"
//           >
//             <MapPin className="w-4 h-4" />
//             Map
//           </li>
//           <li
//             onClick={() => navigate("/reports")}
//             className="hover:bg-gray-700 p-3 rounded-lg cursor-pointer transition-colors flex items-center gap-2"
//           >
//             <FileText className="w-4 h-4" />
//             Reports
//           </li>
//           <li className="bg-yellow-400 text-gray-900 p-3 rounded-lg cursor-pointer font-bold shadow-md flex items-center gap-2">
//             <User className="w-4 h-4" />
//             Profile
//           </li>
//         </ul>
//       </div>

//       {/* Main Content */}
//       <div className="flex-1 p-8 overflow-y-auto">
//         {/* Alert Message */}
//         {message.text && (
//           <div
//             className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
//               message.type === "success"
//                 ? "bg-green-900/50 border border-green-700 text-green-300"
//                 : "bg-red-900/50 border border-red-700 text-red-300"
//             }`}
//           >
//             {message.type === "success" ? (
//               <CheckCircle className="w-5 h-5" />
//             ) : (
//               <AlertCircle className="w-5 h-5" />
//             )}
//             {message.text}
//           </div>
//         )}

//         <div className="max-w-4xl mx-auto">
//           {/* Profile Header Card */}
//           <div className="bg-gray-800 rounded-2xl shadow-lg border border-gray-700 p-8 mb-6">
//             <div className="text-center">
//               {/* Avatar with online status */}
//               <div className="relative inline-block">
//                 <div className="w-24 h-24 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full mx-auto mb-4 flex items-center justify-center">
//                   <User className="w-12 h-12 text-gray-900" />
//                 </div>
//                 <div className="absolute bottom-1 right-1 w-6 h-6 bg-green-500 rounded-full border-4 border-gray-800"></div>
//               </div>

//               <h2 className="text-2xl font-bold text-white">{user.name}</h2>
//               <p className="text-gray-400 capitalize">{user.role} User</p>
//             </div>
//           </div>

//           {/* Account Information */}
//           <div className="bg-gray-800 rounded-2xl shadow-lg border border-gray-700 p-6 mb-6">
//             <h3 className="text-lg font-semibold text-white mb-6">Account Information</h3>

//             <div className="space-y-4">
//               <div>
//                 <label className="block text-sm text-gray-400 mb-2">Full Name</label>
//                 {editing ? (
//                   <input
//                     type="text"
//                     value={editForm.name}
//                     onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
//                     className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-yellow-400 outline-none"
//                   />
//                 ) : (
//                   <div className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white">
//                     {user.name}
//                   </div>
//                 )}
//               </div>

//               <div>
//                 <label className="block text-sm text-gray-400 mb-2">Email Address</label>
//                 <div className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-gray-400">
//                   {user.email}
//                 </div>
//               </div>

//               <div>
//                 <label className="block text-sm text-gray-400 mb-2">Phone Number</label>
//                 {editing ? (
//                   <input
//                     type="tel"
//                     value={editForm.phone}
//                     onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
//                     placeholder="+1 (555) 123-4567"
//                     className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-yellow-400 outline-none"
//                   />
//                 ) : (
//                   <div className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white">
//                     {editForm.phone || "Not provided"}
//                   </div>
//                 )}
//               </div>

//               <div>
//                 <label className="block text-sm text-gray-400 mb-2">Location</label>
//                 {editing ? (
//                   <input
//                     type="text"
//                     value={editForm.location}
//                     onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
//                     placeholder="New York, NY"
//                     className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-yellow-400 outline-none"
//                   />
//                 ) : (
//                   <div className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white">
//                     {editForm.location || "Not provided"}
//                   </div>
//                 )}
//               </div>

//               {editing && (
//                 <div className="flex gap-3 pt-2">
//                   <button
//                     onClick={handleUpdateProfile}
//                     className="flex-1 bg-yellow-400 text-gray-900 py-3 rounded-lg font-semibold hover:bg-yellow-500 transition-colors"
//                   >
//                     Save Changes
//                   </button>
//                   <button
//                     onClick={() => {
//                       setEditing(false);
//                       setEditForm({
//                         name: user.name,
//                         phone: user.phone || "",
//                         location: user.location || "",
//                       });
//                     }}
//                     className="px-6 py-3 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors"
//                   >
//                     Cancel
//                   </button>
//                 </div>
//               )}
//             </div>

//             {!editing && (
//               <button
//                 onClick={() => setEditing(true)}
//                 className="mt-4 text-yellow-400 hover:text-yellow-300 text-sm font-medium flex items-center gap-1"
//               >
//                 <Edit2 className="w-4 h-4" />
//                 Edit Profile
//               </button>
//             )}
//           </div>

//           {/* Linked Organizations */}
//           <div className="bg-gray-800 rounded-2xl shadow-lg border border-gray-700 p-6 mb-6">
//             <h3 className="text-lg font-semibold text-white mb-4">Linked Organizations</h3>
//             <div className="space-y-3">
//               {linkedOrgs.map((org) => (
//                 <div key={org.id} className="flex items-center gap-3 text-gray-300">
//                   <Building2 className="w-5 h-5 text-gray-500" />
//                   <span>{org.name}</span>
//                 </div>
//               ))}
//             </div>
//           </div>

//           {/* Security */}
//           <div className="bg-gray-800 rounded-2xl shadow-lg border border-gray-700 p-6 mb-6">
//             <h3 className="text-lg font-semibold text-white mb-4">Security</h3>
//             <button
//               onClick={() => setChangingPassword(!changingPassword)}
//               className="w-full py-3 bg-gray-900 hover:bg-gray-700 rounded-lg text-white font-medium flex items-center justify-center gap-2 transition-colors"
//             >
//               <Lock className="w-4 h-4" />
//               Change Password
//             </button>

//             {changingPassword && (
//               <div className="mt-4 space-y-4">
//                 <input
//                   type="password"
//                   placeholder="Current Password"
//                   value={passwordForm.oldPassword}
//                   onChange={(e) => setPasswordForm({ ...passwordForm, oldPassword: e.target.value })}
//                   className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-yellow-400 outline-none"
//                 />
//                 <input
//                   type="password"
//                   placeholder="New Password"
//                   value={passwordForm.newPassword}
//                   onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
//                   className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-yellow-400 outline-none"
//                 />
//                 <input
//                   type="password"
//                   placeholder="Confirm New Password"
//                   value={passwordForm.confirmPassword}
//                   onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
//                   className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-yellow-400 outline-none"
//                 />
//                 <div className="flex gap-3">
//                   <button
//                     onClick={handleChangePassword}
//                     className="flex-1 bg-yellow-400 text-gray-900 py-3 rounded-lg font-semibold hover:bg-yellow-500 transition-colors"
//                   >
//                     Update Password
//                   </button>
//                   <button
//                     onClick={() => {
//                       setChangingPassword(false);
//                       setPasswordForm({ oldPassword: "", newPassword: "", confirmPassword: "" });
//                     }}
//                     className="px-6 py-3 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors"
//                   >
//                     Cancel
//                   </button>
//                 </div>
//               </div>
//             )}
//           </div>

//           {/* Preferences */}
//           <div className="bg-gray-800 rounded-2xl shadow-lg border border-gray-700 p-6 mb-6">
//             <h3 className="text-lg font-semibold text-white mb-4">Preferences</h3>
//             <div className="space-y-4">
//               <div className="flex items-center justify-between">
//                 <span className="text-gray-300">Email Notifications</span>
//                 <button
//                   onClick={() => setPreferences({ ...preferences, emailNotifications: !preferences.emailNotifications })}
//                   className={`w-12 h-6 rounded-full transition-colors ${preferences.emailNotifications ? 'bg-yellow-400' : 'bg-gray-600'}`}
//                 >
//                   <div className={`w-5 h-5 bg-white rounded-full transition-transform ${preferences.emailNotifications ? 'translate-x-6' : 'translate-x-1'}`}></div>
//                 </button>
//               </div>
//               <div className="flex items-center justify-between">
//                 <span className="text-gray-300">Map Heatmap Overlay</span>
//                 <button
//                   onClick={() => setPreferences({ ...preferences, mapHeatmapOverlay: !preferences.mapHeatmapOverlay })}
//                   className={`w-12 h-6 rounded-full transition-colors ${preferences.mapHeatmapOverlay ? 'bg-yellow-400' : 'bg-gray-600'}`}
//                 >
//                   <div className={`w-5 h-5 bg-white rounded-full transition-transform ${preferences.mapHeatmapOverlay ? 'translate-x-6' : 'translate-x-1'}`}></div>
//                 </button>
//               </div>
//             </div>
//           </div>

//           {/* Quick Actions */}
//           <div className="bg-gray-800 rounded-2xl shadow-lg border border-gray-700 p-6 mb-6">
//             <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
//             <div className="space-y-3">
//               <button
//                 onClick={() => navigate("/reports")}
//                 className="w-full py-3 bg-gray-900 hover:bg-gray-700 rounded-lg text-white font-medium flex items-center justify-center gap-2 transition-colors"
//               >
//                 <HelpCircle className="w-4 h-4" />
//                 Help & Support
//               </button>
//               <button
//                 onClick={() => {
//                   localStorage.clear();
//                   navigate("/");
//                 }}
//                 className="w-full py-3 bg-red-500 hover:bg-red-600 rounded-lg text-white font-medium flex items-center justify-center gap-2 transition-colors"
//               >
//                 <LogOut className="w-4 h-4" />
//                 Logout
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Profile;
