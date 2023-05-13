$(document).ready(async function () {
  const token = fetchToken();
  const res = await authenticate(token);
  if (!token || !res || res.code == FAILED)
    return (window.location.pathname = "login.html");

  // 載入導覽列
  loadNavigation();
  loadTabOptions();
  insertModal();
  insertToast();

  $(document).on("click", "#signout-btn", function () {
    clearToken();
  });

  // 開啟新增modal
  $(document).on("keydown", "#payment-type-input", function (event) {
    if (event.keyCode === 13) {
      const value = $(this).val();
      if (!value) return;
      $("#type-label").attr("name", "ptype");
      $("#confirmation .modal-body").append(
        `<span>確定新增付費方式：${value}</span>`
      );
      $("#confirmation #submit").addClass("btn-success").text("送出");
      $("#confirmation").modal("show");
    }
  });
  $(document).on("keydown", "#keep-type-input", function (event) {
    if (event.keyCode === 13) {
      const value = $(this).val();
      if (!value) return;
      $("#type-label").attr("name", "ktype");
      $("#confirmation .modal-body").append(
        `<span>確定新增記帳類型：${value}</span>`
      );
      $("#confirmation #submit").addClass("btn-success").text("送出");
      $("#confirmation").modal("show");
    }
  });
  // 開啟刪除modal
  $(document).on("click", "#ptype-list-item", function () {
    const value = $(this).find("span").text();
    const typeId = $(this).attr("name");
    $("#type-label").attr("name", "ptype");
    $("#confirmation .modal-body").append(
      `<span>確定移除付費方式：${value}</span>`
    );
    $("#confirmation #submit")
      .attr("name", typeId)
      .addClass("btn-danger")
      .text("刪除");
    $("#confirmation").modal("show");
  });
  $(document).on("click", "#ktype-list-item", function () {
    const value = $(this).find("span").text();
    const typeId = $(this).attr("name");
    $("#type-label").attr("name", "ktype");
    $("#confirmation .modal-body").append(
      `<span>確定移除記帳方式：${value}</span>`
    );
    $("#confirmation #submit")
      .attr("name", typeId)
      .addClass("btn-danger")
      .text("刪除");
    $("#confirmation").modal("show");
  });
  // 新增/刪除付費方式
  $(document).on("click", "#confirmation #submit", async function () {
    const typeId = $(this).attr("name");
    const typeLabel = $("#type-label").attr("name");

    switch (typeLabel) {
      case "ptype":
        const paymentTitle = $("#payment-type-input").val();
        await operatePaymentApi(typeId, paymentTitle);
        break;
      case "ktype":
        const keepTitle = $("#keep-type-input").val();
        await operateKeepTypeApi(typeId, keepTitle);
        break;
    }

    removeModalStyle();
  });
  $(document).on("hidden.bs.modal", "#confirmation", function () {
    removeModalStyle();
  });
  // 記帳項目
  $(document).on("click", "#keep-submit", async function () {
    const amount = $("#amount").val();
    const memo = $("#memo").val();
    const keep_type = $("#keep-type-select").val();
    const pay_type = $("#payment-type-select").val();
    if (!amount) {
      showNewToast("請輸入金額");
    }
    const response = await createKeep({
      amount,
      keep_type,
      pay_type,
      memo,
    });
    showNewToast(response.code);
    if (response.code === SUCCESS) {
      $("#amount").val("");
      $("#memo").val("");
      $("#keep-type-select").val("");
      $("#payment-type-select").val("");
    }
  });
});

function showNewToast(text) {
  $("#toast > .toast-body").text(text);
  const toast = new bootstrap.Toast($("#toast"));
  toast.show();
}

function removeModalStyle() {
  $("#confirmation").modal("hide");
  $("#confirmation .modal-body").empty();
  $("#confirmation #submit").attr("class", "btn").attr("name", "").text("");
  $("#payment-type-input").val("");
  $("#keep-type-input").val("");
  $("#type-label").attr("name", "");
}

