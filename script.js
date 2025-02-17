document.addEventListener("DOMContentLoaded", function () {
    console.log("✅ Page Loaded, Assigning Global Fetch Function");

    // 🔄 Cache frequently accessed elements
    const beamSearch = document.getElementById("beamSearch");
    const beamDetailsPanel = document.getElementById("beamDetailsPanel");
    const statusMessage = document.getElementById("statusMessage");
    const progressText = document.getElementById("progress");
    const progressBar = document.getElementById("progressBar");

    // 🎯 Create Tooltip
    const tooltip = document.createElement("div");
    tooltip.classList.add("beam-tooltip");
    tooltip.style.position = "absolute";
    tooltip.style.display = "none";
    tooltip.style.padding = "6px";
    tooltip.style.backgroundColor = "rgba(0, 0, 0, 0.75)";
    tooltip.style.color = "white";
    tooltip.style.borderRadius = "5px";
    tooltip.style.fontSize = "12px";
    tooltip.style.pointerEvents = "none";  // Prevents interference with hover detection
    document.body.appendChild(tooltip);

    const beams = document.querySelectorAll(".beam");

    // ✅ Attach globally for debugging
    window.fetchBeamStatus = fetchBeamStatus;
    window.updateBeamUI = updateBeamUI;

    // ✅ Search Beams Efficiently
    beamSearch.addEventListener("input", function () {
        let input = this.value.toLowerCase().trim();
        beams.forEach(beam => {
            let beamName = beam.getAttribute("data-name").toLowerCase();
            beam.classList.toggle("highlight", beamName.includes(input) && input !== "");
        });
    });

    // ❌ Clear Search
    window.clearSearch = function () {
        beamSearch.value = "";
        beams.forEach(beam => beam.classList.remove("highlight"));
    };

    // 📌 Close Details Panel
    window.closePanel = function () {
        beamDetailsPanel.style.display = "none";
    };

    // 🎯 Show Beam Details on Click
    beams.forEach(beamElement => {
        beamElement.addEventListener("click", function (event) {
            if (!window.beamData || !window.beamData.beams) {
                console.warn("⚠ No beam data available");
                return;
            }

            let beamName = this.dataset.name.trim().toLowerCase();
            let beamDataEntry = window.beamData.beams.find(b => 
                b.Beam_Name.toLowerCase().trim() === beamName
            );

            if (beamDataEntry) {
                let beamStatus = beamDataEntry.Progress > 0 ? "Installed" : "Not Installed";
                let beamWeight = beamDataEntry.Weight ? `${beamDataEntry.Weight} kg` : "Unknown kg";
                let beamProgress = (beamDataEntry.Progress * 100).toFixed(2) + "%";
                let beamQRCode = beamDataEntry.QR_Code || "https://via.placeholder.com/150";

                document.getElementById("beamName").innerText = beamDataEntry.Beam_Name;
                document.getElementById("beamStatus").innerText = beamStatus;
                document.getElementById("beamWeight").innerText = beamWeight;
                document.getElementById("beamProgress").innerText = beamProgress;
                document.getElementById("beamQRCode").src = beamQRCode;

                let isMobile = window.innerWidth <= 768;
                beamDetailsPanel.style.left = isMobile ? "50%" : `${event.pageX + 10}px`;
                beamDetailsPanel.style.top = isMobile ? "50%" : `${event.pageY + 10}px`;
                beamDetailsPanel.style.transform = isMobile ? "translate(-50%, -50%)" : "";
                beamDetailsPanel.style.display = "block";
            } else {
                console.warn(`⚠ No matching data found for ${beamName}`);
            }
        });
    });

    // 🎯 Tooltip for Beam Info on Hover
    beams.forEach(beam => {
        beam.addEventListener("mouseenter", (event) => {
            let beamName = event.target.dataset.name.trim();
            let beamDataEntry = window.beamData?.beams?.find(b => 
                b.Beam_Name.toLowerCase().trim() === beamName.toLowerCase().trim()
            );

            if (beamDataEntry) {
                let beamStatus = beamDataEntry.Progress > 0 ? "Installed" : "Not Installed";
                tooltip.innerText = `${beamName} - ${beamStatus}`;
                tooltip.style.left = `${event.pageX + 15}px`;
                tooltip.style.top = `${event.pageY + 15}px`;
                tooltip.style.display = "block";
            }
        });

        beam.addEventListener("mousemove", (event) => {
            tooltip.style.left = `${event.pageX + 15}px`;
            tooltip.style.top = `${event.pageY + 15}px`;
        });

        beam.addEventListener("mouseleave", () => {
            tooltip.style.display = "none";
        });
    });

    // 🔄 Fetch Beam Status
    async function fetchBeamStatus() {
        console.log("🔄 Fetching beam status...");

        try {
            const response = await fetch("https://script.google.com/macros/s/AKfycbxp_PumTiMgGHLYSTNVsJUAdCzB5QT7y87dgViKiO4y7KL7MBfX4IGVYVdpIfXVOxJvzg/exec");
            if (!response.ok) throw new Error(`❌ HTTP error! Status: ${response.status}`);

            const text = await response.text();
            console.log("🛠 Raw API Response (Before Parsing):", text);

            if (!text.trim()) throw new Error("❌ API returned an empty response!");

            let data = JSON.parse(text);
            console.log("✅ JSON Data Received:", data);
            window.beamData = data;
            updateBeamUI();
            updateTotalProgress();
        } catch (error) {
            console.error("❌ Error fetching beam data:", error);
        }
    }

    function updateBeamUI() {
        if (!window.beamData || !window.beamData.beams) return;

        beams.forEach(beamElement => {
            let beamName = beamElement.dataset.name.trim().toLowerCase();
            let beamDataEntry = window.beamData.beams.find(b => 
                b.Beam_Name.toLowerCase().trim() === beamName
            );

            if (beamDataEntry) {
                beamElement.classList.toggle("selected", beamDataEntry.Progress > 0);
                beamElement.dataset.progress = (beamDataEntry.Progress * 100).toFixed(2);
                beamElement.dataset.qrCode = beamDataEntry.QR_Code;
            } else {
                beamElement.classList.remove("selected");
            }
        });
    }

    function updateTotalProgress() {
        if (!window.beamData || !window.beamData.beams) return;

        let totalWeight = 0, installedWeight = 0;
        window.beamData.beams.forEach(beam => {
            totalWeight += beam.Weight || 0;
            if (beam.Progress > 0) installedWeight += beam.Weight || 0;
        });

        let overallProgress = totalWeight > 0 ? (installedWeight / totalWeight) * 100 : 0;
        progressBar.style.width = `${overallProgress}%`;
        progressBar.innerText = `${overallProgress.toFixed(2)}%`;
        document.getElementById("installationProgress").innerText = `Installation Progress: ${overallProgress.toFixed(2)}%`;
    }

    // ✅ Fetch data & attach listeners
    fetchBeamStatus();
});
