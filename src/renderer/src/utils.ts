export const deleteProxy = (obj: any) => {
  return JSON.parse(JSON.stringify(obj));
};

export const showToast = (message: string, status: string): void => {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.className = "toast";
  if (status) {
    toast?.classList.add(status);
  }
  toast?.classList.add("show");
  setTimeout(() => {
    toast?.classList.remove("show");
  }, 3000);
};
