window.onload = () => {
  const toExp = document.getElementById("to-exp");
  const aboutBtn = document.getElementById("about-btn");
  const experienceBtn = document.getElementById("exp-btn");
  const projectsBtn = document.getElementById("proj-btn");

  const setClasses = () => {
    aboutBtn.setAttribute("class", "option");
    experienceBtn.setAttribute("class", "option");
    projectsBtn.setAttribute("class", "option");
  };

  const scrollTo = (selector) => {
    setClasses();
    const target = document.getElementById(selector);
    target.scrollIntoView({
      block: "start",
      behavior: "smooth",
      inline: "start",
    });
  };

  const vhToPixels = (vh) => {
    return Math.round(window.innerHeight / (100 / vh));
  };

  const contentHeight = () => vhToPixels(100) - 100;

  document.querySelector(".content").addEventListener("scroll", () => {
    const aboutPos = document
      .getElementById("about")
      .getBoundingClientRect().top;

    const experiencePos = document
      .getElementById("experience")
      .getBoundingClientRect().top;

    const projectsPos = document
      .getElementById("projects")
      .getBoundingClientRect().top;

    switch (true) {
      case aboutPos <= 0 && aboutPos >= 0 - contentHeight():
        setClasses();
        aboutBtn.setAttribute("class", "option active");
        break;
      case experiencePos <= 0 && experiencePos >= 0 - contentHeight():
        setClasses();
        experienceBtn.setAttribute("class", "option active");
        break;
      case projectsPos <= 0 && projectsPos >= 0 - contentHeight():
        setClasses();
        projectsBtn.setAttribute("class", "option active");
    }
  });

  aboutBtn.addEventListener("click", () => {
    scrollTo("about");
    aboutBtn.setAttribute("class", "option active");
  });

  toExp.addEventListener("click", () => {
    scrollTo("experience");
    experienceBtn.setAttribute("class", "option active");
  });

  experienceBtn.addEventListener("click", () => {
    scrollTo("experience");
    experienceBtn.setAttribute("class", "option active");
  });

  projectsBtn.addEventListener("click", () => {
    scrollTo("projects");
    projectsBtn.setAttribute("class", "option active");
  });
};
