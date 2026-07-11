import "@testing-library/jest-dom";

jest.mock("./src/config/config", () => ({
  config: {
    serverURL: "http://localhost:3000"
  },
}));

jest.mock("@atlaskit/pragmatic-drag-and-drop/element/adapter", () => ({
  draggable: jest.fn(() => jest.fn()),
  dropTargetForElements: jest.fn(() => jest.fn()),
  monitorForElements: jest.fn(() => jest.fn()),
}));

jest.mock("@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge", () => ({
  attachClosestEdge: jest.fn((data: unknown) => data),
  extractClosestEdge: jest.fn(() => null),
}));
