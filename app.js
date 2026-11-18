const PROPERTY_ID = "hizli-otel-demo";

let bookingState = {
  startDate: null,
  endDate: null,
  nights: 0,
  guests: 0,
  roomType: null,
  pricePerNight: 0,
  totalValue: 0
};

const searchResult = document.getElementById("searchResult");
const checkoutSection = document.getElementById("checkoutSection");
const confirmationSection = document.getElementById("confirmationSection");
const purchaseButton = document.getElementById("purchaseButton");

function moveTo(element) {
  const behavior = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ? "auto" : "smooth";
  element.scrollIntoView({ behavior, block: "start" });
}

function showSearchMessage(message, isError = false) {
  searchResult.textContent = message;
  searchResult.classList.toggle("is-error", isError);
}

function resetBooking() {
  bookingState.nights = 0;
  bookingState.roomType = null;
  checkoutSection.classList.add("hidden");
  confirmationSection.classList.add("hidden");
  purchaseButton.disabled = false;
  purchaseButton.innerHTML = 'Rezervasyonu Simüle Et <span aria-hidden="true">↗</span>';
  showSearchMessage("");
}

["checkin", "checkout", "guests"].forEach(id => {
  document.getElementById(id).addEventListener("change", resetBooking);
});


function pushEvent(eventName, parameters = {}) {

  const eventData = {
    event: eventName,
    property_id: PROPERTY_ID,
    ...parameters
  };

  window.dataLayer.push(eventData);

  console.log(
    "%cDataLayer Event:",
    "color: green; font-weight: bold;",
    eventData
  );
}


function calculateNights(startDate, endDate) {

  const start = new Date(startDate);
  const end = new Date(endDate);

  const difference = end - start;

  return difference / (1000 * 60 * 60 * 24);
}


document
  .getElementById("searchButton")
  .addEventListener("click", () => {

    const startDate =
      document.getElementById("checkin").value;

    const endDate =
      document.getElementById("checkout").value;

    const guests =
      Number(document.getElementById("guests").value);


    if (!startDate || !endDate) {
      showSearchMessage("Devam etmek için giriş ve çıkış tarihlerini seçin.", true);
      document.getElementById(!startDate ? "checkin" : "checkout").focus();
      return;
    }


    const nights =
      calculateNights(startDate, endDate);


    if (nights <= 0) {
      showSearchMessage("Çıkış tarihi giriş tarihinden sonra olmalı.", true);
      document.getElementById("checkout").focus();
      return;
    }

    resetBooking();

    bookingState.startDate = startDate;
    bookingState.endDate = endDate;
    bookingState.nights = nights;
    bookingState.guests = guests;


    pushEvent(
      "search_availability",
      {
        start_date: startDate,
        end_date: endDate,
        nights: nights,
        guests: guests
      }
    );


    showSearchMessage(`${guests} misafir için ${nights} gecelik örnek konaklama`);
    moveTo(document.getElementById("odalar"));
  });



document
  .querySelectorAll(".view-room")
  .forEach(button => {

    button.addEventListener("click", event => {

      const roomCard =
        event.target.closest(".room-card");

      const roomType =
        roomCard.dataset.room;

      const price =
        Number(roomCard.dataset.price);

      const details = roomCard.querySelector(".room-details");
      const isOpening = details.classList.contains("hidden");
      details.classList.toggle("hidden", !isOpening);
      button.setAttribute("aria-expanded", String(isOpening));
      button.textContent = isOpening ? "Detayı Kapat" : "Odayı İncele";

      if (!isOpening) return;


      pushEvent(
        "view_item",
        {
          room_type: roomType,
          value: price,
          currency: "USD"
        }
      );

    });

  });



document
  .querySelectorAll(".book-room")
  .forEach(button => {

    button.addEventListener("click", event => {

      if (!bookingState.nights) {
        showSearchMessage("Oda seçmeden önce tarihleri girip Odaları Gör'e basın.", true);
        moveTo(document.getElementById("rezervasyon"));
        return;
      }


      const roomCard =
        event.target.closest(".room-card");

      const roomType =
        roomCard.dataset.room;

      const price =
        Number(roomCard.dataset.price);

      const total =
        price * bookingState.nights;


      bookingState.roomType = roomType;
      bookingState.pricePerNight = price;
      bookingState.totalValue = total;


      pushEvent(
        "begin_checkout",
        {
          start_date: bookingState.startDate,
          end_date: bookingState.endDate,
          nights: bookingState.nights,
          guests: bookingState.guests,
          room_type: roomType,
          value: total,
          currency: "USD"
        }
      );


      document.getElementById(
        "checkoutSummary"
      ).textContent =
        `${roomType} · ${bookingState.nights} gece · $${total}`;


      confirmationSection.classList.add("hidden");
      purchaseButton.disabled = false;
      purchaseButton.innerHTML = 'Rezervasyonu Simüle Et <span aria-hidden="true">↗</span>';
      checkoutSection.classList.remove("hidden");
      moveTo(checkoutSection);

    });

  });



document
  .getElementById("purchaseButton")
  .addEventListener("click", () => {

    if (!bookingState.roomType) {
      return;
    }


    const transactionId =
      `DEMO-${Date.now()}`;


    pushEvent(
      "purchase",
      {
        transaction_id: transactionId,

        start_date:
          bookingState.startDate,

        end_date:
          bookingState.endDate,

        nights:
          bookingState.nights,

        guests:
          bookingState.guests,

        room_type:
          bookingState.roomType,

        items: [{
          item_name: bookingState.roomType,
          price: bookingState.totalValue,
          quantity: 1
        }],

        value:
          bookingState.totalValue,

        currency:
          "USD"
      }
    );


    document.getElementById(
      "confirmationText"
    ).textContent =
      `Demo akışı ${transactionId} tamamlandı. Gerçek rezervasyon oluşturulmadı.`;


    confirmationSection.classList.remove("hidden");
    purchaseButton.disabled = true;
    purchaseButton.textContent = "Demo tamamlandı";
    moveTo(confirmationSection);

  });
