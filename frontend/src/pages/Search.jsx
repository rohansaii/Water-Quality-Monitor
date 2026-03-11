// import { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import {
//   Search,
//   Filter,
//   MapPin,
//   ArrowRight,
//   History,
//   X,
//   Droplets,
//   Activity,
//   Navigation,
// } from "lucide-react";

// const SearchPage = () => {
//   const navigate = useNavigate();
//   const [searchQuery, setSearchQuery] = useState("");
//   const [selectedRegion, setSelectedRegion] = useState("");
//   const [selectedState, setSelectedState] = useState("");
//   const [stationId, setStationId] = useState("");
//   const [searchResults, setSearchResults] = useState([]);
//   const [searchHistory, setSearchHistory] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [showFilters, setShowFilters] = useState(true);
//   const [hasSearched, setHasSearched] = useState(false);

//   // Fetch search history on mount
//   useEffect(() => {
//     fetchSearchHistory();
//   }, []);

//   const fetchSearchHistory = async () => {
//     try {
//       const token = localStorage.getItem("token");
//       const response = await fetch("http://127.0.0.1:5000/api/search/history", {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       });

//       if (response.ok) {
//         const data = await response.json();
//         setSearchHistory(data);
//       }
//     } catch (error) {
//       console.error("Error fetching search history:", error);
//     }
//   };

//   const handleSearch = async () => {
//     setLoading(true);
//     setHasSearched(true);

//     try {
//       const token = localStorage.getItem("token");
//       const params = new URLSearchParams();

//       if (searchQuery) params.append("q", searchQuery);
//       if (selectedRegion) params.append("region", selectedRegion);
//       if (selectedState) params.append("state", selectedState);
//       if (stationId) params.append("station_id", stationId);

//       const response = await fetch(
//         `http://127.0.0.1:5000/api/search?${params.toString()}`,
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         }
//       );

//       if (response.ok) {
//         const data = await response.json();
//         setSearchResults(data);

//         // Log the search
//         if (searchQuery || selectedRegion || selectedState || stationId) {
//           await logSearch();
//         }
//       }
//     } catch (error) {
//       console.error("Error searching:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const logSearch = async () => {
//     try {
//       const token = localStorage.getItem("token");
//       let searchParam = "General";
//       let searchValue = searchQuery;

//       if (stationId) {
//         searchParam = "Water Station ID";
//         searchValue = stationId;
//       } else if (selectedRegion) {
//         searchParam = "Region";
//         searchValue = selectedRegion;
//       } else if (selectedState) {
//         searchParam = "State";
//         searchValue = selectedState;
//       } else if (searchQuery) {
//         searchParam = "Water Station Name";
//       }

//       await fetch("http://127.0.0.1:5000/api/search/log", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${token}`,
//         },
//         body: JSON.stringify({
//           parameter: searchParam,
//           value: searchValue || "All",
//         }),
//       });

//       // Refresh search history
//       fetchSearchHistory();
//     } catch (error) {
//       console.error("Error logging search:", error);
//     }
//   };

//   const clearFilters = () => {
//     setSearchQuery("");
//     setSelectedRegion("");
//     setSelectedState("");
//     setStationId("");
//     setSearchResults([]);
//     setHasSearched(false);
//   };

//   const handleViewReadings = (stationId) => {
//     navigate(`/station/${stationId}/readings`);
//   };

//   // const handleViewOnMap = (stationId) => {
//   //   navigate("/map");
//   // };
//   const handleViewOnMap = (stationId) => {
//   navigate(`/map?station=${stationId}`);
// };

//   const getStatusColor = (status) => {
//     switch (status) {
//       case "Excellent":
//         return "bg-green-100 text-green-700 border-green-200";
//       case "Good":
//         return "bg-blue-100 text-blue-700 border-blue-200";
//       case "Fair":
//         return "bg-amber-100 text-amber-700 border-amber-200";
//       case "Poor":
//         return "bg-red-100 text-red-700 border-red-200";
//       default:
//         return "bg-gray-100 text-gray-700 border-gray-200";
//     }
//   };

