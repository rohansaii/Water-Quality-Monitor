// import { BrowserRouter, Routes, Route } from "react-router-dom";
// import Dashboard from "./pages/Dashboard";
// import MapView from "./pages/MapView";
// import Signup from "./pages/Signup";
// import Login from "./pages/Login";
// // 1. Make sure your import matches your filename
// import AuthLayout from "./components/AuthLayout"; 

// function App() {
//   return (
//     <BrowserRouter>
//       <Routes>
//         <Route path="/" element={<Login />} />
//         <Route path="/signup" element={<Signup />} />

//         {/* 2. Change <ProtectedRoute> to <AuthLayout> here */}
//         <Route 
//           path="/dashboard"
//           element={
//             <AuthLayout>
//               <Dashboard />
//             </AuthLayout>
//           }
//         />

//         {/* 3. Change it here as well */}
//         <Route 
//           path="/map"
//           element={
//             <AuthLayout>
//               <MapView />
//             </AuthLayout>
//           }
//         />
        
//         <Route path="*" element={<div>Page Not Found</div>} />
//       </Routes>
//     </BrowserRouter>
//   );
// }

// export default App;


import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import MapView from "./pages/MapView";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import Reports from "./pages/Reports";
import Search from "./pages/Search";
import StationReadings from "./pages/StationReadings";
import UserReports from "./pages/UserReports";
import Profile from "./pages/Profile";
import Alerts from "./pages/Alerts";
import AlertDetails from "./pages/AlertDetails";
import NgoDashboard from "./pages/NgoDashboard";
import AuthorityDashboard from "./pages/AuthorityDashboard";
import AlertHistory from "./pages/AlertHistory";
import AuthLayout from "./components/AuthLayout";
import PredictiveAlertBanner from "./components/PredictiveAlertBanner";
import { AlertProvider } from "./hooks/AlertContext";
import AutoAlerts from "./pages/AutoAlerts";
import ForgotPassword from "./pages/ForgotPassword";


function App() {
  return (
    <BrowserRouter>
      <AlertProvider>
      <PredictiveAlertBanner />
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* NGO Dashboard Route */}
        <Route 
          path="/ngo/dashboard"
          element={
            <AuthLayout allowedRoles={["ngo", "admin"]}>
              <NgoDashboard />
            </AuthLayout>
          }
        />

        {/* Authority Dashboard Route */}
        <Route 
          path="/authority/dashboard"
          element={
            <AuthLayout allowedRoles={["authority", "admin"]}>
              <AuthorityDashboard />
            </AuthLayout>
          }
        />

        {/* Dashboard Route */}
        <Route 
          path="/dashboard"
          element={
            <AuthLayout>
              <Dashboard />
            </AuthLayout>
          }
        />

        {/* Map View Route */}
        <Route 
          path="/map"
          element={
            <AuthLayout>
              <MapView />
            </AuthLayout>
          }
        />

        {/* Search Route */}
        <Route 
          path="/search"
          element={
            <AuthLayout>
              <Search />
            </AuthLayout>
          }
        />

        {/* Station Readings Route */}
        <Route 
          path="/station/:id/readings"
          element={
            <AuthLayout>
              <StationReadings />
            </AuthLayout>
          }
        />

        {/* Legacy Reports Route - redirects to new UserReports */}
        <Route 
          path="/reports"
          element={
            <AuthLayout>
              <UserReports />
            </AuthLayout>
          }
        />

        {/* Profile Route */}
        <Route 
          path="/profile"
          element={
            <AuthLayout>
              <Profile />
            </AuthLayout>
          }
        />

        {/* Alerts Route */}
        <Route 
          path="/alerts"
          element={
            <AuthLayout>
              <Alerts />
            </AuthLayout>
          }
        />

        {/* Alert Details Route */}
        <Route 
          path="/alerts/:id"
          element={
            <AuthLayout>
              <AlertDetails />
            </AuthLayout>
          }
        />

        {/* Alert History Route */}
        <Route 
          path="/alert-history"
          element={
            <AuthLayout>
              <AlertHistory />
            </AuthLayout>
          }
        />

        {/* Auto Predictive Alerts Route */}
        <Route 
          path="/auto-alerts"
          element={
            <AuthLayout>
              <AutoAlerts />
            </AuthLayout>
          }
        />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        
        <Route path="*" element={<div className="min-h-screen flex items-center justify-center bg-sky-50">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-sky-900 mb-4">404</h1>
            <p className="text-gray-600 mb-6">Page Not Found</p>
            <a href="/dashboard" className="text-sky-600 hover:underline">Go to Dashboard</a>
          </div>
        </div>} />
      </Routes>
      </AlertProvider>
    </BrowserRouter>
  );
}

export default App;



// import { BrowserRouter, Routes, Route } from "react-router-dom";
// import Dashboard from "./pages/Dashboard";
// import MapView from "./pages/MapView";
// import Signup from "./pages/Signup";
// import Login from "./pages/Login";
// import Reports from "./pages/Reports"; 
// import AuthLayout from "./components/AuthLayout"; 

// function App() {
//   return (
//     <BrowserRouter>
//       <Routes>
//         {/* Public Routes */}
//         <Route path="/" element={<Login />} />
//         <Route path="/signup" element={<Signup />} />

//         {/* General Protected Routes (Available to all logged-in users) */}
//         <Route 
//           path="/dashboard"
//           element={
//             <AuthLayout allowedRoles={["citizen", "ngo", "authority", "admin"]}>
//               <Dashboard />
//             </AuthLayout>
//           }
//         />

//         <Route 
//           path="/map"
//           element={
//             <AuthLayout allowedRoles={["citizen", "ngo", "authority", "admin"]}>
//               <MapView />
//             </AuthLayout>
//           }
//         />

//         {/* Restricted Route (Only Authority and Admin) */}
//         <Route 
//           path="/reports"
//           element={
//             <AuthLayout allowedRoles={["authority", "admin"]}>
//               <Reports />
//             </AuthLayout>
//           }
//         />
        
//         {/* Fallback for undefined routes */}
//         <Route path="*" element={
//           <div className="min-h-screen flex items-center justify-center bg-sky-50">
//             <h1 className="text-2xl font-bold text-sky-900">404 - Page Not Found</h1>
//           </div>
//         } />
//       </Routes>
//     </BrowserRouter>
//   );
// }

// export default App;