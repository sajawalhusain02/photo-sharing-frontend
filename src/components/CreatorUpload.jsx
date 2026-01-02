import { useState } from "react";
import API from "../api";

export default function CreatorUpload() {
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState("");
  const [caption, setCaption] = useState("");
  const [location, setLocation] = useState("");
  const [people, setPeople] = useState("");
  const [msg, setMsg] = useState("");

  const upload = async (e) => {
    e.preventDefault();
    setMsg("");

    if (!file) return setMsg("❌ Please choose a file");

    try {
      const fd = new FormData();
      fd.append("image", file);
      fd.append("title", title);
      fd.append("caption", caption);
      fd.append("location", location);
      fd.append("people", people);

      // ✅ backend is POST /upload (you tested in Postman)
      const res = await API.post("/upload", fd);

      setMsg(`✅ Uploaded! Saved to Cosmos. ID: ${res?.data?.media?.id || "ok"}`);
      setFile(null);
      setTitle("");
      setCaption("");
      setLocation("");
      setPeople("");
    } catch (err) {
      setMsg(err?.response?.data?.error || err?.response?.data?.message || err?.message || "Upload failed");
    }
  };

  return (
    <div style={{ marginTop: 20 }}>
      <h2>Creator Upload</h2>

      <form onSubmit={upload} className="formCol">
        <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0])} />
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" />
        <input value={caption} onChange={(e) => setCaption(e.target.value)} placeholder="Caption" />
        <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Location" />
        <input value={people} onChange={(e) => setPeople(e.target.value)} placeholder="People (comma separated)" />

        <button type="submit">Upload Photo</button>
      </form>

      {msg && <p className="msg">{msg}</p>}
      <p style={{ fontSize: 13, opacity: 0.8 }}>
        Note: image preview is optional. Consumer feed will display images (required).
      </p>
    </div>
  );
}
