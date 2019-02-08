/**
 * Main driver using CSV files
 */
const {parse} = require("papaparse");
const fs = require("fs");

function callAlgo(input, algo) {
    let output = require(`${__dirname}/${algo}.js`).csvdriver(input);
    console.log("Output");
    console.log("====================================");
    console.log(JSON.stringify(output));
}

main(); function main() {
    var args = process.argv.slice(2);
	if ( (args.length < 3) || ((args.length >= 1) && (args[0].toLowerCase() == "help")) ) {
		console.log(
			"Usage: csvdriver <path to CSV file> <output column name> <algorithm: entropy or decisiontree>");
		process.exit(1);
	}

    let input = {outputs:[], rows:[]};

    let filePath = args[0]; let outputColumn = args[1]; let algo = args[2]; let outputColumnNumber;
    console.log(`Processing ${filePath}...`);

    let firstRow = true;
    parse(fs.createReadStream(filePath), {
        worker: true, 
        chunk: results => {
            if (results.errors.length) {console.log(`Error: ${results.errors}`); process.exit(1);}

            let rows = results.data;

            if (firstRow) {
                outputColumnNumber = rows[0].indexOf(outputColumn); 
                if (outputColumnNumber == -1) {console.log(`Error output column not found.`); process.exit(1);}
                rows[0].splice(outputColumnNumber, 1);

                input.columns = rows[0]; 
                firstRow = false; rows.shift();
            }

            rows.forEach(row => {
                input.outputs.push(row[outputColumnNumber]);
                row.splice(outputColumnNumber, 1);
                input.rows.push(row);
            })
        },
        complete: _ => callAlgo(input, algo)
    });
}