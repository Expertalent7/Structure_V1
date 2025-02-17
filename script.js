document.addEventListener("DOMContentLoaded", function () {
    console.log("✅ Page Loaded");

    // 🌙 Dark Mode Toggle
    const darkModeToggle = document.getElementById("darkModeToggle");
    darkModeToggle.addEventListener("click", function () {
        document.body.classList.toggle("dark-mode");
    });

    // 🔄 Fetch Beam Data
    async function fetchBeamStatus() {
        console.log("🔄 Fetching beam status...");

        try {
            const response = await fetch("https://script.google.com/macros/s/AKfycbxp_PumTiMgGHLYSTNVsJUAdCzB5QT7y87dgViKiO4y7KL7MBfX4IGVYVdpIfXVOxJvzg/exec");
            if (!response.ok) throw new Error(`❌ HTTP error! Status: ${response.status}`);

            const data = await response.json();
            window.beamData = data;
            updateBeamUI();
            updateTotalProgress();
        } catch (error) {
            console.error("❌ Error fetching beam data:", error);
        }
    }

    function updateBeamUI() {
        document.querySelectorAll(".beam").forEach(beam => {
            let beamName = beam.dataset.name.toLowerCase();
            let beamData = window.beamData?.beams.find(b => b.Beam_Name.toLowerCase() === beamName);

            if (beamData) {
                beam.classList.toggle("installed", beamData.Progress > 0);
            }
        });
    }

    function updateTotalProgress() {
        let totalWeight = 0, installedWeight = 0;

        window.beamData.beams.forEach(beam => {
            totalWeight += beam.Weight || 0;
            if (beam.Progress > 0) installedWeight += beam.Weight || 0;
        });

        let progress = totalWeight > 0 ? (installedWeight / totalWeight) * 100 : 0;
        document.getElementById("progressBar").style.width = `${progress}%`;
        document.getElementById("progressBar").innerText = `${progress.toFixed(2)}%`;
        document.getElementById("progressValue").innerText = `${progress.toFixed(2)}%`;
    }

    fetchBeamStatus();
});
