// original code from https://medium.com/@bthdonohue/build-your-first-alexa-skill-8a37dc3103d6#.rib1s6mb8

'use strict';
var http = require('http');

// Route the incoming request based on type (LaunchRequest, IntentRequest,
// etc.) The JSON body of the request is provided in the event parameter.
exports.handler = function (event, context) {
    try {
        console.log("event.session.application.applicationId=" + event.session.application.applicationId);

        /**
         * Uncomment this if statement and populate with your skill's application ID to
         * prevent someone else from configuring a skill that sends requests to this function.
         */
		 
//     if (event.session.application.applicationId !== "amzn1.echo-sdk-ams.app.05aecccb3-1461-48fb-a008-822ddrt6b516") {
//         context.fail("Invalid Application ID");
//      }

        if (event.session.new) {
            onSessionStarted({requestId: event.request.requestId}, event.session);
        }

        if (event.request.type === "LaunchRequest") {
            onLaunch(event.request,
                event.session,
                function callback(sessionAttributes, speechletResponse) {
                    context.succeed(buildResponse(sessionAttributes, speechletResponse));
                });
        } else if (event.request.type === "IntentRequest") {
            onIntent(event.request,
                event.session,
                function callback(sessionAttributes, speechletResponse) {
                    context.succeed(buildResponse(sessionAttributes, speechletResponse));
                });
        } else if (event.request.type === "SessionEndedRequest") {
            onSessionEnded(event.request, event.session);
            context.succeed();
        }
    } catch (e) {
        context.fail("Exception: " + e);
    }
};

/**
 * Called when the session starts.
 */
function onSessionStarted(sessionStartedRequest, session) {
    console.log("onSessionStarted requestId=" + sessionStartedRequest.requestId
        + ", sessionId=" + session.sessionId);

    // add any session init logic here
}

/**
 * Called when the user invokes the skill without specifying what they want.
 */
function onLaunch(launchRequest, session, callback) {
    console.log("onLaunch requestId=" + launchRequest.requestId
        + ", sessionId=" + session.sessionId);

    var cardTitle = "Hello, World!"
    var speechOutput = "You can tell Hello, World! to say Hello, World!"
    callback(session.attributes,
        buildSpeechletResponse(cardTitle, speechOutput, "", true));
}

/**
 * Called when the user specifies an intent for this skill.
 */
function onIntent(intentRequest, session, callback) {
    console.log("onIntent requestId=" + intentRequest.requestId
        + ", sessionId=" + session.sessionId);

    var intent = intentRequest.intent,
        intentName = intentRequest.intent.name;

    // dispatch custom intents to handlers here
    if (intentName == 'TestIntent') {
        handleTestRequest(intent, session, callback);
    }
    else if(intentName == 'Ping') {
        handlePingRequest(intent, session, callback);
    }
    else if(intentName == 'Bus') {
        handleBusRequest(intent, session, callback);
    }
    else {
        // just do the test thing now to see things succeed
        handleTestRequest(intent, session, callback);

    }
}

/**
 * Called when the user ends the session.
 * Is not called when the skill returns shouldEndSession=true.
 */
function onSessionEnded(sessionEndedRequest, session) {
    console.log("onSessionEnded requestId=" + sessionEndedRequest.requestId
        + ", sessionId=" + session.sessionId);

    // Add any cleanup logic here
}

function handleTestRequest(intent, session, callback) {
    callback(session.attributes,
        buildSpeechletResponseWithoutCard("Hello, World!", "", "true"));
}

function handlePingRequest(intent, session, callback) {
    callback(session.attributes,
        buildSpeechletResponseWithoutCard("Ping ack", "", "true"));
}

function handleBusRequest(intent, session, callback) {
    // put your own URL here
    var url = 'http://example.com';

    var body = '';
    var buses = [];
    var speak = '';
    var req = http.get(url, function (res) {
        res.on('data', function(data) {
            body = body + data;
        });

        res.on('end', function() {
            var regex = /<td class="body-cell">(.*)<\/td><td class="body-cell">(.*)<\/td><td class="body-cell" align="right">(.*)<\/td>.*<\/td>/g;

            var looping = 1;
            while(looping) {
                var matches = regex.exec(body);
                if(Array.isArray(matches)) {
                    buses.push(matches);
                } else {
                    looping = 0;
                }
            }
            
            var i = 0;
            buses.forEach(function (bus) {
                if(i < 6) { // just stop after 6
                    var suffix = '';
                    if(bus[3].toLowerCase() == "due") {
                        suffix = " due now";
                    } else if(bus[3].toLowerCase().indexOf("mins") !== -1) {
                        suffix = " in " + bus[3].replace("Mins", "minutes");
                    } else if(bus[3].indexOf(":") !== -1) {
                        suffix = " at " + bus[3];
                    } else {
                        suffix = " about " + bus[3];
                    }
                    speak = speak + "There's a " + bus[1] + suffix + ". \n";
                }
                i = i + 1;
            });

            callback(session.attributes,
                buildSpeechletResponseWithoutCard("Bus Departures! " + speak, "", "true"));            
        });
    });
}

// ------- Helper functions to build responses -------

function buildSpeechletResponse(title, output, repromptText, shouldEndSession) {
    return {
        outputSpeech: {
            type: "PlainText",
            text: output
        },
        card: {
            type: "Simple",
            title: title,
            content: output
        },
        reprompt: {
            outputSpeech: {
                type: "PlainText",
                text: repromptText
            }
        },
        shouldEndSession: shouldEndSession
    };
}

function buildSpeechletResponseWithoutCard(output, repromptText, shouldEndSession) {
    return {
        outputSpeech: {
            type: "PlainText",
            text: output
        },
        reprompt: {
            outputSpeech: {
                type: "PlainText",
                text: repromptText
            }
        },
        shouldEndSession: shouldEndSession
    };
}

function buildResponse(sessionAttributes, speechletResponse) {
    return {
        version: "1.0",
        sessionAttributes: sessionAttributes,
        response: speechletResponse
    };
}

