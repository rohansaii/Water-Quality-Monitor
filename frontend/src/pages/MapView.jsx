import { API_BASE_URL } from '../config';
// import { useState, useEffect, useMemo } from "react";
// import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
// import "leaflet/dist/leaflet.css";
// import { useNavigate } from "react-router-dom";
// import L from "leaflet";
// import { Search, Filter, MapPin, Navigation, Activity, Droplets } from "lucide-react";

// // Fix for missing marker icons
// import markerIcon from "leaflet/dist/images/marker-icon.png";
// import markerShadow from "leaflet/dist/images/marker-shadow.png";

// let DefaultIcon = L.icon({
//   iconUrl: markerIcon,
//   shadowUrl: markerShadow,
//   iconSize: [25, 41],
//   iconAnchor: [12, 41],
// });
// L.Marker.prototype.options.icon = DefaultIcon;

// // Custom colored markers based on water quality status
// const createColoredIcon = (color) => {
//   return L.divIcon({
//     className: "custom-marker",
//     html: `<div style="
//       background-color: ${color};
//       width: 20px;
//       height: 20px;
//       border-radius: 50%;
//       border: 3px solid white;
//       box-shadow: 0 2px 6px rgba(0,0,0,0.3);
//     "></div>`,
//     iconSize: [20, 20],
//     iconAnchor: [10, 10],
//   });
// };

// const getStatusColor = (status) => {
//   switch (status) {
//     case "Excellent":
//       return "#22c55e"; // green-500
//     case "Good":
//       return "#3b82f6"; // blue-500
//     case "Fair":
//       return "#f59e0b"; // amber-500
//     case "Poor":
//       return "#ef4444"; // red-500
//     default:
//       return "#6b7280"; // gray-500
//   }
// };

// // Component to fit map bounds to stations
// const MapBounds = ({ stations }) => {
//   const map = useMap();
//   useEffect(() => {
//     if (stations.length > 0) {
//       const validStations = stations.filter(s => 
//         s.latitude && s.longitude && 
//         !isNaN(parseFloat(s.latitude)) && !isNaN(parseFloat(s.longitude))
//       );
//       if (validStations.length > 0) {
//         const bounds = L.latLngBounds(
//           validStations.map(s => [parseFloat(s.latitude), parseFloat(s.longitude)])
//         );
//         map.fitBounds(bounds, { padding: [50, 50], maxZoom: 10 });
//       }
//     }
//   }, [map, stations]);
//   return null;
// };

// const MapView = () => {
//   const navigate = useNavigate();
//   const [stations, setStations] = useState([]);
//   const [filteredStations, setFilteredStations] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [searchQuery, setSearchQuery] = useState("");
//   const [selectedRegion, setSelectedRegion] = useState("");
//   const [selectedState, setSelectedState] = useState("");
//   const [showFilters, setShowFilters] = useState(false);
//   const [currentPage, setCurrentPage] = useState(0);
//   const [displayMode, setDisplayMode] = useState("paginated"); // "all" or "paginated"
//   const STATIONS_PER_PAGE = 500; // Show 500 markers at a time for performance

//   // Fetch stations from backend
//   useEffect(() => {
//     fetchStations();
//   }, []);

//   const fetchStations = async () => {
//     try {
//       const token = localStorage.getItem("token");
//       const response = await fetch(`${API_BASE_URL}/api/stations`, {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       });

//       if (response.ok) {
//         const data = await response.json();
//         console.log(`Loaded ${data.length} stations`);
        
//         // Validate station data and add default status
//         const validatedStations = data.map(station => ({
//           ...station,
//           status: station.status || "Unknown",
//           wqi: station.wqi || null,
//           // Ensure latitude and longitude are valid numbers
//           latitude: parseFloat(station.latitude) || 20.5937,
//           longitude: parseFloat(station.longitude) || 78.9629,
//         }));
        
//         setStations(validatedStations);
//         setFilteredStations(validatedStations);
//       } else {
//         console.error("Failed to fetch stations:", response.status);
//       }
//     } catch (error) {
//       console.error("Error fetching stations:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Filter stations
//   useEffect(() => {
//     let filtered = stations;

