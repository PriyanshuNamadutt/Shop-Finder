// Formats the structured shop address object { line, city, state, pincode }
// into a single display string. Falls back gracefully for older string data.
export const formatAddress = (address) => {
  if (!address) return "";
  if (typeof address === "string") return address;
  const { line, city, state, pincode } = address;
  return [line, city, state, pincode].filter(Boolean).join(", ");
};