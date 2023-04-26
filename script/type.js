$(document).ready(async function () {
  const token = fetchToken();
  if (token) {
    const res = await authenticate(token);
    if (res.code == FAILED) return (window.location.pathname = "login.html");
  } else {
    return (window.location.pathname = "login.html");
  }
  // 載入導覽列
  await loadNavigation();
  const user = await fetchMyInfo(token);
  if (user) $("#your-kname").text(`歡迎！${user.kname}`);
  let currentId = "";
  let types = await fetchTypes(token);
  if (types) {
    $("#item-container").empty();
    types.forEach((type) => {
      $("#item-container").append(`
                <div class="card float-left m-1" style="width: 10rem;">
                    <div class="card-body">
                        <h5 class="card-title">${type.title}</h5>
                        <a href="#" class="card-link" id="remove-type" name="${type.id}">移除</a>
                    </div>
                </div>
            `);
    });
  }
  $(".loading").addClass("disappear");
  $(".loaded").removeClass("disappear");
  // Events
  $("#add-type").on("click", async function () {
    $("#confirmation .modal-body > h4").text("確定要新增分類？");
    $("#submit").text("新增");
    $("#submit").attr("type", "add");
    $("#confirmation").modal("show");
  });
  $("#submit").on("click", async function () {
    const category = $(this).attr("type");
    switch (category) {
      case "add":
        const type = {
          title: $("#title").val(),
          owner: user.id,
        };
        const addResult = await createType({ token, type });
        if (addResult.code === SUCCESS) {
          $("#title").val("");
          $("#item-container").append(`
                        <div class="card float-left m-1" style="width: 10rem;">
                            <div class="card-body">
                                <h5 class="card-title">${type.title}</h5>
                                <a href="#" class="card-link" id="remove-type" name="${addResult.id}">移除</a>
                            </div>
                        </div>
                    `);
          $("#confirmation").modal("hide");
          showToast(`分類新增`);
        }
        break;
      case "del":
        const delResult = await deleteType({ token, id: currentId });
        if (delResult.code === SUCCESS) {
          types = types.filter((t) => t.id !== currentId);
          $("#item-container").empty();
          types.forEach((t) => {
            $("#item-container").append(`
                            <div class="card float-left m-1" style="width: 10rem;">
                                <div class="card-body">
                                    <h5 class="card-title">${t.title}</h5>
                                    <a href="#" class="card-link" id="remove-type" name="${t.id}">移除</a>
                                </div>
                            </div>
                        `);
          });
          currentId = "";
          $("#confirmation").modal("hide");
          showToast(`分類已刪除`);
        }
        break;
    }
  });
  $(document).on("click", "#remove-type", async function () {
    currentId = $(this).attr("name");
    $("#confirmation .modal-body > h4").text("確定要刪除此分類？");
    $("#submit").text("確認");
    $("#submit").attr("type", "del");
    $("#confirmation").modal("show");
  });
});

async function createType({ token, type }) {
  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `bearer ${token}`,
    },
    body: JSON.stringify(type),
  };
  const res = await (await fetch(`${url}/api/types/blog`, options)).json();
  return res;
}

async function fetchTypes(token) {
  const options = {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `bearer ${token}`,
    },
  };
  const res = await (await fetch(`${url}/api/types/blog`, options)).json();
  switch (res.code) {
    case SUCCESS:
      return res.list;
    default:
      return null;
  }
}

async function deleteType({ token, id }) {
  const options = {
    method: "PUT",
    headers: { Authorization: `bearer ${token}` },
  };
  const res = await (await fetch(`${url}/api/types/${id}`, options)).json();
  return res;
}
