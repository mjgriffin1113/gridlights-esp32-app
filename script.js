function changeGreeting() {
    document.getElementById("greeting").textContent = "Hello ESP32!";
}

// Tabs
const homeContent = document.getElementById('homeContent');
const automationContent = document.getElementById('automationContent');
const homeButton = document.getElementById('homeButton');
const automationButton = document.getElementById('automationButton');

// Switch to Home view
homeButton.addEventListener('click', function() {
    homeContent.style.display = 'block';
    automationContent.style.display = 'none';
});

// Switch to Automation view
automationButton.addEventListener('click', function() {
    homeContent.style.display = 'none';
    automationContent.style.display = 'block';
});

// Cycle Elements
let elements = [];
function addElement() {
    const container = document.createElement('div');
    container.classList.add('element');
    
    container.innerHTML = `
            <label>Effect: 
                    <select class="effectSelect">
                        <option value="0">None</option>
                        <option value="38">Aurora</option>
                        <option value="115">Blends</option>
                        <option value="91">Bouncing Balls</option>
                        <option value="2">Breathe</option>
                        <option value="28">Chase</option>
                        <option value="67">Colorwaves</option>
                        <option value="112">Dancing Shadows</option>
                        <option value="90">Fireworks</option>
                        <option value="57">Lightning</option>
                        <option value="101">Pacifica</option>
                        <option value="65">Palette</option>
                        <option value="0">Phased</option>
                        <option value="38">Plasma</option>
                        <option value="115">Simulator</option>
                        <option value="91">Bouncing Balls</option>
                        <option value="2">TV Simulator</option>
                </select>
            </label>
            <label>Color: <input class="colorInput" type="color" value="#0000FF"></label>
            <label>Speed: <input class="speedInput" type="range" min="0" max="255"></label>
            <label>Brightness: <input class="brightnessInput" type="range" min="0" max="255"></label>
            <label>Percentage: <input class="percentageInput" type="number" min="1" max="100"></label>
            <button class="removeAutomationBtn" onclick="removeElement(this)">
                <img class="removeAutomationImg" src="backspace.png">
            </button>
    `;
    
    document.getElementById('sceneElements').appendChild(container);
    elements.push(container);
}

function removeElement(button) {
    const element = button.parentElement;
    element.remove();
}

function getSceneValues() {
    const cycleTime = document.getElementById('sceneLength').value; // Get cycle time
    // Get all elements with the class 'element'
    const elements = document.querySelectorAll('.element');
    const sceneSteps = [];

    // Loop through each element to get its values
    elements.forEach((element) => {
        const effect = element.querySelector('.effectSelect').value;
        const color = element.querySelector('.colorInput').value;
        const speed = element.querySelector('.speedInput').value;
        const brightness = element.querySelector('.brightnessInput').value;
        const percentage = element.querySelector('.percentageInput').value;

        // Store the values in an object
        const scene = {
            effect,
            color,
            speed,
            brightness,
            percentage
        };

        // Add the scene object to the array
        sceneSteps.push(scene);
    });

    // Output the scene values (or send them to your server or API)
    console.log(sceneSteps);
    sendToMicroPython(sceneSteps, cycleTime);
}

function sendToMicroPython(sceneSteps, cycleTime) {
    // Example of sending data to MicroPython through WebSocket or HTTP
    // (You would replace this with your actual method to communicate with MicroPython)
    fetch('/runCycle', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            sceneSteps: sceneSteps,
            cycleTime: cycleTime
        })
    });
}

function startScene() {
    const percentages = Array.from(document.querySelectorAll('input[type="number"]')).map(input => parseInt(input.value));
    const total = percentages.reduce((sum, value) => sum + value, 0);

    if (total !== 100) {
        document.getElementById('percentageWarning').style.display = 'block';
    } else {
        document.getElementById('percentageWarning').style.display = 'none';
        getSceneValues()
        // Trigger scene logic
        alert("Scene started!");
    }
}

// Initially load Home content
homeContent.style.display = 'block';
automationContent.style.display = 'none';



// Function to turn the LED on
// function turnLedOn() {
//     sendLedCommand(true);
// }

// // Function to turn the LED off
// function turnLedOff() {
//     sendLedCommand(false);
// }

