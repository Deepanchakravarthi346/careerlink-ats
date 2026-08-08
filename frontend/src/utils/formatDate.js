export const formatDate = (dateString) => {
  if (!dateString) return "N/A";

  const date = new Date(dateString);
  
  // Check if date is invalid
  if (isNaN(date.getTime())) return "N/A";

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are 0-indexed
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
};