//   return (
//     <div className="min-h-screen flex bg-sky-50">
//       {/* Sidebar */}
//       <div className="w-64 bg-sky-600 text-white flex flex-col p-6 shadow-xl">
//         <h2 className="text-2xl font-bold mb-8 italic flex items-center gap-2">
//           <Droplets className="w-6 h-6" />
//           WQM
//         </h2>
//         <ul className="space-y-2 flex-1">
//           <li
//             onClick={() => navigate("/dashboard")}
//             className="hover:bg-sky-500 p-3 rounded-lg cursor-pointer transition-colors flex items-center gap-2"
//           >
//             <Activity className="w-4 h-4" />
//             Dashboard
//           </li>
//           <li
//             onClick={() => navigate("/map")}
//             className="hover:bg-sky-500 p-3 rounded-lg cursor-pointer transition-colors flex items-center gap-2"
//           >
//             <MapPin className="w-4 h-4" />
//             Live Map View
//           </li>
//           <li className="bg-white text-sky-600 p-3 rounded-lg cursor-pointer font-bold shadow-md flex items-center gap-2">
//             <Search className="w-4 h-4" />
//             Search Stations
//           </li>
//           <li
//             onClick={() => navigate("/reports")}
//             className="hover:bg-sky-500 p-3 rounded-lg cursor-pointer transition-colors flex items-center gap-2"
//           >
//             <Activity className="w-4 h-4" />
//             My Reports
//           </li>
//           <li
//             onClick={() => navigate("/profile")}
//             className="hover:bg-sky-500 p-3 rounded-lg cursor-pointer transition-colors flex items-center gap-2"
//           >
//             <Navigation className="w-4 h-4" />
//             Profile
//           </li>
//         </ul>
//         <button
//           onClick={() => {
//             localStorage.clear();
//             navigate("/");
//           }}
//           className="mt-auto bg-white text-sky-600 hover:bg-sky-50 py-2.5 rounded-lg font-bold transition-all shadow-lg"
//         >
//           Logout
//         </button>
//       </div>

//       {/* Main Content */}
//       <div className="flex-1 p-8 overflow-y-auto">
//         <header className="mb-8">
//           <h1 className="text-3xl font-bold text-sky-900">Search Water Stations</h1>
//           <p className="text-sky-600 mt-1">
//             Find water quality monitoring stations by name, location, or ID
//           </p>
//         </header>

//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
//           {/* Search Panel */}
//           <div className="lg:col-span-2 space-y-6">
//             {/* Search Box */}
//             <div className="bg-white rounded-2xl shadow-sm border border-sky-100 p-6">
//               <div className="flex items-center justify-between mb-4">
//                 <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
//                   <Search className="w-5 h-5 text-sky-600" />
//                   Search Filters
//                 </h2>
//                 <button
//                   onClick={() => setShowFilters(!showFilters)}
//                   className="text-sm text-sky-600 hover:text-sky-700 flex items-center gap-1"
//                 >
//                   <Filter className="w-4 h-4" />
//                   {showFilters ? "Hide" : "Show"} Filters
//                 </button>
//               </div>

//               {showFilters && (
//                 <div className="space-y-4">
//                   {/* Search by Name */}
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-1">
//                       Station Name or Location
//                     </label>
//                     <div className="relative">
//                       <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
//                       <input
//                         type="text"
//                         placeholder="Enter station name or location..."
//                         value={searchQuery}
//                         onChange={(e) => setSearchQuery(e.target.value)}
//                         onKeyPress={(e) => e.key === "Enter" && handleSearch()}
//                         className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-sky-400 outline-none"
//                       />
//                     </div>
//                   </div>

//                   <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//                     {/* Region Filter */}
//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 mb-1">
//                         Region
//                       </label>
//                       <select
//                         value={selectedRegion}
//                         onChange={(e) => setSelectedRegion(e.target.value)}
//                         className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-sky-400 outline-none bg-white"
//                       >
//                         <option value="">All Regions</option>
//                         <option value="North">North</option>
//                         <option value="South">South</option>
//                         <option value="East">East</option>
//                         <option value="West">West</option>
//                         <option value="Central">Central</option>
//                         <option value="Telangana">Telangana</option>
//                         <option value="Tamil Nadu">Tamil Nadu</option>
//                         <option value="Karnataka">Karnataka</option>
//                       </select>
//                     </div>

//                     {/* State Filter */}
//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 mb-1">
//                         State
//                       </label>
//                       <select
//                         value={selectedState}
//                         onChange={(e) => setSelectedState(e.target.value)}
//                         className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-sky-400 outline-none bg-white"
//                       >
//                         <option value="">All States</option>
//                         <option value="Telangana">Telangana</option>
//                         <option value="Tamil Nadu">Tamil Nadu</option>
//                         <option value="Karnataka">Karnataka</option>
//                         <option value="Maharashtra">Maharashtra</option>
//                         <option value="Delhi">Delhi</option>
//                         <option value="Uttar Pradesh">Uttar Pradesh</option>
//                       </select>
//                     </div>