// Function to send the LED command to the server
// function sendLedCommand(turnOn) {
//     const xhr = new XMLHttpRequest();
//     const url = `/led`; // Assuming your MicroPython server handles this route

//     // Create the command to send
//     const command = {
//         seg: [
//             {
//                 id: 0,
//                 col: turnOn ? [255, 0, 0] : [0, 0, 0] // Red if on, off otherwise
//             }
//         ]
//     };

//     // Send the command to the server
//     xhr.open("POST", url, true);
//     xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
//     xhr.onreadystatechange = function () {
//         if (xhr.readyState === 4 && xhr.status === 200) {
//             console.log("LED Command Sent:", xhr.responseText);
//         }
//     };
//     xhr.send(JSON.stringify(command));
// }

// Event listeners for the buttons
// document.getElementById("ledOnButton").addEventListener("click", toggleOnOff(true));
// document.getElementById("ledOffButton").addEventListener("click", toggleOnOff(false));
var lightIp = '4.3.2.1'; // Replace with your ESP32's IP address

// Username
// Get the user's name from a form, API, or other source
var userName = "User";
// Get the greeting element from the DOM
var greetingElement = document.getElementById("greeting");
// Update the greeting element with the user's name
greetingElement.textContent = userName;
// Change name function
document.getElementById("updateUsernameButton").addEventListener("click", function() {
    var newUserName = prompt("Enter a new name:");
    if (newUserName !== null) {
        userName = newUserName;
        greetingElement.textContent = userName;

        const xhr = new XMLHttpRequest();
        const url = `/username`; // Assuming your MicroPython server handles this route

        // Create the command to send
        const payload = {'username': userName}

        // Send the command to the server
        xhr.open("POST", url, true);
        xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4 && xhr.status === 201) {
                console.log("Usename updated:", xhr.responseText);
            }
        };
        xhr.send(JSON.stringify(payload));
        }
  });


function getUserName () {
    const xhr = new XMLHttpRequest();
    const url = `/username`; // Assuming your MicroPython server handles this route

    // Send the command to the server
    xhr.open("GET", url, true);
    xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            console.log("Usename retrieved:", xhr.responseText);
        }
    };
    var user = xhr.send();
    console.log(user);
    return JSON.parse(user);
}

//   Lighting Zone Section
// Change name function
var zoneName = "Zone 1";
// Get the greeting element from the DOM
var zoneNameElement = document.getElementById("zoneName");
// Update the greeting element with the user's name
zoneNameElement.textContent = zoneName;
document.getElementById("zoneName").addEventListener("click", function() {
    var newZoneName = prompt("Enter a new name:");
    if (newZoneName !== null) {
      zoneName = newZoneName;
      zoneNameElement.textContent = zoneName;
    }
  });

// WLED API Calls
function setEffect(effectId) {
    // const lightIp = '192.168.84.43'; // Replace with your ESP32's IP address

    const xhr = new XMLHttpRequest();
    xhr.open('POST', `http://${lightIp}/json/state`, true);
    xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
    xhr.send(JSON.stringify({ seg: { fx: effectId } }));
    
    xhr.onload = function () {
        if (xhr.status === 200) {
            console.log('Effect updated successfully:', effectId);
        } else {
            console.error('Failed to update effect:', xhr.statusText);
        }
    }
}

// -----------------------------------------------------------------
// Toggle Power Button
function toggleOnOff() {
    console.log('toggling')
    // const lightIp = '192.168.84.43'; // Replace with your ESP32's IP address
    
    const xhttp = new XMLHttpRequest();
    xhttp.open('GET', `http://${lightIp}/json/state`, true);
    xhttp.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
    xhttp.send();

    let lightOn = 'true'
    
    xhttp.onload = function () {
        if (xhttp.status === 200) {
            const responses = JSON.parse(xhttp.responseText)
            console.log(responses);
            lightOn = responses['on']
            console.log('light on?', lightOn)
        } else {
            console.error('Failed to update effect:', xhttp.statusText);
        }
    }

    const xhr = new XMLHttpRequest();
    xhr.open('POST', `http://${lightIp}/json/state`, true);
    xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
    xhr.send(JSON.stringify({
        on: lightOn,
      }));
    
    xhr.onload = function () {
        if (xhr.status === 200) {
            console.log('toggled')}
            // lightOn = !lightOn
        else {
            console.error('Failed to update effect:', xhr.statusText);
        }
    }
    // if (lightOn) {
    //     turnLedOff()
    // } else {
    //     turnLedOn()
    // }
}

