// import axios from "axios";

// // -------------------------
// // Create axios instance
// // -------------------------
// const api = axios.create({
//   baseURL: "http://127.0.0.1:8000",
//   headers: {
//     "Content-Type": "application/json",
//   },
//   withCredentials: true, // if you want cookies for refresh token
// });

// // -------------------------
// // Request interceptor
// // -------------------------
// api.interceptors.request.use((config) => {
//   const token = localStorage.getItem("token"); // access token
//   if (token) {
//     config.headers.Authorization = `Bearer ${token}`;
//   }
//   return config;
// }, (error) => {
//   return Promise.reject(error);
// });

// // -------------------------
// // Response interceptor to handle expired token
// // -------------------------
// api.interceptors.response.use(
//   (response) => response,
//   async (error) => {
//     const originalRequest = error.config;

//     // If 401 or token expired, try refresh token
//     if (error.response && error.response.status === 401 && !originalRequest._retry) {
//       originalRequest._retry = true;
//       const refreshToken = localStorage.getItem("refresh_token");
      
//       if (refreshToken) {
//         try {
//           const res = await axios.post("http://127.0.0.1:8000/auth/token/refresh/", {
//             refresh: refreshToken,
//           });
//           const newAccess = res.data.access;
//           localStorage.setItem("token", newAccess);

//           // Retry the original request with new access token
//           originalRequest.headers.Authorization = `Bearer ${newAccess}`;
//           return api(originalRequest);
//         } catch (err) {
//           console.log("Refresh token failed, logging out");
//           localStorage.removeItem("token");
//           localStorage.removeItem("refresh_token");
//           window.location.href = "/login"; // redirect to login
//         }
//       }
//     }

//     return Promise.reject(error);
//   }
// );

// export default api;

import axios from "axios";

const api = axios.create({
  baseURL: "http://127.0.0.1:8000",
  headers: {
    "Content-Type": "application/json",
  },
  // withCredentials: true, // optional for JWT in localStorage
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response &&
      error.response.status === 401 &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem("refresh_token");

      if (refreshToken) {
        try {
          const res = await axios.post(
            "http://127.0.0.1:8000/auth/token/refresh/",
            { refresh: refreshToken }
          );

          const newAccess = res.data.access;
          localStorage.setItem("access_token", newAccess);

          originalRequest.headers.Authorization = `Bearer ${newAccess}`;
          return api(originalRequest);
        } catch (err) {
          console.log("Refresh token failed, logging out");
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
          window.location.href = "/login";
        }
      }
    }

    return Promise.reject(error);
  }
);

export default api;
