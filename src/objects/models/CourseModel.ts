export class CourseModel {
   name: string | null = null;
   identifier: string | null = null;
   session: string | null  = null;
   classNumber: number = 0;
   career: string | null = null;
   startDateAndTime:  number = 0;
   endDateAndTime: number = 0;
   units: number = 0;
   dropConsent: string | null = null
   grading: string | null = null
   description: string | null = null
   enrollmentRequirements: string | null = null
   classAttributes: string | null = null
   courseUrl: string | null = null
   topic: string | null = null;

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


