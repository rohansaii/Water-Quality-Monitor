// import { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import {
//   LineChart, Line, XAxis, YAxis,
//   CartesianGrid, Tooltip,
//   ResponsiveContainer, Legend
// } from "recharts";
// import {
//   LayoutDashboard,
//   MapPin,
//   Search,
//   FileText,
//   User,
//   LogOut,
//   Droplets,
//   Activity,
//   AlertCircle
// } from "lucide-react";

// const Dashboard = () => {
//   const navigate = useNavigate();
//   const userName = localStorage.getItem("userName") || "User";
//   const userRole = localStorage.getItem("userRole") || "citizen";

//   const [stations, setStations] = useState([]);
//   const [alerts, setAlerts] = useState([]);
//   const [loading, setLoading] = useState(true);

//   const data = [
//     { time: "00:00", ph: 7.0, turbidity: 1.1, chlorine: 0.5 },
//     { time: "04:00", ph: 7.2, turbidity: 1.4, chlorine: 0.6 },
//     { time: "08:00", ph: 6.9, turbidity: 1.8, chlorine: 0.8 },
//     { time: "12:00", ph: 7.4, turbidity: 1.2, chlorine: 0.7 },
//     { time: "16:00", ph: 7.1, turbidity: 1.5, chlorine: 0.9 },
//     { time: "20:00", ph: 7.3, turbidity: 1.3, chlorine: 0.6 }
//   ];

//   useEffect(() => {
//     fetchDashboardData();
//   }, []);

//   const fetchDashboardData = async () => {
//     try {
//       const token = localStorage.getItem("token");

//       const stationsRes = await fetch("http://127.0.0.1:5000/api/stations", {
//         headers: { Authorization: `Bearer ${token}` }
//       });

//       const alertsRes = await fetch("http://127.0.0.1:5000/api/alerts", {
//         headers: { Authorization: `Bearer ${token}` }
//       });

//       if (stationsRes.ok) {
//         const stationsData = await stationsRes.json();
//         setStations(stationsData);
//       }

//       if (alertsRes.ok) {
//         const alertsData = await alertsRes.json();
//         setAlerts(alertsData);
//       }

//     } catch (error) {
//       console.error("Error fetching dashboard data:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleLogout = () => {
//     localStorage.clear();
//     navigate("/");
//   };

//   const getRoleBadgeColor = (role) => {
//     switch (role) {
//       case "admin": return "bg-red-100 text-red-700";
//       case "authority": return "bg-purple-100 text-purple-700";
//       case "ngo": return "bg-blue-100 text-blue-700";
//       default: return "bg-green-100 text-green-700";
//     }
//   };

//   // 🔥 Dynamic Average WQI
//   const averageWQI =
//     stations.length > 0
//       ? Math.round(
//           stations.reduce((sum, s) => sum + (s.wqi || 0), 0) /
//             stations.length
//         )
//       : 0;

//   const getWQIStatus = (wqi) => {
//     if (wqi >= 90) return "Excellent";
//     if (wqi >= 75) return "Good";
//     if (wqi >= 50) return "Fair";
//     return "Poor";
//   };

//   const wqiStatus = getWQIStatus(averageWQI);

//   const getStatusColor = () => {
//     if (wqiStatus === "Excellent") return "text-green-600";
//     if (wqiStatus === "Good") return "text-blue-600";
//     if (wqiStatus === "Fair") return "text-amber-600";
//     return "text-red-600";
//   };

//   const circleOffset = 502 - (averageWQI / 100) * 502;

//   return (
//     <div className="min-h-screen flex bg-sky-50 text-slate-800 font-sans">

//       {/* Sidebar */}
//       <div className="w-64 bg-sky-600 text-white flex flex-col p-6 shadow-xl">
//         <h2 className="text-2xl font-bold mb-8 italic flex items-center gap-2">
//           <Droplets className="w-6 h-6" />
//           WQM
//         </h2>

//         <div className="mb-8 p-4 bg-sky-700/40 rounded-xl border border-sky-400/30">
//           <p className="text-[10px] uppercase tracking-widest text-sky-200">
//             Session
//           </p>
//           <p className="font-bold text-lg leading-tight">{userName}</p>
//           <span className={`mt-2 inline-block text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${getRoleBadgeColor(userRole)}`}>
//             {userRole}
//           </span>
//         </div>

