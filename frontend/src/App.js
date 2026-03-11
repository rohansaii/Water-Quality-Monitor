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
import Reports from "./pages/Reports"; // 1. Import the Reports page you created
import AuthLayout from "./components/AuthLayout"; 

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

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

        {/* 2. Added Reports Route here to fix "Page Not Found" */}
        <Route 
          path="/reports"
          element={
            <AuthLayout>
              <Reports />
            </AuthLayout>
          }
        />
        
        <Route path="*" element={<div>Page Not Found</div>} />
      </Routes>
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