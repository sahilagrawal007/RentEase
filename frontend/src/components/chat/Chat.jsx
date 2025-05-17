import { useContext, useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { format } from "timeago.js";
import { AuthContext } from "../../context/AuthContext";
import { SocketContext } from "../../context/SocketContext";
import apiRequest from "../../lib/apiRequest";
import { useNotificationStore } from "../../lib/notificationStore";
import "./chat.scss";

function Chat({ chats, initialChatId }) {
  const [chat, setChat] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const { currentUser } = useContext(AuthContext);
  const { socket } = useContext(SocketContext);
  const [messageText, setMessageText] = useState("");
  const navigate = useNavigate();

  const messageEndRef = useRef();
  const messageInputRef = useRef(null);

  const { increase, reset } = useNotificationStore.getState ? useNotificationStore.getState() : { increase: () => {}, reset: () => {} };

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat?.messages]);

  // Handle initial chat
  useEffect(() => {
    if (initialChatId && chats.length > 0) {
      const initialChat = chats.find(c => c.id === initialChatId);
      if (initialChat) {
        handleOpenChat(initialChatId, initialChat.receiver);
      }
    }
  }, [initialChatId, chats]);

  const handleOpenChat = async (id, receiver) => {
    setIsLoading(true);
    try {
      // Mark chat as read
      await apiRequest.put(`/chats/read/${id}`);
      reset(id); // Reset unread count for this chat
      const res = await apiRequest.get(`/chats/${id}?page=${page}&limit=20`);
      setChat({ ...res.data, receiver });
      setMessageText(""); // Clear message input when opening new chat
    } catch (err) {
      console.error(err);
      toast.error("Failed to load chat");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoadMore = async () => {
    if (isLoading) return;
    
    setIsLoading(true);
    try {
      const res = await apiRequest.get(`/chats/${chat.id}?page=${page + 1}&limit=20`);
      setChat((prev) => ({
        ...prev,
        messages: [...res.data.messages, ...prev.messages],
      }));
      setPage(page + 1);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load more messages");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const text = messageText.trim();

    if (!text) {
      toast.warn("Message cannot be empty");
      return;
    }

    if (!chat) {
      toast.warn("Please select a chat first");
      return;
    }

    try {
      const res = await apiRequest.post(`/messages/${chat.id}`, { text });
      setChat((prev) => ({
        ...prev,
        messages: [...prev.messages, res.data],
        lastMessage: text,
      }));
      setMessageText(""); // Clear input after sending

      if (socket) {
        socket.emit("sendMessage", {
          receiverId: chat.receiver.id,
          data: res.data,
          chatId: chat.id,
        });
      } else {
        console.warn("Socket not connected. Message sent but real-time updates may not work.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to send message");
    }
  };

  useEffect(() => {
    if (chat && socket) {
      socket.on("getMessage", (data) => {
        if (chat.id === data.chatId) {
          setChat((prev) => ({
            ...prev,
            messages: [...prev.messages, data],
            lastMessage: data.text,
          }));
        } else {
          // Not the currently open chat: increase notification count
          increase(data.chatId);
        }
      });
    }

    return () => {
      if (socket) {
        socket.off("getMessage");
      }
    };
  }, [socket, chat]);

  useEffect(() => {
    if (chat) {
      messageInputRef.current?.focus();
    }
  }, [chat]);

  return (
    <div className="chat">
      <div className="messages">
        <h1>Messages</h1>
        {chats.length === 0 ? (
          <p>
            No chats available.{" "}
            <Link to="/users">Find someone to chat with!</Link>
          </p>
        ) : (
          chats.map((c) => (
            <div
              className="message"
              key={c.id}
              style={{
                backgroundColor:
                  c.seenBy.includes(currentUser.id) || chat?.id === c.id
                    ? "white"
                    : "#fecd514e",
              }}
              onClick={() => handleOpenChat(c.id, c.receiver)}
            >
              <img src={c.receiver.avatar || "/noavatar.jpg"} alt="" />
              <div className="message-info">
                <span className="username">{c.receiver.username}</span>
                <p className="last-message">{c.lastMessage || "No messages yet"}</p>
              </div>
              {c.unreadCount > 0 && (
                <span className="unread-badge">{c.unreadCount}</span>
              )}
            </div>
          ))
        )}
      </div>
      {chat ? (
        <div className="chatBox">
          <div className="top">
            <div className="user">
              <img src={chat.receiver.avatar || "/noavatar.jpg"} alt="" />
              <span>{chat.receiver.username}</span>
            </div>
            <span className="close" onClick={() => setChat(null)}>
              X
            </span>
          </div>
          <div className="center">
            {page > 1 && (
              <button
                onClick={handleLoadMore}
                disabled={isLoading}
                className="load-more-btn"
              >
                {isLoading ? "Loading..." : "Load More"}
              </button>
            )}
            {chat.messages.map((message) => (
              <div
                className={`chatMessage ${
                  message.userId === currentUser.id ? "own" : "received"
                }`}
                key={message.id}
              >
                <p>{message.text}</p>
                <span>{format(message.createdAt)}</span>
              </div>
            ))}
            <div ref={messageEndRef}></div>
          </div>
          <form onSubmit={handleSubmit} className="bottom">
            <textarea
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              ref={messageInputRef}
              placeholder="Type your message..."
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
            ></textarea>
            <button type="submit" disabled={isLoading || !messageText.trim()}>
              Send
            </button>
          </form>
        </div>
      ) : (
        <div className="chatBox">
          <p>Select a chat to start messaging</p>
        </div>
      )}
    </div>
  );
}

export default Chat;