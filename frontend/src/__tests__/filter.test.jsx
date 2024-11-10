import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import Filter from "../components/filter/Filter";

describe("Filter Component", () => {
  const renderComponent = (initialEntries = ["/"]) => {
    return render(
      <MemoryRouter initialEntries={initialEntries}>
        <Filter />
      </MemoryRouter>
    );
  };

  it("renders the Filter component with inputs", () => {
    renderComponent();
    expect(screen.getByPlaceholderText("City Location")).toBeInTheDocument();
    expect(screen.getByLabelText("Type")).toBeInTheDocument();
    expect(screen.getByLabelText("Property")).toBeInTheDocument();
    expect(screen.getByLabelText("Min Price")).toBeInTheDocument();
    expect(screen.getByLabelText("Max Price")).toBeInTheDocument();
    expect(screen.getByLabelText("Bedroom")).toBeInTheDocument();
  });

  it("updates query state on input change", () => {
    renderComponent();
    const cityInput = screen.getByPlaceholderText("City Location");
    const minPriceInput = screen.getByLabelText("Min Price");
    const typeSelect = screen.getByLabelText("Type");

    fireEvent.change(cityInput, { target: { value: "New York" } });
    fireEvent.change(minPriceInput, { target: { value: "500" } });
    fireEvent.change(typeSelect, { target: { value: "rent" } });

    expect(cityInput.value).toBe("New York");
    expect(minPriceInput.value).toBe("500");
    expect(typeSelect.value).toBe("rent");
  });

  it("sets initial values from URL parameters", () => {
    renderComponent(["/?city=Miami&type=rent&minPrice=200&maxPrice=1000&bedroom=2"]);

    expect(screen.getByPlaceholderText("City Location").value).toBe("Miami");
    expect(screen.getByLabelText("Type").value).toBe("rent");
    expect(screen.getByLabelText("Min Price").value).toBe("200");
    expect(screen.getByLabelText("Max Price").value).toBe("1000");
    expect(screen.getByLabelText("Bedroom").value).toBe("2");
  });
});
