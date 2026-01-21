import { Module } from '@nestjs/common';
import { EmailService } from './email.service';
import { InstrumentSoonExpiredSender } from './senders/instrument-soon-expired.sender';
import { NewInstrumentSender } from './senders/new-instrument.sender';
import { NewTechicalInformSender } from './senders/new-technical-inform.sender';
import { ResetPasswordSender } from './senders/reset-password';
import { UserUpdatedPasswordSender } from './senders/user-updated-password';
import { EmailWelcomeSender } from './senders/wellcome.sender';



const senders = [
  EmailWelcomeSender,
  ResetPasswordSender,
  NewInstrumentSender,
  NewTechicalInformSender,
  UserUpdatedPasswordSender,
  InstrumentSoonExpiredSender
];

@Module({
  providers: [EmailService, ...senders],
  exports: [EmailService, ...senders],
})
export class EmailModule {}
