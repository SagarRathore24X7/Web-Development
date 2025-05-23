// alert('You Have Entered My Website')
// script.js

// Custom Cursor
const cursor = document.querySelector(".cursor");
const cursorFollower = document.querySelector(".cursor-follower");

let mouseX = 0;
let mouseY = 0;

window.addEventListener("mousemove", (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;

  cursor.style.left = mouseX + "px";
  cursor.style.top = mouseY + "px";

  cursorFollower.style.left = mouseX + "px";
  cursorFollower.style.top = mouseY + "px";
});

// Add hover effect on links and other interactive elements
const interactiveElements = document.querySelectorAll(
  "a, button, .nav-link, input[type='submit']"
);

interactiveElements.forEach((element) => {
  element.addEventListener("mouseover", () => {
    cursor.classList.add("cursor-hover");
    cursorFollower.classList.add("cursor-hover");
  });

  element.addEventListener("mouseout", () => {
    cursor.classList.remove("cursor-hover");
    cursorFollower.classList.remove("cursor-hover");
  });
});

// Skill Meter Animation
const skillMeters = document.querySelectorAll(".skill .meter span");

function animateSkillMeters() {
  skillMeters.forEach((meter) => {
    const targetWidth = meter.getAttribute("data-width"); // Get width from data attribute
    meter.style.width = targetWidth + "%";
  });
}

// Trigger skill meter animation on scroll
function handleScroll() {
  const aboutSection = document.getElementById("about");
  const aboutSectionPosition = aboutSection.offsetTop;
  const scrollPosition = window.pageYOffset + window.innerHeight; // Current scroll position + viewport height

  if (scrollPosition > aboutSectionPosition) {
    animateSkillMeters();
    window.removeEventListener("scroll", handleScroll); // Remove event listener after animation
  }
}

window.addEventListener("scroll", handleScroll);
