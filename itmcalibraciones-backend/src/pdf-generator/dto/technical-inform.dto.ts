import { IClient } from "src/clients/interfaces/client.interface";
import { IOffice } from "src/offices/interfaces/office.interface";

  
  export class GeneratePDFTechnicalInformDTO {
      serialNumber: string;
      date: string
      comments: string
      model: string;
      descriptions: string
      instrumentType: string;
      office: IOffice
      dateString: string
      client: IClient
      
}
