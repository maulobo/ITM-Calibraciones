export const dateTimeForLastLogin = (dateString:string) => {
    const date = new Date(dateString);

    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();

    // Formatear la fecha en formato "MM/DD/YYYY"
    const formattedDate = `${month.toString().padStart(2, "0")}/${day.toString().padStart(2, "0")}/${year}`;

    const hours = date.getHours();
    const minutes = date.getMinutes();

    // Formatear la hora en formato "H:MM"
    const formattedTime = `${hours}:${minutes.toString().padStart(2, "0")}`;

    const formattedDateTime = `${formattedDate} a las ${formattedTime}hs`;
    return formattedDateTime
}

export const certificateDateFormat =  (dateString: string) =>{
    const formDate = new Date(dateString)
    return `${("0" + formDate.getDate()).slice(-2)}-${("0" + (formDate.getMonth() + 1)).slice(-2)}-${formDate.getFullYear()}`;  
}