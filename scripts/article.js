window.onload = () => {
  setTimeout(async () => {
    await loadContent();
    document.querySelector(".center.height-full").style.display = "none";
    document.querySelector(".container").style.display = "block";
  }, 3000);

  const quill = new Quill("#editor", {
    readOnly: true,
  });

  document
    .querySelector(".container > img:first-child")
    .addEventListener("click", function () {
      localStorage.removeItem("_article_id");
      return (location.pathname = "/list.html");
    });

  // quill.setContents()
  async function loadContent() {
    const encodedId = localStorage.getItem("_article_id");
    if (!encodedId) {
      document.getElementById("title").innerText = "Untitled";
      quill.setText("No content");
    } else {
      const response = await fetch(`${url}/api/blog/hsin/${encodedId}`);
      const { blog } = await response.json();
      document.getElementById("title").innerText = blog.blog_title;
      document.getElementById("timestamp").innerText = blog.updated_at;
      quill.setContents(JSON.parse(blog.ops));
    }
  }
};
