"use client";

import React, { useState } from "react";
import {
  X,
  Building2,
  Clock,
  ShieldAlert,
  Monitor,
  User,
  UserPlus,
  CheckCircle2,
  AlertCircle,
  Search,
  Check,
  Edit2,
  Share2,
  Info,
  Send,
  MessageSquare,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import GlassCard from "../../components/ui/GlassCard";
import ModalShell from "../../components/ui/ModalShell";
import Button from "../../components/ui/Button";
import GlassInput from "../../components/ui/GlassInput";
import type { SupportTicket, SupportMessage } from "@/domain/entities/Support";

interface HelpdeskDetailModalProps {
  isOpen: boolean;
  ticket: SupportTicket;
  onClose: () => void;
  onResolve: (ticketId: string) => Promise<void>;
  onAddMessage: (
    ticketId: string,
    message: string,
    isInternal: boolean,
  ) => Promise<SupportMessage>;
}

const HelpdeskDetailModal: React.FC<HelpdeskDetailModalProps> = ({
  isOpen,
  ticket,
  onClose,
  onResolve,
  onAddMessage,
}) => {
  const [newMessage, setNewMessage] = useState("");
  const [isInternal, setIsInternal] = useState(false);
  const [sending, setSending] = useState(false);
  const [resolving, setResolving] = useState(false);

  // Local state for optimistic updates
  const [localMessages, setLocalMessages] = useState<SupportMessage[]>(
    ticket.messages || [],
  );

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;
    setSending(true);
    try {
      const msg = await onAddMessage(ticket.id, newMessage, isInternal);
      setLocalMessages((prev) => [...prev, msg]);
      setNewMessage("");
    } catch (error) {
      console.error("Failed to send message", error);
    } finally {
      setSending(false);
    }
  };

  const handleResolve = async () => {
    setResolving(true);
    try {
      await onResolve(ticket.id);
      onClose();
    } catch (error) {
      console.error("Failed to resolve ticket", error);
    } finally {
      setResolving(false);
    }
  };

  const isClosed = ticket.status === "resolved" || ticket.status === "closed";

  return (
    <ModalShell
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="max-w-4xl"
      title="Ticket Details"
      subtitle={`Reference ID: ${ticket.id.slice(0, 8).toUpperCase()}`}
      footer={
        <div className="flex justify-between items-center w-full">
          <div className="flex items-center gap-2">
            <span
              className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${
                ticket.status === "resolved"
                  ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                  : ticket.priority === "High"
                    ? "bg-red-500/10 text-red-500 border-red-500/20"
                    : "bg-blue-500/10 text-blue-500 border-blue-500/20"
              }`}
            >
              {ticket.status}
            </span>
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-1">
              <Clock size={12} />{" "}
              {formatDistanceToNow(new Date(ticket.createdAt))} ago
            </span>
          </div>
          <div className="flex gap-3">
            <Button variant="ghost" onClick={onClose}>
              Close View
            </Button>
            {!isClosed && (
              <Button
                variant="primary"
                onClick={handleResolve}
                disabled={resolving}
                icon={<CheckCircle2 size={16} />}
              >
                {resolving ? "Resolving..." : "Mark Resolved"}
              </Button>
            )}
          </div>
        </div>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[600px]">
        {/* Sidebar info */}
        <div className="md:col-span-1 space-y-6 overflow-y-auto pr-2 custom-scrollbar">
          <div className="p-6 rounded-2xl bg-black/5 dark:bg-white/5 border border-white/10 space-y-4">
            <div>
              <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest mb-1 block">
                Subject
              </label>
              <h3 className="font-bold dark:text-white leading-tight">
                {ticket.title}
              </h3>
            </div>
            <div>
              <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest mb-1 block">
                Description
              </label>
              <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
                {ticket.description}
              </p>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-black/5 dark:bg-white/5 border border-white/10 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-white/10 text-gray-400">
                <Building2 size={16} />
              </div>
              <div>
                <label className="text-[9px] font-black uppercase text-gray-500 tracking-widest block">
                  Tenant ID
                </label>
                <span className="text-xs font-mono font-bold dark:text-white">
                  {ticket.tenantId}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-white/10 text-gray-400">
                <ShieldAlert size={16} />
              </div>
              <div>
                <label className="text-[9px] font-black uppercase text-gray-500 tracking-widest block">
                  Priority
                </label>
                <span
                  className={`text-xs font-bold ${ticket.priority === "High" ? "text-red-500" : "text-gray-400"}`}
                >
                  {ticket.priority || "Normal"}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-white/10 text-gray-400">
                <Monitor size={16} />
              </div>
              <div>
                <label className="text-[9px] font-black uppercase text-gray-500 tracking-widest block">
                  Category
                </label>
                <span className="text-xs font-bold dark:text-white">
                  {ticket.category || "General"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Chat Area */}
        <div className="md:col-span-2 flex flex-col h-full bg-black/5 dark:bg-white/5 rounded-2xl border border-white/10 overflow-hidden">
          <div className="flex-1 p-6 overflow-y-auto space-y-4 custom-scrollbar flex flex-col-reverse">
            {/* Messages reversed to start from bottom or logic */}
            {localMessages
              .slice()
              .reverse()
              .map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col gap-1 max-w-[80%] ${msg.senderId ? "self-end items-end" : "self-start items-start"}`}
                >
                  <div
                    className={`p-4 rounded-2xl text-sm font-medium ${
                      msg.isInternal
                        ? "bg-amber-500/10 text-amber-600 border border-amber-500/20"
                        : msg.senderId
                          ? "bg-accent-strong text-white"
                          : "bg-white dark:bg-zinc-800 text-gray-800 dark:text-gray-200 shadow-sm"
                    }`}
                  >
                    {msg.isInternal && (
                      <span className="text-[9px] font-black uppercase tracking-widest block mb-1 opacity-70">
                        Internal Note
                      </span>
                    )}
                    {msg.message}
                  </div>
                  <span className="text-[9px] font-bold text-gray-400 px-2">
                    {formatDistanceToNow(new Date(msg.createdAt))} ago
                  </span>
                </div>
              ))}
            {localMessages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-gray-400 opacity-50">
                <MessageSquare size={48} />
                <p className="mt-2 text-xs font-bold uppercase tracking-widest">
                  No messages yet
                </p>
              </div>
            )}
          </div>

          {!isClosed && (
            <div className="p-4 bg-white dark:bg-zinc-900 border-t border-white/10">
              <div className="flex gap-2 items-center mb-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-gray-500 select-none">
                  <input
                    type="checkbox"
                    checked={isInternal}
                    onChange={(e) => setIsInternal(e.target.checked)}
                    className="rounded border-gray-600 bg-transparent text-accent focus:ring-accent"
                  />
                  Internal Note (Hidden from Tenant)
                </label>
              </div>
              <div className="flex gap-2">
                <input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your response..."
                  className="flex-1 bg-gray-50 dark:bg-black/20 border border-transparent focus:border-accent/50 rounded-xl px-4 py-3 text-sm font-medium outline-none transition-all"
                  onKeyDown={(e) =>
                    e.key === "Enter" && !e.shiftKey && handleSendMessage()
                  }
                />
                <button
                  onClick={handleSendMessage}
                  disabled={sending || !newMessage}
                  className="w-12 h-12 rounded-xl bg-accent-strong text-white flex items-center justify-center hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:hover:scale-100"
                >
                  <Send size={18} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </ModalShell>
  );
};

export default HelpdeskDetailModal;
