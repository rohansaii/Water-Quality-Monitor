import { API_BASE_URL } from '../config';
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, ReferenceLine
} from "recharts";
import {
  LayoutDashboard, MapPin, Search, FileText, User, LogOut,
  Droplets, AlertTriangle, AlertCircle, Bell, Activity, TrendingUp,
  Zap, ArrowRight, Info
} from "lucide-react";

/* ── Shared Sidebar Nav Config ────────────────────────────────── */
const NAV = [
  { icon: LayoutDashboard, label: "Dashboard",       path: "/dashboard" },
  { icon: MapPin,          label: "Live Map View",   path: "/map" },
  { icon: AlertTriangle,   label: "System Alerts",   path: "/alerts" },
  { icon: AlertCircle, label: "Alert History", path: "/alert-history" },
  { icon: Bell, label: "Auto Alerts", path: "/auto-alerts" },
  { icon: Search,          label: "Search Stations", path: "/search" },
  { icon: FileText,        label: "My Reports",      path: "/reports" },
  { icon: User,            label: "Profile",         path: "/profile" },
];

const ROLE_BADGE = {
  admin:     "bg-red-100 text-red-700",
  authority: "bg-purple-100 text-purple-700",
  ngo:       "bg-blue-100 text-blue-700",
  citizen:   "bg-green-100 text-green-700",
};

/* ── Stat Card ────────────────────────────────────────────────── */
const StatCard = ({ icon: Icon, label, value, sub, accentClass, iconBg }) => (
  <div className={`wqm-stat-card border-l-4 ${accentClass}`}>
    <div className="flex items-center gap-4">
      <div className={`p-3 rounded-2xl ${iconBg}`}>
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">{label}</p>
        <p className="text-3xl font-black text-slate-800">{value}</p>
        {sub && <p className="text-[11px] text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  </div>
);

/* ── Custom Tooltip ───────────────────────────────────────────── */
const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-sky-100 rounded-xl px-4 py-3 shadow-lg text-sm">
      <p className="font-bold text-sky-900">{payload[0]?.payload?.fullName}</p>
      <p className="text-sky-600 font-semibold">WQI: {payload[0]?.value}</p>
    </div>
  );
};

