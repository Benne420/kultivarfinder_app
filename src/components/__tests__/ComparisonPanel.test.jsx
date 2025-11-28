import { render } from "@testing-library/react";
import ComparisonPanel from "../ComparisonPanel";

const sampleCultivars = [
  { name: "Alpha", thc: "20%", cbd: "<1%", typ: "indica" },
  { name: "Beta", thc: "18%", cbd: "<1%", typ: "sativa" },
];

describe("ComparisonPanel", () => {
  it("rendert das Spaltenlayout mit grid-template-columns", () => {
    const { container } = render(
      <ComparisonPanel
        isOpen
        cultivars={sampleCultivars}
        onClose={() => {}}
        onRequestAdd={() => {}}
        onShowAllDetails={() => {}}
        layoutMetrics={{
          panelWidthPx: 800,
          columnWidthPx: 200,
          radarHeightPx: 150,
        }}
      />
    );

    const headerRow = container.querySelector(
      ".comparison-panel__row--header"
    );
    expect(headerRow).not.toBeNull();
    expect(headerRow.style.gridTemplateColumns).toMatch(/repeat/);
  });
});

