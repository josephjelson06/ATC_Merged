"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  LifeBuoy,
  MessageSquare,
  Plus,
  FileQuestion,
  Monitor,
  Search,
  Filter,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShieldAlert,
  Headphones,
  IndianRupee,
  HelpCircle,
  Info,
} from "lucide-react";
import GlassCard from "../../components/ui/GlassCard";
import PageHeader from "../../components/ui/PageHeader";
import Button from "../../components/ui/Button";
import NewTicketModal from "../../modals/hotel/NewTicketModal";
import HotelTicketDetailModal from "../../modals/hotel/HotelTicketDetailModal";
import type { SupportTicket } from "@/domain/entities/Support";
import { useSupport } from "@/application/hooks/useSupport";
import { useAuth } from "@/application/hooks/useAuth";

const HotelHelp: React.FC = () => {
  const { user } = useAuth();
  const tenantId = user?.tenantId;

  const {
    tickets: allTickets,
    fetchTenantTickets,
    createTicket,
    addMessage,
    loading,
  } = useSupport();
  const [search, setSearch] = useState("");
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(
    null,
  );

  useEffect(() => {
    if (tenantId) {
      fetchTenantTickets(tenantId);
    }
  }, [tenantId, fetchTenantTickets]);

  const filteredTickets = useMemo(() => {
    return allTickets.filter(
      (t) =>
        t.title.toLowerCase().includes(search.toLowerCase()) ||
        t.id.toLowerCase().includes(search.toLowerCase()),
    );
  }, [allTickets, search]);

  const handleCreateTicket = async (data: Partial<SupportTicket>) => {
    if (!tenantId) return;
    await createTicket(tenantId, data);
  };

  const PriorityBadge = ({ level }: { level: string }) => {
    const styles: Record<string, string> = {
      Critical: "bg-red-600 text-white shadow-lg shadow-red-900/20",
      High: "bg-accent text-white",
      Medium: "bg-accent text-white",
      Low: "bg-gray-500 text-white",
    };
    return (
      <span
        className={`inline-block px-2 py-1 rounded text-[8px] font-bold uppercase tracking-widest leading-none whitespace-nowrap ${styles[level] || styles.Low}`}
      >
        {level}
      </span>
    );
  };

  const StatusBadge = ({ status }: { status: string }) => {
    const s = status.toLowerCase();
    const styles: Record<string, string> = {
      open: "bg-blue-500/10 text-accent border-accent/20",
      "in progress": "bg-purple-500/10 text-purple-500 border-purple-500/20",
      "waiting on client": "bg-amber-500/10 text-amber-500 border-amber-500/20",
      resolved: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
      closed: "bg-gray-500/10 text-gray-500 border-gray-500/20",
      pending: "bg-gray-500/10 text-gray-500 border-gray-500/20",
    };
    return (
      <span
        className={`inline-block px-3 py-1.5 rounded-full border text-[8px] font-bold uppercase tracking-widest leading-none whitespace-nowrap ${styles[s] || styles.open}`}
      >
        {status}
      </span>
    );
  };

  const stats = useMemo(() => {
    const active = allTickets.filter(
      (t) => t.status !== "resolved" && t.status !== "closed",
    ).length;
    const awaiting = allTickets.filter((t) => t.status === "open").length;

    // SLA Health: Percentage of non-critical tickets or critical ones resolved in time
    const criticalBreached = allTickets.filter(
      (t) =>
        t.priority === "Critical" &&
        t.status !== "resolved" &&
        t.status !== "closed",
    ).length;
    const slaHealth =
      allTickets.length > 0
        ? Math.round(
            ((allTickets.length - criticalBreached) / allTickets.length) * 100,
          )
        : 100;

    // Average Response (Simplified to resolution time for closed tickets)
    const resolved = allTickets.filter(
      (t) => t.status === "resolved" || t.status === "closed",
    );
    let avgResp = "--";
    if (resolved.length > 0) {
      const avgMs =
        resolved.reduce((acc, t) => {
          // Fallback: If no messages, use created vs current
          const lastActivity =
            t.messages?.length > 0
              ? t.messages[t.messages.length - 1].createdAt
              : t.createdAt;
          return (
            acc +
            (new Date(lastActivity).getTime() - new Date(t.createdAt).getTime())
          );
        }, 0) / resolved.length;
      const hours = Math.floor(avgMs / 3600000);
      const mins = Math.floor((avgMs % 3600000) / 60000);
      avgResp = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
    }

    return { active, awaiting, slaHealth, avgResp };
  }, [allTickets]);

  return (
    <div className="p-8 space-y-8 min-h-screen pb-24 animate-in fade-in duration-500">
      {/* Header Context */}
      <PageHeader
        title="Support Helpdesk"
        subtitle="Direct Lifeline to Platform Team"
      >
        <Button
          variant="primary"
          size="lg"
          onClick={() => setIsNewModalOpen(true)}
          disabled={!tenantId}
          icon={<Plus size={18} strokeWidth={3} />}
        >
          Raise New Ticket
        </Button>
      </PageHeader>

      {/* Operational Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <SummaryItem
          label="Active Tickets"
          value={stats.active.toString().padStart(2, "0")}
          icon={LifeBuoy}
          color="text-accent"
        />
        <SummaryItem
          label="Awaiting Action"
          value={stats.awaiting.toString().padStart(2, "0")}
          icon={Clock}
          color="text-amber-500"
        />
        <SummaryItem
          label="SLA Health"
          value={`${stats.slaHealth}%`}
          icon={ShieldAlert}
          color="text-emerald-500"
        />
        <SummaryItem
          label="Avg Response"
          value={stats.avgResp}
          icon={MessageSquare}
          color="text-purple-500"
        />
      </div>

      <div className="flex flex-col space-y-6">
        {/* Search & Filter Bar */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-96 group">
            <Search
              size={16}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-accent transition-colors"
            />
            <input
              type="text"
              placeholder="Search ticket # or subject..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-black/5 dark:bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-sm font-bold dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-accent/20 transition-all placeholder:text-gray-500"
            />
          </div>
          <button className="flex items-center gap-2 px-5 py-3 rounded-xl bg-black/5 dark:bg-white/5 text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-white hover:bg-black/10 transition-all border border-white/5">
            <Filter size={14} /> Filter All Status
          </button>
        </div>

        {/* Card-Based Ticket Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredTickets.map((t) => (
            <GlassCard
              key={t.id}
              onClick={() => setSelectedTicket(t)}
              className="p-6 group cursor-pointer hover:scale-[1.02] transition-all border border-white/5 hover:border-accent/30 relative overflow-hidden flex flex-col h-48"
            >
              <div className="flex justify-between items-start mb-4">
                <span className="text-[10px] font-mono font-black text-accent-strong tracking-tighter opacity-70">
                  #{t.id.slice(0, 6)}
                </span>
                <StatusBadge status={t.status} />
              </div>

              <h4 className="text-base font-black dark:text-white leading-tight mb-4 group-hover:text-accent transition-colors line-clamp-2">
                {t.title}
              </h4>

              <div className="flex items-center justify-between pt-4 border-t border-white/5 mt-auto">
                <div className="flex flex-col gap-1">
                  <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">
                    {t.category}
                  </span>
                  <PriorityBadge level={t.priority} />
                </div>
                <div className="text-right">
                  <p className="text-[9px] font-bold text-gray-500 uppercase tracking-tighter">
                    Reported
                  </p>
                  <p className="text-[10px] font-black dark:text-gray-300">
                    {new Date(t.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Decorative accent */}
              <div className="absolute top-0 right-0 w-16 h-16 bg-accent opacity-0 group-hover:opacity-[0.03] rounded-full blur-2xl transition-opacity translate-x-1/2 -translate-y-1/2"></div>
            </GlassCard>
          ))}
        </div>

        {loading && filteredTickets.length === 0 && (
          <div className="py-24 text-center text-gray-500 animate-pulse font-bold text-sm tracking-widest">
            Fetching Tickets...
          </div>
        )}

        {!loading && filteredTickets.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-20 h-20 rounded-full bg-black/5 dark:bg-white/5 flex items-center justify-center text-gray-500 mb-6">
              <LifeBuoy size={40} />
            </div>
            <h3 className="text-xl font-black dark:text-white mb-2">
              No tickets found
            </h3>
            <p className="text-sm font-bold text-gray-500 uppercase tracking-widest">
              Try adjusting your search or filters
            </p>
          </div>
        )}
      </div>

      <NewTicketModal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        onSubmit={handleCreateTicket}
      />

      <HotelTicketDetailModal
        isOpen={!!selectedTicket}
        ticket={selectedTicket}
        onClose={() => setSelectedTicket(null)}
        onAddMessage={addMessage}
      />
    </div>
  );
};

const SummaryItem = ({ label, value, icon: Icon, color }: any) => (
  <GlassCard className="flex flex-col justify-between h-32 border-white/5 bg-black/5 dark:bg-white/[0.01]">
    <div className="flex justify-between items-start">
      <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">
        {label}
      </p>
      <div className={`p-2.5 rounded-xl bg-black/5 dark:bg-white/5 ${color}`}>
        <Icon size={18} />
      </div>
    </div>
    <h3 className="text-3xl font-black dark:text-white tracking-tighter">
      {value}
    </h3>
  </GlassCard>
);

export default HotelHelp;
