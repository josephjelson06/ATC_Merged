"use client";

import React, { useState } from "react";
import {
  LifeBuoy,
  CheckCircle2,
  Monitor,
  X,
  Clock,
  ShieldAlert,
  Info,
  ChevronRight,
  Send,
  MessageSquare,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import ModalShell from "../../components/ui/ModalShell";
import type { SupportTicket, SupportMessage } from "@/domain/entities/Support";

interface HotelTicketDetailModalProps {
  isOpen: boolean;
  ticket: SupportTicket | null;
  onClose: () => void;
  onAddMessage: (
    ticketId: string,
    message: string,
    isInternal: boolean,
  ) => Promise<SupportMessage>;
}

const HotelTicketDetailModal: React.FC<HotelTicketDetailModalProps> = ({
  isOpen,
  ticket,
  onClose,
  onAddMessage,
}) => {
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [localMessages, setLocalMessages] = useState<SupportMessage[]>(
    ticket?.messages || [],
  );

  // Sync state if ticket prop updates
  React.useEffect(() => {
    if (ticket) {
      setLocalMessages(ticket.messages || []);
    }
  }, [ticket]);

  if (!ticket) return null;

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;
    setSending(true);
    try {
      // Tenants do NOT send internal notes
      const msg = await onAddMessage(ticket.id, newMessage, false);
      setLocalMessages((prev) => [...prev, msg]);
      setNewMessage("");
    } catch (error) {
      console.error("Failed to send message", error);
    } finally {
      setSending(false);
    }
  };

  const isClosed = ticket.status === "resolved" || ticket.status === "closed";

  return (
    <ModalShell
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="max-w-5xl"
      hideHeader
    >
      <div className="flex flex-col md:flex-row h-[80vh]">
        {/* Main Briefing Panel (Left) */}
        <div className="flex-1 flex flex-col min-w-0 bg-black/5 dark:bg-black/20">
          {/* Header */}
          <div className="px-8 py-8 border-b border-white/10 flex justify-between items-center">
            <div className="flex items-center gap-6">
              <div
                className={`w-16 h-16 rounded-2xl flex items-center justify-center text-white shadow-2xl ${
                  ticket.priority === "Critical"
                    ? "bg-red-600 shadow-red-900/40"
                    : "bg-accent-strong shadow-accent-strong/40"
                }`}
              >
                <LifeBuoy size={36} />
              </div>
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h2 className="text-2xl font-black dark:text-white tracking-tighter uppercase">
                    {ticket.id.slice(0, 8)}
                  </h2>
                  <span
                    className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-widest border border-white/5 ${
                      ticket.status === "resolved"
                        ? "bg-emerald-500/10 text-emerald-500"
                        : "bg-black/10 dark:bg-white/10 dark:text-gray-400"
                    }`}
                  >
                    {ticket.status}
                  </span>
                </div>
                <p className="text-[11px] font-black text-gray-500 uppercase tracking-[0.2em] leading-none">
                  Platform Support Ticket
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={onClose}
                className="p-3 rounded-full hover:bg-white/10 transition-colors text-gray-400"
              >
                <X size={28} />
              </button>
            </div>
          </div>

          {/* Core Ticket Content / Chat */}
          <div className="flex-1 overflow-y-auto p-10 custom-scrollbar flex flex-col">
            <div className="space-y-6">
              {/* Subject Section */}
              <div>
                <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 mb-4 flex items-center gap-2">
                  <div className="w-1.5 h-3 bg-accent rounded-full"></div>{" "}
                  Ticket Subject
                </h3>
                <h1 className="text-2xl font-black dark:text-white leading-tight">
                  {ticket.title}
                </h1>
              </div>

              {/* Problem Description Body */}
              <div className="p-8 rounded-[2.5rem] bg-black/5 dark:bg-white/[0.03] border border-white/5 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                  <LifeBuoy size={120} />
                </div>
                <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 mb-6">
                  Original Reported Description
                </h3>
                <p className="text-base font-medium dark:text-gray-300 leading-relaxed relative z-10 whitespace-pre-wrap">
                  {ticket.description ||
                    "No detailed description provided for this ticket."}
                </p>
              </div>

              {/* Messages Sequence */}
              <div className="space-y-4 pt-4 border-t border-white/5">
                <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 mb-6">
                  Conversation Log
                </h3>
                {localMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex flex-col gap-1 max-w-[85%] ${msg.senderId ? "self-end items-end ml-auto" : "self-start items-start"}`}
                  >
                    <div
                      className={`p-4 rounded-2xl text-sm font-medium ${
                        msg.senderId
                          ? "bg-accent-strong text-white"
                          : "bg-white dark:bg-zinc-800 text-gray-800 dark:text-gray-200 shadow-sm border border-white/5"
                      }`}
                    >
                      {/* Filter our internal notes just in case backend sent them by accident, though backend should strip. If they are visible, they won't look different unless we detect it. We assume tenant won't see internal. */}
                      {msg.message}
                    </div>
                    <span className="text-[9px] font-bold text-gray-400 px-2">
                      {formatDistanceToNow(new Date(msg.createdAt))} ago
                    </span>
                  </div>
                ))}
                {localMessages.length === 0 && (
                  <div className="text-center py-6 text-gray-400 text-xs font-bold uppercase tracking-widest opacity-50">
                    Awaiting agent response
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Message Input Area */}
          {!isClosed && (
            <div className="p-4 bg-white dark:bg-zinc-900 border-t border-white/10 hidden md:block mt-auto shrink-0">
              <div className="flex gap-2">
                <input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Add a reply..."
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

        {/* Support Intelligence Sidebar (Right) */}
        <div className="w-80 bg-white dark:bg-transparent border-l border-white/10 overflow-y-auto p-8 space-y-10 custom-scrollbar shrink-0">
          {/* Context Metadata */}
          <section>
            <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 mb-6">
              Ticket Metadata
            </h3>
            <div className="space-y-4">
              <div className="p-5 rounded-3xl bg-black/5 dark:bg-black/20 border border-white/5">
                <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-2">
                  Category
                </p>
                <div className="flex items-center gap-2">
                  <Monitor size={16} className="text-accent-strong" />
                  <span className="text-xs font-black dark:text-white uppercase tracking-wider">
                    {ticket.category}
                  </span>
                </div>
              </div>
              <div className="p-5 rounded-3xl bg-black/5 dark:bg-black/20 border border-white/5">
                <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-2">
                  Assessed Priority
                </p>
                <div className="flex items-center gap-2">
                  <ShieldAlert
                    size={16}
                    className={
                      ticket.priority === "Critical"
                        ? "text-red-500"
                        : "text-accent"
                    }
                  />
                  <span
                    className={`text-xs font-black uppercase tracking-wider ${ticket.priority === "Critical" ? "text-red-500" : "text-accent"}`}
                  >
                    {ticket.priority}
                  </span>
                </div>
              </div>
              <div className="p-5 rounded-3xl bg-black/5 dark:bg-black/20 border border-white/5">
                <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-2">
                  Reported
                </p>
                <div className="flex items-center gap-2">
                  <Clock size={16} className="text-gray-500" />
                  <span className="text-xs font-black dark:text-white uppercase tracking-tighter">
                    {formatDistanceToNow(new Date(ticket.createdAt))} ago
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* ATC Assignment */}
          <section>
            <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 mb-6">
              Platform Engineers
            </h3>
            <div className="flex items-center gap-4 p-5 rounded-3xl bg-black/5 dark:bg-white/[0.02] border border-white/5">
              <div className="w-12 h-12 rounded-2xl bg-accent-strong/10 flex items-center justify-center text-accent-strong font-black text-sm border border-accent-strong/10">
                ATC
              </div>
              <div>
                <h4 className="text-xs font-black dark:text-white">
                  Support Team
                </h4>
                <p className="text-[9px] font-bold text-gray-500 uppercase tracking-tighter mt-0.5">
                  Automated Assignment
                </p>
              </div>
            </div>
          </section>

          {/* Documentation Link Placeholder */}
          <div className="p-6 rounded-3xl bg-black/5 dark:bg-white/[0.02] border border-white/5 flex items-center justify-between group cursor-pointer hover:border-accent/30 transition-all mt-auto">
            <div>
              <p className="text-[9px] font-black text-gray-500 uppercase mb-1">
                Knowledge Base
              </p>
              <p className="text-[10px] font-bold dark:text-gray-300">
                View Platform Docs
              </p>
            </div>
            <ChevronRight
              size={14}
              className="text-gray-700 group-hover:translate-x-1 transition-all"
            />
          </div>
        </div>
      </div>
    </ModalShell>
  );
};

export default HotelTicketDetailModal;
