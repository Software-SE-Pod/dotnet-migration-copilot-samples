import React from "react";
import { render, waitFor } from "@testing-library/react";
import Page from "../index";
import * as api from "../../../api/generated";

jest.mock("../../../api/generated");

describe("ContosouniversityWebformsPagesInstructorsInstructoredit page", () => {
  it("calls the API on mount", async () => {
    (api.getContosouniversityWebformsPagesInstructorsInstructoredit as jest.Mock).mockResolvedValue({});
    render(<Page />);
    await waitFor(() => {
      expect(api.getContosouniversityWebformsPagesInstructorsInstructoredit).toHaveBeenCalled();
    });
  });
});