//         <ul className="space-y-2 flex-1">
//           <li onClick={() => navigate("/dashboard")} className="bg-white text-sky-600 p-3 rounded-lg cursor-pointer font-bold shadow-md flex items-center gap-2">
//             <LayoutDashboard className="w-4 h-4" />
//             Dashboard
//           </li>
//           <li onClick={() => navigate("/map")} className="hover:bg-sky-500 p-3 rounded-lg cursor-pointer flex items-center gap-2">
//             <MapPin className="w-4 h-4" />
//             Live Map View
//           </li>
//           <li onClick={() => navigate("/search")} className="hover:bg-sky-500 p-3 rounded-lg cursor-pointer flex items-center gap-2">
//             <Search className="w-4 h-4" />
//             Search Stations
//           </li>
//           <li onClick={() => navigate("/reports")} className="hover:bg-sky-500 p-3 rounded-lg cursor-pointer flex items-center gap-2">
//             <FileText className="w-4 h-4" />
//             My Reports
//           </li>
//           <li onClick={() => navigate("/profile")} className="hover:bg-sky-500 p-3 rounded-lg cursor-pointer flex items-center gap-2">
//             <User className="w-4 h-4" />
//             Profile
//           </li>
//         </ul>

//         <button onClick={handleLogout} className="mt-auto bg-white text-sky-600 py-2.5 rounded-lg font-bold shadow-lg flex items-center justify-center gap-2">
//           <LogOut className="w-4 h-4" />
//           Logout
//         </button>
//       </div>

//       {/* Main Content */}
//       <div className="flex-1 p-8 overflow-y-auto">

//         <header className="flex justify-between items-center mb-8">
//           <h1 className="text-3xl font-bold text-sky-900">
//             System Overview
//           </h1>
//           <span className="bg-sky-100 text-sky-700 px-4 py-1.5 rounded-full text-sm font-medium border border-sky-200">
//             {stations.length} Stations
//           </span>
//         </header>

//         {/* WQI Section */}
//         <div className="bg-white border border-sky-100 rounded-3xl p-8 shadow-sm flex flex-col items-center justify-center">
//           <h2 className="text-xl font-bold text-sky-900 mb-8 self-start">
//             Water Quality Index
//           </h2>

//           <div className="relative flex items-center justify-center">
//             <svg className="w-48 h-48 rotate-[-90deg]">
//               <circle cx="96" cy="96" r="80" stroke="#f0f9ff" strokeWidth="12" fill="transparent" />
//               <circle
//                 cx="96"
//                 cy="96"
//                 r="80"
//                 stroke="#0284c7"
//                 strokeWidth="12"
//                 fill="transparent"
//                 strokeDasharray="502"
//                 strokeDashoffset={circleOffset}
//                 strokeLinecap="round"
//               />
//             </svg>
//             <span className="absolute text-6xl font-black text-sky-900">
//               {averageWQI}
//             </span>
//           </div>

//           <p className={`mt-4 font-black tracking-widest uppercase ${getStatusColor()}`}>
//             {wqiStatus}
//           </p>
//         </div>

//       </div>
//     </div>
//   );
// };

// export default Dashboard;

// ✅ FULL WORKING DASHBOARD (DO NOT CUT ANYTHING)
// import { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import {
//   BarChart, Bar, XAxis, YAxis,
//   CartesianGrid, Tooltip,
//   ResponsiveContainer, Legend
// } from "recharts";
// import {
//   LayoutDashboard,
//   MapPin,
//   LogOut,
//   Droplets
// } from "lucide-react";

// const Dashboard = () => {
//   const navigate = useNavigate();

//   const [stations, setStations] = useState([]);
//   const [alerts, setAlerts] = useState([]);
//   const [chartData, setChartData] = useState([]);

//   useEffect(() => {
//     fetchDashboardData();
//   }, []);

//   const fetchDashboardData = async () => {
//     try {
//       const token = localStorage.getItem("token");

