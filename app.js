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
      alert("Lütfen giriş ve çıkış tarihlerini seçin.");
      return;
    }


    const nights =
      calculateNights(startDate, endDate);


    if (nights <= 0) {
      alert("Çıkış tarihi giriş tarihinden sonra olmalı.");
      return;
    }


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


    document.getElementById(
      "searchResult"
    ).textContent =
      `${guests} misafir için ${nights} gecelik örnek konaklama`;
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
        alert("Önce tarih seçip uygunluk araması yapın.");
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


      document
        .getElementById("checkoutSection")
        .classList.remove("hidden");

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


    document
      .getElementById("confirmationSection")
      .classList.remove("hidden");

  });
