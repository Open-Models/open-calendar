import ICAL from "https://unpkg.com/ical.js/dist/ical.min.js";

var ICS_FILE = "https://raw.githubusercontent.com/Open-Models/open-calendar/refs/heads/main/calendar.ics";

function formatModalText(text, withParagraph) {
    if (!text) return "";

    // Add a tags to text links.
    text = text.replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank">$1</a>');

    // Add p tags to render multi paragraphs appropriatly
    if (withParagraph) {
        text = text
            .split("\n\n")
            .map(paragraph => `<p>${paragraph.trim()}</p>`)
            .join("");
    }
    return text;
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
            const eventLocation = formatModalText(info.event.extendedProps.location, false);
            const eventDescription = formatModalText(info.event.extendedProps.description, true);

            // Open the modal with event details
            document.getElementById('modalTitle').textContent = info.event.title;
            document.getElementById('modalDescription').innerHTML = eventDescription;
            document.getElementById('modalLocation').innerHTML = eventLocation;
            document.getElementById('modalStart').textContent = `${info.event.start.toUTCString()}`;

            const modalEndElement = document.getElementById('modalEnd');

            // Fullcalendar behavior: End date set automatically to null when equal to start date
            // As a resulte, avoid display of end date when unavailable
            //
            // see: https://stackoverflow.com/questions/24596587/fullcalendar-return-event-end-null-when-allday-is-true
            if (info.event.end) {
                    modalEndElement.textContent = `${info.event.end.toUTCString()}`;
                    modalEndElement.parentElement.style.display = 'block';
            } else {
                    modalEndElement.parentElement.style.display = 'none';
            }

            // Show the modal
            const myModal = new bootstrap.Modal(document.getElementById('eventModal'));
            myModal.show();
        }
    });

    calendar.render();
}

generate_calendar();
