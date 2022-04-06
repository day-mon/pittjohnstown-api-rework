import { Request, Response, NextFunction }   from "express";
import axios, { AxiosResponse} from "axios";
import {LaundryModel} from "../objects/models/LaundryModel";
import { LaundryObject } from "../objects/laundry/LaundryObject";

const baseUrl = "https://www.laundryview.com/api/currentRoomData?school_desc_key=4590&location="
const laundryApiCalls = new Map([
    ["HICKORY", "5813396"],
    ["BRIAR", "581339005"],
    ["BUCKHOR",  "5813393"],
    ["LLC", "58133912"],
    ["OAK",  "5813391"],
    ["HAWTHORN",  "5813397"],
    ["HEATHER",  "5813398"],
    ["HEMLOCK",  "5813392"],
    ["MAPLE",  "5813399"],
    ["WILLOW", "58133912"],
    ["LARKSPUR", "58133911"],
    ["LAUREL",  "5813394"],
    ["CPAS" , "581339013"],
]);

const getByDormitory = async (req: Request, res: Response, next: NextFunction) => {
    let dormitory = req.params.dormitoryId.toUpperCase()

    if (!laundryApiCalls.has(dormitory)) return res.status(404).send("Dormitory not found")

    let result: AxiosResponse = await axios.get(baseUrl + laundryApiCalls.get(dormitory));
    let data: LaundryModel = result.data as LaundryModel;
    let laundry = LaundryObject.asLaundryObject(data, dormitory.toLowerCase());
    return res.status(200).json(laundry);
}

export default { getByDormitory }
