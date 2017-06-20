'use strict';
   
/**
 * This code sample demonstrates an implementation of the Lex Code Hook Interface
 * in order to serve a bot which manages dentist appointments.
 * Bot, Intent, and Slot models which are compatible with this sample can be found in the Lex Console
 * as part of the 'MakeAppointment' template.
 *
 * For instructions on how to set up and test this bot, as well as additional samples,
 *  visit the Lex Getting Started documentation.
 */


// --------------- Helpers to build responses which match the structure of the necessary dialog actions -----------------------

function elicitSlot(sessionAttributes, intentName, slots, slotToElicit, message, responseCard) {
    return {
        sessionAttributes,
        dialogAction: {
            type: 'ElicitSlot',
            intentName,
            slots,
            slotToElicit,
            message,
            responseCard,
        },
    };
}

function confirmIntent(sessionAttributes, intentName, slots, message, responseCard) {
    return {
        sessionAttributes,
        dialogAction: {
            type: 'ConfirmIntent',
            intentName,
            slots,
            message,
            responseCard,
        },
    };
}

function close(sessionAttributes, fulfillmentState, message, responseCard) {
    return {
        sessionAttributes,
        dialogAction: {
            type: 'Close',
            fulfillmentState,
            message,
            responseCard,
        },
    };
}

function delegate(sessionAttributes, slots) {
    return {
        sessionAttributes,
        dialogAction: {
            type: 'Delegate',
            slots,
        },
    };
}


function buildValidationResult(isValid, violatedSlot, messageContent) {
    return {
        isValid,
        violatedSlot,
        message: { contentType: 'PlainText', content: messageContent },
    };
}


/**
 * Performs dialog management and fulfillment for booking a dentists appointment.
 *
 * Beyond fulfillment, the implementation for this intent demonstrates the following:
 *   1) Use of elicitSlot in slot validation and re-prompting
 *   2) Use of confirmIntent to support the confirmation of inferred slot values, when confirmation is required
 *      on the bot model and the inferred slot values fully specify the intent.
 */
 function buildSSNCard(title, subTitle) {
    return {
        contentType: 'application/vnd.amazonaws.card.generic',
        version: 1,
        genericAttachments: [{
            title,
            subTitle
        }],
    };
}
 function validateSSN(SSN, EID) {
    const SSNInternal = parseInt(SSN);
    const EIDInternal = parseInt(EID);
    console.log(EID);
    console.log(SSN);
    //console.log(EIDInternal);
    console.log(SSNInternal);
    if (SSN) {if(SSN!==null && SSN.length != 4){
        return buildValidationResult(false, 'SSNInput', 'Please enter only 4 digits');
    }
    else if(isNaN(SSNInternal))
    {
        return buildValidationResult(false, 'SSNInput', 'Please enter only numbers');
    }
   }
    if (EID && EID!==null) {if(EID.length != 7 && !isNaN(EIDInternal)){
        return buildValidationResult(false, 'EmpIDInput', 'Please enter only 7 digits');
    }
    else if(isNaN(EIDInternal))
    {
        return buildValidationResult(false, 'EmpIDInput', 'Please enter only numbers');
    }
    }
    return buildValidationResult(true, null, null);
}



