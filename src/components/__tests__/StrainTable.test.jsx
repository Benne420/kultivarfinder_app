import { toSafePdfPath } from "../StrainTable";

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

  it("entfernt Schrägstriche und Steuerzeichen, ohne Wörter zu verschmelzen", () => {
    expect(toSafePdfPath("Jack \tHerer/Classic"))
      .toBe("/datenblaetter/Jack_HererClassic.pdf");
  });

  it("bereinigt Apostrophe und kombiniert gemischte Delimiter stabil", () => {
    expect(toSafePdfPath("AC/DC (O'Connor Edition)"))
      .toBe("/datenblaetter/ACDC_(OConnor_Edition).pdf");
  });

  it("fällt bei leeren Eingaben auf das Standarddatenblatt zurück", () => {
    expect(toSafePdfPath("")).toBe("/datenblaetter/datenblatt.pdf");
  });
});