//     if (searchQuery) {
//       filtered = filtered.filter(
//         (s) =>
//           s.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
//           s.location?.toLowerCase().includes(searchQuery.toLowerCase())
//       );
//     }

//     if (selectedRegion) {
//       filtered = filtered.filter(
//         (s) => s.region?.toLowerCase() === selectedRegion.toLowerCase()
//       );
//     }

//     if (selectedState) {
//       filtered = filtered.filter(
//         (s) => s.state?.toLowerCase() === selectedState.toLowerCase()
//       );
//     }

//     setFilteredStations(filtered);
//     setCurrentPage(0); // Reset to first page when filters change
//   }, [searchQuery, selectedRegion, selectedState, stations]);

//   // Get paginated stations for map display
//   const paginatedStations = useMemo(() => {
//     if (displayMode === "all") {
//       return filteredStations;
//     }
//     const start = currentPage * STATIONS_PER_PAGE;
//     return filteredStations.slice(start, start + STATIONS_PER_PAGE);
//   }, [filteredStations, currentPage, displayMode]);

//   const totalPages = Math.ceil(filteredStations.length / STATIONS_PER_PAGE);

//   // Get unique regions and states
//   const regions = [...new Set(stations.map((s) => s.region).filter(Boolean))];
//   const states = [...new Set(stations.map((s) => s.state).filter(Boolean))];

//   // Calculate stats
//   const activeStations = stations.length;
//   const excellentStations = stations.filter((s) => s.status === "Excellent").length;
//   const poorStations = stations.filter((s) => s.status === "Poor").length;

//   const handleViewReadings = (stationId) => {
//     navigate(`/station/${stationId}/readings`);
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-sky-50">
//         <div className="text-sky-600 text-xl font-semibold">Loading stations...</div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen flex flex-col bg-sky-50">
//       {/* Header */}
//       <div className="bg-sky-600 text-white p-4 flex justify-between items-center shadow-md">
//         <div className="flex items-center gap-4">
//           <button
//             onClick={() => navigate("/dashboard")}
//             className="bg-white text-sky-600 px-4 py-1.5 rounded-lg font-bold shadow hover:bg-sky-50 transition-colors"
//           >
//             ← Back to Dashboard
//           </button>
//           <h2 className="text-xl font-bold font-sans flex items-center gap-2">
//             <MapPin className="w-5 h-5" />
//             Live Water Quality Map
//           </h2>
//         </div>
//         <div className="flex items-center gap-4">
//           <span className="text-sm opacity-80">
//             {activeStations} Active Stations
//           </span>
//         </div>
//       </div>

//       <div className="flex flex-1 overflow-hidden">
//         {/* Left Sidebar */}
//         <div className="w-80 bg-white border-r border-sky-100 flex flex-col overflow-hidden">
//           {/* Search Section */}
//           <div className="p-4 border-b border-sky-100">
//             <div className="relative">
//               <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
//               <input
//                 type="text"
//                 placeholder="Search stations..."
//                 value={searchQuery}
//                 onChange={(e) => setSearchQuery(e.target.value)}
//                 className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-sky-400 outline-none text-sm"
//               />
//             </div>
//             <button
//               onClick={() => setShowFilters(!showFilters)}
//               className="mt-2 flex items-center gap-2 text-sm text-sky-600 hover:text-sky-700"
//             >
//               <Filter className="w-4 h-4" />
//               {showFilters ? "Hide Filters" : "Show Filters"}
//             </button>

//             {showFilters && (
//               <div className="mt-3 space-y-2">
//                 <select
//                   value={selectedRegion}
//                   onChange={(e) => setSelectedRegion(e.target.value)}
//                   className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-sky-400 outline-none"
//                 >
//                   <option value="">All Regions</option>
//                   {regions.map((region) => (
//                     <option key={region} value={region}>
//                       {region}
//                     </option>
//                   ))}
//                 </select>
//                 <select
//                   value={selectedState}
//                   onChange={(e) => setSelectedState(e.target.value)}
//                   className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-sky-400 outline-none"
//                 >
//                   <option value="">All States</option>
//                   {states.map((state) => (
//                     <option key={state} value={state}>
//                       {state}
//                     </option>
//                   ))}
//                 </select>
//                 {(selectedRegion || selectedState) && (
//                   <button
//                     onClick={() => {
//                       setSelectedRegion("");
//                       setSelectedState("");
//                     }}
//                     className="text-xs text-red-500 hover:text-red-600"
//                   >
//                     Clear filters
//                   </button>
//                 )}
//               </div>
//             )}
//           </div>

