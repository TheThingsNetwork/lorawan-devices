import chalk from 'chalk';
import { template } from 'lodash';

const arg = require('arg');
const inquirer = require('inquirer');
// import { createProject } from './main';
import { createTemplate } from './generate';

function parseArgumentsIntoOptions(rawArgs){
    const args = arg(
        {
            '--create': Boolean,
            '--yes': Boolean,
            '--install': Boolean,
            '-c': '--create',
            '-y': '--yes',
            '-i': '--install',
        },
        {
            argv: rawArgs.slice(2),
        }
    );
    return{
        skipPrompts: args['--yes'] || false,
        create: args['--create'] || false,
        template: args._[0],
        runInstall: args['--install'] || false,
    };
}

async function promptForMissingOptions(options){
    const defaultTemplate = 'AllFiles';
    if(options.skipPrompts){
      return{
         ...options,
        template: options.template || defaultTemplate,
    };
   }
   
   

const questions = [];

if(!options.template){
    questions.push({
        type: 'list',
        name: 'template',
        message: chalk.blueBright('Select an option to download Device Repository templates: '),
        choices: ['index', 'device', 'profile', 'codec'],
        default: defaultTemplate,
    });
}



const answer = await inquirer.prompt(questions);
return{
    ...options,
    template: options.template || answer.template,
};

}

export async function cli(args){
    let options = parseArgumentsIntoOptions(args);
    options = await promptForMissingOptions(options);
   // await createProject(options);
    await createTemplate(options);
}
