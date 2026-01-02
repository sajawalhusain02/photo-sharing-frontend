import { useEffect, useState } from "react";
import API from "../api";

export default function PhotoCard({ media }) {
  const imgUrl = media.blobUrl || media.url; // your DB has both styles in old items

  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState([]);
  const [rating, setRating] = useState(5);
  const [avg, setAvg] = useState(null);
  const [msg, setMsg] = useState("");

  // ✅ If your comments/ratings endpoints differ, change only these 4 paths:
  const COMMENTS_GET = "/api/comments";
  const COMMENTS_POST = "/api/comments";
  const RATINGS_GET = "/api/ratings";
  const RATINGS_POST = "/api/ratings";

  const loadComments = async () => {
    try {
      const res = await API.get(COMMENTS_GET, { params: { mediaId: media.id } });
      setComments(res.data.items || res.data.comments || res.data || []);
    } catch {
      // ignore
    }
  };

  const loadRatings = async () => {
    try {
      const res = await API.get(RATINGS_GET, { params: { mediaId: media.id } });
      // support shapes: {avg: X} OR {average: X} OR {items:[...]}
      if (res.data?.avg != null) setAvg(res.data.avg);
      else if (res.data?.average != null) setAvg(res.data.average);
      else if (Array.isArray(res.data?.items)) {
        const arr = res.data.items.map((x) => Number(x.value || x.rating || 0)).filter(Boolean);
        if (arr.length) setAvg(arr.reduce((a, b) => a + b, 0) / arr.length);
      }
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    loadComments();
    loadRatings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const postComment = async () => {
    setMsg("");
    if (!commentText.trim()) return;

    try {
      await API.post(COMMENTS_POST, { mediaId: media.id, text: commentText.trim() });
      setCommentText("");
      setMsg("✅ Comment added");
      loadComments();
    } catch (err) {
      setMsg(err?.response?.data?.error || err?.response?.data?.message || err?.message || "Comment failed");
    }
  };

  const postRating = async () => {
    setMsg("");
    try {
      await API.post(RATINGS_POST, { mediaId: media.id, value: Number(rating) });
      setMsg("✅ Rating saved");
      loadRatings();
    } catch (err) {
      setMsg(err?.response?.data?.error || err?.response?.data?.message || err?.message || "Rating failed");
    }
  };

  return (
    <div className="photoCard">
      {imgUrl ? (
        <img className="photo" src={imgUrl} alt={media.title || "photo"} />
      ) : (
        <div className="photo placeholder">No image URL</div>
      )}

      <div style={{ marginTop: 10 }}>
        <div className="title">{media.title || "(no title)"}</div>
        {media.caption && <div className="meta">{media.caption}</div>}
        {media.location && <div className="meta">📍 {media.location}</div>}
        {media.people && <div className="meta">👥 {media.people}</div>}
        {avg != null && <div className="meta">⭐ Avg rating: {avg.toFixed(1)}</div>}
      </div>

      <div className="row" style={{ marginTop: 10 }}>
        <select value={rating} onChange={(e) => setRating(e.target.value)}>
          {[1, 2, 3, 4, 5].map((n) => (
            <option key={n} value={n}>{n}</option>
          ))}
        </select>
        <button className="btnSecondary" type="button" onClick={postRating}>
          Rate
        </button>
      </div>

      <div style={{ marginTop: 10 }}>
        <div className="row">
          <input
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Write a comment..."
          />
          <button type="button" onClick={postComment}>Post</button>
        </div>

        {msg && <div className="smallMsg">{msg}</div>}

        <div className="comments">
          {(comments || []).slice(0, 5).map((c, idx) => (
            <div key={c.id || idx} className="comment">
              {c.text || c.comment || JSON.stringify(c)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