//                     {/* Station ID */}
//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 mb-1">
//                         Station ID
//                       </label>
//                       <input
//                         type="text"
//                         placeholder="e.g., 123"
//                         value={stationId}
//                         onChange={(e) => setStationId(e.target.value)}
//                         className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-sky-400 outline-none"
//                       />
//                     </div>
//                   </div>

//                   {/* Action Buttons */}
//                   <div className="flex gap-3 pt-2">
//                     <button
//                       onClick={handleSearch}
//                       disabled={loading}
//                       className="flex-1 bg-sky-600 text-white py-2.5 rounded-lg font-semibold hover:bg-sky-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
//                     >
//                       {loading ? (
//                         "Searching..."
//                       ) : (
//                         <>
//                           <Search className="w-4 h-4" />
//                           Search Stations
//                         </>
//                       )}
//                     </button>
//                     <button
//                       onClick={clearFilters}
//                       className="px-4 py-2.5 border border-gray-200 text-gray-600 rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center gap-2"
//                     >
//                       <X className="w-4 h-4" />
//                       Clear
//                     </button>
//                   </div>
//                 </div>
//               )}
//             </div>

//             {/* Search Results */}
//             {hasSearched && (
//               <div className="bg-white rounded-2xl shadow-sm border border-sky-100 p-6">
//                 <div className="flex items-center justify-between mb-4">
//                   <h2 className="text-lg font-bold text-gray-800">
//                     Search Results ({searchResults.length})
//                   </h2>
//                 </div>

//                 {searchResults.length === 0 ? (
//                   <div className="text-center py-12">
//                     <div className="text-gray-300 mb-4">
//                       <Search className="w-16 h-16 mx-auto" />
//                     </div>
//                     <p className="text-gray-500">No stations found matching your criteria</p>
//                     <p className="text-sm text-gray-400 mt-1">
//                       Try adjusting your filters or search query
//                     </p>
//                   </div>
//                 ) : (
//                   <div className="space-y-4">
//                     {searchResults.map((result) => (
//                       <div
//                         key={result.station.id}
//                         className="border border-gray-100 rounded-xl p-4 hover:shadow-md transition-shadow"
//                       >
//                         <div className="flex items-start justify-between">
//                           <div className="flex-1">
//                             <div className="flex items-center gap-3">
//                               <h3 className="font-bold text-gray-800">
//                                 {result.station.name}
//                               </h3>
//                               <span
//                                 className={`text-xs px-2 py-0.5 rounded-full border ${getStatusColor(
//                                   result.status
//                                 )}`}
//                               >
//                                 {result.status || "Unknown"}
//                               </span>
//                             </div>
//                             <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
//                               <MapPin className="w-3 h-3" />
//                               {result.station.location}
//                             </p>
//                             <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
//                               <span>ID: #{result.station.id}</span>
//                               {result.station.region && (
//                                 <span>Region: {result.station.region}</span>
//                               )}
//                               {result.station.state && (
//                                 <span>State: {result.station.state}</span>
//                               )}
//                             </div>
//                           </div>
//                           <div className="text-right">
//                             {result.wqi && (
//                               <div className="mb-2">
//                                 <span className="text-2xl font-bold text-sky-600">
//                                   {Math.round(result.wqi)}
//                                 </span>
//                                 <p className="text-xs text-gray-400">WQI</p>
//                               </div>
//                             )}
//                           </div>
//                         </div>
//                         <div className="flex gap-2 mt-4">
//                           <button
//                             onClick={() => handleViewReadings(result.station.id)}
//                             className="flex-1 bg-sky-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-sky-700 transition-colors flex items-center justify-center gap-1"
//                           >
//                             View Readings
//                             <ArrowRight className="w-3 h-3" />
//                           </button>
//                           <button
//                             onClick={() => handleViewOnMap(result.station.id)}
//                             className="px-4 py-2 border border-gray-200 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
//                           >
//                             View on Map
//                           </button>
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                 )}
//               </div>
//             )}
//           </div>

//           {/* Right Panel - Search History */}
//           <div className="lg:col-span-1">
//             <div className="bg-white rounded-2xl shadow-sm border border-sky-100 p-6 sticky top-8">
//               <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
//                 <History className="w-5 h-5 text-sky-600" />
//                 Recent Searches
//               </h2>

