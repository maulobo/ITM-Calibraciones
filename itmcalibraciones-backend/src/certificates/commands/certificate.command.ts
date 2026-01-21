import { CommandHandler, ICommand, ICommandHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AddCertificateDTO } from '../dto/certificate.dto';
import { ICertificate } from '../interfaces/certificate.interface';

export class AddCertificateCommand implements ICommand {
  constructor(
    public readonly addCertificateDTO: AddCertificateDTO,
  ) {}
}

@CommandHandler(AddCertificateCommand)
export class AddCertificateCommandHandler implements ICommandHandler<AddCertificateCommand> {
  constructor(
    @InjectModel('Certificate') private readonly certificateModel: Model<ICertificate>,
  ) {}

  async execute(command: AddCertificateCommand): Promise<ICertificate> {
    const { addCertificateDTO } = command;
    const { id } = addCertificateDTO

    if(!id) return await new this.certificateModel(addCertificateDTO).save();
    
    return await this.certificateModel.findOneAndUpdate(
        id,
        addCertificateDTO, 
      { upsert: true, new: true });
    
  }
}
