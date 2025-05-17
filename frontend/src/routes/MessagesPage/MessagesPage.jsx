import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import Chat from "../../components/chat/Chat";
import { useAuth } from "../../context/AuthContext";
import apiRequest from "../../lib/apiRequest";

function MessagesPage() {
  const [chats, setChats] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const { currentUser } = useAuth();
  const [searchParams] = useSearchParams();
  const initialChatId = searchParams.get("chat");

  useEffect(() => {
    const fetchChats = async () => {
      if (!currentUser) {
        setError("Please login to view your chats");
        return;
      }

      setIsLoading(true);
      setError(null);
      try {
        const res = await apiRequest.get("/chats");
        if (res.data) {
          // Sort chats by last message time
          const sortedChats = res.data.sort((a, b) => {
            return new Date(b.updatedAt) - new Date(a.updatedAt);
          });
          setChats(sortedChats);
        }
      } catch (err) {
        console.error("Error fetching chats:", err);
        setError("Failed to load chats. Please try again.");
        toast.error("Failed to load chats");
      } finally {
        setIsLoading(false);
      }
    };

    fetchChats();
  }, [currentUser]);

  if (!currentUser) {
    return <div className="messages-container">Please login to view your chats</div>;
  }

  if (isLoading) return <div className="messages-container">Loading chats...</div>;
  if (error) return <div className="messages-container">{error}</div>;

  return (
    <div className="messages-container">
      <Chat chats={chats} initialChatId={initialChatId} />
    </div>
  );
}

export default MessagesPage;