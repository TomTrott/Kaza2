import {
  render,
  fireEvent,
  waitFor,
} from "@testing-library/react";
import PropertyCard from "./PropertyCard";
import api from "@/services/api";

jest.mock("@/services/api");

const mockedApi = api as jest.Mocked<typeof api>;

describe("PropertyCard", () => {
  const property = {
    id: "1",
    title: "Villa Luxe",
    cover: "/villa.jpg",
    location: "Paris",
    price_per_night: 150,
  };

  beforeEach(() => {
    localStorage.setItem("token", "token");
    localStorage.setItem(
      "user",
      JSON.stringify({ id: 1 })
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  it("charge le statut favori", async () => {
    mockedApi.get.mockResolvedValue({
      data: [{ id: "1" }],
    } as any);

    render(
      <PropertyCard property={property} />
    );

    await waitFor(() => {
      expect(mockedApi.get).toHaveBeenCalled();
    });
  });

  it("ajoute un favori", async () => {
    mockedApi.get.mockResolvedValue({
      data: [],
    } as any);

    mockedApi.post.mockResolvedValue(
      {} as any
    );

    render(
      <PropertyCard property={property} />
    );

    await waitFor(() => {
      expect(mockedApi.get).toHaveBeenCalled();
    });

    const button =
      document.querySelector("button");

    expect(button).not.toBeNull();

    fireEvent.click(button!);

    await waitFor(() => {
      expect(mockedApi.post).toHaveBeenCalledWith(
        "/api/properties/1/favorite"
      );
    });
  });

  it("supprime un favori", async () => {
    mockedApi.get.mockResolvedValue({
      data: [{ id: "1" }],
    } as any);

    mockedApi.delete.mockResolvedValue(
      {} as any
    );

    render(
      <PropertyCard property={property} />
    );

    await waitFor(() => {
      expect(mockedApi.get).toHaveBeenCalled();
    });

    const button =
      document.querySelector("button");

    expect(button).not.toBeNull();

    fireEvent.click(button!);

    await waitFor(() => {
      expect(mockedApi.delete).toHaveBeenCalledWith(
        "/api/properties/1/favorite"
      );
    });
  });
});