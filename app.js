//Declared all imports
const express = require('express')
const app = express();
const fs = require('fs');
const multer = require('multer')
// const {TesseractWorker} = require('tesseract.js')
// const worker = new TesseractWorker();
const { createWorker } = require('tesseract.js')
const worker = createWorker({
    logger: m => console.log(m)
});

//Storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "./uploads");
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    }
});

const upload = multer({ storage: storage }).single("avatar");

app.set('view engine', "ejs");

//delete
let ay;
setInterval(() => {

    ay = Math.random() * 10;

}, 1000);

function gNum() {
    return Date.now();
}
//ROUTS
app.get('/', (req, res) => {
    res.render('index')
    // let x = `

    // <h1 id='h'>Heylo </h1>
    // <button onclick='testCall()'> click</button>
    // <script>
    // function testCall() {
    //     document.getElementById('h').innerHTML = '${gNum()}';
    // }
    //  </script>
    // `
    // res.send(x)
})

app.post('/upload', (req, res) => {
    // console.log(req);
    upload(req, res, err => {
        fs.readFile(`./uploads/${req.file.originalname}`, (err, data) => {
            if (err) return console.error(`This is your error: ${err}`);

            (async () => {
                await worker.load();
                await worker.loadLanguage('eng');
                await worker.initialize('eng');
                const { data: { text } } = await worker.recognize(data);
                console.log(text);
                //res.send(`<pre>${text}</pre>`);
                const resHtml = `
                <!-- link href="https://unpkg.com/@primer/css@^16.0.0/dist/primer.css" rel="stylesheet" / -->
                <style>
        .text-ctrl{
            display: flex;
            justify-content: center;
            align-items: center;
            background: rgba(157, 212, 160, 0.486);
            padding: 0.2rem;
            width: 100%;
            border-radius:5px 5px  0 0;
        }
        #test{
            outline: none;
        }
        .fa-copy{
            border:1px solid black;
            padding: 2px;
            border-radius: 2px;
        }
        .fa-copy:hover{
            background: rgba(12, 82, 41, 0.329);
            cursor: pointer;
            color: white;
        }
    </style>
                <script src="https://kit.fontawesome.com/d9556825ad.js" crossorigin="anonymous"></script>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css">
        <div class="text-ctrl">
        <i class="far fa-copy" id="copy"></i>
        </div>
        <textarea name="test" id="text" cols="30" rows="10" style="width:100%; height:50vh;">${text}</textarea>
        <script>
            let textarea = document.getElementById('text')
            let copyBtn = document.getElementById('copy')
            copyBtn.addEventListener('click', () => {
                textarea.select();
                document.execCommand('copy');
            })
        </script>
                `;
                res.send(resHtml);
                await worker.terminate();
                fs.unlink(`./uploads/${req.file.originalname}` ,err => {
                    if(err) console.error(err);
                })
                // await worker.writeText('tmp.txt', 'Hi\nTesseract.js\n');
            })();
        })
    })
})

app.get('/uploads', (req, res) => {
    console.log('Its working')
})

//start up server
const PORT = 5000 || process.env.PORT;
app.listen(PORT, () => console.log(`hey server started on port ${PORT}`))