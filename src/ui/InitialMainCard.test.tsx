import { render, screen } from "@testing-library/react";
import InitialMainCard from "./InitialMainCard";

describe("InitialMainCard", () => {
  it("renders heading and a given content", () => {
    render(
      <InitialMainCard subtitle="">
        <p>Hello World!</p>
      </InitialMainCard>
    );

    expect(
      screen.getByRole("heading", { name: "Octo Call" })
    ).toBeInTheDocument();
    expect(screen.getByText("Hello World!")).toBeInTheDocument();
  });

  it("also renders subtitle along with existing heading and content", () => {
    render(
      <InitialMainCard subtitle="Greetings">
        <p>Hello World!</p>
      </InitialMainCard>
    );

    expect(
      screen.getByRole("heading", { name: "Octo Call" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Greetings" })
    ).toBeInTheDocument();
    expect(screen.getByText("Hello World!")).toBeInTheDocument();
  });
});
