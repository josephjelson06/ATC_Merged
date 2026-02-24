"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  CheckCircle2,
  Clock,
  Inbox,
  AlertOctagon,
  Filter,
  CheckCircle,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import Pagination from "../../components/ui/Pagination";
import PageHeader from "../../components/ui/PageHeader";
import GlassCard from "../../components/ui/GlassCard";
import GlassDropdown from "../../components/ui/GlassDropdown";
import HelpdeskDetailModal from "../../modals/super/HelpdeskDetailModal";
import { useSupport } from "@/application/hooks/useSupport";
import type { SupportTicket } from "@/domain/entities/Support";

const Helpdesk: React.FC = () => {
  const { tickets, loading, error, fetchTickets, resolveTicket, addMessage } =
    useSupport();
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(
    null,
  );
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const filteredTickets = useMemo(() => {
    return tickets.filter(
      (t) => filterStatus === "all" || t.status === filterStatus,
    );
  }, [tickets, filterStatus]);

  const totalPages = Math.ceil(filteredTickets.length / itemsPerPage);
  const paginatedTickets = filteredTickets.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const handleResolve = async (ticketId: string) => {
    await resolveTicket(ticketId);
    if (selectedTicket?.id === ticketId) {
      setSelectedTicket((prev) =>
        prev ? { ...prev, status: "resolved" } : null,
      );
    }
  };

  const statusCounts = useMemo(() => {
    return {
      open: tickets.filter((t) => t.status === "open").length,
      resolved: tickets.filter((t) => t.status === "resolved").length,
      all: tickets.length,
    };
  }, [tickets]);

  return (
    <div className="p-8 space-y-8 min-h-screen pb-24 animate-in fade-in duration-500">
      <PageHeader
        title="Support Center"
        subtitle="Tenant Inquiries & Incident Management"
      >
        <div className="flex gap-2">
          <button
            onClick={() => setFilterStatus("all")}
            className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest border transition-all ${filterStatus === "all" ? "bg-accent-strong text-white border-accent-strong" : "bg-transparent text-gray-500 border-white/10 hover:border-white/30"}`}
          >
            All ({statusCounts.all})
          </button>
          <button
            onClick={() => setFilterStatus("open")}
            className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest border transition-all ${filterStatus === "open" ? "bg-amber-500 text-white border-amber-500" : "bg-transparent text-gray-500 border-white/10 hover:border-white/30"}`}
          >
            Pending ({statusCounts.open})
          </button>
          <button
            onClick={() => setFilterStatus("resolved")}
            className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest border transition-all ${filterStatus === "resolved" ? "bg-emerald-500 text-white border-emerald-500" : "bg-transparent text-gray-500 border-white/10 hover:border-white/30"}`}
          >
            Resolved ({statusCounts.resolved})
          </button>
        </div>
      </PageHeader>

      <GlassCard
        noPadding
        className="border-white/10 overflow-hidden min-h-[500px] flex flex-col"
      >
        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-sm font-bold text-gray-500 animate-pulse">
              Loading tickets...
            </p>
          </div>
        ) : filteredTickets.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-500 opacity-50">
            <Inbox size={48} strokeWidth={1} />
            <p className="mt-4 text-xs font-bold uppercase tracking-widest">
              No tickets found
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-black/5 dark:bg-white/5 text-[10px] font-bold uppercase tracking-widest text-gray-500 border-b border-white/10">
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Subject</th>
                  <th className="px-6 py-4">Tenant</th>
                  <th className="px-6 py-4">Created</th>
                  <th className="px-6 py-4">Last Activity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {paginatedTickets.map((ticket) => (
                  <tr
                    key={ticket.id}
                    onClick={() => setSelectedTicket(ticket)}
                    className="group hover:bg-black/5 dark:hover:bg-white/[0.02] cursor-pointer transition-colors"
                  >
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                          ticket.status === "open"
                            ? "bg-amber-500/10 text-amber-500 border-amber-500/20"
                            : ticket.status === "resolved"
                              ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                              : "bg-gray-500/10 text-gray-500 border-gray-500/20"
                        }`}
                      >
                        {ticket.status === "open" ? (
                          <Clock size={10} />
                        ) : (
                          <CheckCircle size={10} />
                        )}
                        {ticket.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {ticket.priority === "High" && (
                          <AlertOctagon size={14} className="text-red-500" />
                        )}
                        <span className="font-bold text-sm dark:text-white group-hover:text-accent transition-colors">
                          {ticket.title}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-mono text-xs font-medium text-gray-500">
                        {ticket.tenantId}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-medium text-gray-500">
                        {new Date(ticket.createdAt).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-medium text-gray-500">
                        {formatDistanceToNow(new Date(ticket.createdAt))} ago
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="mt-auto border-t border-white/5 p-4">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            itemsPerPage={itemsPerPage}
            onItemsPerPageChange={setItemsPerPage}
            totalItems={filteredTickets.length}
          />
        </div>
      </GlassCard>

      {selectedTicket && (
        <HelpdeskDetailModal
          isOpen={!!selectedTicket}
          ticket={selectedTicket}
          onClose={() => setSelectedTicket(null)}
          onResolve={handleResolve}
          onAddMessage={addMessage}
        />
      )}
    </div>
  );
};

export default Helpdesk;
