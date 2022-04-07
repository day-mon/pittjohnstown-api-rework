import { NextFunction, Request, Response } from "express";
import axios, { AxiosResponse } from "axios";
import { CourseModel } from "../objects/models/CourseModel";
import { JSDOM } from 'jsdom'
import dayjs from 'dayjs';
import dayjsUTC from 'dayjs/plugin/utc';
import dayjsTZ from 'dayjs/plugin/timezone';
dayjs.extend(dayjsUTC);
dayjs.extend(dayjsTZ);


const baseUrl = "https://psmobile.pitt.edu/app/catalog/classsection/UPITT/";

const getById = async (req: Request, res: Response, next: NextFunction) =>
{
    let courseId = req.params.courseId;
    let termId = req.params.termId;

    if (!validTerm(termId)) return res.status(422).send(`${termId} is not a valid term. Please try a valid one`);

    let result: AxiosResponse = await axios.get(`${baseUrl}${termId}/${courseId}`);
    let status = result.status

    // if it's a redirect, return peoplesoft is down
    // 409 is a conflict
    if (status >= 300 && status <= 399) return res.status(409).send("Peoplesoft is down");
    // should really never been thrown? lol
    if (status >= 400 && status <= 499) return res.status(404).send("Page does not exist");
    // TODO: need to figure out what status code to use here
    if (status >= 500 && status <= 599) return res.status(409).send("PeopleSoft has returned a Internal Server Error");

    let peopleSoftHtml: string = result.data as string
    let course: CourseModel = getCourseFromHtml(peopleSoftHtml)
    course.courseUrl = result.config.url == undefined ? "Unknown" : result.config.url

    return res.status(200).send(course);

}



const getCourseFromHtml = (html: string): CourseModel => {
    let course = new CourseModel();
    const document = new JSDOM(html).window.document;


    let identifierClassName = document.getElementsByClassName("page-title  with-back-btn")
    course.identifier = identifierClassName.length == 0 ? "" : identifierClassName[0].innerHTML.trim();

    let classNameHtmlClassName = document.getElementsByClassName("primary-head");
    course.name = classNameHtmlClassName.length == 0 ? "" : classNameHtmlClassName[0].innerHTML.trim();

    let elementsRights = document.getElementsByClassName("pull-right");
    let elementsLeft = document.getElementsByClassName("pull-left");
    let size = elementsRights.length




    for (let left = 1, right = 2; right < size; left++, right++)
    {
        if (elementsLeft[left] == undefined || elementsRights[right] == undefined) continue;

        // I've got to check if the current tag we are on is a div because if it's not we are not on something we want to scrape.
        while (elementsRights[right].tagName != "DIV") {
            if (elementsLeft[left] == undefined || elementsRights[right] == undefined) continue;
            right++;
        }
        // Text on left side of class page (i.e. Description, Class Times, etc);
        let textRight =  elementsRights[right].textContent?.trim() ?? "";

        // Text on right side of class page (i.e actual data)
        let textLeft = elementsLeft[left].textContent?.trim() ?? ""


        switch (textLeft) {
            case "Session":
                course.session = textRight;
                break;
            case "Class Number":
                course.classNumber = parseInt(textRight);
                break;
            case "Career":
                course.career = textRight;
                break;
            case "Dates":
                let dates = parseCourseDates(textRight);
                console.log(dates);
                course.startDateAndTime = dates[0];
                course.endDateAndTime = dates[1];
                console.log(course.startDateAndTime)
                break;
            case "Units":
                course.units = parseInt(textRight);
                break;
            case "Grading":
                course.grading = textRight;
                break;
            case "Topic":
                course.topic = textRight;
                break;
            case "Status":
                course.status = textRight;
                break;
            case "Instructor(s)":
                course.instructor = textRight.split(',')
                break;
            case "Description":
                course.description = textRight;
                break;
            case "Location":
                course.location = textRight;
                break;
            case "Meets":
                course.meetingDays = parseDaysOfWeek(textRight);
                let times = parseCourseTimes(textRight, course);
                course.startDateAndTime = times[0];
                course.startDateAndTime = times[1];
                break;
            case "Campus":
                course.campus = textRight;
                break;
            case "Room":
                course.room = textRight;
                break;
            case "Enrollment Requirements":
                course.enrollmentRequirements = textRight;
                break;
            case "Class Attributes":
                course.classAttributes = textRight
                break;
            case "Components":
                course.components = textRight;
                break;
            case "Seats Taken":
                course.seatsTaken = parseInt(textRight);
                break;
            case "Seats Open":
                course.seatsOpen = parseInt(textRight);
                break;
            case "Class Capacity":
                course.classCapacity = parseInt(textRight);
                break;
            case "Unrestricted Seats":
                course.unrestrictedSeats = parseInt(textRight);
                break;
            case "Restricted Seats":
                course.restrictedSeats = parseInt(textRight);
                break;
            case "Wait List Total":
                course.waitListTotal = parseInt(textRight);
                break;
            case "Wait List Capacity":
                course.waitListCapacity = parseInt(textRight);
                break;
        }
    }
    return course;
}

