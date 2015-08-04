@@ -0,0 +1,152 @@
$(document).ready(function() {

    var nav = $("#nav");
    //Smooth Scroll
    $('a[href*=#]:not([href=#])').click(function() {
        if (location.pathname.replace(/^\//, '') == this.pathname.replace(/^\//, '') || location.hostname == this.hostname) {
            var target = $(this.hash);
            target = target.length ? target : $('[name=' + this.hash.slice(1) + ']');
            if (target.length) {
                $('html,body').animate({
                    scrollTop: target.offset().top - nav.height() + 1
                }, 1000);
                return false;
            }
        }
    });

    var btnMenu = $("#btnMenu");
    var btnLink = $(".menuHide");
    btnMenu.click(function() {

        btnLink.slideToggle();

    });
});



//google calendar API config, more instructions at fullcalendar.io
var googleAPI = {
    key: 'AIzaSyAr_hAppk2L0YHNiHIxF_EclOmh1WCtCB4', // typically like Gtg-rtZdsreUr_fLfhgPfgff
    calendarid: 'honoryogastudio.com_0akmqote5aq0tujambs20ja5l0@group.calendar.google.com' // will look somewhat like 3ruy234vodf6hf4sdf5sd84f@group.calendar.google.com
};
//send the request
$.ajax({
    type: 'GET',
    url: encodeURI('https://www.googleapis.com/calendar/v3/calendars/' + googleAPI.calendarid + '/events?key=' + googleAPI.key + '&singleEvents=True&orderBy=startTime'),
    dataType: 'json',
    success: function(response) {
        //format the response's event array
        formattedEvents = eventArray(response.items);
        //make the calendar
        makeCalendar(formattedEvents);
        //addUpcomingEvents(formattedEvents);
    },
    error: function(response) {
        $("#calText").text("Oops! Couldn't load the calendar!");
        $("#calText").after("<a href='https://www.google.com/calendar/embed?src=honoryogastudio.com_0akmqote5aq0tujambs20ja5l0%40group.calendar.google.com&ctz=America/Chicago'> Click here to see it! </a>");
    }
});

//helper function used to format the google events into something CLNDR can use
var eventArray = function(googleEvents) {
    var events = [];
    //for each event in the googleResp array create an event object
    _.each(googleEvents, function(googleEvent) {
        var formattedEvent = new event(googleEvent);
        events.push(formattedEvent);
    });
    return events;
};

//event object constructor
function event(googleEvent) {
    this.date = moment(googleEvent.start.dateTime); //needed for CLNDR
    this.endDate = moment(googleEvent.end.dateTime);
    this.strSummary = googleEvent.summary;
    var descArray = googleEvent.description.split(" | "); //so we can get multiple values out of the google event description field
    this.instructor = descArray[0];
    this.description = descArray[1];
    //convenience strings for templates
    this.strDate = this.date.format("MM-DD-YY");
    this.strStartTime = this.date.format("h:mm");
    this.strEndTime = this.endDate.format("h:mma");
}

//wrapper function so that it doesn't go off before we get google's response. 
//After we receive the response, it is formatted (eventArray function) and passed here.
var makeCalendar = function(events) {
    var testMoment = moment(events[0].date);
    var currentMonth = moment().format('YYYY-MM');
    var nextMonth = moment().add('month', 1).format('YYYY-MM');
    //actual function that builds the calendar
    $('#cal').clndr({
        template: $('#calendar-template').html(),
        events: events,
        clickEvents: {
            //when a day is clicked
            click: function(target) {
                console.log(target);
                //if the day has an event
                if (target.events.length) {
                    //cache and update the day values by passing the activeDate object the new day id
                    activeDate.update(target.element.id);
                    activeDate.reset();
                    //pass the selected days events to the event template and render the template
                    var templateData = {
                        events: target.events
                    };
                    template = _.template($("#event-template").html());
                    $("#event").html(template(templateData));
                }
            },
            nextMonth: function(target) {
                activeDate.reset();
            },
            previousMonth: function(target) {
                activeDate.reset();
            }
        },
        adjacentDaysChangeMonth: true,
        ready: function() {
            console.log("done rendering");
            var now = moment();
            var todaysEvents = _.filter(events, function(event) {
                return moment(event.date).isSame(now, "day");
            });
            console.log(todaysEvents);
            var templateData = {
                events: todaysEvents
            };
            template = _.template($("#event-template").html());
            $("#event").html(template(templateData));
        }
    });
};

//helper object to keep track of which day is selected
var activeDate = {
    //cache the old date class and set the new date class
    update: function(newDate) {
        this.prev = this.active;
        this.active = '#' + newDate;
    },
    //toggle the active class on the previous and new dates
    reset: function() {
        $(this.prev).toggleClass("active", false);
        $(this.active).toggleClass("active", true);
    }
};


var addUpcomingEvents = function(upcomingEvents) {
    var shortList = _.first(upcomingEvents, 3);
    var templateData = {
        events: shortList
    };
    template = _.template($("#upcomingEvents-template").html());
    $("#upcomingEvents").html(template(templateData));

};
