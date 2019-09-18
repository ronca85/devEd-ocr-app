// we are using express to create routes

const express = require('express');

const app = express();

// we are using fs to read files and create files, etc.

const fs = require('fs');

// multer allows us to upload all of our files to our server

const multer = require('multer');

// tesseract will "read" our images

const { TesseractWorker } = require('tesseract.js');

const worker = new TesseractWorker();

//
//
//

const storage = multer.diskStorage({
	
	destination : (req, file, cb) => {
		// this callback gets called whenever we want to uplaod a file
		cb(null, "./uploads");
	},

	filename : (req, file, cb) => {
		cb(null, file.originalname);
	}
	
});

//

const upload = multer({ storage : storage }).single('avatar');

//
//
//
//
// all of the above is backend stuff. we need ejs to combine it with the html we will need to write later.

app.set( "view engine", "ejs" );

// to make the page look nicer we need a public folder where we can add files like style.css

app.use( express.static("public") );
// public becomes the base folder, meaning when you link it in the <head> of your index.html file pretend the index.html is in the public folder

// create routes

app.get('/', ( req, res ) => {
	res.render('index');
});

app.post('/uploadr', ( req, res ) => {
	upload(req, res, err => {
		console.log("file uploaded to your uploads folder");
		fs.readFile(`./uploads/${req.file.originalname}`, (err, data) => {
			if (err) return console.log("This is your error: ", err);
			//
			worker
				.recognize(data, 'eng', {tessjs_create_pdf: '1'})
				.progress(progress => {
					console.log(progress);
				})
				.then(result => {
					// res.send(result.text); // works fine
					res.redirect('/download')
				})
				.finally(() => worker.terminate()); // end the worker when all is done
		});
	});
});

app.get('/download', (req, res) => {
	// get the latest generated file and let us download it
	const file = `${__dirname}/tesseract.js-ocr-result.pdf`;
	res.download(file);
})



// Start our server up

const PORT = 5000 || process.env.PORT;

app.listen( PORT, () => console.log( `Hey i'm running on port ${PORT}` ) );

//

