document.addEventListener("DOMContentLoaded", function () {
    const themeToggle = document.querySelector(".theme-toggle");
    const body = document.body;

    themeToggle.addEventListener("click", () => {
        body.classList.toggle("light-mode");
    });

    document.querySelectorAll(".description").forEach((description) => {
        description.addEventListener("mousemove", (e) => {
            const rect = description.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            description.style.background = `
                radial-gradient(
                    circle at ${x}px ${y}px,
                    rgba(74, 222, 128, 0.1),
                    rgba(74, 222, 128, 0.05) 40%
                )
            `;
        });

        description.addEventListener("mouseleave", () => {
            description.style.background = "rgba(74, 222, 128, 0.05)";
        });
    });
        
        const sections = document.querySelectorAll("section");
    
        function showSection(sectionId) {
            sections.forEach((section) => {
                section.style.display = "none";
            });
    
            document.getElementById(sectionId).style.display = "block"; 
        }
    
        document.getElementById("about").addEventListener("click", () => showSection("about-section"));
        document.getElementById("sensor").addEventListener("click", () => showSection("sensor-section"));
        document.getElementById("report").addEventListener("click", () => showSection("report-section"));
        document.getElementById("contact").addEventListener("click", () => showSection("contact-section"));
    
        sections.forEach((section) => (section.style.display = "none"));
        document.getElementById("about-section").style.display = "block"; 
    
        const airQuality = document.getElementById('air-quality').getContext('2d');

        new Chart(airQuality, {
            type: 'line',
            data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                datasets: [{
                    label: 'Sales Over Time',
                    data: [10, 20, 15, 30, 25, 40],
                    borderColor: 'green',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.3
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        display: true
                    }
                },
                scales: {
                    x: { title: { display: true, text: 'Months' } },
                    y: { title: { display: true, text: 'Sales' } }
                }
            }
        });
});