//           {/* Stats Section */}
//           <div className="p-4 bg-sky-50 border-b border-sky-100">
//             <h3 className="font-bold text-sky-700 mb-3 text-sm uppercase tracking-wide">
//               Station Overview
//             </h3>
//             <div className="grid grid-cols-3 gap-2">
//               <div className="bg-white p-2 rounded-lg text-center shadow-sm">
//                 <p className="text-2xl font-bold text-sky-600">{activeStations}</p>
//                 <p className="text-xs text-gray-500">Total</p>
//               </div>
//               <div className="bg-white p-2 rounded-lg text-center shadow-sm">
//                 <p className="text-2xl font-bold text-green-500">{excellentStations}</p>
//                 <p className="text-xs text-gray-500">Excellent</p>
//               </div>
//               <div className="bg-white p-2 rounded-lg text-center shadow-sm">
//                 <p className="text-2xl font-bold text-red-500">{poorStations}</p>
//                 <p className="text-xs text-gray-500">Poor</p>
//               </div>
//             </div>
//           </div>

//           {/* Legend */}
//           <div className="p-4 border-b border-sky-100">
//             <h3 className="font-bold text-sky-700 mb-3 text-sm uppercase tracking-wide">
//               Map Legend
//             </h3>
//             <ul className="space-y-2 text-sm">
//               <li className="flex items-center gap-2">
//                 <span className="w-3 h-3 bg-green-500 rounded-full"></span>
//                 <span>Excellent Quality</span>
//               </li>
//               <li className="flex items-center gap-2">
//                 <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
//                 <span>Good Quality</span>
//               </li>
//               <li className="flex items-center gap-2">
//                 <span className="w-3 h-3 bg-amber-500 rounded-full"></span>
//                 <span>Fair Quality</span>
//               </li>
//               <li className="flex items-center gap-2">
//                 <span className="w-3 h-3 bg-red-500 rounded-full"></span>
//                 <span>Poor Quality</span>
//               </li>
//             </ul>
//           </div>

//           {/* Station List */}
//           <div className="flex-1 overflow-y-auto p-4">
//             <h3 className="font-bold text-sky-700 mb-3 text-sm uppercase tracking-wide">
//               Stations ({filteredStations.length})
//             </h3>
//             <div className="space-y-3">
//               {filteredStations.map((station) => (
//                 <div
//                   key={station.id}
//                   className="p-3 bg-white rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
//                   onClick={() => handleViewReadings(station.id)}
//                 >
//                   <div className="flex items-start justify-between">
//                     <div>
//                       <h4 className="font-semibold text-gray-800 text-sm">
//                         {station.name}
//                       </h4>
//                       <p className="text-xs text-gray-500 mt-1">
//                         {station.location}
//                       </p>
//                     </div>
//                     <span
//                       className={`w-3 h-3 rounded-full flex-shrink-0`}
//                       style={{
//                         backgroundColor: getStatusColor(station.status),
//                       }}
//                     ></span>
//                   </div>
//                   <div className="mt-2 flex items-center justify-between">
//                     <span
//                       className={`text-xs px-2 py-0.5 rounded-full font-medium ${
//                         station.status === "Excellent"
//                           ? "bg-green-100 text-green-700"
//                           : station.status === "Good"
//                           ? "bg-blue-100 text-blue-700"
//                           : station.status === "Fair"
//                           ? "bg-amber-100 text-amber-700"
//                           : "bg-red-100 text-red-700"
//                       }`}
//                     >
//                       {station.status || "Unknown"}
//                     </span>
//                     {station.wqi && (
//                       <span className="text-xs text-gray-500">
//                         WQI: {Math.round(station.wqi)}
//                       </span>
//                     )}
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>
//         </div>

