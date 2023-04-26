// Methods
async function authenticate(token) {
  if (!token) return null;
  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `bearer ${token}`,
    },
  };
  const res = await (
    await fetch(`${url}/api/users/authenticate`, options)
  ).json();
  return res;
}

async function fetchMyInfo(token) {
  const options = {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `bearer ${token}`,
    },
  };
  const res = await (await fetch(`${url}/api/users/me`, options)).json();
  switch (res.code) {
    case SUCCESS:
      return res.user;
    default:
      return null;
  }
}

async function loadNavigation() {
  const pathname = window.location.pathname;
  $(".navbar").append(`
        <div class="container-fluid">
            <a class="navbar-brand" href="#">HWANG</a>
            <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navigation" aria-controls="navigation" aria-expanded="false" aria-label="Toggle navigation">
                <span class="navbar-toggler-icon"></span>
            </button>
            <div class="collapse navbar-collapse" id="navigation">
                <ul class="navbar-nav mr-auto mt-2 mt-lg-0">
                    ${NAVIGATIONS.map((option) => {
                      const isActive = pathname === `/${option.link}`;
                      return `
                        <li class="nav-item">
                            <a class="nav-link${
                              isActive ? " active" : ""
                            }" href="${isActive ? "#" : option.link}">${
                        option.name
                      }</a>
                        </li>
                    `;
                    }).join("")}
                </ul>
                <ul class="navbar-nav ms-auto">
                    <li class="nav-item dropdown">
                        <a class="nav-link dropdown-toggle" href="#" id="navbarDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                            設定
                        </a>
                        <div class="dropdown-menu dropdown-menu-end" aria-labelledby="navbarDropdown">
                            <span class="dropdown-item" id="your-kname"></span>
                            <a class="dropdown-item" href="profile.html">個人資料</a>
                            <div class="dropdown-divider"></div>
                            <a class="dropdown-item" id="signout-btn" href="#">登出</a>
                        </div>
                    </li>
                </ul>
            </div>
        </div>
    `);
}
