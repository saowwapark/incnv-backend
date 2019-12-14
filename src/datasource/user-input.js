
const readline = require('readline-sync');

const name = readline.question(`What's your name?\n`);
console.log(`Hi ${name}!`)


const hobby = readline.question(`What's your hobby?\n`);

console.log(`${hobby} is great!`)