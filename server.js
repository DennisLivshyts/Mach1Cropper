const exec = require('child_process').execFile;
const express = require('express');
const bodyParser = require("body-parser");
const path = require("path")
const multer = require('multer');
var fs = require('fs');
var folderName ="public\\users\\Dennis\\"
const ffmpegPath="C:\\ffmpeg\\ffmpeg-20200724-21442a8-win64-static\\ffmpeg-20200724-21442a8-win64-static\\bin\\ffmpeg.exe";
let fileMap=new Map();
var cutVideo = function(aa){//ffmpeg -i input.mp4 -ss 01:19:27 -to 02:18:51 -c:v copy -c:a copy output.mp4
    
    console.log("cutVideo() start, params: "+ aa.toString());
    fileMap[aa[10]]="Processing";
    let res = exec(ffmpegPath,aa, function(err, data) {
        if (err!=null){  
            if (err.message != null){
                console.log(err.message)
                fileMap[aa[10]]="failed"+err.message;//find the element by filename (aa[10]) and change status for this element to fail:error message  
            }
            else {
                fileMap[aa[10]]="success";//find the element by filename to change status to success 
            }
            console.log(data.toString());   
        }
        else
            fileMap[aa[10]]="success";          
     });  
}

const app = express()

const port = 5080
const router = express.Router();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
//app.get('/', (req, res) => res.send('Hello World!'))
app.use(express.static('public'))
app.listen(port, () => console.log(`app listening at http://localhost:${port}`))

router.post('/trim',(request,response) => {
    //code to perform particular action.
    //To access POST variable use req.body()methods.
    //ffmpeg -i input.mp4 -ss 01:19:27 -to 02:18:51 -c:v copy -c:a copy output.mp4
    // it looks what if we put ss and to after i, it not always work and produces no video
    // let aa = ['-i', 'input.mp4', '-ss', '00:00:00', '-to', '00:00:05', '-c:v', 'copy', '-c:a', 'copy', 'output.mp4'];
    // aa[1] = folderName+request.body.FileName    //input file in users directory 
    // aa[10]=folderName+request.body.DefaultFileName//output file in user directory
    // aa[3]=request.body.StartTime;
    // aa[5]=request.body.EndTime;
    let aa = ['-ss', '00:00:00', '-to', '00:00:05', '-i', 'input.mp4',  '-c:v', 'copy', '-c:a', 'copy', 'output.mp4'];
    aa[5] = folderName+request.body.FileName    //input file in users directory 
    aa[10]=folderName+request.body.DefaultFileName//output file in user directory
    aa[1]=request.body.StartTime;
    aa[3]=request.body.EndTime;    
    cutVideo(aa,response);
    pendingRequest.push({filename:aa[10]});

    console.log(request.body);
    response.end("Processing");
});

// add router in the Express app.
app.use("/", router);

// // View Engine Setup 
// app.set("views",path.join(__dirname,"views")) 
// app.set("view engine","ejs") 
    
// var upload = multer({ dest: "Upload_folder_name" }) 
// If you do not want to use diskStorage then uncomment it 
    
var storage = multer.diskStorage({ 
    destination: function (req, file, cb) { 
  
        // Uploads is the Upload_folder_name 
        cb(null, "public/users/Dennis") 
    }, 
    filename: function (req, file, cb) { 
      cb(null, file.filename) 
    } 
  }) 
       
// Define the maximum size for uploading 
// picture i.e. 1 MB. it is optional 
//const maxSize = 1 * 1000 * 1000; 
    
//var upload = multer({  
    // storage: storage, 
    // //limits: { fileSize: maxSize }, 
    // fileFilter: function (req, file, cb){ 
    
    //     // Set the filetypes, it is optional 
    //     var filetypes = /mp4/; 
    //     var mimetype = filetypes.test(file.mimetype); 
  
    //     var extname = filetypes.test(path.extname( 
    //                 file.originalname).toLowerCase()); 
        
    //     if (mimetype && extname) { 
    //         return cb(null, true); 
    //     } 
      
    //     cb("Error: File upload only supports the "
    //             + "following filetypes - " + filetypes); 
    // }  
  
// mypic is the name of file attribute 
//}).single("FileName");        

var storage = multer.diskStorage(
    {
        destination: './public/users/dennis/',
        filename: function ( req, file, cb ) {
            //req.body is empty...
            //How could I get the new_file_name property sent from client here?
            cb( null, file.originalname);
        }
    }
);
var upload = multer( { storage: storage } );

//var upload = multer({ dest: 'public/users/dennis' })

app.post('/profile', upload.single('avatar'), function (req, res, next) {
    // req.file is the `avatar` file
    // req.body will hold the text fields, if there were any
    res.send("Success, Image uploaded!") 
  })


app.post('/upload', upload.single('avatar'), function (req, res, next) {
    // req.file is the `thefile` file
    // req.body will hold the text fields, if there were any
    res.send("Success, Image uploaded!") 
})

    
  
app.post("/upload_not",function (req, res, next) { 
        
    // Error MiddleWare for multer file upload, so if any 
    // error occurs, the image would not be uploaded! 
    upload(req,res,function(err) { 
  
        if(err) { 
  
            // ERROR occured (here it can be occured due 
            // to uploading image of size greater than 
            // 1MB or uploading different file type) 
            res.send(err) 
        } 
        else { 
  
            // SUCCESS, image successfully uploaded 
            res.send("Success, Image uploaded!") 
        } 
    }) 
})



app.get("/get_files",function (req, res, next) {
    var result = [];

    fs.readdir(folderName, function(err, items) {
        for (var i=0; i<items.length; i++) {
            result[i] = items[i];
     
            console.log("file: " + result[i]);
            // fs.stat(file, function(f) {
            //     return function(err, stats) {
            //        console.log(f);
            //        console.log(stats["size"]);
            //     }
            // }(file));
        }
        res.contentType('application/json');
        res.send(JSON.stringify(result));          
    });
  
}) 
   
