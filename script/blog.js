// const db = firebase.database();
var blogs = null;
var categories = null;
var currentBlogId = "";
var currentVerseId = "";
var bibleVersion = "nstrunv";
var tempVerseArr = [];
var options = {
  modules: {
    imageResize: {
      displaySize: true,
    },
    toolbar: [
      ["bold", "italic", "underline", "strike"], // toggled buttons
      ["image", "blockquote", "code-block"],
      [{ header: 1 }, { header: 2 }], // custom button values
      [{ list: "ordered" }, { list: "bullet" }],
      [{ indent: "-1" }, { indent: "+1" }], // outdent/indent
      [{ direction: "rtl" }], // text direction
      [{ size: ["small", false, "large", "huge"] }], // custom dropdown
      [{ header: [1, 2, 3, 4, 5, 6, false] }],
      [{ color: [] }, { background: [] }], // dropdown with defaults from theme
      [{ font: [] }],
      [{ align: [] }],
      ["clean"], // remove formatting button
    ],
  },
  placeholder: "Start your writing...",
  theme: "snow",
};
new ClipboardJS("#clipboard-btn"); // Clipboard feature

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

  // 初始化編輯器
  var quill = new Quill("#editor", options);

  // 取得資料
  const myInfo = await fetchMyInfo(token);
  if (myInfo) $("#your-kname").text(`歡迎！${myInfo.kname}`);
  categories = await fetchTypes(token);
  blogs = await fetchBlogs(token);
  setupUI();

  // Events
  $("#submit").on("click", async function () {
    $(this).prop("disabled", true);
    const type = $(this).attr("name");
    switch (type) {
      case "delete":
        await deleteBlog({ id: currentBlogId, token });
        rearrangeList();
        $("#confirmation").modal("hide");
        $(this).prop("disabled", false);
        break;
      case "save":
        let data = quill.getContents();
        let title = $("#title").val();
        let isPrivate = $("#public").val() === "1";
        let blogtype = $("#category").val();
        let updatedBy = myInfo.id;
        let updated = Date.now();
        const blog = {
          title,
          ops: JSON.stringify(data.ops),
          blogtype,
          isPrivate,
          updatedBy,
          updated,
        };
        if (currentBlogId) {
          blog.id = currentBlogId;
          const res = await updateBlog({ token, blog });
          if (res.code == SUCCESS) {
            blogs = blogs.map((b) => {
              if (blog.id === b.id) {
                return blog;
              } else {
                return b;
              }
            });
          }
        } else {
          const res = await createBlog({ token, blog });
          if (res.code == SUCCESS) {
            blogs.push(res.blog);
            currentBlogId = res.blog.id;
          }
        }
        if (tempVerseArr.length > 0) {
          const verArrRes = await insertVerse({
            token,
            verses: tempVerseArr,
            blogId: currentBlogId,
          });
          if (verArrRes.code !== SUCCESS) {
            $(this).prop("disabled", false);
            return showToast(`新增經文失敗`);
          } else {
          }
        }
        rearrangeList();
        $("#confirmation").modal("hide");
        $(this).prop("disabled", false);
        clearForm();
    }
  });
  $("#save").on("click", function () {
    let title = $("#title").val();
    let blogtype = $("#category").val();
    if (!title) {
      $("#title").addClass("border-danger");
      $(this).prop("disabled", false);
      showToast(`請輸入文章主題`);
      return;
    } else {
      $("#title").removeClass("border-danger");
    }
    if (!blogtype) {
      $("#category").addClass("border-danger");
      $(this).prop("disabled", false);
      showToast(`請選擇文章分類`);
      return;
    } else {
      $("#category").removeClass("border-danger");
    }
    $("#confirmation").modal("show");
    $("#confirmation").find(".modal-body > h4").text("確認送出表單？");
    $("#confirmation").find("#submit").text("確認送出");
    $("#confirmation")
      .find("#submit")
      .removeClass("btn-danger")
      .addClass("btn-success");
    $("#confirmation").find("#submit").attr("name", "save");
  });
  $("#reset").on("click", function () {
    clearForm();
  });
  $("#signout-btn").on("click", function () {
    clearToken();
  });
  $("#category").on("focus", function () {
    $(this).removeClass("border-danger");
  });
  $("#preview-verse").on("click", async function () {
    $(this).prop("disabled", true);
    const chineses = $("#chineses").val();
    const chap = $("#chap").val();
    const sec = $("#sec").val();
    if (!chineses) {
      $(this).prop("disabled", false);
      return showToast(`請選擇書卷`);
    }
    const verseResponse = await fetchBibleVerses({ chineses, chap, sec });
    $(this).prop("disabled", false);
    if (verseResponse.status !== "success")
      return showToast("取得書卷出現問題");
    const title = `${
      BIBLE_VERSES.find((v) => v.code === chineses).name
    } 第${chap}章`;
    const str = verseResponse.record
      .map((r) => {
        return `${r.sec} ${r.bible_text}`;
      })
      .join(" ");
    $("#verse-content")
      .empty()
      .append(
        `<i class="position-absolute fas fa-times fa-lg times" id="close-verse"></i><h4>${title}</h4><p>${str}</p>`
      )
      .addClass("extended");
  });
  $("#add-verse").on("click", async function () {
    $(this).prop("disabled", true);
    const chineses = $("#chineses").val();
    const chap = $("#chap").val();
    const sec = $("#sec").val();
    if (!chineses) {
      $(this).prop("disabled", false);
      return showToast(`請選擇書卷`);
    }
    tempVerseArr.push({ chineses, chap, sec, version: bibleVersion });
    const book = BIBLE_VERSES.find((v) => v.code === chineses).name;
    $("#verse-container").prepend(
      renderVerseCard({ book, verse: { chap, sec, id: "" } })
    );
    $("#chineses").val("");
    $("#chap").val("");
    $("#sec").val("");
    $(this).prop("disabled", false);
  });
  $(document).on("click", ".get-id-icon", function () {
    showToast(`文章ID已複製`);
  });
  $(document).on("click", ".delete-icon", function () {
    currentBlogId = $(this).parent().find(".title").attr("name");
    $("#confirmation").modal("show");
    $("#confirmation").find(".modal-body > h4").text("確定刪除文章？");
    $("#confirmation").find("#submit").text("確認刪除");
    $("#confirmation")
      .find("#submit")
      .removeClass("btn-success")
      .addClass("btn-danger");
    $("#confirmation").find("#submit").attr("name", "delete");
  });
  $(document).on("click", "#delete-verse", async function () {
    const verseId = $(this).attr("name");
    if (verseId) {
      // 處理有id的動作
      const deleteVerRes = await deleteVerse({ token, id: verseId });
      if (deleteVerRes.code !== SUCCESS) return showToast(`刪除失敗`);
      tempVerseArr = tempVerseArr.filter((ver) => ver.id !== verseId);
    }
    $(this).parent().remove();
  });
  $(document).on("click", "#blog-author", function () {
    const name = $(this).attr("name");
    [...$(this).parent().children()].forEach((el) => {
      $(el)
        .find(".badge")
        .attr(
          "class",
          `badge text-white bg-${
            $(el).attr("name") === name ? "success" : "secondary"
          }`
        );
    });
    $("#blog-list").empty();
    [...blogs]
      .filter((item) => item.updatedBy === name)
      .reverse()
      .forEach(renderList);
  });
  $(document).on("mouseover", "#article", function (event) {
    $(this).children(".fas").css("display", "block");
  });
  $(document).on("mouseleave", "#article", function (event) {
    $(this).children(".fas").css("display", "none");
  });
  $(document).on("click", ".title", async function () {
    currentBlogId = $(this).attr("name");
    const blog = blogs.find((blog) => currentBlogId == blog.id);
    let content = JSON.parse(blog.ops);
    let title = blog.title;
    let category = blog.blogtype;
    let isPrivate = blog.isPrivate;

    $("#category")
      .children()
      .each(function () {
        $(this).attr("selected", "false");
        if ($(this).val() === category) {
          //jQuery給法
          $(this).attr("selected", "true"); //或是給"selected"也可
        }
      });

    if (isPrivate == "1") {
      $("#public").children('[value="0"]').attr("selected", "");
      $("#public").children('[value="1"]').attr("selected", "true");
    } else {
      $("#public").children('[value="1"]').attr("selected", "");
      $("#public").children('[value="0"]').attr("selected", "true");
    }

    $("#category").val(category);
    $("#title").val(title);

    quill.setContents(content);
    scrollTo(0, 0);

    const verseRes = await fetchRelatedVerse({ token, blogId: currentBlogId });
    $("#verse-container").empty();
    if (verseRes.verse.length > 0) {
      verseRes.verse.forEach((v) => {
        const book = BIBLE_VERSES.find((bv) => bv.code === v.chineses).name;
        $("#verse-container").prepend(renderVerseCard({ book, verse: v }));
      });
    }
  });
  $(document).on("click", "#close-verse", function () {
    $("#verse-content").removeClass("extended").empty();
  });
  // Methods
  function setupUI() {
    // 分類下拉選單
    BIBLE_VERSES.forEach((ver) => {
      $("#chineses").append(`<option value="${ver.code}">${ver.name}</option>`);
    });
    categories &&
      categories.forEach((category) => {
        $("#category").append(
          `<option value="${category.id}">${category.title}</option>`
        );
      });
    rearrangeList();
    $(".loading").addClass("disappear");
    $(".loaded").removeClass("disappear");
  }
  function rearrangeList() {
    $("#author-list").empty();
    $("#blog-list").empty();
    // 作者
    blogs && [...blogs].reverse().forEach(renderList);
  }
  function renderList(item) {
    $("#blog-list").append(`
            <li class="d-flex blog-item my-3 px-3" id="article">
                <span class="title" name="${item.id}">${item.title}</span>
                <i class="fas fa-copy get-id-icon" id="clipboard-btn" data-clipboard-text="${item.id}"></i>
                <i class="fas fa-trash-alt delete-icon"></i>
            </li>
        `);
  }
  function clearForm() {
    currentBlogId = "";
    tempVerseArr = [];
    quill.setText("");
    $("#title").val("");
    $("#category").val("");
    $("#public").val("0");
    $("#chineses").val("");
    $("#chap").val("");
    $("#sec").val("");
    $("#verse-container").empty();
  }
  function renderVerseCard({ book, verse }) {
    return `
        <div class="card" style="width: 10rem;">
            <div class="card-body px-3 py-2">
                <h5 class="card-title">${book}</h5>
                <h6 class="card-subtitle mb-2 text-muted">第${verse.chap}章</h6>
                <h6 class="card-subtitle mb-2 text-muted">${
                  verse.sec ? `第${verse.sec}節` : ""
                }</h6>
                <a class="card-link" href="#" id="delete-verse" name="${
                  verse.id
                }">刪除</a>
            </div>
        </div>
        `;
  }
});

