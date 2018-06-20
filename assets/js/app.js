const config = {
    apiKey: "AIzaSyBXuCMMeGi8tfNJGf-wBmefr8RLDwov41k",
    databaseURL: "https://train-scheduler-1027b.firebaseio.com",
    projectId: "train-scheduler-1027b",
};
firebase.initializeApp(config);

const trainInfo = firebase.database().ref('trainInfo');

// let key = trainInfo.push();
// key.set({name: 'asdfklj'})
// let anotherKey = trainInfo.push();
// anotherKey.set({name:'assdfssd'}

function addTrain(e) {
    e.preventDefault();
    let time = moment().set({hour: $('#hours').val(), minute: $('#mins').val()});
    let frequency = $('#trainFrequency').val().trim();
    let arrival = setArrival(time, frequency);
    let next = arrival.fromNow(true);
    
    const newTrain = {
        name: $('#trainName').val().trim(),
        destination: $('#trainDestination').val().trim(),
        firstTime: time.toString(),
        frequency: frequency,
        arrival: arrival.toString(),
        minsTill: arrival.fromNow(true),
    }
    trainInfo.push().set(newTrain);
}

setInterval(function() {
    trainInfo.once('value', snap => {
        console.log('updating', snap.val())
        if(snap.val()) {
            display(snap.val())
        }
    })
}, 15000)





$('#submit').on('click', addTrain);


trainInfo.on('value', snap => {
    if(snap.val()) {
        display(snap.val())
    } else {
        throw new Error('No trains to display!');
    }
}, err => console.error(1, 'err'));

function display(data) {
    const table = $('#trainListBody')
    table.empty();
    for (let key in data) {
        let row = $('<tr>').attr({id: key}).addClass('bg-dark')
        const {name, destination, frequency, arrival, firstTime, minsTill} = data[key];
        row .append($('<td>').text(name) || 'null')
            .append($('<td>').text(destination || 'null'))
            .append($('<td>').text(frequency || 'null'))
            .append($('<td>').text(moment(arrival).format('llll')))
            .append($('<td>').text(minsTill || 'null'))
            .append($('<td>').append($('<button>').addClass('edit btn btn-sm btn-warning center').text('Edit').attr({id: key})))
            .append($('<td>').append($('<button>').addClass('del btn btn-sm btn-danger center').text('X').attr({id: key})))
        table.append(row);
    }
    for (let key in data) {
        const {name, destination, frequency, arrival, firstTime, minsTill} = data[key];
        trainInfo.child(key).set({
            name: name,
            destination: destination,
            firstTime: firstTime,
            frequency: frequency,
            arrival: setArrival(moment(firstTime), frequency).toString(),
            minsTill: moment(arrival).fromNow(true),
        })
    }
}

$(document).on('click', '.del', function(e) {
    e.preventDefault();
    console.log('hello')
    let key = $(this).attr('id');
    trainInfo.child(key).set({})
})





function setArrival(time, freq) {
    let now = moment(); //current time
    let arrival = time.add(freq, 'minutes'); //add train freq time to init time
    while(now.diff(arrival, 'minutes') > 0) { //adds the freq to the arrival var until the time is > now
        arrival.add(freq, 'minutes');
    }
    return arrival
}



