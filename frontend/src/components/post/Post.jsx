import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import MessagePopup from "../MessagePopup";

const Post = ({ post }) => {
  const { currentUser } = useAuth();
  const [showMessagePopup, setShowMessagePopup] = useState(false);

  const handleMessageClick = (e) => {
    e.preventDefault();
    if (!currentUser) {
      // Redirect to login if not authenticated
      window.location.href = "/login";
      return;
    }
    setShowMessagePopup(true);
  };

  return (
    <div className="post">
      <div className="img">
        <img src={post.images[0]} alt="" />
      </div>
      <div className="content">
        <Link className="link" to={`/post/${post.id}`}>
          <h1>{post.title}</h1>
        </Link>
        <p className="desc">{post.desc}</p>
        <p className="price">
          <span>₹</span>
          {post.price}
        </p>
        <p>
          <img src="/pin.png" alt="" />
          <span>{post.address}</span>
        </p>
        <button className="save">
          <img src="/save.png" alt="" />
        </button>
        <button className="message" onClick={handleMessageClick}>
          <img src="/chat.png" alt="" />
          Send a Message
        </button>
      </div>

      <MessagePopup
        isOpen={showMessagePopup}
        onClose={() => setShowMessagePopup(false)}
        ownerId={post.userId}
        ownerName={post.user?.username || "Property Owner"}
      />
    </div>
  );
};

export default Post; 