document.getElementById("toggleLightButton").addEventListener("click", toggleOnOff);


// -----------------------------------------------------------------
const colorPicker = document.getElementById('staticColorPicker');
// ColorPicker Functions
function sendColorToESP32(color) {
    // Send the selected color to the ESP32 via HTTP or WebSocket
    console.log("Sending color to ESP32:", color);
    const rgb = hexToRgb(color);
    // console.log(rgb);
    const xhr = new XMLHttpRequest();
    xhr.open('POST', `http://${lightIp}/json/state`, true);
    xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
    xhr.send(JSON.stringify({
        on: true,
        seg: { col: [[rgb.r, rgb.g, rgb.b]] },
    }));
    
    xhr.onload = function () {
        if (xhr.status === 200) {
            console.log('color updated!')}
            // lightOn = !lightOn
        else {
            console.error('Failed to update color:', xhr.statusText);
        }
    }
}

// Function to convert hex color to RGB
function hexToRgb (hex) {
    const bigint = parseInt(hex.slice(1), 16);
    return {
        r: (bigint >> 16) & 255,
        g: (bigint >> 8) & 255,
        b: bigint & 255,
    };
};


colorPicker.addEventListener('input', function() {
    const selectedColor = colorPicker.value;
    console.log("Live Color:", selectedColor);
    sendColorToESP32(selectedColor)
});


// -----------------------------------------------------------------
const brightnessSlider = document.getElementById('brightnessSlider');
// Brightness Slider Functions
function sendBrightnessUpdate(level) {
    // Send the selected color to the ESP32 via HTTP or WebSocket
    console.log("Updating brightness to:", level);
    const xhr = new XMLHttpRequest();
    xhr.open('POST', `http://${lightIp}/json/state`, true);
    xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
    xhr.send(JSON.stringify({
        on: true,
        seg: { bri: level },
    }));
    
    xhr.onload = function () {
        if (xhr.status === 200) {
            console.log('brightness updated!')}
            // lightOn = !lightOn
        else {
            console.error('Failed to update brightness:', xhr.statusText);
        }
    }
}
brightnessSlider.addEventListener('change', function() {
    const brightnessLevel = brightnessSlider.value;
    console.log("Live brightness:", brightnessLevel);
    sendBrightnessUpdate(brightnessLevel)
});
// useEffect(() => {
//     if (isZoneOn === undefined) {
//       return;
//     }
//     axios
//       .post("http://99.95.232.171:80/json/state", {
//         on: isZoneOn,
//       })
//       .then((response) => {
//         console.log("Light status set to:", isZoneOn); // Optional: handle response data
//         console.log(response);
//       })
//       .catch((error) => {
//         console.error("Error updating color:", error);
//       });
//   }, [isZoneOn]);

// -----------------------------------------------------------------
const speedSlider = document.getElementById('speedSlider');
// Brightness Slider Functions
function sendSpeedUpdate(speed) {
    // Send the selected color to the ESP32 via HTTP or WebSocket
    console.log("Updating speed to:", speed);
    const xhr = new XMLHttpRequest();
    xhr.open('POST', `http://${lightIp}/json/state`, true);
    xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
    xhr.send(JSON.stringify({
        on: true,
        seg: { sx: speed },
    }));
    
    xhr.onload = function () {
        if (xhr.status === 200) {
            console.log('speed updated!')}
            // lightOn = !lightOn
        else {
            console.error('Failed to update speed:', xhr.statusText);
        }
    }
}
speedSlider.addEventListener('change', function() {
    const speedLevel = speedSlider.value;
    console.log("Live speed:", speedLevel);
    sendSpeedUpdate(speedLevel)
});

// -----------------------------------------------------------------
// IP Address Input (optional)
const lightIpInput = document.getElementById("ipInput");

// Get the value of the input
const inputValue = lightIpInput.value;
console.log(inputValue);

// Set the value of the input
// lightIpInput.value = "New text";

// Add an event listener to handle changes
lightIpInput.addEventListener("input", () => {
    console.log("Input value changed:", lightIpInput.value);
    lightIp = lightIpInput.value;
});