# Heart Rate Monitoring Project

## Description

The Heart Track is a low-cost IoT-enabled web application designed for monitoring heart rate and blood oxygen 
saturation levels throughout the day at a user defined rate. The device uses a heart rate and oxygen sensor
to periodically remind users heart rate and blood oxygen saturation level mesurements, these measurements are then
transmitted to the Heart Track web appplication for users to view. The time of day and rate the measurements will be 
taken can be configured by the user. The web application uses a responsive desgin allowing for viewing on a desktop,
tablet, and mobile device.

## Table of Contents

-[Installation](#installation)
-[Usage](#usage)
-[Features](#features)
-[Configuration](#configuration)
-[Endpoint Documentation](#endpointdocumentation)
-[Credentials](#credentials)
-[Links](#links)
-[License](#lincense)
-[Contact](#contact)

## Installation

Setting up the Heart Rate Monitor should be done as follows,

1. Clone the repository.

`git clone https://https://github.com/SushiDeliveryGuy/413_FinalProject.git`

2. Navigate to the project directory.

`cd 413_FinalProject`

3. Install dependencies.

`npm install`

## Usage

For use of the Heart Rate Monitor follow these steps below,

1. Ensure IoT device with heart rate and oxygen sensor are connected and configured.
2. Run the web application.
   
    `node db.js`
   
4. Acces the application through preffered browser using link provided for the server and login using credentials provided.
5. Measure and monitor your heart rate and blood oxygen saturation levels on the browser.

## Features

* **IoT Integration:** Uses a low-cost IoT device in coordination with heart rate and oxygen sensors.
* **Periodic Reminders:** Alerts the user throughout the day to take measurements at configurable intervals.
* **Responsive Design:** The web application is designed to provide same experience regardless of interface.
* **Data Transmission and Monitoring:** Measurements are transmittied to the web application to be monitored by the viewer

## Configuration

The following can be configured by users,

* **Measurement Timing:** Set the time of day the measurments will be taken
* **Measurement Rate:** Define the frequency that the measurements should be taken at

## Endpoint Documentation

**1. /lab/status**

**Description**
This endpoint retrieves status information for a specified device based on its deviceID.

**Request**
* Method: GET
* URL: /lab/status
* Parameters:
   * deviceID (Query Parameter, required): The unique identifier of the device.
* Example Request:
```
GET /lab/status?deviceID=yourDeviceID
```
**Responses**
* Success: '200 OK'
* Error: '400 Bad Request', '500 Internal Server Error'

**Authentication**
*No authentication is required for this endpoint.

**2. /lab/register**

**Description**
This endpoint retrieves status information for a specified device based on its deviceID.

**Request**
* Method: POST
* URL: /lab/register
* Parameters:
   * date (required): The date of the recorded data entry.
   * heartRate (required): The heart rate value associated with the recorded data.
   * deviceID (required): The unique identifier of the device.
   * apikey (required): The API key for authentication.
* Example Request:
```
POST /lab/register
Content-Type: application/json

{
  "date": "2023-12-08T12:34:56Z",
  "heartRate": 75,
  "deviceID": "yourDeviceID",
  "apikey": "yourAPIKey"
}
```
**Responses**
* Success: '201 Created'
* Error: '400 Bad Request', '500 Internal Server Error'

**Authentication**
* This endpoint requires authentication using an API key (apikey).

## Credentials

For logging into the website use the following credentials,

**Username: adriancorey@outlook.com**

**Password: Adrian123$**

## Links

Listed below are the links for the server, video pitch, and demonstration videos for the project

* [Server](http://ec2-3-137-163-56.us-east-2.compute.amazonaws.com:3000/index.html)
* [Pitch](https://www.youtube.com/watch?v=F-mU8SEipb4)
* [Demonstrations]()

## License

This project is licensed under the [MIT License](LICENSE).

## Contact

For inquries or feedback please reach out to any of these names through email,

Samuel Kerns: s4k3@arizona.edu
Adrian Corey: adriancorey@arizona.edu
Michael Cesar-Torres: mcesartorres@arizona.edu