//       const stationsRes = await fetch("http://127.0.0.1:5000/api/stations", {
//         headers: { Authorization: `Bearer ${token}` }
//       });

//       const alertsRes = await fetch("http://127.0.0.1:5000/api/alerts", {
//         headers: { Authorization: `Bearer ${token}` }
//       });

//       if (stationsRes.ok) {
//         const stationsData = await stationsRes.json();
//         setStations(stationsData);

//         // 🔥 TRUE Top 10 Stations (sorted by highest WQI)
//         const dynamicChart = [...stationsData]
//           .sort((a, b) => (b.wqi || 0) - (a.wqi || 0))
//           .slice(0, 10)
//           .map((s, index) => ({
//             name: s.name || s.station_name || `Station ${index + 1}`,
//             wqi: s.wqi || 0
//           }));

//         setChartData(dynamicChart);
//       }

//       if (alertsRes.ok) {
//         const alertsData = await alertsRes.json();
//         setAlerts(alertsData);
//       }

//     } catch (error) {
//       console.error(error);
//     }
//   };

//   // ✅ Average WQI
//   const averageWQI =
//     stations.length > 0
//       ? Math.round(
//           stations.reduce((sum, s) => sum + (s.wqi || 0), 0) /
//           stations.length
//         )
//       : 0;

//   // ✅ Category Logic (Excellent > 90)
//   const excellentCount = stations.filter(s => (s.wqi || 0) > 90).length;
//   const goodCount = stations.filter(s => (s.wqi || 0) >= 75 && (s.wqi || 0) <= 90).length;
//   const attentionCount = stations.filter(s => (s.wqi || 0) < 75).length;

//   const activeAlerts = alerts.filter(a => !a.is_resolved).length;

//   const getWQIStatus = (wqi) => {
//     if (wqi > 90) return "Excellent";
//     if (wqi >= 75) return "Good";
//     if (wqi >= 50) return "Fair";
//     return "Poor";
//   };

//   const wqiStatus = getWQIStatus(averageWQI);

//   const getStatusColor = () => {
//     if (wqiStatus === "Excellent") return "text-green-600";
//     if (wqiStatus === "Good") return "text-blue-600";
//     if (wqiStatus === "Fair") return "text-amber-600";
//     return "text-red-600";
//   };

//   const circleOffset = 502 - (averageWQI / 100) * 502;

//   return (
//     <div className="min-h-screen flex bg-sky-50 text-slate-800">

//       {/* Sidebar */}
//       <div className="w-64 bg-sky-600 text-white flex flex-col p-6">
//         <h2 className="text-2xl font-bold mb-8 flex items-center gap-2">
//           <Droplets className="w-6 h-6" /> WQM
//         </h2>

//         <ul className="space-y-3 flex-1">
//           <li
//             onClick={() => navigate("/dashboard")}
//             className="bg-white text-sky-600 p-3 rounded-lg cursor-pointer font-bold flex items-center gap-2"
//           >
//             <LayoutDashboard className="w-4 h-4" /> Dashboard
//           </li>

//           <li
//             onClick={() => navigate("/map")}
//             className="hover:bg-sky-500 p-3 rounded-lg cursor-pointer flex items-center gap-2"
//           >
//             <MapPin className="w-4 h-4" /> Live Map
//           </li>
//         </ul>

//         <button
//           onClick={() => { localStorage.clear(); navigate("/"); }}
//           className="mt-auto bg-white text-sky-600 py-2 rounded-lg font-bold flex items-center justify-center gap-2"
//         >
//           <LogOut className="w-4 h-4" /> Logout
//         </button>
//       </div>

//       {/* Main */}
//       <div className="flex-1 p-8">

//         <h1 className="text-3xl font-bold mb-6">System Overview</h1>

//         {/* Stats Cards */}
//         <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
//           <div className="bg-white p-6 rounded-xl shadow">
//             <h3>Total Stations</h3>
//             <p className="text-3xl font-bold">{stations.length}</p>
//           </div>

//           <div className="bg-white p-6 rounded-xl shadow">
//             <h3>Excellent (&gt; 90)</h3>
//             <p className="text-3xl font-bold text-green-600">
//               {excellentCount}
//             </p>
//           </div>