/* ── Dashboard ────────────────────────────────────────────────── */
const Dashboard = () => {
  const navigate = useNavigate();
  const [stations, setStations]   = useState([]);
  const [alerts, setAlerts]       = useState([]);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [country, setCountry]     = useState("India");
  const [stateCode, setStateCode] = useState("CA");
  
  // Predictive Simulation State
  const [simStation, setSimStation] = useState("");
  const [simParam, setSimParam]     = useState("pH");
  const [simValue, setSimValue]     = useState("");
  const [prediction, setPrediction] = useState(null);
  const [simHistory, setSimHistory] = useState([]);
  const [simLoading, setSimLoading] = useState(false);

  const userName = localStorage.getItem("userName") || "User";
  const userRole = localStorage.getItem("userRole") || "citizen";

  useEffect(() => { fetchDashboardData(); }, [country, stateCode]);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem("token");
      let url = `${API_BASE_URL}/api/stations?country=${country}`;
      if (country === "USA") url += `&state=${stateCode}`;

      const [stationsRes, alertsRes] = await Promise.all([
        fetch(url,                              { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_BASE_URL}/api/alerts`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      let stationsData = [];
      if (stationsRes.ok) { stationsData = await stationsRes.json(); setStations(stationsData || []); }
      if (alertsRes.ok)   { const d = await alertsRes.json(); setAlerts(d || []); }

      if (stationsData.length > 0) {
        setChartData(
          [...stationsData]
            .sort((a, b) => (b.wqi || 0) - (a.wqi || 0))
            .slice(0, 10)
            .map((s, i) => ({
              shortName: `S${i + 1}`,
              fullName:  s.name || s.station_name || `Station ${i + 1}`,
              wqi:       Number(s.wqi) || 0,
            }))
        );
      }
    } catch (err) {
      console.error("Dashboard Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSimulate = async (e) => {
    e.preventDefault();
    if (!simStation || !simValue) return;
    
    setSimLoading(true);
    try {
      const token = localStorage.getItem("token");
      
      // 1. Fetch some history for the chart context
      const histRes = await fetch(`${API_BASE_URL}/api/stations/${simStation}/readings/history?period=daily&parameter=${simParam}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      let historyPoints = [];
      if (histRes.ok) {
        const hData = await histRes.json();
        historyPoints = (hData.readings || []).slice(-5).map(r => ({
          time: new Date(r.recorded_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          value: parseFloat(r.value),
          type: 'actual'
        }));
      }

      // 2. Submit new reading and get prediction
      const res = await fetch(`${API_BASE_URL}/api/stations/${simStation}/readings`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ parameter: simParam, value: parseFloat(simValue) })
      });
      
      if (res.ok) {
        const data = await res.json();
        setPrediction(data);
        
        // Prepare chart data: history + current + predicted
        const currentPoint = {
          time: "Now",
          value: parseFloat(data.current_value),
          type: 'actual'
        };
        const predictedPoint = {
          time: "+1H",
          predicted: parseFloat(data.predicted_value),
          type: 'predicted'
        };
        
        // Combine history + current (actual line) and predicted (dashed line)
        // For Recharts to show a dashed segment, we often need two lines or a specific data structure.
        // We'll use two Lines: one for 'value' and one for 'predicted'.
        // The last 'actual' point must also have a 'predicted' value for the line to connect.
        const lastActual = { ...currentPoint, predicted: currentPoint.value };
        setSimHistory([...historyPoints, lastActual, predictedPoint]);
      }
    } catch (err) {
      console.error("Simulation Error:", err);
    } finally {
      setSimLoading(false);
    }
  };

  const averageWQI    = stations.length > 0
    ? Math.round(stations.reduce((s, x) => s + (x.wqi || 0), 0) / stations.length)
    : 0;
  const excellentCount = stations.filter(s => (s.wqi || 0) > 90).length;
  const attentionCount = stations.filter(s => (s.wqi || 0) < 75).length;
  const activeAlerts   = alerts.filter(a => a.is_resolved === false).length;

  const getWQIStatus = (wqi) => {
    if (wqi > 90) return { label: "Excellent", color: "#16a34a", textColor: "text-green-600" };
    if (wqi >= 75) return { label: "Good",     color: "#0284c7", textColor: "text-sky-600"   };
    if (wqi >= 50) return { label: "Fair",     color: "#d97706", textColor: "text-amber-600" };
    return               { label: "Poor",      color: "#dc2626", textColor: "text-red-600"   };
  };
  const wqiInfo      = getWQIStatus(averageWQI);
  const circleOffset = 502 - (averageWQI / 100) * 502;

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-sky-50 flex-col gap-4">
        <div className="relative">
          <div className="w-16 h-16 rounded-full border-4 border-sky-100 border-t-sky-500 animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Droplets className="w-6 h-6 text-sky-500" />
          </div>
        </div>
        <p className="text-sky-600 font-semibold text-sm animate-pulse">Loading Dashboard…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-sky-50 text-slate-800 font-sans">

      {/* Sidebar */}
      <aside className="w-64 bg-sky-600 text-white flex flex-col p-5 shadow-xl shrink-0">
        <h2 className="text-2xl font-black mb-8 italic flex items-center gap-2 px-1">
          <Droplets className="w-6 h-6" /> WQM
        </h2>

        {/* Session Box */}
        <div className="mb-6 p-4 bg-sky-700/50 rounded-2xl border border-sky-400/30 relative overflow-hidden">
          <div className="absolute -top-6 -right-6 w-20 h-20 bg-sky-500/30 rounded-full" />
          <p className="text-[10px] uppercase tracking-widest text-sky-200 mb-1">Session</p>
          <p className="font-bold text-base leading-tight">{userName}</p>
          <span className={`mt-2 inline-block text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${ROLE_BADGE[userRole] || ROLE_BADGE.citizen}`}>
            {userRole}
          </span>
        </div>

        <nav className="flex-1 space-y-1">
          {NAV.map(({ icon: Icon, label, path }) => (
            <button
              key={path}
              onClick={() => navigate(path)}
              className={path === "/dashboard" ? "wqm-sidebar-active w-full text-left" : "wqm-sidebar-item w-full text-left"}
            >
              <Icon className="w-4 h-4" /> {label}
            </button>
          ))}
        </nav>

        <button
          onClick={() => { localStorage.clear(); navigate("/"); }}
          className="mt-4 bg-white/10 hover:bg-white/20 text-white border border-white/20 py-2.5 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2 text-sm"
        >
          <LogOut className="w-4 h-4" /> Logout
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">

        {/* Header */}
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-black text-sky-900">System Overview</h1>
            <p className="text-sky-500 text-sm font-medium mt-0.5">
              Welcome back, <span className="font-bold text-sky-700">{userName}</span> · Water Quality Monitoring
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="bg-sky-100 text-sky-700 px-4 py-1.5 rounded-full text-sm font-bold border border-sky-200">
              {stations.length} Stations
            </span>
            {activeAlerts > 0 && (
              <span className="bg-red-100 text-red-600 px-4 py-1.5 rounded-full text-sm font-bold border border-red-200 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" /> {activeAlerts} Alerts
              </span>
            )}
          </div>
        </header>

        {/* Country / State Filters */}
        <div className="flex gap-3 mb-7">
          <select
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            className="wqm-input w-auto py-2 text-sm"
          >
            <option value="India">🇮🇳 India</option>
            <option value="USA">🇺🇸 USA</option>
          </select>
          {country === "USA" && (
            <select
              value={stateCode}
              onChange={(e) => setStateCode(e.target.value)}
              className="wqm-input w-auto py-2 text-sm"
            >
              {["CA", "TX", "NY", "FL", "WA"].map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-8">
          <StatCard
            icon={MapPin}       label="Total Stations"    value={stations.length}
            sub="Across all regions" accentClass="border-sky-400"
            iconBg="bg-sky-100 text-sky-600"
          />
          <StatCard
            icon={Activity}     label="Excellent Quality"  value={excellentCount}
            sub="WQI > 90"      accentClass="border-green-400"
            iconBg="bg-green-100 text-green-600"
          />
          <StatCard
            icon={TrendingUp}   label="Needs Attention"   value={attentionCount}
            sub="WQI < 75"      accentClass="border-amber-400"
            iconBg="bg-amber-100 text-amber-600"
          />
          <StatCard
            icon={AlertCircle}  label="Active Alerts"     value={activeAlerts}
            sub="Unresolved"    accentClass="border-red-400"
            iconBg="bg-red-100 text-red-600"
          />
        </div>

        {/* Chart + WQI Gauge */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-7">

          {/* Bar Chart */}
          <div className="lg:col-span-2 wqm-card-lg p-7 hover:shadow-lg transition-all duration-200">
            <h2 className="text-lg font-bold text-sky-900 mb-1 italic">Top 10 Stations by WQI</h2>
            <p className="text-xs text-gray-400 mb-5">{country}{country === "USA" ? ` · ${stateCode}` : ""}</p>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData} barCategoryGap="30%">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f9ff" />
                <XAxis dataKey="shortName" stroke="#0ea5e9" fontSize={12} />
                <YAxis domain={[0, 100]} stroke="#0ea5e9" fontSize={12} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(14,165,233,0.06)" }} />
                <Legend />
                <Bar dataKey="wqi" fill="#0284c7" radius={[8, 8, 0, 0]} name="WQI" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* WQI Gauge */}
          <div className="wqm-card-lg p-7 flex flex-col items-center justify-center hover:shadow-lg transition-all duration-200">
            <h2 className="text-lg font-bold text-sky-900 mb-1 self-start italic">Average WQI</h2>
            <p className="text-xs text-gray-400 mb-6 self-start">All monitored stations</p>

            <div className="relative flex items-center justify-center">
              <svg className="w-44 h-44 rotate-[-90deg]">
                <circle cx="88" cy="88" r="74" stroke="#f0f9ff" strokeWidth="14" fill="transparent" />
                <circle
                  cx="88" cy="88" r="74"
                  stroke={wqiInfo.color}
                  strokeWidth="14"
                  fill="transparent"
                  strokeDasharray="465"
                  strokeDashoffset={465 - (averageWQI / 100) * 465}
                  strokeLinecap="round"
                  style={{ transition: "stroke-dashoffset 1s ease, stroke 0.5s ease" }}
                />
              </svg>
              <div className="absolute text-center">
                <span className="text-5xl font-black text-slate-800">{averageWQI}</span>
                <p className="text-xs text-gray-400 font-medium">/ 100</p>
              </div>
            </div>

            <p className={`mt-4 text-sm font-black tracking-widest uppercase ${wqiInfo.textColor}`}>
              {wqiInfo.label}
            </p>
            <div className="mt-4 w-full space-y-2">
              {[
                { label: "Excellent", range: "> 90", color: "bg-green-400", active: averageWQI > 90 },
                { label: "Good",      range: "75–90", color: "bg-sky-400",  active: averageWQI >= 75 && averageWQI <= 90 },
                { label: "Fair",      range: "50–74", color: "bg-amber-400",active: averageWQI >= 50 && averageWQI < 75 },
                { label: "Poor",      range: "< 50",  color: "bg-red-400",  active: averageWQI < 50 },
              ].map(b => (
                <div key={b.label}
                  className={`flex items-center justify-between text-xs px-3 py-1.5 rounded-lg transition-all ${b.active ? "bg-sky-50 font-bold text-sky-900" : "text-gray-400"}`}>
                  <span className="flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${b.color}`} />
                    {b.label}
                  </span>
                  <span>{b.range}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Predictive Analytics Section */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-7">
          
          {/* Simulation Form */}
          <div className="wqm-card-lg p-7 bg-gradient-to-br from-white to-sky-50 shadow-inner">
            <h2 className="text-xl font-black text-sky-900 mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-500 fill-amber-500" />
              Predictive Simulation
            </h2>
            <p className="text-sm text-slate-500 mb-6">Estimate future water quality trends using ML models.</p>
            
            <form onSubmit={handleSimulate} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-sky-700 uppercase mb-1.5 ml-1">Select Station</label>
                <select 
                  value={simStation}
                  onChange={(e) => setSimStation(e.target.value)}
                  className="wqm-input w-full bg-white shadow-sm"
                  required
                >
                  <option value="">Choose a station...</option>
                  {stations.map(s => (
                    <option key={s.id} value={s.id}>{s.name || s.station_name}</option>
                  ))}
                </select>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-sky-700 uppercase mb-1.5 ml-1">Parameter</label>
                  <select 
                    value={simParam}
                    onChange={(e) => setSimParam(e.target.value)}
                    className="wqm-input w-full bg-white shadow-sm"
                  >
                    <option value="pH">pH</option>
                    <option value="turbidity">Turbidity</option>
                    <option value="temperature">Temperature</option>
                    <option value="DO">Dissolved Oxygen</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-sky-700 uppercase mb-1.5 ml-1">Value</label>
                  <input 
                    type="number" step="0.01"
                    value={simValue}
                    onChange={(e) => setSimValue(e.target.value)}
                    placeholder="Enter reading"
                    className="wqm-input w-full bg-white shadow-sm"
                    required
                  />
                </div>
              </div>
              
              <button 
                type="submit"
                disabled={simLoading}
                className="w-full bg-sky-600 hover:bg-sky-700 text-white font-bold py-3 rounded-2xl shadow-lg shadow-sky-200 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {simLoading ? "Calculating..." : "Run Prediction"}
                {!simLoading && <ArrowRight className="w-4 h-4" />}
              </button>
            </form>
          </div>

          {/* Prediction Results & Chart */}
          <div className="lg:col-span-2 wqm-card-lg p-0 relative overflow-hidden flex flex-col md:flex-row">
            {!prediction ? (
              <div className="flex-1 flex flex-col items-center justify-center p-12 text-center text-slate-400">
                <div className="w-16 h-16 bg-sky-50 rounded-full flex items-center justify-center mb-4">
                  <Activity className="w-8 h-8 opacity-30" />
                </div>
                <p className="font-bold">No Prediction Data</p>
                <p className="text-xs">Run a simulation to see forecasting results and trends.</p>
              </div>
            ) : (
              <>
                {/* Result Data */}
                <div className="md:w-1/3 p-7 bg-white border-r border-sky-50">
                  <h3 className="text-sm font-black text-sky-900 mb-6 uppercase tracking-widest border-b border-sky-100 pb-2">Forecasting Results</h3>
                  
                  <div className="space-y-6">
                    <div>
                      <p className="text-xs text-slate-400 font-bold uppercase">Current Reading</p>
                      <p className="text-2xl font-black text-slate-800">{prediction.current_value}</p>
                    </div>
                    
                    <div className="p-4 bg-sky-50 rounded-2xl border border-sky-100 relative">
                      <div className="absolute top-3 right-3">
                        <TrendingUp className={`w-5 h-5 ${parseFloat(prediction.predicted_value) > parseFloat(prediction.current_value) ? "text-amber-500" : "text-emerald-500"}`} />
                      </div>
                      <p className="text-xs text-sky-600 font-bold uppercase">Predicted (1H)</p>
                      <p className="text-3xl font-black text-sky-900">{prediction.predicted_value}</p>
                      <div className="mt-2 flex items-center gap-1.5">
                        <div className="text-[10px] font-bold bg-white px-2 py-0.5 rounded-full text-sky-700 shadow-sm border border-sky-100">
                          {prediction.confidence}% Confidence
                        </div>
                      </div>
                    </div>

                    {prediction.alert && (
                      <div className="p-3 bg-red-50 border border-red-100 rounded-xl flex gap-3 animate-pulse">
                        <AlertTriangle className="w-5 h-5 text-red-500 shrink-0" />
                        <p className="text-[11px] font-bold text-red-700 leading-tight">
                          {prediction.alert}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Result Chart */}
                <div className="flex-1 p-7 flex flex-col">
                  <div className="flex justify-between items-center mb-8">
                    <h3 className="text-sm font-bold text-sky-900 italic">Trend Analysis: {simParam}</h3>
                    <div className="flex gap-4">
                       <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400">
                         <div className="w-3 h-0.5 bg-sky-600"></div> Actual
                       </div>
                       <div className="flex items-center gap-2 text-[10px] font-bold text-sky-400">
                         <div className="w-3 h-0.5 border-t-2 border-sky-400 border-dashed"></div> Predicted
                       </div>
                    </div>
                  </div>
                  
                  <div className="flex-1 min-h-[220px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={simHistory}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f9ff" vertical={false} />
                        <XAxis dataKey="time" stroke="#bae6fd" fontSize={10} tick={{fill: '#94a3b8'}} />
                        <YAxis stroke="#bae6fd" fontSize={10} tick={{fill: '#94a3b8'}} hide />
                        <Tooltip 
                          content={({ active, payload }) => {
                            if (!active || !payload?.length) return null;
                            const isPred = payload[0].payload.type === 'predicted';
                            return (
                              <div className="bg-white border border-sky-100 rounded-xl px-3 py-2 shadow-xl text-[10px]">
                                <p className="font-bold text-sky-900 border-b border-sky-50 mb-1 pb-1">{payload[0].payload.time}</p>
                                <p className={`font-black ${isPred ? 'text-sky-500' : 'text-slate-800'}`}>
                                  Value: {isPred ? payload[0].payload.predicted : payload[0].value}
                                </p>
                                <p className="text-slate-400 italic">Source: {isPred ? 'ML Forecast' : 'Sensor'}</p>
                              </div>
                            );
                          }}
                        />
                        <Line type="monotone" dataKey="value" stroke="#0284c7" strokeWidth={3} dot={{ r: 4, fill: '#0284c7', strokeWidth: 2, stroke: '#fff' }} />
                        <Line type="monotone" dataKey="predicted" stroke="#38bdf8" strokeWidth={3} strokeDasharray="5 5" dot={{ r: 4, fill: '#fff', strokeWidth: 2, stroke: '#38bdf8' }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                  
                  <div className="mt-4 flex items-start gap-2 p-3 bg-sky-50/50 rounded-xl border border-sky-100/50">
                    <Info className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                    <p className="text-[10px] text-sky-600/70 leading-relaxed font-medium">
                      Prediction is based on a 1-hour lookahead using Linear Regression. Data points are normalized to the earliest recorded reading in the set.
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;