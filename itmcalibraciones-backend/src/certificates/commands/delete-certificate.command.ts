import { CommandHandler, ICommand, ICommandHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { DeleteCertificateDTO } from '../dto/delete-certificate.dto';
import { ICertificate } from '../interfaces/certificate.interface';

export class DeleteCertificateCommand implements ICommand {
  constructor(
    public readonly deleteCertificateDTO: DeleteCertificateDTO,
  ) {}
}

@CommandHandler(DeleteCertificateCommand)
export class DeleteCertificateCommandHandler implements ICommandHandler<DeleteCertificateCommand> {
  constructor(
    @InjectModel('Certificate') private readonly certificateModel: Model<ICertificate>,
  ) {}

  async execute(command: DeleteCertificateCommand): Promise<ICertificate> {
    const { deleteCertificateDTO } = command;
    const { id, deleted } = deleteCertificateDTO

    return await this.certificateModel.findOneAndUpdate(
        id,
        { deleted }, 
      { upsert: true, new: true });
    
  }
}