//               {searchHistory.length === 0 ? (
//                 <p className="text-gray-400 text-sm text-center py-4">
//                   No search history yet
//                 </p>
//               ) : (
//                 <div className="space-y-3">
//                   {searchHistory.slice(0, 10).map((search) => (
//                     <div
//                       key={search.id}
//                       className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
//                       onClick={() => {
//                         if (search.parameter === "Region") {
//                           setSelectedRegion(search.value);
//                         } else if (search.parameter === "State") {
//                           setSelectedState(search.value);
//                         } else if (search.parameter === "Water Station ID") {
//                           setStationId(search.value);
//                         } else {
//                           setSearchQuery(search.value);
//                         }
//                       }}
//                     >
//                       <div className="flex items-center justify-between">
//                         <span className="text-xs font-medium text-sky-600 bg-sky-50 px-2 py-0.5 rounded">
//                           {search.parameter}
//                         </span>
//                         <span className="text-xs text-gray-400">
//                           {new Date(search.created_at).toLocaleDateString()}
//                         </span>
//                       </div>
//                       <p className="text-sm text-gray-700 mt-1 font-medium">
//                         {search.value}
//                       </p>
//                     </div>
//                   ))}
//                 </div>
//               )}

//               {/* Quick Stats */}
//               <div className="mt-6 pt-6 border-t border-gray-100">
//                 <h3 className="text-sm font-bold text-gray-700 mb-3">
//                   Quick Stats
//                 </h3>
//                 <div className="space-y-2">
//                   <div className="flex items-center justify-between text-sm">
//                     <span className="text-gray-500">Total Stations</span>
//                     <span className="font-semibold text-gray-800">
//                       {searchResults.length || "-"}
//                     </span>
//                   </div>
//                   <div className="flex items-center justify-between text-sm">
//                     <span className="text-gray-500">Excellent Quality</span>
//                     <span className="font-semibold text-green-600">
//                       {searchResults.filter((r) => r.status === "Excellent").length || "-"}
//                     </span>
//                   </div>
//                   <div className="flex items-center justify-between text-sm">
//                     <span className="text-gray-500">Needs Attention</span>
//                     <span className="font-semibold text-red-600">
//                       {searchResults.filter((r) => r.status === "Poor").length || "-"}
//                     </span>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default SearchPage;



// import { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import {
//   Search,
//   Filter,
//   MapPin,
//   ArrowRight,
//   History,
//   X,
//   Droplets,
//   Activity,
//   Navigation,
// } from "lucide-react";

// const SearchPage = () => {

//   const navigate = useNavigate();

//   const [searchQuery,setSearchQuery] = useState("");
//   const [selectedRegion,setSelectedRegion] = useState("");
//   const [selectedState,setSelectedState] = useState("");
//   const [stationId,setStationId] = useState("");

//   const [regions,setRegions] = useState([]);
//   const [states,setStates] = useState([]);

//   const [searchResults,setSearchResults] = useState([]);
//   const [searchHistory,setSearchHistory] = useState([]);

//   const [loading,setLoading] = useState(false);
//   const [showFilters,setShowFilters] = useState(true);
//   const [hasSearched,setHasSearched] = useState(false);

//   useEffect(()=>{
//     fetchSearchHistory();
//     fetchFilters();
//   },[]);

//   // Fetch region/state filters dynamically

//   const fetchFilters = async () => {

//     try{

//       const token = localStorage.getItem("token");

//       const response = await fetch(
//         "http://127.0.0.1:5000/api/stations",
//         {
//           headers:{
//             Authorization:`Bearer ${token}`
//           }
//         }
//       );

//       if(response.ok){

//         const data = await response.json();

//         const uniqueRegions = [
//           ...new Set(data.map((s)=>s.region).filter(Boolean))
//         ];

//         const uniqueStates = [
//           ...new Set(data.map((s)=>s.state).filter(Boolean))
//         ];

//         setRegions(uniqueRegions);
//         setStates(uniqueStates);

//       }

//     }catch(err){
//       console.error(err);
//     }

//   };

//   // Fetch search history

//   const fetchSearchHistory = async () => {

//     try{

//       const token = localStorage.getItem("token");

//       const response = await fetch(
//         "http://127.0.0.1:5000/api/search/history",
//         {
//           headers:{
//             Authorization:`Bearer ${token}`
//           }
//         }
//       );

//       if(response.ok){

//         const data = await response.json();
//         setSearchHistory(data);

//       }

//     }catch(err){
//       console.error(err);
//     }

//   };

//   // Search stations

//   const handleSearch = async () => {

//     setLoading(true);
//     setHasSearched(true);

//     try{

//       const token = localStorage.getItem("token");

//       const params = new URLSearchParams();

