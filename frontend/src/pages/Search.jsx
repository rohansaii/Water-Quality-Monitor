import { API_BASE_URL } from '../config';
import { useState, useEffect, useMemo } from "react";
import Select from "react-select";
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
  Bell
} from "lucide-react";

const SearchPage = () => {

  const navigate = useNavigate();

  const [searchQuery,setSearchQuery] = useState("");
  const [selectedRegion,setSelectedRegion] = useState(null);
  const [selectedState,setSelectedState] = useState(null);
  const [stationId,setStationId] = useState("");
  const [country, setCountry] = useState("India");
  const [stateCode, setStateCode] = useState("CA");

  const [allStationsForFilters, setAllStationsForFilters] = useState([]);
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
        `${API_BASE_URL}/api/stations`,
        {
          headers:{
            Authorization:`Bearer ${token}`
          }
        }
      );

      if(response.ok){
        const data = await response.json();
        setAllStationsForFilters(data);
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

      if(searchQuery) params.append("search",searchQuery);
      params.append("country", country);
      if (country === "USA") {
        params.append("state", stateCode);
      } else {
        if(selectedRegion && selectedRegion.value) params.append("region",selectedRegion.value);
        if(selectedState && selectedState.value) params.append("state",selectedState.value);
      }

      const response = await fetch(
        `${API_BASE_URL}/api/stations?${params.toString()}`,
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
    setSelectedRegion(null);
    setSelectedState(null);
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

  const regionOptions = useMemo(() => {
    const uniqueRegions = [...new Set(allStationsForFilters.map(s => s.region).filter(Boolean))];
    return [
      { value: "", label: "All Regions" },
      ...uniqueRegions.map(r => ({ value: r, label: r }))
    ];
  }, [allStationsForFilters]);

  const stateOptions = useMemo(() => {
    let relevantStations = allStationsForFilters;
    if (selectedRegion && selectedRegion.value !== "") {
      relevantStations = allStationsForFilters.filter(s => s.region === selectedRegion.value);
    }
    const uniqueStates = [...new Set(relevantStations.map(s => s.state).filter(Boolean))];
    return [
      { value: "", label: "All States" },
      ...uniqueStates.map(s => ({ value: s, label: s }))
    ];
  }, [allStationsForFilters, selectedRegion]);

  const handleRegionChange = (option) => {
    setSelectedRegion(option);
    setSelectedState(null);
  };

  return (

    <div className="min-h-screen flex bg-sky-50">

      {/* Sidebar */}

      <div className="w-64 bg-sky-600 text-white flex flex-col p-6 shadow-xl">

        <h2 className="text-2xl font-bold mb-8 flex items-center gap-2">
          <Droplets className="w-6 h-6"/>
          WQM
        </h2>

        <ul className="space-y-2 flex-1">

          {/* <li
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
          </li> */}
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

  {/* ✅ NEW: Alert History */}
  <li
    onClick={()=>navigate("/alert-history")}
    className="hover:bg-sky-500 p-3 rounded-lg cursor-pointer flex items-center gap-2"
  >
    <History className="w-4 h-4"/>
    Alert History
  </li>

  {/* ✅ NEW: Auto Alerts */}
  <li
    onClick={()=>navigate("/auto-alerts")}
    className="hover:bg-sky-500 p-3 rounded-lg cursor-pointer flex items-center gap-2"
  >
    <Bell className="w-4 h-4"/>
    Auto Alerts
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

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

            {country === "USA" ? (
              <>
                <select
                  value={stateCode}
                  onChange={(e) => setStateCode(e.target.value)}
                  className="w-full min-w-0 border rounded-lg p-2 bg-white truncate"
                >
                  <option value="CA">California</option>
                  <option value="TX">Texas</option>
                  <option value="NY">New York</option>
                  <option value="FL">Florida</option>
                  <option value="WA">Washington</option>
                </select>
                <div className="w-full min-w-0 border rounded-lg p-2 bg-gray-50 text-gray-400 flex items-center truncate">
                  Region disabled
                </div>
              </>
            ) : (
              <>
                <Select
                  options={regionOptions}
                  value={selectedRegion}
                  onChange={handleRegionChange}
                  placeholder="Search Regions..."
                  isSearchable={true}
                  className="w-full text-sm"
                  styles={{ control: (base) => ({ ...base, borderRadius: '0.5rem', padding: '0.125rem', borderColor: '#e5e7eb' }) }}
                />

                <Select
                  options={stateOptions}
                  value={selectedState}
                  onChange={(option) => setSelectedState(option)}
                  placeholder="Search States..."
                  isSearchable={true}
                  isDisabled={!selectedRegion || selectedRegion.value === ""}
                  className="w-full text-sm"
                  styles={{ control: (base) => ({ ...base, borderRadius: '0.5rem', padding: '0.125rem', borderColor: '#e5e7eb' }) }}
                />
              </>
            )}

            <select
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="w-full min-w-0 border rounded-lg p-2 bg-white text-sky-900 font-medium truncate"
            >
              <option value="India">India</option>
              <option value="USA">USA</option>
            </select>

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

              {searchResults.map(station => {

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
                              className={`text-xs px-2 py-1 rounded-full border ${getStatusColor(station.status)}`}
                            >
                              {station.status}
                            </span>

                          </div>

                          <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                            <MapPin className="w-3 h-3"/>
                            {station.location}
                          </p>

                          <p className="text-sm text-gray-500 mt-1">
                            ID: #{station.id} | {station.country === "USA" ? `State: ${station.state} | Country: USA` : `Region: ${station.region} | State: ${station.state}`}
                          </p>

                        </div>

                      <div className="text-right">

                        <p className="text-3xl font-bold text-sky-600">
                          {station.wqi ? Math.round(station.wqi) : "-"}
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

      {/* <div className="w-80 bg-white p-6 shadow">

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

      </div> */}

    </div>

  );

};

export default SearchPage;