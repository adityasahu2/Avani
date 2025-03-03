document.addEventListener("DOMContentLoaded", function () {
    function toggleCard() {
        document.querySelector('.auth-container').classList.toggle('flipped');
    }
    document.querySelectorAll("#sign").forEach(sign => {
        sign.addEventListener("click", toggleCard);
    })
    document.querySelectorAll(".description").forEach(desc => {
        desc.addEventListener("mousemove", (e) => {
            const rect = desc.getBoundingClientRect();
            const [x, y] = [e.clientX - rect.left, e.clientY - rect.top];
            desc.style.background = `radial-gradient(circle at ${x}px ${y}px, rgba(74, 222, 128, 0.1), rgba(74, 222, 128, 0.05) 40%)`;
        });
        desc.addEventListener("mouseleave", () => desc.style.background = "rgba(74, 222, 128, 0.05)");
    });
    const themeToggle = document.querySelector(".theme-toggle");

    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('light-mode');
        document.querySelectorAll(".auth-header p, .form-group label, .form-group input")
            .forEach(el => el.classList.toggle('light-mode'));
    });
});