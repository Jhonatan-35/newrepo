  document.addEventListener("DOMContentLoaded", function () {
    const inputs = document.querySelectorAll("input, textarea, select");

    inputs.forEach(input => {
      input.addEventListener("input", () => {
        updateFieldColor(input);
      });

      input.addEventListener("blur", () => {
        updateFieldColor(input);
      });
    });

    function updateFieldColor(field) {
      if (!field.checkValidity()) {
        field.classList.add("invalid");
        field.classList.remove("valid");
      } else {
        field.classList.remove("invalid");
        field.classList.add("valid");
      }
    }
  });