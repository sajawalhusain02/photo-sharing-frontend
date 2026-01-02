import { useEffect, useState } from "react";
import API from "../api";
import PhotoCard from "./PhotoCard";

export default function ConsumerFeed() {
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [msg, setMsg] = useState("");

  const load = async () => {
    setMsg("");
    try {
      // ✅ Your backend already returns { ok, page, limit, count, items }
      const res = await API.get("/api/media", {
        params: { page, limit: 10, search }, // if your backend uses "title" or "q", change here
      });
      setItems(res.data.items || []);
    } catch (err) {
      setMsg(err?.response?.data?.error || err?.response?.data?.message || err?.message || "Failed to load feed");
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const onSearch = (e) => {
    e.preventDefault();
    setPage(1);
    load();
  };

  return (
    <div style={{ marginTop: 20 }}>
      <h2>Consumer Feed</h2>

      <form onSubmit={onSearch} className="row">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by title..."
        />
        <button type="submit">Search</button>
      </form>

      {msg && <p className="msg">{msg}</p>}

      <div className="grid">
        {items.map((m) => (
          <PhotoCard key={m.id} media={m} />
        ))}
      </div>

      <div className="row" style={{ marginTop: 14 }}>
        <button className="btnSecondary" onClick={() => setPage((p) => Math.max(1, p - 1))}>
          Prev
        </button>
        <div style={{ padding: "0 10px" }}>Page {page}</div>
        <button className="btnSecondary" onClick={() => setPage((p) => p + 1)}>
          Next
        </button>
      </div>
    </div>
  );
}
