
import { useState } from "react";
import { API_ENDPOINTS } from "./apiConfig";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(
        API_ENDPOINTS.AUTH.LOGIN,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ email, password })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Login failed");
        return;
      }

      setMessage("Welcome " + data.name + "!");

      localStorage.setItem("user", JSON.stringify(data));

      if (data.role === "WARDEN") {
        window.location.href = "/warden";
      } else if (data.role === "STUDENT") {
        window.location.href = "/student";
      } else if (data.role === "VENDOR") {
        window.location.href = "/vendor";
      }
    } catch (error) {
      setMessage("Backend not connected. Start Spring Boot.");
    }
  };

  return (
    <div className="login-container">
      <h2>HostelConnect Login</h2>

      <form onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="Enter Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Enter Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button type="submit">Login</button>
      </form>

      <p>{message}</p>
    </div>
  );
}

export default Login;
