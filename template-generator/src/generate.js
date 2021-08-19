const {generateTemplateFiles} = require('generate-template-files');
const chalk = require('chalk');


export async function createTemplate(options){
if(options.template === 'index'){
    generateTemplateFiles([
        // Prompt and fill TTN Device Repository Templates
        
        {
            option: ( 'Fill Index Template'),
            defaultCase: '(kebabCase)',
            entry: {
                folderPath: './template-generator/templates/index/__index__.yaml',
            },
            stringReplacers: [
            {question: chalk.green.bold('Insert index'), slot: '__index__'},
            {question: chalk.dim( 'Unique identifier of the end device (lowercase, alphanumeric with dashes, max 36 characters)'), slot: '__id__'}
            ],
            output: {
                path: './vendor/vendor_name/__index__(lowerCase).yaml',
                pathAndFileNameDefaultCase: '(kebabCase)',
            },
        }, 
         
    ]);
} else if (options.template === 'device'){
    generateTemplateFiles([
        {
            option: 'Fill Device Template',
            defaultCase: '(noCase)',
            entry: {
                folderPath: './template-generator/templates/device/__model__.yaml',
            },
            stringReplacers: [
                {question: chalk.green.bold('Write your file name'), slot: '__model__'},
                {question: chalk.dim('Name of your End Device'), slot: '__name__'},
                {question: chalk.dim('Add a description of your End Device'), slot: '__description__'}, 
                {question: chalk.dim('Hardware Version?'), slot: '__hwdversion__'},
                {question: chalk.dim('Firmware Version?'), slot: '__fmwversion__'}, 
                { question: chalk.dim('Your device is LoRaWAN Certified? (true or false)'), slot: '__loracert__'}],
            output: {
                path: './vendor/vendor_name/__model__(lowerCase).yaml',
                pathAndFileNameDefaultCase: '(kebabCase)',
            },
        }, 
    ]);

} else if (options.template === 'profile'){
    generateTemplateFiles([
        {
            option: 'Fill Profile Template',
            defaultCase: '(noCase)',
            entry: {
                folderPath: './template-generator/templates/profile/__profile__-profile.yaml',
            },
            stringReplacers: [
                {question: chalk.green.bold('Write your file name (ex. eu868, us915,...)'), slot: '__profile__'},
                {question: chalk.dim('LoRaWAN MAC version: \n 1.0 \n 1.0.1 \n 1.0.2 \n 1.0.3 \n 1.0.4 \n 1.1'), slot: '__macversion__'},
                {question: chalk.dim('Parameters Version: \n 1.0: TS001-1.0 \n 1.0.1: TS001-1.0.1 \n 1.0.2: RP001-1.0.2 or RP001-1.0.2-RevB \n 1.0.3: RP001-1.0.3-RevA \n 1.0.4: RP002-1.0.0 or RP002-1.0.1 \n 1.1: RP001-1.1-RevA or RP001-1.1-RevB'), slot: '__paramversion__'}, 
                {question: chalk.dim('Maximum EIRP'), slot: '__maxeirp__'}],
            output: {
                path: './vendor/vendor_name/__profile__(lowerCase)-profile.yaml',
                pathAndFileNameDefaultCase: '(kebabCase)',
            },
        }, 
    ]);

} else if (options.template === 'codec'){
    generateTemplateFiles([
        {
            option: 'Fill Codec Template',
            defaultCase: '(noCase)',
            entry: {
                folderPath: './template-generator/templates/codec/__codec__-codec.yaml',
            },
            stringReplacers: [
                {question: chalk.greenBright.bold('Write your file name'), slot: '__codec__'},
                {question: chalk.dim('Name of your decoder file (ex. gnse.js)'), slot: '__decoder__'}
                ],
            output: {
                path: './vendor/vendor_name/__codec__(lowerCase)-codec.yaml',
                pathAndFileNameDefaultCase: '(kebabCase)',
            },
        }, 
    ]);

}
}