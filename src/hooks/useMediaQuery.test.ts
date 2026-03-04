import { act, renderHook } from "@testing-library/preact";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useBreakpoints, useMediaQuery } from "@/hooks/useMediaQuery";

describe("useMediaQuery", () => {
  beforeEach(() => {
    // Reset matchMedia mock before each test
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));
  });

  it("should return false when media query does not match", () => {
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    const { result } = renderHook(() => useMediaQuery("(min-width: 1024px)"));
    expect(result.current).toBe(false);
  });

  it("should return true when media query matches", () => {
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: true,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    const { result } = renderHook(() => useMediaQuery("(min-width: 1024px)"));
    expect(result.current).toBe(true);
  });

  it("should update when media query match changes", () => {
    let listener: ((event: any) => void) | null = null;

    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn((_event, callback) => {
        listener = callback;
      }),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    const { result } = renderHook(() => useMediaQuery("(min-width: 1024px)"));
    expect(result.current).toBe(false);

    // Simulate media query change
    act(() => {
      if (listener) {
        listener({ matches: true, media: "(min-width: 1024px)" } as any);
      }
    });

    expect(result.current).toBe(true);
  });
});

describe("useBreakpoints", () => {
  it("should detect mobile viewport", () => {
    window.matchMedia = vi.fn().mockImplementation((query: string) => {
      if (query === "(max-width: 767px)") {
        return {
          matches: true,
          media: query,
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
        };
      }
      return {
        matches: false,
        media: query,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      };
    });

    const { result } = renderHook(() => useBreakpoints());
    expect(result.current.isMobile).toBe(true);
    expect(result.current.isDesktop).toBe(false);
    expect(result.current.isMobileOrTablet).toBe(true);
  });

  it("should detect desktop viewport", () => {
    window.matchMedia = vi.fn().mockImplementation((query: string) => {
      if (query === "(min-width: 1024px)") {
        return {
          matches: true,
          media: query,
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
        };
      }
      return {
        matches: false,
        media: query,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      };
    });

    const { result } = renderHook(() => useBreakpoints());
    expect(result.current.isDesktop).toBe(true);
    expect(result.current.isMobile).toBe(false);
    expect(result.current.isDesktopOrLarger).toBe(true);
  });

  it("should detect tablet viewport", () => {
    window.matchMedia = vi.fn().mockImplementation((query: string) => {
      if (query === "(min-width: 768px) and (max-width: 1023px)") {
        return {
          matches: true,
          media: query,
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
        };
      }
      return {
        matches: false,
        media: query,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      };
    });

    const { result } = renderHook(() => useBreakpoints());
    expect(result.current.isTablet).toBe(true);
    expect(result.current.isMobile).toBe(false);
    expect(result.current.isDesktop).toBe(false);
    expect(result.current.isMobileOrTablet).toBe(true);
  });
});
