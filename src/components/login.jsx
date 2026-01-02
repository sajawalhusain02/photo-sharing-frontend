import { useState } from "react";
import API from "../api";


export default function Login({ setUser }) {
  const [email, setEmail] = useState("creator@photoapp.com");
  const [password, setPassword] = useState("123456");
  const [msg, setMsg] = useState("");

  const login = async () => {
    setMsg("");
    try {
      const res = await API.post("/auth/login", { email, password });

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      setUser(res.data.user);
      setMsg("✅ Logged in");
    } catch (err) {
      setMsg(err?.response?.data?.message || err?.message || "Login failed");
    }
  };

  return (
    <div>
      <h2>Login</h2>
      <input value={email} onChange={(e) => setEmail(e.target.value)} />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button onClick={login}>Login</button>
      {msg && <p>{msg}</p>}
    </div>
  );
}
