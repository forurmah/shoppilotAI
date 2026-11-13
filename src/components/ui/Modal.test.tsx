/** @vitest-environment jsdom */

import { useState } from "react";
import { describe, it, expect, afterEach, vi } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { Modal } from "./Modal";

afterEach(() => {
  cleanup();
  document.body.style.overflow = "";
});

describe("Modal", () => {
  it("focuses the close button on open, traps Tab, and closes on Escape or backdrop click", () => {
    const onClose = vi.fn();

    render(
      <Modal
        isOpen
        onClose={onClose}
        titleId="test-modal-title"
        eyebrow="Preview"
        closeLabel="Close dialog"
      >
        <h2 id="test-modal-title">Test Dialog</h2>
        <button type="button">Action</button>
      </Modal>
    );

    const closeBtn = screen.getByRole("button", { name: "Close dialog" });
    const actionBtn = screen.getByRole("button", { name: "Action" });

    expect(closeBtn).toHaveFocus();
    expect(document.body.style.overflow).toBe("hidden");

    // Shift+Tab from first element wraps to last element
    fireEvent.keyDown(document, { key: "Tab", shiftKey: true });
    expect(actionBtn).toHaveFocus();

    // Tab from last element wraps back to first element
    fireEvent.keyDown(document, { key: "Tab", shiftKey: false });
    expect(closeBtn).toHaveFocus();

    // Backdrop click triggers onClose
    const backdrop = screen.getByRole("dialog").parentElement!;
    fireEvent.click(backdrop);
    expect(onClose).toHaveBeenCalledTimes(1);

    // Escape triggers onClose
    fireEvent.keyDown(document, { key: "Escape" });
    expect(onClose).toHaveBeenCalledTimes(2);
  });

  it("restores focus to the triggering element when closed", () => {
    function Harness() {
      const [open, setOpen] = useState(false);
      return (
        <>
          <button type="button" onClick={() => setOpen(true)}>
            Open Dialog
          </button>
          <Modal
            isOpen={open}
            onClose={() => setOpen(false)}
            titleId="restore-title"
            eyebrow="Restore"
            closeLabel="Close restore dialog"
          >
            <h2 id="restore-title">Focus Restore</h2>
          </Modal>
        </>
      );
    }

    render(<Harness />);

    const trigger = screen.getByRole("button", { name: "Open Dialog" });
    trigger.focus();
    fireEvent.click(trigger);

    expect(
      screen.getByRole("button", { name: "Close restore dialog" })
    ).toHaveFocus();

    fireEvent.click(
      screen.getByRole("button", { name: "Close restore dialog" })
    );
    expect(trigger).toHaveFocus();
    expect(document.body.style.overflow).toBe("");
  });
});
