let list = null;
let allList = null;
let currentParent = null;
let currentId = "";

$(document).ready(async function () {
  const token = fetchToken();
  if (token) {
    const res = await authenticate(token);
    if (res.code == FAILED) return (window.location.pathname = "login.html");
  } else {
    return (window.location.pathname = "login.html");
  }
  // 載入導覽列
  loadOldNavigation();
  const user = await fetchMyInfo(token);
  allList = await fetchPrayers(token);
  list = allList.filter((item) => !item.parent);
  setupUI({ list, user });
  // Events
  $("#add-click").on("click", async function () {
    $("#confirmation").find(".modal-body").empty();
    createForm({ target: "", title: "", content: "" });
    $("#submit")
      .attr("name", "new")
      .removeClass("btn-danger")
      .addClass("btn-success")
      .text("新增");
    $(".form-group.form-check.d-none").removeClass("d-none");
  });
  $("#submit").on("click", async function () {
    const type = $(this).attr("name");
    switch (type) {
      case "remove":
        $(this).text("處理中");
        const res = await deletePrayer({ id: currentId, token });
        if (res.code !== SUCCESS) {
          $(this).text("移除");
          return showToast("移除失敗");
        }
        list = list.filter((item) => item.id !== currentId);
        renderList();
        $("#confirmation").modal("hide");
        $(this).text("移除");
        currentId = null;
        break;
      default:
        const title = $("#title").val();
        const target = $("#target").val();
        const content = $("#content").val();
        const isChecked = $("#update-check").is(":checked");
        if (!isChecked) return showToast("請勾選同意");
        if (!content) {
          $("#content").addClass("border-danger");
          return showToast("請輸入內容");
        }
        $(this).text("處理中");
        const prayer = {
          title,
          target,
          content,
          parent: currentParent || "",
          priority: list.length,
          owner: user.id,
          updated: Date.now(),
        };
        if (type === "new") {
          const res = await createPrayer({ token, prayer });
          if (res.code !== SUCCESS) {
            $(this).text("新增");
            return showToast("新增失敗");
          }
          list.push(res.prayer);
          allList.push(res.prayer);
          renderList();
        } else {
          prayer["id"] = currentId;
          const res = await updatePrayer({ id: currentId, token, prayer });
          if (res.code !== SUCCESS) {
            $(this).text("修改");
            return showToast("編輯失敗");
          }
          list = list.map((item) => {
            if (currentId === item.id) {
              return prayer;
            } else {
              return item;
            }
          });
          renderList();
          currentId = null;
        }
        $(this).text(type === "new" ? "新增" : "修改");
        $("#confirmation").modal("hide");
        clearForm();
        break;
    }
  });
  $("#confirmation").on("hide.bs.modal", function () {
    clearForm();
  });
  $("#back-click").on("click", function () {
    const id = $(this).attr("name");
    const prayerTarget = allList.find((item) => item.id === id);
    currentParent = prayerTarget.parent || null;
    $("#parent").text(
      prayerTarget.parent
        ? allList.find((item) => item.id === prayerTarget.parent).target
        : "禱告清單"
    );
    if (prayerTarget.parent) {
      $("#back-click").attr("name", prayerTarget.parent);
    } else {
      $("#back-click").addClass("d-none").removeAttr("name");
    }
    list = allList.filter((item) => {
      if (prayerTarget.parent) {
        return prayerTarget.parent === item.parent;
      } else {
        return !item.parent;
      }
    });
    renderList();
  });
  $("#signout-btn").on("click", function () {
    clearToken();
  });
  $(document).on("focus", "#content", function () {
    $(this).removeClass("border-danger");
  });
  $(document).on("click", "#edit-click", async function () {
    currentId = $(this).parent().attr("name");
    const user = list && list.find((item) => item.id === currentId);
    if (!user) return showToast("載入失敗");
    $("#confirmation").find(".modal-body").empty();
    $("#submit")
      .attr("name", "edit")
      .removeClass("btn-danger")
      .addClass("btn-success")
      .text("修改");
    createForm(user);
  });
  $(document).on("click", "#ans-click", async function () {
    currentId = $(this).parent().attr("name");
    $("#confirmation").find(".modal-body").empty();
    $("#submit")
      .attr("name", "remove")
      .removeClass("btn-success")
      .addClass("btn-danger")
      .text("移除");
    $("#confirmation")
      .modal("show")
      .find(".modal-body")
      .append(`<h4>確定移除此項目？</h4>`)
      .parent()
      .find(".modal-footer > .form-check")
      .addClass("d-none");
  });
  $(document).on("click", "#sub-click", async function () {
    currentParent = $(this).parent().attr("name");
    const prayerTarget = allList.find((item) => item.id === currentParent);
    $("#parent").text(prayerTarget.target);
    $("#back-click").removeClass("d-none").attr("name", prayerTarget.id);
    list = allList.filter((item) => item.parent === currentParent);
    renderList();
  });
  // Methods
  function setupUI({ list, user }) {
    if (user) $("#your-kname").text(`歡迎！${user.kname}`);
    renderList();
    $(".loading").addClass("disappear");
    $(".loaded").removeClass("disappear");
  }
  function insertPrayerCard({ id, title = "", content, target = "" }) {
    const str = `
        <div class="card mb-3">
            <div class="card-body">
                <h5 class="card-title"><span class="font-weight-bold">${title}</span> ${
      target ? `(對象：${target})` : ""
    }</h5>
                <p class="card-text">${content}</p>
                <div class="btn-group mr-2" role="group" name="${id}">
                    <button type="button" class="btn btn-secondary" id="edit-click">編輯</button>
                    ${
                      target &&
                      '<button type="button" class="btn btn-secondary" id="sub-click">細節</button>'
                    }
                    <button type="button" class="btn btn-secondary" id="ans-click">已回應</button>
                </div>
            </div>
        </div>
        `;
    $("#prayer-list").append(str);
  }
  function createForm({ title = "", target = "", content = "" }) {
    $("#confirmation").modal("show").find(".modal-body").append(`
            <form>
                <div class="form-group">
                    <label for="title">主題</label>
                    <input type="text" class="form-control" id="title" value="${title}" placeholder="非必填">
                </div>
                <div class="form-group">
                    <label for="target">對象</label>
                    <input type="text" class="form-control" id="target" value="${target}" placeholder="非必填">
                </div>
                <div class="form-group">
                    <label for="content">內容</label>
                    <textarea class="form-control" id="content" placeholder="必填選項">${content}</textarea>
                </div>
            </form>
        `);
  }
  function renderList() {
    $("#prayer-list").empty();
    if (list.length === 0) $("#prayer-list").append("<h5>沒有代禱項目</h5>");
    list.forEach((item) => {
      insertPrayerCard({ ...item });
    });
  }
  function clearForm() {
    $("#title").val("");
    $("#target").val("");
    $("#content").val("").removeClass("border-danger");
    $("#update-check").prop("checked", false);
  }
});

async function createPrayer({ token, prayer }) {
  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `bearer ${token}`,
    },
    body: JSON.stringify(prayer),
  };
  const res = await (await fetch(`${url}/api/prayer`, options)).json();
  return res;
}

async function fetchPrayers(token) {
  const options = {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `bearer ${token}`,
    },
  };
  const res = await (await fetch(`${url}/api/prayer`, options)).json();
  switch (res.code) {
    case SUCCESS:
      return res.prayers;
    default:
      return null;
  }
}

async function updatePrayer({ id, token, prayer }) {
  const options = {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `bearer ${token}`,
    },
    body: JSON.stringify(prayer),
  };
  const res = await (await fetch(`${url}/api/prayer/${id}`, options)).json();
  return res;
}

async function deletePrayer({ id, token }) {
  const options = {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `bearer ${token}`,
    },
  };
  const res = await (
    await fetch(`${url}/api/prayer/answer/${id}`, options)
  ).json();
  return res;
}