function loadTabOptions() {
  // tabs
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
  // contents
  $("#keep-tabs-content").append(
    KEEP_TABS.map((keep, index) => {
      return `
        <div
            class="tab-pane fade${index === 0 ? " show active" : ""}"
            id="${keep.id}"
            role="tabpanel"
            aria-labelledby="${keep.id}-tab"
        >
          <div class="d-flex flex-column align-items-center">${loadContent(
            keep
          )}</div>
        </div>
    `;
    }).join("")
  );
  // 記帳類別
  fetchKeepTypesApi().then((res) => {
    const types = res.types;
    $("#keep-type-list").append(
      types.map(({ type_id, title }) => {
        return `
          <li class="list-group-item pointer" id="ktype-list-item" name="${type_id}">
            <span>${title || ""}</span>
          </li>`;
      })
    );
    $("#keep-type-select").append(
      types.map(
        ({ type_id, title }) => `<option value="${type_id}">${title}</option>`
      )
    );
  });
  // 付費類別
  paymentTypesApi().then((res) => {
    const types = res.types;
    $("#payment-type-list").append(
      types.map((type) => {
        return `
          <li class="list-group-item pointer" id="ptype-list-item" name="${
            type.type_id
          }">
            <span>${type.title || ""}</span>
          </li>`;
      })
    );
    $("#payment-type-select").append(
      types.map(
        ({ type_id, title }) => `<option value="${type_id}">${title}</option>`
      )
    );
    $(".loading").addClass("disappear");
    $(".loaded").removeClass("disappear");
  });
}

function loadContent(keep) {
  switch (keep.id) {
    case "payment-type":
    case "keep-type":
      return `
        <div class="my-3">
          <label for="${keep.id}-input" class="form-label">${keep.name}</label>
          <input type="text" class="form-control form-control-lg" id="${keep.id}-input" />
        </div>
        <div class="container mb-3">
          <ul class="list-group" id="${keep.id}-list"></ul>
        </div>
      `;
    default:
      return `
        <form>
          <div class="my-3">
            <label for="amount" class="form-label">金額</label>
            <input type="number" class="form-control form-control-lg" id="amount" />
          </div>
          <div class="my-3">
            <label for="amount" class="form-label">記帳類型</label>
            <select class="form-select" id="keep-type-select"></select>
          </div>
          <div class="my-3">
            <label for="amount" class="form-label">付款類型</label>
            <select class="form-select" id="payment-type-select"></select>
          </div>
          <div class="my-3">
            <label for="amount" class="form-label">備註</label>
            <textarea class="form-control" id="memo" rows="3"></textarea>
          </div>
          <div class="d-flex justify-content-center my-3">
            <button type="button" id="keep-submit" class="btn btn-secondary btn-lg">送出</button>
          </div>
        </form>
      `;
  }
}

async function operateKeepTypeApi(typeId, title) {
  try {
    if (typeId) {
      await deleteKeepTypeApi(typeId);
      $(`#keep-type-list [name=${typeId}]`).remove();
    } else {
      const type = await createKeepTypeApi({ title });
      $("#keep-type-list").prepend(`
        <li class="list-group-item pointer" id="ktype-list-item" name="${type.type_id}">
          <span>${title}</span>
        </li>
      `);
    }
  } catch (error) {}
}

async function fetchKeepTypesApi() {
  try {
    const options = {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${fetchToken()}`,
      },
    };
    const response = await fetch(`${url}/api/keep/keep-types`, options);
    return await response.json();
  } catch (error) {}
}

async function createKeepTypeApi(body) {
  try {
    const options = {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${fetchToken()}`,
      },
      method: "POST",
      body: JSON.stringify({ ...body }),
    };
    const response = await fetch(`${url}/api/keep/keep-type`, options);
    return await response.json();
  } catch (error) {}
}

async function deleteKeepTypeApi(typeId) {
  try {
    const options = {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${fetchToken()}`,
      },
      method: "DELETE",
    };
    const response = await fetch(
      `${url}/api/keep/keep-type/${typeId}`,
      options
    );
    return await response.json();
  } catch (error) {}
}

async function operatePaymentApi(typeId, title) {
  try {
    if (typeId) {
      await deletePTypeApi(typeId);
      $(`#payment-type-list [name=${typeId}]`).remove();
    } else {
      const type = await createPTypeApi({ title });
      $("#payment-type-list").prepend(`
        <li class="list-group-item pointer" id="ptype-list-item" name="${type.type_id}">
          <span>${title}</span>
        </li>
      `);
    }
  } catch (error) {}
}

async function paymentTypesApi() {
  const response = await fetch(`${url}/api/keep/payment-types`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${fetchToken()}`,
    },
  });
  return await response.json();
}

async function createPTypeApi(body) {
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
  return json;
}

async function deletePTypeApi(id) {
  const options = {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${fetchToken()}`,
    },
    method: "DELETE",
  };
  const response = await fetch(`${url}/api/keep/payment-type/${id}`, options);
  const json = await response.json();
  return json;
}

async function createKeep(body) {
  const options = {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${fetchToken()}`,
    },
    method: "POST",
    body: JSON.stringify({ ...body }),
  };
  try {
    const response = await fetch(`${url}/api/keep`, options);
    const json = await response.json();
    return json;
  } catch (error) {
    console.error(error);
  }
}
