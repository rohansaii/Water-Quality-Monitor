import { API_BASE_URL } from '../config';
import { useState } from "react";

const ResetPassword = ()=>{

const [form,setForm] = useState({
email:"",
otp:"",
password:""
})

const handleChange=(e)=>{
setForm({...form,[e.target.name]:e.target.value})
}

const handleSubmit = async(e)=>{
e.preventDefault()

const res = await fetch(`${API_BASE_URL}/api/auth/reset-password`,{
method:"POST",
headers:{
"Content-Type":"application/json"
},
body:JSON.stringify(form)
})

const data = await res.json()

if(res.ok){
alert("Password Reset Successful")
window.location.href="/"
}else{
alert(data.detail)
}
}

return(
<div className="min-h-screen flex items-center justify-center bg-sky-500">

<div className="bg-white p-8 rounded-xl w-96">

<h2 className="text-xl font-bold mb-4 text-center">
Reset Password
</h2>

<form onSubmit={handleSubmit} className="space-y-4">

<input
name="email"
placeholder="Email"
onChange={handleChange}
className="w-full border p-2 rounded"
/>

<input
name="otp"
placeholder="OTP"
onChange={handleChange}
className="w-full border p-2 rounded"
/>

<input
type="password"
name="password"
placeholder="New Password"
onChange={handleChange}
className="w-full border p-2 rounded"
/>

<button className="w-full bg-sky-600 text-white py-2 rounded">
Reset Password
</button>

</form>

</div>

</div>
)

}

export default ResetPassword