import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Send, X } from "lucide-react";
import { useMessageStore } from "../store/useMessageStore";
import { useAuthStore } from "../store/useAuthStore";
import { getSocket } from "../services/socket";
import { formatDistanceToNow } from "date-fns";
import { Link } from "react-router-dom";

export default function MessagesPage() {
  const { convoId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const {
    conversations, fetchConversations,
    activeConvo, openConversation,
    messages, fetchMessages,
    sendMessage, receiveMessage,
    closeConversation,
  } = useMessageStore();

  const [text, setText] = useState("");
  const bottomRef = useRef(null);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  useEffect(() => {
  if (!convoId) return;
  const id = Number(convoId);
  const convo = conversations.find((c) => c.id === id);
  if (convo) useMessageStore.getState().activeConvo = convo;
  fetchMessages(id);
  const socket = getSocket();
  socket.emit("joinConvo", id);

  const handleNewMessage = (msg) => receiveMessage(msg, user?.id);
  socket.on("newMessage", handleNewMessage);

  return () => {
    socket.emit("leaveConvo", id);
    socket.off("newMessage", handleNewMessage); // ✅ .off to actually remove listener
  };
}, [convoId, conversations]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!text.trim() || !convoId) return;
    const trimmed = text.trim();
    setText(""); // clear immediately for better UX
    await sendMessage(Number(convoId), { text: trimmed });
  };

  const getOtherUser = (convo) =>
    convo.participants.find((p) => p.user.id !== user?.id)?.user;

  return (
    <div className="flex h-[calc(100vh-56px)] md:h-screen max-w-4xl mx-auto border-x border-gray-200 dark:border-gray-800">
      {/* Sidebar */}
      <div className={`w-full md:w-80 border-r border-gray-200 dark:border-gray-800 flex flex-col ${convoId ? "hidden md:flex" : "flex"}`}>
        <div className="p-4 border-b border-gray-200 dark:border-gray-800 font-semibold text-lg">
          Messages
        </div>
        <div className="overflow-y-auto flex-1">
          {conversations.length === 0 && (
            <p className="text-center text-gray-400 p-6 text-sm">No conversations yet.<br/>Open a profile and click Message.</p>
          )}
          {conversations.map((c) => {
            const other = getOtherUser(c);
            const last = c.messages[0];
            return (
              <button
                key={c.id}
                onClick={() => navigate(`/messages/${c.id}`)}
                className={`flex items-center gap-3 w-full px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors ${Number(convoId) === c.id ? "bg-gray-100 dark:bg-gray-900" : ""}`}
              >
                <img
                  src={other?.profilePicture || `https://ui-avatars.com/api/?name=${other?.username}`}
                  className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                />
                <div className="text-left min-w-0">
                  <p className="font-semibold text-sm">{other?.username}</p>
                  {last && (
                    <p className="text-xs text-gray-400 truncate">
                      {last.post ? "📷 Shared a post" : last.text}
                    </p>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Chat area */}
      {convoId ? (
        <div className="flex-1 flex flex-col min-w-0">
          {/* Header */}
          {(() => {
            const convo = conversations.find((c) => c.id === Number(convoId));
            const other = convo ? getOtherUser(convo) : null;
            return (
              <div className="flex items-center gap-3 p-3 border-b border-gray-200 dark:border-gray-800">
                <button onClick={() => navigate("/messages")} className="md:hidden">
                  <ArrowLeft size={20} />
                </button>
                {other && (
                  <Link to={`/profile/${other.id}`} className="flex items-center gap-2">
                    <img src={other.profilePicture || `https://ui-avatars.com/api/?name=${other.username}`} className="w-8 h-8 rounded-full object-cover" />
                    <span className="font-semibold text-sm">{other.username}</span>
                  </Link>
                )}
              </div>
            );
          })()}

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
            {messages.map((msg) => {
              const mine = msg.sender.id === user?.id;
              return (
                <div key={msg.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-xs ${mine ? "items-end" : "items-start"} flex flex-col gap-1`}>
                    {msg.post && (
                      <Link to={`/post/${msg.post.id}`} className="block border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden w-56">
                        <img src={msg.post.imageUrl} className="w-full aspect-square object-cover" />
                        <p className="text-xs p-2 text-gray-500 truncate">
                          <span className="font-semibold">{msg.post.user.username}</span>: {msg.post.caption}
                        </p>
                      </Link>
                    )}
                    {msg.text && (
                      <div className={`px-4 py-2 rounded-2xl text-sm ${mine ? "bg-brand-500 text-white" : "bg-gray-100 dark:bg-gray-800"}`}>
                        {msg.text}
                      </div>
                    )}
                    <span className="text-[10px] text-gray-400">
                      {formatDistanceToNow(new Date(msg.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                </div>
              );
            })}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="p-3 border-t border-gray-200 dark:border-gray-800 flex gap-2">
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Message..."
              className="flex-1 bg-gray-100 dark:bg-gray-900 rounded-full px-4 py-2 text-sm outline-none"
            />
            <button
              onClick={handleSend}
              disabled={!text.trim()}
              className="p-2 text-brand-500 disabled:opacity-40"
            >
              <Send size={20} />
            </button>
          </div>
        </div>
      ) : (
        <div className="hidden md:flex flex-1 items-center justify-center text-gray-400 text-sm">
          Select a conversation to start messaging
        </div>
      )}
    </div>
  );
}