function makeSSN(intentRequest, callback) {
    const SSN = intentRequest.currentIntent.slots.SSNInput;
    const EID = intentRequest.currentIntent.slots.EmpIDInput;
    console.log(SSN);
    console.log(EID);
    const source = intentRequest.invocationSource;
    const outputSessionAttributes = intentRequest.sessionAttributes || {};
    
    if (source === 'DialogCodeHook') {
        // Perform basic validation on the supplied input slots.
        const slots = intentRequest.currentIntent.slots
        const validationResult = validateSSN(SSN, EID);
       if (!validationResult.isValid) {
            slots[`${validationResult.violatedSlot}`] = null;
            callback(elicitSlot(outputSessionAttributes, intentRequest.currentIntent.name,
            slots, validationResult.violatedSlot, validationResult.message,
            buildSSNCard(`Specify ${validationResult.violatedSlot}`, validationResult.message.content)));
            return;
        }
        callback(delegate(outputSessionAttributes, slots));
        return;
    }
    /**
    const duration = getDuration(appointmentType);
    const bookingAvailabilities = bookingMap[`${date}`];
    if (bookingAvailabilities) {
        // Remove the availability slot for the given date as it has now been booked.
        bookingAvailabilities.splice(bookingAvailabilities.indexOf(time), 1);
        if (duration === 60) {
            const secondHalfHourTime = incrementTimeByThirtyMins(time);
            bookingAvailabilities.splice(bookingAvailabilities.indexOf(secondHalfHourTime), 1);
        }
        bookingMap[`${date}`] = bookingAvailabilities;
        outputSessionAttributes.bookingMap = JSON.stringify(bookingMap);
    } else {
        // This is not treated as an error as this code sample supports functionality either as fulfillment or dialog code hook.
        console.log(`Availabilities for ${date} were null at fulfillment time.  This should have been initialized if this function was configured as the dialog code hook`);
    }
    */
    
    if (source === 'FulfillmentCodeHook') {
       const AWS = require('aws-sdk');
       /* AWS.config.update({
            region: "us-east-1",
            endpoint: "http://localhost:8000"
        });
        var docClient = new AWS.DynamoDB.DocumentClient();

        var table = "TicketData";

        var params = {
            TableName:table,
            Item:{
                "TicketNo": 1,
                "Description": 'Password Reset',
                "EID":parseInt(EID),
                "Status":'R',
                "TicketType":'Password'
                }
            }
console.log("Adding a new item...");*/
        var hexstring =  getDateTime()+SSN;
        var ses = new AWS.SES({
                region: 'us-east-1'
                });

    var eParams = {
            Destination: {
                ToAddresses: ["xxx@gmail.com"]
               },
            Message: {
                Body: {
                    Text: {
                        Data: "Your just reset your password through Chat Bot. Thanks, Your Bot"
                    }
                },
                Subject: {
                    Data: "Password Reset Accomplished : " + hexstring 
                }
            },
            Source: "xxx@gmail.com"
        };
    
        console.log('===SENDING EMAIL===');
        var email = ses.sendEmail(eParams, function(err, data){
            if(err) console.log(err);
            else {
                console.log("===EMAIL SENT===");
                console.log(data);
                console.log("EMAIL CODE END");
                console.log('EMAIL: ', email);
            }
        });

/*
docClient.put(params, function(err, data) {
    if (err) {
        console.error("Unable to add item. Error JSON:", JSON.stringify(err, null, 2));
    } else {
        console.log("Added item:", JSON.stringify(data, null, 2));
    }
});
*/

    
       callback(close(outputSessionAttributes, 'Fulfilled', { contentType: 'PlainText',
       'content': `Hurray!!! You have reset your password successfully. Ticket logged for this change : ${hexstring}. Thanks for reaching us` }));
    }
    
}



function getDateTime() {

    var date = new Date();

    var hour = date.getHours();
    hour = (hour < 10 ? "0" : "") + hour;

    var min  = date.getMinutes();
    min = (min < 10 ? "0" : "") + min;

    var sec  = date.getSeconds();
    sec = (sec < 10 ? "0" : "") + sec;

    var year = date.getFullYear();

    var month = date.getMonth() + 1;
    month = (month < 10 ? "0" : "") + month;

    var day  = date.getDate();
    day = (day < 10 ? "0" : "") + day;

    return sec+min+day+hour;

}


 // --------------- Intents -----------------------

/**
 * Called when the user specifies an intent for this skill.
 */
function dispatchSSN(intentRequest, callback) {
    // console.log(JSON.stringify(intentRequest, null, 2));
    console.log(`dispatch userId=${intentRequest.userId}, intent=${intentRequest.currentIntent.name}`);
    const name = intentRequest.currentIntent.name;
    console.log(name);
    // Dispatch to your skill's intent handlers
    if (name === 'PasscodeReset') {
              return makeSSN(intentRequest, callback);
       }
        throw new Error(`Intent with name ${name} not supported`);
}



// --------------- Main handler -----------------------

function loggingCallback(response, originalCallback) {
    //console.log(JSON.stringify(response, null, 2));
    originalCallback(null, response);
}

// Route the incoming request based on intent.
// The JSON body of the request is provided in the event slot.

exports.handler = (event, context, callback) => {
    try {
        // By default, treat the user request as coming from the America/New_York time zone.
        process.env.TZ = 'America/New_York';
        console.log(`event.bot.name=${event.bot.name}`);

        /**
         * Uncomment this if statement and populate with your Lex bot name and / or version as
         * a sanity check to prevent invoking this Lambda function from an undesired Lex bot or
         * bot version.
         */
        /*
        if (event.bot.name !== 'MakeAppointment') {
             callback('Invalid Bot Name');
        }
        */
        dispatchSSN(event, (response) => loggingCallback(response, callback));
    } catch (err) {
        callback(err);
    }
};
