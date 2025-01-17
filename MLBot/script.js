document.addEventListener("DOMContentLoaded", () => {
    const fileUpload = document.getElementById("fileUpload");
    const options = document.querySelectorAll(".option");
    const contents = document.querySelectorAll(".content");
    const chatMessages = document.getElementById("chatMessages");
    const userInput = document.getElementById("userInput");
    const sendButton = document.getElementById("sendButton");
    const mainContent = document.querySelector(".main-content");
    const mlBotContent = document.getElementById("mlBotContent");

    fileUpload.addEventListener("change", () => {
        if (fileUpload.files.length > 0) {
            mainContent.style.display = "flex";
            mlBotContent.classList.remove("hidden");
        } else {
            mainContent.style.display = "none";
            alert("Please upload a file to continue.");
        }
    });

    options.forEach(option => {
        option.addEventListener("click", () => {
            const targetContent = option.id.replace("Option", "Content");
            contents.forEach(content => content.classList.add("hidden"));
            document.getElementById(targetContent).classList.remove("hidden");
        });
    });

    sendButton.addEventListener("click", async () => {
        const message = userInput.value.trim();
        if (message) {
            appendMessage("user", message);
            userInput.value = "";
            const botResponse = await callAPI(message);
            if (botResponse.algorithm) {
                for (let i = 1; i <= 10; i++) {
                    const sequentialResponse = await callAPI(`${i}`);
                    appendMessage("assistant", sequentialResponse.response);
                    if (i === 7) {
                        appendMessage("assistant", "Model training started...");
                    }
                }
            } else {
                appendMessage("assistant", botResponse.response);
            }
        }
    });

    userInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
            sendButton.click();
        }
    });

    async function callAPI(query) {
        try {
            const response = await fetch("http://127.0.0.1:8000/chat?query=" + encodeURIComponent(query), {
                method: "POST",
                headers: {
                    "Accept": "application/json",
                    "Content-Type": "application/json",
                },
            });
            if (!response.ok) throw new Error("Failed to fetch API response");
            return await response.json();
        } catch {
            return { response: "An error occurred. Please try again.", algorithm: "" };
        }
    }

    function appendMessage(sender, text) {
        const messageDiv = document.createElement("div");
        messageDiv.classList.add("chat-message", sender);
    
        // Escape markdown syntax so it displays as raw text
        const escapedText = text.replace(/([\\*\\_\\~\\`\\>])/g, '\\$1');
    
        const messageSpan = document.createElement("span");
        messageSpan.textContent = escapedText;  // Use textContent to display raw text
    
        messageDiv.appendChild(messageSpan);
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    
});

// document.addEventListener("DOMContentLoaded", async () => {
//     const modelSelect = document.getElementById("modelSelect");
//     const downloadButton = document.getElementById("downloadButton");
//     const analysisOverviewContent = document.getElementById("analysisOverviewContent");
//     const scriptContent = document.getElementById("scriptContent");
//     const overviewButton = document.getElementById("overviewButton");
//     const trainButton = document.getElementById("trainButton");
//     const testButton = document.getElementById("testButton");
//     const modelData = {};

//     async function fetchModels() {
//         try {
//             const response = await fetch("http://127.0.0.1:8000/saved_models", {
//                 method: "GET",
//                 headers: {
//                     "Accept": "application/json"
//                 }
//             });
//             const data = await response.json();
//             if (data.response) {
//                 populateDropdown(data.response);
//             } else {
//                 console.error("No models found.");
//             }
//         } catch (error) {
//             console.error("Error fetching models:", error);
//         }
//     }

//     function populateDropdown(models) {
//         modelSelect.innerHTML = '<option value="" disabled selected>Select a model</option>';
//         models.forEach(model => {
//             const option = document.createElement("option");
//             option.value = model;
//             option.textContent = model;
//             modelSelect.appendChild(option);
//         });
//     }

//     async function fetchModelArtifacts(modelName) {
//         try {
//             const response = await fetch(`http://127.0.0.1:8000/model_artifacts/${modelName}`, {
//                 method: 'GET',
//                 headers: { 'accept': 'application/json' }
//             });
//             const data = await response.json();
//             modelData[modelName] = data;
//             displayOverview(data.analysis_overview);
//             displayScript(data.train_script);
//         } catch (error) {
//             console.error("Error fetching model artifacts:", error);
//         }
//     }

//     function displayOverview(overview) {
//         const overviewJSON = JSON.parse(overview);
//         analysisOverviewContent.innerHTML = "";
//         Object.keys(overviewJSON).forEach(key => {
//             const heading = document.createElement("h5");
//             heading.textContent = key;
//             const content = document.createElement("p");
//             content.textContent = overviewJSON[key];
//             analysisOverviewContent.appendChild(heading);
//             analysisOverviewContent.appendChild(content);
//         });
//     }

//     function displayScript(script) {
//         scriptContent.textContent = script;
//     }

//     modelSelect.addEventListener("change", () => {
//         const selectedModel = modelSelect.value;
//         if (selectedModel) {
//             downloadButton.disabled = false;
//             downloadButton.dataset.model = selectedModel;
//             fetchModelArtifacts(selectedModel);
//         } else {
//             downloadButton.disabled = true;
//             downloadButton.dataset.model = "";
//         }
//     });

//     downloadButton.addEventListener("click", async () => {
//         const modelName = downloadButton.dataset.model;
//         if (modelName) {
//             try {
//                 const response = await fetch(
//                     `http://127.0.0.1:8000/files/${encodeURIComponent(modelName)}`,
//                     {
//                         method: "GET"
//                     }
//                 );

//                 if (!response.ok) {
//                     alert("Failed to download the file. Please try again.");
//                     return;
//                 }

//                 const blob = await response.blob();
//                 const url = window.URL.createObjectURL(blob);

//                 const a = document.createElement("a");
//                 a.href = url;
//                 a.download = `${modelName}.zip`;
//                 document.body.appendChild(a);
//                 a.click();

//                 window.URL.revokeObjectURL(url);
//                 document.body.removeChild(a);
//             } catch (error) {
//                 console.error("Error downloading model:", error);
//             }
//         }
//     });

//     overviewButton.addEventListener("click", () => {
//         overviewButton.classList.add("active");
//         trainButton.classList.remove("active");
//         testButton.classList.remove("active");
//         displayOverview(modelData[modelSelect.value].analysis_overview);
//     });

//     trainButton.addEventListener("click", () => {
//         overviewButton.classList.remove("active");
//         trainButton.classList.add("active");
//         testButton.classList.remove("active");
//         displayScript(modelData[modelSelect.value].train_script);
//     });

//     testButton.addEventListener("click", () => {
//         overviewButton.classList.remove("active");
//         trainButton.classList.remove("active");
//         testButton.classList.add("active");
//         displayScript(modelData[modelSelect.value].test_script);
//     });

//     await fetchModels();
// });

document.addEventListener("DOMContentLoaded", async () => {
    const modelSelect = document.getElementById("modelSelect");
    const downloadButton = document.getElementById("downloadButton");
    const analysisOverviewContent = document.getElementById("analysisOverviewContent");
    const scriptContent = document.getElementById("scriptContent");
    const scriptHeading = document.getElementById("scriptHeading");
    const overviewButton = document.getElementById("overviewButton");
    const trainButton = document.getElementById("trainButton");
    const testButton = document.getElementById("testButton");
    const modelData = {};

    async function fetchModels() {
        try {
            const response = await fetch("http://127.0.0.1:8000/saved_models", {
                method: "GET",
                headers: {
                    "Accept": "application/json"
                }
            });
            const data = await response.json();
            if (data.response) {
                populateDropdown(data.response);
            } else {
                console.error("No models found.");
            }
        } catch (error) {
            console.error("Error fetching models:", error);
        }
    }

    function populateDropdown(models) {
        modelSelect.innerHTML = '<option value="" disabled selected>Select a model</option>';
        models.forEach(model => {
            const option = document.createElement("option");
            option.value = model;
            option.textContent = model;
            modelSelect.appendChild(option);
        });
    }

    async function fetchModelArtifacts(modelName) {
        try {
            const response = await fetch(`http://127.0.0.1:8000/model_artifacts/${modelName}`, {
                method: 'GET',
                headers: { 'accept': 'application/json' }
            });
            const data = await response.json();
            modelData[modelName] = data;
            displayOverview(data.analysis_overview);
        } catch (error) {
            console.error("Error fetching model artifacts:", error);
        }
    }

    function displayOverview(overview) {
        const overviewJSON = JSON.parse(overview);
        analysisOverviewContent.innerHTML = "";
    
        Object.keys(overviewJSON).forEach(key => {
            const heading = document.createElement("h3");
            heading.textContent = key;
            // Add wrapping styles to the heading if needed (optional)
            heading.style.whiteSpace = "pre-wrap"; 
            heading.style.wordWrap = "break-word";
            
            const content = document.createElement("p");
            content.textContent = overviewJSON[key];
            // Apply wrapping styles to the content
            content.style.whiteSpace = "pre-wrap";
            content.style.wordWrap = "break-word";
            content.style.wordBreak = "break-word"; // Ensure long words break properly
            
            analysisOverviewContent.appendChild(heading);
            analysisOverviewContent.appendChild(content);
        });
    }

    function displayScript(script, heading) {
        scriptContent.textContent = script;
        scriptHeading.textContent = heading;
    }

    modelSelect.addEventListener("change", () => {
        const selectedModel = modelSelect.value;
        if (selectedModel) {
            downloadButton.disabled = false;
            downloadButton.dataset.model = selectedModel;
            fetchModelArtifacts(selectedModel);
            document.getElementById("modelsContent").classList.remove("hidden");
            overviewButton.classList.add("active");
            trainButton.classList.remove("active");
            testButton.classList.remove("active");
            scriptContent.style.display = "none";
            analysisOverviewContent.style.display = "block";
            document.getElementById("modelOverview").style.display = "block";
            document.getElementById("modelScripts").style.display = "none";
        } else {
            downloadButton.disabled = true;
            downloadButton.dataset.model = "";
            document.getElementById("modelsContent").classList.add("hidden");
            scriptContent.style.display = "none";
            analysisOverviewContent.style.display = "none";
        }
    });

    downloadButton.addEventListener("click", async () => {
        const modelName = downloadButton.dataset.model;
        if (modelName) {
            try {
                const response = await fetch(
                    `http://127.0.0.1:8000/files/${encodeURIComponent(modelName)}`,
                    {
                        method: "GET"
                    }
                );

                if (!response.ok) {
                    alert("Failed to download the file. Please try again.");
                    return;
                }

                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);

                const a = document.createElement("a");
                a.href = url;
                a.download = `${modelName}.zip`;
                document.body.appendChild(a);
                a.click();

                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
            } catch (error) {
                console.error("Error downloading model:", error);
            }
        }
    });

    overviewButton.addEventListener("click", () => {
        overviewButton.classList.add("active");
        trainButton.classList.remove("active");
        testButton.classList.remove("active");
        scriptContent.style.display = "none";
        analysisOverviewContent.style.display = "block";
        document.getElementById("modelOverview").style.display = "block";
        // document.getElementById("modelScripts").style.display = "none";
    });
    
    trainButton.addEventListener("click", () => {
        trainButton.classList.add("active");
        overviewButton.classList.remove("active");
        testButton.classList.remove("active");
        scriptContent.style.display = "block";
        analysisOverviewContent.style.display = "none";
        displayScript(modelData[modelSelect.value].train_script, "Training Script");
        document.getElementById("modelOverview").style.display = "none";
        document.getElementById("modelScripts").style.display = "block";
    });
    
    testButton.addEventListener("click", () => {
        testButton.classList.add("active");
        overviewButton.classList.remove("active");
        trainButton.classList.remove("active");
        scriptContent.style.display = "block";
        analysisOverviewContent.style.display = "none";
        displayScript(modelData[modelSelect.value].test_script, "Testing Script");
        document.getElementById("modelOverview").style.display = "none";
        document.getElementById("modelScripts").style.display = "block";
    });
    
    await fetchModels();
});

// Function to update the file name when a file is selected
function updateFileName() {
    const fileInput = document.getElementById('fileUpload');
    const fileNameDisplay = document.getElementById('fileName');
    const file = fileInput.files[0];

    // Check if a file is selected, then display the name
    if (file) {
        fileNameDisplay.textContent = `Selected File: ${file.name}`;
    } else {
        fileNameDisplay.textContent = 'No file selected';
    }
}

// Function to upload the selected file to the server
async function uploadFile() {
    const fileInput = document.getElementById('fileUpload');
    const file = fileInput.files[0];
    
    if (!file) {
        alert('Please select a file');
        return;
    }
    
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await fetch('http://127.0.0.1:8000/upload', {
        method: 'POST',
        body: formData
    });
    
    if (response.ok) {
        alert('File uploaded successfully');
    } else {
        alert('File upload failed');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    fetch('help.txt')
        .then(response => {
            if (!response.ok) {
                throw new Error(`Failed to load markdown file: ${response.statusText}`);
            }
            return response.text();
        })
        .then(markdown => {
            const converter = new showdown.Converter({
                tables: true,               // Enable table support
                simplifiedAutoLink: true,   // Automatically link URLs
                tasklists: true,            // Enable GitHub-style task lists
                strikethrough: true,        // Support strikethrough text
                emoji: true                 // Enable emoji support
            });
            const html = converter.makeHtml(markdown);
            document.getElementById('markdownContainer').innerHTML = html;
        })
        .catch(error => {
            console.error('Error loading markdown content:', error);
        });
});

// Show the popup only once per session
window.onload = function () {
    if (!sessionStorage.getItem("popupShown")) {
        document.getElementById("overlay").style.display = "block";
        document.getElementById("popup").style.display = "block";
    }
};

// Close the popup and set the session flag
function closePopup() {
    document.getElementById("overlay").style.display = "none";
    document.getElementById("popup").style.display = "none";
    sessionStorage.setItem("popupShown", "true");
}

// Function to check if the API is running
function checkAPI() {
    const apiStatusMessage = document.getElementById('api-status-message');
    apiStatusMessage.textContent = "Checking API status...";

    fetch('http://127.0.0.1:8000/test_api')
        .then(response => {
            if (response.ok) {
                return response.json();
            }
            throw new Error('API not running');
        })
        .then(data => {
            if (data.response === 200) {
                apiStatusMessage.textContent = "API is running. Good to go!";
            } else {
                throw new Error('Unexpected response from API');
            }
        })
        .catch(error => {
            apiStatusMessage.innerHTML = `
                Zohencel API is not started yet. 
                If you already started the API, please wait until it is ready to serve. 
                Or else, visit <a href="https://zohencelai.github.io/" target="_blank">Zohencel AI Homepage</a> for help.
            `;
        });
}

document.addEventListener("DOMContentLoaded", function () {
    function adjustChatHeight() {
        const header = document.querySelector(".header");
        const chatContent = document.querySelector("#mlBotContent");
        if (header && chatContent) {
            const headerHeight = header.offsetHeight;
            chatContent.style.height = `calc(100vh - ${headerHeight}px)`;
        }
    }

    // Adjust chat height on load and when window resizes
    adjustChatHeight();
    window.addEventListener("resize", adjustChatHeight);
});
