import { useState, useCallback } from "react";
import { activeBrandConfig } from "../config/brandConfig";
import { riskDetailData, supportData } from "../data/dashboardData";
import CreditCommandCenter from "../components/dashboard/CreditCommandCenter";
import CreditAlerts from "../components/dashboard/CreditAlerts";
import OrdersOverview from "../components/dashboard/OrdersOverview";
import SupportSnapshot from "../components/dashboard/SupportSnapshot";
import DetailDrawer from "../components/dashboard/DetailDrawer";

type DrawerType = string | null;

const drawerConfig: Record<
  string,
  {
    title: string;
    footerLabel: string;
    footerPath: string;
    columns: { key: string; label: string; render?: (v: any, row: any) => React.ReactNode }[];
  }
> = {
  credit: {
    title: "Credit History",
    footerLabel: "View Credit History",
    footerPath: "/account/credit",
    columns: [
      { key: "reference", label: "Reference" },
      { key: "date", label: "Date", render: (v: string) => fmtDate(v) },
      { key: "amount", label: "Amount", render: (v: number) => fmtCurrency(v) },
      { key: "status", label: "Status" },
    ],
  },
  outstanding: {
    title: "Outstanding Balance",
    footerLabel: "View Invoices",
    footerPath: "/account/invoices",
    columns: [
      { key: "reference", label: "Reference" },
      { key: "date", label: "Date", render: (v: string) => fmtDate(v) },
      { key: "amount", label: "Amount", render: (v: number) => fmtCurrency(v) },
      { key: "status", label: "Status" },
    ],
  },
  overdue: {
    title: "Overdue Invoices",
    footerLabel: "Go to Invoices",
    footerPath: "/account/invoices",
    columns: [
      { key: "reference", label: "Reference" },
      { key: "date", label: "Date", render: (v: string) => fmtDate(v) },
      { key: "amount", label: "Amount", render: (v: number) => fmtCurrency(v) },
      { key: "status", label: "Status" },
    ],
  },
  partial: {
    title: "Partially Paid Invoices",
    footerLabel: "Go to Invoices",
    footerPath: "/account/invoices",
    columns: [
      { key: "reference", label: "Reference" },
      { key: "date", label: "Date", render: (v: string) => fmtDate(v) },
      { key: "amount", label: "Original", render: (v: number) => fmtCurrency(v) },
      { key: "status", label: "Remaining" },
    ],
  },
  "pending-credit": {
    title: "Pending Credit Approval Orders",
    footerLabel: "Go to Purchase Orders",
    footerPath: "/purchase-orders",
    columns: [
      { key: "reference", label: "PO #" },
      { key: "date", label: "Date", render: (v: string) => fmtDate(v) },
      { key: "amount", label: "Amount", render: (v: number) => fmtCurrency(v) },
      { key: "status", label: "Status" },
    ],
  },
  payments: {
    title: "Payment History",
    footerLabel: "View Payment History",
    footerPath: "/account/payment-history",
    columns: [
      { key: "reference", label: "Reference" },
      { key: "date", label: "Date", render: (v: string) => fmtDate(v) },
      { key: "amount", label: "Amount", render: (v: number) => fmtCurrency(v) },
      { key: "status", label: "Status" },
    ],
  },
  support: {
    title: "Support Tickets",
    footerLabel: "Go to Support",
    footerPath: "/account/support",
    columns: [
      { key: "id", label: "Ticket ID" },
      { key: "subject", label: "Subject" },
      { key: "priority", label: "Priority" },
      { key: "status", label: "Status" },
    ],
  },
};

function fmtCurrency(v: number) {
  return "$" + v.toLocaleString("en-US", { minimumFractionDigits: 0 });
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function DashboardPage() {
  const config = activeBrandConfig;
  const [activeDrawer, setActiveDrawer] = useState<DrawerType>(null);

  const handleDrawerOpen = useCallback((key: string) => {
    setActiveDrawer(key);
  }, []);

  const closeDrawer = useCallback(() => {
    setActiveDrawer(null);
  }, []);

  // Resolve drawer data
  const drawerCfg = activeDrawer ? drawerConfig[activeDrawer] : null;
  const drawerRows = activeDrawer === "support"
    ? supportData.tickets
    : activeDrawer
      ? riskDetailData[activeDrawer] || []
      : [];

  return (
    <div className="max-w-[1440px] mx-auto px-6 py-6">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold m-0 mb-1" style={{ color: config.primaryColor }}>
          My Account
        </h1>
        <p className="text-sm m-0" style={{ color: config.secondaryColor }}>
          Financial control center &bull; {config.partnerName}
        </p>
      </div>

      <div className="flex flex-col gap-6">
        {/* Section 1: Credit KPI Row */}
        <CreditCommandCenter onCardClick={handleDrawerOpen} />

        {/* Contextual Alerts (conditional) */}
        <CreditAlerts onViewClick={handleDrawerOpen} />

        {/* Section 2: Orders Overview */}
        <OrdersOverview />

        {/* Section 3: Support Snapshot */}
        <SupportSnapshot onOpenDrawer={() => handleDrawerOpen("support")} />

      </div>

      {/* Detail Drawer */}
      {drawerCfg && (
        <DetailDrawer
          visible={!!activeDrawer}
          onClose={closeDrawer}
          title={drawerCfg.title}
          columns={drawerCfg.columns}
          rows={drawerRows}
          footerLabel={drawerCfg.footerLabel}
          footerPath={drawerCfg.footerPath}
        />
      )}
    </div>
  );
}
