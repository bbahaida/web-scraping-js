const rp = require('request-promise');
const Table = require('cli-table');
const _ = require('lodash');

const table = new Table({
    head: ['Username', 'Likes', 'Challenges'],
    colWidths: [15, 5, 10]
})

const baseUrl = 'https://www.freecodecamp.org';
const options = {
    url: `${baseUrl}/forum/directory_items?period=weekly&order=likes_received`,
    json: true
}

console.log('Scraping started ... ')

rp(options)
    .then(data => {
        const userData = [];
        data.directory_items.forEach(item => {
            userData.push({name: item.user.username, likesReceived: item.likes_received});
        });
        console.log('loading...');
        getChallengesCompletedAddPushToArray(userData)
    })
    .catch(err => console.error(err));

function getChallengesCompletedAddPushToArray(array){
    let i = 0;
    function next() {
        if (i < array.length) {
            const user = array[i];
            let options = {
                url: `https://api.freecodecamp.org/internal/api/users/get-public-profile?username=${user.name}`,
                json: true
            }
            rp(options).then(data => {
                process.stdout.write('#');
                const challenges = _.get(data, `entities.user[${user.name}].completedChallenges.length`, 'unknown');
                table.push([user.name, user.likesReceived, challenges]);
                ++i;
                next();
            })
        }
        else {
            printData();
        }
    }
    return next();
}

function printData(){
    console.log('complete.')
    console.log(table.toString());
}