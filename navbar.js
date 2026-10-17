document.addEventListener("DOMContentLoaded", function () {

    const navbarFile = window.location.pathname.includes("/ServicesPages/")
        ? "../navbar.html"
        : "navbar.html";

    fetch(navbarFile)
        .then(response => response.text())
        .then(data => {
            document.getElementById("navbar").innerHTML = data;
        });

    const footerFile = window.location.pathname.includes("/ServicesPages/")
        ? "../footer.html"
        : "footer.html";

    fetch(footerFile)
        .then(response => response.text())
        .then(data => {
            document.getElementById("footer").innerHTML = data;

            const year = document.getElementById("year");
            if (year) {
                year.textContent = new Date().getFullYear();
            }
        });
});