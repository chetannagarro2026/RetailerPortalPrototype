import { activeBrandConfig } from "../config/brandConfig";
import FinancialPosition from "../components/credit-overview/FinancialPosition";
import ExposureByAging from "../components/credit-overview/ExposureByAging";
import PendingCreditImpact from "../components/credit-overview/PendingCreditImpact";
import TransactionLedger from "../components/credit-overview/TransactionLedger";

export default function CreditOverviewPage() {
  const config = activeBrandConfig;

  return (
    <div style={{ width: "100%", maxWidth: 1280, margin: "0 auto", padding: "24px 24px", boxSizing: "border-box" }}>
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-xl font-bold m-0" style={{ color: config.primaryColor }}>
          Credit Overview
        </h1>
      </div>

      {/* Financial Position */}
      <div className="mb-8">
        <FinancialPosition />
      </div>

      {/* Exposure by Aging */}
      <div className="mb-8">
        <ExposureByAging />
      </div>

      {/* Pending Credit Impact */}
      <div className="mb-8">
        <PendingCreditImpact />
      </div>

      {/* Transaction Ledger */}
      <div className="mb-10">
        <TransactionLedger />
      </div>
    </div>
  );
}
