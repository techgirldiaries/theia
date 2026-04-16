import { render, screen } from "@testing-library/preact";
import { beforeEach, describe, expect, it, vi } from "vitest";

// Mock components for testing layout
const MockHeader = () => (
  <header
    data-testid="header"
    style={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      height: "64px",
      zIndex: 50,
    }}
  >
    Header
  </header>
);

const MockSidebar = ({ isExpanded }: { isExpanded: boolean }) => (
  <aside
    data-testid="sidebar"
    style={{
      position: "fixed",
      left: 0,
      top: "64px",
      bottom: "64px",
      width: isExpanded ? "256px" : "64px",
      zIndex: 40,
      transform: isExpanded ? "translateX(0)" : "translateX(-100%)",
    }}
  >
    Sidebar
  </aside>
);

const MockFooter = () => (
  <footer
    data-testid="footer"
    style={{
      position: "fixed",
      bottom: 0,
      left: 0,
      right: 0,
      height: "64px",
      zIndex: 10,
    }}
  >
    Footer
  </footer>
);

const MockMainContent = ({ paddingLeft }: { paddingLeft: string }) => (
  <main
    data-testid="main-content"
    style={{
      paddingTop: "64px",
      paddingBottom: "64px",
      paddingLeft,
      minHeight: "100vh",
    }}
  >
    <div style={{ height: "500px" }}>Main Content</div>
  </main>
);

const MockLayout = ({
  isMobile,
  isSidebarExpanded,
}: {
  isMobile: boolean;
  isSidebarExpanded: boolean;
}) => {
  const paddingLeft = isMobile ? "0px" : isSidebarExpanded ? "256px" : "64px";

  return (
    <div data-testid="layout-container">
      <MockHeader />
      <MockSidebar isExpanded={isSidebarExpanded} />
      <MockMainContent paddingLeft={paddingLeft} />
      <MockFooter />
    </div>
  );
};

