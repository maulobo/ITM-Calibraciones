import { CertificateEntity } from "../schemas/certificate.schema";

export interface ICertificate extends CertificateEntity {
    createdAt: Date;
    updatedAt: Date;
}
