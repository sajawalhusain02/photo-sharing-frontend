import { useEffect, useState } from "react";
import API from "./api";
import "./App.css";

import ConsumerDashboard from "./components/ConsumerDashboard";

export default function App() {
  const [email, setEmail] = useState("creator@photoapp.com");
  const [password, setPassword] = useState("123456");
  const [user, setUser] = useState(null);
  const [msg, setMsg] = useState("");

  // creator upload fields
  const [title, setTitle] = useState("");
  const [caption, setCaption] = useState("");
  const [location, setLocation] = useState("");
  const [people, setPeople] = useState("");
  const [file, setFile] = useState(null);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) setUser(JSON.parse(savedUser));
  }, []);

  const login = async (e) => {
    e.preventDefault();
    setMsg("");
    try {
      const res = await API.post("/api/auth/login", { email, password });
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      setUser(res.data.user);
      setMsg("✅ Login successful");
    } catch (err) {
      setMsg(err?.response?.data?.error || err.message || "Network Error");
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setMsg("Logged out");
  };

  const uploadPhoto = async (e) => {
    e.preventDefault();
    setMsg("");

    if (!file) {
      setMsg("Please choose a file");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("title", title);
      formData.append("caption", caption);
      formData.append("location", location);
      formData.append("people", people);

      await API.post("/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setMsg("✅ Uploaded successfully (refresh consumer to view)");
      setTitle("");
      setCaption("");
      setLocation("");
      setPeople("");
      setFile(null);
    } catch (err) {
      setMsg(err?.response?.data?.error || err.message || "Upload failed");
    }
  };

  if (!user) {
    return (
      <div style={{ padding: 40 }}>
        <h1>PhotoApp</h1>

        <form onSubmit={login} style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email" style={{ width: 220 }} />
          <input
            value={password}
            type="password"
            onChange={(e) => setPassword(e.target.value)}
            placeholder="password"
            style={{ width: 220 }}
          />
          <button type="submit">Login</button>
        </form>

        <p style={{ marginTop: 15 }}>{msg}</p>

        <div style={{ marginTop: 20, opacity: 0.7 }}>
          <div>Creator: creator@photoapp.com / 123456</div>
          <div>Consumer: consumer@photoapp.com / 123456</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: 40 }}>
      <h1>PhotoApp</h1>

      <div style={{ marginBottom: 10 }}>
        Logged in as: <b>{user.email}</b> | Role: <b>{user.role}</b>{" "}
        <button onClick={logout} style={{ marginLeft: 10 }}>
          Logout
        </button>
      </div>

      <p>{msg}</p>

      {user.role === "creator" ? (
        <div style={{ marginTop: 20 }}>
          <h2>Creator Dashboard (Upload)</h2>

          <form onSubmit={uploadPhoto} style={{ display: "grid", gap: 10, maxWidth: 420 }}>
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" />
            <input value={caption} onChange={(e) => setCaption(e.target.value)} placeholder="Caption" />
            <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Location" />
            <input value={people} onChange={(e) => setPeople(e.target.value)} placeholder="People present (comma separated)" />

            <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} />

            <button type="submit">Upload Photo</button>
          </form>
        </div>
      ) : (
        <ConsumerDashboard setMsg={setMsg} />
      )}
    </div>
  );
}
