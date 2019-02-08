/**
 * @module entropy - Stream entropy generator. 
 */

/**
 * Stream entropy generator. The stream can be added to, if the scratchpad is sent back 
 * from the previous calculation, as an input to the new stream being added. The stream
 * is an array of symbols. 
 * <p>
 * scratchpad.entropy is the resulting entropy. Worst case - 2*O(n) where n is the stream 
 * length so far. 
 * <p>
 * @param {array} stream - An array of symbols whose entropy needs to be calculated.
 * @param {object} scratchpad - The scratchpad returned from calculation.
 * 
 * @return {object} scratchpad - The scratchpad returned from calculation. scratchpad.entropy is the resulting entropy.
 */
exports.getEntropy = function getEntropy(stream, scratchpad) {
    if (!scratchpad) scratchpad = {symbols:{}, entropy:0, streamSize: stream.length}; 
    else {scratchpad.streamSize += stream.length; scratchpad.entropy = scratchpad.entropy*-1;}

    let fixes = Object.keys(scratchpad.symbols);

    stream.forEach(symbol => {
        delete fixes[fixes.indexOf(symbol)];
        if (scratchpad.symbols[symbol]) scratchpad.symbols[symbol].frequency++; else scratchpad.symbols[symbol] = {frequency:1, entropy:0};
        scratchpad.entropy -= scratchpad.symbols[symbol].entropy;
        let symbolProbability = scratchpad.symbols[symbol].frequency/scratchpad.streamSize;
        scratchpad.symbols[symbol].entropy = symbolProbability*Math.log2(symbolProbability);
        scratchpad.entropy += scratchpad.symbols[symbol].entropy;
    });

    fixes.forEach(symbol => {
        scratchpad.entropy -= scratchpad.symbols[symbol].entropy;
        let symbolProbability = scratchpad.symbols[symbol].frequency/scratchpad.streamSize;
        scratchpad.symbols[symbol].entropy = symbolProbability*Math.log2(symbolProbability);
        scratchpad.entropy += scratchpad.symbols[symbol].entropy;
    });

    scratchpad.entropy = scratchpad.entropy*-1;

    return scratchpad;
}

exports.csvdriver = input => exports.getEntropy(input.outputs).entropy;

if (require.main === module) {
    let stream = ["No","No","Yes","Yes","Yes","No","Yes","No","Yes","Yes","Yes","Yes","Yes","No"];
    let scratchpad = exports.getEntropy(stream);
    console.log(`Shannon's entropy = ${scratchpad.entropy}`);

    stream = ["B", "C"];
    scratchpad = exports.getEntropy(stream, scratchpad);
    console.log(`Shannon's entropy with updated stream = ${scratchpad.entropy}`);
}