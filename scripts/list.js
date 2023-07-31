window.onload = async () => {
  await fetchList();

  document.querySelectorAll(".article").forEach((ev) => {
    ev.addEventListener("click", function () {
      const target = this.getAttribute("name");
      localStorage.setItem("_article_id", target);
      return (location.pathname = "/article.html");
    });
  });

  async function fetchList() {
    const response = await fetch(`${url}/api/blog/hsin/list`);
    const { list } = await response.json();
    const listContent = list
      .map((item) => {
        return `
        <div class="article justify-between pointer" name="${item.type_id}">
          <span>${item.type_name}</span>
          <span>${fetchDate(item.updated_at)}</span>
        </div>
      `;
      })
      .join("");
    document.querySelector(".articles").innerHTML = listContent.trim() ? listContent : '列表無文章';
    document.querySelector(".center.height-full").style.display = "none";
    document.querySelector(".bg").style.display = "block";
  }

  function fetchDate(d) {
    const date = new Date(d);
    return `${date.getFullYear()}-${
      date.getMonth() > 9 ? date.getMonth() + 1 : `0${date.getMonth() + 1}`
    }-${date.getDate()}`;
  }
};
