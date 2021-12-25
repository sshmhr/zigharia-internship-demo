var kinetic;

var config = {
    scoreThreshold: 80,
    loginThreshold: 80,
    defaultPin: 1111,
    disableChallenge: true
}

var options = {
    logging: false,
    trackingTimeSensitivity: 10,
    mouseTrackingElement: '#trackarea',
    debug: true,
    autoTracking: false,
    appKey: 'yxC8lLXC25LZAxc',
    appSecret: 'AohyBFEEO4Jlq2CCAqjZYtUX9YjpyXBYEgjp4KXr0RP6l4Kk4ETLaSfLj0C/6+UJsA==',
    trackingInterval: 60,
    sensorPollingFrequency: 10,
    packageId: "sshmhr.github.io/zigharia-internship-demo/internship.zighra.web.com",
}

$(document).ready(function () {

    kinetic = new ZFS.KineticTracker(options);
    kinetic.init();

    if (typeof options.autoTracking == 'undefined' || options.autoTracking == true) {
        $("#startTracking").hide();
        $("#stopTracking").hide();
        $("#showData").show();

    } else {
        $("#startTracking").show();
        $("#stopTracking").hide();
        $("#showData").hide();
    }

    $("#demoForm").submit(function (e) {
        e.preventDefault();
        var userName = $("#txtUsername").val();
        if (userName != "") {

            loginProfile(userName, userName, function (error, response) {
                if (error) {
                    console.log(error);
                    alert(error);
                } else {

                    // Added inverse logic for confidence
                    var confidence = (100 - parseFloat(response.responseData.data.confidence));

                    if (response.responseData.data.score > config.loginThreshold) {
                        alert('Authentication Success. (Score = ' + response.responseData.data.score + ' and Confidence = ' + confidence + ')');
                        login(response.userName, function (error, response) {
                            if (error) {
                                console.log(error);
                                alert(error);
                            } else {
                                window.location.href = "transaction.html";
                            }
                        });
                    } else {
                        alert('Authentication Failed. (Score = ' + response.responseData.data.score + ' and Confidence = ' + confidence + ')');
                        //window.location.href = "index.html";
                        // Ask for PIN input
                        var getPin = prompt("Please enter your PIN", "");

                        if (getPin == null || getPin == "") {
                            // PIN cancelled
                            window.location.href = "index.html";
                        } else {

                            // PIN entered
                            if (getPin == config.defaultPin) {
                                // PIN is correct
                                login(response.userName, function (error, response) {
                                    if (error) {
                                        console.log(error);
                                        alert(error);
                                    } else {
                                        window.location.href = "transaction.html";
                                    }
                                });
                            } else {
                                // PIN is wrong
                                window.location.href = "index.html";
                            }
                        }
                    }
                }
            });
        }
    });

});

function getResults(x) {
    var output = {};

    if (localStorage.getItem('records')) {
        try {
            output = JSON.parse(localStorage.getItem('records'));
        } catch (e) {
            // Do nothing
        }
    }

    localStorage.setItem('records', JSON.stringify($.extend(output, x)));
    localStorage.setItem('browserData', JSON.stringify(kinetic.getDeviceInfo()));

}

function startTracking() {
    kinetic.trackStart();
    $("#startTracking").hide();
    $("#stopTracking").show();
    $("#trackarea").addClass("tracking");
}

function stopTracking() {

    makeTransaction()

    $("#stopTracking").hide();
    $("#startTracking").show();
    $("#trackarea").removeClass("tracking");

    // kinetic.trackStop(function (trackingData) {

    //     getResults(trackingData);

    //     $("#stopTracking").hide();
    //     $("#startTracking").show();
    //     $("#showData").show();
    //     $("#trackarea").removeClass("tracking");
    //     $('.nav-tabs a[href="#data"]').tab('show');
    // });

}

/* For creating new profile for the user account with the user name */
function loginProfile(userName, text, callback) {

    if (text == null) {
        text = userName
    }

    var userData = {
        name: userName,
        uCode: userName
    };
    kinetic.getProfile(userData, function (error, profileData) {
        if (error) {
            // console.log(error);
            // alert((error.data.errors[0].message));
            callback((error.data.errors[0].message));
        } else {
            localStorage.setItem("profileCode", profileData.data.profileCode);
            localStorage.setItem("userName", userName);

            $("#successMessage").show();
            $("#txtUsername").disabled = true;

            // kinetic.trackStart();

        }
    });
}

function makeTransaction() {
    var userName = localStorage.getItem("userName");
    var profileCode = localStorage.getItem("profileCode");

    if (profileCode == "" || userName == "") {
        localStorage.removeItem("authToken");
        localStorage.removeItem("userName");
        localStorage.removeItem("profileCode");
        alert("Your session has expired. Please login again");
        window.location.href = "index.html";
    } else {
        kinetic.trackStop(function (trackData) {
            var transRefId = makeTransRefId();
            var body = {
                gestureInfo: trackData,
                profileCode: profileCode,
                transRefId: transRefId
            };

            console.log('trackData ' + trackData)

            kinetic.checkGesture(body, function (error, gestureData) {
                if (error) {
                    alert(JSON.stringify(error));
                } else {
                    localStorage.setItem("transRefId", gestureData.refId);
                    localStorage.setItem("appRefId", gestureData.data.reqRefId);

                    var score = gestureData.data.score;

                    // Score greater than thresh. value
                    if (score >= config.scoreThreshold) {
                        reportAction('allow', gestureData, true);
                        alert("Your mouse score is good: " + score);

                    } else {
                        // Score less than thres. value

                        // Ask for PIN input
                        var getPin = prompt("Your mouse score is not good " + score + "\nPlease enter your PIN", "");

                        if (getPin == null || getPin == "") {
                            // PIN cancelled
                            reportAction('deny', gestureData, false);
                        } else {

                            // PIN entered
                            if (getPin == config.defaultPin) {
                                // PIN is correct
                                reportAction('allow', gestureData, true);
                            } else {
                                // PIN is wrong
                                reportAction('deny', gestureData, false);
                            }
                        }
                    }
                }
            });
        });
    }
}

function makeTransRefId() {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-";

    for (var i = 0; i < 37; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }

    return text;
}

// allowTransaction = true/false whether transaction is error or correct
function reportAction(action, checkResp, allowTransaction) {
    var inputData = {
        profileCode: localStorage.getItem("profileCode"),
        action: action,
        refId: checkResp.refId,
        type: checkResp.data.type ? checkResp.data.type : 'gesture'
    };

    kinetic.reportAction(inputData, function (error, outputData) {
        if (error) {
            console.log(JSON.stringify(error));
        }

        console.log('reportAction outputData: ' + JSON.stringify(outputData));


        // If pin input is true or score > threshold then proceed
        if (allowTransaction) {

            // Do below after report action call response
            var selectedTransactionType = $("#transactionType :selected").text();
            localStorage.setItem("transType", selectedTransactionType);
            var amount = $("#amount").val();
            localStorage.setItem("amount", amount);

            if (config.disableChallenge == true) {

                // Challenge disabled. So directly process the transaction.
                // appRefId = 0
                var transRefId = localStorage.getItem("transRefId");
                // transaction(0, transRefId);
            } else {
                // Challenge required.
                window.location.href = "challenge.html";
            }
        } else {
            // Deny
            window.location.href = "transaction-fail.html";
        }

    });
}