function convertTimeToMilitary(startTime: string) {
    let time = startTime.split(':');
    let hour = parseInt(time[0]);
    let minute = parseInt(time[1]);
    let ampm = time[2];

    if (ampm == "PM") {
        if (hour != 12) {
            hour += 12;
        }
    }
    else if (ampm == "AM" && hour == 12) {
        hour = 0;
    }

    return hour + ":" + minute;
}

const parseCourseTimes = (textRight: string, course: CourseModel): number[] => {
    const times = textRight.split(' ');
    let startTime = times[1]
    let endTime = times[3]

    //get time in est and convert to military time
    let startTimeMilitary = convertTimeToMilitary(startTime);
    let endTimeMilitary = convertTimeToMilitary(endTime);



    // convert course date to america new york timezone
    let xxx = new Date(course.startDateAndTime)
    let startTimeEST = dayjs(course.startDateAndTime).tz("America/New_York").format("YYYY-MM-DD");
    let endTimeEST = dayjs(course.endDateAndTime).tz("America/New_York").format("YYYY-MM-DD");


    // append time to course date
    let finalStartTimeInUnix = dayjs(`${startTimeEST} ${startTimeMilitary}`, "YYYY-MM-DD HH:mm").unix();
    let finalEndTimeInUnix = dayjs(`${endTimeEST} ${endTimeMilitary}`, "YYYY-MM-DD HH:mm").unix();



    return [finalStartTimeInUnix, finalEndTimeInUnix];


    //console.log(startTime, endTime)
    //let test = dayjs(`1970-00-00 ${startTime}`, 'YYYY-MM-DD HH:mmA')
    //let test1 = dayjs(`1970-00-00 ${endTime}`, 'YYYY-MM-DD HH:mmA')
    //console.log(test, test1)

   // let z = dayjs(dayjs().tz('America/New_York').hour(16).minute(20).unix()).format('HH:mm')
   // let a = new Date(dayjs().tz('America/New_York').hour(8).minute(34).unix()).

    //let z = dayjs().hour(2).minute(30).format('HH:mm')
    // let a = dayjs().utc().hour(4).minute(59).format('HH:mm')

    /*

    const startTimeUTC = dayjs(startTime, 'h:mm A', 'America/New_York')
    console.log(startTimeUTC + 'sd')
    const endTimeUTC = dayjs(endTime, 'h:mm A', 'America/New_York').unix()
    return [prettyDate2(2), prettyDate2(endTimeUTC)]

     */

}



const parseCourseDates = (times: string): number[] =>  times.split('-')
        .map(day =>  day.trim().trimStart())
        .map(day => dayjs(day, 'MM/DD/YYYY', 'America/New_York').unix());



const parseDaysOfWeek = (days: string): string[] => {
    if (days == null || days == "") return [];
    if (days.includes("TBA")) return [];
    const map: Map<string, string> = new Map([
        ["Mo", "Monday"],
        ["Tu", "Tuesday"],
        ["We", "Wednesday"],
        ["Th", "Thursday"],
        ["Thr", "Thursday"],
        ["Fr", "Friday"],
        ["Fri", "Friday"]
    ])
    // Could probably use a regex here, but I'm not sure if it's worth it.
    const split = days.split(' ');

    const uppercaseRegex = /(?<!^)(?=[A-Z])/
    const daySplitArray = split[0].split(uppercaseRegex);
    return daySplitArray.map(day => map.get(day as string) ?? day);
}

const validTerm = (periodId: string)  => {
    let validCourseRegex  = /2\d\d[147]/;
    return validCourseRegex.test(periodId);
}


export default { getById };
