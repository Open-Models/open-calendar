from datetime import datetime, timedelta, timezone
import os
import shutil
import dateutil
import glob
from pathlib import Path
from ics import Calendar, Event
from slugify import slugify
import mistune

class GitCalendar:
    EVENT_FOLDER = Path("events")
    def __init__(self, ics_file="calendar.ics"):
        self.calendar = Calendar()
        self.ics = Path(ics_file)
        self.load()

    def load(self):
        """ Import existing calendar in ics format """
        if self.ics.exists():
            self.calendar = Calendar(self.ics.read_text())

    def save(self):
        """ Save ics.Calendar into ics file """
        # Sort events in chronological order
        events_set = self.calendar.events
        self.calendar.events = sorted(self.calendar.events, \
                key=lambda event: event.begin)

        self.ics.write_text(self.calendar.serialize())

        self.calendar.events = events_set

    def regenerate(self):
        """ Recreate calendar in ics format from the set of saved events """
        self.calendar = Calendar()

        events_files = glob.glob(f"{self.EVENT_FOLDER}/**/*.md", recursive=True)
        for event_md in events_files:
            self.add_event(event_md, save=False)

        self.save()

    def store_event(self, origin_file, event):
        """
        Save event in markdown file as year/month/day/event-name.md

        Could be used when event are deleted or updated.
        """
        dest_folder = self.EVENT_FOLDER / event.begin.strftime("%Y/%B/%d")
        dest_filename = slugify(event.name) + ".md"

        absolute_dest = dest_folder / dest_filename

        dest_folder.mkdir(parents=True, exist_ok=True)
        absolute_dest.write_text(origin_file.read_text())

    def add_event(self, markdown_file, save=True):
        markdown_file = Path(markdown_file)
        event = self.markdown_parser(markdown_file)

        self.calendar.events.add(event)

        if save:
            self.store_event(markdown_file, event)
            self.save()

    def markdown_parser(self, filename):
        """ Convert event from a markdown text to ics.Event class instance """
        raw_markdown = Path(filename).read_text()
        markdown_reader = mistune.create_markdown(renderer=None)
        ast = markdown_reader(raw_markdown)

        event = {"description" : []}
        for branch in ast:
            if branch["type"] == "heading":
                event["name"] = branch["children"][0]["raw"]

            elif branch["type"] == "list":
                event.update(self._extract_event_details(branch))

            elif branch["type"] == "paragraph":
                # Handle multiline paragraph
                lines = [ast_item["raw"] for ast_item in branch["children"] \
                            if ast_item["type"] == "text"]
                event["description"].append(" ".join(lines))
        
        # Handle multiparagraph description
        event["description"] = "\n\n".join(event["description"])
        return Event(**event)

    def _extract_event_details(self, md_list):
        """ Extract caldav details from the markdown list section """
        md_list = md_list["children"]

        list_info = {}
        for field in md_list:
            name, value = field["children"][0]["children"][0]["raw"].split(":", 1)
            list_info[name.lower()] = value.strip()

        # Convert begin and end datefields from raw strings to datetime
        for date_section in ["begin", "end"]:
            date = list_info[date_section]

            # Contain hour section
            if " " in date:
                date, timezone_str = date.rsplit(" ", 1)
                date = datetime.strptime(date, "%d/%m/%Y %H:%M")

                # Manage timezone of hour section (format UTC±X, ex: UTC+2)
                tz_offset = 0
                if "+" in timezone_str or "-" in timezone_str:
                    tz_offset = int(timezone_str[3:])

                event_tzinfo = timezone(timedelta(hours=tz_offset))
                date = date.replace(tzinfo=event_tzinfo)
            else:
                date = datetime.strptime(date, "%d/%m/%Y")

            list_info[date_section] = date

        # Listify coma separated string of categories
        if "categories" in list_info:
            categories = list_info["categories"].split(",")
            list_info["categories"] = [category.strip() for category in categories]

        return list_info
