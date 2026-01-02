import { useEffect, useMemo, useState } from "react";
import API from "../api";

const FALLBACK_CONTAINER = "photos-original";
const STORAGE_ACCOUNT = "stcw2photos123";

function buildFallbackUrl(blobName) {
  if (!blobName) return null;
  return `https://${STORAGE_ACCOUNT}.blob.core.windows.net/${FALLBACK_CONTAINER}/${blobName}`;
}

export default function ConsumerDashboard({ setMsg }) {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState(null);

  const loadPhotos = async () => {
    setLoading(true);
    setMsg("");
    try {
      const res = await API.get("/api/photos");
      setPhotos(res.data?.items || []);
    } catch (err) {
      setMsg(err?.response?.data?.error || err.message || "Failed to load photos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPhotos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return photos;
    return photos.filter((p) => {
      const text = `${p.title || ""} ${p.caption || ""} ${p.location || ""} ${p.people || ""}`.toLowerCase();
      return text.includes(s);
    });
  }, [photos, q]);

  return (
    <div style={{ marginTop: 20 }}>
      <h2>Consumer Dashboard</h2>

      <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 10 }}>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search title/caption/location/people"
          style={{ width: 380 }}
        />
        <button onClick={loadPhotos} disabled={loading}>
          {loading ? "Loading..." : "Refresh"}
        </button>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
          gap: 16,
          marginTop: 10,
          maxWidth: 1100,
        }}
      >
        {filtered.map((p) => {
          const img = p.blobUrl || p.url || p.imageUrl || buildFallbackUrl(p.blobName);

          return (
            <button
              key={p.id}
              onClick={() => setSelected(p)}
              style={{
                textAlign: "left",
                border: "1px solid #ddd",
                borderRadius: 10,
                padding: 10,
                background: "white",
                cursor: "pointer",
                minHeight: 230,
              }}
            >
              <div style={{ fontWeight: 700 }}>{p.title || "Untitled"}</div>
              {p.location ? <div style={{ opacity: 0.7 }}>{p.location}</div> : null}

              {img ? (
                <img
                  src={img}
                  alt={p.title || "photo"}
                  style={{
                    width: "100%",
                    height: 160,
                    objectFit: "cover",
                    borderRadius: 8,
                    marginTop: 8,
                    background: "#f2f2f2",
                  }}
                />
              ) : (
                <div style={{ marginTop: 8, opacity: 0.7 }}>No image URL in record</div>
              )}

              {p.caption ? <div style={{ marginTop: 8 }}>{p.caption}</div> : null}
            </button>
          );
        })}
      </div>

      {selected ? <PhotoModal photo={selected} onClose={() => setSelected(null)} setMsg={setMsg} /> : null}
    </div>
  );
}

function PhotoModal({ photo, onClose, setMsg }) {
  const img = photo.blobUrl || photo.url || photo.imageUrl || buildFallbackUrl(photo.blobName);

  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");

  const [avg, setAvg] = useState(0);
  const [count, setCount] = useState(0);
  const [myRating, setMyRating] = useState(0);

  const loadComments = async () => {
    const res = await API.get(`/api/comments?photoId=${photo.id}`);
    setComments(res.data?.items || []);
  };

  const loadRating = async () => {
    const res = await API.get(`/api/ratings?photoId=${photo.id}`);
    setAvg(res.data?.avg || 0);
    setCount(res.data?.count || 0);
  };

  useEffect(() => {
    setMsg("");
    loadComments().catch(() => {});
    loadRating().catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [photo.id]);

  const postComment = async () => {
    setMsg("");
    try {
      await API.post("/api/comments", { photoId: photo.id, text: commentText });
      setCommentText("");
      await loadComments();
      setMsg("✅ Comment added");
    } catch (err) {
      setMsg(err?.response?.data?.error || err.message || "Failed to comment");
    }
  };

  const submitRating = async (r) => {
    setMsg("");
    try {
      setMyRating(r);
      await API.post("/api/ratings", { photoId: photo.id, rating: r });
      await loadRating();
      setMsg("✅ Rated");
    } catch (err) {
      setMsg(err?.response?.data?.error || err.message || "Failed to rate");
    }
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.4)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
        zIndex: 9999,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "min(1000px, 95vw)",
          maxHeight: "90vh",
          overflow: "auto",
          background: "white",
          borderRadius: 12,
          padding: 16,
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
          <div>
            <div style={{ fontSize: 22, fontWeight: 800 }}>{photo.title || "Untitled"}</div>
            <div style={{ opacity: 0.75 }}>
              {photo.location || ""} {photo.people ? `• People: ${photo.people}` : ""}
            </div>
          </div>
          <button onClick={onClose}>Close</button>
        </div>

        {img ? (
          <img
            src={img}
            alt={photo.title || "photo"}
            style={{ width: "100%", maxHeight: 420, objectFit: "contain", borderRadius: 10, marginTop: 12 }}
          />
        ) : (
          <div style={{ marginTop: 12 }}>No image URL</div>
        )}

        {photo.caption ? <p style={{ marginTop: 10 }}>{photo.caption}</p> : null}

        <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid #eee" }}>
          <div style={{ fontWeight: 700, marginBottom: 6 }}>
            Rating: {avg.toFixed(1)} ({count})
          </div>

          <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
            {[1, 2, 3, 4, 5].map((r) => (
              <button
                key={r}
                onClick={() => submitRating(r)}
                style={{
                  padding: "6px 10px",
                  borderRadius: 8,
                  border: "1px solid #ddd",
                  background: myRating === r ? "#eee" : "white",
                  cursor: "pointer",
                }}
              >
                {r} ★
              </button>
            ))}
          </div>
        </div>

        <div style={{ marginTop: 14, paddingTop: 12, borderTop: "1px solid #eee" }}>
          <div style={{ fontWeight: 800, marginBottom: 8 }}>Comments</div>

          <div style={{ display: "flex", gap: 10 }}>
            <input
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Write a comment..."
              style={{ flex: 1 }}
            />
            <button onClick={postComment} disabled={!commentText.trim()}>
              Post
            </button>
          </div>

          <div style={{ marginTop: 12, display: "grid", gap: 10 }}>
            {comments.length === 0 ? (
              <div style={{ opacity: 0.7 }}>No comments yet.</div>
            ) : (
              comments.map((c) => (
                <div key={c.id} style={{ border: "1px solid #eee", borderRadius: 10, padding: 10 }}>
                  <div style={{ fontWeight: 700, fontSize: 13 }}>
                    {c.createdBy?.email || "User"}{" "}
                    <span style={{ opacity: 0.6, fontWeight: 400 }}>
                      • {c.createdAt ? new Date(c.createdAt).toLocaleString() : ""}
                    </span>
                  </div>
                  <div style={{ marginTop: 6 }}>{c.text}</div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
