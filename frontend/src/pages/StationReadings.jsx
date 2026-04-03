import { API_BASE_URL } from '../config';
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  AreaChart,
  Area,
} from "recharts";
import {
  ArrowLeft,
  MapPin,
  Activity,
  Calendar,
  Download,
  Droplets,
  Thermometer,
  Wind,
  AlertCircle,
  Clock,
  TrendingUp,
  FileText,
} from "lucide-react";

const StationReadings = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [station, setStation] = useState(null);
  const [currentReadings, setCurrentReadings] = useState({});
  const [historyData, setHistoryData] = useState([]);
  const [selectedPeriod, setSelectedPeriod] = useState("daily");
  const [selectedParameter, setSelectedParameter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [wqi, setWqi] = useState(null);
  const [status, setStatus] = useState("Unknown");
  const [userRole, setUserRole] = useState("");

  const canAddReading = true; // Enabled for all logged-in users as per backend update

  const periods = [
    { value: "hourly", label: "Hourly (24H)" },
    { value: "daily", label: "Daily (7 Days)" },
    { value: "weekly", label: "Weekly (4 Weeks)" },
    { value: "monthly", label: "Monthly (1 Year)" },
    { value: "yearly", label: "Yearly (5 Years)" },
  ];

  const parameters = [
    { key: "all", label: "All Parameters", color: "#0284c7" },
    { key: "pH", label: "pH Level", color: "#22c55e", unit: "" },
    { key: "turbidity", label: "Turbidity", color: "#f59e0b", unit: "NTU" },
    { key: "DO", label: "Dissolved Oxygen", color: "#3b82f6", unit: "mg/L" },
    { key: "temperature", label: "Temperature", color: "#ef4444", unit: "°C" },
    { key: "arsenic", label: "Arsenic", color: "#8b5cf6", unit: "mg/L" },
    { key: "lead", label: "Lead", color: "#6366f1", unit: "mg/L" },
    { key: "iron", label: "Iron", color: "#f97316", unit: "mg/L" },
    { key: "e_coli", label: "E.Coli", color: "#ec4899", unit: "CFU/100mL" },
  ];

  useEffect(() => {
    const role = localStorage.getItem("userRole") || "";
    setUserRole(role);
    fetchStationData();
  }, [id]);

  useEffect(() => {
    if (station) {
      fetchHistoryData();
    }
  }, [station, selectedPeriod, selectedParameter]);

  const fetchStationData = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${API_BASE_URL}/api/stations/${id}/current`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setStation(data.station);
        setCurrentReadings(data.current_readings);
        setWqi(data.wqi);
        setStatus(data.status);
      }
    } catch (error) {
      console.error("Error fetching station data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchHistoryData = async () => {
    try {
      const token = localStorage.getItem("token");
      const param = selectedParameter === "all" ? "" : selectedParameter;
      const response = await fetch(
        `${API_BASE_URL}/api/stations/${id}/readings/history?period=${selectedPeriod}&parameter=${param}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.ok) {
        const data = await response.json();
        // Transform data for charts
        const chartData = transformDataForChart(data.readings);
        setHistoryData(chartData);
      }
    } catch (error) {
      console.error("Error fetching history:", error);
    }
  };

  const transformDataForChart = (readings) => {
    // Group readings by time
    const grouped = {};
    readings.forEach((r) => {
      const time = new Date(r.recorded_at).toLocaleString();
      if (!grouped[time]) {
        grouped[time] = { time };
      }
      grouped[time][r.parameter] = parseFloat(r.value);
    });

    return Object.values(grouped);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Excellent":
        return "bg-green-500";
      case "Good":
        return "bg-blue-500";
      case "Fair":
        return "bg-amber-500";
      case "Poor":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusTextColor = (status) => {
    switch (status) {
      case "Excellent":
        return "text-green-600";
      case "Good":
        return "text-blue-600";
      case "Fair":
        return "text-amber-600";
      case "Poor":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  const downloadCSV = () => {
    const headers = "Time,Parameter,Value\n";
    const rows = historyData
      .map((d) => {
        return Object.keys(d)
          .filter((k) => k !== "time")
          .map((param) => `${d.time},${param},${d[param]}`)
          .join("\n");
      })
      .join("\n");

    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `station_${id}_readings_${selectedPeriod}.csv`;
    a.click();
  };

  const getParameterIcon = (param) => {
    switch (param) {
      case "pH":
        return <Droplets className="w-5 h-5" />;
      case "temperature":
        return <Thermometer className="w-5 h-5" />;
      case "DO":
        return <Wind className="w-5 h-5" />;
      default:
        return <Activity className="w-5 h-5" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-sky-50">
        <div className="text-sky-600 text-xl font-semibold">
          Loading station data...
        </div>
      </div>
    );
  }

  if (!station) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-sky-50">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800">Station Not Found</h2>
          <p className="text-gray-500 mt-2">
            The requested station could not be found.
          </p>
          <button
            onClick={() => navigate("/map")}
            className="mt-4 bg-sky-600 text-white px-6 py-2 rounded-lg hover:bg-sky-700 transition-colors"
          >
            Back to Map
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-sky-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate("/map")}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {station.name}
                </h1>
                <p className="text-sm text-gray-500 flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {station.location}
                  {station.managed_by && (
                    <span className="ml-2">| Managed by: {station.managed_by}</span>
                  )}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={downloadCSV}
                className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
              >
                <Download className="w-4 h-4" />
                Export CSV
              </button>
              <button
                onClick={() => navigate(`/station/${id}/add-reading`)}
                className="flex items-center gap-2 px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors font-semibold shadow-sm"
              >
                <Activity className="w-4 h-4" />
                Add Reading
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {/* WQI Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-500">Water Quality Index</span>
              <Activity className="w-5 h-5 text-sky-500" />
            </div>
            <div className="flex items-end gap-2">
              <span className="text-4xl font-bold text-gray-900">
                {wqi ? Math.round(wqi) : "-"}
              </span>
              <span className={`text-sm font-medium mb-1 ${getStatusTextColor(status)}`}>
                {status}
              </span>
            </div>
            <div className="mt-3 h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full ${getStatusColor(status)} transition-all duration-500`}
                style={{ width: `${wqi || 0}%` }}
              ></div>
            </div>
          </div>

          {/* Current Readings Summary */}
          {["pH", "turbidity", "DO", "temperature"].map((param) => {
            const reading = currentReadings[param];
            const paramInfo = parameters.find((p) => p.key === param);
            if (!reading) return null;

            return (
              <div
                key={param}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-500">{paramInfo?.label}</span>
                  <div style={{ color: paramInfo?.color }}>
                    {getParameterIcon(param)}
                  </div>
                </div>
                <div className="flex items-end gap-2">
                  <span className="text-3xl font-bold text-gray-900">
                    {reading.value}
                  </span>
                  <span className="text-sm text-gray-400 mb-1">
                    {paramInfo?.unit}
                  </span>
                </div>
                <p className="text-xs text-gray-400 mt-2">
                  Updated {new Date(reading.recorded_at).toLocaleTimeString()}
                </p>
              </div>
            );
          })}
        </div>

        {/* All Current Readings Grid */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
          <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-sky-600" />
            Current Readings
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
            {parameters.slice(1).map((param) => {
              const reading = currentReadings[param.key];
              return (
                <div
                  key={param.key}
                  className={`p-4 rounded-xl border ${
                    reading ? "bg-gray-50 border-gray-100" : "bg-gray-50/50 border-gray-100/50"
                  }`}
                >
                  <p className="text-xs text-gray-400 uppercase tracking-wide">
                    {param.label}
                  </p>
                  <p
                    className={`text-xl font-bold mt-1 ${
                      reading ? "text-gray-800" : "text-gray-300"
                    }`}
                  >
                    {reading ? reading.value : "-"}
                  </p>
                  <p className="text-xs text-gray-400">{param.unit}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Charts Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-sky-600" />
              Historical Trends
            </h2>
            <div className="flex flex-wrap gap-3">
              {/* Period Selector */}
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-sky-400 outline-none bg-white"
              >
                {periods.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </select>

              {/* Parameter Selector */}
              <select
                value={selectedParameter}
                onChange={(e) => setSelectedParameter(e.target.value)}
                className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-sky-400 outline-none bg-white"
              >
                {parameters.map((p) => (
                  <option key={p.key} value={p.key}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Chart */}
          <div className="h-80 w-full">
            {historyData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={historyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis
                    dataKey="time"
                    stroke="#9ca3af"
                    fontSize={12}
                    tickLine={false}
                  />
                  <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "8px",
                      border: "none",
                      boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
                    }}
                  />
                  <Legend />
                  {selectedParameter === "all" ? (
                    // Show all parameters
                    parameters.slice(1, 5).map((param) => (
                      <Line
                        key={param.key}
                        type="monotone"
                        dataKey={param.key}
                        stroke={param.color}
                        strokeWidth={2}
                        dot={false}
                        name={param.label}
                      />
                    ))
                  ) : (
                    // Show single parameter with area fill
                    <>
                      <defs>
                        <linearGradient
                          id={`gradient-${selectedParameter}`}
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor={
                              parameters.find((p) => p.key === selectedParameter)?.color
                            }
                            stopOpacity={0.3}
                          />
                          <stop
                            offset="95%"
                            stopColor={
                              parameters.find((p) => p.key === selectedParameter)?.color
                            }
                            stopOpacity={0}
                          />
                        </linearGradient>
                      </defs>
                      <Area
                        type="monotone"
                        dataKey={selectedParameter}
                        stroke={
                          parameters.find((p) => p.key === selectedParameter)?.color
                        }
                        fillOpacity={1}
                        fill={`url(#gradient-${selectedParameter})`}
                        strokeWidth={2}
                        name={
                          parameters.find((p) => p.key === selectedParameter)?.label
                        }
                      />
                    </>
                  )}
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400">
                <div className="text-center">
                  <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No historical data available for selected period</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Station Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">
              Station Information
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-500">Station ID</span>
                <span className="font-medium">#{station.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Location</span>
                <span className="font-medium">{station.location}</span>
              </div>
              {station.region && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Region</span>
                  <span className="font-medium">{station.region}</span>
                </div>
              )}
              {station.state && (
                <div className="flex justify-between">
                  <span className="text-gray-500">State</span>
                  <span className="font-medium">{station.state}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-500">Coordinates</span>
                <span className="font-medium">
                  {parseFloat(station.latitude).toFixed(4)},{" "}
                  {parseFloat(station.longitude).toFixed(4)}
                </span>
              </div>
              {station.managed_by && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Managed By</span>
                  <span className="font-medium">{station.managed_by}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-500">Created</span>
                <span className="font-medium">
                  {new Date(station.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
               
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">
              Water Quality Standards (WHO)
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center py-2 border-b border-gray-50">
                <span className="text-gray-600">pH Level</span>
                <span className="font-medium text-green-600">6.5 - 8.5</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-50">
                <span className="text-gray-600">Turbidity</span>
                <span className="font-medium text-green-600">&lt; 5 NTU</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-50">
                <span className="text-gray-600">Dissolved Oxygen</span>
                <span className="font-medium text-green-600">&gt; 5 mg/L</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-50">
                <span className="text-gray-600">Arsenic</span>
                <span className="font-medium text-green-600">&lt; 0.01 mg/L</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-50">
                <span className="text-gray-600">Lead</span>
                <span className="font-medium text-green-600">&lt; 0.01 mg/L</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-600">E.Coli</span>
                <span className="font-medium text-green-600">0 CFU/100mL</span>
              </div>
            </div>
          </div>
        </div>
        
      </div>
    </div>
  );
};

export default StationReadings;




// import { useState, useEffect } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import {
//   LineChart,
//   Line,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   Tooltip,
//   ResponsiveContainer,
//   AreaChart,
//   Area,
// } from "recharts";
// import {
//   ArrowLeft,
//   MapPin,
//   Activity,
//   Calendar,
//   Download,
//   Droplets,
//   Thermometer,
//   Wind,
//   AlertCircle,
//   Clock,
//   TrendingUp,
//   FileText,
//   Plus,
//   Flag,
//   Handshake,
//   Info,
// } from "lucide-react";

// const StationReadings = () => {
//   const { id } = useParams();
//   const navigate = useNavigate();
//   const [station, setStation] = useState(null);
//   const [currentReadings, setCurrentReadings] = useState({});
//   const [historyData, setHistoryData] = useState([]);
//   const [selectedPeriod, setSelectedPeriod] = useState("daily");
//   const [loading, setLoading] = useState(true);
//   const [wqi, setWqi] = useState(null);
//   const [status, setStatus] = useState("Unknown");
//   const [userRole, setUserRole] = useState("");

//   // Role-based permissions
//   const canAddReading = ["ngo", "authority", "admin"].includes(userRole);

//   const periods = [
//     { value: "hourly", label: "Hourly (24H)" },
//     { value: "daily", label: "Daily (7 Days)" },
//     { value: "weekly", label: "Weekly (4 Weeks)" },
//     { value: "monthly", label: "Monthly (1 Year)" },
//     { value: "yearly", label: "Yearly (5 Years)" },
//   ];

//   const parameters = [
//     { key: "pH", label: "pH Level", color: "#fbbf24", unit: "", min: 6.5, max: 8.5 },
//     { key: "turbidity", label: "Turbidity", color: "#fbbf24", unit: "NTU", min: 0, max: 5 },
//     { key: "temperature", label: "Temperature", color: "#fbbf24", unit: "°C", min: 10, max: 30 },
//     { key: "DO", label: "Dissolved Oxygen", color: "#60a5fa", unit: "mg/L", min: 5, max: 15 },
//     { key: "arsenic", label: "Arsenic", color: "#f87171", unit: "mg/L", min: 0, max: 0.01 },
//     { key: "lead", label: "Lead", color: "#f87171", unit: "mg/L", min: 0, max: 0.01 },
//     { key: "iron", label: "Iron", color: "#fbbf24", unit: "mg/L", min: 0, max: 0.3 },
//     { key: "e_coli", label: "E.Coli", color: "#f87171", unit: "CFU/100mL", min: 0, max: 0 },
//   ];

//   useEffect(() => {
//     const role = localStorage.getItem("userRole") || "";
//     setUserRole(role);
//     fetchStationData();
//   }, [id]);

//   useEffect(() => {
//     if (station) {
//       fetchHistoryData();
//     }
//   }, [station, selectedPeriod]);

//   const fetchStationData = async () => {
//     try {
//       const token = localStorage.getItem("token");
//       const response = await fetch(
//         `${API_BASE_URL}/api/stations/${id}/current`,
//         {
//           headers: { Authorization: `Bearer ${token}` },
//         }
//       );

//       if (response.ok) {
//         const data = await response.json();
//         setStation(data.station);
//         setCurrentReadings(data.current_readings);
//         setWqi(data.wqi);
//         setStatus(data.status);
//       }
//     } catch (error) {
//       console.error("Error fetching station data:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const fetchHistoryData = async () => {
//     try {
//       const token = localStorage.getItem("token");
//       const response = await fetch(
//         `${API_BASE_URL}/api/stations/${id}/readings/history?period=${selectedPeriod}`,
//         {
//           headers: { Authorization: `Bearer ${token}` },
//         }
//       );

//       if (response.ok) {
//         const data = await response.json();
//         const chartData = transformDataForChart(data.readings);
//         setHistoryData(chartData);
//       }
//     } catch (error) {
//       console.error("Error fetching history:", error);
//     }
//   };

//   const transformDataForChart = (readings) => {
//     const grouped = {};
//     readings.forEach((r) => {
//       const time = new Date(r.recorded_at).toLocaleDateString();
//       if (!grouped[time]) {
//         grouped[time] = { time };
//       }
//       grouped[time][r.parameter] = parseFloat(r.value);
//     });
//     return Object.values(grouped);
//   };

//   const getStatusColor = (status) => {
//     switch (status) {
//       case "Excellent":
//         return "bg-green-500";
//       case "Good":
//         return "bg-blue-500";
//       case "Fair":
//         return "bg-amber-500";
//       case "Poor":
//         return "bg-red-500";
//       default:
//         return "bg-gray-500";
//     }
//   };

//   const getStatusTextColor = (status) => {
//     switch (status) {
//       case "Excellent":
//         return "text-green-400";
//       case "Good":
//         return "text-blue-400";
//       case "Fair":
//         return "text-amber-400";
//       case "Poor":
//         return "text-red-400";
//       default:
//         return "text-gray-400";
//     }
//   };

//   // Check if parameter value is within safe range
//   const getParameterStatus = (paramKey, value) => {
//     const param = parameters.find(p => p.key === paramKey);
//     if (!param || !value) return "unknown";
    
//     const numValue = parseFloat(value);
//     if (paramKey === "pH") {
//       if (numValue >= 6.5 && numValue <= 8.5) return "safe";
//       return "unsafe";
//     }
//     if (paramKey === "turbidity") {
//       if (numValue <= 5) return "safe";
//       return "unsafe";
//     }
//     if (paramKey === "DO") {
//       if (numValue >= 5) return "safe";
//       return "unsafe";
//     }
//     if (["arsenic", "lead", "e_coli"].includes(paramKey)) {
//       if (numValue <= param.max) return "safe";
//       return "unsafe";
//     }
//     return "safe";
//   };

//   const getParameterBadge = (paramKey, value) => {
//     const status = getParameterStatus(paramKey, value);
//     if (status === "safe") {
//       return (
//         <span className="px-3 py-1 bg-yellow-400/20 text-yellow-400 rounded-full text-xs font-medium">
//           Safe
//         </span>
//       );
//     }
//     if (status === "unsafe") {
//       return (
//         <span className="px-3 py-1 bg-red-500/20 text-red-400 rounded-full text-xs font-medium">
//           Unsafe
//         </span>
//       );
//     }
//     return null;
//   };

//   const downloadCSV = () => {
//     const headers = "Time,Parameter,Value\n";
//     const rows = historyData
//       .map((d) => {
//         return Object.keys(d)
//           .filter((k) => k !== "time")
//           .map((param) => `${d.time},${param},${d[param]}`)
//           .join("\n");
//       })
//       .join("\n");

//     const blob = new Blob([headers + rows], { type: "text/csv" });
//     const url = window.URL.createObjectURL(blob);
//     const a = document.createElement("a");
//     a.href = url;
//     a.download = `station_${id}_readings_${selectedPeriod}.csv`;
//     a.click();
//   };

//   const getParameterIcon = (param) => {
//     switch (param) {
//       case "pH":
//         return <Droplets className="w-4 h-4" />;
//       case "temperature":
//         return <Thermometer className="w-4 h-4" />;
//       case "DO":
//         return <Wind className="w-4 h-4" />;
//       default:
//         return <Activity className="w-4 h-4" />;
//     }
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-gray-900">
//         <div className="text-yellow-400 text-xl font-semibold">
//           Loading station data...
//         </div>
//       </div>
//     );
//   }

//   if (!station) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-gray-900">
//         <div className="text-center">
//           <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
//           <h2 className="text-2xl font-bold text-white">Station Not Found</h2>
//           <p className="text-gray-400 mt-2">
//             The requested station could not be found.
//           </p>
//           <button
//             onClick={() => navigate("/map")}
//             className="mt-4 bg-yellow-400 text-gray-900 px-6 py-2 rounded-lg hover:bg-yellow-500 transition-colors font-semibold"
//           >
//             Back to Map
//           </button>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gray-900">
//       {/* Header */}
//       <div className="bg-gray-800 border-b border-gray-700 sticky top-0 z-10">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="py-4 flex items-center justify-between">
//             <div className="flex items-center gap-4">
//               <button
//                 onClick={() => navigate("/map")}
//                 className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
//               >
//                 <ArrowLeft className="w-5 h-5 text-gray-400" />
//               </button>
//               <div>
//                 <h1 className="text-2xl font-bold text-white">
//                   {station.name}
//                 </h1>
//                 <p className="text-sm text-gray-400 flex items-center gap-1">
//                   <MapPin className="w-3 h-3" />
//                   {station.location}
//                   {station.managed_by && (
//                     <span className="ml-2">| Managed by: {station.managed_by}</span>
//                   )}
//                 </p>
//               </div>
//             </div>
//             <div className="flex items-center gap-3">
//               <button
//                 onClick={downloadCSV}
//                 className="flex items-center gap-2 px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors"
//               >
//                 <Download className="w-4 h-4" />
//                 Export CSV
//               </button>
//               {canAddReading && (
//                 <button
//                   onClick={() => navigate(`/station/${id}/add-reading`)}
//                   className="flex items-center gap-2 px-4 py-2 bg-yellow-400 text-gray-900 rounded-lg hover:bg-yellow-500 transition-colors font-semibold"
//                 >
//                   <Plus className="w-4 h-4" />
//                   Add Reading
//                 </button>
//               )}
//             </div>
//           </div>
//         </div>
//       </div>

//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
//         {/* Station Info Card - Matching reference */}
//         <div className="bg-gray-800 rounded-2xl shadow-lg border border-gray-700 p-6 mb-6">
//           <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
//             <div>
//               <p className="text-sm text-gray-400 mb-1">Station ID</p>
//               <p className="text-lg font-semibold text-white">WW-S-{station.id.toString().padStart(4, '0')}</p>
//             </div>
//             <div>
//               <p className="text-sm text-gray-400 mb-1">Location</p>
//               <p className="text-lg font-semibold text-white flex items-center gap-1">
//                 <MapPin className="w-4 h-4 text-yellow-400" />
//                 {station.location}
//               </p>
//             </div>
//             <div>
//               <p className="text-sm text-gray-400 mb-1">Managed By</p>
//               <p className="text-lg font-semibold text-white">{station.managed_by || "WaterWatch Org"}</p>
//             </div>
//             <div>
//               <p className="text-sm text-gray-400 mb-1">Last Update</p>
//               <p className="text-lg font-semibold text-white">{new Date().toLocaleString()}</p>
//             </div>
//           </div>
//         </div>

//         {/* Parameter Badges - Matching reference */}
//         <div className="flex flex-wrap gap-3 mb-6">
//           {parameters.slice(0, 5).map((param) => {
//             const reading = currentReadings[param.key];
//             if (!reading) return null;
//             const status = getParameterStatus(param.key, reading.value);
            
//             return (
//               <div
//                 key={param.key}
//                 className={`flex items-center gap-2 px-4 py-2 rounded-full ${
//                   status === "unsafe" 
//                     ? "bg-red-500/20 text-red-400" 
//                     : "bg-yellow-400/20 text-yellow-400"
//                 }`}
//               >
//                 {getParameterIcon(param.key)}
//                 <span className="font-medium">
//                   {param.label}: {reading.value} {param.unit}
//                 </span>
//               </div>
//             );
//           })}
//         </div>

//         {/* Latest Readings Section - Matching reference */}
//         <div className="bg-gray-800 rounded-2xl shadow-lg border border-gray-700 p-6 mb-6">
//           <h2 className="text-lg font-bold text-white mb-4">
//             Latest Readings
//           </h2>
//           <div className="space-y-3">
//             {parameters.map((param) => {
//               const reading = currentReadings[param.key];
//               if (!reading) return null;
              
//               return (
//                 <div
//                   key={param.key}
//                   className="flex items-center justify-between py-3 border-b border-gray-700 last:border-0"
//                 >
//                   <span className="text-gray-300">{param.label}</span>
//                   <div className="flex items-center gap-3">
//                     <span className={`font-semibold ${
//                       getParameterStatus(param.key, reading.value) === "unsafe" 
//                         ? "text-red-400" 
//                         : "text-yellow-400"
//                     }`}>
//                       {reading.value} {param.unit}
//                     </span>
//                     {getParameterBadge(param.key, reading.value)}
//                   </div>
//                 </div>
//               );
//             })}
//           </div>
//         </div>

//         {/* Historical Chart - Matching reference */}
//         <div className="bg-gray-800 rounded-2xl shadow-lg border border-gray-700 p-6 mb-6">
//           <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
//             <h2 className="text-lg font-bold text-white flex items-center gap-2">
//               <TrendingUp className="w-5 h-5 text-yellow-400" />
//               Historical pH Trend (Last 7 Days)
//             </h2>
//             <select
//               value={selectedPeriod}
//               onChange={(e) => setSelectedPeriod(e.target.value)}
//               className="px-4 py-2 bg-gray-900 border border-gray-600 rounded-lg text-sm text-white focus:ring-2 focus:ring-yellow-400 outline-none"
//             >
//               {periods.map((p) => (
//                 <option key={p.value} value={p.value}>
//                   {p.label}
//                 </option>
//               ))}
//             </select>
//           </div>

//           <div className="h-64 w-full">
//             {historyData.length > 0 ? (
//               <ResponsiveContainer width="100%" height="100%">
//                 <AreaChart data={historyData}>
//                   <defs>
//                     <linearGradient id="colorPh" x1="0" y1="0" x2="0" y2="1">
//                       <stop offset="5%" stopColor="#fbbf24" stopOpacity={0.3}/>
//                       <stop offset="95%" stopColor="#fbbf24" stopOpacity={0}/>
//                     </linearGradient>
//                   </defs>
//                   <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
//                   <XAxis
//                     dataKey="time"
//                     stroke="#6b7280"
//                     fontSize={12}
//                     tickLine={false}
//                   />
//                   <YAxis stroke="#6b7280" fontSize={12} tickLine={false} domain={[6.8, 7.4]} />
//                   <Tooltip
//                     contentStyle={{
//                       backgroundColor: "#1f2937",
//                       borderRadius: "8px",
//                       border: "1px solid #374151",
//                       color: "#fff",
//                     }}
//                   />
//                   <Area
//                     type="monotone"
//                     dataKey="pH"
//                     stroke="#fbbf24"
//                     fillOpacity={1}
//                     fill="url(#colorPh)"
//                     strokeWidth={2}
//                   />
//                 </AreaChart>
//               </ResponsiveContainer>
//             ) : (
//               <div className="h-full flex items-center justify-center text-gray-500">
//                 <div className="text-center">
//                   <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
//                   <p>No historical data available</p>
//                 </div>
//               </div>
//             )}
//           </div>
//         </div>

//         {/* Action Buttons - Matching reference */}
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//           <button
//             onClick={() => navigate("/reports")}
//             className="flex items-center justify-center gap-2 px-6 py-4 bg-yellow-400 text-gray-900 rounded-xl font-semibold hover:bg-yellow-500 transition-colors"
//           >
//             <Flag className="w-5 h-5" />
//             Report an Issue
//           </button>
//           <button
//             onClick={() => {}}
//             className="flex items-center justify-center gap-2 px-6 py-4 bg-gray-800 border border-gray-600 text-white rounded-xl font-semibold hover:bg-gray-700 transition-colors"
//           >
//             <Handshake className="w-5 h-5" />
//             Request Collaboration
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default StationReadings;