async function createBlog({ token, blog }) {
  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `bearer ${token}`,
    },
    body: JSON.stringify(blog),
  };
  const res = await (await fetch(`${url}/api/blogs`, options)).json();
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
      return [];
  }
}

async function fetchBlogs(token) {
  const options = {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `bearer ${token}`,
    },
  };
  const res = await (await fetch(`${url}/api/blogs`, options)).json();
  switch (res.code) {
    case SUCCESS:
      return res.list;
    default:
      return [];
  }
}

async function updateBlog({ token, blog }) {
  const options = {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `bearer ${token}`,
    },
    body: JSON.stringify(blog),
  };
  const res = await (
    await fetch(`${url}/api/blogs/${blog.id}`, options)
  ).json();
  return res;
}

async function deleteBlog({ token, id }) {
  const options = {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `bearer ${token}`,
    },
  };
  const res = await (await fetch(`${url}/api/blogs/${id}`, options)).json();
  if (res.code == SUCCESS) {
    blogs = [...blogs].filter((blog) => blog.id !== id);
    currentBlogId = "";
  }
}

async function fetchBibleVerses({ chineses = "羅", chap = 1, sec = "" }) {
  const res = await (
    await fetch(
      `https://bible.fhl.net/json/qb.php?chineses=${chineses}&chap=${chap}&sec=${sec}`,
      options
    )
  ).json();
  return res;
}

async function insertVerse({ token, verses, blogId }) {
  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `bearer ${token}`,
    },
    body: JSON.stringify({ verses }),
  };
  const res = await (
    await fetch(`${url}/api/verse/blog/${blogId}`, options)
  ).json();
  return res;
}

async function fetchRelatedVerse({ token, blogId }) {
  const options = {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `bearer ${token}`,
    },
  };
  const res = await (
    await fetch(`${url}/api/verse/blog/${blogId}`, options)
  ).json();
  return res;
}

async function deleteVerse({ token, id }) {
  const options = {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `bearer ${token}`,
    },
  };
  const res = await (await fetch(`${url}/api/verse/${id}`, options)).json();
  return res;
}
