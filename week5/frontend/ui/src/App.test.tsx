import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "../src/App";

describe("App", () => {
  it("renders without crashing", () => {
    render(<App />);
    expect(screen.getByText("Week 5 App")).toBeDefined();
  });

  it("shows notes tab by default", () => {
    render(<App />);
    expect(screen.getByText("Notes (")).toBeDefined();
  });

  it("switches to action items tab", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByText("Action Items"));
    expect(screen.getByText("New action item")).toBeDefined();
  });

  it("switches to tags tab", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByText("Tags ("));
    expect(screen.getByText("Create Tag")).toBeDefined();
  });
});