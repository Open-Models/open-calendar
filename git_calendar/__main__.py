import argparse
from git_calendar import GitCalendar
import os

def main():
    parser = argparse.ArgumentParser(description="Manage your git-based calendar.")
    parser.add_argument(
        "-a", "--add",
        nargs="+",
        metavar="FILENAME",
        type=str,
        help="Add events from the specified list of markdown files."
    )
    parser.add_argument(
        "--regenerate",
        action="store_true",
        help="Regenerate the calendar file from existing events."
    )

    parser.add_argument(
            "-i", "--ics-file",
            metavar="ICS_FILENAME",
            type=str,
            default="calendar.ics",
            help="manage the specified ICS calendar file (default: calendar.ics)."
            )

    args = parser.parse_args()

    calendar = GitCalendar(args.ics_file)

    if args.add:
        for event_mdfile in args.add:
            print(f"Adding event from file: {event_mdfile}")
            calendar.add_event(event_mdfile)

    if args.regenerate:
        print("Regenerating calendar file.")
        calendar.regenerate()

if __name__ == "__main__":
    main()