//           <div className="bg-white p-6 rounded-xl shadow">
//             <h3>Needs Attention (&lt; 75)</h3>
//             <p className="text-3xl font-bold text-amber-600">
//               {attentionCount}
//             </p>
//           </div>

//           <div className="bg-white p-6 rounded-xl shadow">
//             <h3>Active Alerts</h3>
//             <p className="text-3xl font-bold text-red-600">
//               {activeAlerts}
//             </p>
//           </div>
//         </div>

//         {/* Chart + WQI */}
//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

//           {/* Dynamic Top 10 Chart */}
//           <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow">
//             <h2 className="text-lg font-bold mb-4">
//               Top 10 Stations by WQI
//             </h2>

//             <ResponsiveContainer width="100%" height={300}>
//   <BarChart data={chartData}>
//     <CartesianGrid strokeDasharray="3 3" />
//     <XAxis dataKey="name" />
//     <YAxis domain={[0, 100]} />
//     <Tooltip />
//     <Legend />
//     <Bar dataKey="wqi" fill="#0284c7" radius={[6, 6, 0, 0]} />
//   </BarChart>
// </ResponsiveContainer>
//           </div>

//           {/* WQI Circle */}
//           <div className="bg-white p-6 rounded-xl shadow flex flex-col items-center">
//             <h2 className="text-xl font-bold mb-4">Water Quality Index</h2>

//             <div className="relative">
//               <svg className="w-48 h-48 rotate-[-90deg]">
//                 <circle cx="96" cy="96" r="80" stroke="#eee" strokeWidth="12" fill="transparent" />
//                 <circle
//                   cx="96"
//                   cy="96"
//                   r="80"
//                   stroke="#0284c7"
//                   strokeWidth="12"
//                   fill="transparent"
//                   strokeDasharray="502"
//                   strokeDashoffset={circleOffset}
//                   strokeLinecap="round"
//                 />
//               </svg>

//               <span className="absolute inset-0 flex items-center justify-center text-5xl font-bold">
//                 {averageWQI}
//               </span>
//             </div>

//             <p className={`mt-4 font-bold uppercase ${getStatusColor()}`}>
//               {wqiStatus}
//             </p>
//           </div>

//         </div>
//       </div>
//     </div>
//   );
// };

// export default Dashboard;

// import { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
// import { 
//   LayoutDashboard, 
//   MapPin, 
//   Search, 
//   FileText, 
//   User, 
//   LogOut,
//   Droplets,
//   Activity,
//   AlertCircle
// } from 'lucide-react';

// const Dashboard = () => {
//   const navigate = useNavigate();
//   const userName = localStorage.getItem("userName") || "User";
//   const userRole = localStorage.getItem("userRole") || "citizen";
//   const [stations, setStations] = useState([]);
//   const [alerts, setAlerts] = useState([]);
//   const [loading, setLoading] = useState(true);

//   const data = [
//     { time: '00:00', ph: 7.0, turbidity: 1.1, chlorine: 0.5 },
//     { time: '04:00', ph: 7.2, turbidity: 1.4, chlorine: 0.6 },
//     { time: '08:00', ph: 6.9, turbidity: 1.8, chlorine: 0.8 },
//     { time: '12:00', ph: 7.4, turbidity: 1.2, chlorine: 0.7 },
//     { time: '16:00', ph: 7.1, turbidity: 1.5, chlorine: 0.9 },
//     { time: '20:00', ph: 7.3, turbidity: 1.3, chlorine: 0.6 },
//   ];

//   useEffect(() => {
//     fetchDashboardData();
//   }, []);

//   const fetchDashboardData = async () => {
//     try {
//       const token = localStorage.getItem("token");
      
//       // Fetch stations
//       const stationsRes = await fetch("http://127.0.0.1:5000/api/stations", {
//         headers: { Authorization: `Bearer ${token}` },
//       });
      
//       // Fetch alerts
//       const alertsRes = await fetch("http://127.0.0.1:5000/api/alerts", {
//         headers: { Authorization: `Bearer ${token}` },
//       });

