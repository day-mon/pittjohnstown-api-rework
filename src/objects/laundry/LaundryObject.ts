import {LaundryMachine, LaundryModel} from "../models/LaundryModel";

export class LaundryObject {
    appliance: string | undefined;
    type: string;
    isWorking: boolean;
    timeRemaining: string;
    isInUse: boolean;
    location: string;

    constructor(model: LaundryMachine, location: string)
    {
        this.appliance = model.appliance_desc;
        this.type = model.type.startsWith('d') ? 'Dryer' : 'Washer';
        this.isWorking = model.percentage == undefined ? false : model.percentage <=5;
        this.timeRemaining = model.time_left_lite == undefined ? "Not found" : model.time_left_lite;
        this.isInUse = model.status_toggle == undefined ? false : model.status_toggle > 0 && this.isWorking;
        this.location = location;
    }

    public static asLaundryObject(model: LaundryModel, location: string): LaundryObject[]
    {
        console.log(model);
        return model.objects.map(machine => new LaundryObject(machine, location));
    }
}
