import { useEffect } from "react";
import api from "../../api/api"; // adjust path to your axios instance

export default function TestCors() {
  useEffect(() => {
    // OPTIONS preflight request
    api.options("/auth/login-cors-test/")
      .then(res => console.log("OPTIONS response:", res))
      .catch(err => console.error("OPTIONS error:", err));

    // POST request
    api.post("/auth/login-cors-test/", { username: "test" })
      .then(res => console.log("POST response:", res))
      .catch(err => console.error("POST error:", err));
  }, []);

  return <div>Check console for CORS test results</div>;
}
