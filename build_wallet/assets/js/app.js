
// import { ECPair as _ECPair, payments } from '../js/bitcoinjs-lib';
// import { ECPairFactory } from "/assets/js/ecpair";
// import tinySecp256k1 from "/assets/js/tiny-secp256k1";
// const ECPair = ECPairFactory(tinySecp256k1);
// import crypto from "/assets/js/crypto";




$(document).ready(function() {
   
    $('#parseTransactions').click(function(e) {
       
        e.preventDefault();
        $.ajax({
            url: 'http://localhost:3000',
            type: 'POST',
            data: JSON.stringify({action:"parseTransactions"}),
            contentType: 'application/json', // Set the content type
            success: function(data) {
                console.log(data);
            },
            error: function(xhr, status, error) {
                console.error("Error occurred: " + status + "\nError: " + error);
            }
        });
       
    });

    $('#stackEval').click(function(e) {
       
        e.preventDefault();
        $.ajax({
            url: 'http://localhost:3000',
            type: 'POST',
            data: JSON.stringify({action:"stackEvaluation",hexString: $("#stackEvalHex").text()}),
            contentType: 'application/json', // Set the content type
            success: function(data) {
                console.log(data);
            },
            error: function(xhr, status, error) {
                console.error("Error occurred: " + status + "\nError: " + error);
            }
        });
       
    });
    $('#getRedeemScript').click(function(e) {
       
        e.preventDefault();
        $.ajax({
            url: 'http://localhost:3000',
            type: 'POST',
            data: JSON.stringify({action:"getRedeemScriptHex",bytesEncoding: $("#bytesEncoding").val()}),
            contentType: 'application/json', // Set the content type
            success: function(data) {
                console.log(data);
            },
            error: function(xhr, status, error) {
                console.error("Error occurred: " + status + "\nError: " + error);
            }
        });
       
    });
    $('#getHexFromPreimage').click(function(e) {
       
        e.preventDefault();
        $.ajax({
            url: 'http://localhost:3000',
            type: 'POST',
            data: JSON.stringify({action:"hexFromPreimage",preimage: $("#preimage").val()}),
            contentType: 'application/json', // Set the content type
            success: function(data) {
                console.log(data);
            },
            error: function(xhr, status, error) {
                console.error("Error occurred: " + status + "\nError: " + error);
            }
        });
       
    });
    $('#sendBTC').click(function(e) {
       
        e.preventDefault();
        $.ajax({
            url: 'http://localhost:3000',
            type: 'POST',
            data: JSON.stringify({action:"sendBTC",redeemScriptHex: $("#scriptHex").text(),amount: $("#amountForHex").val()}),
            contentType: 'application/json', // Set the content type
            success: function(data) {
                console.log(data);
            },
            error: function(xhr, status, error) {
                console.error("Error occurred: " + status + "\nError: " + error);
            }
        });
       
    });

    $('#sendBtcPreimage').click(function(e) {
       
        e.preventDefault();
        $.ajax({
            url: 'http://localhost:3000',
            type: 'POST',
            data: JSON.stringify({action:"txtToBtrustPreimage",amount: $("#amountForPrimage").val(),preimage: $("#preimageBtrust").text(),hexString: $("#hexString").val()}),
            contentType: 'application/json', // Set the content type
            success: function(data) {
                console.log(data);
            },
            error: function(xhr, status, error) {
                console.error("Error occurred: " + status + "\nError: " + error);
            }
        });
       
    });
    $('#getBlock').click(function(e) {
       
        e.preventDefault();
        $.ajax({
            url: 'http://localhost:3000',
            type: 'POST',
            data: JSON.stringify({action:"buildBlock"}),
            contentType: 'application/json', // Set the content type
            success: function(data) {
                console.log(data);
            },
            error: function(xhr, status, error) {
                console.error("Error occurred: " + status + "\nError: " + error);
            }
        });
       
    });


    $('#getTransactionDetails').click(function(e) {
       
        e.preventDefault();
        $.ajax({
            url: 'http://localhost:3000',
            type: 'POST',
            data: JSON.stringify({action:"decodeRawTransaction",hexString: $("#hexString").val()}),
            contentType: 'application/json', // Set the content type
            success: function(data) {
                console.log(data);
            },
            error: function(xhr, status, error) {
                console.error("Error occurred: " + status + "\nError: " + error);
            }
        });
       
    });
    $('#getWalletInfo').click(function(e) {
       
        e.preventDefault();
        $.ajax({
            url: 'http://localhost:3000',
            type: 'POST',
            data: JSON.stringify({action:"getWalletInfo"}),
            contentType: 'application/json', // Set the content type
            success: function(data) {
                console.log(data);
            },
            error: function(xhr, status, error) {
                console.error("Error occurred: " + status + "\nError: " + error);
            }
        });
       
    });
    $('#getWalletAddress').click(function(e) {
       
        e.preventDefault();
        $.ajax({
            url: 'http://localhost:3000',
            type: 'POST',
            data: JSON.stringify({action:"getWalletAddress"}),
            contentType: 'application/json', // Set the content type
            success: function(data) {
                console.log(data);
            },
            error: function(xhr, status, error) {
                console.error("Error occurred: " + status + "\nError: " + error);
            }
        });
       
    });
   
    $('#getTransactionHex').click(function(e) {
       
        e.preventDefault();
        $.ajax({
            url: 'http://localhost:3000',
            type: 'POST',
            data: JSON.stringify({action:"getTransactionHex",preimage: $("#preimage").val()}),
            contentType: 'application/json', // Set the content type
            success: function(data) {
                console.log(data);
            },
            error: function(xhr, status, error) {
                console.error("Error occurred: " + status + "\nError: " + error);
            }
        });
       
    });
    $('#createKeyPair').click(function(e) {
       
        e.preventDefault();
        $.ajax({
            url: 'http://localhost:3000',
            type: 'POST',
            data: JSON.stringify({action:"createKeyPair",source: $("#keypairSourceID").val() , value: $("#sourceValue").val(),network: $("#chooseNetworkID").val()}),
            contentType: 'application/json', // Set the content type
            success: function(data) {
                console.log(data);
            },
            error: function(xhr, status, error) {
                console.error("Error occurred: " + status + "\nError: " + error);
            }
        });
       
    });
    


   
});


    

   