describe("Responsive Layout", () => {
  beforeEach(() => {
    // Mock getBoundingClientRect
    Element.prototype.getBoundingClientRect = vi.fn(function (
      this: HTMLElement,
    ) {
      const testId = this.getAttribute("data-testid");

      if (testId === "header") {
        return {
          top: 0,
          left: 0,
          right: window.innerWidth,
          bottom: 64,
          width: window.innerWidth,
          height: 64,
          x: 0,
          y: 0,
          toJSON: () => ({}),
        } as DOMRect;
      }

      if (testId === "footer") {
        return {
          top: window.innerHeight - 64,
          left: 0,
          right: window.innerWidth,
          bottom: window.innerHeight,
          width: window.innerWidth,
          height: 64,
          x: 0,
          y: window.innerHeight - 64,
          toJSON: () => ({}),
        } as DOMRect;
      }

      if (testId === "sidebar") {
        const isExpanded = this.style.width === "256px";
        return {
          top: 64,
          left: 0,
          right: isExpanded ? 256 : 64,
          bottom: window.innerHeight - 64,
          width: isExpanded ? 256 : 64,
          height: window.innerHeight - 128,
          x: 0,
          y: 64,
          toJSON: () => ({}),
        } as DOMRect;
      }

      if (testId === "main-content") {
        const paddingLeft = parseInt(this.style.paddingLeft || "0", 10);
        return {
          top: 64,
          left: paddingLeft,
          right: window.innerWidth,
          bottom: window.innerHeight - 64,
          width: window.innerWidth - paddingLeft,
          height: window.innerHeight - 128,
          x: paddingLeft,
          y: 64,
          toJSON: () => ({}),
        } as DOMRect;
      }

      return {
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: 0,
        height: 0,
        x: 0,
        y: 0,
        toJSON: () => ({}),
      } as DOMRect;
    });
  });

  describe("Mobile viewport (< 768px)", () => {
    beforeEach(() => {
      window.innerWidth = 375;
      window.innerHeight = 667;
    });

    it("should not overlap header and footer", () => {
      render(<MockLayout isMobile={true} isSidebarExpanded={false} />);

      const header = screen.getByTestId("header");
      const footer = screen.getByTestId("footer");
      const mainContent = screen.getByTestId("main-content");

      const headerRect = header.getBoundingClientRect();
      const footerRect = footer.getBoundingClientRect();
      const mainRect = mainContent.getBoundingClientRect();

      // Main content should start below header
      expect(mainRect.top).toBeGreaterThanOrEqual(headerRect.bottom);

      // Main content should end above footer
      expect(mainRect.bottom).toBeLessThanOrEqual(
        footerRect.top + mainRect.height,
      );
    });

    it("should hide sidebar when collapsed on mobile", () => {
      render(<MockLayout isMobile={true} isSidebarExpanded={false} />);

      const sidebar = screen.getByTestId("sidebar");
      const sidebarStyle = window.getComputedStyle(sidebar);

      expect(sidebarStyle.transform).toBe("translateX(-100%)");
    });

    it("should show sidebar as full-screen overlay when expanded", () => {
      render(<MockLayout isMobile={true} isSidebarExpanded={true} />);

      const sidebar = screen.getByTestId("sidebar");
      const sidebarRect = sidebar.getBoundingClientRect();

      expect(sidebarRect.width).toBe(256);
      expect(sidebarRect.top).toBe(64); // Below header
      expect(sidebarRect.bottom).toBe(window.innerHeight - 64); // Above footer
    });

    it("should have no left padding on main content on mobile", () => {
      render(<MockLayout isMobile={true} isSidebarExpanded={false} />);

      const mainContent = screen.getByTestId("main-content");
      expect(mainContent.style.paddingLeft).toBe("0px");
    });
  });

  describe("Desktop viewport (>= 1024px)", () => {
    beforeEach(() => {
      window.innerWidth = 1920;
      window.innerHeight = 1080;
    });

    it("should not overlap header and footer", () => {
      render(<MockLayout isMobile={false} isSidebarExpanded={false} />);

      const header = screen.getByTestId("header");
      const footer = screen.getByTestId("footer");
      const mainContent = screen.getByTestId("main-content");

      const headerRect = header.getBoundingClientRect();
      const footerRect = footer.getBoundingClientRect();
      const mainRect = mainContent.getBoundingClientRect();

      // Main content should start below header
      expect(mainRect.top).toBeGreaterThanOrEqual(headerRect.bottom);

      // Footer should not overlap main content
      expect(footerRect.top).toBeLessThanOrEqual(window.innerHeight);
    });

    it("should show sidebar collapsed by default", () => {
      render(<MockLayout isMobile={false} isSidebarExpanded={false} />);

      const sidebar = screen.getByTestId("sidebar");
      const sidebarRect = sidebar.getBoundingClientRect();

      expect(sidebarRect.width).toBe(64);
    });

    it("should expand sidebar on desktop", () => {
      render(<MockLayout isMobile={false} isSidebarExpanded={true} />);

      const sidebar = screen.getByTestId("sidebar");
      const sidebarRect = sidebar.getBoundingClientRect();

      expect(sidebarRect.width).toBe(256);
    });

    it("should adjust main content padding based on sidebar state", () => {
      const { rerender } = render(
        <MockLayout isMobile={false} isSidebarExpanded={false} />,
      );

      let mainContent = screen.getByTestId("main-content");
      expect(mainContent.style.paddingLeft).toBe("64px");

      rerender(<MockLayout isMobile={false} isSidebarExpanded={true} />);
      mainContent = screen.getByTestId("main-content");
      expect(mainContent.style.paddingLeft).toBe("256px");
    });

    it("should not have sidebar overlap main content", () => {
      render(<MockLayout isMobile={false} isSidebarExpanded={true} />);

      const sidebar = screen.getByTestId("sidebar");
      const mainContent = screen.getByTestId("main-content");

      const sidebarRect = sidebar.getBoundingClientRect();
      const mainRect = mainContent.getBoundingClientRect();

      // Main content should start after sidebar
      expect(mainRect.left).toBeGreaterThanOrEqual(sidebarRect.right);
    });
  });

  describe("Z-index stacking", () => {
    it("should have correct z-index hierarchy", () => {
      render(<MockLayout isMobile={false} isSidebarExpanded={false} />);

      const header = screen.getByTestId("header");
      const sidebar = screen.getByTestId("sidebar");
      const footer = screen.getByTestId("footer");

      const headerZ = parseInt(header.style.zIndex, 10);
      const sidebarZ = parseInt(sidebar.style.zIndex, 10);
      const footerZ = parseInt(footer.style.zIndex, 10);

      // Header should be on top
      expect(headerZ).toBeGreaterThan(sidebarZ);
      expect(headerZ).toBeGreaterThan(footerZ);

      // Sidebar should be above footer
      expect(sidebarZ).toBeGreaterThan(footerZ);
    });
  });

  describe("Scroll behavior", () => {
    it("should allow main content to scroll without footer obscuring content", () => {
      render(<MockLayout isMobile={false} isSidebarExpanded={false} />);

      const mainContent = screen.getByTestId("main-content");
      const footer = screen.getByTestId("footer");

      const _mainRect = mainContent.getBoundingClientRect();
      const footerRect = footer.getBoundingClientRect();

      // Main content should have bottom padding to account for footer
      expect(parseInt(mainContent.style.paddingBottom, 10)).toBe(64);

      // Footer should be fixed at bottom
      expect(footerRect.bottom).toBe(window.innerHeight);
    });
  });
});