//       if(searchQuery) params.append("q",searchQuery);
//       if(selectedRegion) params.append("region",selectedRegion);
//       if(selectedState) params.append("state",selectedState);
//       if(stationId) params.append("station_id",Number(stationId));

//       const response = await fetch(
//         `http://127.0.0.1:5000/api/search?${params.toString()}`,
//         {
//           headers:{
//             Authorization:`Bearer ${token}`
//           }
//         }
//       );

//       if(response.ok){

//         const data = await response.json();
//         setSearchResults(data);

//       }

//     }catch(err){
//       console.error(err);
//     }

//     setLoading(false);

//   };

//   const clearFilters = () => {

//     setSearchQuery("");
//     setSelectedRegion("");
//     setSelectedState("");
//     setStationId("");
//     setSearchResults([]);
//     setHasSearched(false);

//   };

//   const handleViewReadings = (id) => {
//     navigate(`/station/${id}/readings`);
//   };

//   const handleViewOnMap = (station) => {

//     navigate(
//       `/map?lat=${station.latitude}&lng=${station.longitude}`
//     );

//   };

//   const getStatusColor = (status) => {

//     switch(status){

//       case "Excellent":
//         return "bg-green-100 text-green-700 border-green-200";

//       case "Good":
//         return "bg-blue-100 text-blue-700 border-blue-200";

//       case "Fair":
//         return "bg-amber-100 text-amber-700 border-amber-200";

//       case "Poor":
//         return "bg-red-100 text-red-700 border-red-200";

//       default:
//         return "bg-gray-100 text-gray-700 border-gray-200";

//     }

//   };

//   const excellentCount = searchResults.filter(
//     r => r.status === "Excellent"
//   ).length;

//   const poorCount = searchResults.filter(
//     r => r.status === "Poor"
//   ).length;

//   return (

//     <div className="min-h-screen flex bg-sky-50">

//       {/* Sidebar */}

//       <div className="w-64 bg-sky-600 text-white flex flex-col p-6 shadow-xl">

//         <h2 className="text-2xl font-bold mb-8 flex items-center gap-2">
//           <Droplets className="w-6 h-6"/>
//           WQM
//         </h2>

//         <ul className="space-y-2 flex-1">

//           <li
//             onClick={()=>navigate("/dashboard")}
//             className="hover:bg-sky-500 p-3 rounded-lg cursor-pointer flex items-center gap-2"
//           >
//             <Activity className="w-4 h-4"/>
//             Dashboard
//           </li>

//           <li
//             onClick={()=>navigate("/map")}
//             className="hover:bg-sky-500 p-3 rounded-lg cursor-pointer flex items-center gap-2"
//           >
//             <MapPin className="w-4 h-4"/>
//             Live Map View
//           </li>

//           <li className="bg-white text-sky-600 p-3 rounded-lg font-bold shadow flex items-center gap-2">
//             <Search className="w-4 h-4"/>
//             Search Stations
//           </li>

//           <li
//             onClick={()=>navigate("/reports")}
//             className="hover:bg-sky-500 p-3 rounded-lg cursor-pointer flex items-center gap-2"
//           >
//             My Reports
//           </li>

//           <li
//             onClick={()=>navigate("/profile")}
//             className="hover:bg-sky-500 p-3 rounded-lg cursor-pointer flex items-center gap-2"
//           >
//             <Navigation className="w-4 h-4"/>
//             Profile
//           </li>

//         </ul>

//         <button
//           onClick={()=>{
//             localStorage.clear();
//             navigate("/");
//           }}
//           className="mt-auto bg-white text-sky-600 py-2 rounded-lg font-bold"
//         >
//           Logout
//         </button>

//       </div>

//       {/* Main Content */}

//       <div className="flex-1 p-8 overflow-y-auto">

//         <h1 className="text-3xl font-bold text-sky-900">
//           Search Water Stations
//         </h1>

//         <p className="text-sky-600 mt-1">
//           Find water quality monitoring stations by name, location, or ID
//         </p>

//         {/* Search Filters */}

//         <div className="bg-white rounded-xl shadow p-6 mt-6">

//           <h2 className="text-lg font-bold flex items-center gap-2 mb-4">
//             <Search className="w-5 h-5 text-sky-600"/>
//             Search Filters
//           </h2>

//           <input
//             type="text"
//             placeholder="Enter station name or location..."
//             value={searchQuery}
//             onChange={(e)=>setSearchQuery(e.target.value)}
//             className="w-full border rounded-lg p-2 mb-4"
//           />

//           <div className="grid grid-cols-3 gap-4">

//             {/* Region Dropdown */}

