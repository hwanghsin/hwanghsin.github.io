// 處理一般常用函式
const convertToBase64 = (data, callback) => {
  var bytes = new Uint8Array(data);
  callback(`data:image/png;base64,${encode(bytes)}`);
};

const encode = (input) => {
  var keyStr =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
  var output = "";
  var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
  var i = 0;

  while (i < input.length) {
    chr1 = input[i++];
    chr2 = i < input.length ? input[i++] : Number.NaN; // Not sure if the index
    chr3 = i < input.length ? input[i++] : Number.NaN; // checks are needed here

    enc1 = chr1 >> 2;
    enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
    enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
    enc4 = chr3 & 63;

    if (isNaN(chr2)) {
      enc3 = enc4 = 64;
    } else if (isNaN(chr3)) {
      enc4 = 64;
    }
    output +=
      keyStr.charAt(enc1) +
      keyStr.charAt(enc2) +
      keyStr.charAt(enc3) +
      keyStr.charAt(enc4);
  }
  return output;
};

const toBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });

const showToast = (msg) => {
  $("#toast-message").text(msg);
  $("#toast-container").toast({
    animation: true,
    autohide: true,
    delay: 3000,
  });
  $("#toast-container").toast("show");
};

const fetchToken = () => localStorage.getItem("_token");

const clearToken = () => {
  localStorage.clear();
  return (window.location.pathname = "login.html");
};

const fetchUserIdByQueryString = () => {
  const queryStr = new URLSearchParams(window.location.search);
  return queryStr.get("user_id");
};

const insertModal = () => {
  $("body").append(`
    <div class="modal fade" id="confirmation" aria-hidden="true" aria-labelledby="confirmationLabel" tabindex="-1">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="confirmationLabel"></h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body"></div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">取消</button>
            <button class="btn" id="submit"></button>
            <div class="d-none" id="type-label" name=""></div>
          </div>
        </div>
      </div>
    </div>
  `);
};

const insertToast = () => {
  $("body").append(`
    <div class="position-fixed top-0 end-0 p-3" style="z-index: 1050">
      <div id="toast" class="toast" role="alert" aria-live="assertive" aria-atomic="true">
        <div class="toast-header">
          <img src="./images/me.jpg" class="rounded me-2" width="20" height="20" />
          <strong class="me-auto"></strong>
          <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
        <div class="toast-body"></div>
      </div>
    </div>
  `);
};
