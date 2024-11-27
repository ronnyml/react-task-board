import "@testing-library/jest-dom";

jest.mock("./src/config/config", () => ({
  config: {
    serverURL: "http://localhost:3000"
  },
}));