//             <select
//               value={selectedRegion}
//               onChange={(e)=>setSelectedRegion(e.target.value)}
//               className="border rounded-lg p-2"
//             >
//               <option value="">All Regions</option>

//               {regions.map(region =>(
//                 <option key={region} value={region}>
//                   {region}
//                 </option>
//               ))}

//             </select>

//             {/* State Dropdown */}

//             <select
//               value={selectedState}
//               onChange={(e)=>setSelectedState(e.target.value)}
//               className="border rounded-lg p-2"
//             >
//               <option value="">All States</option>

//               {states.map(state =>(
//                 <option key={state} value={state}>
//                   {state}
//                 </option>
//               ))}

//             </select>

//             <input
//               type="text"
//               placeholder="Station ID"
//               value={stationId}
//               onChange={(e)=>setStationId(e.target.value)}
//               className="border rounded-lg p-2"
//             />

//           </div>

//           <div className="flex gap-3 mt-4">

//             <button
//               onClick={handleSearch}
//               className="bg-sky-600 text-white py-2 px-6 rounded-lg flex items-center gap-2"
//             >
//               <Search className="w-4 h-4"/>
//               {loading ? "Searching..." : "Search Stations"}
//             </button>

//             <button
//               onClick={clearFilters}
//               className="border py-2 px-4 rounded-lg flex items-center gap-2"
//             >
//               <X className="w-4 h-4"/>
//               Clear
//             </button>

//           </div>

//         </div>

//         {/* Search Results */}

//         {hasSearched && (

//           <div className="bg-white rounded-xl shadow p-6 mt-6">

//             <h2 className="text-lg font-bold mb-4">
//               Search Results ({searchResults.length})
//             </h2>

//             <div className="space-y-4">

//               {searchResults.map(result => {

//                 const station = result.station;

//                 return(

//                   <div
//                     key={station.id}
//                     className="border rounded-xl p-4 hover:shadow"
//                   >

//                     <div className="flex justify-between">

//                       <div>

//                         <div className="flex items-center gap-3">

//                           <h3 className="font-bold text-gray-800">
//                             {station.name}
//                           </h3>

//                           <span
//                             className={`text-xs px-2 py-1 rounded-full border ${getStatusColor(result.status)}`}
//                           >
//                             {result.status}
//                           </span>

//                         </div>

//                         <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
//                           <MapPin className="w-3 h-3"/>
//                           {station.location}
//                         </p>

//                         <p className="text-sm text-gray-500 mt-1">
//                           ID: #{station.id} | Region: {station.region} | State: {station.state}
//                         </p>

//                       </div>

//                       <div className="text-right">

//                         <p className="text-3xl font-bold text-sky-600">
//                           {Math.round(result.wqi)}
//                         </p>

//                         <p className="text-xs text-gray-400">
//                           WQI
//                         </p>

//                       </div>

//                     </div>

//                     <div className="flex gap-2 mt-4">

//                       <button
//                         onClick={()=>handleViewReadings(station.id)}
//                         className="flex-1 bg-sky-600 text-white py-2 rounded-lg"
//                       >
//                         View Readings →
//                       </button>

//                       <button
//                         onClick={()=>handleViewOnMap(station)}
//                         className="border px-4 py-2 rounded-lg"
//                       >
//                         View on Map
//                       </button>

//                     </div>

//                   </div>

//                 );

//               })}

//             </div>

//           </div>

//         )}

//       </div>

//       {/* Right Panel */}

//       <div className="w-80 bg-white p-6 shadow">
          
   

//         <h2 className="font-bold mb-4 flex items-center gap-2">
//            <History className="w-5 h-5 text-sky-600"/>
//            Quick Stats
//          </h2>

//        <p>Total Stations: {searchResults.length}</p>

//     <p className="text-green-600">
//          Excellent Quality: {excellentCount}
//         </p>

//         <p className="text-red-600">
//           Needs Attention: {poorCount}
//         </p>

//        </div>

//      </div>

//    );

//  };

//  export default SearchPage;






import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  MapPin,
  History,
  X,
  Droplets,
  Activity,
  Navigation,
  AlertTriangle,
} from "lucide-react";

