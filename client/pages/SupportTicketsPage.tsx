import { useState, useMemo } from "react";
import { PlusOutlined, SearchOutlined, CustomerServiceOutlined } from "@ant-design/icons";
import { activeBrandConfig } from "../config/brandConfig";
import { SUPPORT_TICKETS, type TicketStatus } from "../data/support";
import SupportTicketsTable from "../components/support/SupportTicketsTable";

type TabKey = "All" | "Open" | "Closed" | "Unread";

const TABS: { key: TabKey; label: string }[] = [
  { key: "All", label: "All" },
  { key: "Open", label: "Open" },
  { key: "Closed", label: "Closed" },
  { key: "Unread", label: "Unread" },
];

interface Props {
  onCreateTicket: () => void;
}

export default function SupportTicketsPage({ onCreateTicket }: Props) {
  const config = activeBrandConfig;
  const [activeTab, setActiveTab] = useState<TabKey>("All");
  const [search, setSearch] = useState("");

  const counts = useMemo(() => {
    const map: Record<string, number> = {
      All: SUPPORT_TICKETS.length,
      Open: 0,
      Closed: 0,
      Unread: 0,
    };
    for (const t of SUPPORT_TICKETS) {
      map[t.status] = (map[t.status] || 0) + 1;
      if (t.unread) map.Unread++;
    }
    return map;
  }, []);

  const filtered = useMemo(() => {
    let list = [...SUPPORT_TICKETS];

    if (activeTab === "Open" || activeTab === "Closed") {
      list = list.filter((t) => t.status === activeTab);
    } else if (activeTab === "Unread") {
      list = list.filter((t) => t.unread);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (t) =>
          t.ticketId.toLowerCase().includes(q) ||
          t.subject.toLowerCase().includes(q)
      );
    }

    return list.sort((a, b) => (b.lastUpdated > a.lastUpdated ? 1 : -1));
  }, [activeTab, search]);

  if (SUPPORT_TICKETS.length === 0) {
    return (
      <div
        style={{ width: "100%", maxWidth: 1280, margin: "0 auto", padding: "64px 24px", boxSizing: "border-box" }}
        className="text-center"
      >
        <CustomerServiceOutlined className="text-5xl mb-4" style={{ color: config.secondaryColor }} />
        <h1 className="text-xl font-semibold mb-2" style={{ color: config.primaryColor }}>
          No Support Tickets
        </h1>
        <p className="text-sm mb-6" style={{ color: config.secondaryColor }}>
          You haven't created any support tickets yet.
        </p>
        <button
          onClick={onCreateTicket}
          className="text-sm font-medium px-6 py-2.5 rounded-lg text-white border-none cursor-pointer inline-flex items-center gap-2"
          style={{ backgroundColor: config.primaryColor }}
        >
          <PlusOutlined style={{ fontSize: 12 }} />
          Create Ticket
        </button>
      </div>
    );
  }

  return (
    <div style={{ width: "100%", maxWidth: 1280, margin: "0 auto", padding: "24px 24px", boxSizing: "border-box" }}>
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold m-0" style={{ color: config.primaryColor }}>
          Support Tickets
        </h1>
        <button
          onClick={onCreateTicket}
          className="flex items-center gap-2 text-sm font-medium px-4 py-2.5 rounded-lg cursor-pointer text-white border-none transition-colors"
          style={{ backgroundColor: config.primaryColor }}
        >
          <PlusOutlined style={{ fontSize: 12 }} />
          Create Ticket
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3 mb-4">
        <div
          className="inline-flex rounded-lg overflow-hidden"
          style={{ border: `1px solid ${config.borderColor}` }}
        >
          {TABS.map((tab, idx) => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className="px-4 py-2 text-xs font-medium cursor-pointer transition-colors whitespace-nowrap"
                style={{
                  backgroundColor: isActive ? config.primaryColor : "#fff",
                  color: isActive ? "#fff" : config.secondaryColor,
                  border: "none",
                  borderRight: idx < TABS.length - 1 ? `1px solid ${config.borderColor}` : "none",
                }}
              >
                {tab.label} ({counts[tab.key] || 0})
              </button>
            );
          })}
        </div>

        <div className="flex-1" />

        <div className="relative">
          <SearchOutlined
            className="absolute left-3 top-1/2 -translate-y-1/2"
            style={{ fontSize: 13, color: config.secondaryColor }}
          />
          <input
            type="text"
            placeholder="Search by Ticket ID or Subject"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="text-sm rounded-lg pl-8 pr-3 py-2 outline-none"
            style={{
              border: `1px solid ${config.borderColor}`,
              color: config.primaryColor,
              width: 260,
              boxSizing: "border-box",
            }}
          />
        </div>
      </div>

      {/* Table */}
      <SupportTicketsTable tickets={filtered} />
    </div>
  );
}
