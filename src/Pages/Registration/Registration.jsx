import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/api";
import { statesAndLgas } from "../../data/statesAndLgas";
import "./Registration.css";

const Registration = ({ onLogin }) => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    national_id: "",
    first_name: "",
    last_name: "",
    date_of_birth: "",
    state: "",
    lga: "",
    vin: "",
    profile_pic: null,
    password: "",
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "", type: "" });

  const showToast = (message, type = "error") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "" }), 3500);
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
      ...(name === "state" ? { lga: "" } : {}),
    }));

    // Clear error for this field while typing
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.national_id) newErrors.national_id = "National ID is required.";
    if (!formData.first_name) newErrors.first_name = "First Name is required.";
    if (!formData.last_name) newErrors.last_name = "Last Name is required.";
    if (!formData.date_of_birth) newErrors.date_of_birth = "Date of birth is required.";

    if (!formData.state) newErrors.state = "State is required.";
    if (!formData.lga) newErrors.lga = "LGA is required.";

    if (!formData.vin) newErrors.vin = "VIN is required.";
    else if (formData.vin.length !== 17) newErrors.vin = "VIN must be 17 characters.";

    if (!formData.profile_pic) newErrors.profile_pic = "Profile picture is required.";

    if (!formData.password) newErrors.password = "Password is required.";
    else if (formData.password.length < 6) newErrors.password = "Password must be at least 6 characters.";

    // Age check
    if (formData.date_of_birth) {
      const dob = new Date(formData.date_of_birth);
      const today = new Date();
      let age = today.getFullYear() - dob.getFullYear();
      const m = today.getMonth() - dob.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--;
      if (age < 18) newErrors.date_of_birth = "You must be at least 18 years old.";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      // Show first error as toast
      const firstError = Object.values(newErrors)[0];
      showToast(firstError);
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);

    try {
      const data = new FormData();
      Object.entries(formData).forEach(([key, value]) => value && data.append(key, value));

      await api.post("/auth/register/", data, { headers: { "Content-Type": "multipart/form-data" } });

      // Login immediately
      const loginRes = await api.post("/auth/login/", {
        national_id: formData.national_id,
        password: formData.password,
      });

      const userData = {
        first_name: loginRes.data.user.first_name,
        last_name: loginRes.data.user.last_name,
        national_id: loginRes.data.user.national_id,
        dob: loginRes.data.user.dob,
        state: loginRes.data.user.state,
        lga: loginRes.data.user.lga,
        vin: loginRes.data.user.vin,
        profile_pic: loginRes.data.user.profile_pic,
      };

      const accessToken = loginRes.data.access;
      const refreshToken = loginRes.data.refresh;

      localStorage.setItem("user", JSON.stringify(userData));
      localStorage.setItem("access_token", accessToken);
      localStorage.setItem("refresh_token", refreshToken);

      if (onLogin) onLogin(userData, accessToken, refreshToken);

      showToast("🎉 Registration Successful!", "success");
      setTimeout(() => navigate("/Election"), 1200);
    } catch (err) {
      console.error(err.response?.data || err);
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.response?.data?.detail ||
        "Registration failed.";
      showToast(`❌ ${msg}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="reg-container">
      {toast.show && <div className={`toast ${toast.type}`}>{toast.message}</div>}

      <form onSubmit={handleSubmit} className="reg-card">
        <h2>Create Account</h2>

        <input
          name="national_id"
          placeholder="National ID"
          value={formData.national_id}
          onChange={handleChange}
          className={errors.national_id ? "error-input" : ""}
        />
        <input
          name="first_name"
          placeholder="First Name"
          value={formData.first_name}
          onChange={handleChange}
          className={errors.first_name ? "error-input" : ""}
        />
        <input
          name="last_name"
          placeholder="Last Name"
          value={formData.last_name}
          onChange={handleChange}
          className={errors.last_name ? "error-input" : ""}
        />
        <input
          type="date"
          name="date_of_birth"
          value={formData.date_of_birth}
          onChange={handleChange}
          className={errors.date_of_birth ? "error-input" : ""}
        />

        <select
          name="state"
          value={formData.state}
          onChange={handleChange}
          className={errors.state ? "error-input" : ""}
        >
          <option value="">Choose State</option>
          {Object.keys(statesAndLgas).map((st) => (
            <option key={st} value={st}>
              {st}
            </option>
          ))}
        </select>

        <select
          name="lga"
          value={formData.lga}
          onChange={handleChange}
          disabled={!formData.state}
          className={errors.lga ? "error-input" : ""}
        >
          <option value="">Choose Local Government</option>
          {formData.state &&
            statesAndLgas[formData.state].map((lga) => (
              <option key={lga} value={lga}>
                {lga}
              </option>
            ))}
        </select>

        <input
          name="vin"
          placeholder="VIN (17 characters)"
          value={formData.vin}
          onChange={handleChange}
          className={errors.vin ? "error-input" : ""}
        />

        <label>Profile Picture</label>
        <input
          type="file"
          name="profile_pic"
          onChange={handleChange}
          className={errors.profile_pic ? "error-input" : ""}
        />

        <div className="password-wrapper">
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            className={errors.password ? "error-input" : ""}
          />
          <span className="toggle-password" onClick={() => setShowPassword(!showPassword)}>
            {showPassword ? "Hide" : "Show"}
          </span>
        </div>

        <button type="submit" disabled={loading}>
          {loading ? <span className="spinner"></span> : "Register"}
        </button>
      </form>
    </div>
  );
};

export default Registration;




// import React, { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import api from "../../api/api";
// import { statesAndLgas } from "../../data/statesAndLgas";
// import "./Registration.css";

// const Registration = ({ onLogin }) => {
//   const navigate = useNavigate();

//   const [formData, setFormData] = useState({
//     national_id: "",
//     first_name: "",
//     last_name: "",
//     date_of_birth: "",
//     state: "",
//     lga: "",
//     vin: "",
//     profile_pic: null,
//     password: "",
//   });

//   const [showPassword, setShowPassword] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [toast, setToast] = useState({ show: false, message: "", type: "" });

//   const showToast = (message, type = "success") => {
//     setToast({ show: true, message, type });
//     setTimeout(() => setToast({ show: false, message: "", type: "" }), 3500);
//   };

//   const handleChange = (e) => {
//     const { name, value, files } = e.target;

//     if (name === "state") {
//       setFormData({ ...formData, state: value, lga: "" });
//       return;
//     }

//     if (files) {
//       setFormData({ ...formData, [name]: files[0] });
//     } else {
//       setFormData({ ...formData, [name]: value });
//     }
//   };

//   const validateForm = () => {
//     if (!formData.national_id || !formData.first_name || !formData.last_name) {
//       showToast("Please fill all required fields.", "error");
//       return false;
//     }

//     if (!formData.vin || formData.vin.length !== 17) {
//       showToast("VIN must be exactly 17 characters.", "error");
//       return false;
//     }

//     if (!formData.date_of_birth) {
//       showToast("Please select your date of birth.", "error");
//       return false;
//     }

//     const dob = new Date(formData.date_of_birth);
//     const today = new Date();
//     let age = today.getFullYear() - dob.getFullYear();
//     const m = today.getMonth() - dob.getMonth();
//     if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--;
//     if (age < 18) {
//       showToast("You must be at least 18 years old to register.", "error");
//       return false;
//     }

//     if (!formData.profile_pic) {
//       showToast("Please upload a profile picture.", "error");
//       return false;
//     }

//     if (!formData.password || formData.password.length < 6) {
//       showToast("Password must be at least 6 characters.", "error");
//       return false;
//     }

//     return true;
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (!validateForm()) return;
//     setLoading(true);

//     try {
//       const data = new FormData();
//       Object.entries(formData).forEach(([key, value]) => value && data.append(key, value));

//       // REGISTER
//       await api.post("/auth/register/", data, {
//         headers: { "Content-Type": "multipart/form-data" },
//       });

//       // LOGIN immediately after register
//       const loginRes = await api.post("/auth/login/", {
//         national_id: formData.national_id,
//         password: formData.password,
//       });

//       const userData = {
//         first_name: loginRes.data.user.first_name,
//         last_name: loginRes.data.user.last_name,
//         national_id: loginRes.data.user.national_id,
//         dob: loginRes.data.user.dob,
//         state: loginRes.data.user.state,
//         lga: loginRes.data.user.lga,
//         vin: loginRes.data.user.vin,
//         profile_pic: loginRes.data.user.profile_pic,
//       };

//       const accessToken = loginRes.data.access;
//       const refreshToken = loginRes.data.refresh;

//       // STORE AUTH DATA
//       localStorage.setItem("user", JSON.stringify(userData));
//       localStorage.setItem("access_token", accessToken);
//       localStorage.setItem("refresh_token", refreshToken);

//       // Update App.jsx state
//       if (onLogin) onLogin(userData, accessToken, refreshToken);

//       showToast("🎉 Registration Successful!", "success");

//       // redirect
//       setTimeout(() => navigate("/Election"), 1200);
//     } catch (err) {
//       console.error(err.response?.data || err);
//       const msg =
//         err.response?.data?.message ||
//         err.response?.data?.error ||
//         err.response?.data?.detail ||
//         "Registration failed.";
//       showToast(`❌ ${msg}`, "error");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="reg-container">
//       {toast.show && <div className={`toast ${toast.type}`}>{toast.message}</div>}

//       <form onSubmit={handleSubmit} className="reg-card">

//         <h2>Create Account</h2>

//         <input name="national_id" placeholder="National ID"
//           value={formData.national_id} onChange={handleChange} />

//         <input name="first_name" placeholder="First Name"
//           value={formData.first_name} onChange={handleChange} />

//         <input name="last_name" placeholder="Last Name"
//           value={formData.last_name} onChange={handleChange} />

//         <input type="date" name="date_of_birth"
//           value={formData.date_of_birth} onChange={handleChange} />

//         <select name="state" value={formData.state} onChange={handleChange}>
//           <option value="">Choose State</option>
//           {Object.keys(statesAndLgas).map((st) => (
//             <option key={st} value={st}>{st}</option>
//           ))}
//         </select>

//         <select name="lga" value={formData.lga}
//           onChange={handleChange} disabled={!formData.state}>
//           <option value="">Choose Local Government</option>
//           {formData.state &&
//             statesAndLgas[formData.state].map((lga) => (
//               <option key={lga} value={lga}>{lga}</option>
//             ))}
//         </select>

//         <input name="vin" placeholder="VIN (17 characters)"
//           value={formData.vin} onChange={handleChange} />

//         <label>Profile Picture</label>
//         <input type="file" name="profile_pic" onChange={handleChange} />

//         <div className="password-wrapper">
//           <input type={showPassword ? "text" : "password"} 
//             name="password" placeholder="Password"
//             value={formData.password} onChange={handleChange} />
//           <span className="toggle-password" onClick={() => setShowPassword(!showPassword)}>
//             {showPassword ? "Hide" : "Show"}
//           </span>
//         </div>

//         <button type="submit" disabled={loading}>
//           {loading ? <span className="spinner"></span> : "Register"}
//         </button>

//       </form>
//     </div>
//   );
// };

// export default Registration;


