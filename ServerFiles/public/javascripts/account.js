// public/javascripts/account.js
$(function (){
    // TODO: registering the device and saving the name into "ID"
    // $('#registerDevice').on('click', function() {
    //
    //     deviceOptions(ID);
    // });

    //$('deviceID').onChange(/*TODO: function to update Weekly and Daily View for device*/);
    //$('calendar').onChange(/*TODO: function to update Weekly and Daily view for date change*/);
    const storedDevicesString = localStorage.getItem('devices') || '';
    
    // Split the string into an array of device IDs using commas
    const storedDevices = storedDevicesString.split(',');    
    const deviceSelect = $('#deviceID');

    // Clear existing options
    deviceSelect.empty();

    // Add each device to the <select> element
    storedDevices.forEach(device => {
        deviceSelect.append(`<option>${device}</option>`);
    });

    $('#newPassword').keyup(function() {
        let strengthIndicator = document.getElementById("pwStrong");
	let password = $('#newPassword').val();
        strengthIndicator.innerHTML = '';

        // Minimum length requirement
        if (password.length < 8) {
        strengthIndicator.innerHTML = 'Password should be at least 8 characters long.';
        strengthIndicator.className = 'password-weak';
        return;
    }

    // Check for special characters
    var specialCharacterRegex = /[!@#$%^&*(),.?":{}|<>]/;
    if (!specialCharacterRegex.test(password)) {
        strengthIndicator.innerHTML = 'Password should contain at least one special character.';
        strengthIndicator.className = 'password-weak';
        return;
    }

    // If all checks passed, the password is strong
    strengthIndicator.innerHTML = 'Strong password!';
    strengthIndicator.className = 'password-strength';
    });


    $('#register').click(registerDevice);
    $('#remove').click(removeDevice);
    $('#changePassword').click(changePassword);
    $('#logout').click(logout);
    
});

function registerDevice() {
    const deviceInput = $('#deviceRegister');
    const deviceValue = deviceInput.val();

    if (deviceValue === "") {
        window.alert("Must enter device ID");
        return;
    }

    // Check if the device is already in the list
    const deviceSelect = $('#deviceID');
    const existingDevices = deviceSelect.find('option').map(function () {
        return $(this).text();
    }).get();

    if (existingDevices.includes(deviceValue)) {
        window.alert("Device already registered");
 	$('#deviceRegister').val('');
        return;
    }

    // Define txdata here
    let txdata = {
        username: window.localStorage.getItem("username"),
        addDevice: deviceValue
    };
    $.ajax({
        url: 'http://ec2-3-137-163-56.us-east-2.compute.amazonaws.com:3000/users/updateDevices',
        method: 'PUT',
        contentType: 'application/json',
        data: JSON.stringify(txdata),
        dataType: 'json'
    })
        .done(function (data, textStatus, jqXHR) {
    if (data.success) {
        // Call your update list function with the updated device list
        updateDeviceList(data.devices);
	$('#deviceRegister').val('');
        window.alert("Success");
    }
})
.fail(function (jqXHR, textStatus, errorThrown) {
    if (jqXHR.status == 404) {
        window.alert("Server could not be reached");
    } else if (jqXHR.status == 401) {
        window.alert("Device failure");
    }
});
}

function updateDeviceList(updatedDevices) {
    // Assuming you have a <select> element with id "deviceID"
    const deviceSelect = $('#deviceID');

    // Clear existing options
    deviceSelect.empty();

    // Add each device to the <select> element
    updatedDevices.forEach(device => {
        deviceSelect.append(`<option>${device}</option>`);
    });
}

function removeDevice() {
    const deviceSelect = $('#deviceID');
    const selectedDevice = deviceSelect.val();

    if (!selectedDevice) {
        window.alert("Please select a device to remove");
        return;
    }

    if (!window.confirm(`Are you sure you want to remove the device "${selectedDevice}"?`)) {
        return;
    }

    // Define txdata
    let txdata = {
        username: window.localStorage.getItem("username"),
        deleteDevice: selectedDevice
    };

    $.ajax({
        url: 'http://ec2-3-137-163-56.us-east-2.compute.amazonaws.com:3000/users/updateDevices',
        method: 'PUT',
        contentType: 'application/json',
        data: JSON.stringify(txdata),
        dataType: 'json'
    })
    .done(function (data, textStatus, jqXHR) {
        if (data.success) {
            // Call your update list function with the updated device list
            updateDeviceList(data.devices);
            window.alert(`Device "${selectedDevice}" removed successfully`);
        }
    })
    .fail(function (jqXHR, textStatus, errorThrown) {
        if (jqXHR.status == 404) {
            window.alert("Server could not be reached");
        } else if (jqXHR.status == 401) {
            window.alert("Device removal failure");
        }
    });
}

function changePassword() {
	let password = $('#newPassword').val();
	let confirmPassword = $('#confirmPassword').val();
	let strength = $('#pwStrong');

	if (password != confirmPassword) {
		window.alert("Passwords must match");
		return;
	}
	if (password == '') {
		return;
	}
	
	if (strength.hasClass('password-weak')) {
		return;
	}
	let txdata = {
        username: window.localStorage.getItem("username"),
        newPassword: $('#newPassword').val()
    };

	
    $.ajax({
        url: 'http://ec2-3-137-163-56.us-east-2.compute.amazonaws.com:3000/users/changePassword',
        method: 'PUT',
        contentType: 'application/json',
        data: JSON.stringify(txdata),
        dataType: 'json'
    })
    .done(function (data, textStatus, jqXHR) {
        if (data.success) {
           password.val('');
	   confirmPassword.val('');
	   window.alert('Success, password changed');
        }
    })
    .fail(function (jqXHR, textStatus, errorThrown) {
        if (jqXHR.status == 404) {
            window.alert("Server could not be reached");    
        }
        else if (jqXHR.status == 401) {
	    window.alert("User not found");
	}
    });

}

function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    localStorage.removeItem("devices");
    window.location.replace("index.html");
}