const SearchPage = () => {

  const navigate = useNavigate();

  const [searchQuery,setSearchQuery] = useState("");
  const [selectedRegion,setSelectedRegion] = useState("");
  const [selectedState,setSelectedState] = useState("");
  const [stationId,setStationId] = useState("");

  const [regions,setRegions] = useState([]);
  const [states,setStates] = useState([]);

  const [searchResults,setSearchResults] = useState([]);

  const [loading,setLoading] = useState(false);
  const [hasSearched,setHasSearched] = useState(false);

  useEffect(()=>{
    fetchFilters();
  },[]);

  const fetchFilters = async () => {

    try{

      const token = localStorage.getItem("token");

      const response = await fetch(
        "http://127.0.0.1:5000/api/stations",
        {
          headers:{
            Authorization:`Bearer ${token}`
          }
        }
      );

      if(response.ok){

        const data = await response.json();

        const uniqueRegions = [
          ...new Set(data.map((s)=>s.region).filter(Boolean))
        ];

        const uniqueStates = [
          ...new Set(data.map((s)=>s.state).filter(Boolean))
        ];

        setRegions(uniqueRegions);
        setStates(uniqueStates);

      }

    }catch(err){
      console.error(err);
    }

  };

  const handleSearch = async () => {

    setLoading(true);
    setHasSearched(true);

    try{

      const token = localStorage.getItem("token");

      const params = new URLSearchParams();

      if(searchQuery) params.append("q",searchQuery);
      if(selectedRegion) params.append("region",selectedRegion);
      if(selectedState) params.append("state",selectedState);
      if(stationId) params.append("station_id",Number(stationId));

      const response = await fetch(
        `http://127.0.0.1:5000/api/search?${params.toString()}`,
        {
          headers:{
            Authorization:`Bearer ${token}`
          }
        }
      );

      if(response.ok){

        const data = await response.json();
        setSearchResults(data);

      }

    }catch(err){
      console.error(err);
    }

    setLoading(false);

  };

  const clearFilters = () => {

    setSearchQuery("");
    setSelectedRegion("");
    setSelectedState("");
    setStationId("");
    setSearchResults([]);
    setHasSearched(false);

  };

  const handleViewReadings = (id) => {
    navigate(`/station/${id}/readings`);
  };

  const handleViewOnMap = (station) => {

    navigate(
      `/map?lat=${station.latitude}&lng=${station.longitude}`
    );

  };

  const getStatusColor = (status) => {

    switch(status){

      case "Excellent":
        return "bg-green-100 text-green-700 border-green-200";

      case "Good":
        return "bg-blue-100 text-blue-700 border-blue-200";

      case "Fair":
        return "bg-amber-100 text-amber-700 border-amber-200";

      case "Poor":
        return "bg-red-100 text-red-700 border-red-200";

      default:
        return "bg-gray-100 text-gray-700 border-gray-200";

    }

  };

  const excellentCount = searchResults.filter(
    r => r.status === "Excellent"
  ).length;

  const poorCount = searchResults.filter(
    r => r.status === "Poor"
  ).length;

  return (

    <div className="min-h-screen flex bg-sky-50">

      {/* Sidebar */}

      <div className="w-64 bg-sky-600 text-white flex flex-col p-6 shadow-xl">

        <h2 className="text-2xl font-bold mb-8 flex items-center gap-2">
          <Droplets className="w-6 h-6"/>
          WQM
        </h2>

        <ul className="space-y-2 flex-1">

          <li
            onClick={()=>navigate("/dashboard")}
            className="hover:bg-sky-500 p-3 rounded-lg cursor-pointer flex items-center gap-2"
          >
            <Activity className="w-4 h-4"/>
            Dashboard
          </li>

          <li
            onClick={()=>navigate("/map")}
            className="hover:bg-sky-500 p-3 rounded-lg cursor-pointer flex items-center gap-2"
          >
            <MapPin className="w-4 h-4"/>
            Live Map View
          </li>

          <li
            onClick={()=>navigate("/alerts")}
            className="hover:bg-sky-500 p-3 rounded-lg cursor-pointer flex items-center gap-2"
          >
            <AlertTriangle className="w-4 h-4"/>
            System Alerts
          </li>

          <li className="bg-white text-sky-600 p-3 rounded-lg font-bold shadow flex items-center gap-2">
            <Search className="w-4 h-4"/>
            Search Stations
          </li>

          <li
            onClick={()=>navigate("/reports")}
            className="hover:bg-sky-500 p-3 rounded-lg cursor-pointer flex items-center gap-2"
          >
            My Reports
          </li>

          <li
            onClick={()=>navigate("/profile")}
            className="hover:bg-sky-500 p-3 rounded-lg cursor-pointer flex items-center gap-2"
          >
            <Navigation className="w-4 h-4"/>
            Profile
          </li>

        </ul>

        <button
          onClick={()=>{
            localStorage.clear();
            navigate("/");
          }}
          className="mt-auto bg-white text-sky-600 py-2 rounded-lg font-bold"
        >
          Logout
        </button>

      </div>

      {/* Main Content */}

      <div className="flex-1 p-8 overflow-y-auto">

        <h1 className="text-3xl font-bold text-sky-900">
          Search Water Stations
        </h1>

        <p className="text-sky-600 mt-1">
          Find water quality monitoring stations by name, location, or ID
        </p>

        {/* Search Filters */}

        <div className="bg-white rounded-xl shadow p-6 mt-6">

          <h2 className="text-lg font-bold flex items-center gap-2 mb-4">
            <Search className="w-5 h-5 text-sky-600"/>
            Search Filters
          </h2>

          <input
            type="text"
            placeholder="Enter station name or location..."
            value={searchQuery}
            onChange={(e)=>setSearchQuery(e.target.value)}
            className="w-full border rounded-lg p-2 mb-4"
          />

          <div className="grid grid-cols-3 gap-4">

            <select
              value={selectedRegion}
              onChange={(e)=>setSelectedRegion(e.target.value)}
              className="border rounded-lg p-2"
            >
              <option value="">All Regions</option>

              {regions.map(region =>(
                <option key={region} value={region}>
                  {region}
                </option>
              ))}

            </select>

            <select
              value={selectedState}
              onChange={(e)=>setSelectedState(e.target.value)}
              className="border rounded-lg p-2"
            >
              <option value="">All States</option>

              {states.map(state =>(
                <option key={state} value={state}>
                  {state}
                </option>
              ))}

            </select>

            <input
              type="text"
              placeholder="Station ID"
              value={stationId}
              onChange={(e)=>setStationId(e.target.value)}
              className="border rounded-lg p-2"
            />

          </div>

          <div className="flex gap-3 mt-4">

            <button
              onClick={handleSearch}
              className="bg-sky-600 text-white py-2 px-6 rounded-lg flex items-center gap-2"
            >
              <Search className="w-4 h-4"/>
              {loading ? "Searching..." : "Search Stations"}
            </button>

            <button
              onClick={clearFilters}
              className="border py-2 px-4 rounded-lg flex items-center gap-2"
            >
              <X className="w-4 h-4"/>
              Clear
            </button>

          </div>

        </div>

        {/* Scrollable Search Results */}

        {hasSearched && (

          <div className="bg-white rounded-xl shadow p-6 mt-6 max-h-[65vh] overflow-y-auto">

            <h2 className="text-lg font-bold mb-4">
              Search Results ({searchResults.length})
            </h2>

            <div className="space-y-4 pr-2">

              {searchResults.map(result => {

                const station = result.station;

                return(

                  <div
                    key={station.id}
                    className="border rounded-xl p-4 hover:shadow"
                  >

                    <div className="flex justify-between">

                      <div>

                        <div className="flex items-center gap-3">

                          <h3 className="font-bold text-gray-800">
                            {station.name}
                          </h3>

                          <span
                            className={`text-xs px-2 py-1 rounded-full border ${getStatusColor(result.status)}`}
                          >
                            {result.status}
                          </span>

                        </div>

                        <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                          <MapPin className="w-3 h-3"/>
                          {station.location}
                        </p>

                        <p className="text-sm text-gray-500 mt-1">
                          ID: #{station.id} | Region: {station.region} | State: {station.state}
                        </p>

                      </div>

                      <div className="text-right">

                        <p className="text-3xl font-bold text-sky-600">
                          {Math.round(result.wqi)}
                        </p>

                        <p className="text-xs text-gray-400">
                          WQI
                        </p>

                      </div>

                    </div>

                    <div className="flex gap-2 mt-4">

                      <button
                        onClick={()=>handleViewReadings(station.id)}
                        className="flex-1 bg-sky-600 text-white py-2 rounded-lg"
                      >
                        View Readings →
                      </button>

                      <button
                        onClick={()=>handleViewOnMap(station)}
                        className="border px-4 py-2 rounded-lg"
                      >
                        View on Map
                      </button>

                    </div>

                  </div>

                );

              })}

            </div>

          </div>

        )}

      </div>

      {/* Right Panel */}

      <div className="w-80 bg-white p-6 shadow">

        <h2 className="font-bold mb-4 flex items-center gap-2">
           <History className="w-5 h-5 text-sky-600"/>
           Quick Stats
         </h2>

       <p>Total Stations: {searchResults.length}</p>

       <p className="text-green-600">
         Excellent Quality: {excellentCount}
       </p>

       <p className="text-red-600">
         Needs Attention: {poorCount}
       </p>

      </div>

    </div>

  );

};

export default SearchPage;