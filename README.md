# Open Calendar

Shared calendar for events around open models and digital commons. Based on git & markdown to enable a collaborative management.

See online : <https://open-models.github.io/open-calendar/>

**The recommended use is to import the calendar into your personal calendar (Thunderbird, Google Calendar...) through the
`calendar.ics` file : <https://raw.githubusercontent.com/Open-Models/open-calendar/refs/heads/main/calendar.ics>**

## Installation

First, download the repository locally.

Install python dependencies:
```bash
pip install -r requirements.txt
```

## Usage

Prepare the event in a markdown file based on the following template:

```Markdown
## Title of your event

- Begin: dd/mm/yyyy hh:mm UTC+1
- End: dd/mm/yyyy hh:mm UTC+1
- Location: https://link-to-visio.org
- Categories: category 1, category 2

Description of your event.
```

Add the event using:

```bash
python -m git_calendar --add [event.md]
```

See help menu for more options:

```bash
python -m git_calendar -h
```

## Publish calendar

The project remains primitive and is managed rather manually. You then need to publish the calendar `calendar.ics` and
the `events` folder on the repository.

## License

Project in the public domain (as far as possible...), free to use, modify and share.

As the use of licences remains necessary for a trusted framework (copyright laws being archaic), under a double licence using the Unlicensed and Creative Commons CC0 licences.
