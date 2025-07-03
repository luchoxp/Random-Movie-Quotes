let quotes = [];
let isSpanish = false;

fetch("quotes.json")
  .then(response => response.json())
  .then(data => {
    quotes = data.filter(q => q.quote && q.character && q.movie);
  })
  .catch(error => {
    console.error("Failed to load quotes:", error);
  });
  
const quoteBtn = document.getElementById("quoteBtn");
const langToggle = document.getElementById("langToggle");
const quoteTextElem = document.getElementById("quoteText");
const quoteInfoElem = document.getElementById("quoteInfo");
const imageLoader = document.getElementById("imageLoader");

const imdbImageElem = document.createElement("img");
imdbImageElem.id = "imdbImage";
const imdbLink = document.createElement("a");
imdbLink.target = "_blank";
imdbLink.appendChild(imdbImageElem);
document.getElementById("quoteBox").appendChild(imdbLink);

quoteBtn.addEventListener("click", () => {
  if (quotes.length === 0) return;

  const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
  const imdbUrl = randomQuote.image_link || "";
  loadPosterImage(randomQuote.image_link); // Now we call a function

  if (isSpanish) {
    const quote = randomQuote.quote_spa?.trim() || randomQuote.quote?.trim() || "[Frase no disponible]";
    const character = randomQuote.character?.trim() || "Desconocido";
    const movie = randomQuote.movie_spa?.trim() || randomQuote.movie?.trim() || "Desconocida";

    quoteTextElem.textContent = `"${quote}"`;
    quoteInfoElem.innerHTML = `– ${character}, <strong>${movie}</strong>`;
  } else {
    const quote = randomQuote.quote?.trim() || "[No quote available]";
    const character = randomQuote.character?.trim() || "Unknown";
    const movie = randomQuote.movie?.trim() || "[Unknown]";

    quoteTextElem.textContent = `"${quote}"`;
    quoteInfoElem.innerHTML = `– ${character}, <strong>${movie}</strong>`;
  }
});

langToggle.addEventListener("click", () => {
  isSpanish = !isSpanish;
  langToggle.setAttribute("aria-pressed", isSpanish);
  langToggle.textContent = isSpanish ? "In English" : "En Español";
  quoteBtn.textContent = isSpanish ? "¡Muéstrame una frase!" : "Show Me a Quote";

  quoteTextElem.textContent = "";
  quoteInfoElem.textContent = "";
  imdbImageElem.style.display = "none";
});

quoteBox.classList.remove("show");
void quoteBox.offsetWidth; // Force reflow
quoteBox.classList.add("show");

document.getElementById("shareBtn").addEventListener("click", () => {
  const quoteBox = document.getElementById("quoteBox");

  html2canvas(quoteBox, {
    useCORS: true,
    backgroundColor: "#FFF8F0"
  }).then(canvas => {
    const link = document.createElement("a");
    link.download = "movie-quote.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  });
});

async function shareImage() {
  const quoteBox = document.getElementById("quoteBox");
  const canvas = await html2canvas(quoteBox, {useCORS: true, backgroundColor: "#FFF8F0"});

  return new Promise((resolve, reject) => {
    canvas.toBlob(async (blob) => {
      const filesArray = [new File([blob], "quote.png", {type: "image/png"})];

      if (navigator.canShare && navigator.canShare({ files: filesArray })) {
        try {
          await navigator.share({
            files: filesArray,
            title: "Movie Quote",
            text: "Check out this quote!",
          });
          resolve(true);
        } catch (error) {
          console.error("Sharing failed:", error);
          reject(error);
        }
      } else {
        alert("Sharing images is not supported on this browser. Please use the 'Save as Image' button instead.");
        reject("Unsupported browser");
      }
    });
  });
}

document.getElementById("shareImageBtn").addEventListener("click", () => {
  shareImage();
});

function loadPosterImage(imdbUrl) {
  const imdbIdMatch = imdbUrl.match(/(tt\d{7,})/);
  if (!imdbIdMatch) {
    imdbImageElem.style.display = "none";
    imageLoader.style.display = "none";
    return;
  }

  const imdbId = imdbIdMatch[1];
  const posterUrl = `https://img.omdbapi.com/?i=${imdbId}&h=600&apikey=ed963bb7`;

  // Show spinner, hide image while loading
  imageLoader.style.display = "block";
  imdbImageElem.style.display = "none";

  imdbImageElem.onload = () => {
    imageLoader.style.display = "none";
    imdbImageElem.style.display = "block";
  };

  imdbImageElem.onerror = () => {
    imageLoader.style.display = "none";
    imdbImageElem.style.display = "none";
  };

  imdbImageElem.src = posterUrl;
}