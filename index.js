import * as http  from 'http';
// import * as utils from './server_assets/utils.js'
import * as txts from './transactions/transactions.js'
import builder from './transactions/transaction_bulder.js'
import { getBlock } from './blocks/build_block.js'
import fs from 'fs';
import path from 'path';
import * as url from 'url';

const server = http.createServer( (req, res)  => {
    const parsedUrl = url.parse(req.url);
    let pathname = `.${parsedUrl.pathname}`;
    if(req.method === "POST"){
 
       let data = "";

        req.on('data', (incomingData) => {
            data += incomingData.toString(); 
        });
    
        req.on("end",async () => {
            const action   = JSON.parse(data).action;
            res.writeHead(200,{"Content-type": "application/json"});

             // Question 1:
            if(action === "parseTransactions"){
               
                // declare the hex strings here to remind ourselves that we can later bring them through the ajax API
                const hexStrings = ["01000000010000000000000000000000000000000000000000000000000000000000000000ffffffff080415112a1c02c100ffffffff0100f2052a01000000434104a9d6840fdd1497b3067b8066db783acf90bf42071a38fe2cf6d2d8a04835d0b5c45716d8d6012ab5d56c7824c39718f7bc7486d389cd0047f53785f9a63c0c9dac00000000","02000000000101d9014dbbdb08a4b93b53d2b62194139d0f85ba20e522d1b4afd92fa39fec562b1f00000000fffffffd014a01000000000000225120245091249f4f29d30820e5f36e1e5d477dc3386144220bd6f35839e94de4b9ca03403373581c4772771f039fd66572ae7524416d5336633bf0c625f405de6ab1d05fb1a018a2448eb858ca6fec63f01949dd127ee39ed2a506645815a6be2366d69edb2055bba80746653a70cc871710c6671a88e4b0035e070e98bf7340d1ffd9b3afc9ac0063036f7264010118746578742f706c61696e3b636861727365743d7574662d38004c947b224269746d616e204944223a3530303831382c22426972746864617465223a22323031372d31322d32342031313a3038222c2253706563696573223a2230783230303030303030222c2253697a65223a313038333831372c22576569676874223a333939333133332c225765616c7468223a3736383438343833392c22576973646f6d223a313837333130353437353232317d6821c055bba80746653a70cc871710c6671a88e4b0035e070e98bf7340d1ffd9b3afc900000000","020000000001010ccc140e766b5dbc884ea2d780c5e91e4eb77597ae64288a42575228b79e234900000000000000000002bd37060000000000225120245091249f4f29d30820e5f36e1e5d477dc3386144220bd6f35839e94de4b9cae81c00000000000016001416d31d7632aa17b3b316b813c0a3177f5b6150200140838a1f0f1ee607b54abf0a3f55792f6f8d09c3eb7a9fa46cd4976f2137ca2e3f4a901e314e1b827c3332d7e1865ffe1d7ff5f5d7576a9000f354487a09de44cd00000000"];
               
                res.end(JSON.stringify(txts.parseTransaction(hexStrings)));

            // Question 2:
            }
            // Question 2:
            else if(action === "stackEvaluation"){
                const hexString   = JSON.parse(data).hexString.trim();
                res.end(JSON.stringify(txts.stackEvaluation(hexString)));
           
           
            }
            // Question 3:
            else if(action === "getBtrustAddress"){

              
                const preimage = JSON.parse(data).preimage;
                 res.end(JSON.stringify(txts.getRedeemScriptHexForBtrust(preimage)));
            
            }
            // Question 3a:
            else if(action === "sendBTC"){

                // const hexString = JSON.parse(data).;
                const amount = JSON.parse(data).amount.trim();
                const redeemScriptHex = JSON.parse(data).redeemScriptHex.trim();
                
                res.end(JSON.stringify(await txts.sendBTC(amount,redeemScriptHex)));
            
            }
            // Question 3b:
            else  if(action === "txtToBtrustPreimage"){

                // the amount is just to remind us that we can later bring it through the ajax API
                const amount = JSON.parse(data).amount.trim();
                const preimage = JSON.parse(data).preimage.trim();
                res.end(JSON.stringify(txts.txtToBtrustPreimage(preimage)));
               


            
            }
            // Week 3 Question 1:
            else if(action === "buildBlock"){
                res.end(JSON.stringify(getBlock()));
            }else if(action === "createKeyPair"){
                const source  = JSON.parse(data).source;
                const value   = JSON.parse(data).value;
                const network = JSON.parse(data).network;
                
                res.end(JSON.stringify(txts.createKeyPair(source,value,network)));

            }
            else{
                res.end(JSON.stringify({msg: "Invalid action"}));
            }
        });        
        

    }else{


    // Set the base directory for static files
    const staticBasePath = path.join(process.cwd(), 'build_wallet');

    // Specify the default file to serve
    const defaultFile = 'index.html';

    // Construct the file path
    let filePath = path.join(staticBasePath, pathname);

    // If the request is for a directory (e.g., '/'), serve the default file
    if (pathname.endsWith('/')) {
        filePath = path.join(filePath, defaultFile);
    }

    fs.readFile(filePath, (err, content) => {
        if (err) {
            res.writeHead(404);
            res.end('Not Found');
            return;
        }

        // Determine the content type based on the file extension
        const ext = path.extname(filePath);
        let contentType = 'text/html'; // Default to HTML
        if (ext === '.js') {
            contentType = 'application/javascript';
        } else if (ext === '.css') {
            contentType = 'text/css';
        }

        res.writeHead(200, { 'Content-Type': contentType });
        res.end(content, 'utf-8');
    
        
    });
}

});



// const server = http.createServer((req, res) => {
//   const reqUrl = url.parse(req.url, true);

//    // Define the path to the HTML file
//    const filePath = path.join(process.cwd(), '/build_wallet/index.html');

//    // Read the HTML file content
//    fs.readFile(filePath, (err, content) => {
//        if (err) {
//            // If an error occurs, send a 500 Internal Server Error response
//            res.writeHead(500);
//            res.end('Server Error' + filePath);
//            return;
//        }
//        // If the file is read successfully, send a 200 OK response with the content
//        res.writeHead(200, { 'Content-Type': 'text/html' });
//        res.end(content);
//    });


// //   // Check if the request URL is "/user"
// //   if (reqUrl.pathname === '/user') {
// //     // Handle requests to "/user" here
// //     if (req.method === 'GET') {
// //       res.writeHead(200, { 'Content-Type': 'application/json' });
// //       const data = { message: 'This is the user endpoint' };
// //       res.end(JSON.stringify(data));
// //     } else {
// //       // Respond with a 405 Method Not Allowed if the method is not GET
// //       res.writeHead(405, { 'Content-Type': 'application/json' });
// //       res.end(JSON.stringify({ message: 'Method Not Allowed' }));
// //     }
// //   } else {
// //     // Respond to other paths or a 404 Not Found error for unspecified routes
// //     res.writeHead(404, { 'Content-Type': 'application/json' });
// //     res.end(JSON.stringify({ message: 'Not Found' }));
// //   }
// });

const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});