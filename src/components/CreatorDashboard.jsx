import { useState } from "react";
import API from "../api";

export default function CreatorDashboard() {
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState("");

  const upload = async () => {
    const form = new FormData();
    form.append("image", file);
    form.append("title", title);

    await API.post("/upload", form);
    alert("Photo Uploaded!");
  };

  return (
    <div>
      <h2>Creator Upload</h2>
      <input type="file" onChange={(e) => setFile(e.target.files[0])} />
      <input placeholder="Title" onChange={(e) => setTitle(e.target.value)} />
      <button onClick={upload}>Upload</button>
    </div>
  );
}
