/**
 * @module decisiontree
 * Decision trees.
 */

const {getEntropy} = require(`${__dirname}/entropy.js`);

/**
 * Decision tree generator, uses recursion.
 * 
 * Sample format:
 * {
 * columns: [array of column labels],
 * rows: [[array of arrays, each member is a row with sample data]]
 * outputs: [array of output for each row, must match number of rows]
 * }
 *  
 * @param {object} sample - The incoming learning sample
 * @param {string} branchValue - The branch value, should be set to null for initial call.
 */
exports.getDecisionTree = function getDecisionTree(sample, branchValue) {
    let tree={node:null, branchValue, branches:[]};

    let rootEntropy = getEntropy(sample.outputs).entropy; let infoGainedMax = 0; let selectedColumn;
    sample.columns.forEach(column => {
        let childWeightedEntropies = 0;
        getUniqueValues(column, sample).forEach(value => {
            let reducedOutputs = reduceSample(column, value, sample).outputs;
            childWeightedEntropies += (reducedOutputs.length/sample.outputs.length)*getEntropy(reducedOutputs).entropy;
        });

        let infoGain = rootEntropy - childWeightedEntropies;
        if (infoGain > infoGainedMax) {selectedColumn = column; infoGainedMax = infoGain; }
    });

    if (!selectedColumn) {tree.result = sample.outputs; return tree;}   // stop 

    tree.node = selectedColumn;
    getUniqueValues(selectedColumn, sample).forEach(branchValue => {
        let subTreeThis = getDecisionTree(reduceSample(selectedColumn, branchValue, sample), branchValue);
        tree.branches.push(subTreeThis);
    });

    return tree;
}

function getUniqueValues(column, sample) {
    let vals = [];
    let index = sample.columns.indexOf(column);
    sample.rows.forEach(row => {if (!vals.includes(row[index])) vals.push(row[index])});
    return vals;
}

function reduceSample(column, value, sample) {
    let reducedSample = JSON.parse(JSON.stringify(sample));

    let colIndex = reducedSample.columns.indexOf(column);
    reducedSample.columns.splice(colIndex,1);

    let reducedRows = []; let reducedOutputs = [];
    reducedSample.rows.forEach((row, index) => {if (row[colIndex] == value) {
        row.splice(colIndex,1); reducedRows.push(row); 
        reducedOutputs.push(reducedSample.outputs[index]);
    }});
    reducedSample.rows = reducedRows;
    reducedSample.outputs = reducedOutputs;

    return reducedSample;
}

if (require.main === module) {
    let tree = exports.getDecisionTree({
        columns: ["Outlook", "Temp", "Humidity", "Wind"],
        rows: [
            ["Sunny","Hot","High","Weak"],
            ["Sunny","Hot","High","Strong"],
            ["Overcast","Hot","High","Weak"],
            ["Rain","Mild","High","Weak"],
            ["Rain","Cool","Normal","Weak"],
            ["Rain","Cool","Normal","Strong"],
            ["Overcast","Cool","Normal","Strong"],
            ["Sunny","Mild","High","Weak"],
            ["Sunny","Cool","Normal","Weak"],
            ["Rain","Mild","Normal","Weak"],
            ["Sunny","Mild","Normal","Strong"],
            ["Overcast","Mild","High","Strong"],
            ["Overcast","Hot","Normal","Weak"],
            ["Rain","Mild","High","Strong"]
        ],
        outputs: ["No","No","Yes","Yes","Yes","No","Yes","No","Yes","Yes","Yes","Yes","Yes","No"]
    });

    console.log("Decision tree");
    console.log(JSON.stringify(tree, null, 4));
}