export const DownloadCertificate = ({certificate}:{certificate:string}) => {
    // Obsolet. S3 doesnt allow change the file name.
    // File Name is defined by the backend
    const url = certificate;
    const link = document.createElement('a');
    link.href = url;
    const fileName =  `certificado.pdf`;
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
