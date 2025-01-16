import ICAL from "https://unpkg.com/ical.js/dist/ical.min.js";

var ICS_FILE = "https://raw.githubusercontent.com/Open-Models/open-calendar/refs/heads/main/calendar.ics";

function makeLinksClickable(text) {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    return text.replace(urlRegex, '<a href="$1" target="_blank">$1</a>');
}

async function load_ics(){
    // Fetch and parse the ICS file
    const response = await fetch(ICS_FILE);
    const icsText = await response.text();

    // Extract events and map them to FullCalendar's format
    const parsedEvents = [];
    try {
        const jcalData = ICAL.parse(icsText);
        const comp = new ICAL.Component(jcalData);
        const vevents = comp.getAllSubcomponents("vevent");

        vevents.forEach(event => {
            const eventObj = new ICAL.Event(event);
            parsedEvents.push({
                title: eventObj.summary,
                start: eventObj.startDate.toString(),
                end: eventObj.endDate.toString(),
                description: eventObj.description || "",
                location: eventObj.location || "",
            });
        });
    } catch (err) {
        console.error("Error parsing ICS file:", err);
    }
    return parsedEvents;
}

/* Create calendar using fullcalendar (https://fullcalendar.io/) */
async function generate_calendar(){
    const icsEvents = await load_ics();
    const calendarDiv = document.getElementById('calendar');

    // Initialize FullCalendar
    const calendar = new FullCalendar.Calendar(calendarDiv, {
        initialView: 'dayGridMonth',
        events: icsEvents,
        eventClick: function (info) {
            const eventLocation = makeLinksClickable(info.event.extendedProps.location);
            const eventDescription = makeLinksClickable(info.event.extendedProps.description);

            // Open the modal with event details
            document.getElementById('modalTitle').textContent = info.event.title;
            document.getElementById('modalDescription').innerHTML = eventDescription;
            document.getElementById('modalLocation').innerHTML = eventLocation;
            document.getElementById('modalStart').textContent = `${info.event.start.toUTCString()}`;
            document.getElementById('modalEnd').textContent = `${info.event.end.toUTCString()}`;
            // Show the modal
            const myModal = new bootstrap.Modal(document.getElementById('eventModal'));
            myModal.show();
        }
    });

    calendar.render();
}

generate_calendar();