//       if (stationsRes.ok) {
//         const stationsData = await stationsRes.json();
//         setStations(stationsData);
//       }

//       if (alertsRes.ok) {
//         const alertsData = await alertsRes.json();
//         setAlerts(alertsData);
//       }
//     } catch (error) {
//       console.error("Error fetching dashboard data:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleLogout = () => {
//     localStorage.clear();
//     navigate("/");
//   };

//   const getRoleBadgeColor = (role) => {
//     switch (role) {
//       case "admin":
//         return "bg-red-100 text-red-700";
//       case "authority":
//         return "bg-purple-100 text-purple-700";
//       case "ngo":
//         return "bg-blue-100 text-blue-700";
//       default:
//         return "bg-green-100 text-green-700";
//     }
//   };

//   const averageWQI =
//   stations.length > 0
//     ? Math.round(
//         stations.reduce((sum, s) => sum + (s.wqi || 0), 0) /
//           stations.length
//       )
//     : 0;

// const getWQIStatus = (wqi) => {
//   if (wqi >= 90) return "Excellent";
//   if (wqi >= 75) return "Good";
//   if (wqi >= 50) return "Fair";
//   return "Poor";
// };

// const wqiStatus = getWQIStatus(averageWQI);

//   return (
//     <div className="min-h-screen flex bg-sky-50 text-slate-800 font-sans">
//       {/* Sidebar */}
//       <div className="w-64 bg-sky-600 text-white flex flex-col p-6 shadow-xl">
//         <h2 className="text-2xl font-bold mb-8 italic flex items-center gap-2">
//           <Droplets className="w-6 h-6" />
//           WQM
//         </h2>
//         <div className="mb-8 p-4 bg-sky-700/40 rounded-xl border border-sky-400/30">
//             <p className="text-[10px] uppercase tracking-widest text-sky-200">Session</p>
//             <p className="font-bold text-lg leading-tight">{userName}</p>
//             <span className={`mt-2 inline-block text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${getRoleBadgeColor(userRole)}`}>
//                 {userRole}
//             </span>
//         </div>
//         <ul className="space-y-2 flex-1">
//           <li onClick={() => navigate("/dashboard")} className="bg-white text-sky-600 p-3 rounded-lg cursor-pointer font-bold shadow-md flex items-center gap-2">
//             <LayoutDashboard className="w-4 h-4" />
//             Dashboard
//           </li>
//           <li onClick={() => navigate("/map")} className="hover:bg-sky-500 p-3 rounded-lg cursor-pointer transition-colors flex items-center gap-2">
//             <MapPin className="w-4 h-4" />
//             Live Map View
//           </li>
//           <li onClick={() => navigate("/search")} className="hover:bg-sky-500 p-3 rounded-lg cursor-pointer transition-colors flex items-center gap-2">
//             <Search className="w-4 h-4" />
//             Search Stations
//           </li>
//           <li onClick={() => navigate("/reports")} className="hover:bg-sky-500 p-3 rounded-lg cursor-pointer transition-colors flex items-center gap-2">
//             <FileText className="w-4 h-4" />
//             My Reports
//           </li>
//           <li onClick={() => navigate("/profile")} className="hover:bg-sky-500 p-3 rounded-lg cursor-pointer transition-colors flex items-center gap-2">
//             <User className="w-4 h-4" />
//             Profile
//           </li>
//         </ul>
//         <button onClick={handleLogout} className="mt-auto bg-white text-sky-600 hover:bg-sky-50 py-2.5 rounded-lg font-bold transition-all shadow-lg flex items-center justify-center gap-2">
//           <LogOut className="w-4 h-4" />
//           Logout
//         </button>
//       </div>

