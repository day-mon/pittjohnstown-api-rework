import {NextFunction, Request, Response} from "express";
import axios, {AxiosResponse} from "axios";
import {CourseModel} from "../objects/models/CourseModel";
import { JSDOM } from 'jsdom'
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
    console.log(html)
    let course = new CourseModel();
    const document = new JSDOM(html).window.document;
    console.log(document)


    let identifierClassName = document.getElementsByClassName("page-title  with-back-btn")
    course.identifier = identifierClassName.length == 0 ? "" : identifierClassName[0].innerHTML.trim();

    let classNameHtmlClassName = document.getElementsByClassName("primary-head");
    course.name = classNameHtmlClassName.length == 0 ? "" : classNameHtmlClassName[0].innerHTML.trim();

    let elementsRights = document.getElementsByClassName("pull-right");
    let elementsLeft = document.getElementsByClassName("pull-left");
    let size = elementsRights.length
    console.log(`elementsRights.length: ${elementsRights.length} elementsLeft.length: ${elementsLeft.length}`)


    // todo: fix attribute alignment
    for (let left = 1, right = 2; right < size; left++, right++)
    {
        if (elementsLeft[left] == undefined || elementsRights[right] == undefined) continue;
        // Text on left side of class page (i.e. Description, Class Times, etc);
        let textRight =  elementsRights[right].textContent?.trim() ?? "";

        // Text on right side of class page (i.e actual data)
        let textLeft = elementsLeft[left].textContent?.trim() ?? ""

        // I've got to check if the current tag w e are on is a div because if it's not we are not on something we want to scrape.
        while (elementsRights[right].tagName == "div") right++;

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
            case "Units":
                course.units = parseInt(textRight);
                break;
            case "Grading":
                course.grading = textRight;
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
                course.meetingDays = parseDaysOfWeek("MoThFri");
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
    const split = days.split('\\s+');
    //Todo:  find regex that splits on upper-cased letters
    return []
}

const validTerm = (periodId: string)  => {
    let validCourseRegex  = /2\d\d[147]/;
    return validCourseRegex.test(periodId);
}


export default { getById };
