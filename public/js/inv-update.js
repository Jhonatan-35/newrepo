const form = document.querySelector("#editInventory");

if (form) {
  const updateBtn = form.querySelector("button");
  if (updateBtn) {
    updateBtn.setAttribute("disabled", true);

    form.addEventListener("change", function () {
      updateBtn.removeAttribute("disabled");
    });
  }
}