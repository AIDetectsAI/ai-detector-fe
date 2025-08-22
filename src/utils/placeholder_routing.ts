export function checkLogin() {
  if (sessionStorage.getItem("loggedIn") === "true") {
    return;
  } else {
    location.href = "/";
  }
}

export function handleLogin(event: SubmitEvent) {
  if (sessionStorage.getItem("loggedIn") === "true") {
    sessionStorage.removeItem("loggedIn");
    alert("Logged out");
  } else {
    sessionStorage.setItem("loggedIn", "true");
    alert("Logged in");
  }
}