//         {/* Map Container */}
//         <div className="flex-1 p-4 flex flex-col">
//           {/* Map Controls */}
//           <div className="bg-white rounded-lg shadow-md p-3 mb-3 flex items-center justify-between">
//             <div className="flex items-center gap-4">
//               <span className="text-sm text-gray-600">
//                 Showing {paginatedStations.length} of {filteredStations.length} stations
//                 {displayMode === "paginated" && ` (Page ${currentPage + 1} of ${totalPages})`}
//               </span>
//               <div className="flex gap-2">
//                 <button
//                   onClick={() => setDisplayMode(displayMode === "all" ? "paginated" : "all")}
//                   className={`px-3 py-1 text-xs rounded-full font-medium transition-colors ${
//                     displayMode === "all"
//                       ? "bg-sky-600 text-white"
//                       : "bg-gray-100 text-gray-600 hover:bg-gray-200"
//                   }`}
//                 >
//                   {displayMode === "all" ? "Show Paginated" : "Show All"}
//                 </button>
//               </div>
//             </div>
//             {displayMode === "paginated" && totalPages > 1 && (
//               <div className="flex items-center gap-2">
//                 <button
//                   onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
//                   disabled={currentPage === 0}
//                   className="px-3 py-1 text-xs bg-sky-100 text-sky-700 rounded-full disabled:opacity-50 hover:bg-sky-200 transition-colors"
//                 >
//                   ← Prev
//                 </button>
//                 <span className="text-xs text-gray-500">
//                   {currentPage + 1} / {totalPages}
//                 </span>
//                 <button
//                   onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))}
//                   disabled={currentPage >= totalPages - 1}
//                   className="px-3 py-1 text-xs bg-sky-100 text-sky-700 rounded-full disabled:opacity-50 hover:bg-sky-200 transition-colors"
//                 >
//                   Next →
//                 </button>
//               </div>
//             )}
//           </div>

//           <div className="flex-1 w-full rounded-2xl overflow-hidden shadow-2xl border-4 border-white">
//             {/* <MapContainer
//               center={[20.5937, 78.9629]}
//               zoom={5}
//               style={{ height: "100%", width: "100%" }}
//             > */}
//             <MapContainer
//               center={[20.5937, 78.9629]}
//               zoom={5}
//               style={{ height: "600px", width: "100%" }}
//               scrollWheelZoom={true}
//             >
//               <TileLayer
//                 attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
//                 url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
//               />
              
//               <MapBounds stations={filteredStations} />

//               {paginatedStations.map((station) => (
//                 <Marker
//                   key={station.id}
//                   position={[station.latitude, station.longitude]}
//                   icon={createColoredIcon(getStatusColor(station.status))}
//                 >
//                   <Popup>
//                     <div className="p-2 min-w-[200px]">
//                       <h3 className="font-bold text-sky-700 text-lg">
//                         {station.name}
//                       </h3>
//                       <p className="text-sm text-gray-600 mt-1">
//                         <MapPin className="w-3 h-3 inline mr-1" />
//                         {station.location}
//                       </p>
//                       <div className="mt-3 space-y-1">
//                         <div className="flex items-center justify-between">
//                           <span className="text-sm text-gray-500">Status:</span>
//                           <span
//                             className={`text-xs px-2 py-0.5 rounded-full font-medium ${
//                               station.status === "Excellent"
//                                 ? "bg-green-100 text-green-700"
//                                 : station.status === "Good"
//                                 ? "bg-blue-100 text-blue-700"
//                                 : station.status === "Fair"
//                                 ? "bg-amber-100 text-amber-700"
//                                 : "bg-red-100 text-red-700"
//                             }`}
//                           >
//                             {station.status || "Unknown"}
//                           </span>
//                         </div>
//                         {station.wqi && (
//                           <div className="flex items-center justify-between">
//                             <span className="text-sm text-gray-500">WQI:</span>
//                             <span className="text-sm font-semibold">
//                               {Math.round(station.wqi)}
//                             </span>
//                           </div>
//                         )}
//                         {station.managed_by && (
//                           <div className="flex items-center justify-between">
//                             <span className="text-sm text-gray-500">Managed by:</span>
//                             <span className="text-xs text-gray-600">
//                               {station.managed_by}
//                             </span>
//                           </div>
//                         )}
//                       </div>
//                       <button
//                         onClick={() => handleViewReadings(station.id)}
//                         className="mt-3 w-full bg-sky-600 text-white py-1.5 rounded text-sm font-medium hover:bg-sky-700 transition-colors flex items-center justify-center gap-1"
//                       >
//                         <Activity className="w-3 h-3" />
//                         View Readings
//                       </button>
//                     </div>
//                   </Popup>
//                 </Marker>
//               ))}
//             </MapContainer>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default MapView;


