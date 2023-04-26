$(document).ready(async function () {
  const token = fetchToken();
  const res = await authenticate(token);
  if (!token || !res || res.code == FAILED)
    return (window.location.pathname = "login.html");

  // 載入導覽列
  loadNavigation();
  loadTabOptions();
  insertModal();

  $(".loading").addClass("disappear");
  $(".loaded").removeClass("disappear");

  $(document).on("click", "#signout-btn", function () {
    clearToken();
  });

  $(document).on("keydown", "#payment-type-input", function (event) {
    if (event.keyCode === 13) {
      const value = $(this).val();
      if (!value) return;
      $("#confirmation").modal("show");
      $("#confirmation .modal-body").append(
        `<span>確定新增付費方式：${value}</span>`
      );
      $("#confirmation #submit").text("送出");
    }
  });
  // 新增付費方式
  $(document).on("click", "#confirmation #submit", async function () {
    const title = $("#payment-type-input").val();
    await createTypeApi({ title });
  });
});

function loadTabOptions() {
  $("#keep-tabs").append(
    KEEP_TABS.map((keep, index) => {
      return `
        <li class="nav-item" role="presentation">
            <button
            class="nav-link${index === 0 ? " show active" : ""}"
            id="${keep.id}-tab"
            data-bs-toggle="tab"
            data-bs-target="#${keep.id}"
            type="button"
            role="tab"
            aria-controls="${keep.id}"
            aria-selected="true"
            >
            ${keep.name}
            </button>
        </li>
        `;
    }).join("")
  );
  $("#keep-tabs-content").append(
    KEEP_TABS.map((keep, index) => {
      return `
        <div
            class="tab-pane fade${index === 0 ? " show active" : ""}"
            id="${keep.id}"
            role="tabpanel"
            aria-labelledby="${keep.id}-tab"
        >
          <div class="d-flex flex-column align-items-center">${loadForm(
            keep
          )}</div>
        </div>
    `;
    }).join("")
  );
}

function loadForm(keep) {
  switch (keep.id) {
    case "payment-type":
    case "keep-type":
      return `
        <div class="my-3">
          <label for="${keep.id}-input" class="form-label">${keep.name}</label>
          <input type="text" class="form-control form-control-lg" id="${
            keep.id
          }-input" placeholder="${keep.name}" />
        </div>
        ${loadPaymentTypes()}
      `;
    default:
      return `
        <form>
          <div class="my-3">
            <label for="amount" class="form-label">金額</label>
            <input type="number" class="form-control form-control-lg" id="amount" />
          </div>
        </form>
      `;
  }
}

function loadPaymentTypes() {
  const types = [];
  return `
    <div class="container mb-3">
      <ul class="list-group">
        <li class="list-group-item">An item</li>
        <li class="list-group-item">A second item</li>
        <li class="list-group-item">A third item</li>
        <li class="list-group-item">A fourth item</li>
        <li class="list-group-item">And a fifth one</li>
      </ul>
    </div>
  `;
}

async function paymentTypeApi() {
  const response = await fetch(`${url}/api/keep/payment-types`, {
    headers: {},
  });
  return await response.json();
}

async function createTypeApi(body) {
  const options = {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${fetchToken()}`,
    },
    method: "POST",
    body: JSON.stringify({ ...body }),
  };
  const response = await fetch(`${url}/api/keep/payment-type`, options);
  const json = await response.json();
  console.log("json", json);
}
