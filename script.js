document.addEventListener("DOMContentLoaded", function () {
  const album = document.getElementById("album");
  const saveButton = document.getElementById("saveButton");
  const imageCountInputs = document.querySelectorAll(
    'input[name="imageCount"]'
  );
  const gapSlider = document.getElementById("gapSlider");
  const gapValue = document.getElementById("gapValue");
  const gapColor = document.getElementById("gapColor");
  const imageUpload = document.getElementById("imageUpload");
  const selectedImages = document.getElementById("selectedImages");
  const threeLayoutInputs = document.querySelectorAll(
    'input[name="threeLayout"]'
  );
  const verticalLayout = document.getElementById("verticalLayout");

  let uploadedImages = [];

  function toggleElementVisibility(element, isVisible) {
    element.style.display = isVisible ? "" : "none";
  }

  function updateLayoutOptions() {
    const controls = document.querySelector(".controls");
    const saveButton = document.querySelector("#saveButton");
    const stext = document.querySelector(".stext");
    const text = document.querySelector(".rtext");
    const imageOptions = document.querySelectorAll(".image-option");
    const layoutOptions = document.querySelectorAll(".layout-option");
    const threeImagesLayout = document.getElementById("threeImagesLayout");

    if (uploadedImages.length === 0) {
      controls.classList.add("flex-center");
      toggleElementVisibility(text, false);
      toggleElementVisibility(stext, true);
      toggleElementVisibility(saveButton, false);
      imageOptions.forEach((option) => toggleElementVisibility(option, false));
      layoutOptions.forEach((option) => toggleElementVisibility(option, false));
    } else {
      controls.classList.remove("flex-center");
      toggleElementVisibility(text, true);
      toggleElementVisibility(stext, false);
      imageOptions.forEach((option) => toggleElementVisibility(option, true));
      layoutOptions.forEach((option) => toggleElementVisibility(option, true));

      imageOptions.forEach((option, i) => {
        toggleElementVisibility(option, i < Math.min(4, uploadedImages.length));
      });

      toggleElementVisibility(threeImagesLayout, uploadedImages.length > 2);

      const checkedRadio = document.querySelector(
        'input[name="imageCount"]:checked'
      );
      if (
        !checkedRadio ||
        parseInt(checkedRadio.value) > uploadedImages.length
      ) {
        const validRadio = document.querySelector(
          `input[name="imageCount"][value="${uploadedImages.length}"]`
        );
        if (validRadio) validRadio.checked = true;
      }
    }
  }

  imageUpload.addEventListener("change", function (e) {
    const files = Array.from(e.target.files).slice(0, 4); // Limit to 4 files
    const validFiles = files.filter((file) => file.type.startsWith("image/")); // Check for images

    if (files.length > 4) {
      alert("You can select a maximum of 4 images");
      return;
    }

    uploadedImages = [];
    selectedImages.innerHTML = "";

    validFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = function (e) {
        uploadedImages.push(e.target.result);
        selectedImages.innerHTML += `<div>${file.name}</div>`;
        updateLayoutOptions();
        updateLayout();
      };
      reader.readAsDataURL(file);
    });
  });

  function updateLayout() {
    if (uploadedImages.length === 0) return;

    const imageCount = parseInt(
      document.querySelector('input[name="imageCount"]:checked').value
    );
    const gap = gapSlider.value;
    const backgroundColor = gapColor.value;

    album.style.setProperty("--gap-size", gap + "px");
    album.style.backgroundColor = backgroundColor;
    album.innerHTML = "";

    album.className = "album";
    const imagesToDisplay = uploadedImages.slice(0, imageCount);

    if (imageCount === 2) {
      album.classList.toggle("vertical", verticalLayout.checked);
      album.classList.toggle("horizontal", !verticalLayout.checked);

      album.style.gridTemplateColumns = verticalLayout.checked
        ? "1fr"
        : `repeat(2, calc(50% - ${gap / 2}px))`;
      album.style.gridTemplateRows = verticalLayout.checked
        ? `repeat(2, calc(50% - ${gap / 2}px))`
        : "1fr";

      imagesToDisplay.forEach((src) => album.appendChild(createImage(src)));
    } else if (imageCount === 3) {
      const layout = document.querySelector(
        'input[name="threeLayout"]:checked'
      ).value;
      album.classList.add("three-images", `layout-${layout}`);
      album.style.gridTemplateColumns = "";
      album.style.gridTemplateRows = "";
      album.style.gap = `${gap}px`;

      imagesToDisplay.forEach((src) => album.appendChild(createImage(src)));
    } else {
      album.classList.add("four-images");
      album.style.gridTemplateColumns = "1fr 1fr";
      album.style.gridTemplateRows = "1fr 1fr";
      album.style.gap = `${gap}px`;

      imagesToDisplay.forEach((src) => album.appendChild(createImage(src)));
    }
  }

  function createImage(src) {
    const img = document.createElement("img");
    img.src = src;
    img.alt = "Album image";
    img.style.width = "100%";
    img.style.height = "100%";
    img.draggable = false;
    img.style.objectFit = "cover";
    return img;
  }

  imageCountInputs.forEach((input) =>
    input.addEventListener("change", updateLayout)
  );
  gapSlider.addEventListener("input", function () {
    gapValue.textContent = this.value;
    updateLayout();
  });
  gapColor.addEventListener("input", updateLayout);
  threeLayoutInputs.forEach((input) =>
    input.addEventListener("change", updateLayout)
  );
  verticalLayout.addEventListener("change", updateLayout);

  saveButton.addEventListener("click", function () {
    album.style.width = "1080px";
    album.style.height = "1080px";

    domtoimage
      .toPng(album, {
        width: 1080,
        height: 1080,
        style: { backgroundColor: gapColor.value },
      })
      .then((dataUrl) => {
        album.style.width = "";
        album.style.height = "";

        const link = document.createElement("a");
        link.download = "instagram_album.png";
        link.href = dataUrl;
        link.click();
      })
      .catch((error) => {
        console.error("Error saving image:", error);
      });
  });

  updateLayout();
  updateLayoutOptions();
  window.addEventListener("resize", updateLayout);
});