// import { useState, useEffect, useMemo } from "react";
// import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
// import "leaflet/dist/leaflet.css";
// import { useNavigate } from "react-router-dom";
// import L from "leaflet";
// import { Search, Filter, MapPin, Activity } from "lucide-react";

// import markerIcon from "leaflet/dist/images/marker-icon.png";
// import markerShadow from "leaflet/dist/images/marker-shadow.png";

// let DefaultIcon = L.icon({
//   iconUrl: markerIcon,
//   shadowUrl: markerShadow,
//   iconSize: [25, 41],
//   iconAnchor: [12, 41],
// });
// L.Marker.prototype.options.icon = DefaultIcon;

// const createColoredIcon = (color) =>
//   L.divIcon({
//     className: "custom-marker",
//     html: `<div style="
//       background-color: ${color};
//       width: 20px;
//       height: 20px;
//       border-radius: 50%;
//       border: 3px solid white;
//       box-shadow: 0 2px 6px rgba(0,0,0,0.3);
//     "></div>`,
//     iconSize: [20, 20],
//     iconAnchor: [10, 10],
//   });

// const getStatusColor = (status) => {
//   switch (status) {
//     case "Excellent":
//       return "#22c55e";
//     case "Good":
//       return "#3b82f6";
//     case "Fair":
//       return "#f59e0b";
//     case "Poor":
//       return "#ef4444";
//     default:
//       return "#6b7280";
//   }
// };

// const MapBounds = ({ stations }) => {
//   const map = useMap();
//   useEffect(() => {
//     if (stations.length > 0) {
//       const bounds = L.latLngBounds(
//         stations.map((s) => [s.latitude, s.longitude])
//       );
//       map.fitBounds(bounds, { padding: [50, 50], maxZoom: 10 });
//     }
//   }, [map, stations]);
//   return null;
// };

// const MapView = () => {
//   const navigate = useNavigate();
//   const [stations, setStations] = useState([]);
//   const [filteredStations, setFilteredStations] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [searchQuery, setSearchQuery] = useState("");

//   useEffect(() => {
//     fetchStations();
//   }, []);

//   const fetchStations = async () => {
//     try {
//       const token = localStorage.getItem("token");
//       const response = await fetch(`${API_BASE_URL}/api/stations`, {
//         headers: { Authorization: `Bearer ${token}` },
//       });

//       if (response.ok) {
//         const data = await response.json();
//         const validated = data.map((s) => ({
//           ...s,
//           latitude: parseFloat(s.latitude) || 20.5937,
//           longitude: parseFloat(s.longitude) || 78.9629,
//           status: s.status || "Unknown",
//         }));
//         setStations(validated);
//         setFilteredStations(validated);
//       }
//     } catch (error) {
//       console.error(error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     const filtered = stations.filter(
//       (s) =>
//         s.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
//         s.location?.toLowerCase().includes(searchQuery.toLowerCase())
//     );
//     setFilteredStations(filtered);
//   }, [searchQuery, stations]);

//   if (loading) {
//     return (
//       <div className="h-screen flex items-center justify-center bg-sky-50">
//         <div className="text-sky-600 text-xl font-semibold">
//           Loading stations...
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="h-screen flex flex-col bg-sky-50 overflow-hidden">
//       {/* Header */}
//       <div className="bg-sky-600 text-white p-4 flex justify-between items-center shadow-md">
//         <button
//           onClick={() => navigate("/dashboard")}
//           className="bg-white text-sky-600 px-4 py-1.5 rounded-lg font-bold shadow"
//         >
//           ← Back
//         </button>
//         <h2 className="text-xl font-bold flex items-center gap-2">
//           <MapPin className="w-5 h-5" />
//           Live Water Quality Map
//         </h2>
//         <div>{stations.length} Stations</div>
//       </div>