function deviceOptions(deviceName) {
    let list = $('#deviceID');
    list.innerHTML += "<option>" + deviceName + "</option>";
}

const sampleData = {
      "2023-12-6": [
        { time: "09:00", heartRate: 80, oxygenLevel: 98 },
        { time: "12:00", heartRate: 95, oxygenLevel: 96 },
        { time: "15:00", heartRate: 75, oxygenLevel: 99 },
        // Add more data for the day
      ],
      // Add more days as needed
    };

    // Chart configuration
    const chartConfig = {
      type: 'line',
      options: {
        scales: {
          x: { type: 'linear', position: 'bottom' },
          y: { beginAtZero: true }
        },
      },
    };

    // Function to load data for the selected date

    function loadData() {
    const selectedDateStr = document.getElementById("dateSelector").value;
    const selectedDate = new Date(selectedDateStr);
    const selectedDevice = document.getElementById("deviceID").value;

    // Make an AJAX request to fetch the data for the selected device and date
    $.ajax({
        url: 'http://ec2-3-137-163-56.us-east-2.compute.amazonaws.com:3000/lab/status',
        method: 'GET',
        data: {
            deviceID: selectedDevice
        },
        dataType: 'json'
    })
    .done(function(data, textStatus, jqXHR) {
        // Check if data is available for the selected device
        if (data.length === 0) {
            window.alert("No data available for the selected device.");
            return;
        }

        // Filter the data for the selected date
        const dailyData = data.filter(entry => {
            const entryDate = new Date(entry.date);
            return entryDate.toISOString().split('T')[0] === selectedDate.toISOString().split('T')[0];
        });

        // Update detailed daily view charts
        updateChart('heartRateChart', 'Heart Rate', dailyData.map(entry => ({ x: entry.time, y: getHeartRate(entry.heartRate) })));
        updateChart('oxygenLevelChart', 'Oxygen Level', dailyData.map(entry => ({ x: entry.time, y: getOxygenLevel(entry.heartRate) })));

        // Calculate and update weekly summary
        const weeklyData = getWeeklyData(selectedDate, data);
        document.getElementById("avgHeartRate").textContent = calculateAverage(weeklyData, 'heartRate');
        document.getElementById("minHeartRate").textContent = calculateMin(weeklyData, 'heartRate');
        document.getElementById("maxHeartRate").textContent = calculateMax(weeklyData, 'heartRate');
    })
    .fail(function(jqXHR, textStatus, errorThrown) {
        if (jqXHR.status == 404) {
            window.alert("Server could not be reached");
        } else {
            window.alert("Error fetching data from the server");
        }
    });
}
// Function to extract heart rate from the combined field
function getHeartRate(combinedData) {
    const [heartRate] = combinedData.split(',');
    return parseFloat(heartRate.trim());
}

// Function to extract oxygen level from the combined field
function getOxygenLevel(combinedData) {
    const [, oxygenLevel] = combinedData.split(',');
    return parseFloat(oxygenLevel.trim());
}
    // Function to update a chart
    function updateChart(canvasId, label, data) {
      const ctx = document.getElementById(canvasId).getContext('2d');
      new Chart(ctx, {
        ...chartConfig,
        data: {
          labels: data.map(entry => entry.x),
          datasets: [{
            label: label,
            data: data,
            borderColor: 'rgb(75, 192, 192)',
            tension: 0.1,
            fill: false,
          }],
        },
      });
    }

    // Function to get weekly data
    function getWeeklyData(selectedDate) {
      const selectedDateObj = new Date(selectedDate);
      const oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
      const endDate = new Date(selectedDateObj.getTime() + 6 * oneDay);

      let weeklyData = [];
      for (let date = selectedDateObj; date <= endDate; date.setDate(date.getDate() + 1)) {
        const dateStr = date.toISOString().split('T')[0];
        weeklyData = weeklyData.concat(sampleData[dateStr] || []);
      }

      return weeklyData;
    }

    // Function to calculate average
    function calculateAverage(data, property) {
      const values = data.map(entry => entry[property]);
      const sum = values.reduce((acc, val) => acc + val, 0);
      return (sum / values.length).toFixed(2);
    }

    // Function to calculate minimum
    function calculateMin(data, property) {
      const values = data.map(entry => entry[property]);
      return Math.min(...values);
    }

    // Function to calculate maximum
    function calculateMax(data, property) {
      const values = data.map(entry => entry[property]);
      return Math.max(...values);
    }

var particle = new Particle();

// Function to send data to the Particle.function
function sendDataToParticle(data) {
  var functionName = "webAppFunction";
  var argument = data;

  particle.callFunction({ deviceId: 'YOUR_DEVICE_ID', name: functionName, argument: argument, auth: 'YOUR_ACCESS_TOKEN' })
    .then(function(data) {
      console.log('Function called successfully:', data);
    }, function(err) {
      console.error('Error calling function:', err);
    });
}

// Example: Call sendDataToParticle when a button is clicked
document.getElementById('sendButton').addEventListener('click', function() {
  var userInput = document.getElementById('userInput').value;
  sendDataToParticle(userInput);
});