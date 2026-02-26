import { activeBrandConfig } from "../config/brandConfig";
import CreditSummaryStrip from "../components/credit-overview/CreditSummaryStrip";
import AgingSummary from "../components/credit-overview/AgingSummary";
import TransactionLedger from "../components/credit-overview/TransactionLedger";
import CreditPolicySnapshot from "../components/credit-overview/CreditPolicySnapshot";

export default function CreditOverviewPage() {
  const config = activeBrandConfig;

  return (
    <div style={{ width: "100%", maxWidth: 1280, margin: "0 auto", padding: "24px 24px", boxSizing: "border-box" }}>
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-xl font-bold m-0 mb-1" style={{ color: config.primaryColor }}>
          Credit Overview
        </h1>
        <p className="text-sm m-0" style={{ color: config.secondaryColor }}>
          Detailed view of your credit utilization and transactions
        </p>
      </div>

      {/* Credit Summary Strip */}
      <div className="mb-8">
        <CreditSummaryStrip />
      </div>

      {/* Aging Summary */}
      <div className="mb-8">
        <AgingSummary />
      </div>

      {/* Transaction Ledger */}
      <div className="mb-10">
        <TransactionLedger />
      </div>

      {/* Credit Policy Snapshot */}
      <CreditPolicySnapshot />
    </div>
  );
}
