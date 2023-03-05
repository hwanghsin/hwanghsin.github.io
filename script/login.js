$(document).ready(async function () {
  const token = localStorage.getItem("_token");
  if (token) {
    const res = await authenticate(token);
    if (res.code == SUCCESS) return (window.location.pathname = "blog.html");
    else localStorage.removeItem("_token");
  }
  // Event
  $("#login-btn").on("click", handleLogin);
});

async function handleLogin(e) {
  e.preventDefault();
  let btn = $(this);
  btn.text("載入中...");
  btn.attr("disabled", true);
  let email = $("#username").val();
  let password = $("#password").val();
  await login(
    {
      account: email,
      password,
    },
    () => {
      btn.text("登入");
      btn.removeAttr("disabled");
    }
  );
}

async function login({ account, password }, callback) {
  const options = {
    headers: {
      "Content-Type": "application/json",
    },
    method: "POST",
    // mode: 'cors',
    body: JSON.stringify({ account, password, device: navigator.userAgent }),
  };
  try {
    const res = await (await fetch(`${url}/api/users/login`, options)).json();
    if (res.code === SUCCESS) {
      localStorage.setItem("_token", res.token);
      return (window.location.pathname = "blog.html");
    } else {
      throw new Error(res.msg);
    }
  } catch (err) {
    $("#toast-message").text(`${err}`);
    $("#toast-message").addClass("text-danger");
    $("#toast-container").toast({
      animation: true,
      autohide: true,
      delay: 5000,
    });
    $("#toast-container").toast("show");
    callback();
  }
}
