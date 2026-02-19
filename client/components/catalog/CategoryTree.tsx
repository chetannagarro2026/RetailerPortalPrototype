import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { RightOutlined } from "@ant-design/icons";
import { activeBrandConfig } from "../../config/brandConfig";
import {
  type CatalogNode,
  catalogNodes,
  getChildren as getMockChildren,
  getSlugPath as getMockSlugPath,
  getAncestors as getMockAncestors,
} from "../../data/catalogData";
import {
  type CategoryTree as CategoryTreeType,
  getChildren,
  getSlugPath,
  getAncestors,
} from "../../services/categoryService";

interface CategoryTreeProps {
  activeNodeId: string;
  rootNodeId: string;
  tree?: CategoryTreeType; // Optional tree from API, falls back to mock data
}

export default function CategoryTree({ activeNodeId, rootNodeId, tree }: CategoryTreeProps) {
  const config = activeBrandConfig;
  
  // Use tree-based functions if tree is provided, otherwise use mock functions
  const getChildrenFn = useMemo(
    () => (tree ? (nodeId: string) => getChildren(tree, nodeId) : getMockChildren),
    [tree]
  );
  const getAncestorsFn = useMemo(
    () => (tree ? (nodeId: string) => getAncestors(tree, nodeId) : getMockAncestors),
    [tree]
  );
  
  const rootChildren = getChildrenFn(rootNodeId);

  // Auto-expand the active branch
  const [expanded, setExpanded] = useState<Set<string>>(() => {
    const initial = new Set<string>();
    const ancestors = getAncestorsFn(activeNodeId);
    ancestors.forEach((a) => initial.add(a.id));
    const activeNode = tree 
      ? tree.nodes.get(activeNodeId)
      : catalogNodes.find((n) => n.id === activeNodeId);
    if (activeNode?.hasChildren) initial.add(activeNodeId);
    return initial;
  });

  // Re-expand when active node changes
  useEffect(() => {
    const ancestors = getAncestorsFn(activeNodeId);
    const activeNode = tree 
      ? tree.nodes.get(activeNodeId)
      : catalogNodes.find((n) => n.id === activeNodeId);
    
    setExpanded((prev) => {
      const next = new Set(prev);
      ancestors.forEach((a) => next.add(a.id));
      if (activeNode?.hasChildren) next.add(activeNodeId);
      return next;
    });
  }, [activeNodeId, getAncestorsFn, tree]);

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
          tree={tree}
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
  tree?: CategoryTreeType;
}

function TreeNode({ node, activeNodeId, expanded, onToggle, config, depth, tree }: TreeNodeProps) {
  // Use tree-based functions if tree is provided, otherwise use mock functions
  const getChildrenFn = useMemo(
    () => (tree ? (nodeId: string) => getChildren(tree, nodeId) : getMockChildren),
    [tree]
  );
  const getSlugPathFn = useMemo(
    () => (tree ? (nodeId: string) => getSlugPath(tree, nodeId) : getMockSlugPath),
    [tree]
  );
  
  const children = getChildrenFn(node.id);
  const isExpanded = expanded.has(node.id);
  const isActive = node.id === activeNodeId;
  const slugPath = getSlugPathFn(node.id);
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
              tree={tree}
            />
          ))}
        </div>
      )}
    </div>
  );
}
