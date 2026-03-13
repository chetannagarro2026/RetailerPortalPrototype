import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeftOutlined, FileTextOutlined } from "@ant-design/icons";
import { activeBrandConfig } from "../config/brandConfig";
import { getSchemeById } from "../data/schemes";
import SchemeOverview from "../components/schemes/SchemeOverview";
import PerformanceSummary from "../components/schemes/PerformanceSummary";
import CalculationBreakdown from "../components/schemes/CalculationBreakdown";

export default function SchemeDetailPage() {
  const config = activeBrandConfig;
  const navigate = useNavigate();
  const { schemeId } = useParams<{ schemeId: string }>();

  const scheme = schemeId ? getSchemeById(schemeId) : null;

  if (!scheme) {
    return (
      <div style={{ width: "100%", maxWidth: 1280, margin: "0 auto", padding: "64px 24px", boxSizing: "border-box" }} className="text-center">
        <FileTextOutlined className="text-5xl mb-4" style={{ color: config.secondaryColor }} />
        <h1 className="text-xl font-semibold mb-2" style={{ color: config.primaryColor }}>Scheme Not Found</h1>
        <p className="text-sm mb-6" style={{ color: config.secondaryColor }}>The scheme you're looking for doesn't exist.</p>
        <button
          onClick={() => navigate("/account/schemes")}
          className="text-sm font-medium px-6 py-2.5 rounded-lg text-white border-none cursor-pointer"
          style={{ backgroundColor: config.primaryColor }}
        >
          Back to Schemes
        </button>
      </div>
    );
  }

  return (
    <div style={{ width: "100%", maxWidth: 1280, margin: "0 auto", boxSizing: "border-box" }}>
      {/* Back link */}
      <div className="px-4 pt-4 pb-4">
        <button
          onClick={() => navigate("/account/schemes")}
          className="flex items-center gap-2 text-sm font-medium cursor-pointer bg-transparent border-none px-0"
          style={{ color: config.secondaryColor }}
        >
          <ArrowLeftOutlined style={{ fontSize: 12 }} />
          Back to Schemes & Promotions
        </button>
      </div>

      {/* Two-column layout */}
      <div className="flex gap-6 px-4 pb-4" style={{ minHeight: "calc(100vh - 260px)" }}>
        {/* Left column — 68% */}
        <div style={{ flex: "0 0 68%", minWidth: 0 }} className="flex flex-col gap-6">
          <SchemeOverview scheme={scheme} />
          <CalculationBreakdown scheme={scheme} />
        </div>

        {/* Right column — 30% */}
        <div style={{ flex: "0 0 30%", minWidth: 0, alignSelf: "flex-start" }}>
          <PerformanceSummary scheme={scheme} />
        </div>
      </div>
    </div>
  );
}
