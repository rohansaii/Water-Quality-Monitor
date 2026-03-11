// import { useState } from "react";
// import { useNavigate, Link } from "react-router-dom";

// const Login = () => {
//   const navigate = useNavigate();
//   const [formData, setFormData] = useState({
//     email: "",
//     password: ""
//   });

//   const handleChange = (e) => {
//     setFormData({
//       ...formData,
//       [e.target.name]: e.target.value
//     });
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     try {
//       const response = await fetch("http://127.0.0.1:5000/login", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json"
//         },
//         body: JSON.stringify(formData)
//       });

//       const data = await response.json();

//       if (response.ok) {
//         // ✅ KEY FIX: Save 'token' to match AuthLayout
//         localStorage.setItem("token", data.token);
//         // Optional: Save user name to show on dashboard
//         localStorage.setItem("userName", data.user.name);
        
//         navigate("/dashboard");
//       } else {
//         alert(data.message || "Invalid Credentials");
//       }
//     } catch (error) {
//       console.error("Login Error:", error);
//       alert("Cannot connect to server. Is Flask running?");
//     }
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-sky-500 p-4">
//       <div className="bg-white rounded-2xl shadow-2xl flex flex-col md:flex-row overflow-hidden max-w-6xl w-full min-h-[600px]">
        
//         {/* Left Side - Image */}
//         <div className="md:w-1/2 bg-sky-100 flex items-center justify-center">
//           <img 
//             src="/loginimg.png"
//             alt="Login Illustration" 
//             className="h-full w-full object-cover"
//           />
//         </div>

//         {/* Right Side - Form */}
//         <div className="md:w-1/2 p-8 md:p-12">
//           <div className="flex justify-center mb-4">
//             <div className="bg-sky-100 p-4 rounded-full">
//               <span className="text-2xl text-sky-700">🧪</span>
//             </div>
//           </div>

//           <h2 className="text-2xl font-bold text-center text-gray-800">Welcome Back</h2>
//           <p className="text-gray-500 text-center mb-8">Sign in to Water Quality Monitor</p>

//           <form className="space-y-5" onSubmit={handleSubmit}>
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
//               <input
//                 type="email"
//                 name="email"
//                 required
//                 placeholder="Enter your email"
//                 onChange={handleChange}
//                 className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-400 outline-none"
//               />
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
//               <input
//                 type="password"
//                 name="password"
//                 required
//                 placeholder="Enter your password"
//                 onChange={handleChange}
//                 className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-400 outline-none"
//               />
//             </div>

//             <button
//               type="submit"
//               className="w-full bg-sky-600 text-white py-3 rounded-lg font-semibold hover:bg-sky-700 shadow-md transition-colors"
//             >
//               Sign In
//             </button>
//           </form>

//           <p className="text-sm text-center mt-8 text-gray-600">
//             Don't have an account?{" "}
//             <Link to="/signup" className="text-sky-600 font-bold hover:underline">
//               Sign Up
//             </Link>
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Login;


import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("http://127.0.0.1:5000/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        // ✅ Save all necessary user info for the Dashboard
        localStorage.setItem("token", data.token);
        localStorage.setItem("userName", data.user.name);
        localStorage.setItem("userRole", data.user.role); // Role from Backend
        
        navigate("/dashboard");
      } else {
        alert(data.message || "Invalid Credentials");
      }
    } catch (error) {
      console.error("Login Error:", error);
      alert("Cannot connect to server. Please check if Flask is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-sky-500 p-4">
      <div className="bg-white rounded-2xl shadow-2xl flex flex-col md:flex-row overflow-hidden max-w-6xl w-full min-h-[600px]">
        
        {/* Left Side - Illustration */}
        <div className="md:w-1/2 bg-sky-100 flex items-center justify-center">
          <img 
            src="/loginimg.png"
            alt="Login Illustration" 
            className="h-full w-full object-cover"
          />
        </div>

        {/* Right Side - Form */}
        <div className="md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
          <div className="flex justify-center mb-4">
            <div className="bg-sky-100 p-4 rounded-full">
              <span className="text-2xl text-sky-700">🧪</span>
            </div>
          </div>

          <h2 className="text-3xl font-bold text-center text-gray-800">Welcome Back</h2>
          <p className="text-gray-500 text-center mb-8">Sign in to Water Quality Monitor</p>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <input
                type="email"
                name="email"
                required
                placeholder="name@company.com"
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-400 outline-none transition-all"
              />
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <label className="text-sm font-medium text-gray-700">Password</label>
                <a href="#!" className="text-xs text-sky-600 hover:underline">Forgot password?</a>
              </div>
              <input
                type="password"
                name="password"
                required
                placeholder="••••••••"
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-400 outline-none transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 rounded-lg font-semibold text-white shadow-md transition-all ${
                loading ? "bg-gray-400 cursor-not-allowed" : "bg-sky-600 hover:bg-sky-700"
              }`}
            >
              {loading ? "Signing In..." : "Sign In"}
            </button>
          </form>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center"><span className="w-full border-t"></span></div>
            <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-2 text-gray-500">Or continue with</span></div>
          </div>

          <p className="text-sm text-center text-gray-600">
            Don't have an account?{" "}
            <Link to="/signup" className="text-sky-600 font-bold hover:underline">
              Create an Account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