//       {/* Main Content */}
//       <div className="flex-1 p-8 overflow-y-auto">
//         <header className="flex justify-between items-center mb-8">
//             <div>
//                 <h1 className="text-3xl font-bold text-sky-900">System Overview</h1>
//                 <p className="text-sky-600 font-medium tracking-tight italic">Welcome back, {userName} | Water Quality Monitoring</p>
//             </div>
//             <div className="flex items-center gap-3">
//               <span className="bg-sky-100 text-sky-700 px-4 py-1.5 rounded-full text-sm font-medium border border-sky-200">
//                 {stations.length} Stations
//               </span>
//               {alerts.filter(a => !a.is_resolved).length > 0 && (
//                 <span className="bg-red-100 text-red-600 px-4 py-1.5 rounded-full text-sm font-bold border border-red-200 flex items-center gap-1">
//                   <AlertCircle className="w-4 h-4" />
//                   {alerts.filter(a => !a.is_resolved).length} Active Alerts
//                 </span>
//               )}
//             </div>
//         </header>

//         {/* Quick Stats Grid */}
//         <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
//           <div className="bg-white border-l-4 border-sky-400 rounded-2xl p-6 shadow-sm">
//             <h3 className="text-slate-500 text-sm font-semibold flex items-center gap-2">
//               <MapPin className="w-4 h-4" />
//               Total Stations
//             </h3>
//             <p className="text-3xl font-black text-sky-700">{stations.length}</p>
//             <p className="text-xs text-gray-400 mt-1">Across all regions</p>
//           </div>
//           <div className="bg-white border-l-4 border-green-400 rounded-2xl p-6 shadow-sm">
//             <h3 className="text-slate-500 text-sm font-semibold flex items-center gap-2">
//               <Activity className="w-4 h-4" />
//               Excellent Quality
//             </h3>
//             <p className="text-3xl font-black text-green-600">
//               {stations.filter(s => s.status === "Excellent").length}
//             </p>
//             <p className="text-xs text-gray-400 mt-1">Stations with WQI &gt; 90</p>
//           </div>
//           <div className="bg-white border-l-4 border-amber-400 rounded-2xl p-6 shadow-sm">
//             <h3 className="text-slate-500 text-sm font-semibold flex items-center gap-2">
//               <AlertCircle className="w-4 h-4" />
//               Needs Attention
//             </h3>
//             <p className="text-3xl font-black text-amber-600">
//               {stations.filter(s => s.status === "Fair" || s.status === "Poor").length}
//             </p>
//             <p className="text-xs text-gray-400 mt-1">Stations with WQI &lt; 80</p>
//           </div>
//           <div className="bg-white border-l-4 border-red-400 rounded-2xl p-6 shadow-sm">
//             <h3 className="text-slate-500 text-sm font-semibold flex items-center gap-2">
//               <AlertCircle className="w-4 h-4" />
//               Active Alerts
//             </h3>
//             <p className="text-3xl font-black text-red-600">
//               {alerts.filter(a => !a.is_resolved).length}
//             </p>
//             <p className="text-xs text-gray-400 mt-1">Unresolved alerts</p>
//           </div>
//         </div>

//         {/* Analytics Section */}
//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
//             <div className="lg:col-span-2 bg-white border border-sky-100 rounded-3xl p-8 shadow-sm">
//                 <h2 className="text-xl font-bold text-sky-900 mb-6 italic">Multi-Parameter Line Chart</h2>
//                 <div className="h-72 w-full">
//                     <ResponsiveContainer width="100%" height="100%">
//                         <LineChart data={data}>
//                             <CartesianGrid strokeDasharray="3 3" stroke="#f0f9ff" />
//                             <XAxis dataKey="time" stroke="#0ea5e9" fontSize={12} />
//                             <YAxis stroke="#0ea5e9" fontSize={12} />
//                             <Tooltip contentStyle={{ borderRadius: '15px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
//                             <Legend iconType="circle" />
//                             <Line type="monotone" dataKey="ph" stroke="#0284c7" strokeWidth={4} name="pH" />
//                             <Line type="monotone" dataKey="turbidity" stroke="#f59e0b" strokeWidth={4} name="Turbidity" />
//                             <Line type="monotone" dataKey="chlorine" stroke="#10b981" strokeWidth={4} name="Chlorine" />
//                         </LineChart>
//                     </ResponsiveContainer>
//                 </div>
//             </div>

