import "../../test-utils/jest-dom";
import React from "react";
import { render, screen } from "../../test-utils/testing-library-react";
import userEvent from "../../test-utils/testing-library-user-event";
import StrainTable, { toSafePdfPath } from "../StrainTable";

describe("toSafePdfPath", () => {
  it("behält diakritische Zeichen wie Pavé bei", () => {
    expect(toSafePdfPath("Rose Gold Pavé")).toBe(
      "/datenblaetter/Rose_Gold_Pav%C3%A9.pdf"
    );
  });

  it("entfernt verbotene Dateisystem-Zeichen und trimmt Leerzeichen", () => {
    expect(toSafePdfPath('  <Test> "Name"  ')).toBe(
      "/datenblaetter/Test_Name.pdf"
    );
  });

  it("fällt bei leeren Eingaben auf das Standarddatenblatt zurück", () => {
    expect(toSafePdfPath("")).toBe("/datenblaetter/datenblatt.pdf");
  });
});

describe("StrainTable", () => {
  it("paginates mit der eingestellten Seitengröße und setzt den Index beim Wechsel zurück", async () => {
    const user = userEvent.setup();
    const strains = Array.from({ length: 120 }, (_, index) => ({
      name: `Kultivar ${index + 1}`,
      thc: "10%",
      cbd: "<1%",
    }));

    render(<StrainTable strains={strains} selectedCultivars={[]} />);

    expect(screen.getByText(/Seite 1 von 2/)).toBeInTheDocument();
    expect(screen.getByText("Kultivar 100")).toBeInTheDocument();
    expect(screen.queryByText("Kultivar 101")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /Weiter/ }));

    expect(screen.getByText(/Seite 2 von 2/)).toBeInTheDocument();
    expect(screen.getByText("Kultivar 101")).toBeInTheDocument();

    await user.selectOptions(screen.getByLabelText(/Einträge pro Seite/i), "50");

    expect(screen.getByText(/Seite 1 von 3/)).toBeInTheDocument();
    expect(screen.queryByText("Kultivar 51")).not.toBeInTheDocument();
  });

  it("ruft die Toggle-Callback auf, wenn Checkboxen geklickt werden", async () => {
    const user = userEvent.setup();
    const onToggleSelect = jest.fn();
    const strain = { name: "Alpha", thc: "20%", cbd: "<1%" };

    render(
      <StrainTable
        strains={[strain]}
        selectedCultivars={[]}
        onToggleSelect={onToggleSelect}
      />
    );

    const checkbox = screen.getByLabelText(/Alpha für Vergleich auswählen/i);
    await user.click(checkbox);

    expect(onToggleSelect).toHaveBeenCalledTimes(1);
    expect(onToggleSelect).toHaveBeenCalledWith(expect.objectContaining(strain));
  });

  it("stellt den Empty-State zurück, wenn die Reset-Schaltfläche geklickt wird", async () => {
    const user = userEvent.setup();
    const onResetEmptyState = jest.fn();

    render(
      <StrainTable
        strains={[]}
        isSimilarityMode
        onResetEmptyState={onResetEmptyState}
      />
    );

    await user.click(screen.getByRole("button", { name: /Ähnlichkeitssuche zurücksetzen/i }));

    expect(onResetEmptyState).toHaveBeenCalledTimes(1);
  });
});

