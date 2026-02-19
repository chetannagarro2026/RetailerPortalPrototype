import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { RightOutlined } from "@ant-design/icons";
import { activeBrandConfig } from "../../config/brandConfig";
import {
  type CatalogNode,
  catalogNodes,
  getChildren,
  getSlugPath,
  getAncestors,
} from "../../data/catalogData";

interface CategoryTreeProps {
  activeNodeId: string;
  rootNodeId: string;
}

export default function CategoryTree({ activeNodeId, rootNodeId }: CategoryTreeProps) {
  const config = activeBrandConfig;
  const rootChildren = getChildren(rootNodeId);

  // Auto-expand the active branch (or expand level-1 nodes when no active node)
  const [expanded, setExpanded] = useState<Set<string>>(() => {
    const initial = new Set<string>();
    if (activeNodeId) {
      getAncestors(activeNodeId).forEach((a) => initial.add(a.id));
      const activeNode = catalogNodes.find((n) => n.id === activeNodeId);
      if (activeNode?.hasChildren) initial.add(activeNodeId);
    } else {
      // Global/brand mode: expand level-1 nodes
      rootChildren.forEach((c) => initial.add(c.id));
    }
    return initial;
  });

  // Re-expand when active node changes
  useEffect(() => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (activeNodeId) {
        getAncestors(activeNodeId).forEach((a) => next.add(a.id));
        const activeNode = catalogNodes.find((n) => n.id === activeNodeId);
        if (activeNode?.hasChildren) next.add(activeNodeId);
      }
      return next;
    });
  }, [activeNodeId]);

  const toggle = (nodeId: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(nodeId)) next.delete(nodeId);
      else next.add(nodeId);
      return next;
    });
  };

  return (
    <nav className="text-sm">
      {rootChildren.map((child) => (
        <TreeNode
          key={child.id}
          node={child}
          activeNodeId={activeNodeId}
          expanded={expanded}
          onToggle={toggle}
          config={config}
          depth={0}
        />
      ))}
    </nav>
  );
}

interface TreeNodeProps {
  node: CatalogNode;
  activeNodeId: string;
  expanded: Set<string>;
  onToggle: (id: string) => void;
  config: typeof activeBrandConfig;
  depth: number;
}

function TreeNode({ node, activeNodeId, expanded, onToggle, config, depth }: TreeNodeProps) {
  const children = getChildren(node.id);
  const isExpanded = expanded.has(node.id);
  const isActive = node.id === activeNodeId;
  const slugPath = getSlugPath(node.id);
  const href = `/catalog/${slugPath.join("/")}`;

  return (
    <div>
      <div
        className="flex items-center gap-1 rounded-md transition-colors"
        style={{
          paddingLeft: depth * 16,
          backgroundColor: isActive ? config.cardBg : "transparent",
        }}
      >
        {/* Expand toggle */}
        {node.hasChildren && children.length > 0 ? (
          <button
            onClick={() => onToggle(node.id)}
            className="w-6 h-6 flex items-center justify-center shrink-0 cursor-pointer bg-transparent border-none"
            style={{ color: config.secondaryColor }}
          >
            <RightOutlined
              className="text-[8px] transition-transform duration-200"
              style={{ transform: isExpanded ? "rotate(90deg)" : "rotate(0deg)" }}
            />
          </button>
        ) : (
          <span className="w-6 shrink-0" />
        )}

        <Link
          to={href}
          className="flex-1 py-2 pr-2 no-underline truncate text-xs transition-colors"
          style={{
            color: isActive ? config.primaryColor : "#4B5563",
            fontWeight: isActive ? 600 : 400,
          }}
        >
          {node.label}
          {node.productCount > 0 && (
            <span className="ml-1.5 opacity-50">({node.productCount})</span>
          )}
        </Link>
      </div>

      {/* Children */}
      {isExpanded && children.length > 0 && (
        <div>
          {children.map((child) => (
            <TreeNode
              key={child.id}
              node={child}
              activeNodeId={activeNodeId}
              expanded={expanded}
              onToggle={onToggle}
              config={config}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}
