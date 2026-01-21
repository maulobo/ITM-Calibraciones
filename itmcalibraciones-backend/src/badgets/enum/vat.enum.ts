export enum VatENUM {
    TWENTY = `21`,
    TEN = `10,5`,
    NO_IVA = `NO_IVA`,
    EXEMPT = `EXEMPT`,
  }

export const VatLabels: Record<VatENUM, string> = {
  [VatENUM.TWENTY]: `21%`,
  [VatENUM.TEN]: `10,5%`,
  [VatENUM.NO_IVA]: `IVA NO INCLUIDO`,
  [VatENUM.EXEMPT]: `IVA EXENTO`,
};