export class CourseModel {
   name: string = '';
   identifier: string = '';
   session: string  = '';
   classNumber: number = 0;
   career: string = "";
   startDate:  number = 0;
   endDate: number = 0;
   units: number = 0;
   dropConsent: string = ""
   grading: string =  ""
   description: string = "";
   enrollmentRequirements: string = "";
   classAttributes: string = "";
   courseUrl: string = "";

   // class details
   instructor: string[] = [];
   meetingDays: string[] = [];
   campus: string = '';
   room: string  = '';
   location: string = '';
   components: string  = '';

   // class availability
   status: string  = '';
   waitListTotal: number = 0;
   waitListCapacity: number = 0;
   restrictedSeats: number = 0;
   unrestrictedSeats: number = 0;
   seatsOpen: number = 0;
   seatsTaken: number = 0;
   classCapacity: number = 0;
}


