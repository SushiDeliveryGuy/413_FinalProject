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

    $('#submit').click(sendDataToParticle);
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
           $('#newPassword').val('');
	   $('#confirmPassword').val('');
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

    
    const selectedDayData = data.filter(entry => {
      const entryDate = new Date(entry.date);
      return (
        entryDate.getDate() - 1 === selectedDate.getDate() &&
        entryDate.getMonth() === selectedDate.getMonth() &&
        entryDate.getFullYear() === selectedDate.getFullYear()
      );
    });

    // Extract time strings and measurement values
    const timeStrings = selectedDayData.map(entry => {
  const entryDate = new Date(entry.date);
  const totalSeconds = entryDate.getHours() * 3600 + entryDate.getMinutes() * 60 + entryDate.getSeconds();
  return totalSeconds / (60*60);
});
	
    const heartRateValues = data.map(entry => getHeartRate(entry.heartRate)).filter(value => value >= 20);

    // Filter out data points below zero for oxygen level
    const oxygenLevelValues = data.map(entry => getOxygenLevel(entry.heartRate)).filter(value => value >= 20);

    updateChart('heartRateChart', 'Heart Rate', timeStrings, heartRateValues);
    updateChart('oxygenLevelChart', 'Oxygen Level', timeStrings, oxygenLevelValues);

    // Calculate and update weekly summary
    const weeklyData = getWeeklyData(selectedDate, data);
	
    document.getElementById("avgHeartRate").textContent = calculateAverage(weeklyData);
    document.getElementById("minHeartRate").textContent = calculateMin(weeklyData);
    document.getElementById("maxHeartRate").textContent = calculateMax(weeklyData);
  })
  .fail(function(jqXHR, textStatus, errorThrown) {
    if (jqXHR.status == 404) {
      window.alert("Server could not be reached");
    } else {
      window.alert("Error fetching data from the server");
    }
  });
}

// Chart configuration
const chartConfig = {
  type: 'line',
  data: {
    labels: [],  // This array will contain your time of day strings
    datasets: [
      {
        label: 'Heart Rate',
        borderColor: 'rgba(255, 99, 132, 1)',
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        data: [],  // This array will contain your heart rate values
        fill: false,
      },
      {
        label: 'Oxygen Level',
        borderColor: 'rgba(75, 192, 192, 1)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        data: [],  // This array will contain your oxygen level values
        fill: false,
      },
    ],
  },
  options: {
    scales: {
      x: {
        type: 'linear',
        position: 'bottom',
        title: {
          display: true,
          text: 'Time (Hours)' // Add your x-axis label here
        }
      },
      y: { beginAtZero: true },
    },
  },
};

// Function to update the chart
function updateChart(chartId, label, timeStrings, measurementValues) {
  
  const ctx = document.getElementById(chartId).getContext('2d');
  const chartData = chartConfig.data.datasets.find(dataset => dataset.label === label);

  // Update chart data
  chartData.data = measurementValues;
  chartConfig.data.labels = timeStrings;

  // Get the combined measurement values from all datasets
  const allMeasurementValues = chartConfig.data.datasets
    .flatMap(dataset => dataset.data)
    .filter(value => !isNaN(value));

  // Get the minimum and maximum values for the y-axis from all datasets
  const minValue = Math.min(...allMeasurementValues);
  const maxValue = Math.max(...allMeasurementValues);

  // Update chart options for y-axis
  chartConfig.options.scales.y.min = minValue - 5;  // Adjust for better visualization
  chartConfig.options.scales.y.max = maxValue + 5;  // Adjust for better visualization

  // Create or update the chart
  if (window.myChart) {
    window.myChart.update();
  } else {
    window.myChart = new Chart(ctx, chartConfig);
  }
}

// Function to extract heart rate from the combined field
function getHeartRate(combinedData) {
    const values = combinedData.split(',');
    return values.length > 0 ? parseInt(values[0], 10) || 0 : 0;
}

function getOxygenLevel(combinedData) {
    const values = combinedData.split(',');
    return values.length > 1 ? parseInt(values[1], 10) || 0 : 0;
}

// Function to get weekly data
function getWeeklyData(selectedDate, data) {
  const selectedDateObj = new Date(selectedDate);
  
  const oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
  const endDate = new Date(selectedDateObj.getTime() - 7 * oneDay);

  let weeklyData = [];
  for (let date = endDate; date <= selectedDateObj; date.setDate(date.getDate() + 1)) {
    
    const dateStr = date.toISOString().split('T')[0];
    const dailyData = data.filter(entry => entry.date.split('T')[0] === dateStr);
	
    const filteredData = dailyData.filter(entry => {
            const hr = getHeartRate(entry.heartRate);
            const ol = getOxygenLevel(entry.heartRate);
            return hr >= 0 && ol >= 0;
        });

        weeklyData = weeklyData.concat(filteredData);
  }

  return weeklyData;
}
    function calculateAverage(data) {
  const values = data.map(entry => getHeartRate(entry.heartRate)).filter(value => !isNaN(value));
  if (values.length === 0) return 'N/A';
  
  const sum = values.reduce((acc, val) => acc + val, 0);
  return (sum / values.length).toFixed(2);
}

// Function to calculate minimum
function calculateMin(data) {
  const values = data.map(entry => getHeartRate(entry.heartRate)).filter(value => !isNaN(value));
  if (values.length === 0) return 'N/A';
  
  return Math.min(...values);
}

// Function to calculate maximum
function calculateMax(data, property) {
  const values = data.map(entry => getHeartRate(entry.heartRate)).filter(value => !isNaN(value));
  if (values.length === 0) return 'N/A';
  
  return Math.max(...values);
}

var particle = new Particle();

// Function to send data to the Particle.function
function sendDataToParticle() {
  var functionName = "setMeasurementParameters";
  var dataStr = `${$('#start').val()}-${$('#end').val()},${$('#freq').val()}`;
  console.log(dataStr);
  var argument = dataStr;

  particle.callFunction({ deviceId: '0a10aced202194944a049464', name: functionName, argument: argument, auth: 'cc248c5512bd5b43b36ef2883d7047653bf5d94e' })
    .then(function(data) {
      console.log('Function called successfully:', data);
    }, function(err) {
      console.error('Error calling function:', err);
    });
}

// Example: Call sendDataToParticle when a button is clicked
//document.getElementById('sendButton').addEventListener('click', function() {
  //var userInput = document.getElementById('userInput').value;
  //sendDataToParticle(userInput);
//});

$(document).ready(function() {
    $('a[href^="#"]').on('click', function(e) {
        e.preventDefault();
        var target = this.hash;
        $('html, body').animate({
            scrollTop: $(target).offset().top
        }, 800, 'swing');
    });
});