//       <div className="flex flex-1 overflow-hidden">
//         {/* Sidebar */}
//         <div className="w-80 bg-white border-r flex flex-col overflow-hidden">
//           <div className="p-4 border-b">
//             <div className="relative">
//               <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
//               <input
//                 type="text"
//                 placeholder="Search stations..."
//                 value={searchQuery}
//                 onChange={(e) => setSearchQuery(e.target.value)}
//                 className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm"
//               />
//             </div>
//           </div>

//           {/* Scrollable station list */}
//           <div className="flex-1 overflow-y-auto p-4 space-y-3">
//             {filteredStations.map((station) => (
//               <div
//                 key={station.id}
//                 onClick={() =>
//                   navigate(`/station/${station.id}/readings`)
//                 }
//                 className="p-3 bg-white rounded-lg border shadow-sm hover:shadow-md cursor-pointer"
//               >
//                 <h4 className="font-semibold text-sm">
//                   {station.name}
//                 </h4>
//                 <p className="text-xs text-gray-500">
//                   {station.location}
//                 </p>
//                 <span
//                   className="inline-block mt-2 w-3 h-3 rounded-full"
//                   style={{
//                     backgroundColor: getStatusColor(station.status),
//                   }}
//                 ></span>
//               </div>
//             ))}
//           </div>
//         </div>

//         {/* Map Section */}
//         <div className="flex-1 flex flex-col p-4">
//           <div className="flex-1 rounded-2xl overflow-hidden shadow-2xl border-4 border-white">
//             <MapContainer
//               center={[20.5937, 78.9629]}
//               zoom={5}
//               style={{ height: "100%", width: "100%" }}
//               scrollWheelZoom={true}
//             >
//               <TileLayer
//                 attribution="&copy; OpenStreetMap contributors"
//                 url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
//               />
//               <MapBounds stations={filteredStations} />

//               {filteredStations.map((station) => (
//                 <Marker
//                   key={station.id}
//                   position={[station.latitude, station.longitude]}
//                   icon={createColoredIcon(
//                     getStatusColor(station.status)
//                   )}
//                 >
//                   <Popup>
//                     <div className="min-w-[200px]">
//                       <h3 className="font-bold text-sky-700">
//                         {station.name}
//                       </h3>
//                       <p className="text-sm text-gray-600">
//                         {station.location}
//                       </p>
//                       <button
//                         onClick={() =>
//                           navigate(`/station/${station.id}/readings`)
//                         }
//                         className="mt-3 w-full bg-sky-600 text-white py-1.5 rounded text-sm"
//                       >
//                         <Activity className="w-4 h-4 inline mr-1" />
//                         View Readings
//                       </button>
//                     </div>
//                   </Popup>
//                 </Marker>
//               ))}
//             </MapContainer>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default MapView;


import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useNavigate } from "react-router-dom";
import L from "leaflet";
import { Search, Filter, MapPin, Activity } from "lucide-react";
import { Droplets } from "lucide-react";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

let DefaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