//             <div className="bg-white border border-sky-100 rounded-3xl p-8 shadow-sm flex flex-col items-center justify-center">
//                 <h2 className="text-xl font-bold text-sky-900 mb-8 self-start">Water Quality Index</h2>
//                 <div className="relative flex items-center justify-center">
//                     <svg className="w-48 h-48 rotate-[-90deg]">
//                         <circle cx="96" cy="96" r="80" stroke="#f0f9ff" strokeWidth="12" fill="transparent" />
//                         <circle cx="96" cy="96" r="80" stroke="#0284c7" strokeWidth="12" fill="transparent" strokeDasharray="502" strokeDashoffset="75" strokeLinecap="round" />
//                     </svg>
//                     <span className="absolute text-6xl font-black text-sky-900">85</span>
//                 </div>
//                 <p className="mt-4 text-green-600 font-black tracking-widest uppercase">Excellent</p>
//             </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Dashboard;


import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip,
  ResponsiveContainer, Legend
} from "recharts";
import {
  LayoutDashboard,
  MapPin,
  Search,
  FileText,
  User,
  LogOut,
  Droplets,
  AlertTriangle,
  AlertCircle
} from "lucide-react";

const Dashboard = () => {
  const navigate = useNavigate();

  const [stations, setStations] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  const userName = localStorage.getItem("userName") || "User";
  const userRole = localStorage.getItem("userRole") || "citizen";

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem("token");

      const stationsRes = await fetch("http://127.0.0.1:5000/api/stations", {
        headers: { Authorization: `Bearer ${token}` }
      });

      const alertsRes = await fetch("http://127.0.0.1:5000/api/alerts", {
        headers: { Authorization: `Bearer ${token}` }
      });

      let stationsData = [];
      let alertsData = [];

      if (stationsRes.ok) {
        stationsData = await stationsRes.json();
        setStations(stationsData || []);
      }

      if (alertsRes.ok) {
        alertsData = await alertsRes.json();
        setAlerts(alertsData || []);
      }

      // 🔥 TRUE Top 10 Stations by WQI
      if (stationsData.length > 0) {
        const top10 = [...stationsData]
          .sort((a, b) => (b.wqi || 0) - (a.wqi || 0))
          .slice(0, 10)
          // .map((s, index) => ({
          //   name: s.name || s.station_name || `Station ${index + 1}`,
          //   wqi: s.wqi || 0
          // }));
          .map((s, index) => {
  const fullName = s.name || s.station_name || `Station ${index + 1}`;

  return {
    shortName: `S${index + 1}`,   // 🔥 For X-axis
    fullName: fullName,           // 🔥 For tooltip
    wqi: Number(s.wqi) || 0
  };
});

        setChartData(top10);
      }

    } catch (error) {
      console.error("Dashboard Error:", error);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Average WQI
  const averageWQI =
    stations.length > 0
      ? Math.round(
          stations.reduce((sum, s) => sum + (s.wqi || 0), 0) /
          stations.length
        )
      : 0;

  // ✅ Category Logic
  const excellentCount = stations.filter(s => (s.wqi || 0) > 90).length;
  const attentionCount = stations.filter(s => (s.wqi || 0) < 75).length;
  const activeAlerts = alerts.filter(a => a.is_resolved === false).length;

  const getWQIStatus = (wqi) => {
    if (wqi > 90) return "Excellent";
    if (wqi >= 75) return "Good";
    if (wqi >= 50) return "Fair";
    return "Poor";
  };

  const wqiStatus = getWQIStatus(averageWQI);

  const getStatusColor = () => {
    if (wqiStatus === "Excellent") return "text-green-600";
    if (wqiStatus === "Good") return "text-blue-600";
    if (wqiStatus === "Fair") return "text-amber-600";
    return "text-red-600";
  };

  const circleOffset = 502 - (averageWQI / 100) * 502;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen text-xl font-bold">
        Loading Dashboard...
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-sky-50 text-slate-800 font-sans">

      {/* Sidebar */}
      <div className="w-64 bg-sky-600 text-white flex flex-col p-6 shadow-xl">

        <h2 className="text-2xl font-bold mb-8 italic flex items-center gap-2">
          <Droplets className="w-6 h-6" />
          WQM
        </h2>

        {/* Session Box */}
        <div className="mb-8 p-4 bg-sky-700/40 rounded-xl border border-sky-400/30">
          <p className="text-[10px] uppercase tracking-widest text-sky-200">
            Session
          </p>

          <p className="font-bold text-lg leading-tight">
            {userName}
          </p>

          <span className={`mt-2 inline-block text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
            userRole === "admin"
              ? "bg-red-100 text-red-700"
              : userRole === "authority"
              ? "bg-purple-100 text-purple-700"
              : userRole === "ngo"
              ? "bg-blue-100 text-blue-700"
              : "bg-green-100 text-green-700"
          }`}>
            {userRole}
          </span>
        </div>

        <ul className="space-y-2 flex-1">

          <li
            onClick={() => navigate("/dashboard")}
            className="bg-white text-sky-600 p-3 rounded-lg cursor-pointer font-bold shadow-md flex items-center gap-2"
          >
            <LayoutDashboard className="w-4 h-4" />
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
            Search Stations
          </li>

          <li
            onClick={() => navigate("/reports")}
            className="hover:bg-sky-500 p-3 rounded-lg cursor-pointer transition-colors flex items-center gap-2"
          >
            <FileText className="w-4 h-4" />
            My Reports
          </li>

          <li
            onClick={() => navigate("/profile")}
            className="hover:bg-sky-500 p-3 rounded-lg cursor-pointer transition-colors flex items-center gap-2"
          >
            <User className="w-4 h-4" />
            Profile
          </li>

        </ul>

        <button
          onClick={() => {
            localStorage.clear();
            navigate("/");
          }}
          className="mt-auto bg-white text-sky-600 hover:bg-sky-50 py-2.5 rounded-lg font-bold transition-all shadow-lg flex items-center justify-center gap-2"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8 overflow-y-auto">

        <h1 className="text-3xl font-bold mb-6 text-sky-900">
          System Overview
        </h1>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">

          <div className="bg-white p-6 rounded-2xl shadow-md">
            <h3>Total Stations</h3>
            <p className="text-3xl font-bold">{stations.length}</p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-md">
            <h3>Excellent (&gt; 90)</h3>
            <p className="text-3xl font-bold text-green-600">
              {excellentCount}
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-md">
            <h3>Needs Attention (&lt; 75)</h3>
            <p className="text-3xl font-bold text-amber-600">
              {attentionCount}
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-md">
            <h3>Active Alerts</h3>
            <p className="text-3xl font-bold text-red-600 flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              {activeAlerts}
            </p>
          </div>

        </div>

        {/* Chart + WQI */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-md">
            <h2 className="text-lg font-bold mb-4">
              Top 10 Stations by WQI
            </h2>

            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                {/* <XAxis
                  dataKey="name"
                  angle={-20}
                  textAnchor="end"
                  interval={0}
                  height={70}
                />
                <YAxis domain={[0, 100]} />
                <Tooltip /> */}
                <XAxis
  dataKey="shortName"
  interval={0}
/>

<YAxis domain={[0, 100]} />

<Tooltip
  formatter={(value) => [`WQI: ${value}`]}
  labelFormatter={(label, payload) =>
    payload && payload.length
      ? payload[0].payload.fullName
      : label
  }
/>
                <Legend />
                <Bar dataKey="wqi" fill="#0284c7" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-md flex flex-col items-center">
            <h2 className="text-xl font-bold mb-4">Average WQI</h2>

            <div className="relative">
              <svg className="w-48 h-48 rotate-[-90deg]">
                <circle cx="96" cy="96" r="80" stroke="#eee" strokeWidth="12" fill="transparent" />
                <circle
                  cx="96"
                  cy="96"
                  r="80"
                  stroke="#0284c7"
                  strokeWidth="12"
                  fill="transparent"
                  strokeDasharray="502"
                  strokeDashoffset={circleOffset}
                  strokeLinecap="round"
                />
              </svg>

              <span className="absolute inset-0 flex items-center justify-center text-5xl font-bold">
                {averageWQI}
              </span>
            </div>

            <p className={`mt-4 font-bold uppercase ${getStatusColor()}`}>
              {wqiStatus}
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Dashboard;