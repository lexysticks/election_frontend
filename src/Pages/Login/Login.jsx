import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/api";
import "./Login.css";
import loginIllustration from "../../assets/login.jpeg";

const Login = ({ onLogin }) => {
  const navigate = useNavigate();
  const [values, setValues] = useState({ national_id: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setValues({ ...values, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await api.post("/auth/login/", values);

      // Correctly access profile_pic from res.data.user
      const userData = {
        profile_pic: res.data.user.profile_pic,
        first_name: res.data.user.first_name,
        last_name: res.data.user.last_name,
        national_id: res.data.user.national_id,
        dob: res.data.user.dob,
        state: res.data.user.state,
        lga: res.data.user.lga,
        vin: res.data.user.vin,
      };

      const accessToken = res.data.access;
      const refreshToken = res.data.refresh;

      // Update App state
      if (onLogin) onLogin(userData, accessToken, refreshToken);

      // Store tokens and user data
      localStorage.setItem("user", JSON.stringify(userData));
      localStorage.setItem("access_token", accessToken);
      localStorage.setItem("refresh_token", refreshToken);

      navigate("/Election");
    } catch (err) {
      console.error(err);
      alert("Invalid National ID or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-left">
        <img src={loginIllustration} alt="login" />
      </div>

      <div className="auth-right">
        <div className="auth-card">
          <h2>National Election Login</h2>
          <p className="auth-sub">Welcome back, please login to continue</p>

          <form onSubmit={handleSubmit}>
            <label>National ID</label>
            <input
              type="text"
              name="national_id"
              placeholder="Enter National ID"
              value={values.national_id}
              onChange={handleChange}
              required
            />

            <label>Password</label>
            <div className="password-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Enter Password"
                valu e={values.password}
                onChange={handleChange}
                required
              />
              <span
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? "Hide" : "Show"}
              </span>
            </div>

            <button className="auth-btn" type="submit" disabled={loading}>
              {loading ? <div className="spinner"></div> : "Login"}
            </button>
          </form>

          <p className="auth-footer">
            No account?
            <span
              className="auth-link"
              onClick={() => navigate("/registration")}
            >
              Register here
            </span>
          </p>

          <p className="auth-footer">
            <span className="auth-link" onClick={() => navigate("/")}>
              Back to Home
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;






