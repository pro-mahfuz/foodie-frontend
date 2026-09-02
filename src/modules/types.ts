
export type OptionStringType = {
  label: string;
  value: string;
};

export type OptionBooleanType = {
  label: string;
  value: boolean;
};

export type OptionNumberType = {
  label: string;
  value: number;
};

export const RoleOptions = [
  { value: 1, label: "Admin" },
  { value: 2, label: "Manager" },
  { value: 3, label: "Sales" },
  { value: 4, label: "Purchase" },
];

export const statusOptions: OptionBooleanType[] = [
  { value: true, label: "Active" },
  { value: false, label: "Inactive" },
];

export const partyStatusOptions: OptionStringType[] = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
  { value: "blocked", label: "Blocked" },
  { value: "archived", label: "Archived" },
];

export const phoneCodeOptions = [
  { code: "", label: "" },
  { code: "AE", label: "+971" },
  { code: "BD", label: "+880" },
  { code: "CA", label: "+1" },
  { code: "CN", label: "+86" },
  { code: "VN", label: "+84" },
  { code: "US", label: "+1" },
];

export const partyTypeOptions = [
  { value: "customer", label: "Customer" },
  { value: "supplier", label: "Supplier" },
];

export  const countries = [
  { code: "", label: "" },
  { code: "AE", label: "+971" },
  { code: "BD", label: "+880" },
  { code: "CA", label: "+1" },
  { code: "CN", label: "+86" },
  { code: "VN", label: "+84" },
  { code: "US", label: "+1" },
];

export const CurrencyOptions: OptionStringType[] = [
  { value: "AED", label: "AED" },
  { value: "BDT", label: "BDT" },
  { value: "CAD", label: "CAD" },
  { value: "EUR", label: "EUR" },
  { value: "SAR", label: "SAR" },
  { value: "USD", label: "USD" },
];

export const MovementTypeOptions: OptionStringType[] = [
  { value: "stock_in", label: "Stock-In" },
  { value: "stock_out", label: "Stock-Out" },
  { value: "damaged", label: "Damaged" },
  // { value: "saleReturn", label: "Return" },
  // { value: "damage", label: "Damaged" }
];


export const selectStyles = {
  control: (base: any, state: any) => ({
  ...base,
  borderColor: state.isFocused ? "#72a4f5ff" : "#d1d5db",
  boxShadow: state.isFocused ? "0 0 0 1px #8eb8fcff" : "none",
  padding: "0.25rem 0.5rem",
  borderRadius: "0.375rem",
  minHeight: "38px",
  fontSize: "0.875rem",
  "&:hover": {
      borderColor: "#3b82f6",
  },
  }),
  menu: (base: any) => ({
  ...base,
  zIndex: 9999,
  }),
  menuPortal: (base: any) => ({
  ...base,
  zIndex: 9999,
  }),
  option: (base: any, state: any) => ({
  ...base,
  backgroundColor: state.isFocused ? "#e0f2fe" : "white",
  color: "#1f2937",
  fontSize: "0.875rem",
  padding: "0.5rem 0.75rem",
  }),
};