const createColoredIcon = (color) =>
  L.divIcon({
    className: "custom-marker",
    html: `<div style="
      background-color: ${color};
      width: 20px;
      height: 20px;
      border-radius: 50%;
      border: 3px solid white;
      box-shadow: 0 2px 6px rgba(0,0,0,0.3);
    "></div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });

const getStatusColor = (status) => {
  switch (status) {
    case "Excellent": return "#22c55e";
    case "Good": return "#3b82f6";
    case "Fair": return "#f59e0b";
    case "Poor": return "#ef4444";
    default: return "#6b7280";
  }
};

const MapBounds = ({ stations }) => {
  const map = useMap();
  useEffect(() => {
    if (stations.length > 0) {
      const bounds = L.latLngBounds(
        stations.map((s) => [s.latitude, s.longitude])
      );
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 10 });
    }
  }, [map, stations]);
  return null;
};

const MapView = () => {
  const navigate = useNavigate();
  const [stations, setStations] = useState([]);
  const [filteredStations, setFilteredStations] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRegion, setSelectedRegion] = useState("");
  const [selectedState, setSelectedState] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [country, setCountry] = useState("India");
  const [stateCode, setStateCode] = useState("CA");

  useEffect(() => {
    fetchStations();
  }, [country, stateCode]);

  const fetchStations = async () => {
    try {
      const token = localStorage.getItem("token");
      let fetchUrl = `${API_BASE_URL}/api/stations?country=${country}`;
      if (country === "USA") {
        fetchUrl += `&state=${stateCode}`;
      }
      
      const response = await fetch(fetchUrl, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        const validated = data.map((s) => ({
          ...s,
          latitude: parseFloat(s.latitude) || 20.5937,
          longitude: parseFloat(s.longitude) || 78.9629,
          status: s.status || "Unknown",
        }));
        setStations(validated);
        setFilteredStations(validated);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // FILTER LOGIC
  useEffect(() => {
    let filtered = stations;

    if (searchQuery) {
      filtered = filtered.filter(
        (s) =>
          s.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.location?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedRegion) {
      filtered = filtered.filter(
        (s) => s.region?.toLowerCase() === selectedRegion.toLowerCase()
      );
    }

    if (selectedState) {
      filtered = filtered.filter(
        (s) => s.state?.toLowerCase() === selectedState.toLowerCase()
      );
    }

    if (selectedStatus) {
      filtered = filtered.filter(
        (s) => s.status === selectedStatus
      );
    }

    setFilteredStations(filtered);
  }, [searchQuery, selectedRegion, selectedState, selectedStatus, stations]);

  const regions = [...new Set(stations.map((s) => s.region).filter(Boolean))];
  const states = [...new Set(stations.map((s) => s.state).filter(Boolean))];

  const excellentCount = stations.filter(s => s.status === "Excellent").length;
  const poorCount = stations.filter(s => s.status === "Poor").length;

  if (loading) {
  return (
    <div className="flex h-screen items-center justify-center bg-sky-50 flex-col gap-4">
      <div className="relative">
        <div className="w-16 h-16 rounded-full border-4 border-sky-100 border-t-sky-500 animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center">
          <Droplets className="w-6 h-6 text-sky-500" />
        </div>
      </div>
      <p className="text-sky-600 font-semibold text-sm animate-pulse">
        Loading Map...
      </p>
    </div>
  );
}

  const userRole = localStorage.getItem("userRole") || "citizen";
  const userName = localStorage.getItem("userName") || "";

  return (
    <div className="h-screen flex flex-col bg-sky-50 overflow-hidden">
      
      {/* HEADER */}
      <div className="bg-sky-600 text-white p-4 flex justify-between items-center shadow-md">
        <button
          onClick={() => navigate("/dashboard")}
          className="bg-white text-sky-600 px-4 py-1.5 rounded-lg font-bold shadow"
        >
          ← Back
        </button>
        <h2 className="text-xl font-bold flex items-center gap-2">
          <MapPin className="w-5 h-5" />
          Live Water Quality Map
        </h2>
        <div>{stations.length} Stations</div>
      </div>

      <div className="flex flex-1 overflow-hidden">

        {/* SIDEBAR */}
        <div className="w-80 bg-white border-r flex flex-col overflow-hidden">

          {/* SEARCH + FILTER */}
          <div className="p-4 border-b">
            <div className="flex gap-2 mb-3">
              <select 
                value={country} 
                onChange={(e) => setCountry(e.target.value)}
                className="w-full px-2 py-2 border rounded-lg text-sm bg-white"
              >
                <option value="India">India</option>
                <option value="USA">USA</option>
              </select>
              {country === "USA" && (
                <select 
                  value={stateCode} 
                  onChange={(e) => setStateCode(e.target.value)}
                  className="w-full px-2 py-2 border rounded-lg text-sm bg-white"
                >
                  <option value="CA">California</option>
                  <option value="TX">Texas</option>
                  <option value="NY">New York</option>
                  <option value="FL">Florida</option>
                  <option value="WA">Washington</option>
                </select>
              )}
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search stations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm"
              />
            </div>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className="mt-2 text-sm text-sky-600 flex items-center gap-1"
            >
              <Filter className="w-4 h-4" />
              {showFilters ? "Hide Filters" : "Show Filters"}
            </button>

            {showFilters && (
              <div className="mt-3 space-y-2">
                <select
                  value={selectedRegion}
                  onChange={(e) => setSelectedRegion(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                >
                  <option value="">All Regions</option>
                  {regions.map((r) => (
                    <option key={r}>{r}</option>
                  ))}
                </select>

                <select
                  value={selectedState}
                  onChange={(e) => setSelectedState(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                >
                  <option value="">All States</option>
                  {states.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>

                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                >
                  <option value="">All Status</option>
                  <option>Excellent</option>
                  <option>Good</option>
                  <option>Fair</option>
                  <option>Poor</option>
                </select>
              </div>
            )}
          </div>

          {/* STATS */}
          <div className="p-4 bg-sky-50 border-b">
            <div className="grid grid-cols-3 gap-2 text-center">
              <div>
                <p className="text-xl font-bold">{stations.length}</p>
                <p className="text-xs text-gray-500">Total</p>
              </div>
              <div>
                <p className="text-xl font-bold text-green-500">{excellentCount}</p>
                <p className="text-xs text-gray-500">Excellent</p>
              </div>
              <div>
                <p className="text-xl font-bold text-red-500">{poorCount}</p>
                <p className="text-xs text-gray-500">Poor</p>
              </div>
            </div>
          </div>
          
          {/* Legend */}
          <div className="p-4 border-b border-sky-100">
            <h3 className="font-bold text-sky-700 mb-3 text-sm uppercase tracking-wide">
              Map Legend
            </h3>
            <ul className="space-y-2 text-sm">
              {userRole === "ngo" && (
                <li className="flex items-center gap-2 font-bold text-teal-700 bg-teal-50 p-1 rounded">
                  <span className="w-3 h-3 bg-teal-600 rounded-full border border-teal-800"></span>
                  <span>Your NGO Stations</span>
                </li>
              )}
              <li className="flex items-center gap-2">
                <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                <span>Excellent Quality</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
                <span>Good Quality</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-3 h-3 bg-amber-500 rounded-full"></span>
                <span>Fair Quality</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-3 h-3 bg-red-500 rounded-full"></span>
                <span>Poor Quality</span>
              </li>
            </ul>
          </div>
          
          {/* SCROLLABLE LIST */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {filteredStations.map((station) => {
              const isNgoStation = userRole === "ngo" && station.managed_by === userName;
              return (
                <div
                  key={station.id}
                  onClick={() => navigate(`/station/${station.id}/readings`)}
                  className={`p-3 bg-white rounded-lg border shadow-sm cursor-pointer ${isNgoStation ? 'ring-2 ring-teal-500' : ''}`}
                >
                  <h4 className="font-semibold text-sm">{station.name}</h4>
                  <p className="text-xs text-gray-500">{station.location}</p>
                  <span
                    className="inline-block mt-2 w-3 h-3 rounded-full"
                    style={{ backgroundColor: isNgoStation ? "#0d9488" : getStatusColor(station.status) }}
                  ></span>
                </div>
              );
            })}
          </div>
        </div>

        {/* MAP */}
        <div className="flex-1 p-4">
          <div className="h-full rounded-2xl overflow-hidden shadow-2xl border-4 border-white">
            <MapContainer
              center={[20.5937, 78.9629]}
              zoom={5}
              style={{ height: "100%", width: "100%" }}
              scrollWheelZoom
            >
              <TileLayer
                attribution="&copy; OpenStreetMap contributors"
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <MapBounds stations={filteredStations} />

              {filteredStations.map((station) => {
                const isNgoStation = userRole === "ngo" && station.managed_by === userName;
                return (
                  <Marker
                    key={station.id}
                    position={[station.latitude, station.longitude]}
                    icon={createColoredIcon(isNgoStation ? "#0d9488" : getStatusColor(station.status))}
                  >
                    <Popup>
                      <div>
                        {isNgoStation && (
                          <span className="bg-teal-100 text-teal-800 text-[10px] px-2 py-0.5 rounded uppercase font-bold tracking-wider inline-block mb-2">NGO Partner Station</span>
                        )}
                        <h3 className="font-bold">{station.name}</h3>
                        <p className="text-sm">{station.location}</p>
                        <button
                          onClick={() =>
                            navigate(`/station/${station.id}/readings`)
                          }
                          className="mt-2 w-full bg-sky-600 text-white py-1 rounded text-sm"
                        >
                          <Activity className="w-4 h-4 inline mr-1" />
                          View Readings
                        </button>
                      </div>
                    </Popup>
                  </Marker>
                );
              })}
            </MapContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapView;