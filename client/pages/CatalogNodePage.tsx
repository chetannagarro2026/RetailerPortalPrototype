import { useState } from "react";
import { useParams } from "react-router-dom";
import { Select } from "antd";
import { AppstoreOutlined, UnorderedListOutlined } from "@ant-design/icons";
import { activeBrandConfig } from "../config/brandConfig";
import {
  catalogConfig,
  getNodeBySlugPath,
  getChildren,
  getProductsForNode,
  getAncestors,
} from "../data/catalogData";
import CatalogBreadcrumb from "../components/catalog/CatalogBreadcrumb";
import SubcategoryCardGrid from "../components/catalog/SubcategoryCardGrid";
import CategoryTree from "../components/catalog/CategoryTree";
import FilterPanel from "../components/catalog/FilterPanel";
import CatalogProductGrid from "../components/catalog/CatalogProductGrid";
import SpreadsheetView from "../components/catalog/SpreadsheetView";

type ViewMode = "grid" | "table";

export default function CatalogNodePage() {
  const config = activeBrandConfig;
  const { "*": splat } = useParams();
  const slugPath = splat ? splat.split("/").filter(Boolean) : [];
  const node = getNodeBySlugPath(slugPath);
  const [page, setPage] = useState(1);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");

  if (!node) {
    return (
      <div className="max-w-content mx-auto px-6 py-12 text-center">
        <h1 className="text-xl font-semibold mb-2" style={{ color: config.primaryColor }}>
          Category Not Found
        </h1>
        <p className="text-sm" style={{ color: config.secondaryColor }}>
          The catalog path you requested does not exist.
        </p>
      </div>
    );
  }

  const showTree = node.level >= catalogConfig.treeVisibilityStartLevel;
  const showSubcategoryGrid =
    node.level < catalogConfig.treeVisibilityStartLevel && node.hasChildren;

  const ancestors = getAncestors(node.id);
  const treeRoot =
    ancestors.find((a) => a.level === 1) ||
    (node.level === 1 ? node : null);

  const { products, total } = showTree
    ? getProductsForNode(node.id, page, catalogConfig.pageSize)
    : { products: [], total: 0 };

  const children = getChildren(node.id);

  // ── Level 0 / 1: Subcategory Card Grid ────────────────────────
  if (showSubcategoryGrid) {
    return (
      <div className="max-w-content mx-auto px-6 py-8">
        {node.level > 0 && <CatalogBreadcrumb node={node} />}

        <div className="mb-6">
          <h1
            className="text-xl font-semibold mb-1"
            style={{ color: config.primaryColor }}
          >
            {node.label}
          </h1>
          {node.level === 0 && (
            <p className="text-sm" style={{ color: config.secondaryColor }}>
              Browse the complete {config.brandName} portfolio.
            </p>
          )}
        </div>

        <SubcategoryCardGrid node={node} />
      </div>
    );
  }

  // ── Level 2+: Hybrid Layout (Tree + Filters + Grid/Table) ─────
  return (
    <div className="max-w-content mx-auto px-6 py-8">
      <CatalogBreadcrumb node={node} />

      <div className="flex gap-6">
        {/* Left Sidebar: Tree + Filters */}
        {showTree && treeRoot && (
          <aside
            className="shrink-0 sticky self-start overflow-y-auto pr-4"
            style={{
              width: 240,
              top: "calc(var(--header-height) + var(--nav-height) + 24px)",
              maxHeight: "calc(100vh - var(--header-height) - var(--nav-height) - 48px)",
              borderRight: `1px solid ${config.borderColor}`,
            }}
          >
            <CategoryTree activeNodeId={node.id} rootNodeId={treeRoot.id} />

            {node.filtersAvailable && node.filtersAvailable.length > 0 && (
              <div
                className="mt-5 pt-5"
                style={{ borderTop: `1px solid ${config.borderColor}` }}
              >
                <FilterPanel filtersAvailable={node.filtersAvailable} />
              </div>
            )}
          </aside>
        )}

        {/* Right: Header + Grid/Table */}
        <div className="flex-1 min-w-0">
          {/* Node Header with View Toggle */}
          <div className="flex items-start justify-between mb-5">
            <div>
              <h1
                className="text-lg font-semibold mb-0.5"
                style={{ color: config.primaryColor }}
              >
                {node.label}
              </h1>
              <p className="text-xs" style={{ color: config.secondaryColor }}>
                {total} product{total !== 1 ? "s" : ""}
                {children.length > 0 && ` · ${children.length} subcategories`}
              </p>
            </div>

            <div className="flex items-center gap-3">
              {/* View Mode Toggle */}
              {config.enableSpreadsheetMode && (
                <ViewToggle mode={viewMode} onChange={setViewMode} />
              )}

              <Select
                defaultValue="relevance"
                size="small"
                style={{ width: 160 }}
                options={[
                  { value: "relevance", label: "Sort: Relevance" },
                  { value: "price-asc", label: "Price: Low → High" },
                  { value: "price-desc", label: "Price: High → Low" },
                  { value: "newest", label: "Newest First" },
                  { value: "bestselling", label: "Best Selling" },
                ]}
              />
            </div>
          </div>

          {/* Subcategory pills */}
          {children.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-5">
              {children.map((child) => (
                <a
                  key={child.id}
                  href={`/catalog/${[...slugPath, child.slug].join("/")}`}
                  className="text-[11px] font-medium px-3 py-1.5 rounded-full no-underline transition-colors"
                  style={{
                    border: `1px solid ${config.borderColor}`,
                    color: config.primaryColor,
                    backgroundColor: "#fff",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = config.cardBg;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "#fff";
                  }}
                >
                  {child.label} ({child.productCount})
                </a>
              ))}
            </div>
          )}

          {/* Products — Grid or Table */}
          {viewMode === "grid" ? (
            <CatalogProductGrid
              products={products}
              total={total}
              page={page}
              pageSize={catalogConfig.pageSize}
              onPageChange={setPage}
            />
          ) : (
            <SpreadsheetView
              products={products}
              total={total}
              page={page}
              pageSize={catalogConfig.pageSize}
              onPageChange={setPage}
            />
          )}
        </div>
      </div>
    </div>
  );
}

// ── View Toggle Button ──────────────────────────────────────────────

function ViewToggle({ mode, onChange }: { mode: ViewMode; onChange: (m: ViewMode) => void }) {
  const config = activeBrandConfig;

  return (
    <div
      className="flex rounded-lg overflow-hidden"
      style={{ border: `1px solid ${config.borderColor}` }}
    >
      <button
        onClick={() => onChange("grid")}
        className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium cursor-pointer transition-colors"
        style={{
          backgroundColor: mode === "grid" ? config.primaryColor : "#fff",
          color: mode === "grid" ? "#fff" : config.secondaryColor,
          border: "none",
        }}
      >
        <AppstoreOutlined className="text-xs" />
        Grid
      </button>
      <button
        onClick={() => onChange("table")}
        className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium cursor-pointer transition-colors"
        style={{
          backgroundColor: mode === "table" ? config.primaryColor : "#fff",
          color: mode === "table" ? "#fff" : config.secondaryColor,
          border: "none",
          borderLeft: `1px solid ${config.borderColor}`,
        }}
      >
        <UnorderedListOutlined className="text-xs" />
        Table
      </button>
    </div>
  );
}
