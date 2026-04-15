import * as React from "react";

import { cn } from "../../lib/utils";

// ---- Context ----

interface TabsContextValue {
  activeTab: string;
  setActiveTab: (value: string) => void;
}

const TabsContext = React.createContext<TabsContextValue>({
  activeTab: "",
  setActiveTab: () => {},
});

// ---- Tabs（根容器） ----

interface TabsProps {
  defaultValue: string;
  value?: string;
  onValueChange?: (value: string) => void;
  children: React.ReactNode;
  className?: string;
}

const Tabs = ({
  defaultValue,
  value,
  onValueChange,
  children,
  className,
}: TabsProps) => {
  const [internalTab, setInternalTab] = React.useState(defaultValue);
  const activeTab = value ?? internalTab;

  const setActiveTab = React.useCallback(
    (newValue: string) => {
      if (value === undefined) {
        setInternalTab(newValue);
      }
      onValueChange?.(newValue);
    },
    [value, onValueChange],
  );

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      <div className={cn("w-full", className)}>{children}</div>
    </TabsContext.Provider>
  );
};
Tabs.displayName = "Tabs";

// ---- TabsList（Tab 按鈕容器）----

const TabsList = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => {
  const { activeTab } = React.useContext(TabsContext);

  // 统计 TabsTrigger 子元素数量和当前激活索引
  const triggers = React.Children.toArray(children).filter(
    (child) =>
      React.isValidElement(child) &&
      (child.props as { value?: string }).value !== undefined,
  );
  const tabCount = triggers.length;
  const activeIndex = triggers.findIndex(
    (child) =>
      React.isValidElement(child) &&
      (child.props as { value?: string }).value === activeTab,
  );

  // 检测 prefers-reduced-motion
  const prefersReducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  return (
    <div
      ref={ref}
      role="tablist"
      className={cn(
        "relative inline-flex h-9 items-center justify-start rounded-lg bg-[hsl(var(--muted))] p-1 text-[hsl(var(--muted-foreground))] mb-4",
        className,
      )}
      {...props}
    >
      {/* 滑块背景层 — 使用 transform: translateX() 实现平移动画 */}
      {tabCount > 0 && activeIndex >= 0 && (
        <div
          aria-hidden="true"
          data-testid="tab-slider"
          className="absolute top-1 bottom-1 rounded-md bg-[hsl(var(--background))] shadow-sm"
          style={{
            width: `calc((100% - 8px) / ${tabCount})`,
            transform: `translateX(calc(${activeIndex} * 100%))`,
            transition: prefersReducedMotion
              ? "none"
              : "transform 200ms ease-in-out",
          }}
        />
      )}
      {children}
    </div>
  );
});
TabsList.displayName = "TabsList";

// ---- TabsTrigger（单个 Tab 按钮） ----

interface TabsTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string;
}

const TabsTrigger = React.forwardRef<HTMLButtonElement, TabsTriggerProps>(
  ({ className, value, children, ...props }, ref) => {
    const { activeTab, setActiveTab } = React.useContext(TabsContext);
    const isActive = activeTab === value;

    return (
      <button
        ref={ref}
        role="tab"
        aria-selected={isActive}
        data-state={isActive ? "active" : "inactive"}
        onClick={() => setActiveTab(value)}
        className={cn(
          "relative z-10 inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium ring-offset-background transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
          isActive
            ? "text-[hsl(var(--foreground))]"
            : "text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]",
          className,
        )}
        {...props}
      >
        {children}
      </button>
    );
  },
);
TabsTrigger.displayName = "TabsTrigger";

// ---- TabsContent（Tab 内容区） ----

interface TabsContentProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
}

const TabsContent = React.forwardRef<HTMLDivElement, TabsContentProps>(
  ({ className, value, children, ...props }, ref) => {
    const { activeTab } = React.useContext(TabsContext);
    const isActive = activeTab === value;

    // 条件渲染：非激活 Tab 不挂载子组件，避免隐藏 Tab 中的 useEffect 等副作用仍然执行
    if (!isActive) return null;

    return (
      <div
        ref={ref}
        role="tabpanel"
        data-state="active"
        className={cn(
          "ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))] focus-visible:ring-offset-2",
          className,
        )}
        {...props}
      >
        {children}
      </div>
    );
  },
);
TabsContent.displayName = "TabsContent";

export { Tabs, TabsContent, TabsList, TabsTrigger };
